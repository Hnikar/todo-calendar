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

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("task-form");
    const formHeading = document.getElementById("form-heading");
    const submitButton = document.getElementById("submit-button");
    const deleteButton = document.getElementById("delete-button");
    const cancelButton = document.getElementById("cancel-button");
    const addTaskButton = document.querySelector(
      ".content-header-container > button"
    );

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

    // Fetch tasks from API and render calendar
    async function initializeCalendar() {
      try {
        const tasks = await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.fetchTasks();
        tasks.forEach((task) => calendar.addEvent(task));
        calendar.render();
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    }

    initializeCalendar();

    // Event Listeners
    addTaskButton.addEventListener("click", () => {
      isEditing = false;
      currentEditingTask = null;
      form.reset();
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
        updateFormUI();
      } catch (error) {
        console.error("Failed to save task:", error);
      }
    });

    deleteButton.addEventListener("click", async () => {
      if (currentEditingTask) {
        try {
          await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.deleteTask(currentEditingTask.id);
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
      return {
        id: isEditing ? currentEditingTask.id : undefined, // ID is managed by server
        title: document.getElementById("title").value,
        start: document.getElementById("taskDate").value,
        end: document.getElementById("taskDate").value,
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
      const newTask = await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.createTask(data);
      calendar.addEvent(newTask);
    }

    async function updateTask(data) {
      const updatedTask = await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.updateTask(data.id, data);
      currentEditingTask.remove();
      calendar.addEvent(updatedTask);
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
    { name: "Personal", color: "#f56565" },
    { name: "Work", color: "#63b3ed" },
    { name: "Category 1", color: "#f6e05e" },
  ];

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
          <button class="delete-category-btn" data-index="${index}">
            <i class="fas fa-trash"></i>
          </button>
        `;
      categoriesContainer.appendChild(li);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-category-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        deleteCategory(index);
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

  async function deleteCategory(index) {
    if (index >= 0 && index < categories.length) {
      try {
        const deletedCategoryName = categories[index].name;
        // Delete category via API
        await _apiService_js__WEBPACK_IMPORTED_MODULE_0__.ApiService.deleteCategory(categories[index].id);
        categories.splice(index, 1);

        // Update tasks that were using this category
        await _apiService_js__WEBPACK_IMPORTED_MODULE_0__.ApiService.clearCategoryFromTasks(deletedCategoryName);

        renderCategories();
        updateCategorySelect();
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const categorySelect = document.getElementById("category");
    const categoriesContainer = document.getElementById("categories-container");
    const addNewCategoryBtn = document.getElementById("add-new-category-btn");
    const newCategoryForm = document.getElementById("new-category-form");
    const createCategoryBtn = document.getElementById("create-category-btn");

    // Fetch categories from API
    async function initializeCategories() {
      try {
        categories = await _apiService_js__WEBPACK_IMPORTED_MODULE_0__.ApiService.fetchCategories();
        renderCategories();
        updateCategorySelect();
      } catch (error) {
        console.error("Failed to fetch categories:", error);
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
        try {
          // Add new category via API
          const newCategory = await _apiService_js__WEBPACK_IMPORTED_MODULE_0__.ApiService.createCategory({ name, color });
          categories.push(newCategory);
          renderCategories();
          updateCategorySelect();

          // Reset form
          document.getElementById("new-category-name").value = "";
          document.getElementById("new-category-color").value = "#cccccc";
          newCategoryForm.style.display = "none";
        } catch (error) {
          console.error("Failed to create category:", error);
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Ozs7QUN0Q007QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1gsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUNqQm9DO0FBQ0k7QUFDekM7QUFDTztBQUNQO0FBQ0E7QUFDQSxJQUFJLDhDQUFNO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLDRCQUE0QjtBQUMvQyxPQUFPO0FBQ1A7QUFDQSx3REFBd0Q7QUFDeEQ7QUFDQTtBQUNBLHNEQUFzRCxnQkFBZ0I7QUFDdEU7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU0sa0RBQVE7QUFDZDtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTSw4Q0FBTTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYLENBQUM7Ozs7Ozs7VUM5Q0Q7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7O0FDTnlDO0FBQ0E7QUFDSTtBQUM3QztBQUNBO0FBQ0E7QUFDQSxJQUFJLGtEQUFJO0FBQ1I7QUFDQTtBQUNBLHFEQUFxRCxrREFBSTtBQUN6RDtBQUNBO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2FwaVNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvYXV0aC5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9jYWxlbmRhci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9jYXRlZ29yeS5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9kb21VdGlscy5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9sb2FkZXIuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvdXNlci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vc3RhdGljL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTG9hZGVyIH0gZnJvbSBcIi4vbG9hZGVyLmpzXCI7XHJcbmltcG9ydCB7IERvbVV0aWxzIH0gZnJvbSBcIi4vZG9tVXRpbHMuanNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBBcGlTZXJ2aWNlID0gKCgpID0+IHtcclxuICBjb25zdCBBUElfQkFTRSA9IFwiL2FwaVwiO1xyXG5cclxuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVSZXF1ZXN0KHVybCwgbWV0aG9kLCBkYXRhKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBMb2FkZXIudG9nZ2xlKHRydWUpO1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke0FQSV9CQVNFfSR7dXJsfWAsIHtcclxuICAgICAgICBtZXRob2QsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVkZW50aWFsczogXCJpbmNsdWRlXCIsXHJcbiAgICAgICAgYm9keTogZGF0YSA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogdW5kZWZpbmVkLFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwMSkge1xyXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvbG9naW4/cmVhc29uPXVuYXV0aGVudGljYXRlZFwiO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG5cclxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihyZXNwb25zZURhdGEuZXJyb3IgfHwgXCJSZXF1ZXN0IGZhaWxlZFwiKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmVzcG9uc2VEYXRhO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgRG9tVXRpbHMuc2hvd0Vycm9yKGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICB0aHJvdyBlcnJvcjtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIExvYWRlci50b2dnbGUoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIC8vIFRhc2stcmVsYXRlZCBlbmRwb2ludHNcclxuICAgIGNyZWF0ZVRhc2s6ICh0YXNrKSA9PiBoYW5kbGVSZXF1ZXN0KFwiL3Rhc2tzXCIsIFwiUE9TVFwiLCB0YXNrKSxcclxuICAgIHVwZGF0ZVRhc2s6IChpZCwgdGFzaykgPT4gaGFuZGxlUmVxdWVzdChgL3Rhc2tzLyR7aWR9YCwgXCJQVVRcIiwgdGFzayksXHJcbiAgICBkZWxldGVUYXNrOiAoaWQpID0+IGhhbmRsZVJlcXVlc3QoYC90YXNrcy8ke2lkfWAsIFwiREVMRVRFXCIpLFxyXG4gICAgZmV0Y2hUYXNrczogKCkgPT4gaGFuZGxlUmVxdWVzdChcIi90YXNrc1wiLCBcIkdFVFwiKSxcclxuICAgIC8vIENhdGVnb3J5LXJlbGF0ZWQgZW5kcG9pbnRzXHJcbiAgICBjcmVhdGVDYXRlZ29yeTogKGNhdGVnb3J5KSA9PlxyXG4gICAgICBoYW5kbGVSZXF1ZXN0KFwiL2NhdGVnb3JpZXNcIiwgXCJQT1NUXCIsIGNhdGVnb3J5KSxcclxuICAgIGZldGNoQ2F0ZWdvcmllczogKCkgPT4gaGFuZGxlUmVxdWVzdChcIi9jYXRlZ29yaWVzXCIsIFwiR0VUXCIpLFxyXG4gICAgZGVsZXRlQ2F0ZWdvcnk6IChpZCkgPT4gaGFuZGxlUmVxdWVzdChgL2NhdGVnb3JpZXMvJHtpZH1gLCBcIkRFTEVURVwiKSxcclxuICAgIGNsZWFyQ2F0ZWdvcnlGcm9tVGFza3M6IChjYXRlZ29yeU5hbWUpID0+XHJcbiAgICAgIGhhbmRsZVJlcXVlc3QoYC90YXNrcy9jbGVhci1jYXRlZ29yeS8ke2NhdGVnb3J5TmFtZX1gLCBcIlBBVENIXCIpLFxyXG4gIH07XHJcbn0pKCk7XHJcbiIsImltcG9ydCB7IExvYWRlciB9IGZyb20gXCIuL2xvYWRlci5qc1wiO1xyXG5pbXBvcnQgeyBEb21VdGlscyB9IGZyb20gXCIuL2RvbVV0aWxzLmpzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgQXV0aCA9ICgoKSA9PiB7XHJcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xyXG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvbG9naW5cIikge1xyXG4gICAgICBpbml0KCk7XHJcbiAgICAgIGNoZWNrUmVkaXJlY3RSZWFzb24oKTtcclxuICAgIH1cclxuICB9KTtcclxuXHJcbiAgZnVuY3Rpb24gaW5pdCgpIHtcclxuICAgIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1dGhGb3JtXCIpO1xyXG4gICAgaWYgKCFmb3JtKSByZXR1cm4gY29uc29sZS5lcnJvcihcIkF1dGggZm9ybSBub3QgZm91bmQhXCIpO1xyXG5cclxuICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBoYW5kbGVTdWJtaXQpO1xyXG4gICAgc3dpdGNoTW9kZShcImxvZ2luXCIpO1xyXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLW1vZGVdXCIpLmZvckVhY2goKHRhYikgPT5cclxuICAgICAgdGFiLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgc3dpdGNoTW9kZSh0YWIuZGF0YXNldC5tb2RlKTtcclxuICAgICAgfSlcclxuICAgICk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzd2l0Y2hNb2RlKG1vZGUpIHtcclxuICAgIGNvbnN0IG5hbWVGaWVsZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpZWxkXCIpO1xyXG4gICAgY29uc3Qgc3VibWl0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2F1dGhGb3JtIGJ1dHRvblt0eXBlPVwic3VibWl0XCJdJyk7XHJcbiAgICBjb25zdCBwYXNzd29yZElucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXNzd29yZFwiKTtcclxuICAgIGNvbnN0IHRhYnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRhYlwiKTtcclxuXHJcbiAgICBpZiAobmFtZUZpZWxkKSB7XHJcbiAgICAgIG5hbWVGaWVsZC5zdHlsZS5kaXNwbGF5ID0gbW9kZSA9PT0gXCJyZWdpc3RlclwiID8gXCJibG9ja1wiIDogXCJub25lXCI7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZVwiKS5yZXF1aXJlZCA9IG1vZGUgPT09IFwicmVnaXN0ZXJcIjtcclxuICAgIH1cclxuICAgIHRhYnMuZm9yRWFjaCgodGFiKSA9PlxyXG4gICAgICB0YWIuY2xhc3NMaXN0LnRvZ2dsZShcImFjdGl2ZVwiLCB0YWIuZGF0YXNldC5tb2RlID09PSBtb2RlKVxyXG4gICAgKTtcclxuICAgIGlmIChzdWJtaXRCdG4pXHJcbiAgICAgIHN1Ym1pdEJ0bi50ZXh0Q29udGVudCA9IG1vZGUgPT09IFwibG9naW5cIiA/IFwiTG9naW5cIiA6IFwiUmVnaXN0ZXJcIjtcclxuICAgIGlmIChwYXNzd29yZElucHV0KVxyXG4gICAgICBwYXNzd29yZElucHV0LmF1dG9jb21wbGV0ZSA9XHJcbiAgICAgICAgbW9kZSA9PT0gXCJsb2dpblwiID8gXCJjdXJyZW50LXBhc3N3b3JkXCIgOiBcIm5ldy1wYXNzd29yZFwiO1xyXG5cclxuICAgIERvbVV0aWxzLmNsZWFyTWVzc2FnZXMoKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVN1Ym1pdChlKSB7XHJcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICBEb21VdGlscy5jbGVhck1lc3NhZ2VzKCk7XHJcbiAgICBMb2FkZXIudG9nZ2xlKHRydWUpO1xyXG5cclxuICAgIGNvbnN0IGlzTG9naW4gPSBkb2N1bWVudFxyXG4gICAgICAucXVlcnlTZWxlY3RvcignW2RhdGEtbW9kZT1cImxvZ2luXCJdJylcclxuICAgICAgLmNsYXNzTGlzdC5jb250YWlucyhcImFjdGl2ZVwiKTtcclxuICAgIGNvbnN0IHVybCA9IGlzTG9naW4gPyBcIi9hcGkvbG9naW5cIiA6IFwiL2FwaS9yZWdpc3RlclwiO1xyXG4gICAgY29uc3QgZm9ybURhdGEgPSB7XHJcbiAgICAgIGVtYWlsOiBnZXRWYWwoXCJlbWFpbFwiKSxcclxuICAgICAgcGFzc3dvcmQ6IGdldFZhbChcInBhc3N3b3JkXCIpLFxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoIWlzTG9naW4pIGZvcm1EYXRhLm5hbWUgPSBnZXRWYWwoXCJuYW1lXCIpO1xyXG5cclxuICAgIHRyeSB7XHJcbiAgICAgIHZhbGlkYXRlKGZvcm1EYXRhLCBpc0xvZ2luKTtcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHtcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgICAgQWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGZvcm1EYXRhKSxcclxuICAgICAgfSk7XHJcbiAgICAgIGF3YWl0IGhhbmRsZVJlc3BvbnNlKHJlc3BvbnNlLCBpc0xvZ2luKTtcclxuICAgIH0gY2F0Y2ggKGVycikge1xyXG4gICAgICBEb21VdGlscy5zaG93RXJyb3IoZXJyLm1lc3NhZ2UgfHwgXCJVbmV4cGVjdGVkIGVycm9yIGR1cmluZyBzdWJtaXNzaW9uLlwiKTtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIExvYWRlci50b2dnbGUoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0VmFsKGlkKSB7XHJcbiAgICBjb25zdCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcclxuICAgIHJldHVybiBlbCA/IGVsLnZhbHVlLnRyaW0oKSA6IFwiXCI7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiB2YWxpZGF0ZShkYXRhLCBpc0xvZ2luKSB7XHJcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcclxuICAgIGNvbnN0IGVtYWlsUmVnZXggPSAvXlteXFxzQF0rQFteXFxzQF0rXFwuW15cXHNAXSskLztcclxuXHJcbiAgICBpZiAoIWRhdGEuZW1haWwpIGVycm9ycy5wdXNoKFwiRW1haWwgaXMgcmVxdWlyZWQuXCIpO1xyXG4gICAgZWxzZSBpZiAoIWVtYWlsUmVnZXgudGVzdChkYXRhLmVtYWlsKSkgZXJyb3JzLnB1c2goXCJJbnZhbGlkIGVtYWlsIGZvcm1hdC5cIik7XHJcbiAgICBpZiAoIWRhdGEucGFzc3dvcmQpIGVycm9ycy5wdXNoKFwiUGFzc3dvcmQgaXMgcmVxdWlyZWQuXCIpO1xyXG4gICAgZWxzZSBpZiAoZGF0YS5wYXNzd29yZC5sZW5ndGggPCA4ICYmICFpc0xvZ2luKVxyXG4gICAgICBlcnJvcnMucHVzaChcIlBhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzLlwiKTtcclxuICAgIGlmICghaXNMb2dpbiAmJiAoIWRhdGEubmFtZSB8fCBkYXRhLm5hbWUubGVuZ3RoIDwgMikpXHJcbiAgICAgIGVycm9ycy5wdXNoKFwiTmFtZSBtdXN0IGJlIGF0IGxlYXN0IDIgY2hhcmFjdGVycy5cIik7XHJcblxyXG4gICAgaWYgKGVycm9ycy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcihlcnJvcnMuam9pbihcIlxcblwiKSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXNwb25zZSwgaXNMb2dpbikge1xyXG4gICAgY29uc3QgaXNKc29uID0gcmVzcG9uc2UuaGVhZGVyc1xyXG4gICAgICAuZ2V0KFwiY29udGVudC10eXBlXCIpXHJcbiAgICAgID8uaW5jbHVkZXMoXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xyXG4gICAgY29uc3QgZGF0YSA9IGlzSnNvblxyXG4gICAgICA/IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxyXG4gICAgICA6IHsgbWVzc2FnZTogYXdhaXQgcmVzcG9uc2UudGV4dCgpIH07XHJcblxyXG4gICAgaWYgKCFyZXNwb25zZS5vaylcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGRhdGEuZXJyb3IgfHwgYEVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcclxuXHJcbiAgICBpZiAoaXNMb2dpbikge1xyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInVzZXJcIiwgSlNPTi5zdHJpbmdpZnkoZGF0YS51c2VyIHx8IHt9KSk7XHJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvYXBwXCI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBEb21VdGlscy5zaG93U3VjY2VzcyhcclxuICAgICAgICBkYXRhLm1lc3NhZ2UgfHwgXCJSZWdpc3RyYXRpb24gc3VjY2Vzc2Z1bC4gUGxlYXNlIGxvZ2luLlwiXHJcbiAgICAgICk7XHJcbiAgICAgIHN3aXRjaE1vZGUoXCJsb2dpblwiKTtcclxuICAgICAgW1wiZW1haWxcIiwgXCJwYXNzd29yZFwiLCBcIm5hbWVcIl0uZm9yRWFjaCgoaWQpID0+IHtcclxuICAgICAgICBjb25zdCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcclxuICAgICAgICBpZiAoZWwpIGVsLnZhbHVlID0gXCJcIjtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjaGVja1JlZGlyZWN0UmVhc29uKCkge1xyXG4gICAgY29uc3QgcmVhc29uID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhsb2NhdGlvbi5zZWFyY2gpLmdldChcInJlYXNvblwiKTtcclxuICAgIGNvbnN0IG1lc3NhZ2VzID0ge1xyXG4gICAgICB1bmF1dGhlbnRpY2F0ZWQ6IFwiUGxlYXNlIGxvZyBpbiB0byBhY2Nlc3MgdGhlIGFwcGxpY2F0aW9uLlwiLFxyXG4gICAgICBpbnZhbGlkX3Rva2VuOiBcIlNlc3Npb24gZXhwaXJlZC4gUGxlYXNlIGxvZyBpbiBhZ2Fpbi5cIixcclxuICAgICAgYmFkX3Rva2VuX2NsYWltczogXCJTZXNzaW9uIGRhdGEgaXNzdWUuIFBsZWFzZSBsb2cgaW4gYWdhaW4uXCIsXHJcbiAgICB9O1xyXG4gICAgaWYgKHJlYXNvbiAmJiBtZXNzYWdlc1tyZWFzb25dKSBEb21VdGlscy5zaG93RXJyb3IobWVzc2FnZXNbcmVhc29uXSk7XHJcbiAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZShudWxsLCBcIlwiLCBsb2NhdGlvbi5wYXRobmFtZSk7XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyBpbml0IH07XHJcbn0pKCk7XHJcbiIsImltcG9ydCB7IENhdGVnb3J5IH0gZnJvbSBcIi4vY2F0ZWdvcnkuanNcIjtcclxuaW1wb3J0IHsgQXBpU2VydmljZSB9IGZyb20gXCIuL2FwaVNlcnZpY2UuanNcIjsgLy8gSW1wb3J0IEFwaVNlcnZpY2VcclxuXHJcbmV4cG9ydCBjb25zdCBUb2RvID0gKCgpID0+IHtcclxuICBsZXQgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcclxuICBsZXQgaXNFZGl0aW5nID0gZmFsc2U7XHJcblxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhc2stZm9ybVwiKTtcclxuICAgIGNvbnN0IGZvcm1IZWFkaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb3JtLWhlYWRpbmdcIik7XHJcbiAgICBjb25zdCBzdWJtaXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1Ym1pdC1idXR0b25cIik7XHJcbiAgICBjb25zdCBkZWxldGVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbGV0ZS1idXR0b25cIik7XHJcbiAgICBjb25zdCBjYW5jZWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbmNlbC1idXR0b25cIik7XHJcbiAgICBjb25zdCBhZGRUYXNrQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgXCIuY29udGVudC1oZWFkZXItY29udGFpbmVyID4gYnV0dG9uXCJcclxuICAgICk7XHJcblxyXG4gICAgLy8gQ2FsZW5kYXIgaW5pdGlhbGl6YXRpb25cclxuICAgIGNvbnN0IGNhbGVuZGFyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbGVuZGFyXCIpO1xyXG4gICAgY29uc3QgY2FsZW5kYXIgPSBuZXcgRnVsbENhbGVuZGFyLkNhbGVuZGFyKGNhbGVuZGFyRWwsIHtcclxuICAgICAgaW5pdGlhbFZpZXc6IFwiZGF5R3JpZE1vbnRoXCIsXHJcbiAgICAgIGhlYWRlclRvb2xiYXI6IHtcclxuICAgICAgICBsZWZ0OiBcInByZXYsbmV4dCB0b2RheVwiLFxyXG4gICAgICAgIGNlbnRlcjogXCJ0aXRsZVwiLFxyXG4gICAgICAgIHJpZ2h0OiBcImRheUdyaWRNb250aCx0aW1lR3JpZFdlZWssdGltZUdyaWREYXlcIixcclxuICAgICAgfSxcclxuICAgICAgZWRpdGFibGU6IHRydWUsXHJcbiAgICAgIHNlbGVjdGFibGU6IHRydWUsXHJcbiAgICAgIHNlbGVjdE1pcnJvcjogdHJ1ZSxcclxuICAgICAgZGF5TWF4RXZlbnRzOiB0cnVlLFxyXG4gICAgICBldmVudHM6IFtdLCAvLyBJbml0aWFsaXplIGVtcHR5LCBwb3B1bGF0ZSB2aWEgZmV0Y2hUYXNrc1xyXG4gICAgICBldmVudENsaWNrOiBmdW5jdGlvbiAoaW5mbykge1xyXG4gICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzayA9IGluZm8uZXZlbnQ7XHJcbiAgICAgICAgaXNFZGl0aW5nID0gdHJ1ZTtcclxuICAgICAgICBwb3B1bGF0ZUZvcm0oaW5mby5ldmVudCk7XHJcbiAgICAgICAgdXBkYXRlRm9ybVVJKCk7XHJcbiAgICAgIH0sXHJcbiAgICAgIGV2ZW50RGlkTW91bnQ6IGZ1bmN0aW9uIChpbmZvKSB7XHJcbiAgICAgICAgY29uc3QgaXNDb21wbGV0ZWQgPSBpbmZvLmV2ZW50LmV4dGVuZGVkUHJvcHMuY29tcGxldGVkO1xyXG4gICAgICAgIGlmIChpc0NvbXBsZXRlZCkge1xyXG4gICAgICAgICAgaW5mby5lbC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiNkM2QzZDNcIjtcclxuICAgICAgICAgIGluZm8uZWwuc3R5bGUudGV4dERlY29yYXRpb24gPSBcImxpbmUtdGhyb3VnaFwiO1xyXG4gICAgICAgICAgaW5mby5lbC5zdHlsZS5vcGFjaXR5ID0gXCIwLjdcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIC8vIEFwcGx5IGNhdGVnb3J5IGNvbG9yIChoYW5kbGVkIGJ5IENhdGVnb3J5IG1vZHVsZSlcclxuICAgICAgICBjb25zdCBjYXRlZ29yeSA9IGluZm8uZXZlbnQuZXh0ZW5kZWRQcm9wcy5jYXRlZ29yeTtcclxuICAgICAgICBpZiAoY2F0ZWdvcnkgJiYgY2F0ZWdvcnkgIT09IFwiTm9uZVwiKSB7XHJcbiAgICAgICAgICBjb25zdCBjYXQgPSBDYXRlZ29yeS5nZXRDYXRlZ29yaWVzKCkuZmluZCgoYykgPT4gYy5uYW1lID09PSBjYXRlZ29yeSk7XHJcbiAgICAgICAgICBpZiAoY2F0KSB7XHJcbiAgICAgICAgICAgIGluZm8uZWwuc3R5bGUuYm9yZGVyTGVmdCA9IGA0cHggc29saWQgJHtjYXQuY29sb3J9YDtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaW5mby5lbC5zdHlsZS5ib3JkZXJMZWZ0ID0gXCI0cHggc29saWQgdHJhbnNwYXJlbnRcIjtcclxuICAgICAgICB9XHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBGZXRjaCB0YXNrcyBmcm9tIEFQSSBhbmQgcmVuZGVyIGNhbGVuZGFyXHJcbiAgICBhc3luYyBmdW5jdGlvbiBpbml0aWFsaXplQ2FsZW5kYXIoKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgdGFza3MgPSBhd2FpdCBBcGlTZXJ2aWNlLmZldGNoVGFza3MoKTtcclxuICAgICAgICB0YXNrcy5mb3JFYWNoKCh0YXNrKSA9PiBjYWxlbmRhci5hZGRFdmVudCh0YXNrKSk7XHJcbiAgICAgICAgY2FsZW5kYXIucmVuZGVyKCk7XHJcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBmZXRjaCB0YXNrczpcIiwgZXJyb3IpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdGlhbGl6ZUNhbGVuZGFyKCk7XHJcblxyXG4gICAgLy8gRXZlbnQgTGlzdGVuZXJzXHJcbiAgICBhZGRUYXNrQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgIGlzRWRpdGluZyA9IGZhbHNlO1xyXG4gICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xyXG4gICAgICBmb3JtLnJlc2V0KCk7XHJcbiAgICAgIHVwZGF0ZUZvcm1VSSgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGFzeW5jIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgY29uc3QgZm9ybURhdGEgPSBnZXRGb3JtRGF0YSgpO1xyXG5cclxuICAgICAgdHJ5IHtcclxuICAgICAgICBpZiAoaXNFZGl0aW5nKSB7XHJcbiAgICAgICAgICBhd2FpdCB1cGRhdGVUYXNrKGZvcm1EYXRhKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYXdhaXQgY3JlYXRlVGFzayhmb3JtRGF0YSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvcm0ucmVzZXQoKTtcclxuICAgICAgICB1cGRhdGVGb3JtVUkoKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHNhdmUgdGFzazpcIiwgZXJyb3IpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBkZWxldGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jICgpID0+IHtcclxuICAgICAgaWYgKGN1cnJlbnRFZGl0aW5nVGFzaykge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBhd2FpdCBBcGlTZXJ2aWNlLmRlbGV0ZVRhc2soY3VycmVudEVkaXRpbmdUYXNrLmlkKTtcclxuICAgICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzay5yZW1vdmUoKTtcclxuICAgICAgICAgIGZvcm0ucmVzZXQoKTtcclxuICAgICAgICAgIGlzRWRpdGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcclxuICAgICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGRlbGV0ZSB0YXNrOlwiLCBlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBjYW5jZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgZm9ybS5yZXNldCgpO1xyXG4gICAgICBpc0VkaXRpbmcgPSBmYWxzZTtcclxuICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcclxuICAgICAgdXBkYXRlRm9ybVVJKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIZWxwZXIgZnVuY3Rpb25zXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVGb3JtVUkoKSB7XHJcbiAgICAgIGlmIChpc0VkaXRpbmcpIHtcclxuICAgICAgICBmb3JtSGVhZGluZy50ZXh0Q29udGVudCA9IFwiRWRpdCBUYXNrXCI7XHJcbiAgICAgICAgc3VibWl0QnV0dG9uLnRleHRDb250ZW50ID0gXCJTYXZlIENoYW5nZXNcIjtcclxuICAgICAgICBkZWxldGVCdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICBjYW5jZWxCdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICBhZGRUYXNrQnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmb3JtSGVhZGluZy50ZXh0Q29udGVudCA9IFwiQWRkIE5ldyBUYXNrXCI7XHJcbiAgICAgICAgc3VibWl0QnV0dG9uLnRleHRDb250ZW50ID0gXCJBZGQgVGFza1wiO1xyXG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGNhbmNlbEJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGFkZFRhc2tCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBvcHVsYXRlRm9ybShldmVudCkge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpdGxlXCIpLnZhbHVlID0gZXZlbnQudGl0bGU7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFza0RhdGVcIikudmFsdWUgPSBldmVudC5zdGFydFN0ci5zdWJzdHJpbmcoXHJcbiAgICAgICAgMCxcclxuICAgICAgICAxMFxyXG4gICAgICApO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlc2NyaXB0aW9uXCIpLnZhbHVlID1cclxuICAgICAgICBldmVudC5leHRlbmRlZFByb3BzLmRlc2NyaXB0aW9uIHx8IFwiXCI7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlcIikudmFsdWUgPVxyXG4gICAgICAgIGV2ZW50LmV4dGVuZGVkUHJvcHMucHJpb3JpdHkgfHwgXCJsb3dcIjtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRlZ29yeVwiKS52YWx1ZSA9XHJcbiAgICAgICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5jYXRlZ29yeSB8fCBcIk5vbmVcIjtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb21wbGV0ZWRcIikuY2hlY2tlZCA9XHJcbiAgICAgICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5jb21wbGV0ZWQgfHwgZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0Rm9ybURhdGEoKSB7XHJcbiAgICAgIGNvbnN0IGNhdGVnb3J5VmFsdWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3J5XCIpLnZhbHVlO1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGlkOiBpc0VkaXRpbmcgPyBjdXJyZW50RWRpdGluZ1Rhc2suaWQgOiB1bmRlZmluZWQsIC8vIElEIGlzIG1hbmFnZWQgYnkgc2VydmVyXHJcbiAgICAgICAgdGl0bGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGl0bGVcIikudmFsdWUsXHJcbiAgICAgICAgc3RhcnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFza0RhdGVcIikudmFsdWUsXHJcbiAgICAgICAgZW5kOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhc2tEYXRlXCIpLnZhbHVlLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlc2NyaXB0aW9uXCIpLnZhbHVlLFxyXG4gICAgICAgIHByaW9yaXR5OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5XCIpLnZhbHVlLFxyXG4gICAgICAgIGNhdGVnb3J5OiBjYXRlZ29yeVZhbHVlID09PSBcIk5vbmVcIiA/IG51bGwgOiBjYXRlZ29yeVZhbHVlLFxyXG4gICAgICAgIGNvbXBsZXRlZDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb21wbGV0ZWRcIikuY2hlY2tlZCxcclxuICAgICAgICBjbGFzc05hbWU6IGBwcmlvcml0eS0ke2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlcIikudmFsdWV9ICR7XHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbXBsZXRlZFwiKS5jaGVja2VkID8gXCJjb21wbGV0ZWQtdGFza1wiIDogXCJcIlxyXG4gICAgICAgIH1gLFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVRhc2soZGF0YSkge1xyXG4gICAgICBjb25zdCBuZXdUYXNrID0gYXdhaXQgQXBpU2VydmljZS5jcmVhdGVUYXNrKGRhdGEpO1xyXG4gICAgICBjYWxlbmRhci5hZGRFdmVudChuZXdUYXNrKTtcclxuICAgIH1cclxuXHJcbiAgICBhc3luYyBmdW5jdGlvbiB1cGRhdGVUYXNrKGRhdGEpIHtcclxuICAgICAgY29uc3QgdXBkYXRlZFRhc2sgPSBhd2FpdCBBcGlTZXJ2aWNlLnVwZGF0ZVRhc2soZGF0YS5pZCwgZGF0YSk7XHJcbiAgICAgIGN1cnJlbnRFZGl0aW5nVGFzay5yZW1vdmUoKTtcclxuICAgICAgY2FsZW5kYXIuYWRkRXZlbnQodXBkYXRlZFRhc2spO1xyXG4gICAgfVxyXG4gIH0pO1xyXG4gIHJldHVybiB7XHJcbiAgICAvLyBFeHBvc2UgbWV0aG9kcyBpZiBuZWVkZWQgYnkgQ2F0ZWdvcnkgbW9kdWxlXHJcbiAgfTtcclxufSkoKTtcclxuIiwiaW1wb3J0IHsgQXBpU2VydmljZSB9IGZyb20gXCIuL2FwaVNlcnZpY2UuanNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBDYXRlZ29yeSA9ICgoKSA9PiB7XHJcbiAgbGV0IGNhdGVnb3JpZXMgPSBbXHJcbiAgICB7IG5hbWU6IFwiUGVyc29uYWxcIiwgY29sb3I6IFwiI2Y1NjU2NVwiIH0sXHJcbiAgICB7IG5hbWU6IFwiV29ya1wiLCBjb2xvcjogXCIjNjNiM2VkXCIgfSxcclxuICAgIHsgbmFtZTogXCJDYXRlZ29yeSAxXCIsIGNvbG9yOiBcIiNmNmUwNWVcIiB9LFxyXG4gIF07XHJcblxyXG4gIC8vIEhlbHBlciBmdW5jdGlvbnMgZGVmaW5lZCBvdXRzaWRlIERPTUNvbnRlbnRMb2FkZWRcclxuICBmdW5jdGlvbiByZW5kZXJDYXRlZ29yaWVzKCkge1xyXG4gICAgY29uc3QgY2F0ZWdvcmllc0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2F0ZWdvcmllcy1jb250YWluZXJcIik7XHJcbiAgICBjb25zdCBhZGROZXdDYXRlZ29yeUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkLW5ldy1jYXRlZ29yeS1idG5cIik7XHJcbiAgICBjb25zdCBuZXdDYXRlZ29yeUZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1mb3JtXCIpO1xyXG5cclxuICAgIGNhdGVnb3JpZXNDb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcclxuXHJcbiAgICBjYXRlZ29yaWVzLmZvckVhY2goKGNhdGVnb3J5LCBpbmRleCkgPT4ge1xyXG4gICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcclxuICAgICAgbGkuY2xhc3NOYW1lID0gXCJjYXRlZ29yeS1pdGVtXCI7XHJcbiAgICAgIGxpLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXRlZ29yeS1jb250ZW50XCI+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY2F0ZWdvcnktY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6ICR7Y2F0ZWdvcnkuY29sb3J9O1wiPjwvc3Bhbj4gXHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY2F0ZWdvcnktbmFtZVwiPiR7Y2F0ZWdvcnkubmFtZX08L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJkZWxldGUtY2F0ZWdvcnktYnRuXCIgZGF0YS1pbmRleD1cIiR7aW5kZXh9XCI+XHJcbiAgICAgICAgICAgIDxpIGNsYXNzPVwiZmFzIGZhLXRyYXNoXCI+PC9pPlxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgYDtcclxuICAgICAgY2F0ZWdvcmllc0NvbnRhaW5lci5hcHBlbmRDaGlsZChsaSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIHRvIGRlbGV0ZSBidXR0b25zXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmRlbGV0ZS1jYXRlZ29yeS1idG5cIikuZm9yRWFjaCgoYnRuKSA9PiB7XHJcbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gcGFyc2VJbnQoYnRuLmRhdGFzZXQuaW5kZXgpO1xyXG4gICAgICAgIGRlbGV0ZUNhdGVnb3J5KGluZGV4KTtcclxuICAgICAgfSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBZGQgdGhlIFwiQWRkIE5ldyBDYXRlZ29yeVwiIGJ1dHRvbiBhbmQgZm9ybSBiYWNrXHJcbiAgICBjYXRlZ29yaWVzQ29udGFpbmVyLmFwcGVuZENoaWxkKGFkZE5ld0NhdGVnb3J5QnRuKTtcclxuICAgIGNhdGVnb3JpZXNDb250YWluZXIuYXBwZW5kQ2hpbGQobmV3Q2F0ZWdvcnlGb3JtKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHVwZGF0ZUNhdGVnb3J5U2VsZWN0KCkge1xyXG4gICAgY29uc3QgY2F0ZWdvcnlTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3J5XCIpO1xyXG4gICAgY2F0ZWdvcnlTZWxlY3QuaW5uZXJIVE1MID0gXCJcIjtcclxuXHJcbiAgICAvLyBBZGQgXCJOb25lXCIgb3B0aW9uIGZpcnN0XHJcbiAgICBjb25zdCBub25lT3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKTtcclxuICAgIG5vbmVPcHRpb24udmFsdWUgPSBcIk5vbmVcIjtcclxuICAgIG5vbmVPcHRpb24udGV4dENvbnRlbnQgPSBcIk5vbmVcIjtcclxuICAgIGNhdGVnb3J5U2VsZWN0LmFwcGVuZENoaWxkKG5vbmVPcHRpb24pO1xyXG5cclxuICAgIC8vIEFkZCBhbGwgY2F0ZWdvcnkgb3B0aW9uc1xyXG4gICAgY2F0ZWdvcmllcy5mb3JFYWNoKChjYXRlZ29yeSkgPT4ge1xyXG4gICAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xyXG4gICAgICBvcHRpb24udmFsdWUgPSBjYXRlZ29yeS5uYW1lO1xyXG4gICAgICBvcHRpb24udGV4dENvbnRlbnQgPSBjYXRlZ29yeS5uYW1lO1xyXG4gICAgICBjYXRlZ29yeVNlbGVjdC5hcHBlbmRDaGlsZChvcHRpb24pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBkZWxldGVDYXRlZ29yeShpbmRleCkge1xyXG4gICAgaWYgKGluZGV4ID49IDAgJiYgaW5kZXggPCBjYXRlZ29yaWVzLmxlbmd0aCkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGRlbGV0ZWRDYXRlZ29yeU5hbWUgPSBjYXRlZ29yaWVzW2luZGV4XS5uYW1lO1xyXG4gICAgICAgIC8vIERlbGV0ZSBjYXRlZ29yeSB2aWEgQVBJXHJcbiAgICAgICAgYXdhaXQgQXBpU2VydmljZS5kZWxldGVDYXRlZ29yeShjYXRlZ29yaWVzW2luZGV4XS5pZCk7XHJcbiAgICAgICAgY2F0ZWdvcmllcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG5cclxuICAgICAgICAvLyBVcGRhdGUgdGFza3MgdGhhdCB3ZXJlIHVzaW5nIHRoaXMgY2F0ZWdvcnlcclxuICAgICAgICBhd2FpdCBBcGlTZXJ2aWNlLmNsZWFyQ2F0ZWdvcnlGcm9tVGFza3MoZGVsZXRlZENhdGVnb3J5TmFtZSk7XHJcblxyXG4gICAgICAgIHJlbmRlckNhdGVnb3JpZXMoKTtcclxuICAgICAgICB1cGRhdGVDYXRlZ29yeVNlbGVjdCgpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZGVsZXRlIGNhdGVnb3J5OlwiLCBlcnJvcik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnN0IGNhdGVnb3J5U2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRlZ29yeVwiKTtcclxuICAgIGNvbnN0IGNhdGVnb3JpZXNDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3JpZXMtY29udGFpbmVyXCIpO1xyXG4gICAgY29uc3QgYWRkTmV3Q2F0ZWdvcnlCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZC1uZXctY2F0ZWdvcnktYnRuXCIpO1xyXG4gICAgY29uc3QgbmV3Q2F0ZWdvcnlGb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctY2F0ZWdvcnktZm9ybVwiKTtcclxuICAgIGNvbnN0IGNyZWF0ZUNhdGVnb3J5QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjcmVhdGUtY2F0ZWdvcnktYnRuXCIpO1xyXG5cclxuICAgIC8vIEZldGNoIGNhdGVnb3JpZXMgZnJvbSBBUElcclxuICAgIGFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemVDYXRlZ29yaWVzKCkge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNhdGVnb3JpZXMgPSBhd2FpdCBBcGlTZXJ2aWNlLmZldGNoQ2F0ZWdvcmllcygpO1xyXG4gICAgICAgIHJlbmRlckNhdGVnb3JpZXMoKTtcclxuICAgICAgICB1cGRhdGVDYXRlZ29yeVNlbGVjdCgpO1xyXG4gICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZmV0Y2ggY2F0ZWdvcmllczpcIiwgZXJyb3IpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaW5pdGlhbGl6ZUNhdGVnb3JpZXMoKTtcclxuXHJcbiAgICAvLyBDYXRlZ29yeSBtYW5hZ2VtZW50XHJcbiAgICBhZGROZXdDYXRlZ29yeUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICBuZXdDYXRlZ29yeUZvcm0uc3R5bGUuZGlzcGxheSA9XHJcbiAgICAgICAgbmV3Q2F0ZWdvcnlGb3JtLnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiID8gXCJmbGV4XCIgOiBcIm5vbmVcIjtcclxuICAgIH0pO1xyXG5cclxuICAgIGNyZWF0ZUNhdGVnb3J5QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IG5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1uYW1lXCIpLnZhbHVlLnRyaW0oKTtcclxuICAgICAgY29uc3QgY29sb3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1jb2xvclwiKS52YWx1ZTtcclxuXHJcbiAgICAgIGlmIChuYW1lKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIC8vIEFkZCBuZXcgY2F0ZWdvcnkgdmlhIEFQSVxyXG4gICAgICAgICAgY29uc3QgbmV3Q2F0ZWdvcnkgPSBhd2FpdCBBcGlTZXJ2aWNlLmNyZWF0ZUNhdGVnb3J5KHsgbmFtZSwgY29sb3IgfSk7XHJcbiAgICAgICAgICBjYXRlZ29yaWVzLnB1c2gobmV3Q2F0ZWdvcnkpO1xyXG4gICAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xyXG4gICAgICAgICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKTtcclxuXHJcbiAgICAgICAgICAvLyBSZXNldCBmb3JtXHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1uYW1lXCIpLnZhbHVlID0gXCJcIjtcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3LWNhdGVnb3J5LWNvbG9yXCIpLnZhbHVlID0gXCIjY2NjY2NjXCI7XHJcbiAgICAgICAgICBuZXdDYXRlZ29yeUZvcm0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGNyZWF0ZSBjYXRlZ29yeTpcIiwgZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBnZXRDYXRlZ29yaWVzOiAoKSA9PiBjYXRlZ29yaWVzLFxyXG4gICAgcmVuZGVyQ2F0ZWdvcmllcyxcclxuICAgIHVwZGF0ZUNhdGVnb3J5U2VsZWN0LFxyXG4gIH07XHJcbn0pKCk7XHJcbiIsImV4cG9ydCBjb25zdCBEb21VdGlscyA9ICgoKSA9PiB7XHJcbiAgZnVuY3Rpb24gY2xlYXJNZXNzYWdlcygpIHtcclxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVzc2FnZUNvbnRhaW5lclwiKTtcclxuICAgIGlmIChjb250YWluZXIpIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgZG9jdW1lbnRcclxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZXJyb3ItbWVzc2FnZSwgLnN1Y2Nlc3MtbWVzc2FnZVwiKVxyXG4gICAgICAuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICBpZiAoZWwucGFyZW50Tm9kZSAhPT0gY29udGFpbmVyKSBlbC5yZW1vdmUoKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzaG93TWVzc2FnZShtZXNzYWdlLCB0eXBlID0gXCJlcnJvclwiKSB7XHJcbiAgICBjbGVhck1lc3NhZ2VzKCk7XHJcbiAgICBjb25zdCBtZXNzYWdlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBtZXNzYWdlRWxlbWVudC5jbGFzc05hbWUgPVxyXG4gICAgICB0eXBlID09PSBcImVycm9yXCIgPyBcImVycm9yLW1lc3NhZ2VcIiA6IFwic3VjY2Vzcy1tZXNzYWdlXCI7XHJcbiAgICBtZXNzYWdlLnNwbGl0KFwiXFxuXCIpLmZvckVhY2goKGxpbmUpID0+IHtcclxuICAgICAgY29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xyXG4gICAgICBwLnRleHRDb250ZW50ID0gbGluZTtcclxuICAgICAgbWVzc2FnZUVsZW1lbnQuYXBwZW5kQ2hpbGQocCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lc3NhZ2VDb250YWluZXJcIik7XHJcbiAgICBpZiAoY29udGFpbmVyKSB7XHJcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChtZXNzYWdlRWxlbWVudCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdXRoRm9ybVwiKTtcclxuICAgICAgZm9ybVxyXG4gICAgICAgID8gZm9ybS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShtZXNzYWdlRWxlbWVudCwgZm9ybSlcclxuICAgICAgICA6IGRvY3VtZW50LmJvZHkucHJlcGVuZChtZXNzYWdlRWxlbWVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgY2xlYXJNZXNzYWdlcyxcclxuICAgIHNob3dFcnJvcjogKG1zZykgPT4gc2hvd01lc3NhZ2UobXNnLCBcImVycm9yXCIpLFxyXG4gICAgc2hvd1N1Y2Nlc3M6IChtc2cpID0+IHNob3dNZXNzYWdlKG1zZywgXCJzdWNjZXNzXCIpLFxyXG4gIH07XHJcbn0pKCk7XHJcbiIsImV4cG9ydCBjb25zdCBMb2FkZXIgPSAoKCkgPT4ge1xyXG4gIGZ1bmN0aW9uIHRvZ2dsZShzaG93KSB7XHJcbiAgICBsZXQgbG9hZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkZXJcIik7XHJcbiAgICBpZiAoIWxvYWRlciAmJiBzaG93KSBsb2FkZXIgPSBjcmVhdGUoKTtcclxuICAgIGlmIChsb2FkZXIpIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gc2hvdyA/IFwiZmxleFwiIDogXCJub25lXCI7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgICBjb25zdCBsb2FkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgbG9hZGVyLmlkID0gXCJsb2FkZXJcIjtcclxuICAgIGxvYWRlci5jbGFzc05hbWUgPSBcImxvYWRlclwiO1xyXG4gICAgbG9hZGVyLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwic3Bpbm5lclwiPjwvZGl2Pic7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxvYWRlcik7XHJcbiAgICByZXR1cm4gbG9hZGVyO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgdG9nZ2xlIH07XHJcbn0pKCk7XHJcbiIsImltcG9ydCB7IExvYWRlciB9IGZyb20gXCIuL2xvYWRlci5qc1wiO1xyXG5pbXBvcnQgeyBEb21VdGlscyB9IGZyb20gXCIuL2RvbVV0aWxzLmpzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgVXNlciA9ICgoKSA9PiB7XHJcbiAgYXN5bmMgZnVuY3Rpb24gbG9nb3V0KCkge1xyXG4gICAgY29uc29sZS5sb2coXCJBdHRlbXB0aW5nIGxvZ291dC4uLlwiKTtcclxuICAgIExvYWRlci50b2dnbGUodHJ1ZSk7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFwiL2FwaS9sb2dvdXRcIiwge1xyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczogeyBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKTtcclxuICAgICAgaWYgKCFyZXNwb25zZS5vaylcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICBkYXRhLmVycm9yIHx8IGBMb2dvdXQgZmFpbGVkIHdpdGggc3RhdHVzOiAke3Jlc3BvbnNlLnN0YXR1c31gXHJcbiAgICAgICAgKTtcclxuICAgICAgY29uc29sZS5sb2coXCJMb2dvdXQgc3VjY2Vzc2Z1bCB2aWEgQVBJLlwiKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJMb2dvdXQgQVBJIGNhbGwgZmFpbGVkOlwiLCBlcnJvcik7XHJcbiAgICAgIERvbVV0aWxzLnNob3dFcnJvcihcclxuICAgICAgICBcIkNvdWxkIG5vdCBwcm9wZXJseSBsb2cgb3V0LiBDbGVhciBjb29raWVzIG1hbnVhbGx5IGlmIG5lZWRlZC5cIlxyXG4gICAgICApO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJ1c2VyXCIpO1xyXG4gICAgICBMb2FkZXIudG9nZ2xlKGZhbHNlKTtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9sb2dpblwiO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZGlzcGxheVVzZXJEYXRhKCkge1xyXG4gICAgY29uc3QgdXNlckRhdGFTdHJpbmcgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInVzZXJcIik7XHJcbiAgICBpZiAoIXVzZXJEYXRhU3RyaW5nKSByZXR1cm4gbG9nb3V0KCk7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCB1c2VyRGF0YSA9IEpTT04ucGFyc2UodXNlckRhdGFTdHJpbmcpO1xyXG4gICAgICBjb25zdCB1c2VyTmFtZSA9IHVzZXJEYXRhLm5hbWUgfHwgXCJVc2VyXCI7XHJcbiAgICAgIGNvbnN0IHVzZXJOYW1lRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlci1uYW1lLWRpc3BsYXlcIik7XHJcbiAgICAgIGlmICh1c2VyTmFtZURpc3BsYXkpIHVzZXJOYW1lRGlzcGxheS50ZXh0Q29udGVudCA9IHVzZXJOYW1lO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiSW52YWxpZCB1c2VyIGRhdGEgaW4gbG9jYWxTdG9yYWdlLlwiKTtcclxuICAgICAgbG9nb3V0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyBsb2dvdXQsIGRpc3BsYXlVc2VyRGF0YSB9O1xyXG59KSgpO1xyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi9tb2R1bGVzL3VzZXIuanNcIjtcclxuaW1wb3J0IHsgQXV0aCB9IGZyb20gXCIuL21vZHVsZXMvYXV0aC5qc1wiO1xyXG5pbXBvcnQgeyBUb2RvIH0gZnJvbSBcIi4vbW9kdWxlcy9jYWxlbmRhci5qc1wiO1xyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xyXG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09IFwiL2FwcFwiKSB7XHJcbiAgICBVc2VyLmRpc3BsYXlVc2VyRGF0YSgpO1xyXG4gIH1cclxuICBjb25zdCBsb2dvdXRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1sb2dvdXRcIik7XHJcbiAgaWYgKGxvZ291dEJ0bikgbG9nb3V0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBVc2VyLmxvZ291dCk7XHJcblxyXG4gIGNvbnNvbGUubG9nKFwiTWFpbiBhcHAgaW5pdGlhbGl6ZWQuXCIpO1xyXG59KTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9