/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/modules/apiService.js":
/*!***********************************!*\
  !*** ./src/modules/apiService.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ApiService: () => (/* binding */ ApiService)
/* harmony export */ });
/* harmony import */ var _loader_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./loader.js */ "./src/modules/loader.js");
/* harmony import */ var _domUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./domUtils.js */ "./src/modules/domUtils.js");



const ApiService = (() => {
  const API_BASE = "/api";

  async function handleRequest(url, method, data) {
    try {
      _loader_js__WEBPACK_IMPORTED_MODULE_0__.Loader.toggle(true);
      const response = await fetch(`${API_BASE}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: data ? JSON.stringify(data) : undefined,
      });

      if (response.status === 401) {
        window.location.href = "/login?reason=unauthenticated";
        return;
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Request failed");
      }
      return responseData;
    } catch (error) {
      _domUtils_js__WEBPACK_IMPORTED_MODULE_1__.DomUtils.showError(error.message);
      throw error;
    } finally {
      _loader_js__WEBPACK_IMPORTED_MODULE_0__.Loader.toggle(false);
    }
  }

  return {
    // Task-related endpoints
    createTask: (task) => handleRequest("/tasks", "POST", task),
    updateTask: (id, task) => handleRequest(`/tasks/${id}`, "PUT", task),
    deleteTask: (id) => handleRequest(`/tasks/${id}`, "DELETE"),
    fetchTasks: () => handleRequest("/tasks", "GET"),
    // Category-related endpoints
    createCategory: (category) =>
      handleRequest("/categories", "POST", category),
    fetchCategories: () => handleRequest("/categories", "GET"),
    deleteCategory: (id) => handleRequest(`/categories/${id}`, "DELETE"),
    clearCategoryFromTasks: (categoryName) =>
      handleRequest(`/tasks/clear-category/${categoryName}`, "PATCH"),
  };
})();


/***/ }),

/***/ "./src/modules/auth.js":
/*!*****************************!*\
  !*** ./src/modules/auth.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Auth: () => (/* binding */ Auth)
/* harmony export */ });
/* harmony import */ var _loader_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./loader.js */ "./src/modules/loader.js");
/* harmony import */ var _domUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./domUtils.js */ "./src/modules/domUtils.js");



const Auth = (() => {
  document.addEventListener("DOMContentLoaded", () => {
    if (window.location.pathname === "/login") {
      init();
      checkRedirectReason();
    }
  });

  function init() {
    const form = document.getElementById("authForm");
    if (!form) return console.error("Auth form not found!");

    form.addEventListener("submit", handleSubmit);
    switchMode("login");
    document.querySelectorAll("[data-mode]").forEach((tab) =>
      tab.addEventListener("click", () => {
        switchMode(tab.dataset.mode);
      })
    );
  }

  function switchMode(mode) {
    const nameField = document.getElementById("nameField");
    const submitBtn = document.querySelector('#authForm button[type="submit"]');
    const passwordInput = document.getElementById("password");
    const tabs = document.querySelectorAll(".tab");

    if (nameField) {
      nameField.style.display = mode === "register" ? "block" : "none";
      document.getElementById("name").required = mode === "register";
    }
    tabs.forEach((tab) =>
      tab.classList.toggle("active", tab.dataset.mode === mode)
    );
    if (submitBtn)
      submitBtn.textContent = mode === "login" ? "Login" : "Register";
    if (passwordInput)
      passwordInput.autocomplete =
        mode === "login" ? "current-password" : "new-password";

    _domUtils_js__WEBPACK_IMPORTED_MODULE_1__.DomUtils.clearMessages();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    _domUtils_js__WEBPACK_IMPORTED_MODULE_1__.DomUtils.clearMessages();
    _loader_js__WEBPACK_IMPORTED_MODULE_0__.Loader.toggle(true);

    const isLogin = document
      .querySelector('[data-mode="login"]')
      .classList.contains("active");
    const url = isLogin ? "/api/login" : "/api/register";
    const formData = {
      email: getVal("email"),
      password: getVal("password"),
    };

    if (!isLogin) formData.name = getVal("name");

    try {
      validate(formData, isLogin);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(formData),
      });
      await handleResponse(response, isLogin);
    } catch (err) {
      _domUtils_js__WEBPACK_IMPORTED_MODULE_1__.DomUtils.showError(err.message || "Unexpected error during submission.");
    } finally {
      _loader_js__WEBPACK_IMPORTED_MODULE_0__.Loader.toggle(false);
    }
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value.trim() : "";
  }

  function validate(data, isLogin) {
    const errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!data.email) errors.push("Email is required.");
    else if (!emailRegex.test(data.email)) errors.push("Invalid email format.");
    if (!data.password) errors.push("Password is required.");
    else if (data.password.length < 8 && !isLogin)
      errors.push("Password must be at least 8 characters.");
    if (!isLogin && (!data.name || data.name.length < 2))
      errors.push("Name must be at least 2 characters.");

    if (errors.length) throw new Error(errors.join("\n"));
  }

  async function handleResponse(response, isLogin) {
    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");
    const data = isJson
      ? await response.json()
      : { message: await response.text() };

    if (!response.ok)
      throw new Error(data.error || `Error: ${response.status}`);

    if (isLogin) {
      localStorage.setItem("user", JSON.stringify(data.user || {}));
      window.location.href = "/app";
    } else {
      _domUtils_js__WEBPACK_IMPORTED_MODULE_1__.DomUtils.showSuccess(
        data.message || "Registration successful. Please login."
      );
      switchMode("login");
      ["email", "password", "name"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.value = "";
      });
    }
  }

  function checkRedirectReason() {
    const reason = new URLSearchParams(location.search).get("reason");
    const messages = {
      unauthenticated: "Please log in to access the application.",
      invalid_token: "Session expired. Please log in again.",
      bad_token_claims: "Session data issue. Please log in again.",
    };
    if (reason && messages[reason]) _domUtils_js__WEBPACK_IMPORTED_MODULE_1__.DomUtils.showError(messages[reason]);
    history.replaceState(null, "", location.pathname);
  }

  return { init };
})();


/***/ }),

/***/ "./src/modules/calendar.js":
/*!*********************************!*\
  !*** ./src/modules/calendar.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Todo: () => (/* binding */ Todo)
/* harmony export */ });
/* harmony import */ var _category_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./category.js */ "./src/modules/category.js");
/* harmony import */ var _apiService_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./apiService.js */ "./src/modules/apiService.js");

 // Import ApiService

const Todo = (() => {
  let currentEditingTask = null;
  let isEditing = false;

  // Local Storage Service
  const LocalStorageService = {
    getTasks() {
      const tasks = localStorage.getItem("tasks");
      return tasks ? JSON.parse(tasks) : [];
    },
    saveTask(task) {
      const tasks = this.getTasks();
      tasks.push(task);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      return task;
    },
    updateTask(id, updatedTask) {
      const tasks = this.getTasks();
      const index = tasks.findIndex((t) => t.id === id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updatedTask };
        localStorage.setItem("tasks", JSON.stringify(tasks));
        return tasks[index];
      }
      return null;
    },
    deleteTask(id) {
      const tasks = this.getTasks();
      const updatedTasks = tasks.filter((t) => t.id !== id);
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    },
    generateId() {
      return "local_" + Math.random().toString(36).substr(2, 9); // Simple unique ID for local tasks
    },
  };
  if (window.location.pathname === "/app") {
    document.addEventListener("DOMContentLoaded", function () {
      const form = document.getElementById("task-form");
      const formHeading = document.getElementById("form-heading");
      const submitButton = document.getElementById("submit-button");
      const deleteButton = document.getElementById("delete-button");
      const cancelButton = document.getElementById("cancel-button");
      const addTaskButton = document.querySelector(
        ".content-header-container > button"
      );
      const allDayCheckbox = document.getElementById("allDay");
      const timeInputs = document.getElementById("timeInputs");

      // Toggle time inputs based on All Day checkbox
      allDayCheckbox.addEventListener("change", () => {
        timeInputs.style.display = allDayCheckbox.checked ? "none" : "flex";
        if (allDayCheckbox.checked) {
          document.getElementById("startTime").value = "";
          document.getElementById("endTime").value = "";
        }
      });

      // Calendar initialization
      const calendarEl = document.getElementById("calendar");
      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        editable: true,
        selectable: true,
        selectMirror: true,
        dayMaxEvents: true,
        events: [], // Initialize empty, populate via fetchTasks
        eventClick: function (info) {
          currentEditingTask = info.event;
          isEditing = true;
          populateForm(info.event);
          updateFormUI();
        },
        eventDidMount: function (info) {
          const isCompleted = info.event.extendedProps.completed;
          if (isCompleted) {
            info.el.style.backgroundColor = "#d3d3d3";
            info.el.style.textDecoration = "line-through";
            info.el.style.opacity = "0.7";
          }

          // Apply category color (handled by Category module)
          const category = info.event.extendedProps.category;
          if (category && category !== "None") {
            const cat = _category_js__WEBPACK_IMPORTED_MODULE_0__.Category.getCategories().find(
              (c) => c.name === category
            );
            if (cat) {
              info.el.style.borderLeft = `4px solid ${cat.color}`;
            }
          } else {
            info.el.style.borderLeft = "4px solid transparent";
          }
        },
      });

      // Fetch tasks from API or localStorage and render calendar
      async function initializeCalendar() {
        try {
          const tasks = await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.fetchTasks();
          tasks.forEach((task) => calendar.addEvent(task));
          // Save server tasks to localStorage as backup
          localStorage.setItem("tasks", JSON.stringify(tasks));
        } catch (error) {
          console.warn("Server unavailable, using localStorage:", error);
          const localTasks = LocalStorageService.getTasks();
          localTasks.forEach((task) => calendar.addEvent(task));
        }
        calendar.render();
      }

      initializeCalendar();

      // Event Listeners
      addTaskButton.addEventListener("click", () => {
        isEditing = false;
        currentEditingTask = null;
        form.reset();
        allDayCheckbox.checked = false;
        timeInputs.style.display = "flex";
        updateFormUI();
      });

      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        const formData = getFormData();

        try {
          if (isEditing) {
            await updateTask(formData);
          } else {
            await createTask(formData);
          }
          form.reset();
          allDayCheckbox.checked = false;
          timeInputs.style.display = "flex";
          updateFormUI();
        } catch (error) {
          console.error("Failed to save task:", error);
        }
      });

      deleteButton.addEventListener("click", async () => {
        if (currentEditingTask) {
          try {
            await deleteTask(currentEditingTask.id);
            currentEditingTask.remove();
            form.reset();
            isEditing = false;
            currentEditingTask = null;
            updateFormUI();
          } catch (error) {
            console.error("Failed to delete task:", error);
          }
        }
      });

      cancelButton.addEventListener("click", () => {
        form.reset();
        isEditing = false;
        currentEditingTask = null;
        allDayCheckbox.checked = false;
        timeInputs.style.display = "flex";
        updateFormUI();
      });

      // Helper functions
      function updateFormUI() {
        if (isEditing) {
          formHeading.textContent = "Edit Task";
          submitButton.textContent = "Save Changes";
          deleteButton.classList.remove("hidden");
          cancelButton.classList.remove("hidden");
          addTaskButton.disabled = true;
        } else {
          formHeading.textContent = "Add New Task";
          submitButton.textContent = "Add Task";
          deleteButton.classList.add("hidden");
          cancelButton.classList.add("hidden");
          addTaskButton.disabled = false;
        }
      }

      function populateForm(event) {
        document.getElementById("title").value = event.title;
        document.getElementById("taskDate").value = event.startStr.substring(
          0,
          10
        );
        const allDay = event.allDay;
        allDayCheckbox.checked = allDay;
        timeInputs.style.display = allDay ? "none" : "flex";

        // Handle time inputs for non-all-day events
        if (!allDay) {
          const startDate = new Date(event.start);
          const endDate = new Date(event.end || event.start);
          document.getElementById("startTime").value = startDate
            .toTimeString()
            .substring(0, 5);
          document.getElementById("endTime").value = endDate
            .toTimeString()
            .substring(0, 5);
        } else {
          document.getElementById("startTime").value = "";
          document.getElementById("endTime").value = "";
        }

        document.getElementById("description").value =
          event.extendedProps.description || "";
        document.getElementById("priority").value =
          event.extendedProps.priority || "low";
        document.getElementById("category").value =
          event.extendedProps.category || "None";
        document.getElementById("completed").checked =
          event.extendedProps.completed || false;
      }

      function getFormData() {
        const categoryValue = document.getElementById("category").value;
        const allDay = document.getElementById("allDay").checked;
        const date = document.getElementById("taskDate").value;
        let start, end;

        if (allDay) {
          start = date;
          end = date;
        } else {
          const startTime = document.getElementById("startTime").value;
          const endTime = document.getElementById("endTime").value;
          start = startTime ? `${date}T${startTime}` : date;
          end = endTime ? `${date}T${endTime}` : start;
        }

        return {
          id: isEditing ? currentEditingTask.id : undefined, // ID is managed by server or localStorage
          title: document.getElementById("title").value,
          start: start,
          end: end,
          allDay: allDay,
          description: document.getElementById("description").value,
          priority: document.getElementById("priority").value,
          category: categoryValue === "None" ? null : categoryValue,
          completed: document.getElementById("completed").checked,
          className: `priority-${document.getElementById("priority").value} ${
            document.getElementById("completed").checked ? "completed-task" : ""
          }`,
        };
      }

      async function createTask(data) {
        try {
          const newTask = await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.createTask(data);
          calendar.addEvent(newTask);
          // Save to localStorage as backup
          LocalStorageService.saveTask(newTask);
          return newTask;
        } catch (error) {
          console.warn("Server unavailable, saving to localStorage:", error);
          const localTask = { ...data, id: LocalStorageService.generateId() };
          LocalStorageService.saveTask(localTask);
          calendar.addEvent(localTask);
          return localTask;
        }
      }

      async function updateTask(data) {
        try {
          const updatedTask = await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.updateTask(data.id, data);
          currentEditingTask.remove();
          calendar.addEvent(updatedTask);
          // Update localStorage as backup
          LocalStorageService.updateTask(data.id, updatedTask);
          return updatedTask;
        } catch (error) {
          console.warn("Server unavailable, updating in localStorage:", error);
          const updatedTask = LocalStorageService.updateTask(data.id, data);
          if (updatedTask) {
            currentEditingTask.remove();
            calendar.addEvent(updatedTask);
            return updatedTask;
          }
          throw new Error("Task not found in localStorage");
        }
      }

      async function deleteTask(id) {
        try {
          await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.deleteTask(id);
          // Update localStorage
          LocalStorageService.deleteTask(id);
        } catch (error) {
          console.warn(
            "Server unavailable, deleting from localStorage:",
            error
          );
          LocalStorageService.deleteTask(id);
        }
      }
    });
  }
  return {
    // Expose methods if needed by Category module
  };
})();

/***/ }),

/***/ "./src/modules/category.js":
/*!*********************************!*\
  !*** ./src/modules/category.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Category: () => (/* binding */ Category)
/* harmony export */ });
/* harmony import */ var _apiService_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./apiService.js */ "./src/modules/apiService.js");


const Category = (() => {
  let categories = [
    { id: "default_1", name: "Personal", color: "#f56565" },
    { id: "default_2", name: "Work", color: "#63b3ed" },
    { id: "default_3", name: "Category 1", color: "#f6e05e" },
  ];

  // Local Storage Service for Categories
  const LocalStorageService = {
    getCategories() {
      const categories = localStorage.getItem("categories");
      return categories ? JSON.parse(categories) : [];
    },
    saveCategory(category) {
      const categories = this.getCategories();
      categories.push(category);
      localStorage.setItem("categories", JSON.stringify(categories));
      return category;
    },
    deleteCategory(id) {
      const categories = this.getCategories();
      const updatedCategories = categories.filter((c) => c.id !== id);
      localStorage.setItem("categories", JSON.stringify(updatedCategories));
      // Update tasks to clear deleted category
      this.clearCategoryFromTasks(id);
    },
    clearCategoryFromTasks(categoryId) {
      const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
      const updatedTasks = tasks.map((task) => {
        if (task.category === categoryId) {
          return { ...task, category: null };
        }
        return task;
      });
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    },
    generateId() {
      return "local_cat_" + Math.random().toString(36).substr(2, 9); // Simple unique ID for local categories
    },
  };

  // Helper functions defined outside DOMContentLoaded
  function renderCategories() {
    const categoriesContainer = document.getElementById("categories-container");
    const addNewCategoryBtn = document.getElementById("add-new-category-btn");
    const newCategoryForm = document.getElementById("new-category-form");

    categoriesContainer.innerHTML = "";

    categories.forEach((category, index) => {
      const li = document.createElement("li");
      li.className = "category-item";
      li.innerHTML = `
          <div class="category-content">
            <span class="category-color" style="background-color: ${category.color};"></span> 
            <span class="category-name">${category.name}</span>
          </div>
          <button class="delete-category-btn" data-id="${category.id}">
            <i class="fas fa-trash"></i>
          </button>
        `;
      categoriesContainer.appendChild(li);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-category-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        deleteCategory(id);
      });
    });

    // Add the "Add New Category" button and form back
    categoriesContainer.appendChild(addNewCategoryBtn);
    categoriesContainer.appendChild(newCategoryForm);
  }

  function updateCategorySelect() {
    const categorySelect = document.getElementById("category");
    categorySelect.innerHTML = "";

    // Add "None" option first
    const noneOption = document.createElement("option");
    noneOption.value = "None";
    noneOption.textContent = "None";
    categorySelect.appendChild(noneOption);

    // Add all category options
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category.name;
      option.textContent = category.name;
      categorySelect.appendChild(option);
    });
  }

  async function deleteCategory(id) {
    const index = categories.findIndex((c) => c.id === id);
    if (index >= 0) {
      try {
        const deletedCategoryName = categories[index].name;
        // Delete category via API
        await _apiService_js__WEBPACK_IMPORTED_MODULE_0__.ApiService.deleteCategory(id);
        categories.splice(index, 1);
        // Update tasks via API
        await _apiService_js__WEBPACK_IMPORTED_MODULE_0__.ApiService.clearCategoryFromTasks(deletedCategoryName);
        // Update localStorage as backup
        LocalStorageService.deleteCategory(id);
      } catch (error) {
        console.warn("Server unavailable, deleting from localStorage:", error);
        // Delete from local categories
        categories.splice(index, 1);
        LocalStorageService.deleteCategory(id);
      }
      renderCategories();
      updateCategorySelect();
    }
  }
  if (window.location.pathname === "/app") {
    document.addEventListener("DOMContentLoaded", function () {
      const categorySelect = document.getElementById("category");
      const categoriesContainer = document.getElementById(
        "categories-container"
      );
      const addNewCategoryBtn = document.getElementById("add-new-category-btn");
      const newCategoryForm = document.getElementById("new-category-form");
      const createCategoryBtn = document.getElementById("create-category-btn");

      // Fetch categories from API or localStorage
      async function initializeCategories() {
        try {
          categories = await _apiService_js__WEBPACK_IMPORTED_MODULE_0__.ApiService.fetchCategories();
          renderCategories();
          updateCategorySelect();
          // Save server categories to localStorage as backup
          localStorage.setItem("categories", JSON.stringify(categories));
        } catch (error) {
          console.warn("Server unavailable, using localStorage:", error);
          categories = LocalStorageService.getCategories();
          renderCategories();
          updateCategorySelect();
        }
      }

      initializeCategories();

      // Category management
      addNewCategoryBtn.addEventListener("click", () => {
        newCategoryForm.style.display =
          newCategoryForm.style.display === "none" ? "flex" : "none";
      });

      createCategoryBtn.addEventListener("click", async () => {
        const name = document.getElementById("new-category-name").value.trim();
        const color = document.getElementById("new-category-color").value;

        if (name) {
          const newCategory = {
            id: LocalStorageService.generateId(),
            name,
            color,
          };
          try {
            // Add new category via API
            const apiCategory = await _apiService_js__WEBPACK_IMPORTED_MODULE_0__.ApiService.createCategory({
              name,
              color,
            });
            categories.push(apiCategory);
            // Save to localStorage as backup
            LocalStorageService.saveCategory(apiCategory);
          } catch (error) {
            console.warn("Server unavailable, saving to localStorage:", error);
            categories.push(newCategory);
            LocalStorageService.saveCategory(newCategory);
          }
          renderCategories();
          updateCategorySelect();

          // Reset form
          document.getElementById("new-category-name").value = "";
          document.getElementById("new-category-color").value = "#cccccc";
          newCategoryForm.style.display = "none";
        }
      });
    });
  }
  return {
    getCategories: () => categories,
    renderCategories,
    updateCategorySelect,
  };
})();

/***/ }),

/***/ "./src/modules/domUtils.js":
/*!*********************************!*\
  !*** ./src/modules/domUtils.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DomUtils: () => (/* binding */ DomUtils)
/* harmony export */ });
const DomUtils = (() => {
  function clearMessages() {
    const container = document.getElementById("messageContainer");
    if (container) container.innerHTML = "";
    document
      .querySelectorAll(".error-message, .success-message")
      .forEach((el) => {
        if (el.parentNode !== container) el.remove();
      });
  }

  function showMessage(message, type = "error") {
    clearMessages();
    const messageElement = document.createElement("div");
    messageElement.className =
      type === "error" ? "error-message" : "success-message";
    message.split("\n").forEach((line) => {
      const p = document.createElement("p");
      p.textContent = line;
      messageElement.appendChild(p);
    });

    const container = document.getElementById("messageContainer");
    if (container) {
      container.appendChild(messageElement);
    } else {
      const form = document.getElementById("authForm");
      form
        ? form.parentNode.insertBefore(messageElement, form)
        : document.body.prepend(messageElement);
    }
  }

  return {
    clearMessages,
    showError: (msg) => showMessage(msg, "error"),
    showSuccess: (msg) => showMessage(msg, "success"),
  };
})();


/***/ }),

/***/ "./src/modules/loader.js":
/*!*******************************!*\
  !*** ./src/modules/loader.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Loader: () => (/* binding */ Loader)
/* harmony export */ });
const Loader = (() => {
  function toggle(show) {
    let loader = document.getElementById("loader");
    if (!loader && show) loader = create();
    if (loader) loader.style.display = show ? "flex" : "none";
  }

  function create() {
    const loader = document.createElement("div");
    loader.id = "loader";
    loader.className = "loader";
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
    return loader;
  }

  return { toggle };
})();


/***/ }),

/***/ "./src/modules/user.js":
/*!*****************************!*\
  !*** ./src/modules/user.js ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   User: () => (/* binding */ User)
/* harmony export */ });
/* harmony import */ var _loader_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./loader.js */ "./src/modules/loader.js");
/* harmony import */ var _domUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./domUtils.js */ "./src/modules/domUtils.js");



const User = (() => {
  async function logout() {
    console.log("Attempting logout...");
    _loader_js__WEBPACK_IMPORTED_MODULE_0__.Loader.toggle(true);
    try {
      const response = await fetch("/api/logout", {
        method: "POST",
        headers: { Accept: "application/json" },
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(
          data.error || `Logout failed with status: ${response.status}`
        );
      console.log("Logout successful via API.");
    } catch (error) {
      console.error("Logout API call failed:", error);
      _domUtils_js__WEBPACK_IMPORTED_MODULE_1__.DomUtils.showError(
        "Could not properly log out. Clear cookies manually if needed."
      );
    } finally {
      localStorage.removeItem("user");
      _loader_js__WEBPACK_IMPORTED_MODULE_0__.Loader.toggle(false);
      window.location.href = "/login";
    }
  }

  function displayUserData() {
    const userDataString = localStorage.getItem("user");
    if (!userDataString) return logout();
    try {
      const userData = JSON.parse(userDataString);
      const userName = userData.name || "User";
      const userNameDisplay = document.getElementById("user-name-display");
      if (userNameDisplay) userNameDisplay.textContent = userName;
    } catch (e) {
      console.error("Invalid user data in localStorage.");
      logout();
    }
  }

  return { logout, displayUserData };
})();


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _modules_user_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./modules/user.js */ "./src/modules/user.js");
/* harmony import */ var _modules_auth_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./modules/auth.js */ "./src/modules/auth.js");
/* harmony import */ var _modules_calendar_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./modules/calendar.js */ "./src/modules/calendar.js");




document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname === "/app") {
    _modules_user_js__WEBPACK_IMPORTED_MODULE_0__.User.displayUserData();
  }
  const logoutBtn = document.getElementById("btn-logout");
  if (logoutBtn) logoutBtn.addEventListener("click", _modules_user_js__WEBPACK_IMPORTED_MODULE_0__.User.logout);

  console.log("Main app initialized.");
});

})();

/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Ozs7Ozs7Ozs7O0FDTnlDO0FBQ0E7QUFDSTtBQUM3QztBQUNBO0FBQ0E7QUFDQSxJQUFJLGtEQUFJO0FBQ1I7QUFDQTtBQUNBLHFEQUFxRCxrREFBSTtBQUN6RDtBQUNBO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2FwaVNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvYXV0aC5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9jYWxlbmRhci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9jYXRlZ29yeS5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9kb21VdGlscy5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9sb2FkZXIuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvdXNlci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vc3RhdGljL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTG9hZGVyIH0gZnJvbSBcIi4vbG9hZGVyLmpzXCI7XHJcbmltcG9ydCB7IERvbVV0aWxzIH0gZnJvbSBcIi4vZG9tVXRpbHMuanNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBBcGlTZXJ2aWNlID0gKCgpID0+IHtcclxuICBjb25zdCBBUElfQkFTRSA9IFwiL2FwaVwiO1xyXG5cclxuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVSZXF1ZXN0KHVybCwgbWV0aG9kLCBkYXRhKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBMb2FkZXIudG9nZ2xlKHRydWUpO1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke0FQSV9CQVNFfSR7dXJsfWAsIHtcclxuICAgICAgICBtZXRob2QsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVkZW50aWFsczogXCJpbmNsdWRlXCIsXHJcbiAgICAgICAgYm9keTogZGF0YSA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogdW5kZWZpbmVkLFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwMSkge1xyXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvbG9naW4/cmVhc29uPXVuYXV0aGVudGljYXRlZFwiO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG5cclxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihyZXNwb25zZURhdGEuZXJyb3IgfHwgXCJSZXF1ZXN0IGZhaWxlZFwiKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmVzcG9uc2VEYXRhO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgRG9tVXRpbHMuc2hvd0Vycm9yKGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICB0aHJvdyBlcnJvcjtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIExvYWRlci50b2dnbGUoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIC8vIFRhc2stcmVsYXRlZCBlbmRwb2ludHNcclxuICAgIGNyZWF0ZVRhc2s6ICh0YXNrKSA9PiBoYW5kbGVSZXF1ZXN0KFwiL3Rhc2tzXCIsIFwiUE9TVFwiLCB0YXNrKSxcclxuICAgIHVwZGF0ZVRhc2s6IChpZCwgdGFzaykgPT4gaGFuZGxlUmVxdWVzdChgL3Rhc2tzLyR7aWR9YCwgXCJQVVRcIiwgdGFzayksXHJcbiAgICBkZWxldGVUYXNrOiAoaWQpID0+IGhhbmRsZVJlcXVlc3QoYC90YXNrcy8ke2lkfWAsIFwiREVMRVRFXCIpLFxyXG4gICAgZmV0Y2hUYXNrczogKCkgPT4gaGFuZGxlUmVxdWVzdChcIi90YXNrc1wiLCBcIkdFVFwiKSxcclxuICAgIC8vIENhdGVnb3J5LXJlbGF0ZWQgZW5kcG9pbnRzXHJcbiAgICBjcmVhdGVDYXRlZ29yeTogKGNhdGVnb3J5KSA9PlxyXG4gICAgICBoYW5kbGVSZXF1ZXN0KFwiL2NhdGVnb3JpZXNcIiwgXCJQT1NUXCIsIGNhdGVnb3J5KSxcclxuICAgIGZldGNoQ2F0ZWdvcmllczogKCkgPT4gaGFuZGxlUmVxdWVzdChcIi9jYXRlZ29yaWVzXCIsIFwiR0VUXCIpLFxyXG4gICAgZGVsZXRlQ2F0ZWdvcnk6IChpZCkgPT4gaGFuZGxlUmVxdWVzdChgL2NhdGVnb3JpZXMvJHtpZH1gLCBcIkRFTEVURVwiKSxcclxuICAgIGNsZWFyQ2F0ZWdvcnlGcm9tVGFza3M6IChjYXRlZ29yeU5hbWUpID0+XHJcbiAgICAgIGhhbmRsZVJlcXVlc3QoYC90YXNrcy9jbGVhci1jYXRlZ29yeS8ke2NhdGVnb3J5TmFtZX1gLCBcIlBBVENIXCIpLFxyXG4gIH07XHJcbn0pKCk7XHJcbiIsImltcG9ydCB7IExvYWRlciB9IGZyb20gXCIuL2xvYWRlci5qc1wiO1xyXG5pbXBvcnQgeyBEb21VdGlscyB9IGZyb20gXCIuL2RvbVV0aWxzLmpzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgQXV0aCA9ICgoKSA9PiB7XHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xyXG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvbG9naW5cIikge1xyXG4gICAgICBpbml0KCk7XHJcbiAgICAgIGNoZWNrUmVkaXJlY3RSZWFzb24oKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gaW5pdCgpIHtcclxuICAgIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1dGhGb3JtXCIpO1xyXG4gICAgaWYgKCFmb3JtKSByZXR1cm4gY29uc29sZS5lcnJvcihcIkF1dGggZm9ybSBub3QgZm91bmQhXCIpO1xyXG5cclxuICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBoYW5kbGVTdWJtaXQpO1xyXG4gICAgc3dpdGNoTW9kZShcImxvZ2luXCIpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLW1vZGVdXCIpLmZvckVhY2goKHRhYikgPT5cclxuICAgICAgdGFiLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgc3dpdGNoTW9kZSh0YWIuZGF0YXNldC5tb2RlKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzd2l0Y2hNb2RlKG1vZGUpIHtcclxuICAgIGNvbnN0IG5hbWVGaWVsZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpZWxkXCIpO1xyXG4gICAgY29uc3Qgc3VibWl0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2F1dGhGb3JtIGJ1dHRvblt0eXBlPVwic3VibWl0XCJdJyk7XHJcbiAgICBjb25zdCBwYXNzd29yZElucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXNzd29yZFwiKTtcclxuICAgIGNvbnN0IHRhYnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRhYlwiKTtcclxuXHJcbiAgICBpZiAobmFtZUZpZWxkKSB7XHJcbiAgICAgIG5hbWVGaWVsZC5zdHlsZS5kaXNwbGF5ID0gbW9kZSA9PT0gXCJyZWdpc3RlclwiID8gXCJibG9ja1wiIDogXCJub25lXCI7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZVwiKS5yZXF1aXJlZCA9IG1vZGUgPT09IFwicmVnaXN0ZXJcIjtcclxuICAgIH1cclxuICAgIHRhYnMuZm9yRWFjaCgodGFiKSA9PlxyXG4gICAgICB0YWIuY2xhc3NMaXN0LnRvZ2dsZShcImFjdGl2ZVwiLCB0YWIuZGF0YXNldC5tb2RlID09PSBtb2RlKVxyXG4gICAgKTtcclxuICAgIGlmIChzdWJtaXRCdG4pXHJcbiAgICAgIHN1Ym1pdEJ0bi50ZXh0Q29udGVudCA9IG1vZGUgPT09IFwibG9naW5cIiA/IFwiTG9naW5cIiA6IFwiUmVnaXN0ZXJcIjtcclxuICAgIGlmIChwYXNzd29yZElucHV0KVxyXG4gICAgICBwYXNzd29yZElucHV0LmF1dG9jb21wbGV0ZSA9XHJcbiAgICAgICAgbW9kZSA9PT0gXCJsb2dpblwiID8gXCJjdXJyZW50LXBhc3N3b3JkXCIgOiBcIm5ldy1wYXNzd29yZFwiO1xyXG5cclxuICAgIERvbVV0aWxzLmNsZWFyTWVzc2FnZXMoKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVN1Ym1pdChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBEb21VdGlscy5jbGVhck1lc3NhZ2VzKCk7XHJcbiAgICBMb2FkZXIudG9nZ2xlKHRydWUpO1xyXG5cclxuICAgIGNvbnN0IGlzTG9naW4gPSBkb2N1bWVudFxyXG4gICAgICAucXVlcnlTZWxlY3RvcignW2RhdGEtbW9kZT1cImxvZ2luXCJdJylcclxuICAgICAgLmNsYXNzTGlzdC5jb250YWlucyhcImFjdGl2ZVwiKTtcclxuICAgIGNvbnN0IHVybCA9IGlzTG9naW4gPyBcIi9hcGkvbG9naW5cIiA6IFwiL2FwaS9yZWdpc3RlclwiO1xyXG4gICAgY29uc3QgZm9ybURhdGEgPSB7XHJcbiAgICAgIGVtYWlsOiBnZXRWYWwoXCJlbWFpbFwiKSxcclxuICAgICAgcGFzc3dvcmQ6IGdldFZhbChcInBhc3N3b3JkXCIpLFxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoIWlzTG9naW4pIGZvcm1EYXRhLm5hbWUgPSBnZXRWYWwoXCJuYW1lXCIpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIHZhbGlkYXRlKGZvcm1EYXRhLCBpc0xvZ2luKTtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHtcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgQWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGZvcm1EYXRhKSxcclxuICAgICAgfSk7XHJcbiAgICAgIGF3YWl0IGhhbmRsZVJlc3BvbnNlKHJlc3BvbnNlLCBpc0xvZ2luKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBEb21VdGlscy5zaG93RXJyb3IoZXJyLm1lc3NhZ2UgfHwgXCJVbmV4cGVjdGVkIGVycm9yIGR1cmluZyBzdWJtaXNzaW9uLlwiKTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIExvYWRlci50b2dnbGUoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0VmFsKGlkKSB7XHJcbiAgICBjb25zdCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcclxuICAgIHJldHVybiBlbCA/IGVsLnZhbHVlLnRyaW0oKSA6IFwiXCI7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB2YWxpZGF0ZShkYXRhLCBpc0xvZ2luKSB7XHJcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcclxuICAgIGNvbnN0IGVtYWlsUmVnZXggPSAvXlteXFxzQF0rQFteXFxzQF0rXFwuW15cXHNAXSskLztcclxuXHJcbiAgICBpZiAoIWRhdGEuZW1haWwpIGVycm9ycy5wdXNoKFwiRW1haWwgaXMgcmVxdWlyZWQuXCIpO1xyXG4gICAgZWxzZSBpZiAoIWVtYWlsUmVnZXgudGVzdChkYXRhLmVtYWlsKSkgZXJyb3JzLnB1c2goXCJJbnZhbGlkIGVtYWlsIGZvcm1hdC5cIik7XHJcbiAgICBpZiAoIWRhdGEucGFzc3dvcmQpIGVycm9ycy5wdXNoKFwiUGFzc3dvcmQgaXMgcmVxdWlyZWQuXCIpO1xyXG4gICAgZWxzZSBpZiAoZGF0YS5wYXNzd29yZC5sZW5ndGggPCA4ICYmICFpc0xvZ2luKVxyXG4gICAgICBlcnJvcnMucHVzaChcIlBhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzLlwiKTtcclxuICAgIGlmICghaXNMb2dpbiAmJiAoIWRhdGEubmFtZSB8fCBkYXRhLm5hbWUubGVuZ3RoIDwgMikpXHJcbiAgICAgIGVycm9ycy5wdXNoKFwiTmFtZSBtdXN0IGJlIGF0IGxlYXN0IDIgY2hhcmFjdGVycy5cIik7XHJcblxyXG4gICAgaWYgKGVycm9ycy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcihlcnJvcnMuam9pbihcIlxcblwiKSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXNwb25zZSwgaXNMb2dpbikge1xyXG4gICAgY29uc3QgaXNKc29uID0gcmVzcG9uc2UuaGVhZGVyc1xyXG4gICAgICAuZ2V0KFwiY29udGVudC10eXBlXCIpXHJcbiAgICAgID8uaW5jbHVkZXMoXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xyXG4gICAgY29uc3QgZGF0YSA9IGlzSnNvblxyXG4gICAgICA/IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxyXG4gICAgICA6IHsgbWVzc2FnZTogYXdhaXQgcmVzcG9uc2UudGV4dCgpIH07XHJcblxyXG4gICAgaWYgKCFyZXNwb25zZS5vaylcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGRhdGEuZXJyb3IgfHwgYEVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcclxuXHJcbiAgICBpZiAoaXNMb2dpbikge1xyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInVzZXJcIiwgSlNPTi5zdHJpbmdpZnkoZGF0YS51c2VyIHx8IHt9KSk7XHJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvYXBwXCI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBEb21VdGlscy5zaG93U3VjY2VzcyhcclxuICAgICAgICBkYXRhLm1lc3NhZ2UgfHwgXCJSZWdpc3RyYXRpb24gc3VjY2Vzc2Z1bC4gUGxlYXNlIGxvZ2luLlwiXHJcbiAgICAgICk7XHJcbiAgICAgIHN3aXRjaE1vZGUoXCJsb2dpblwiKTtcclxuICAgICAgW1wiZW1haWxcIiwgXCJwYXNzd29yZFwiLCBcIm5hbWVcIl0uZm9yRWFjaCgoaWQpID0+IHtcclxuICAgICAgICBjb25zdCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcclxuICAgICAgICBpZiAoZWwpIGVsLnZhbHVlID0gXCJcIjtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjaGVja1JlZGlyZWN0UmVhc29uKCkge1xyXG4gICAgY29uc3QgcmVhc29uID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhsb2NhdGlvbi5zZWFyY2gpLmdldChcInJlYXNvblwiKTtcclxuICAgIGNvbnN0IG1lc3NhZ2VzID0ge1xyXG4gICAgICB1bmF1dGhlbnRpY2F0ZWQ6IFwiUGxlYXNlIGxvZyBpbiB0byBhY2Nlc3MgdGhlIGFwcGxpY2F0aW9uLlwiLFxyXG4gICAgICBpbnZhbGlkX3Rva2VuOiBcIlNlc3Npb24gZXhwaXJlZC4gUGxlYXNlIGxvZyBpbiBhZ2Fpbi5cIixcclxuICAgICAgYmFkX3Rva2VuX2NsYWltczogXCJTZXNzaW9uIGRhdGEgaXNzdWUuIFBsZWFzZSBsb2cgaW4gYWdhaW4uXCIsXHJcbiAgICB9O1xyXG4gICAgaWYgKHJlYXNvbiAmJiBtZXNzYWdlc1tyZWFzb25dKSBEb21VdGlscy5zaG93RXJyb3IobWVzc2FnZXNbcmVhc29uXSk7XHJcbiAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZShudWxsLCBcIlwiLCBsb2NhdGlvbi5wYXRobmFtZSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyBpbml0IH07XHJcbn0pKCk7XHJcbiIsImltcG9ydCB7IENhdGVnb3J5IH0gZnJvbSBcIi4vY2F0ZWdvcnkuanNcIjtcclxuaW1wb3J0IHsgQXBpU2VydmljZSB9IGZyb20gXCIuL2FwaVNlcnZpY2UuanNcIjsgLy8gSW1wb3J0IEFwaVNlcnZpY2VcclxuXHJcbmV4cG9ydCBjb25zdCBUb2RvID0gKCgpID0+IHtcclxuICBsZXQgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcclxuICBsZXQgaXNFZGl0aW5nID0gZmFsc2U7XHJcblxyXG4gIC8vIExvY2FsIFN0b3JhZ2UgU2VydmljZVxyXG4gIGNvbnN0IExvY2FsU3RvcmFnZVNlcnZpY2UgPSB7XHJcbiAgICBnZXRUYXNrcygpIHtcclxuICAgICAgY29uc3QgdGFza3MgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInRhc2tzXCIpO1xyXG4gICAgICByZXR1cm4gdGFza3MgPyBKU09OLnBhcnNlKHRhc2tzKSA6IFtdO1xyXG4gICAgfSxcclxuICAgIHNhdmVUYXNrKHRhc2spIHtcclxuICAgICAgY29uc3QgdGFza3MgPSB0aGlzLmdldFRhc2tzKCk7XHJcbiAgICAgIHRhc2tzLnB1c2godGFzayk7XHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidGFza3NcIiwgSlNPTi5zdHJpbmdpZnkodGFza3MpKTtcclxuICAgICAgcmV0dXJuIHRhc2s7XHJcbiAgICB9LFxyXG4gICAgdXBkYXRlVGFzayhpZCwgdXBkYXRlZFRhc2spIHtcclxuICAgICAgY29uc3QgdGFza3MgPSB0aGlzLmdldFRhc2tzKCk7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gdGFza3MuZmluZEluZGV4KCh0KSA9PiB0LmlkID09PSBpZCk7XHJcbiAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcclxuICAgICAgICB0YXNrc1tpbmRleF0gPSB7IC4uLnRhc2tzW2luZGV4XSwgLi4udXBkYXRlZFRhc2sgfTtcclxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInRhc2tzXCIsIEpTT04uc3RyaW5naWZ5KHRhc2tzKSk7XHJcbiAgICAgICAgcmV0dXJuIHRhc2tzW2luZGV4XTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gbnVsbDtcclxuICAgIH0sXHJcbiAgICBkZWxldGVUYXNrKGlkKSB7XHJcbiAgICAgIGNvbnN0IHRhc2tzID0gdGhpcy5nZXRUYXNrcygpO1xyXG4gICAgICBjb25zdCB1cGRhdGVkVGFza3MgPSB0YXNrcy5maWx0ZXIoKHQpID0+IHQuaWQgIT09IGlkKTtcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0YXNrc1wiLCBKU09OLnN0cmluZ2lmeSh1cGRhdGVkVGFza3MpKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZUlkKCkge1xyXG4gICAgICByZXR1cm4gXCJsb2NhbF9cIiArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KTsgLy8gU2ltcGxlIHVuaXF1ZSBJRCBmb3IgbG9jYWwgdGFza3NcclxuICAgIH0sXHJcbiAgfTtcclxuICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9hcHBcIikge1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YXNrLWZvcm1cIik7XHJcbiAgICAgIGNvbnN0IGZvcm1IZWFkaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb3JtLWhlYWRpbmdcIik7XHJcbiAgICAgIGNvbnN0IHN1Ym1pdEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3VibWl0LWJ1dHRvblwiKTtcclxuICAgICAgY29uc3QgZGVsZXRlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZWxldGUtYnV0dG9uXCIpO1xyXG4gICAgICBjb25zdCBjYW5jZWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbmNlbC1idXR0b25cIik7XHJcbiAgICAgIGNvbnN0IGFkZFRhc2tCdXR0b24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxyXG4gICAgICAgIFwiLmNvbnRlbnQtaGVhZGVyLWNvbnRhaW5lciA+IGJ1dHRvblwiXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnN0IGFsbERheUNoZWNrYm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhbGxEYXlcIik7XHJcbiAgICAgIGNvbnN0IHRpbWVJbnB1dHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpbWVJbnB1dHNcIik7XHJcblxyXG4gICAgICAvLyBUb2dnbGUgdGltZSBpbnB1dHMgYmFzZWQgb24gQWxsIERheSBjaGVja2JveFxyXG4gICAgICBhbGxEYXlDaGVja2JveC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcclxuICAgICAgICB0aW1lSW5wdXRzLnN0eWxlLmRpc3BsYXkgPSBhbGxEYXlDaGVja2JveC5jaGVja2VkID8gXCJub25lXCIgOiBcImZsZXhcIjtcclxuICAgICAgICBpZiAoYWxsRGF5Q2hlY2tib3guY2hlY2tlZCkge1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFRpbWVcIikudmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLnZhbHVlID0gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQ2FsZW5kYXIgaW5pdGlhbGl6YXRpb25cclxuICAgICAgY29uc3QgY2FsZW5kYXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FsZW5kYXJcIik7XHJcbiAgICAgIGNvbnN0IGNhbGVuZGFyID0gbmV3IEZ1bGxDYWxlbmRhci5DYWxlbmRhcihjYWxlbmRhckVsLCB7XHJcbiAgICAgICAgaW5pdGlhbFZpZXc6IFwiZGF5R3JpZE1vbnRoXCIsXHJcbiAgICAgICAgaGVhZGVyVG9vbGJhcjoge1xyXG4gICAgICAgICAgbGVmdDogXCJwcmV2LG5leHQgdG9kYXlcIixcclxuICAgICAgICAgIGNlbnRlcjogXCJ0aXRsZVwiLFxyXG4gICAgICAgICAgcmlnaHQ6IFwiZGF5R3JpZE1vbnRoLHRpbWVHcmlkV2Vlayx0aW1lR3JpZERheVwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZWRpdGFibGU6IHRydWUsXHJcbiAgICAgICAgc2VsZWN0YWJsZTogdHJ1ZSxcclxuICAgICAgICBzZWxlY3RNaXJyb3I6IHRydWUsXHJcbiAgICAgICAgZGF5TWF4RXZlbnRzOiB0cnVlLFxyXG4gICAgICAgIGV2ZW50czogW10sIC8vIEluaXRpYWxpemUgZW1wdHksIHBvcHVsYXRlIHZpYSBmZXRjaFRhc2tzXHJcbiAgICAgICAgZXZlbnRDbGljazogZnVuY3Rpb24gKGluZm8pIHtcclxuICAgICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzayA9IGluZm8uZXZlbnQ7XHJcbiAgICAgICAgICBpc0VkaXRpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgcG9wdWxhdGVGb3JtKGluZm8uZXZlbnQpO1xyXG4gICAgICAgICAgdXBkYXRlRm9ybVVJKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBldmVudERpZE1vdW50OiBmdW5jdGlvbiAoaW5mbykge1xyXG4gICAgICAgICAgY29uc3QgaXNDb21wbGV0ZWQgPSBpbmZvLmV2ZW50LmV4dGVuZGVkUHJvcHMuY29tcGxldGVkO1xyXG4gICAgICAgICAgaWYgKGlzQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICAgIGluZm8uZWwuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCIjZDNkM2QzXCI7XHJcbiAgICAgICAgICAgIGluZm8uZWwuc3R5bGUudGV4dERlY29yYXRpb24gPSBcImxpbmUtdGhyb3VnaFwiO1xyXG4gICAgICAgICAgICBpbmZvLmVsLnN0eWxlLm9wYWNpdHkgPSBcIjAuN1wiO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIC8vIEFwcGx5IGNhdGVnb3J5IGNvbG9yIChoYW5kbGVkIGJ5IENhdGVnb3J5IG1vZHVsZSlcclxuICAgICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gaW5mby5ldmVudC5leHRlbmRlZFByb3BzLmNhdGVnb3J5O1xyXG4gICAgICAgICAgaWYgKGNhdGVnb3J5ICYmIGNhdGVnb3J5ICE9PSBcIk5vbmVcIikge1xyXG4gICAgICAgICAgICBjb25zdCBjYXQgPSBDYXRlZ29yeS5nZXRDYXRlZ29yaWVzKCkuZmluZChcclxuICAgICAgICAgICAgICAoYykgPT4gYy5uYW1lID09PSBjYXRlZ29yeVxyXG4gICAgICAgICAgICApO1xyXG4gICAgICAgICAgICBpZiAoY2F0KSB7XHJcbiAgICAgICAgICAgICAgaW5mby5lbC5zdHlsZS5ib3JkZXJMZWZ0ID0gYDRweCBzb2xpZCAke2NhdC5jb2xvcn1gO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpbmZvLmVsLnN0eWxlLmJvcmRlckxlZnQgPSBcIjRweCBzb2xpZCB0cmFuc3BhcmVudFwiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gRmV0Y2ggdGFza3MgZnJvbSBBUEkgb3IgbG9jYWxTdG9yYWdlIGFuZCByZW5kZXIgY2FsZW5kYXJcclxuICAgICAgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZUNhbGVuZGFyKCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBjb25zdCB0YXNrcyA9IGF3YWl0IEFwaVNlcnZpY2UuZmV0Y2hUYXNrcygpO1xyXG4gICAgICAgICAgdGFza3MuZm9yRWFjaCgodGFzaykgPT4gY2FsZW5kYXIuYWRkRXZlbnQodGFzaykpO1xyXG4gICAgICAgICAgLy8gU2F2ZSBzZXJ2ZXIgdGFza3MgdG8gbG9jYWxTdG9yYWdlIGFzIGJhY2t1cFxyXG4gICAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0YXNrc1wiLCBKU09OLnN0cmluZ2lmeSh0YXNrcykpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJTZXJ2ZXIgdW5hdmFpbGFibGUsIHVzaW5nIGxvY2FsU3RvcmFnZTpcIiwgZXJyb3IpO1xyXG4gICAgICAgICAgY29uc3QgbG9jYWxUYXNrcyA9IExvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0VGFza3MoKTtcclxuICAgICAgICAgIGxvY2FsVGFza3MuZm9yRWFjaCgodGFzaykgPT4gY2FsZW5kYXIuYWRkRXZlbnQodGFzaykpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYWxlbmRhci5yZW5kZXIoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaW5pdGlhbGl6ZUNhbGVuZGFyKCk7XHJcblxyXG4gICAgICAvLyBFdmVudCBMaXN0ZW5lcnNcclxuICAgICAgYWRkVGFza0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgIGlzRWRpdGluZyA9IGZhbHNlO1xyXG4gICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzayA9IG51bGw7XHJcbiAgICAgICAgZm9ybS5yZXNldCgpO1xyXG4gICAgICAgIGFsbERheUNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcclxuICAgICAgICB0aW1lSW5wdXRzLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcclxuICAgICAgICB1cGRhdGVGb3JtVUkoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgYXN5bmMgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgY29uc3QgZm9ybURhdGEgPSBnZXRGb3JtRGF0YSgpO1xyXG5cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgaWYgKGlzRWRpdGluZykge1xyXG4gICAgICAgICAgICBhd2FpdCB1cGRhdGVUYXNrKGZvcm1EYXRhKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGF3YWl0IGNyZWF0ZVRhc2soZm9ybURhdGEpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZm9ybS5yZXNldCgpO1xyXG4gICAgICAgICAgYWxsRGF5Q2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgdGltZUlucHV0cy5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XHJcbiAgICAgICAgICB1cGRhdGVGb3JtVUkoKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBzYXZlIHRhc2s6XCIsIGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgZGVsZXRlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgaWYgKGN1cnJlbnRFZGl0aW5nVGFzaykge1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgYXdhaXQgZGVsZXRlVGFzayhjdXJyZW50RWRpdGluZ1Rhc2suaWQpO1xyXG4gICAgICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIGZvcm0ucmVzZXQoKTtcclxuICAgICAgICAgICAgaXNFZGl0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzayA9IG51bGw7XHJcbiAgICAgICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xyXG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBkZWxldGUgdGFzazpcIiwgZXJyb3IpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjYW5jZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICBmb3JtLnJlc2V0KCk7XHJcbiAgICAgICAgaXNFZGl0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcclxuICAgICAgICBhbGxEYXlDaGVja2JveC5jaGVja2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGltZUlucHV0cy5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XHJcbiAgICAgICAgdXBkYXRlRm9ybVVJKCk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gSGVscGVyIGZ1bmN0aW9uc1xyXG4gICAgICBmdW5jdGlvbiB1cGRhdGVGb3JtVUkoKSB7XHJcbiAgICAgICAgaWYgKGlzRWRpdGluZykge1xyXG4gICAgICAgICAgZm9ybUhlYWRpbmcudGV4dENvbnRlbnQgPSBcIkVkaXQgVGFza1wiO1xyXG4gICAgICAgICAgc3VibWl0QnV0dG9uLnRleHRDb250ZW50ID0gXCJTYXZlIENoYW5nZXNcIjtcclxuICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgICAgY2FuY2VsQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgICBhZGRUYXNrQnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZm9ybUhlYWRpbmcudGV4dENvbnRlbnQgPSBcIkFkZCBOZXcgVGFza1wiO1xyXG4gICAgICAgICAgc3VibWl0QnV0dG9uLnRleHRDb250ZW50ID0gXCJBZGQgVGFza1wiO1xyXG4gICAgICAgICAgZGVsZXRlQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgICBjYW5jZWxCdXR0b24uY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICAgIGFkZFRhc2tCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIHBvcHVsYXRlRm9ybShldmVudCkge1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGl0bGVcIikudmFsdWUgPSBldmVudC50aXRsZTtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhc2tEYXRlXCIpLnZhbHVlID0gZXZlbnQuc3RhcnRTdHIuc3Vic3RyaW5nKFxyXG4gICAgICAgICAgMCxcclxuICAgICAgICAgIDEwXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBhbGxEYXkgPSBldmVudC5hbGxEYXk7XHJcbiAgICAgICAgYWxsRGF5Q2hlY2tib3guY2hlY2tlZCA9IGFsbERheTtcclxuICAgICAgICB0aW1lSW5wdXRzLnN0eWxlLmRpc3BsYXkgPSBhbGxEYXkgPyBcIm5vbmVcIiA6IFwiZmxleFwiO1xyXG5cclxuICAgICAgICAvLyBIYW5kbGUgdGltZSBpbnB1dHMgZm9yIG5vbi1hbGwtZGF5IGV2ZW50c1xyXG4gICAgICAgIGlmICghYWxsRGF5KSB7XHJcbiAgICAgICAgICBjb25zdCBzdGFydERhdGUgPSBuZXcgRGF0ZShldmVudC5zdGFydCk7XHJcbiAgICAgICAgICBjb25zdCBlbmREYXRlID0gbmV3IERhdGUoZXZlbnQuZW5kIHx8IGV2ZW50LnN0YXJ0KTtcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLnZhbHVlID0gc3RhcnREYXRlXHJcbiAgICAgICAgICAgIC50b1RpbWVTdHJpbmcoKVxyXG4gICAgICAgICAgICAuc3Vic3RyaW5nKDAsIDUpO1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLnZhbHVlID0gZW5kRGF0ZVxyXG4gICAgICAgICAgICAudG9UaW1lU3RyaW5nKClcclxuICAgICAgICAgICAgLnN1YnN0cmluZygwLCA1KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFRpbWVcIikudmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLnZhbHVlID0gXCJcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVzY3JpcHRpb25cIikudmFsdWUgPVxyXG4gICAgICAgICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5kZXNjcmlwdGlvbiB8fCBcIlwiO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlcIikudmFsdWUgPVxyXG4gICAgICAgICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5wcmlvcml0eSB8fCBcImxvd1wiO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2F0ZWdvcnlcIikudmFsdWUgPVxyXG4gICAgICAgICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5jYXRlZ29yeSB8fCBcIk5vbmVcIjtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbXBsZXRlZFwiKS5jaGVja2VkID1cclxuICAgICAgICAgIGV2ZW50LmV4dGVuZGVkUHJvcHMuY29tcGxldGVkIHx8IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBnZXRGb3JtRGF0YSgpIHtcclxuICAgICAgICBjb25zdCBjYXRlZ29yeVZhbHVlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRlZ29yeVwiKS52YWx1ZTtcclxuICAgICAgICBjb25zdCBhbGxEYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFsbERheVwiKS5jaGVja2VkO1xyXG4gICAgICAgIGNvbnN0IGRhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhc2tEYXRlXCIpLnZhbHVlO1xyXG4gICAgICAgIGxldCBzdGFydCwgZW5kO1xyXG5cclxuICAgICAgICBpZiAoYWxsRGF5KSB7XHJcbiAgICAgICAgICBzdGFydCA9IGRhdGU7XHJcbiAgICAgICAgICBlbmQgPSBkYXRlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0VGltZVwiKS52YWx1ZTtcclxuICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuZFRpbWVcIikudmFsdWU7XHJcbiAgICAgICAgICBzdGFydCA9IHN0YXJ0VGltZSA/IGAke2RhdGV9VCR7c3RhcnRUaW1lfWAgOiBkYXRlO1xyXG4gICAgICAgICAgZW5kID0gZW5kVGltZSA/IGAke2RhdGV9VCR7ZW5kVGltZX1gIDogc3RhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgaWQ6IGlzRWRpdGluZyA/IGN1cnJlbnRFZGl0aW5nVGFzay5pZCA6IHVuZGVmaW5lZCwgLy8gSUQgaXMgbWFuYWdlZCBieSBzZXJ2ZXIgb3IgbG9jYWxTdG9yYWdlXHJcbiAgICAgICAgICB0aXRsZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXRsZVwiKS52YWx1ZSxcclxuICAgICAgICAgIHN0YXJ0OiBzdGFydCxcclxuICAgICAgICAgIGVuZDogZW5kLFxyXG4gICAgICAgICAgYWxsRGF5OiBhbGxEYXksXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXNjcmlwdGlvblwiKS52YWx1ZSxcclxuICAgICAgICAgIHByaW9yaXR5OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5XCIpLnZhbHVlLFxyXG4gICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5VmFsdWUgPT09IFwiTm9uZVwiID8gbnVsbCA6IGNhdGVnb3J5VmFsdWUsXHJcbiAgICAgICAgICBjb21wbGV0ZWQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29tcGxldGVkXCIpLmNoZWNrZWQsXHJcbiAgICAgICAgICBjbGFzc05hbWU6IGBwcmlvcml0eS0ke2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlcIikudmFsdWV9ICR7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29tcGxldGVkXCIpLmNoZWNrZWQgPyBcImNvbXBsZXRlZC10YXNrXCIgOiBcIlwiXHJcbiAgICAgICAgICB9YCxcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcblxyXG4gICAgICBhc3luYyBmdW5jdGlvbiBjcmVhdGVUYXNrKGRhdGEpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgbmV3VGFzayA9IGF3YWl0IEFwaVNlcnZpY2UuY3JlYXRlVGFzayhkYXRhKTtcclxuICAgICAgICAgIGNhbGVuZGFyLmFkZEV2ZW50KG5ld1Rhc2spO1xyXG4gICAgICAgICAgLy8gU2F2ZSB0byBsb2NhbFN0b3JhZ2UgYXMgYmFja3VwXHJcbiAgICAgICAgICBMb2NhbFN0b3JhZ2VTZXJ2aWNlLnNhdmVUYXNrKG5ld1Rhc2spO1xyXG4gICAgICAgICAgcmV0dXJuIG5ld1Rhc2s7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIGNvbnNvbGUud2FybihcIlNlcnZlciB1bmF2YWlsYWJsZSwgc2F2aW5nIHRvIGxvY2FsU3RvcmFnZTpcIiwgZXJyb3IpO1xyXG4gICAgICAgICAgY29uc3QgbG9jYWxUYXNrID0geyAuLi5kYXRhLCBpZDogTG9jYWxTdG9yYWdlU2VydmljZS5nZW5lcmF0ZUlkKCkgfTtcclxuICAgICAgICAgIExvY2FsU3RvcmFnZVNlcnZpY2Uuc2F2ZVRhc2sobG9jYWxUYXNrKTtcclxuICAgICAgICAgIGNhbGVuZGFyLmFkZEV2ZW50KGxvY2FsVGFzayk7XHJcbiAgICAgICAgICByZXR1cm4gbG9jYWxUYXNrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgYXN5bmMgZnVuY3Rpb24gdXBkYXRlVGFzayhkYXRhKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNvbnN0IHVwZGF0ZWRUYXNrID0gYXdhaXQgQXBpU2VydmljZS51cGRhdGVUYXNrKGRhdGEuaWQsIGRhdGEpO1xyXG4gICAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrLnJlbW92ZSgpO1xyXG4gICAgICAgICAgY2FsZW5kYXIuYWRkRXZlbnQodXBkYXRlZFRhc2spO1xyXG4gICAgICAgICAgLy8gVXBkYXRlIGxvY2FsU3RvcmFnZSBhcyBiYWNrdXBcclxuICAgICAgICAgIExvY2FsU3RvcmFnZVNlcnZpY2UudXBkYXRlVGFzayhkYXRhLmlkLCB1cGRhdGVkVGFzayk7XHJcbiAgICAgICAgICByZXR1cm4gdXBkYXRlZFRhc2s7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIGNvbnNvbGUud2FybihcIlNlcnZlciB1bmF2YWlsYWJsZSwgdXBkYXRpbmcgaW4gbG9jYWxTdG9yYWdlOlwiLCBlcnJvcik7XHJcbiAgICAgICAgICBjb25zdCB1cGRhdGVkVGFzayA9IExvY2FsU3RvcmFnZVNlcnZpY2UudXBkYXRlVGFzayhkYXRhLmlkLCBkYXRhKTtcclxuICAgICAgICAgIGlmICh1cGRhdGVkVGFzaykge1xyXG4gICAgICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sucmVtb3ZlKCk7XHJcbiAgICAgICAgICAgIGNhbGVuZGFyLmFkZEV2ZW50KHVwZGF0ZWRUYXNrKTtcclxuICAgICAgICAgICAgcmV0dXJuIHVwZGF0ZWRUYXNrO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVGFzayBub3QgZm91bmQgaW4gbG9jYWxTdG9yYWdlXCIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgYXN5bmMgZnVuY3Rpb24gZGVsZXRlVGFzayhpZCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBhd2FpdCBBcGlTZXJ2aWNlLmRlbGV0ZVRhc2soaWQpO1xyXG4gICAgICAgICAgLy8gVXBkYXRlIGxvY2FsU3RvcmFnZVxyXG4gICAgICAgICAgTG9jYWxTdG9yYWdlU2VydmljZS5kZWxldGVUYXNrKGlkKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS53YXJuKFxyXG4gICAgICAgICAgICBcIlNlcnZlciB1bmF2YWlsYWJsZSwgZGVsZXRpbmcgZnJvbSBsb2NhbFN0b3JhZ2U6XCIsXHJcbiAgICAgICAgICAgIGVycm9yXHJcbiAgICAgICAgICApO1xyXG4gICAgICAgICAgTG9jYWxTdG9yYWdlU2VydmljZS5kZWxldGVUYXNrKGlkKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICByZXR1cm4ge1xyXG4gICAgLy8gRXhwb3NlIG1ldGhvZHMgaWYgbmVlZGVkIGJ5IENhdGVnb3J5IG1vZHVsZVxyXG4gIH07XHJcbn0pKCk7IiwiaW1wb3J0IHsgQXBpU2VydmljZSB9IGZyb20gXCIuL2FwaVNlcnZpY2UuanNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBDYXRlZ29yeSA9ICgoKSA9PiB7XHJcbiAgbGV0IGNhdGVnb3JpZXMgPSBbXHJcbiAgICB7IGlkOiBcImRlZmF1bHRfMVwiLCBuYW1lOiBcIlBlcnNvbmFsXCIsIGNvbG9yOiBcIiNmNTY1NjVcIiB9LFxyXG4gICAgeyBpZDogXCJkZWZhdWx0XzJcIiwgbmFtZTogXCJXb3JrXCIsIGNvbG9yOiBcIiM2M2IzZWRcIiB9LFxyXG4gICAgeyBpZDogXCJkZWZhdWx0XzNcIiwgbmFtZTogXCJDYXRlZ29yeSAxXCIsIGNvbG9yOiBcIiNmNmUwNWVcIiB9LFxyXG4gIF07XHJcblxyXG4gIC8vIExvY2FsIFN0b3JhZ2UgU2VydmljZSBmb3IgQ2F0ZWdvcmllc1xyXG4gIGNvbnN0IExvY2FsU3RvcmFnZVNlcnZpY2UgPSB7XHJcbiAgICBnZXRDYXRlZ29yaWVzKCkge1xyXG4gICAgICBjb25zdCBjYXRlZ29yaWVzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJjYXRlZ29yaWVzXCIpO1xyXG4gICAgICByZXR1cm4gY2F0ZWdvcmllcyA/IEpTT04ucGFyc2UoY2F0ZWdvcmllcykgOiBbXTtcclxuICAgIH0sXHJcbiAgICBzYXZlQ2F0ZWdvcnkoY2F0ZWdvcnkpIHtcclxuICAgICAgY29uc3QgY2F0ZWdvcmllcyA9IHRoaXMuZ2V0Q2F0ZWdvcmllcygpO1xyXG4gICAgICBjYXRlZ29yaWVzLnB1c2goY2F0ZWdvcnkpO1xyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImNhdGVnb3JpZXNcIiwgSlNPTi5zdHJpbmdpZnkoY2F0ZWdvcmllcykpO1xyXG4gICAgICByZXR1cm4gY2F0ZWdvcnk7XHJcbiAgICB9LFxyXG4gICAgZGVsZXRlQ2F0ZWdvcnkoaWQpIHtcclxuICAgICAgY29uc3QgY2F0ZWdvcmllcyA9IHRoaXMuZ2V0Q2F0ZWdvcmllcygpO1xyXG4gICAgICBjb25zdCB1cGRhdGVkQ2F0ZWdvcmllcyA9IGNhdGVnb3JpZXMuZmlsdGVyKChjKSA9PiBjLmlkICE9PSBpZCk7XHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwiY2F0ZWdvcmllc1wiLCBKU09OLnN0cmluZ2lmeSh1cGRhdGVkQ2F0ZWdvcmllcykpO1xyXG4gICAgICAvLyBVcGRhdGUgdGFza3MgdG8gY2xlYXIgZGVsZXRlZCBjYXRlZ29yeVxyXG4gICAgICB0aGlzLmNsZWFyQ2F0ZWdvcnlGcm9tVGFza3MoaWQpO1xyXG4gICAgfSxcclxuICAgIGNsZWFyQ2F0ZWdvcnlGcm9tVGFza3MoY2F0ZWdvcnlJZCkge1xyXG4gICAgICBjb25zdCB0YXNrcyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0YXNrc1wiKSB8fCBcIltdXCIpO1xyXG4gICAgICBjb25zdCB1cGRhdGVkVGFza3MgPSB0YXNrcy5tYXAoKHRhc2spID0+IHtcclxuICAgICAgICBpZiAodGFzay5jYXRlZ29yeSA9PT0gY2F0ZWdvcnlJZCkge1xyXG4gICAgICAgICAgcmV0dXJuIHsgLi4udGFzaywgY2F0ZWdvcnk6IG51bGwgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHRhc2s7XHJcbiAgICAgIH0pO1xyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInRhc2tzXCIsIEpTT04uc3RyaW5naWZ5KHVwZGF0ZWRUYXNrcykpO1xyXG4gICAgfSxcclxuICAgIGdlbmVyYXRlSWQoKSB7XHJcbiAgICAgIHJldHVybiBcImxvY2FsX2NhdF9cIiArIE1hdGgucmFuZG9tKCkudG9TdHJpbmcoMzYpLnN1YnN0cigyLCA5KTsgLy8gU2ltcGxlIHVuaXF1ZSBJRCBmb3IgbG9jYWwgY2F0ZWdvcmllc1xyXG4gICAgfSxcclxuICB9O1xyXG5cclxuICAvLyBIZWxwZXIgZnVuY3Rpb25zIGRlZmluZWQgb3V0c2lkZSBET01Db250ZW50TG9hZGVkXHJcbiAgZnVuY3Rpb24gcmVuZGVyQ2F0ZWdvcmllcygpIHtcclxuICAgIGNvbnN0IGNhdGVnb3JpZXNDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3JpZXMtY29udGFpbmVyXCIpO1xyXG4gICAgY29uc3QgYWRkTmV3Q2F0ZWdvcnlCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZC1uZXctY2F0ZWdvcnktYnRuXCIpO1xyXG4gICAgY29uc3QgbmV3Q2F0ZWdvcnlGb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctY2F0ZWdvcnktZm9ybVwiKTtcclxuXHJcbiAgICBjYXRlZ29yaWVzQ29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XHJcblxyXG4gICAgY2F0ZWdvcmllcy5mb3JFYWNoKChjYXRlZ29yeSwgaW5kZXgpID0+IHtcclxuICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XHJcbiAgICAgIGxpLmNsYXNzTmFtZSA9IFwiY2F0ZWdvcnktaXRlbVwiO1xyXG4gICAgICBsaS5pbm5lckhUTUwgPSBgXHJcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2F0ZWdvcnktY29udGVudFwiPlxyXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNhdGVnb3J5LWNvbG9yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAke2NhdGVnb3J5LmNvbG9yfTtcIj48L3NwYW4+IFxyXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNhdGVnb3J5LW5hbWVcIj4ke2NhdGVnb3J5Lm5hbWV9PC9zcGFuPlxyXG4gICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZGVsZXRlLWNhdGVnb3J5LWJ0blwiIGRhdGEtaWQ9XCIke2NhdGVnb3J5LmlkfVwiPlxyXG4gICAgICAgICAgICA8aSBjbGFzcz1cImZhcyBmYS10cmFzaFwiPjwvaT5cclxuICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgIGA7XHJcbiAgICAgIGNhdGVnb3JpZXNDb250YWluZXIuYXBwZW5kQ2hpbGQobGkpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyB0byBkZWxldGUgYnV0dG9uc1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5kZWxldGUtY2F0ZWdvcnktYnRuXCIpLmZvckVhY2goKGJ0bikgPT4ge1xyXG4gICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XHJcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICBjb25zdCBpZCA9IGJ0bi5kYXRhc2V0LmlkO1xyXG4gICAgICAgIGRlbGV0ZUNhdGVnb3J5KGlkKTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIFwiQWRkIE5ldyBDYXRlZ29yeVwiIGJ1dHRvbiBhbmQgZm9ybSBiYWNrXHJcbiAgICBjYXRlZ29yaWVzQ29udGFpbmVyLmFwcGVuZENoaWxkKGFkZE5ld0NhdGVnb3J5QnRuKTtcclxuICAgIGNhdGVnb3JpZXNDb250YWluZXIuYXBwZW5kQ2hpbGQobmV3Q2F0ZWdvcnlGb3JtKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHVwZGF0ZUNhdGVnb3J5U2VsZWN0KCkge1xyXG4gICAgY29uc3QgY2F0ZWdvcnlTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3J5XCIpO1xyXG4gICAgY2F0ZWdvcnlTZWxlY3QuaW5uZXJIVE1MID0gXCJcIjtcclxuXHJcbiAgICAvLyBBZGQgXCJOb25lXCIgb3B0aW9uIGZpcnN0XHJcbiAgICBjb25zdCBub25lT3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKTtcclxuICAgIG5vbmVPcHRpb24udmFsdWUgPSBcIk5vbmVcIjtcclxuICAgIG5vbmVPcHRpb24udGV4dENvbnRlbnQgPSBcIk5vbmVcIjtcclxuICAgIGNhdGVnb3J5U2VsZWN0LmFwcGVuZENoaWxkKG5vbmVPcHRpb24pO1xyXG5cclxuICAgIC8vIEFkZCBhbGwgY2F0ZWdvcnkgb3B0aW9uc1xyXG4gICAgY2F0ZWdvcmllcy5mb3JFYWNoKChjYXRlZ29yeSkgPT4ge1xyXG4gICAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xyXG4gICAgICBvcHRpb24udmFsdWUgPSBjYXRlZ29yeS5uYW1lO1xyXG4gICAgICBvcHRpb24udGV4dENvbnRlbnQgPSBjYXRlZ29yeS5uYW1lO1xyXG4gICAgICBjYXRlZ29yeVNlbGVjdC5hcHBlbmRDaGlsZChvcHRpb24pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBkZWxldGVDYXRlZ29yeShpZCkge1xyXG4gICAgY29uc3QgaW5kZXggPSBjYXRlZ29yaWVzLmZpbmRJbmRleCgoYykgPT4gYy5pZCA9PT0gaWQpO1xyXG4gICAgaWYgKGluZGV4ID49IDApIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBkZWxldGVkQ2F0ZWdvcnlOYW1lID0gY2F0ZWdvcmllc1tpbmRleF0ubmFtZTtcclxuICAgICAgICAvLyBEZWxldGUgY2F0ZWdvcnkgdmlhIEFQSVxyXG4gICAgICAgIGF3YWl0IEFwaVNlcnZpY2UuZGVsZXRlQ2F0ZWdvcnkoaWQpO1xyXG4gICAgICAgIGNhdGVnb3JpZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAvLyBVcGRhdGUgdGFza3MgdmlhIEFQSVxyXG4gICAgICAgIGF3YWl0IEFwaVNlcnZpY2UuY2xlYXJDYXRlZ29yeUZyb21UYXNrcyhkZWxldGVkQ2F0ZWdvcnlOYW1lKTtcclxuICAgICAgICAvLyBVcGRhdGUgbG9jYWxTdG9yYWdlIGFzIGJhY2t1cFxyXG4gICAgICAgIExvY2FsU3RvcmFnZVNlcnZpY2UuZGVsZXRlQ2F0ZWdvcnkoaWQpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUud2FybihcIlNlcnZlciB1bmF2YWlsYWJsZSwgZGVsZXRpbmcgZnJvbSBsb2NhbFN0b3JhZ2U6XCIsIGVycm9yKTtcclxuICAgICAgICAvLyBEZWxldGUgZnJvbSBsb2NhbCBjYXRlZ29yaWVzXHJcbiAgICAgICAgY2F0ZWdvcmllcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIExvY2FsU3RvcmFnZVNlcnZpY2UuZGVsZXRlQ2F0ZWdvcnkoaWQpO1xyXG4gICAgICB9XHJcbiAgICAgIHJlbmRlckNhdGVnb3JpZXMoKTtcclxuICAgICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKTtcclxuICAgIH1cclxuICB9XHJcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvYXBwXCIpIHtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgY29uc3QgY2F0ZWdvcnlTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3J5XCIpO1xyXG4gICAgICBjb25zdCBjYXRlZ29yaWVzQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXHJcbiAgICAgICAgXCJjYXRlZ29yaWVzLWNvbnRhaW5lclwiXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnN0IGFkZE5ld0NhdGVnb3J5QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGQtbmV3LWNhdGVnb3J5LWJ0blwiKTtcclxuICAgICAgY29uc3QgbmV3Q2F0ZWdvcnlGb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctY2F0ZWdvcnktZm9ybVwiKTtcclxuICAgICAgY29uc3QgY3JlYXRlQ2F0ZWdvcnlCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNyZWF0ZS1jYXRlZ29yeS1idG5cIik7XHJcblxyXG4gICAgICAvLyBGZXRjaCBjYXRlZ29yaWVzIGZyb20gQVBJIG9yIGxvY2FsU3RvcmFnZVxyXG4gICAgICBhc3luYyBmdW5jdGlvbiBpbml0aWFsaXplQ2F0ZWdvcmllcygpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY2F0ZWdvcmllcyA9IGF3YWl0IEFwaVNlcnZpY2UuZmV0Y2hDYXRlZ29yaWVzKCk7XHJcbiAgICAgICAgICByZW5kZXJDYXRlZ29yaWVzKCk7XHJcbiAgICAgICAgICB1cGRhdGVDYXRlZ29yeVNlbGVjdCgpO1xyXG4gICAgICAgICAgLy8gU2F2ZSBzZXJ2ZXIgY2F0ZWdvcmllcyB0byBsb2NhbFN0b3JhZ2UgYXMgYmFja3VwXHJcbiAgICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImNhdGVnb3JpZXNcIiwgSlNPTi5zdHJpbmdpZnkoY2F0ZWdvcmllcykpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLndhcm4oXCJTZXJ2ZXIgdW5hdmFpbGFibGUsIHVzaW5nIGxvY2FsU3RvcmFnZTpcIiwgZXJyb3IpO1xyXG4gICAgICAgICAgY2F0ZWdvcmllcyA9IExvY2FsU3RvcmFnZVNlcnZpY2UuZ2V0Q2F0ZWdvcmllcygpO1xyXG4gICAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xyXG4gICAgICAgICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGluaXRpYWxpemVDYXRlZ29yaWVzKCk7XHJcblxyXG4gICAgICAvLyBDYXRlZ29yeSBtYW5hZ2VtZW50XHJcbiAgICAgIGFkZE5ld0NhdGVnb3J5QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgbmV3Q2F0ZWdvcnlGb3JtLnN0eWxlLmRpc3BsYXkgPVxyXG4gICAgICAgICAgbmV3Q2F0ZWdvcnlGb3JtLnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiID8gXCJmbGV4XCIgOiBcIm5vbmVcIjtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjcmVhdGVDYXRlZ29yeUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1uYW1lXCIpLnZhbHVlLnRyaW0oKTtcclxuICAgICAgICBjb25zdCBjb2xvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3LWNhdGVnb3J5LWNvbG9yXCIpLnZhbHVlO1xyXG5cclxuICAgICAgICBpZiAobmFtZSkge1xyXG4gICAgICAgICAgY29uc3QgbmV3Q2F0ZWdvcnkgPSB7XHJcbiAgICAgICAgICAgIGlkOiBMb2NhbFN0b3JhZ2VTZXJ2aWNlLmdlbmVyYXRlSWQoKSxcclxuICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgY29sb3IsXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgLy8gQWRkIG5ldyBjYXRlZ29yeSB2aWEgQVBJXHJcbiAgICAgICAgICAgIGNvbnN0IGFwaUNhdGVnb3J5ID0gYXdhaXQgQXBpU2VydmljZS5jcmVhdGVDYXRlZ29yeSh7XHJcbiAgICAgICAgICAgICAgbmFtZSxcclxuICAgICAgICAgICAgICBjb2xvcixcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNhdGVnb3JpZXMucHVzaChhcGlDYXRlZ29yeSk7XHJcbiAgICAgICAgICAgIC8vIFNhdmUgdG8gbG9jYWxTdG9yYWdlIGFzIGJhY2t1cFxyXG4gICAgICAgICAgICBMb2NhbFN0b3JhZ2VTZXJ2aWNlLnNhdmVDYXRlZ29yeShhcGlDYXRlZ29yeSk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLndhcm4oXCJTZXJ2ZXIgdW5hdmFpbGFibGUsIHNhdmluZyB0byBsb2NhbFN0b3JhZ2U6XCIsIGVycm9yKTtcclxuICAgICAgICAgICAgY2F0ZWdvcmllcy5wdXNoKG5ld0NhdGVnb3J5KTtcclxuICAgICAgICAgICAgTG9jYWxTdG9yYWdlU2VydmljZS5zYXZlQ2F0ZWdvcnkobmV3Q2F0ZWdvcnkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xyXG4gICAgICAgICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKTtcclxuXHJcbiAgICAgICAgICAvLyBSZXNldCBmb3JtXHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1uYW1lXCIpLnZhbHVlID0gXCJcIjtcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3LWNhdGVnb3J5LWNvbG9yXCIpLnZhbHVlID0gXCIjY2NjY2NjXCI7XHJcbiAgICAgICAgICBuZXdDYXRlZ29yeUZvcm0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuICB9XHJcbiAgcmV0dXJuIHtcclxuICAgIGdldENhdGVnb3JpZXM6ICgpID0+IGNhdGVnb3JpZXMsXHJcbiAgICByZW5kZXJDYXRlZ29yaWVzLFxyXG4gICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QsXHJcbiAgfTtcclxufSkoKTsiLCJleHBvcnQgY29uc3QgRG9tVXRpbHMgPSAoKCkgPT4ge1xyXG4gIGZ1bmN0aW9uIGNsZWFyTWVzc2FnZXMoKSB7XHJcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lc3NhZ2VDb250YWluZXJcIik7XHJcbiAgICBpZiAoY29udGFpbmVyKSBjb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgIGRvY3VtZW50XHJcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLmVycm9yLW1lc3NhZ2UsIC5zdWNjZXNzLW1lc3NhZ2VcIilcclxuICAgICAgLmZvckVhY2goKGVsKSA9PiB7XHJcbiAgICAgICAgaWYgKGVsLnBhcmVudE5vZGUgIT09IGNvbnRhaW5lcikgZWwucmVtb3ZlKCk7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc2hvd01lc3NhZ2UobWVzc2FnZSwgdHlwZSA9IFwiZXJyb3JcIikge1xyXG4gICAgY2xlYXJNZXNzYWdlcygpO1xyXG4gICAgY29uc3QgbWVzc2FnZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NOYW1lID1cclxuICAgICAgdHlwZSA9PT0gXCJlcnJvclwiID8gXCJlcnJvci1tZXNzYWdlXCIgOiBcInN1Y2Nlc3MtbWVzc2FnZVwiO1xyXG4gICAgbWVzc2FnZS5zcGxpdChcIlxcblwiKS5mb3JFYWNoKChsaW5lKSA9PiB7XHJcbiAgICAgIGNvbnN0IHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcclxuICAgICAgcC50ZXh0Q29udGVudCA9IGxpbmU7XHJcbiAgICAgIG1lc3NhZ2VFbGVtZW50LmFwcGVuZENoaWxkKHApO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZXNzYWdlQ29udGFpbmVyXCIpO1xyXG4gICAgaWYgKGNvbnRhaW5lcikge1xyXG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobWVzc2FnZUVsZW1lbnQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXV0aEZvcm1cIik7XHJcbiAgICAgIGZvcm1cclxuICAgICAgICA/IGZvcm0ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobWVzc2FnZUVsZW1lbnQsIGZvcm0pXHJcbiAgICAgICAgOiBkb2N1bWVudC5ib2R5LnByZXBlbmQobWVzc2FnZUVsZW1lbnQpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGNsZWFyTWVzc2FnZXMsXHJcbiAgICBzaG93RXJyb3I6IChtc2cpID0+IHNob3dNZXNzYWdlKG1zZywgXCJlcnJvclwiKSxcclxuICAgIHNob3dTdWNjZXNzOiAobXNnKSA9PiBzaG93TWVzc2FnZShtc2csIFwic3VjY2Vzc1wiKSxcclxuICB9O1xyXG59KSgpO1xyXG4iLCJleHBvcnQgY29uc3QgTG9hZGVyID0gKCgpID0+IHtcclxuICBmdW5jdGlvbiB0b2dnbGUoc2hvdykge1xyXG4gICAgbGV0IGxvYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGVyXCIpO1xyXG4gICAgaWYgKCFsb2FkZXIgJiYgc2hvdykgbG9hZGVyID0gY3JlYXRlKCk7XHJcbiAgICBpZiAobG9hZGVyKSBsb2FkZXIuc3R5bGUuZGlzcGxheSA9IHNob3cgPyBcImZsZXhcIiA6IFwibm9uZVwiO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY3JlYXRlKCkge1xyXG4gICAgY29uc3QgbG9hZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIGxvYWRlci5pZCA9IFwibG9hZGVyXCI7XHJcbiAgICBsb2FkZXIuY2xhc3NOYW1lID0gXCJsb2FkZXJcIjtcclxuICAgIGxvYWRlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXJcIj48L2Rpdj4nO1xyXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsb2FkZXIpO1xyXG4gICAgcmV0dXJuIGxvYWRlcjtcclxuICB9XHJcblxyXG4gIHJldHVybiB7IHRvZ2dsZSB9O1xyXG59KSgpO1xyXG4iLCJpbXBvcnQgeyBMb2FkZXIgfSBmcm9tIFwiLi9sb2FkZXIuanNcIjtcclxuaW1wb3J0IHsgRG9tVXRpbHMgfSBmcm9tIFwiLi9kb21VdGlscy5qc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IFVzZXIgPSAoKCkgPT4ge1xyXG4gIGFzeW5jIGZ1bmN0aW9uIGxvZ291dCgpIHtcclxuICAgIGNvbnNvbGUubG9nKFwiQXR0ZW1wdGluZyBsb2dvdXQuLi5cIik7XHJcbiAgICBMb2FkZXIudG9nZ2xlKHRydWUpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcIi9hcGkvbG9nb3V0XCIsIHtcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHsgQWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSk7XHJcbiAgICAgIGlmICghcmVzcG9uc2Uub2spXHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgZGF0YS5lcnJvciB8fCBgTG9nb3V0IGZhaWxlZCB3aXRoIHN0YXR1czogJHtyZXNwb25zZS5zdGF0dXN9YFxyXG4gICAgICAgICk7XHJcbiAgICAgIGNvbnNvbGUubG9nKFwiTG9nb3V0IHN1Y2Nlc3NmdWwgdmlhIEFQSS5cIik7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiTG9nb3V0IEFQSSBjYWxsIGZhaWxlZDpcIiwgZXJyb3IpO1xyXG4gICAgICBEb21VdGlscy5zaG93RXJyb3IoXHJcbiAgICAgICAgXCJDb3VsZCBub3QgcHJvcGVybHkgbG9nIG91dC4gQ2xlYXIgY29va2llcyBtYW51YWxseSBpZiBuZWVkZWQuXCJcclxuICAgICAgKTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwidXNlclwiKTtcclxuICAgICAgTG9hZGVyLnRvZ2dsZShmYWxzZSk7XHJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvbG9naW5cIjtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGRpc3BsYXlVc2VyRGF0YSgpIHtcclxuICAgIGNvbnN0IHVzZXJEYXRhU3RyaW5nID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ1c2VyXCIpO1xyXG4gICAgaWYgKCF1c2VyRGF0YVN0cmluZykgcmV0dXJuIGxvZ291dCgpO1xyXG4gICAgdHJ5IHtcclxuICAgICAgY29uc3QgdXNlckRhdGEgPSBKU09OLnBhcnNlKHVzZXJEYXRhU3RyaW5nKTtcclxuICAgICAgY29uc3QgdXNlck5hbWUgPSB1c2VyRGF0YS5uYW1lIHx8IFwiVXNlclwiO1xyXG4gICAgICBjb25zdCB1c2VyTmFtZURpc3BsYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInVzZXItbmFtZS1kaXNwbGF5XCIpO1xyXG4gICAgICBpZiAodXNlck5hbWVEaXNwbGF5KSB1c2VyTmFtZURpc3BsYXkudGV4dENvbnRlbnQgPSB1c2VyTmFtZTtcclxuICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkludmFsaWQgdXNlciBkYXRhIGluIGxvY2FsU3RvcmFnZS5cIik7XHJcbiAgICAgIGxvZ291dCgpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgbG9nb3V0LCBkaXNwbGF5VXNlckRhdGEgfTtcclxufSkoKTtcclxuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4vbW9kdWxlcy91c2VyLmpzXCI7XHJcbmltcG9ydCB7IEF1dGggfSBmcm9tIFwiLi9tb2R1bGVzL2F1dGguanNcIjtcclxuaW1wb3J0IHsgVG9kbyB9IGZyb20gXCIuL21vZHVsZXMvY2FsZW5kYXIuanNcIjtcclxuXHJcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcclxuICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9hcHBcIikge1xyXG4gICAgVXNlci5kaXNwbGF5VXNlckRhdGEoKTtcclxuICB9XHJcbiAgY29uc3QgbG9nb3V0QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG4tbG9nb3V0XCIpO1xyXG4gIGlmIChsb2dvdXRCdG4pIGxvZ291dEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgVXNlci5sb2dvdXQpO1xyXG5cclxuICBjb25zb2xlLmxvZyhcIk1haW4gYXBwIGluaXRpYWxpemVkLlwiKTtcclxufSk7XHJcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==