package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"
	"todo-calendar/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var db *gorm.DB
var jwtSecret []byte

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: Could not load .env file. Using environment variables directly.")
	}

	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		log.Fatal("CRITICAL: JWT_SECRET environment variable is not set!")
	}
	jwtSecret = []byte(secret)

	initDatabase()

	gin.SetMode(gin.DebugMode)

	router := gin.Default()

	// Middleware
	router.Use(corsMiddleware())

	router.Static("/assets", "./static/dist/assets")

	setupRoutes(router, ".")

	startServer(router)
}

func initDatabase() {
	var err error
	newLogger := logger.New(
		log.New(os.Stdout, "\r\n", log.LstdFlags),
		logger.Config{
			SlowThreshold: time.Second,
			LogLevel:      logger.Info,
			Colorful:      true,
		},
	)
	db, err = gorm.Open(sqlite.Open("calendar.db"), &gorm.Config{
		Logger: newLogger,
	})
	if err != nil {
		log.Fatalf("Failed to connect database: %v", err)
	}
	log.Println("Database connection successful.")
	err = db.AutoMigrate(&models.User{}, &models.Event{}, &models.Category{})
	if err != nil {
		log.Fatalf("Database migration failed: %v", err)
	}
	log.Println("Database migrations successful.")
}

func setupRoutes(router *gin.Engine, basePath string) {
	// Формируем путь к папке с шаблонами
	templateBaseDir := filepath.Join(basePath, "static", "dist")

	// Загрузка HTML шаблонов с использованием basePath
	router.LoadHTMLFiles(
		filepath.Join(templateBaseDir, "auth.html"),
		filepath.Join(templateBaseDir, "index.html"),
		filepath.Join(templateBaseDir, "landing-page.html"),
		filepath.Join(templateBaseDir, "404.html"), // <-- Убедись, что он здесь есть
	)

	// --- Маршруты для страниц ---

	// Новый маршрут для landing page
	router.GET("/landing", func(c *gin.Context) {
		c.HTML(http.StatusOK, "landing-page.html", nil)
	})

	router.GET("/login", func(c *gin.Context) {
		// Проверяем, если уже залогинен - редирект в приложение
		tokenString, err := getTokenFromHeaderOrCookie(c)
		if err == nil {
			_, err = validateToken(tokenString)
			if err == nil {
				c.Redirect(http.StatusFound, "/app")
				return
			}
			c.SetCookie("jwtToken", "", -1, "/", getCookieDomain(c), isSecureCookie(c), true)
		}
		// Иначе отдаем страницу логина
		c.HTML(http.StatusOK, "auth.html", nil)
	})

	// Корень теперь редиректит на /landing или /app
	router.GET("/", func(c *gin.Context) {
		tokenString, err := getTokenFromHeaderOrCookie(c)
		if err == nil {
			_, err = validateToken(tokenString)
			if err == nil {
				c.Redirect(http.StatusFound, "/app") // В приложение
				return
			}
			c.SetCookie("jwtToken", "", -1, "/", getCookieDomain(c), isSecureCookie(c), true)
		}
		// Не аутентифицирован -> на лендинг
		c.Redirect(http.StatusFound, "/landing")
	})

	// Группа для основного приложения "/app"
	appGroup := router.Group("/app")
	appGroup.Use(AuthPageMiddleware()) // Защищено
	{
		handler := func(c *gin.Context) {
			userName := c.GetString("user_name")
			c.HTML(http.StatusOK, "index.html", gin.H{"userName": userName})
		}
		appGroup.GET("", handler)
		appGroup.GET("/*any", handler) // Для SPA
	}

	// --- API эндпоинты ---
	api := router.Group("/api")
	{
		// Публичные
		api.POST("/register", registerHandler)
		api.POST("/login", loginHandler)
		api.POST("/logout", logoutHandler)

		// Защищенные
		protectedApi := api.Group("")
		protectedApi.Use(AuthApiMiddleware())
		{
			protectedApi.GET("/events", getEventsHandler)
			protectedApi.POST("/events", createEventHandler)
			// ... другие ...
		}
	}

	// --- Обработчик 404 ---
	router.NoRoute(func(c *gin.Context) {
		acceptHeader := c.Request.Header.Get("Accept")
		if strings.Contains(acceptHeader, "application/json") {
			c.JSON(http.StatusNotFound, gin.H{"error": "Resource not found"})
		} else {
			// Шаблон "404.html" уже должен быть загружен через LoadHTMLFiles
			c.HTML(http.StatusNotFound, "404.html", nil)
		}
	})
}

func startServer(router *gin.Engine) {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	addr := ":" + port
	fmt.Printf("Server starting on http://localhost%s\n", addr)
	if err := router.Run(addr); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

// --- Обработчики аутентификации (registerHandler, loginHandler, logoutHandler) ---
func registerHandler(c *gin.Context) {
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
	maxAge := int(time.Until(expirationTime).Seconds())
	c.SetCookie("jwtToken", tokenString, maxAge, "/", getCookieDomain(c), isSecureCookie(c), true)
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
	c.SetCookie("jwtToken", "", -1, "/", getCookieDomain(c), isSecureCookie(c), true)
	log.Println("User logged out")
	c.JSON(http.StatusOK, gin.H{"message": "Logged out successfully"})
}

// --- Middleware (AuthApiMiddleware, AuthPageMiddleware, corsMiddleware) ---
func AuthApiMiddleware() gin.HandlerFunc {
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
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:8080") // Или твой порт фронтенда
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	}
}

// --- Хелперы (getTokenFromHeaderOrCookie, getTokenString, validateToken, getCookieDomain, isSecureCookie) ---
func getTokenFromHeaderOrCookie(c *gin.Context) (string, error) {
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

func getTokenString(c *gin.Context) string {
	tokenString, _ := c.Cookie("jwtToken")
	return tokenString
}

func validateToken(tokenString string) (jwt.MapClaims, error) {
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
		} else if errors.Is(err, jwt.ErrSignatureInvalid) {
			return nil, fmt.Errorf("invalid token signature")
		} else {
			return nil, fmt.Errorf("invalid token processing error: %v", err)
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

func getCookieDomain(c *gin.Context) string {
	if strings.HasPrefix(c.Request.Host, "localhost") {
		return "localhost"
	}
	return ""
}

func isSecureCookie(c *gin.Context) bool {
	if c.Request.Header.Get("X-Forwarded-Proto") == "https" {
		return true
	}
	return strings.HasPrefix(c.Request.Host, "localhost") == false
}

// --- Обработчики событий (Заглушки - getEventsHandler, createEventHandler) ---
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
