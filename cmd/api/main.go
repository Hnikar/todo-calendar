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

const eventTimeFormat = "2006-01-02T15:04"

var db *gorm.DB
var jwtSecret []byte

type CreateCategoryRequest struct {
	Name string `json:"name" binding:"required,min=1,max=100"`
}
type CategoryResponse struct {
	ID   uint   `json:"id"`
	Name string `json:"name"`
}

type EventResponse struct {
	ID          uint    `json:"id"`
	Title       string  `json:"title"`
	Start       string  `json:"start"`
	End         string  `json:"end"`
	AllDay      bool    `json:"allDay"`
	Description string  `json:"description"`
	Priority    string  `json:"priority,omitempty"`
	Category    *string `json:"category"`
	Completed   bool    `json:"completed"`
	ClassName   string  `json:"className,omitempty"`
}

type CreateEventRequest struct {
	Title       string  `json:"title" binding:"required,min=1"`
	Description string  `json:"description"`
	Start       string  `json:"start" binding:"required"`
	End         string  `json:"end" binding:"required"`
	AllDay      *bool   `json:"allDay"`
	Priority    string  `json:"priority"`
	Category    *string `json:"category"`
	Completed   *bool   `json:"completed"`
	ClassName   string  `json:"className"`
}

type UpdateEventRequest struct {
	Title       string  `json:"title" binding:"required,min=1"`
	Description string  `json:"description"`
	Start       string  `json:"start" binding:"required"`
	End         string  `json:"end" binding:"required"`
	AllDay      bool    `json:"allDay"`
	Priority    string  `json:"priority"`
	Category    *string `json:"category"`
	Completed   bool    `json:"completed"`
	ClassName   string  `json:"className"`
}

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

	router.GET("/main.js", func(c *gin.Context) {
		c.File("./static/dist/main.js")
	})

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

// createCategoryHandler создает новую категорию для текущего пользователя
func createCategoryHandler(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var req CreateCategoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	category := models.Category{
		UserID: userID,
		Name:   req.Name, // Валидация GORM/индекс БД проверят уникальность имени для юзера
	}

	// Пытаемся создать категорию
	result := db.Create(&category)
	if result.Error != nil {
		if strings.Contains(result.Error.Error(), "UNIQUE constraint failed") {
			c.JSON(http.StatusConflict, gin.H{"error": fmt.Sprintf("Category with name '%s' already exists", req.Name)})
		} else {
			log.Printf("Error creating category for user %d: %v", userID, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create category"})
		}
		return
	}

	response := CategoryResponse{
		ID:   category.ID,
		Name: category.Name,
	}
	c.JSON(http.StatusCreated, response)
}

func MapEventToResponse(event *models.Event, categoryName *string) EventResponse {
	startStr := event.StartTime.Format(eventTimeFormat)
	endStr := event.EndTime.Format(eventTimeFormat)

	return EventResponse{
		ID:          event.ID,
		Title:       event.Title,
		Start:       startStr,
		End:         endStr,
		AllDay:      event.AllDay,
		Description: event.Description,
		Priority:    event.Priority,
		Category:    categoryName,
		Completed:   event.IsCompleted,
		ClassName:   event.ClassName,
	}
}

func parseDateTime(dateTimeStr string) (time.Time, error) {
	t, err := time.Parse(eventTimeFormat, dateTimeStr)
	if err != nil {
		log.Printf("Error parsing date string '%s': %v", dateTimeStr, err)
		return time.Time{}, fmt.Errorf("invalid date/time format, expected YYYY-MM-DDTHH:mm")
	}
	return t, nil
}

func getCategoryIDByName(tx *gorm.DB, name *string, userID uint) (*uint, error) {
	if name == nil || *name == "" {
		return nil, nil
	}
	var category models.Category
	result := tx.Where("user_id = ? AND name = ?", userID, *name).First(&category)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			log.Printf("Category '%s' not found for user %d", *name, userID)
			return nil, fmt.Errorf("category '%s' not found", *name)
		}
		log.Printf("Error finding category '%s' for user %d: %v", *name, userID, result.Error)
		return nil, fmt.Errorf("database error while finding category")
	}
	return &category.ID, nil
}

func getCategoryNameByID(tx *gorm.DB, categoryID *uint, userID uint) (*string, error) {
	if categoryID == nil {
		return nil, nil
	}
	var category models.Category
	result := tx.Where("id = ? AND user_id = ?", *categoryID, userID).First(&category)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			log.Printf("Category ID %d not found for user %d", *categoryID, userID)
			return nil, nil
		}
		log.Printf("Error finding category name for ID %d, user %d: %v", *categoryID, userID, result.Error)
		return nil, fmt.Errorf("database error while finding category name")
	}
	return &category.Name, nil
}

// getCategoriesHandler возвращает список категорий текущего пользователя
func getCategoriesHandler(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var categories []models.Category
	if err := db.Where("user_id = ?", userID).Order("name asc").Find(&categories).Error; err != nil {
		log.Printf("Error fetching categories for user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch categories"})
		return
	}

	response := make([]CategoryResponse, len(categories))
	for i, cat := range categories {
		response[i] = CategoryResponse{
			ID:   cat.ID,
			Name: cat.Name,
		}
	}

	c.JSON(http.StatusOK, response)
}

// deleteCategoryHandler удаляет категорию по ID для текущего пользователя
func deleteCategoryHandler(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	categoryID := c.Param("id") // Получаем ID из URL

	tx := db.Begin()
	if tx.Error != nil {
		log.Printf("Error starting transaction for deleting category for user %d: %v", userID, tx.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		return
	}

	updateResult := tx.Model(&models.Event{}).
		Where("category_id = ? AND user_id = ?", categoryID, userID).
		Update("category_id", nil) // NULL

	if updateResult.Error != nil {
		tx.Rollback()
		log.Printf("Error nullifying category_id for events for user %d, category %s: %v", userID, categoryID, updateResult.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update associated events"})
		return
	}

	deleteResult := tx.Where("id = ? AND user_id = ?", categoryID, userID).Delete(&models.Category{})

	if deleteResult.Error != nil {
		tx.Rollback()
		log.Printf("Error deleting category %s for user %d: %v", categoryID, userID, deleteResult.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete category"})
		return
	}

	if deleteResult.RowsAffected == 0 {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{"error": "Category not found or you don't have permission to delete it"})
		return
	}

	if err := tx.Commit().Error; err != nil {
		log.Printf("Error committing transaction for deleting category %s for user %d: %v", categoryID, userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to finalize category deletion"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Category deleted successfully"})
}

func setupRoutes(router *gin.Engine, basePath string) {
	templateBaseDir := filepath.Join(basePath, "static", "dist")

	router.LoadHTMLFiles(
		filepath.Join(templateBaseDir, "auth.html"),
		filepath.Join(templateBaseDir, "index.html"),
		filepath.Join(templateBaseDir, "landing-page.html"),
		filepath.Join(templateBaseDir, "404.html"), // <-- Убедись, что он здесь есть
	)

	// --- Маршруты для страниц ---
	router.GET("/landing", func(c *gin.Context) {
		c.HTML(http.StatusOK, "landing-page.html", nil)
	})

	router.GET("/login", func(c *gin.Context) {
		tokenString, err := getTokenFromHeaderOrCookie(c)
		if err == nil {
			_, err = validateToken(tokenString)
			if err == nil {
				c.Redirect(http.StatusFound, "/app")
				return
			}
			c.SetCookie("jwtToken", "", -1, "/", getCookieDomain(c), isSecureCookie(c), true)
		}
		c.HTML(http.StatusOK, "auth.html", nil)
	})

	router.GET("/", func(c *gin.Context) {
		tokenString, err := getTokenFromHeaderOrCookie(c)
		if err == nil {
			_, err = validateToken(tokenString)
			if err == nil {
				c.Redirect(http.StatusFound, "/app")
				return
			}
			c.SetCookie("jwtToken", "", -1, "/", getCookieDomain(c), isSecureCookie(c), true)
		}
		c.Redirect(http.StatusFound, "/landing")
	})

	appGroup := router.Group("/app")
	appGroup.Use(AuthPageMiddleware())
	{
		handler := func(c *gin.Context) {
			userName := c.GetString("user_name")
			c.HTML(http.StatusOK, "index.html", gin.H{"userName": userName})
		}
		appGroup.GET("", handler)
		appGroup.GET("/*any", handler)
	}

	// --- API эндпоинты ---
	api := router.Group("/api")
	{
		// Публичные API аутентификации
		api.POST("/register", registerHandler)
		api.POST("/login", loginHandler)
		api.POST("/logout", logoutHandler)

		// Защищенные API
		protectedApi := api.Group("")
		protectedApi.Use(AuthApiMiddleware())
		{
			categories := protectedApi.Group("/categories")
			{
				categories.POST("", createCategoryHandler)       // POST /api/categories
				categories.GET("", getCategoriesHandler)         // GET /api/categories
				categories.DELETE("/:id", deleteCategoryHandler) // DELETE /api/categories/:id
				// categories.PUT("/:id", updateCategoryHandler) // Если нужно обновление
			}

			events := protectedApi.Group("/events")
			{
				events.POST("", createEventHandler)       // POST /api/events
				events.GET("", getEventsHandler)          // GET /api/events
				events.GET("/:id", getSingleEventHandler) // GET /api/events/:id
				events.PUT("/:id", updateEventHandler)    // PUT /api/events/:id
				events.DELETE("/:id", deleteEventHandler) // DELETE /api/events/:id
				// events.PATCH("/:id", patchEventHandler) // Если решишь добавить PATCH
			}
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

	startStr := c.Query("start")
	endStr := c.Query("end")

	var startTime, endTime time.Time
	var err error

	if startStr != "" {
		startTime, err = parseDateTime(startStr + "T00:00")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid start query parameter: %v", err)})
			return
		}
	} else {
		startTime = time.Now().AddDate(-5, 0, 0)
	}

	if endStr != "" {
		var endDateParsed time.Time
		endDateParsed, err = parseDateTime(endStr + "T00:00")
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid end query parameter: %v", err)})
			return
		}
		endTime = endDateParsed.Add(24 * time.Hour).Add(-time.Second)
	} else {
		endTime = time.Now().AddDate(5, 0, 0)
	}

	var events []models.Event
	query := db.Where("user_id = ? AND start_time <= ? AND end_time >= ?", userID, endTime, startTime).Order("start_time asc")

	if err := query.Find(&events).Error; err != nil {
		log.Printf("Error fetching events for user %d: %v", userID, err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch events"})
		return
	}

	response := make([]EventResponse, len(events))
	categoryNames := make(map[uint]string)

	for i, event := range events {
		var categoryName *string
		if event.CategoryID != nil {
			if name, ok := categoryNames[*event.CategoryID]; ok {
				tempName := name
				categoryName = &tempName
			} else {
				foundName, err := getCategoryNameByID(db, event.CategoryID, userID)
				if err == nil && foundName != nil {
					categoryNames[*event.CategoryID] = *foundName
					categoryName = foundName
				}
			}
		}
		response[i] = MapEventToResponse(&events[i], categoryName)
	}

	c.JSON(http.StatusOK, response)
}

func createEventHandler(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)

	var req CreateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	startTime, err := parseDateTime(req.Start)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid start date: %v", err)})
		return
	}
	endTime, err := parseDateTime(req.End)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid end date: %v", err)})
		return
	}

	if endTime.Before(startTime) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "End time must be after start time"})
		return
	}

	categoryID, err := getCategoryIDByName(db, req.Category, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	isCompleted := false
	if req.Completed != nil {
		isCompleted = *req.Completed
	}
	isAllDay := false
	if req.AllDay != nil {
		isAllDay = *req.AllDay
	}

	event := models.Event{
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		StartTime:   startTime,
		EndTime:     endTime,
		AllDay:      isAllDay,
		IsCompleted: isCompleted,
		Priority:    req.Priority,
		ClassName:   req.ClassName,
		CategoryID:  categoryID,
	}

	if result := db.Create(&event); result.Error != nil {
		log.Printf("Error creating event for user %d: %v", userID, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create event"})
		return
	}

	categoryName, _ := getCategoryNameByID(db, event.CategoryID, userID)
	response := MapEventToResponse(&event, categoryName)

	c.JSON(http.StatusCreated, response)
}

func getSingleEventHandler(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	eventID := c.Param("id")

	var event models.Event
	result := db.Where("id = ? AND user_id = ?", eventID, userID).First(&event)

	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		} else {
			log.Printf("Error fetching single event %s for user %d: %v", eventID, userID, result.Error)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	categoryName, _ := getCategoryNameByID(db, event.CategoryID, userID)
	response := MapEventToResponse(&event, categoryName)

	c.JSON(http.StatusOK, response)
}

func updateEventHandler(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	eventID := c.Param("id")

	var event models.Event
	if err := db.Where("id = ? AND user_id = ?", eventID, userID).First(&event).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "Event not found"})
		} else {
			log.Printf("Error finding event %s for update, user %d: %v", eventID, userID, err)
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Database error"})
		}
		return
	}

	var req UpdateEventRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid input: " + err.Error()})
		return
	}

	startTime, err := parseDateTime(req.Start)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid start date: %v", err)})
		return
	}
	endTime, err := parseDateTime(req.End)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("Invalid end date: %v", err)})
		return
	}
	if endTime.Before(startTime) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "End time must be after start time"})
		return
	}

	categoryID, err := getCategoryIDByName(db, req.Category, userID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	event.Title = req.Title
	event.Description = req.Description
	event.StartTime = startTime
	event.EndTime = endTime
	event.AllDay = req.AllDay
	event.IsCompleted = req.Completed
	event.Priority = req.Priority
	event.ClassName = req.ClassName
	event.CategoryID = categoryID

	if result := db.Save(&event); result.Error != nil {
		log.Printf("Error updating event %s for user %d: %v", eventID, userID, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update event"})
		return
	}

	categoryName, _ := getCategoryNameByID(db, event.CategoryID, userID)
	response := MapEventToResponse(&event, categoryName)
	c.JSON(http.StatusOK, response)
}

func deleteEventHandler(c *gin.Context) {
	userID := c.MustGet("user_id").(uint)
	eventID := c.Param("id")

	result := db.Where("id = ? AND user_id = ?", eventID, userID).Delete(&models.Event{})

	if result.Error != nil {
		log.Printf("Error deleting event %s for user %d: %v", eventID, userID, result.Error)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete event"})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Event not found or you don't have permission"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Event deleted successfully"})
}
