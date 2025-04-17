package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"
	"todo-calendar/internal/models" // Убедись, что путь к модулю верный

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv" // Для загрузки .env
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger" // Для настройки логирования GORM
)

var db *gorm.DB
var jwtSecret []byte

// Инициализация перед main
func init() {
	// Загрузка переменных окружения из .env файла
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Could not load .env file. Using environment variables directly.")
	}

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Fatal("CRITICAL: JWT_SECRET environment variable is not set!")
	}
	jwtSecret = []byte(secret)

	// Инициализация базы данных
	initDatabase()
}

func main() {
	// Настройка режима Gin (ReleaseMode для продакшена, DebugMode для разработки)
	gin.SetMode(gin.DebugMode) // Или gin.ReleaseMode

	router := gin.Default()

	// Middleware
	router.Use(corsMiddleware()) // CORS - важно для взаимодействия фронтенда и бэкенда

	// Статические файлы
	router.Static("/assets", "./static/dist/assets")
	router.Static("/src", "./static/src")
	// Маршруты
	setupRoutes(router)

	// Запуск сервера
	startServer(router)
}

func initDatabase() {
	var err error
	// Настройка логгера GORM
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags), // io writer
		logger.Config{
			SlowThreshold: time.Second, // Порог медленного SQL запроса
			LogLevel:      logger.Info, // Уровень логирования (Silent, Error, Warn, Info)
			Colorful:      true,        // Цветной вывод
		},
	)

	db, err = gorm.Open(sqlite.Open("calendar.db"), &gorm.Config{
		Logger: newLogger, // Используем настроенный логгер
	})

	if err != nil {
		log.Fatalf("Failed to connect database: %v", err)
	}

	log.Println("Database connection successful.")

	// Автомиграции
	err = db.AutoMigrate(&models.User{}, &models.Event{}, &models.Category{})
	if err != nil {
		log.Fatalf("Database migration failed: %v", err)
	}
	log.Println("Database migrations successful.")
}

func setupRoutes(router *gin.Engine) {
	// Загрузка HTML шаблонов
	router.LoadHTMLFiles("static/dist/auth.html", "static/dist/index.html")

	// --- Маршруты для страниц ---
	router.GET("/login", func(c *gin.Context) {
		// Если пользователь уже залогинен (есть валидная кука), редирект на /app
		_, err := getTokenFromHeaderOrCookie(c)
		if err == nil {
			_, err = validateToken(getTokenString(c)) // Проверим валидность
			if err == nil {
				c.Redirect(http.StatusFound, "/app")
				return
			}
			// Если токен есть, но невалиден, удалим куку
			c.SetCookie("jwtToken", "", -1, "/", getCookieDomain(c), isSecureCookie(c), true)
		}
		// Отдаем страницу логина
		c.HTML(http.StatusOK, "auth.html", nil)
	})

	router.GET("/", func(c *gin.Context) {
		tokenString, err := getTokenFromHeaderOrCookie(c)
		if err == nil {
			_, err = validateToken(tokenString) // Проверяем валидность токена
			if err == nil {
				c.Redirect(http.StatusFound, "/app") // Валидный токен -> в приложение
				return
			}
			// Невалидный токен -> удаляем куку и редирект на логин
			c.SetCookie("jwtToken", "", -1, "/", getCookieDomain(c), isSecureCookie(c), true)
		}
		// Нет токена или он невалиден -> на страницу логина
		c.Redirect(http.StatusFound, "/login")
	})

	// Группа для основного приложения ("/app")
	appGroup := router.Group("/app")
	appGroup.Use(AuthPageMiddleware()) // Защищаем middleware'м
	{
		handler := func(c *gin.Context) {
			userName := c.GetString("user_name") // Получаем имя из контекста (установили в middleware)
			c.HTML(http.StatusOK, "index.html", gin.H{
				"userName": userName, // Передаем в шаблон
			})
		}
		appGroup.GET("", handler)
		appGroup.GET("/*any", handler) // Обслуживаем все подпути для SPA-роутинга
	}

	// --- API эндпоинты ---
	api := router.Group("/api")
	{
		// Публичные API
		api.POST("/register", registerHandler)
		api.POST("/login", loginHandler)
		api.POST("/logout", logoutHandler) // Добавили эндпоинт выхода

		// Защищенные API
		protectedApi := api.Group("") // Можно создать подгруппу или оставить так
		protectedApi.Use(AuthApiMiddleware())
		{
			// Пример защищенных эндпоинтов (пока только для событий)
			protectedApi.GET("/events", getEventsHandler)
			protectedApi.POST("/events", createEventHandler)
			// protectedApi.GET("/user/me", getCurrentUserHandler) // Пример эндпоинта для получения данных текущего юзера
			// ... другие защищенные эндпоинты для событий, категорий и т.д.
		}
	}
}

func startServer(router *gin.Engine) {
	port := os.Getenv("PORT") // Попробуем взять порт из окружения (для Heroku/облаков)
	if port == "" {
		port = "8080" // Дефолтный порт
	}
	addr := ":" + port
	fmt.Printf("Server starting on http://localhost%s\n", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// --- Обработчики аутентификации ---

func registerHandler(c *gin.Context) {
	// ... (Код из предыдущего ответа, без изменений) ...
	type RegisterRequest struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8,max=72"`
		Name     string `json:"name" binding:"required,min=2,max=50"`
	}

	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input data: " + err.Error()})
		return
	}
	var existingUser models.User
	result := db.Where("email = ?", req.Email).First(&existingUser)
	if result.Error == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "Email already exists"})
		return
	} else if result.Error != gorm.ErrRecordNotFound {
		log.Printf("Database error checking user existence: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("Failed to hash password: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password"})
		return
	}
	user := models.User{
		Email:        req.Email,
		PasswordHash: string(hashedPassword),
		Name:         req.Name,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}
	if result := db.Create(&user); result.Error != nil {
		log.Printf("Failed to create user: %v", result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create user"})
		return
	}
	log.Printf("User registered successfully: %s", user.Email)
	c.JSON(http.StatusCreated, gin.H{
		"message": "User created successfully",
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
			"name":  user.Name,
		},
	})
}

func loginHandler(c *gin.Context) {
	// ... (Код из предыдущего ответа, с установкой cookie) ...
	type LoginRequest struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required"`
	}
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}
	var user models.User
	if result := db.Where("email = ?", req.Email).First(&user); result.Error != nil {
		log.Printf("Login attempt failed for email %s: %v", req.Email, result.Error)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		log.Printf("Password mismatch for user %s", user.Email)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid email or password"})
		return
	}
	expirationTime := time.Now().Add(time.Hour * 24 * 7) // 7 дней
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": user.ID,
		"name":    user.Name,
		"exp":     expirationTime.Unix(),
	})
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		log.Printf("Failed to generate token for user %s: %v", user.Email, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}
	// Установка cookie
	maxAge := int(time.Until(expirationTime).Seconds())
	c.SetCookie("jwtToken", tokenString, maxAge, "/", getCookieDomain(c), isSecureCookie(c), true) // HttpOnly=true

	log.Printf("User logged in successfully: %s", user.Email)
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"user": gin.H{
			"id":    user.ID,
			"email": user.Email,
			"name":  user.Name,
		},
	})
}

func logoutHandler(c *gin.Context) {
	// ... (Код из предыдущего ответа) ...
	c.SetCookie("jwtToken", "", -1, "/", getCookieDomain(c), isSecureCookie(c), true)
	log.Println("User logged out")
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// --- Middleware ---

func AuthApiMiddleware() gin.HandlerFunc {
	// ... (Код из предыдущего ответа) ...
	return func(c *gin.Context) {
		tokenString, err := getTokenFromHeaderOrCookie(c)
		if err != nil {
			log.Printf("API Auth failed: %v", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			return
		}
		claims, err := validateToken(tokenString)
		if err != nil {
			log.Printf("API Auth failed: Invalid token: %v", err)
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired token"})
			return
		}
		userIDFloat, okID := claims["user_id"].(float64)
		userName, okName := claims["name"].(string)
		if !okID {
			log.Printf("API Auth failed: user_id missing or not a number in token")
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims (user_id)"})
			return
		}
		if !okName {
			log.Printf("API Auth warning: name missing or not a string in token")
		}
		c.Set("user_id", uint(userIDFloat))
		c.Set("user_name", userName)
		c.Next()
	}
}

func AuthPageMiddleware() gin.HandlerFunc {
	// ... (Код из предыдущего ответа) ...
	return func(c *gin.Context) {
		tokenString, err := getTokenFromHeaderOrCookie(c)
		if err != nil {
			log.Printf("Page Auth failed: %v. Redirecting to login.", err)
			c.Redirect(http.StatusFound, "/login?reason=unauthenticated")
			c.Abort()
			return
		}
		claims, err := validateToken(tokenString)
		if err != nil {
			log.Printf("Page Auth failed: Invalid token: %v. Redirecting to login.", err)
			c.SetCookie("jwtToken", "", -1, "/", getCookieDomain(c), isSecureCookie(c), true)
			c.Redirect(http.StatusFound, "/login?reason=invalid_token")
			c.Abort()
			return
		}
		userIDFloat, okID := claims["user_id"].(float64)
		userName, okName := claims["name"].(string)
		if !okID {
			log.Printf("Page Auth failed: user_id missing or not a number in token. Redirecting to login.")
			c.SetCookie("jwtToken", "", -1, "/", getCookieDomain(c), isSecureCookie(c), true)
			c.Redirect(http.StatusFound, "/login?reason=bad_token_claims")
			c.Abort()
			return
		}
		if !okName {
			userName = ""
			log.Printf("Page Auth warning: name missing or not a string in token for user ID %d", uint(userIDFloat))
		}
		c.Set("user_id", uint(userIDFloat))
		c.Set("user_name", userName)
		c.Next()
	}
}

func corsMiddleware() gin.HandlerFunc {
	// ... (Код из предыдущего ответа, убедись что Allow-Origin подходит) ...
	return func(c *gin.Context) {
		// Важно: Этот Origin должен совпадать с тем, откуда приходят запросы JS
		// Если фронтенд и бэкенд на одном домене/порту, можно быть строже
		// Для разработки с разными портами, нужно указать порт фронтенда
		// origin := c.Request.Header.Get("Origin") // Можно сделать динамическим
		// if origin == "" { origin = "http://localhost:8080" }

		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:8080") // ИЛИ порт фронтенда
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH") // Добавил PATCH на всякий случай

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

// --- Хелперы ---

func getTokenFromHeaderOrCookie(c *gin.Context) (string, error) {
	// ... (Код из предыдущего ответа) ...
	tokenString, err := c.Cookie("jwtToken")
	if err == nil && tokenString != "" {
		return tokenString, nil
	}
	authHeader := c.GetHeader("Authorization")
	if authHeader != "" {
		parts := strings.Split(authHeader, " ")
		if len(parts) == 2 && strings.ToLower(parts[0]) == "bearer" {
			return parts[1], nil
		}
		return "", fmt.Errorf("invalid Authorization header format")
	}
	return "", fmt.Errorf("authorization token not found in cookie or header")
}

// Получает строку токена (упрощенный вариант, без Header)
func getTokenString(c *gin.Context) string {
	tokenString, _ := c.Cookie("jwtToken")
	return tokenString
}

func validateToken(tokenString string) (jwt.MapClaims, error) {
	// ... (Исправленная версия из предыдущего ответа с errors.Is) ...
	if len(jwtSecret) == 0 {
		log.Fatal("CRITICAL: JWT_SECRET environment variable is not set!")
	}
	token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return jwtSecret, nil
	})
	if err != nil {
		log.Printf("Token validation error: %v", err)
		if errors.Is(err, jwt.ErrTokenMalformed) {
			return nil, fmt.Errorf("malformed token")
		} else if errors.Is(err, jwt.ErrTokenExpired) || errors.Is(err, jwt.ErrTokenNotValidYet) {
			return nil, fmt.Errorf("token expired or not active yet")
		} else {
			return nil, fmt.Errorf("invalid token: %v", err)
		}
	}
	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if _, ok := claims["user_id"].(float64); !ok {
			return nil, fmt.Errorf("invalid token claims: user_id missing or not a number")
		}
		return claims, nil
	}
	return nil, fmt.Errorf("invalid token")
}

// Хелперы для определения параметров cookie
func getCookieDomain(c *gin.Context) string {
	// Для localhost можно оставить "" или "localhost"
	// Для продакшена нужно будет установить правильный домен
	if strings.HasPrefix(c.Request.Host, "localhost") {
		return "localhost"
	}
	// В продакшене: return "yourdomain.com"
	return "" // Пустая строка обычно означает "только для текущего хоста"
}

func isSecureCookie(c *gin.Context) bool {
	// Secure=true ТОЛЬКО для HTTPS
	// В разработке на localhost обычно false
	// В проде за Nginx/Caddy/etc., которые терминируют TLS, можно проверять заголовки X-Forwarded-Proto
	if c.Request.Header.Get("X-Forwarded-Proto") == "https" {
		return true
	}
	// Простая проверка для localhost
	return strings.HasPrefix(c.Request.Host, "localhost") == false
}

// --- Обработчики событий (Заглушки) ---

func getEventsHandler(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	log.Printf("Fetching events for user %d", userID)
	// TODO: Реализовать логику получения событий из БД
	c.JSON(http.StatusOK, gin.H{"message": "Events endpoint hit", "user_id": userID, "events": []string{}})
}

func createEventHandler(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	log.Printf("Creating event for user %d", userID)
	// TODO: Реализовать логику создания события
	c.JSON(http.StatusCreated, gin.H{"message": "Event created (not really)", "user_id": userID})
}
