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
          const cat = _category_js__WEBPACK_IMPORTED_MODULE_0__.Category.getCategories().find((c) => c.name === category);
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
        console.warn("Server unavailable, deleting from localStorage:", error);
        LocalStorageService.deleteTask(id);
      }
    }
  });
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

  document.addEventListener("DOMContentLoaded", function () {
    const categorySelect = document.getElementById("category");
    const categoriesContainer = document.getElementById("categories-container");
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
          const apiCategory = await _apiService_js__WEBPACK_IMPORTED_MODULE_0__.ApiService.createCategory({ name, color });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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T0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0Isa0RBQVE7QUFDOUI7QUFDQSxvREFBb0QsVUFBVTtBQUM5RDtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRCQUE0QixzREFBVTtBQUN0QztBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQSwrQkFB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SSxrREFBSTtBQUNSO0FBQ0E7QUFDQSxxREFBcUQsa0RBQUk7QUFDekQ7QUFDQTtBQUNBLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9hcGlTZXJ2aWNlLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2F1dGguanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvY2FsZW5kYXIuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvY2F0ZWdvcnkuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvZG9tVXRpbHMuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvbG9hZGVyLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL3VzZXIuanMiLCJ3ZWJwYWNrOi8vc3RhdGljL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3N0YXRpYy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vc3RhdGljL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vc3RhdGljL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExvYWRlciB9IGZyb20gXCIuL2xvYWRlci5qc1wiO1xyXG5pbXBvcnQgeyBEb21VdGlscyB9IGZyb20gXCIuL2RvbVV0aWxzLmpzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgQXBpU2VydmljZSA9ICgoKSA9PiB7XHJcbiAgY29uc3QgQVBJX0JBU0UgPSBcIi9hcGlcIjtcclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmVxdWVzdCh1cmwsIG1ldGhvZCwgZGF0YSkge1xyXG4gICAgdHJ5IHtcclxuICAgICAgTG9hZGVyLnRvZ2dsZSh0cnVlKTtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtBUElfQkFTRX0ke3VybH1gLCB7XHJcbiAgICAgICAgbWV0aG9kLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgY3JlZGVudGlhbHM6IFwiaW5jbHVkZVwiLFxyXG4gICAgICAgIGJvZHk6IGRhdGEgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IHVuZGVmaW5lZCxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDEpIHtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2xvZ2luP3JlYXNvbj11bmF1dGhlbnRpY2F0ZWRcIjtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcclxuXHJcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzcG9uc2VEYXRhLmVycm9yIHx8IFwiUmVxdWVzdCBmYWlsZWRcIik7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIERvbVV0aWxzLnNob3dFcnJvcihlcnJvci5tZXNzYWdlKTtcclxuICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBMb2FkZXIudG9nZ2xlKGZhbHNlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICAvLyBUYXNrLXJlbGF0ZWQgZW5kcG9pbnRzXHJcbiAgICBjcmVhdGVUYXNrOiAodGFzaykgPT4gaGFuZGxlUmVxdWVzdChcIi90YXNrc1wiLCBcIlBPU1RcIiwgdGFzayksXHJcbiAgICB1cGRhdGVUYXNrOiAoaWQsIHRhc2spID0+IGhhbmRsZVJlcXVlc3QoYC90YXNrcy8ke2lkfWAsIFwiUFVUXCIsIHRhc2spLFxyXG4gICAgZGVsZXRlVGFzazogKGlkKSA9PiBoYW5kbGVSZXF1ZXN0KGAvdGFza3MvJHtpZH1gLCBcIkRFTEVURVwiKSxcclxuICAgIGZldGNoVGFza3M6ICgpID0+IGhhbmRsZVJlcXVlc3QoXCIvdGFza3NcIiwgXCJHRVRcIiksXHJcbiAgICAvLyBDYXRlZ29yeS1yZWxhdGVkIGVuZHBvaW50c1xyXG4gICAgY3JlYXRlQ2F0ZWdvcnk6IChjYXRlZ29yeSkgPT5cclxuICAgICAgaGFuZGxlUmVxdWVzdChcIi9jYXRlZ29yaWVzXCIsIFwiUE9TVFwiLCBjYXRlZ29yeSksXHJcbiAgICBmZXRjaENhdGVnb3JpZXM6ICgpID0+IGhhbmRsZVJlcXVlc3QoXCIvY2F0ZWdvcmllc1wiLCBcIkdFVFwiKSxcclxuICAgIGRlbGV0ZUNhdGVnb3J5OiAoaWQpID0+IGhhbmRsZVJlcXVlc3QoYC9jYXRlZ29yaWVzLyR7aWR9YCwgXCJERUxFVEVcIiksXHJcbiAgICBjbGVhckNhdGVnb3J5RnJvbVRhc2tzOiAoY2F0ZWdvcnlOYW1lKSA9PlxyXG4gICAgICBoYW5kbGVSZXF1ZXN0KGAvdGFza3MvY2xlYXItY2F0ZWdvcnkvJHtjYXRlZ29yeU5hbWV9YCwgXCJQQVRDSFwiKSxcclxuICB9O1xyXG59KSgpO1xyXG4iLCJpbXBvcnQgeyBMb2FkZXIgfSBmcm9tIFwiLi9sb2FkZXIuanNcIjtcclxuaW1wb3J0IHsgRG9tVXRpbHMgfSBmcm9tIFwiLi9kb21VdGlscy5qc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IEF1dGggPSAoKCkgPT4ge1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcclxuICAgIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09IFwiL2xvZ2luXCIpIHtcclxuICAgICAgaW5pdCgpO1xyXG4gICAgICBjaGVja1JlZGlyZWN0UmVhc29uKCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdXRoRm9ybVwiKTtcclxuICAgIGlmICghZm9ybSkgcmV0dXJuIGNvbnNvbGUuZXJyb3IoXCJBdXRoIGZvcm0gbm90IGZvdW5kIVwiKTtcclxuXHJcbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgaGFuZGxlU3VibWl0KTtcclxuICAgIHN3aXRjaE1vZGUoXCJsb2dpblwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1tb2RlXVwiKS5mb3JFYWNoKCh0YWIpID0+XHJcbiAgICAgIHRhYi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgIHN3aXRjaE1vZGUodGFiLmRhdGFzZXQubW9kZSk7XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc3dpdGNoTW9kZShtb2RlKSB7XHJcbiAgICBjb25zdCBuYW1lRmllbGQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWVsZFwiKTtcclxuICAgIGNvbnN0IHN1Ym1pdEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNhdXRoRm9ybSBidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpO1xyXG4gICAgY29uc3QgcGFzc3dvcmRJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFzc3dvcmRcIik7XHJcbiAgICBjb25zdCB0YWJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50YWJcIik7XHJcblxyXG4gICAgaWYgKG5hbWVGaWVsZCkge1xyXG4gICAgICBuYW1lRmllbGQuc3R5bGUuZGlzcGxheSA9IG1vZGUgPT09IFwicmVnaXN0ZXJcIiA/IFwiYmxvY2tcIiA6IFwibm9uZVwiO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVcIikucmVxdWlyZWQgPSBtb2RlID09PSBcInJlZ2lzdGVyXCI7XHJcbiAgICB9XHJcbiAgICB0YWJzLmZvckVhY2goKHRhYikgPT5cclxuICAgICAgdGFiLmNsYXNzTGlzdC50b2dnbGUoXCJhY3RpdmVcIiwgdGFiLmRhdGFzZXQubW9kZSA9PT0gbW9kZSlcclxuICAgICk7XHJcbiAgICBpZiAoc3VibWl0QnRuKVxyXG4gICAgICBzdWJtaXRCdG4udGV4dENvbnRlbnQgPSBtb2RlID09PSBcImxvZ2luXCIgPyBcIkxvZ2luXCIgOiBcIlJlZ2lzdGVyXCI7XHJcbiAgICBpZiAocGFzc3dvcmRJbnB1dClcclxuICAgICAgcGFzc3dvcmRJbnB1dC5hdXRvY29tcGxldGUgPVxyXG4gICAgICAgIG1vZGUgPT09IFwibG9naW5cIiA/IFwiY3VycmVudC1wYXNzd29yZFwiIDogXCJuZXctcGFzc3dvcmRcIjtcclxuXHJcbiAgICBEb21VdGlscy5jbGVhck1lc3NhZ2VzKCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVTdWJtaXQoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgRG9tVXRpbHMuY2xlYXJNZXNzYWdlcygpO1xyXG4gICAgTG9hZGVyLnRvZ2dsZSh0cnVlKTtcclxuXHJcbiAgICBjb25zdCBpc0xvZ2luID0gZG9jdW1lbnRcclxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLW1vZGU9XCJsb2dpblwiXScpXHJcbiAgICAgIC5jbGFzc0xpc3QuY29udGFpbnMoXCJhY3RpdmVcIik7XHJcbiAgICBjb25zdCB1cmwgPSBpc0xvZ2luID8gXCIvYXBpL2xvZ2luXCIgOiBcIi9hcGkvcmVnaXN0ZXJcIjtcclxuICAgIGNvbnN0IGZvcm1EYXRhID0ge1xyXG4gICAgICBlbWFpbDogZ2V0VmFsKFwiZW1haWxcIiksXHJcbiAgICAgIHBhc3N3b3JkOiBnZXRWYWwoXCJwYXNzd29yZFwiKSxcclxuICAgIH07XHJcblxyXG4gICAgaWYgKCFpc0xvZ2luKSBmb3JtRGF0YS5uYW1lID0gZ2V0VmFsKFwibmFtZVwiKTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICB2YWxpZGF0ZShmb3JtRGF0YSwgaXNMb2dpbik7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XHJcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgIEFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShmb3JtRGF0YSksXHJcbiAgICAgIH0pO1xyXG4gICAgICBhd2FpdCBoYW5kbGVSZXNwb25zZShyZXNwb25zZSwgaXNMb2dpbik7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgRG9tVXRpbHMuc2hvd0Vycm9yKGVyci5tZXNzYWdlIHx8IFwiVW5leHBlY3RlZCBlcnJvciBkdXJpbmcgc3VibWlzc2lvbi5cIik7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBMb2FkZXIudG9nZ2xlKGZhbHNlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFZhbChpZCkge1xyXG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XHJcbiAgICByZXR1cm4gZWwgPyBlbC52YWx1ZS50cmltKCkgOiBcIlwiO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdmFsaWRhdGUoZGF0YSwgaXNMb2dpbikge1xyXG4gICAgY29uc3QgZXJyb3JzID0gW107XHJcbiAgICBjb25zdCBlbWFpbFJlZ2V4ID0gL15bXlxcc0BdK0BbXlxcc0BdK1xcLlteXFxzQF0rJC87XHJcblxyXG4gICAgaWYgKCFkYXRhLmVtYWlsKSBlcnJvcnMucHVzaChcIkVtYWlsIGlzIHJlcXVpcmVkLlwiKTtcclxuICAgIGVsc2UgaWYgKCFlbWFpbFJlZ2V4LnRlc3QoZGF0YS5lbWFpbCkpIGVycm9ycy5wdXNoKFwiSW52YWxpZCBlbWFpbCBmb3JtYXQuXCIpO1xyXG4gICAgaWYgKCFkYXRhLnBhc3N3b3JkKSBlcnJvcnMucHVzaChcIlBhc3N3b3JkIGlzIHJlcXVpcmVkLlwiKTtcclxuICAgIGVsc2UgaWYgKGRhdGEucGFzc3dvcmQubGVuZ3RoIDwgOCAmJiAhaXNMb2dpbilcclxuICAgICAgZXJyb3JzLnB1c2goXCJQYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycy5cIik7XHJcbiAgICBpZiAoIWlzTG9naW4gJiYgKCFkYXRhLm5hbWUgfHwgZGF0YS5uYW1lLmxlbmd0aCA8IDIpKVxyXG4gICAgICBlcnJvcnMucHVzaChcIk5hbWUgbXVzdCBiZSBhdCBsZWFzdCAyIGNoYXJhY3RlcnMuXCIpO1xyXG5cclxuICAgIGlmIChlcnJvcnMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoZXJyb3JzLmpvaW4oXCJcXG5cIikpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzcG9uc2UsIGlzTG9naW4pIHtcclxuICAgIGNvbnN0IGlzSnNvbiA9IHJlc3BvbnNlLmhlYWRlcnNcclxuICAgICAgLmdldChcImNvbnRlbnQtdHlwZVwiKVxyXG4gICAgICA/LmluY2x1ZGVzKFwiYXBwbGljYXRpb24vanNvblwiKTtcclxuICAgIGNvbnN0IGRhdGEgPSBpc0pzb25cclxuICAgICAgPyBhd2FpdCByZXNwb25zZS5qc29uKClcclxuICAgICAgOiB7IG1lc3NhZ2U6IGF3YWl0IHJlc3BvbnNlLnRleHQoKSB9O1xyXG5cclxuICAgIGlmICghcmVzcG9uc2Uub2spXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihkYXRhLmVycm9yIHx8IGBFcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XHJcblxyXG4gICAgaWYgKGlzTG9naW4pIHtcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ1c2VyXCIsIEpTT04uc3RyaW5naWZ5KGRhdGEudXNlciB8fCB7fSkpO1xyXG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2FwcFwiO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgRG9tVXRpbHMuc2hvd1N1Y2Nlc3MoXHJcbiAgICAgICAgZGF0YS5tZXNzYWdlIHx8IFwiUmVnaXN0cmF0aW9uIHN1Y2Nlc3NmdWwuIFBsZWFzZSBsb2dpbi5cIlxyXG4gICAgICApO1xyXG4gICAgICBzd2l0Y2hNb2RlKFwibG9naW5cIik7XHJcbiAgICAgIFtcImVtYWlsXCIsIFwicGFzc3dvcmRcIiwgXCJuYW1lXCJdLmZvckVhY2goKGlkKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XHJcbiAgICAgICAgaWYgKGVsKSBlbC52YWx1ZSA9IFwiXCI7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2hlY2tSZWRpcmVjdFJlYXNvbigpIHtcclxuICAgIGNvbnN0IHJlYXNvbiA9IG5ldyBVUkxTZWFyY2hQYXJhbXMobG9jYXRpb24uc2VhcmNoKS5nZXQoXCJyZWFzb25cIik7XHJcbiAgICBjb25zdCBtZXNzYWdlcyA9IHtcclxuICAgICAgdW5hdXRoZW50aWNhdGVkOiBcIlBsZWFzZSBsb2cgaW4gdG8gYWNjZXNzIHRoZSBhcHBsaWNhdGlvbi5cIixcclxuICAgICAgaW52YWxpZF90b2tlbjogXCJTZXNzaW9uIGV4cGlyZWQuIFBsZWFzZSBsb2cgaW4gYWdhaW4uXCIsXHJcbiAgICAgIGJhZF90b2tlbl9jbGFpbXM6IFwiU2Vzc2lvbiBkYXRhIGlzc3VlLiBQbGVhc2UgbG9nIGluIGFnYWluLlwiLFxyXG4gICAgfTtcclxuICAgIGlmIChyZWFzb24gJiYgbWVzc2FnZXNbcmVhc29uXSkgRG9tVXRpbHMuc2hvd0Vycm9yKG1lc3NhZ2VzW3JlYXNvbl0pO1xyXG4gICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgXCJcIiwgbG9jYXRpb24ucGF0aG5hbWUpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgaW5pdCB9O1xyXG59KSgpO1xyXG4iLCJpbXBvcnQgeyBDYXRlZ29yeSB9IGZyb20gXCIuL2NhdGVnb3J5LmpzXCI7XHJcbmltcG9ydCB7IEFwaVNlcnZpY2UgfSBmcm9tIFwiLi9hcGlTZXJ2aWNlLmpzXCI7IC8vIEltcG9ydCBBcGlTZXJ2aWNlXHJcblxyXG5leHBvcnQgY29uc3QgVG9kbyA9ICgoKSA9PiB7XHJcbiAgbGV0IGN1cnJlbnRFZGl0aW5nVGFzayA9IG51bGw7XHJcbiAgbGV0IGlzRWRpdGluZyA9IGZhbHNlO1xyXG5cclxuICAvLyBMb2NhbCBTdG9yYWdlIFNlcnZpY2VcclxuICBjb25zdCBMb2NhbFN0b3JhZ2VTZXJ2aWNlID0ge1xyXG4gICAgZ2V0VGFza3MoKSB7XHJcbiAgICAgIGNvbnN0IHRhc2tzID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ0YXNrc1wiKTtcclxuICAgICAgcmV0dXJuIHRhc2tzID8gSlNPTi5wYXJzZSh0YXNrcykgOiBbXTtcclxuICAgIH0sXHJcbiAgICBzYXZlVGFzayh0YXNrKSB7XHJcbiAgICAgIGNvbnN0IHRhc2tzID0gdGhpcy5nZXRUYXNrcygpO1xyXG4gICAgICB0YXNrcy5wdXNoKHRhc2spO1xyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInRhc2tzXCIsIEpTT04uc3RyaW5naWZ5KHRhc2tzKSk7XHJcbiAgICAgIHJldHVybiB0YXNrO1xyXG4gICAgfSxcclxuICAgIHVwZGF0ZVRhc2soaWQsIHVwZGF0ZWRUYXNrKSB7XHJcbiAgICAgIGNvbnN0IHRhc2tzID0gdGhpcy5nZXRUYXNrcygpO1xyXG4gICAgICBjb25zdCBpbmRleCA9IHRhc2tzLmZpbmRJbmRleCgodCkgPT4gdC5pZCA9PT0gaWQpO1xyXG4gICAgICBpZiAoaW5kZXggIT09IC0xKSB7XHJcbiAgICAgICAgdGFza3NbaW5kZXhdID0geyAuLi50YXNrc1tpbmRleF0sIC4uLnVwZGF0ZWRUYXNrIH07XHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0YXNrc1wiLCBKU09OLnN0cmluZ2lmeSh0YXNrcykpO1xyXG4gICAgICAgIHJldHVybiB0YXNrc1tpbmRleF07XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG51bGw7XHJcbiAgICB9LFxyXG4gICAgZGVsZXRlVGFzayhpZCkge1xyXG4gICAgICBjb25zdCB0YXNrcyA9IHRoaXMuZ2V0VGFza3MoKTtcclxuICAgICAgY29uc3QgdXBkYXRlZFRhc2tzID0gdGFza3MuZmlsdGVyKCh0KSA9PiB0LmlkICE9PSBpZCk7XHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidGFza3NcIiwgSlNPTi5zdHJpbmdpZnkodXBkYXRlZFRhc2tzKSk7XHJcbiAgICB9LFxyXG4gICAgZ2VuZXJhdGVJZCgpIHtcclxuICAgICAgcmV0dXJuIFwibG9jYWxfXCIgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSk7IC8vIFNpbXBsZSB1bmlxdWUgSUQgZm9yIGxvY2FsIHRhc2tzXHJcbiAgICB9LFxyXG4gIH07XHJcblxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhc2stZm9ybVwiKTtcclxuICAgIGNvbnN0IGZvcm1IZWFkaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb3JtLWhlYWRpbmdcIik7XHJcbiAgICBjb25zdCBzdWJtaXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1Ym1pdC1idXR0b25cIik7XHJcbiAgICBjb25zdCBkZWxldGVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbGV0ZS1idXR0b25cIik7XHJcbiAgICBjb25zdCBjYW5jZWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbmNlbC1idXR0b25cIik7XHJcbiAgICBjb25zdCBhZGRUYXNrQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgXCIuY29udGVudC1oZWFkZXItY29udGFpbmVyID4gYnV0dG9uXCJcclxuICAgICk7XHJcbiAgICBjb25zdCBhbGxEYXlDaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWxsRGF5XCIpO1xyXG4gICAgY29uc3QgdGltZUlucHV0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGltZUlucHV0c1wiKTtcclxuXHJcbiAgICAvLyBUb2dnbGUgdGltZSBpbnB1dHMgYmFzZWQgb24gQWxsIERheSBjaGVja2JveFxyXG4gICAgYWxsRGF5Q2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XHJcbiAgICAgIHRpbWVJbnB1dHMuc3R5bGUuZGlzcGxheSA9IGFsbERheUNoZWNrYm94LmNoZWNrZWQgPyBcIm5vbmVcIiA6IFwiZmxleFwiO1xyXG4gICAgICBpZiAoYWxsRGF5Q2hlY2tib3guY2hlY2tlZCkge1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLnZhbHVlID0gXCJcIjtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuZFRpbWVcIikudmFsdWUgPSBcIlwiO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBDYWxlbmRhciBpbml0aWFsaXphdGlvblxyXG4gICAgY29uc3QgY2FsZW5kYXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FsZW5kYXJcIik7XHJcbiAgICBjb25zdCBjYWxlbmRhciA9IG5ldyBGdWxsQ2FsZW5kYXIuQ2FsZW5kYXIoY2FsZW5kYXJFbCwge1xyXG4gICAgICBpbml0aWFsVmlldzogXCJkYXlHcmlkTW9udGhcIixcclxuICAgICAgaGVhZGVyVG9vbGJhcjoge1xyXG4gICAgICAgIGxlZnQ6IFwicHJldixuZXh0IHRvZGF5XCIsXHJcbiAgICAgICAgY2VudGVyOiBcInRpdGxlXCIsXHJcbiAgICAgICAgcmlnaHQ6IFwiZGF5R3JpZE1vbnRoLHRpbWVHcmlkV2Vlayx0aW1lR3JpZERheVwiLFxyXG4gICAgICB9LFxyXG4gICAgICBlZGl0YWJsZTogdHJ1ZSxcclxuICAgICAgc2VsZWN0YWJsZTogdHJ1ZSxcclxuICAgICAgc2VsZWN0TWlycm9yOiB0cnVlLFxyXG4gICAgICBkYXlNYXhFdmVudHM6IHRydWUsXHJcbiAgICAgIGV2ZW50czogW10sIC8vIEluaXRpYWxpemUgZW1wdHksIHBvcHVsYXRlIHZpYSBmZXRjaFRhc2tzXHJcbiAgICAgIGV2ZW50Q2xpY2s6IGZ1bmN0aW9uIChpbmZvKSB7XHJcbiAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gaW5mby5ldmVudDtcclxuICAgICAgICBpc0VkaXRpbmcgPSB0cnVlO1xyXG4gICAgICAgIHBvcHVsYXRlRm9ybShpbmZvLmV2ZW50KTtcclxuICAgICAgICB1cGRhdGVGb3JtVUkoKTtcclxuICAgICAgfSxcclxuICAgICAgZXZlbnREaWRNb3VudDogZnVuY3Rpb24gKGluZm8pIHtcclxuICAgICAgICBjb25zdCBpc0NvbXBsZXRlZCA9IGluZm8uZXZlbnQuZXh0ZW5kZWRQcm9wcy5jb21wbGV0ZWQ7XHJcbiAgICAgICAgaWYgKGlzQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICBpbmZvLmVsLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiI2QzZDNkM1wiO1xyXG4gICAgICAgICAgaW5mby5lbC5zdHlsZS50ZXh0RGVjb3JhdGlvbiA9IFwibGluZS10aHJvdWdoXCI7XHJcbiAgICAgICAgICBpbmZvLmVsLnN0eWxlLm9wYWNpdHkgPSBcIjAuN1wiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXBwbHkgY2F0ZWdvcnkgY29sb3IgKGhhbmRsZWQgYnkgQ2F0ZWdvcnkgbW9kdWxlKVxyXG4gICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gaW5mby5ldmVudC5leHRlbmRlZFByb3BzLmNhdGVnb3J5O1xyXG4gICAgICAgIGlmIChjYXRlZ29yeSAmJiBjYXRlZ29yeSAhPT0gXCJOb25lXCIpIHtcclxuICAgICAgICAgIGNvbnN0IGNhdCA9IENhdGVnb3J5LmdldENhdGVnb3JpZXMoKS5maW5kKChjKSA9PiBjLm5hbWUgPT09IGNhdGVnb3J5KTtcclxuICAgICAgICAgIGlmIChjYXQpIHtcclxuICAgICAgICAgICAgaW5mby5lbC5zdHlsZS5ib3JkZXJMZWZ0ID0gYDRweCBzb2xpZCAke2NhdC5jb2xvcn1gO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpbmZvLmVsLnN0eWxlLmJvcmRlckxlZnQgPSBcIjRweCBzb2xpZCB0cmFuc3BhcmVudFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEZldGNoIHRhc2tzIGZyb20gQVBJIG9yIGxvY2FsU3RvcmFnZSBhbmQgcmVuZGVyIGNhbGVuZGFyXHJcbiAgICBhc3luYyBmdW5jdGlvbiBpbml0aWFsaXplQ2FsZW5kYXIoKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgdGFza3MgPSBhd2FpdCBBcGlTZXJ2aWNlLmZldGNoVGFza3MoKTtcclxuICAgICAgICB0YXNrcy5mb3JFYWNoKCh0YXNrKSA9PiBjYWxlbmRhci5hZGRFdmVudCh0YXNrKSk7XHJcbiAgICAgICAgLy8gU2F2ZSBzZXJ2ZXIgdGFza3MgdG8gbG9jYWxTdG9yYWdlIGFzIGJhY2t1cFxyXG4gICAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidGFza3NcIiwgSlNPTi5zdHJpbmdpZnkodGFza3MpKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oXCJTZXJ2ZXIgdW5hdmFpbGFibGUsIHVzaW5nIGxvY2FsU3RvcmFnZTpcIiwgZXJyb3IpO1xyXG4gICAgICAgIGNvbnN0IGxvY2FsVGFza3MgPSBMb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldFRhc2tzKCk7XHJcbiAgICAgICAgbG9jYWxUYXNrcy5mb3JFYWNoKCh0YXNrKSA9PiBjYWxlbmRhci5hZGRFdmVudCh0YXNrKSk7XHJcbiAgICAgIH1cclxuICAgICAgY2FsZW5kYXIucmVuZGVyKCk7XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdGlhbGl6ZUNhbGVuZGFyKCk7XHJcblxyXG4gICAgLy8gRXZlbnQgTGlzdGVuZXJzXHJcbiAgICBhZGRUYXNrQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgIGlzRWRpdGluZyA9IGZhbHNlO1xyXG4gICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xyXG4gICAgICBmb3JtLnJlc2V0KCk7XHJcbiAgICAgIGFsbERheUNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcclxuICAgICAgdGltZUlucHV0cy5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XHJcbiAgICAgIHVwZGF0ZUZvcm1VSSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGFzeW5jIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgY29uc3QgZm9ybURhdGEgPSBnZXRGb3JtRGF0YSgpO1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAoaXNFZGl0aW5nKSB7XHJcbiAgICAgICAgICBhd2FpdCB1cGRhdGVUYXNrKGZvcm1EYXRhKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYXdhaXQgY3JlYXRlVGFzayhmb3JtRGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvcm0ucmVzZXQoKTtcclxuICAgICAgICBhbGxEYXlDaGVja2JveC5jaGVja2VkID0gZmFsc2U7XHJcbiAgICAgICAgdGltZUlucHV0cy5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XHJcbiAgICAgICAgdXBkYXRlRm9ybVVJKCk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBzYXZlIHRhc2s6XCIsIGVycm9yKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcblxyXG4gICAgZGVsZXRlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGlmIChjdXJyZW50RWRpdGluZ1Rhc2spIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgYXdhaXQgZGVsZXRlVGFzayhjdXJyZW50RWRpdGluZ1Rhc2suaWQpO1xyXG4gICAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrLnJlbW92ZSgpO1xyXG4gICAgICAgICAgZm9ybS5yZXNldCgpO1xyXG4gICAgICAgICAgaXNFZGl0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xyXG4gICAgICAgICAgdXBkYXRlRm9ybVVJKCk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZGVsZXRlIHRhc2s6XCIsIGVycm9yKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIGNhbmNlbEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICBmb3JtLnJlc2V0KCk7XHJcbiAgICAgIGlzRWRpdGluZyA9IGZhbHNlO1xyXG4gICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xyXG4gICAgICBhbGxEYXlDaGVja2JveC5jaGVja2VkID0gZmFsc2U7XHJcbiAgICAgIHRpbWVJbnB1dHMuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xyXG4gICAgICB1cGRhdGVGb3JtVUkoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhlbHBlciBmdW5jdGlvbnNcclxuICAgIGZ1bmN0aW9uIHVwZGF0ZUZvcm1VSSgpIHtcclxuICAgICAgaWYgKGlzRWRpdGluZykge1xyXG4gICAgICAgIGZvcm1IZWFkaW5nLnRleHRDb250ZW50ID0gXCJFZGl0IFRhc2tcIjtcclxuICAgICAgICBzdWJtaXRCdXR0b24udGV4dENvbnRlbnQgPSBcIlNhdmUgQ2hhbmdlc1wiO1xyXG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGNhbmNlbEJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGFkZFRhc2tCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGZvcm1IZWFkaW5nLnRleHRDb250ZW50ID0gXCJBZGQgTmV3IFRhc2tcIjtcclxuICAgICAgICBzdWJtaXRCdXR0b24udGV4dENvbnRlbnQgPSBcIkFkZCBUYXNrXCI7XHJcbiAgICAgICAgZGVsZXRlQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgY2FuY2VsQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgYWRkVGFza0J1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcG9wdWxhdGVGb3JtKGV2ZW50KSB7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGl0bGVcIikudmFsdWUgPSBldmVudC50aXRsZTtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YXNrRGF0ZVwiKS52YWx1ZSA9IGV2ZW50LnN0YXJ0U3RyLnN1YnN0cmluZyhcclxuICAgICAgICAwLFxyXG4gICAgICAgIDEwXHJcbiAgICAgICk7XHJcbiAgICAgIGNvbnN0IGFsbERheSA9IGV2ZW50LmFsbERheTtcclxuICAgICAgYWxsRGF5Q2hlY2tib3guY2hlY2tlZCA9IGFsbERheTtcclxuICAgICAgdGltZUlucHV0cy5zdHlsZS5kaXNwbGF5ID0gYWxsRGF5ID8gXCJub25lXCIgOiBcImZsZXhcIjtcclxuXHJcbiAgICAgIC8vIEhhbmRsZSB0aW1lIGlucHV0cyBmb3Igbm9uLWFsbC1kYXkgZXZlbnRzXHJcbiAgICAgIGlmICghYWxsRGF5KSB7XHJcbiAgICAgICAgY29uc3Qgc3RhcnREYXRlID0gbmV3IERhdGUoZXZlbnQuc3RhcnQpO1xyXG4gICAgICAgIGNvbnN0IGVuZERhdGUgPSBuZXcgRGF0ZShldmVudC5lbmQgfHwgZXZlbnQuc3RhcnQpO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLnZhbHVlID0gc3RhcnREYXRlXHJcbiAgICAgICAgICAudG9UaW1lU3RyaW5nKClcclxuICAgICAgICAgIC5zdWJzdHJpbmcoMCwgNSk7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLnZhbHVlID0gZW5kRGF0ZVxyXG4gICAgICAgICAgLnRvVGltZVN0cmluZygpXHJcbiAgICAgICAgICAuc3Vic3RyaW5nKDAsIDUpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLnZhbHVlID0gXCJcIjtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuZFRpbWVcIikudmFsdWUgPSBcIlwiO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlc2NyaXB0aW9uXCIpLnZhbHVlID1cclxuICAgICAgICBldmVudC5leHRlbmRlZFByb3BzLmRlc2NyaXB0aW9uIHx8IFwiXCI7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlcIikudmFsdWUgPVxyXG4gICAgICAgIGV2ZW50LmV4dGVuZGVkUHJvcHMucHJpb3JpdHkgfHwgXCJsb3dcIjtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRlZ29yeVwiKS52YWx1ZSA9XHJcbiAgICAgICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5jYXRlZ29yeSB8fCBcIk5vbmVcIjtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb21wbGV0ZWRcIikuY2hlY2tlZCA9XHJcbiAgICAgICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5jb21wbGV0ZWQgfHwgZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0Rm9ybURhdGEoKSB7XHJcbiAgICAgIGNvbnN0IGNhdGVnb3J5VmFsdWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3J5XCIpLnZhbHVlO1xyXG4gICAgICBjb25zdCBhbGxEYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFsbERheVwiKS5jaGVja2VkO1xyXG4gICAgICBjb25zdCBkYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YXNrRGF0ZVwiKS52YWx1ZTtcclxuICAgICAgbGV0IHN0YXJ0LCBlbmQ7XHJcblxyXG4gICAgICBpZiAoYWxsRGF5KSB7XHJcbiAgICAgICAgc3RhcnQgPSBkYXRlO1xyXG4gICAgICAgIGVuZCA9IGRhdGU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFRpbWVcIikudmFsdWU7XHJcbiAgICAgICAgY29uc3QgZW5kVGltZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5kVGltZVwiKS52YWx1ZTtcclxuICAgICAgICBzdGFydCA9IHN0YXJ0VGltZSA/IGAke2RhdGV9VCR7c3RhcnRUaW1lfWAgOiBkYXRlO1xyXG4gICAgICAgIGVuZCA9IGVuZFRpbWUgPyBgJHtkYXRlfVQke2VuZFRpbWV9YCA6IHN0YXJ0O1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGlkOiBpc0VkaXRpbmcgPyBjdXJyZW50RWRpdGluZ1Rhc2suaWQgOiB1bmRlZmluZWQsIC8vIElEIGlzIG1hbmFnZWQgYnkgc2VydmVyIG9yIGxvY2FsU3RvcmFnZVxyXG4gICAgICAgIHRpdGxlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpdGxlXCIpLnZhbHVlLFxyXG4gICAgICAgIHN0YXJ0OiBzdGFydCxcclxuICAgICAgICBlbmQ6IGVuZCxcclxuICAgICAgICBhbGxEYXk6IGFsbERheSxcclxuICAgICAgICBkZXNjcmlwdGlvbjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXNjcmlwdGlvblwiKS52YWx1ZSxcclxuICAgICAgICBwcmlvcml0eTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eVwiKS52YWx1ZSxcclxuICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnlWYWx1ZSA9PT0gXCJOb25lXCIgPyBudWxsIDogY2F0ZWdvcnlWYWx1ZSxcclxuICAgICAgICBjb21wbGV0ZWQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29tcGxldGVkXCIpLmNoZWNrZWQsXHJcbiAgICAgICAgY2xhc3NOYW1lOiBgcHJpb3JpdHktJHtkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5XCIpLnZhbHVlfSAke1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb21wbGV0ZWRcIikuY2hlY2tlZCA/IFwiY29tcGxldGVkLXRhc2tcIiA6IFwiXCJcclxuICAgICAgICB9YCxcclxuICAgICAgfTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBmdW5jdGlvbiBjcmVhdGVUYXNrKGRhdGEpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCBuZXdUYXNrID0gYXdhaXQgQXBpU2VydmljZS5jcmVhdGVUYXNrKGRhdGEpO1xyXG4gICAgICAgIGNhbGVuZGFyLmFkZEV2ZW50KG5ld1Rhc2spO1xyXG4gICAgICAgIC8vIFNhdmUgdG8gbG9jYWxTdG9yYWdlIGFzIGJhY2t1cFxyXG4gICAgICAgIExvY2FsU3RvcmFnZVNlcnZpY2Uuc2F2ZVRhc2sobmV3VGFzayk7XHJcbiAgICAgICAgcmV0dXJuIG5ld1Rhc2s7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS53YXJuKFwiU2VydmVyIHVuYXZhaWxhYmxlLCBzYXZpbmcgdG8gbG9jYWxTdG9yYWdlOlwiLCBlcnJvcik7XHJcbiAgICAgICAgY29uc3QgbG9jYWxUYXNrID0geyAuLi5kYXRhLCBpZDogTG9jYWxTdG9yYWdlU2VydmljZS5nZW5lcmF0ZUlkKCkgfTtcclxuICAgICAgICBMb2NhbFN0b3JhZ2VTZXJ2aWNlLnNhdmVUYXNrKGxvY2FsVGFzayk7XHJcbiAgICAgICAgY2FsZW5kYXIuYWRkRXZlbnQobG9jYWxUYXNrKTtcclxuICAgICAgICByZXR1cm4gbG9jYWxUYXNrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgYXN5bmMgZnVuY3Rpb24gdXBkYXRlVGFzayhkYXRhKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgdXBkYXRlZFRhc2sgPSBhd2FpdCBBcGlTZXJ2aWNlLnVwZGF0ZVRhc2soZGF0YS5pZCwgZGF0YSk7XHJcbiAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrLnJlbW92ZSgpO1xyXG4gICAgICAgIGNhbGVuZGFyLmFkZEV2ZW50KHVwZGF0ZWRUYXNrKTtcclxuICAgICAgICAvLyBVcGRhdGUgbG9jYWxTdG9yYWdlIGFzIGJhY2t1cFxyXG4gICAgICAgIExvY2FsU3RvcmFnZVNlcnZpY2UudXBkYXRlVGFzayhkYXRhLmlkLCB1cGRhdGVkVGFzayk7XHJcbiAgICAgICAgcmV0dXJuIHVwZGF0ZWRUYXNrO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUud2FybihcIlNlcnZlciB1bmF2YWlsYWJsZSwgdXBkYXRpbmcgaW4gbG9jYWxTdG9yYWdlOlwiLCBlcnJvcik7XHJcbiAgICAgICAgY29uc3QgdXBkYXRlZFRhc2sgPSBMb2NhbFN0b3JhZ2VTZXJ2aWNlLnVwZGF0ZVRhc2soZGF0YS5pZCwgZGF0YSk7XHJcbiAgICAgICAgaWYgKHVwZGF0ZWRUYXNrKSB7XHJcbiAgICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sucmVtb3ZlKCk7XHJcbiAgICAgICAgICBjYWxlbmRhci5hZGRFdmVudCh1cGRhdGVkVGFzayk7XHJcbiAgICAgICAgICByZXR1cm4gdXBkYXRlZFRhc2s7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRhc2sgbm90IGZvdW5kIGluIGxvY2FsU3RvcmFnZVwiKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVRhc2soaWQpIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBhd2FpdCBBcGlTZXJ2aWNlLmRlbGV0ZVRhc2soaWQpO1xyXG4gICAgICAgIC8vIFVwZGF0ZSBsb2NhbFN0b3JhZ2VcclxuICAgICAgICBMb2NhbFN0b3JhZ2VTZXJ2aWNlLmRlbGV0ZVRhc2soaWQpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUud2FybihcIlNlcnZlciB1bmF2YWlsYWJsZSwgZGVsZXRpbmcgZnJvbSBsb2NhbFN0b3JhZ2U6XCIsIGVycm9yKTtcclxuICAgICAgICBMb2NhbFN0b3JhZ2VTZXJ2aWNlLmRlbGV0ZVRhc2soaWQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgcmV0dXJuIHtcclxuICAgIC8vIEV4cG9zZSBtZXRob2RzIGlmIG5lZWRlZCBieSBDYXRlZ29yeSBtb2R1bGVcclxuICB9O1xyXG59KSgpOyIsImltcG9ydCB7IEFwaVNlcnZpY2UgfSBmcm9tIFwiLi9hcGlTZXJ2aWNlLmpzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgQ2F0ZWdvcnkgPSAoKCkgPT4ge1xyXG4gIGxldCBjYXRlZ29yaWVzID0gW1xyXG4gICAgeyBpZDogXCJkZWZhdWx0XzFcIiwgbmFtZTogXCJQZXJzb25hbFwiLCBjb2xvcjogXCIjZjU2NTY1XCIgfSxcclxuICAgIHsgaWQ6IFwiZGVmYXVsdF8yXCIsIG5hbWU6IFwiV29ya1wiLCBjb2xvcjogXCIjNjNiM2VkXCIgfSxcclxuICAgIHsgaWQ6IFwiZGVmYXVsdF8zXCIsIG5hbWU6IFwiQ2F0ZWdvcnkgMVwiLCBjb2xvcjogXCIjZjZlMDVlXCIgfSxcclxuICBdO1xyXG5cclxuICAvLyBMb2NhbCBTdG9yYWdlIFNlcnZpY2UgZm9yIENhdGVnb3JpZXNcclxuICBjb25zdCBMb2NhbFN0b3JhZ2VTZXJ2aWNlID0ge1xyXG4gICAgZ2V0Q2F0ZWdvcmllcygpIHtcclxuICAgICAgY29uc3QgY2F0ZWdvcmllcyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwiY2F0ZWdvcmllc1wiKTtcclxuICAgICAgcmV0dXJuIGNhdGVnb3JpZXMgPyBKU09OLnBhcnNlKGNhdGVnb3JpZXMpIDogW107XHJcbiAgICB9LFxyXG4gICAgc2F2ZUNhdGVnb3J5KGNhdGVnb3J5KSB7XHJcbiAgICAgIGNvbnN0IGNhdGVnb3JpZXMgPSB0aGlzLmdldENhdGVnb3JpZXMoKTtcclxuICAgICAgY2F0ZWdvcmllcy5wdXNoKGNhdGVnb3J5KTtcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJjYXRlZ29yaWVzXCIsIEpTT04uc3RyaW5naWZ5KGNhdGVnb3JpZXMpKTtcclxuICAgICAgcmV0dXJuIGNhdGVnb3J5O1xyXG4gICAgfSxcclxuICAgIGRlbGV0ZUNhdGVnb3J5KGlkKSB7XHJcbiAgICAgIGNvbnN0IGNhdGVnb3JpZXMgPSB0aGlzLmdldENhdGVnb3JpZXMoKTtcclxuICAgICAgY29uc3QgdXBkYXRlZENhdGVnb3JpZXMgPSBjYXRlZ29yaWVzLmZpbHRlcigoYykgPT4gYy5pZCAhPT0gaWQpO1xyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImNhdGVnb3JpZXNcIiwgSlNPTi5zdHJpbmdpZnkodXBkYXRlZENhdGVnb3JpZXMpKTtcclxuICAgICAgLy8gVXBkYXRlIHRhc2tzIHRvIGNsZWFyIGRlbGV0ZWQgY2F0ZWdvcnlcclxuICAgICAgdGhpcy5jbGVhckNhdGVnb3J5RnJvbVRhc2tzKGlkKTtcclxuICAgIH0sXHJcbiAgICBjbGVhckNhdGVnb3J5RnJvbVRhc2tzKGNhdGVnb3J5SWQpIHtcclxuICAgICAgY29uc3QgdGFza3MgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidGFza3NcIikgfHwgXCJbXVwiKTtcclxuICAgICAgY29uc3QgdXBkYXRlZFRhc2tzID0gdGFza3MubWFwKCh0YXNrKSA9PiB7XHJcbiAgICAgICAgaWYgKHRhc2suY2F0ZWdvcnkgPT09IGNhdGVnb3J5SWQpIHtcclxuICAgICAgICAgIHJldHVybiB7IC4uLnRhc2ssIGNhdGVnb3J5OiBudWxsIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiB0YXNrO1xyXG4gICAgICB9KTtcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ0YXNrc1wiLCBKU09OLnN0cmluZ2lmeSh1cGRhdGVkVGFza3MpKTtcclxuICAgIH0sXHJcbiAgICBnZW5lcmF0ZUlkKCkge1xyXG4gICAgICByZXR1cm4gXCJsb2NhbF9jYXRfXCIgKyBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMiwgOSk7IC8vIFNpbXBsZSB1bmlxdWUgSUQgZm9yIGxvY2FsIGNhdGVnb3JpZXNcclxuICAgIH0sXHJcbiAgfTtcclxuXHJcbiAgLy8gSGVscGVyIGZ1bmN0aW9ucyBkZWZpbmVkIG91dHNpZGUgRE9NQ29udGVudExvYWRlZFxyXG4gIGZ1bmN0aW9uIHJlbmRlckNhdGVnb3JpZXMoKSB7XHJcbiAgICBjb25zdCBjYXRlZ29yaWVzQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRlZ29yaWVzLWNvbnRhaW5lclwiKTtcclxuICAgIGNvbnN0IGFkZE5ld0NhdGVnb3J5QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGQtbmV3LWNhdGVnb3J5LWJ0blwiKTtcclxuICAgIGNvbnN0IG5ld0NhdGVnb3J5Rm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3LWNhdGVnb3J5LWZvcm1cIik7XHJcblxyXG4gICAgY2F0ZWdvcmllc0NvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xyXG5cclxuICAgIGNhdGVnb3JpZXMuZm9yRWFjaCgoY2F0ZWdvcnksIGluZGV4KSA9PiB7XHJcbiAgICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xyXG4gICAgICBsaS5jbGFzc05hbWUgPSBcImNhdGVnb3J5LWl0ZW1cIjtcclxuICAgICAgbGkuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhdGVnb3J5LWNvbnRlbnRcIj5cclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjYXRlZ29yeS1jb2xvclwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogJHtjYXRlZ29yeS5jb2xvcn07XCI+PC9zcGFuPiBcclxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjYXRlZ29yeS1uYW1lXCI+JHtjYXRlZ29yeS5uYW1lfTwvc3Bhbj5cclxuICAgICAgICAgIDwvZGl2PlxyXG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImRlbGV0ZS1jYXRlZ29yeS1idG5cIiBkYXRhLWlkPVwiJHtjYXRlZ29yeS5pZH1cIj5cclxuICAgICAgICAgICAgPGkgY2xhc3M9XCJmYXMgZmEtdHJhc2hcIj48L2k+XHJcbiAgICAgICAgICA8L2J1dHRvbj5cclxuICAgICAgICBgO1xyXG4gICAgICBjYXRlZ29yaWVzQ29udGFpbmVyLmFwcGVuZENoaWxkKGxpKTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgdG8gZGVsZXRlIGJ1dHRvbnNcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZGVsZXRlLWNhdGVnb3J5LWJ0blwiKS5mb3JFYWNoKChidG4pID0+IHtcclxuICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xyXG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgY29uc3QgaWQgPSBidG4uZGF0YXNldC5pZDtcclxuICAgICAgICBkZWxldGVDYXRlZ29yeShpZCk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQWRkIHRoZSBcIkFkZCBOZXcgQ2F0ZWdvcnlcIiBidXR0b24gYW5kIGZvcm0gYmFja1xyXG4gICAgY2F0ZWdvcmllc0NvbnRhaW5lci5hcHBlbmRDaGlsZChhZGROZXdDYXRlZ29yeUJ0bik7XHJcbiAgICBjYXRlZ29yaWVzQ29udGFpbmVyLmFwcGVuZENoaWxkKG5ld0NhdGVnb3J5Rm9ybSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB1cGRhdGVDYXRlZ29yeVNlbGVjdCgpIHtcclxuICAgIGNvbnN0IGNhdGVnb3J5U2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRlZ29yeVwiKTtcclxuICAgIGNhdGVnb3J5U2VsZWN0LmlubmVySFRNTCA9IFwiXCI7XHJcblxyXG4gICAgLy8gQWRkIFwiTm9uZVwiIG9wdGlvbiBmaXJzdFxyXG4gICAgY29uc3Qgbm9uZU9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XHJcbiAgICBub25lT3B0aW9uLnZhbHVlID0gXCJOb25lXCI7XHJcbiAgICBub25lT3B0aW9uLnRleHRDb250ZW50ID0gXCJOb25lXCI7XHJcbiAgICBjYXRlZ29yeVNlbGVjdC5hcHBlbmRDaGlsZChub25lT3B0aW9uKTtcclxuXHJcbiAgICAvLyBBZGQgYWxsIGNhdGVnb3J5IG9wdGlvbnNcclxuICAgIGNhdGVnb3JpZXMuZm9yRWFjaCgoY2F0ZWdvcnkpID0+IHtcclxuICAgICAgY29uc3Qgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKTtcclxuICAgICAgb3B0aW9uLnZhbHVlID0gY2F0ZWdvcnkubmFtZTtcclxuICAgICAgb3B0aW9uLnRleHRDb250ZW50ID0gY2F0ZWdvcnkubmFtZTtcclxuICAgICAgY2F0ZWdvcnlTZWxlY3QuYXBwZW5kQ2hpbGQob3B0aW9uKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gZGVsZXRlQ2F0ZWdvcnkoaWQpIHtcclxuICAgIGNvbnN0IGluZGV4ID0gY2F0ZWdvcmllcy5maW5kSW5kZXgoKGMpID0+IGMuaWQgPT09IGlkKTtcclxuICAgIGlmIChpbmRleCA+PSAwKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgZGVsZXRlZENhdGVnb3J5TmFtZSA9IGNhdGVnb3JpZXNbaW5kZXhdLm5hbWU7XHJcbiAgICAgICAgLy8gRGVsZXRlIGNhdGVnb3J5IHZpYSBBUElcclxuICAgICAgICBhd2FpdCBBcGlTZXJ2aWNlLmRlbGV0ZUNhdGVnb3J5KGlkKTtcclxuICAgICAgICBjYXRlZ29yaWVzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgLy8gVXBkYXRlIHRhc2tzIHZpYSBBUElcclxuICAgICAgICBhd2FpdCBBcGlTZXJ2aWNlLmNsZWFyQ2F0ZWdvcnlGcm9tVGFza3MoZGVsZXRlZENhdGVnb3J5TmFtZSk7XHJcbiAgICAgICAgLy8gVXBkYXRlIGxvY2FsU3RvcmFnZSBhcyBiYWNrdXBcclxuICAgICAgICBMb2NhbFN0b3JhZ2VTZXJ2aWNlLmRlbGV0ZUNhdGVnb3J5KGlkKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oXCJTZXJ2ZXIgdW5hdmFpbGFibGUsIGRlbGV0aW5nIGZyb20gbG9jYWxTdG9yYWdlOlwiLCBlcnJvcik7XHJcbiAgICAgICAgLy8gRGVsZXRlIGZyb20gbG9jYWwgY2F0ZWdvcmllc1xyXG4gICAgICAgIGNhdGVnb3JpZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICBMb2NhbFN0b3JhZ2VTZXJ2aWNlLmRlbGV0ZUNhdGVnb3J5KGlkKTtcclxuICAgICAgfVxyXG4gICAgICByZW5kZXJDYXRlZ29yaWVzKCk7XHJcbiAgICAgIHVwZGF0ZUNhdGVnb3J5U2VsZWN0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBjb25zdCBjYXRlZ29yeVNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2F0ZWdvcnlcIik7XHJcbiAgICBjb25zdCBjYXRlZ29yaWVzQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRlZ29yaWVzLWNvbnRhaW5lclwiKTtcclxuICAgIGNvbnN0IGFkZE5ld0NhdGVnb3J5QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGQtbmV3LWNhdGVnb3J5LWJ0blwiKTtcclxuICAgIGNvbnN0IG5ld0NhdGVnb3J5Rm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3LWNhdGVnb3J5LWZvcm1cIik7XHJcbiAgICBjb25zdCBjcmVhdGVDYXRlZ29yeUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3JlYXRlLWNhdGVnb3J5LWJ0blwiKTtcclxuXHJcbiAgICAvLyBGZXRjaCBjYXRlZ29yaWVzIGZyb20gQVBJIG9yIGxvY2FsU3RvcmFnZVxyXG4gICAgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZUNhdGVnb3JpZXMoKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY2F0ZWdvcmllcyA9IGF3YWl0IEFwaVNlcnZpY2UuZmV0Y2hDYXRlZ29yaWVzKCk7XHJcbiAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xyXG4gICAgICAgIHVwZGF0ZUNhdGVnb3J5U2VsZWN0KCk7XHJcbiAgICAgICAgLy8gU2F2ZSBzZXJ2ZXIgY2F0ZWdvcmllcyB0byBsb2NhbFN0b3JhZ2UgYXMgYmFja3VwXHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJjYXRlZ29yaWVzXCIsIEpTT04uc3RyaW5naWZ5KGNhdGVnb3JpZXMpKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLndhcm4oXCJTZXJ2ZXIgdW5hdmFpbGFibGUsIHVzaW5nIGxvY2FsU3RvcmFnZTpcIiwgZXJyb3IpO1xyXG4gICAgICAgIGNhdGVnb3JpZXMgPSBMb2NhbFN0b3JhZ2VTZXJ2aWNlLmdldENhdGVnb3JpZXMoKTtcclxuICAgICAgICByZW5kZXJDYXRlZ29yaWVzKCk7XHJcbiAgICAgICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGluaXRpYWxpemVDYXRlZ29yaWVzKCk7XHJcblxyXG4gICAgLy8gQ2F0ZWdvcnkgbWFuYWdlbWVudFxyXG4gICAgYWRkTmV3Q2F0ZWdvcnlCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgbmV3Q2F0ZWdvcnlGb3JtLnN0eWxlLmRpc3BsYXkgPVxyXG4gICAgICAgIG5ld0NhdGVnb3J5Rm9ybS5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIiA/IFwiZmxleFwiIDogXCJub25lXCI7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjcmVhdGVDYXRlZ29yeUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKCkgPT4ge1xyXG4gICAgICBjb25zdCBuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctY2F0ZWdvcnktbmFtZVwiKS52YWx1ZS50cmltKCk7XHJcbiAgICAgIGNvbnN0IGNvbG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctY2F0ZWdvcnktY29sb3JcIikudmFsdWU7XHJcblxyXG4gICAgICBpZiAobmFtZSkge1xyXG4gICAgICAgIGNvbnN0IG5ld0NhdGVnb3J5ID0ge1xyXG4gICAgICAgICAgaWQ6IExvY2FsU3RvcmFnZVNlcnZpY2UuZ2VuZXJhdGVJZCgpLFxyXG4gICAgICAgICAgbmFtZSxcclxuICAgICAgICAgIGNvbG9yLFxyXG4gICAgICAgIH07XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIC8vIEFkZCBuZXcgY2F0ZWdvcnkgdmlhIEFQSVxyXG4gICAgICAgICAgY29uc3QgYXBpQ2F0ZWdvcnkgPSBhd2FpdCBBcGlTZXJ2aWNlLmNyZWF0ZUNhdGVnb3J5KHsgbmFtZSwgY29sb3IgfSk7XHJcbiAgICAgICAgICBjYXRlZ29yaWVzLnB1c2goYXBpQ2F0ZWdvcnkpO1xyXG4gICAgICAgICAgLy8gU2F2ZSB0byBsb2NhbFN0b3JhZ2UgYXMgYmFja3VwXHJcbiAgICAgICAgICBMb2NhbFN0b3JhZ2VTZXJ2aWNlLnNhdmVDYXRlZ29yeShhcGlDYXRlZ29yeSk7XHJcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICAgIGNvbnNvbGUud2FybihcIlNlcnZlciB1bmF2YWlsYWJsZSwgc2F2aW5nIHRvIGxvY2FsU3RvcmFnZTpcIiwgZXJyb3IpO1xyXG4gICAgICAgICAgY2F0ZWdvcmllcy5wdXNoKG5ld0NhdGVnb3J5KTtcclxuICAgICAgICAgIExvY2FsU3RvcmFnZVNlcnZpY2Uuc2F2ZUNhdGVnb3J5KG5ld0NhdGVnb3J5KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xyXG4gICAgICAgIHVwZGF0ZUNhdGVnb3J5U2VsZWN0KCk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IGZvcm1cclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1uYW1lXCIpLnZhbHVlID0gXCJcIjtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1jb2xvclwiKS52YWx1ZSA9IFwiI2NjY2NjY1wiO1xyXG4gICAgICAgIG5ld0NhdGVnb3J5Rm9ybS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgZ2V0Q2F0ZWdvcmllczogKCkgPT4gY2F0ZWdvcmllcyxcclxuICAgIHJlbmRlckNhdGVnb3JpZXMsXHJcbiAgICB1cGRhdGVDYXRlZ29yeVNlbGVjdCxcclxuICB9O1xyXG59KSgpOyIsImV4cG9ydCBjb25zdCBEb21VdGlscyA9ICgoKSA9PiB7XHJcbiAgZnVuY3Rpb24gY2xlYXJNZXNzYWdlcygpIHtcclxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVzc2FnZUNvbnRhaW5lclwiKTtcclxuICAgIGlmIChjb250YWluZXIpIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgZG9jdW1lbnRcclxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZXJyb3ItbWVzc2FnZSwgLnN1Y2Nlc3MtbWVzc2FnZVwiKVxyXG4gICAgICAuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICBpZiAoZWwucGFyZW50Tm9kZSAhPT0gY29udGFpbmVyKSBlbC5yZW1vdmUoKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzaG93TWVzc2FnZShtZXNzYWdlLCB0eXBlID0gXCJlcnJvclwiKSB7XHJcbiAgICBjbGVhck1lc3NhZ2VzKCk7XHJcbiAgICBjb25zdCBtZXNzYWdlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBtZXNzYWdlRWxlbWVudC5jbGFzc05hbWUgPVxyXG4gICAgICB0eXBlID09PSBcImVycm9yXCIgPyBcImVycm9yLW1lc3NhZ2VcIiA6IFwic3VjY2Vzcy1tZXNzYWdlXCI7XHJcbiAgICBtZXNzYWdlLnNwbGl0KFwiXFxuXCIpLmZvckVhY2goKGxpbmUpID0+IHtcclxuICAgICAgY29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xyXG4gICAgICBwLnRleHRDb250ZW50ID0gbGluZTtcclxuICAgICAgbWVzc2FnZUVsZW1lbnQuYXBwZW5kQ2hpbGQocCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lc3NhZ2VDb250YWluZXJcIik7XHJcbiAgICBpZiAoY29udGFpbmVyKSB7XHJcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChtZXNzYWdlRWxlbWVudCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdXRoRm9ybVwiKTtcclxuICAgICAgZm9ybVxyXG4gICAgICAgID8gZm9ybS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShtZXNzYWdlRWxlbWVudCwgZm9ybSlcclxuICAgICAgICA6IGRvY3VtZW50LmJvZHkucHJlcGVuZChtZXNzYWdlRWxlbWVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgY2xlYXJNZXNzYWdlcyxcclxuICAgIHNob3dFcnJvcjogKG1zZykgPT4gc2hvd01lc3NhZ2UobXNnLCBcImVycm9yXCIpLFxyXG4gICAgc2hvd1N1Y2Nlc3M6IChtc2cpID0+IHNob3dNZXNzYWdlKG1zZywgXCJzdWNjZXNzXCIpLFxyXG4gIH07XHJcbn0pKCk7XHJcbiIsImV4cG9ydCBjb25zdCBMb2FkZXIgPSAoKCkgPT4ge1xyXG4gIGZ1bmN0aW9uIHRvZ2dsZShzaG93KSB7XHJcbiAgICBsZXQgbG9hZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkZXJcIik7XHJcbiAgICBpZiAoIWxvYWRlciAmJiBzaG93KSBsb2FkZXIgPSBjcmVhdGUoKTtcclxuICAgIGlmIChsb2FkZXIpIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gc2hvdyA/IFwiZmxleFwiIDogXCJub25lXCI7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgICBjb25zdCBsb2FkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgbG9hZGVyLmlkID0gXCJsb2FkZXJcIjtcclxuICAgIGxvYWRlci5jbGFzc05hbWUgPSBcImxvYWRlclwiO1xyXG4gICAgbG9hZGVyLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwic3Bpbm5lclwiPjwvZGl2Pic7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxvYWRlcik7XHJcbiAgICByZXR1cm4gbG9hZGVyO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgdG9nZ2xlIH07XHJcbn0pKCk7XHJcbiIsImltcG9ydCB7IExvYWRlciB9IGZyb20gXCIuL2xvYWRlci5qc1wiO1xyXG5pbXBvcnQgeyBEb21VdGlscyB9IGZyb20gXCIuL2RvbVV0aWxzLmpzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgVXNlciA9ICgoKSA9PiB7XHJcbiAgYXN5bmMgZnVuY3Rpb24gbG9nb3V0KCkge1xyXG4gICAgY29uc29sZS5sb2coXCJBdHRlbXB0aW5nIGxvZ291dC4uLlwiKTtcclxuICAgIExvYWRlci50b2dnbGUodHJ1ZSk7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFwiL2FwaS9sb2dvdXRcIiwge1xyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczogeyBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKTtcclxuICAgICAgaWYgKCFyZXNwb25zZS5vaylcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICBkYXRhLmVycm9yIHx8IGBMb2dvdXQgZmFpbGVkIHdpdGggc3RhdHVzOiAke3Jlc3BvbnNlLnN0YXR1c31gXHJcbiAgICAgICAgKTtcclxuICAgICAgY29uc29sZS5sb2coXCJMb2dvdXQgc3VjY2Vzc2Z1bCB2aWEgQVBJLlwiKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJMb2dvdXQgQVBJIGNhbGwgZmFpbGVkOlwiLCBlcnJvcik7XHJcbiAgICAgIERvbVV0aWxzLnNob3dFcnJvcihcclxuICAgICAgICBcIkNvdWxkIG5vdCBwcm9wZXJseSBsb2cgb3V0LiBDbGVhciBjb29raWVzIG1hbnVhbGx5IGlmIG5lZWRlZC5cIlxyXG4gICAgICApO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJ1c2VyXCIpO1xyXG4gICAgICBMb2FkZXIudG9nZ2xlKGZhbHNlKTtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9sb2dpblwiO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZGlzcGxheVVzZXJEYXRhKCkge1xyXG4gICAgY29uc3QgdXNlckRhdGFTdHJpbmcgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInVzZXJcIik7XHJcbiAgICBpZiAoIXVzZXJEYXRhU3RyaW5nKSByZXR1cm4gbG9nb3V0KCk7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCB1c2VyRGF0YSA9IEpTT04ucGFyc2UodXNlckRhdGFTdHJpbmcpO1xyXG4gICAgICBjb25zdCB1c2VyTmFtZSA9IHVzZXJEYXRhLm5hbWUgfHwgXCJVc2VyXCI7XHJcbiAgICAgIGNvbnN0IHVzZXJOYW1lRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlci1uYW1lLWRpc3BsYXlcIik7XHJcbiAgICAgIGlmICh1c2VyTmFtZURpc3BsYXkpIHVzZXJOYW1lRGlzcGxheS50ZXh0Q29udGVudCA9IHVzZXJOYW1lO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiSW52YWxpZCB1c2VyIGRhdGEgaW4gbG9jYWxTdG9yYWdlLlwiKTtcclxuICAgICAgbG9nb3V0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyBsb2dvdXQsIGRpc3BsYXlVc2VyRGF0YSB9O1xyXG59KSgpO1xyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi9tb2R1bGVzL3VzZXIuanNcIjtcclxuaW1wb3J0IHsgQXV0aCB9IGZyb20gXCIuL21vZHVsZXMvYXV0aC5qc1wiO1xyXG5pbXBvcnQgeyBUb2RvIH0gZnJvbSBcIi4vbW9kdWxlcy9jYWxlbmRhci5qc1wiO1xyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xyXG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09IFwiL2FwcFwiKSB7XHJcbiAgICBVc2VyLmRpc3BsYXlVc2VyRGF0YSgpO1xyXG4gIH1cclxuICBjb25zdCBsb2dvdXRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1sb2dvdXRcIik7XHJcbiAgaWYgKGxvZ291dEJ0bikgbG9nb3V0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBVc2VyLmxvZ291dCk7XHJcblxyXG4gIGNvbnNvbGUubG9nKFwiTWFpbiBhcHAgaW5pdGlhbGl6ZWQuXCIpO1xyXG59KTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9