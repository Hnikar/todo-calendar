// cmd/api/main_test.go
package main

import (
	"bytes"
	"encoding/json"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
	"time"
	"todo-calendar/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require" // Можно использовать require для критичных проверок
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

var testDB *gorm.DB

// --- TestMain (без изменений) ---
func TestMain(m *testing.M) {
	gin.SetMode(gin.TestMode)
	var err error
	testDB, err = gorm.Open(sqlite.Open("file::memory:?cache=shared"), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect test database: %v", err)
	}
	err = testDB.AutoMigrate(&models.User{}, &models.Event{}, &models.Category{})
	if err != nil {
		log.Fatalf("Test database migration failed: %v", err)
	}
	db = testDB // Переназначаем глобальную переменную для обработчиков
	os.Setenv("JWT_SECRET", "test_secret_key_12345")
	secretForTest := os.Getenv("JWT_SECRET")
	if secretForTest == "" {
		log.Fatal("Failed to set JWT_SECRET for tests")
	}
	jwtSecret = []byte(secretForTest)
	exitVal := m.Run()
	os.Exit(exitVal)
}

// --- setupTestRouter (без изменений) ---
func setupTestRouter() *gin.Engine {
	router := gin.Default()
	basePath := "../.."
	router.Static("/assets", filepath.Join(basePath, "static", "dist", "assets"))
	setupRoutes(router, basePath)
	return router
}

// --- clearTables (без изменений) ---
func clearTables() {
	testDB.Exec("DELETE FROM events")
	testDB.Exec("DELETE FROM categories")
	testDB.Exec("DELETE FROM users")
	testDB.Exec("DELETE FROM sqlite_sequence WHERE name IN ('events', 'categories', 'users')")
}

// --- findCookie (без изменений) ---
func findCookie(cookies []*http.Cookie, name string) *http.Cookie {
	for _, cookie := range cookies {
		if cookie.Name == name {
			return cookie
		}
	}
	return nil
}

// --- generateTestToken (без изменений) ---
func generateTestToken(userID uint, name string, duration time.Duration) string {
	expirationTime := time.Now().Add(duration)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"user_id": float64(userID),
		"name":    name,
		"exp":     expirationTime.Unix(),
	})
	tokenString, _ := token.SignedString(jwtSecret)
	return tokenString
}

// ==========================================================
// ПЕРЕПИСАННЫЕ ТЕСТЫ С ИСПОЛЬЗОВАНИЕМ t.Run и Таблиц
// ==========================================================

// --- Тесты для registerHandler (Табличный подход) ---
func TestRegisterHandler(t *testing.T) {
	// Структура для описания тестового случая
	type registerTestCase struct {
		name           string             // Имя подтеста
		requestBody    gin.H              // Тело запроса
		setupDB        func()             // Функция для подготовки БД (если нужно)
		expectedStatus int                // Ожидаемый HTTP статус
		expectedBody   map[string]any     // Ожидаемое тело ответа (или его часть)
		checkDB        func(t *testing.T) // Функция для проверки состояния БД после запроса
	}

	// Таблица тестовых случаев
	testCases := []registerTestCase{
		{
			name: "Success",
			requestBody: gin.H{
				"name":     "Test User",
				"email":    "test@example.com",
				"password": "password123",
			},
			setupDB:        func() {}, // Ничего не делаем перед этим тестом
			expectedStatus: http.StatusCreated,
			expectedBody:   map[string]any{"message": "User created successfully"}, // Проверяем только сообщение
			checkDB: func(t *testing.T) { // Проверяем БД после
				var user models.User
				result := testDB.Where("email = ?", "test@example.com").First(&user)
				assert.NoError(t, result.Error)
				assert.Equal(t, "Test User", user.Name)
			},
		},
		{
			name: "User Exists",
			requestBody: gin.H{
				"name":     "Another User",
				"email":    "exists@example.com",
				"password": "password456",
			},
			setupDB: func() { // Создаем пользователя заранее
				existingUser := models.User{Name: "Existing User", Email: "exists@example.com", PasswordHash: "hashedpassword"}
				testDB.Create(&existingUser)
			},
			expectedStatus: http.StatusConflict,
			expectedBody:   map[string]any{"error": "Email already exists"},
			checkDB:        func(t *testing.T) {}, // Не проверяем БД дополнительно
		},
		{
			name: "Invalid Input - Short Password",
			requestBody: gin.H{
				"name":     "Test",
				"email":    "invalid@example.com",
				"password": "short",
			},
			setupDB:        func() {},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": "Invalid input data: Key: 'RegisterRequest.Password' Error:Field validation for 'Password' failed on the 'min' tag"}, // Можно проверять конкретную ошибку валидации
			checkDB:        func(t *testing.T) {},
		},
		{
			name: "Invalid Input - No Name",
			requestBody: gin.H{
				"email":    "noname@example.com",
				"password": "password123",
				// name отсутствует
			},
			setupDB:        func() {},
			expectedStatus: http.StatusBadRequest,
			expectedBody:   map[string]any{"error": "Invalid input data: Key: 'RegisterRequest.Name' Error:Field validation for 'Name' failed on the 'required' tag"},
			checkDB:        func(t *testing.T) {},
		},
		// Можно добавить еще кейсы: невалидный email, слишком длинное имя и т.д.
	}

	// Запуск тестов в цикле
	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			clearTables() // Очищаем таблицы перед каждым подтестом
			tc.setupDB()  // Выполняем подготовку БД для этого случая

			router := setupTestRouter() // Получаем свежий роутер

			body, _ := json.Marshal(tc.requestBody)
			req, _ := http.NewRequest(http.MethodPost, "/api/register", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

			// Проверка статуса
			assert.Equal(t, tc.expectedStatus, w.Code)

			// Проверка тела ответа
			var responseBody map[string]any // Используем any для гибкости
			err := json.Unmarshal(w.Body.Bytes(), &responseBody)
			require.NoError(t, err, "Response body should be valid JSON") // require прервет тест, если JSON невалиден

			// Проверяем, что ожидаемые ключи/значения присутствуют в ответе
			for key, expectedValue := range tc.expectedBody {
				assert.Contains(t, responseBody, key, "Response body should contain key '%s'", key)
				// Используем Contains для ошибок, т.к. полное сообщение может включать детали
				if key == "error" {
					assert.Contains(t, responseBody[key], expectedValue, "Error message mismatch")
				} else {
					assert.Equal(t, expectedValue, responseBody[key], "Value mismatch for key '%s'", key)
				}
			}

			// Дополнительная проверка БД, если она есть для этого случая
			if tc.checkDB != nil {
				tc.checkDB(t)
			}
		})
	}
}

// --- Тесты для loginHandler (Табличный подход) ---
func TestLoginHandler(t *testing.T) {
	type loginTestCase struct {
		name           string
		email          string
		password       string
		setupDB        func() uint // Функция подготовки, возвращает ID созданного юзера (если нужен)
		expectedStatus int
		expectedBody   map[string]any
		checkCookie    func(t *testing.T, cookies []*http.Cookie, expectedUserID uint)
	}

	password := "correctpassword"
	hashedPassword, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)

	testCases := []loginTestCase{
		{
			name:     "Success",
			email:    "login@example.com",
			password: password,
			setupDB: func() uint {
				user := models.User{Name: "Login User", Email: "login@example.com", PasswordHash: string(hashedPassword)}
				testDB.Create(&user)
				return user.ID
			},
			expectedStatus: http.StatusOK,
			expectedBody:   map[string]any{"message": "Login successful", "user": map[string]any{"name": "Login User", "email": "login@example.com"}},
			checkCookie: func(t *testing.T, cookies []*http.Cookie, expectedUserID uint) {
				jwtCookie := findCookie(cookies, "jwtToken")
				require.NotNil(t, jwtCookie, "jwtToken cookie should be set")
				assert.True(t, jwtCookie.HttpOnly)
				claims, err := validateToken(jwtCookie.Value)
				require.NoError(t, err)
				assert.Equal(t, float64(expectedUserID), claims["user_id"])
				assert.Equal(t, "Login User", claims["name"])
			},
		},
		{
			name:     "Invalid Password",
			email:    "login@example.com",
			password: "wrongpassword",
			setupDB: func() uint {
				user := models.User{Name: "Login User", Email: "login@example.com", PasswordHash: string(hashedPassword)}
				testDB.Create(&user)
				return user.ID
			},
			expectedStatus: http.StatusUnauthorized,
			expectedBody:   map[string]any{"error": "Invalid email or password"},
			checkCookie: func(t *testing.T, cookies []*http.Cookie, expectedUserID uint) {
				assert.Nil(t, findCookie(cookies, "jwtToken"))
			},
		},
		{
			name:           "User Not Found",
			email:          "notfound@example.com",
			password:       "somepassword",
			setupDB:        func() uint { return 0 }, // Ничего не создаем
			expectedStatus: http.StatusUnauthorized,
			expectedBody:   map[string]any{"error": "Invalid email or password"},
			checkCookie: func(t *testing.T, cookies []*http.Cookie, expectedUserID uint) {
				assert.Nil(t, findCookie(cookies, "jwtToken"))
			},
		},
		{
			name:           "Invalid Input - No Password",
			email:          "login@example.com",
			password:       "", // Пустой пароль
			setupDB:        func() uint { return 0 },
			expectedStatus: http.StatusBadRequest, // Ожидаем ошибку валидации
			expectedBody:   map[string]any{"error": "Invalid input: Key: 'LoginRequest.Password' Error:Field validation for 'Password' failed on the 'required' tag"},
			checkCookie: func(t *testing.T, cookies []*http.Cookie, expectedUserID uint) {
				assert.Nil(t, findCookie(cookies, "jwtToken"))
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			clearTables()
			expectedUserID := tc.setupDB() // Выполняем подготовку и получаем ID
			router := setupTestRouter()

			loginCreds := gin.H{"email": tc.email, "password": tc.password}
			body, _ := json.Marshal(loginCreds)
			req, _ := http.NewRequest(http.MethodPost, "/api/login", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")
			w := httptest.NewRecorder()

			router.ServeHTTP(w, req)

			assert.Equal(t, tc.expectedStatus, w.Code)

			var responseBody map[string]any
			err := json.Unmarshal(w.Body.Bytes(), &responseBody)
			require.NoError(t, err, "Response body should be valid JSON")

			// Сравниваем только те части тела ответа, которые указаны в expectedBody
			for key, expectedValue := range tc.expectedBody {
				assert.Contains(t, responseBody, key)
				if subMap, ok := expectedValue.(map[string]any); ok {
					// Если ожидаемое значение - карта (как для "user"), сравниваем вложенные поля
					actualSubMap, okSub := responseBody[key].(map[string]any)
					require.True(t, okSub, "Expected sub-map for key '%s', got %T", key, responseBody[key])
					for subKey, subExpectedValue := range subMap {
						assert.Contains(t, actualSubMap, subKey)
						assert.Equal(t, subExpectedValue, actualSubMap[subKey], "Value mismatch for key '%s.%s'", key, subKey)
					}
				} else if key == "error" {
					assert.Contains(t, responseBody[key], expectedValue, "Error message mismatch")
				} else {
					assert.Equal(t, expectedValue, responseBody[key], "Value mismatch for key '%s'", key)
				}
			}

			if tc.checkCookie != nil {
				tc.checkCookie(t, w.Result().Cookies(), expectedUserID)
			}
		})
	}
}

// --- Тесты для AuthApiMiddleware (Табличный подход) ---
func TestAuthApiMiddleware(t *testing.T) {
	type apiMiddlewareTestCase struct {
		name           string
		setupRequest   func(req *http.Request, token string) // Функция для настройки токена (cookie/header)
		tokenGenerator func() string                         // Функция для генерации нужного токена
		expectedStatus int
		expectedError  string // Ожидаемая строка в ошибке JSON
	}

	testUser := models.User{Name: "API User", Email: "api@example.com", PasswordHash: "hash"} // Пользователь для генерации токенов

	testCases := []apiMiddlewareTestCase{
		{
			name: "Valid Token in Cookie",
			setupRequest: func(req *http.Request, token string) {
				req.AddCookie(&http.Cookie{Name: "jwtToken", Value: token})
			},
			tokenGenerator: func() string {
				testDB.FirstOrCreate(&testUser, models.User{Email: "api@example.com"}) // Убедимся, что юзер есть
				return generateTestToken(testUser.ID, testUser.Name, time.Minute*5)
			},
			expectedStatus: http.StatusOK, // Ожидаем, что middleware пропустит и хендлер вернет 200
			expectedError:  "",            // Ошибки нет
		},
		{
			name: "Valid Token in Header",
			setupRequest: func(req *http.Request, token string) {
				req.Header.Set("Authorization", "Bearer "+token)
			},
			tokenGenerator: func() string {
				testDB.FirstOrCreate(&testUser, models.User{Email: "api@example.com"})
				return generateTestToken(testUser.ID, testUser.Name, time.Minute*5)
			},
			expectedStatus: http.StatusOK,
			expectedError:  "",
		},
		{
			name:           "No Token",
			setupRequest:   func(req *http.Request, token string) { /* Ничего не делаем */ },
			tokenGenerator: func() string { return "" },
			expectedStatus: http.StatusUnauthorized,
			expectedError:  "authorization token not found",
		},
		{
			name: "Invalid Token (Malformed)",
			setupRequest: func(req *http.Request, token string) {
				req.AddCookie(&http.Cookie{Name: "jwtToken", Value: "this.is.bad"})
			},
			tokenGenerator: func() string { return "" }, // Токен генерировать не нужно
			expectedStatus: http.StatusUnauthorized,
			expectedError:  "Invalid or expired token", // Обобщенная ошибка от middleware
		},
		{
			name: "Expired Token",
			setupRequest: func(req *http.Request, token string) {
				req.AddCookie(&http.Cookie{Name: "jwtToken", Value: token})
			},
			tokenGenerator: func() string {
				testDB.FirstOrCreate(&testUser, models.User{Email: "api@example.com"})
				return generateTestToken(testUser.ID, testUser.Name, -time.Minute*5) // Истекший токен
			},
			expectedStatus: http.StatusUnauthorized,
			expectedError:  "Invalid or expired token",
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			clearTables()               // Очистка не обязательна, но для консистентности
			router := setupTestRouter() // Роутер с настроенным middleware

			req, _ := http.NewRequest(http.MethodGet, "/api/events", nil) // Запрос к защищенному эндпоинту
			token := tc.tokenGenerator()                                  // Генерируем токен для этого случая
			tc.setupRequest(req, token)                                   // Настраиваем запрос (добавляем токен)

			w := httptest.NewRecorder()
			router.ServeHTTP(w, req)

			assert.Equal(t, tc.expectedStatus, w.Code)

			if tc.expectedStatus != http.StatusOK {
				var responseBody map[string]string
				err := json.Unmarshal(w.Body.Bytes(), &responseBody)
				require.NoError(t, err)
				assert.Contains(t, responseBody["error"], tc.expectedError)
			}
		})
	}
}

// --- Тесты для validateToken (Табличный подход) ---
func TestValidateToken(t *testing.T) {
	type validateTokenTestCase struct {
		name                string
		tokenGenerator      func() string // Функция для генерации токена
		expectError         bool
		expectedErrorSubstr string // Подстрока для проверки в тексте ошибки
		expectedUserID      uint
		expectedName        string
	}

	// Пользователь для генерации валидных токенов
	testUser := models.User{Name: "Token User", Email: "token@example.com", PasswordHash: "hash"}

	testCases := []validateTokenTestCase{
		{
			name: "Valid Token",
			tokenGenerator: func() string {
				testDB.FirstOrCreate(&testUser, models.User{Email: "token@example.com"})
				return generateTestToken(testUser.ID, testUser.Name, time.Minute*5)
			},
			expectError:         false,
			expectedErrorSubstr: "",
			expectedUserID:      testUser.ID, // Ожидаем ID созданного юзера
			expectedName:        testUser.Name,
		},
		{
			name: "Expired Token",
			tokenGenerator: func() string {
				testDB.FirstOrCreate(&testUser, models.User{Email: "token@example.com"})
				return generateTestToken(testUser.ID, testUser.Name, -time.Minute*5) // Истекший
			},
			expectError:         true,
			expectedErrorSubstr: "token expired or not active yet",
		},
		{
			name: "Invalid Signature",
			tokenGenerator: func() string {
				testDB.FirstOrCreate(&testUser, models.User{Email: "token@example.com"})
				token := generateTestToken(testUser.ID, testUser.Name, time.Minute*5)
				return token + "x" // Портим подпись
			},
			expectError:         true,
			expectedErrorSubstr: "invalid token signature", // Ошибка парсинга/подписи
		},
		{
			name:                "Malformed Token",
			tokenGenerator:      func() string { return "this.is.not.valid" },
			expectError:         true,
			expectedErrorSubstr: "malformed token",
		},
		{
			name: "Token with wrong secret", // Симуляция неверного секрета
			tokenGenerator: func() string {
				testDB.FirstOrCreate(&testUser, models.User{Email: "token@example.com"})
				wrongSecret := []byte("another_secret_key_different")
				token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
					"user_id": float64(testUser.ID),
					"name":    testUser.Name,
					"exp":     time.Now().Add(time.Minute * 5).Unix(),
				})
				tokenString, _ := token.SignedString(wrongSecret) // Подписываем не тем секретом
				return tokenString
			},
			expectError:         true,
			expectedErrorSubstr: "invalid token signature", // Ожидаем ошибку подписи
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			clearTables() // Очистка для FirstOrCreate
			tokenString := tc.tokenGenerator()
			claims, err := validateToken(tokenString)

			if tc.expectError {
				assert.Error(t, err)
				if tc.expectedErrorSubstr != "" {
					assert.ErrorContains(t, err, tc.expectedErrorSubstr)
				}
				assert.Nil(t, claims)
			} else {
				assert.NoError(t, err)
				assert.NotNil(t, claims)
				// Проверяем claims только для валидного случая
				if tc.expectedUserID > 0 {
					assert.Equal(t, float64(tc.expectedUserID), claims["user_id"])
				}
				if tc.expectedName != "" {
					assert.Equal(t, tc.expectedName, claims["name"])
				}

			}
		})
	}
}
