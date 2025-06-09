# Todo Calendar 📅

Todo Calendar is a full-stack web application designed for managing personal tasks and events within an interactive calendar interface. It was developed as a group project, featuring a Go backend and a responsive frontend built with vanilla JavaScript and the FullCalendar.js library.

The application allows users to register and log in to manage their own schedules, create custom categories for tasks, and view their to-do items in various calendar layouts (monthly, weekly, daily).

## ✨ Features

This project successfully implements all the core and bonus requirements:

* **Secure User Authentication**:
    * User registration  and login functionality.
    * Password hashing using `bcrypt` for secure storage.
    * JWT (JSON Web Tokens) for managing user sessions securely, sent via HttpOnly cookies.
* **Dynamic Event & Task Management (CRUD)**:
    * **Create**: Add new tasks or events, specifying title, description, date, and time. Events can be set as "all-day".
    * **Read**: View all events on an interactive calendar. Events are fetched dynamically based on the displayed date range.
    * **Update**: Edit existing tasks by clicking on them in the calendar. Event details can be modified and saved. Events can be dragged and dropped to change their date/time.
    * **Delete**: Remove tasks that are no longer needed.
    * **Completion**: Mark tasks as completed, which visually distinguishes them on the calendar.
* **Categorization**:
    * Users can create their own color-coded categories for organizing tasks.
    * Full CRUD functionality for categories (create, read, delete ).
    * Events can be assigned to a category.
    * The calendar can be filtered to show events from only one category.
* **Interactive & User-Friendly Frontend**:
    * Built with modern JavaScript (ES6 modules)  and the **FullCalendar.js** library.
    * Multiple views are available: **Month** (`dayGridMonth`), **Week** (list view as "Upcoming" - `listWeek`), and **Day** (`timeGridDay`).
    * A responsive design that supports both **desktop** and **mobile** screens.
    * A landing page for new users  and a custom 404 error page.
    * User feedback is provided for actions (e.g., successful registration) and errors (e.g., invalid login credentials ).
* **Robust Backend**:
    * Built with **Go**  and the high-performance **Gin** web framework.
    * **GORM** is used as an ORM for seamless interaction with the **SQLite** database.
    * A well-defined RESTful API with appropriate HTTP status codes for all responses (e.g., `201 Created`, `401 Unauthorized`, `404 Not Found`, `409 Conflict` ).
* **Comprehensive Testing**:
    * The backend includes a suite of unit and integration tests for critical components like authentication handlers and middleware.
    * Tests use an in-memory SQLite database for speed and isolation.

## 🛠️ Tech Stack

| Area       | Technologies Used                                                                                             |
| :--------- | :------------------------------------------------------------------------------------------------------------ |
| **Backend** | Go, Gin, GORM, SQLite, `golang-jwt/jwt`, `bcrypt`       |
| **Frontend** | JavaScript (ES6+), FullCalendar.js, HTML5, CSS3                      |
| **Database** | SQLite 3                                                                                             |
| **Tooling** | Webpack, PostCSS, Babel, Go Modules, `testify`           |

## 🚀 Getting Started

### Prerequisites

* Go (version 1.18 or higher)
* A modern web browser (e.g., Chrome, Firefox)

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd todo-calendar
    ```

2.  **Configure Environment Variables:**
    Create a file named `.env` in the root of the project directory. It is used to store the JWT secret key and the server port.
    ```env
    # A strong, random secret key for signing JWT tokens
    JWT_SECRET="your_super_secret_and_long_key_here"

    # The port the server will run on (defaults to 8080 if not set)
    PORT="8080"
    ```

3.  **Install Go Dependencies:**
    Download the required Go modules.
    ```bash
    go mod tidy
    ```

4.  **Run the Backend Server:**
    ```bash
    go run ./cmd/api
    ```
    You should see output indicating the server has started, similar to:
    ```
    Server starting on http://localhost:8080
    ```

5.  **Access the Application:**
    Open your web browser and navigate to `http://localhost:8080`.

## 🧪 Running Tests

The project includes a suite of tests for the backend API. To run them, execute the following command in the root directory:

```bash
go test -v ./cmd/api/...
```
The tests run against a clean, in-memory SQLite database and do not affect the main `calendar.db` file.

---
## 🏗️ Project Structure

The project is organized into logical directories for clear separation of concerns.
```
.
├── cmd/api/         # Main application entry point and tests
│   ├── main.go
│   └── main_test.go
├── internal/        # Internal application logic
│   └── models/
│       └── models.go  # Database models (User, Event, Category) 
├── static/          # All frontend assets
│   ├── src/           # Source JavaScript and CSS files 
│   └── dist/          # Compiled/Bundled output for the frontend 
├── go.mod           # Go module definitions
├── go.sum
└── README.md        # This file
```
---
## 🔐 API Endpoints

All API endpoints are prefixed with `/api`. Protected endpoints require a valid JWT token in an HttpOnly cookie (`jwtToken`) or an `Authorization: Bearer <token>` header.

| Method | Endpoint | Protected | Description |
| :--- | :--- | :---: | :--- |
| **Auth** | | | |
| `POST` | `/register` | No | Registers a new user.  |
| `POST` | `/login` | No | Authenticates a user and returns a JWT in a cookie.  |
| `POST` | `/logout` | No | Clears the JWT cookie to log the user out.  |
| **Categories** | | | |
| `POST` | `/categories` | **Yes** | Creates a new category for the logged-in user.  |
| `GET` | `/categories` | **Yes** | Retrieves a list of all categories for the logged-in user.  |
| `DELETE` | `/categories/:id` | **Yes** | Deletes a category by its ID.  |
| **Events** | | | |
| `POST` | `/events` | **Yes** | Creates a new event.  |
| `GET` | `/events` | **Yes** | Gets all events for a user within a given time range.  |
| `GET` | `/events/:id` | **Yes** | Retrieves a single event by its ID.  |
| `PUT` | `/events/:id` | **Yes** | Updates an existing event by its ID.  |
| `DELETE` | `/events/:id` | **Yes** | Deletes an event by its ID.  |
