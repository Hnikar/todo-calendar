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
      console.log(responseData);
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
    createTask: (task) => handleRequest("/events", "POST", task),
    updateTask: (id, task) => handleRequest(`/events/${id}`, "PUT", task),
    deleteTask: (id) => handleRequest(`/events/${id}`, "DELETE"),
    fetchTasks: () => handleRequest("/events", "GET"),
    // Category-related endpoints
    createCategory: (category) =>
      handleRequest("/categories", "POST", category),
    fetchCategories: () => handleRequest("/categories", "GET"),
    deleteCategory: (id) => handleRequest(`/categories/${id}`, "DELETE"),
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



const Todo = (() => {
  let currentEditingTask = null;
  let isEditing = false;

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
        events: [],
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

          // Apply category color
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
          id: isEditing ? currentEditingTask.id : undefined,
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
        const newTask = await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.createTask(data);
        calendar.addEvent(newTask);
        return newTask;
      }

      async function updateTask(data) {
        const updatedTask = await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.updateTask(data.id, data);
        currentEditingTask.remove();
        calendar.addEvent(updatedTask);
        return updatedTask;
      }

      async function deleteTask(id) {
        await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.deleteTask(id);
      }
    });
  }
  return {};
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
  let categories = [];

  // Helper functions defined outside DOMContentLoaded
  function renderCategories() {
    const categoriesContainer = document.getElementById("categories-container");
    const addNewCategoryBtn = document.getElementById("add-new-category-btn");
    const newCategoryForm = document.getElementById("new-category-form");

    categoriesContainer.innerHTML = "";

    categories.forEach((category, index) => {
      // Ensure category.id is a string for consistency
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
        // Ensure id is treated as a string
        const id = btn.dataset.id;
        console.log("Attempting to delete category with id:", id);
        console.log("Current categories:", categories);
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
    // Convert id to string for consistency
    const index = categories.findIndex(
      (c) => c.id.toString() === id.toString()
    );
    console.log("deleteCategory called with id:", id, "Found index:", index);

    if (index >= 0) {
      try {
        // Delete category via API
        await _apiService_js__WEBPACK_IMPORTED_MODULE_0__.ApiService.deleteCategory(id);
        // Remove from local state
        categories.splice(index, 1);
        renderCategories();
        updateCategorySelect();
      } catch (error) {
        console.error("Failed to delete category:", error);
        // Optionally show error message to user
      }
    } else {
      console.error("Category not found with id:", id);
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

      // Fetch categories from API
      async function initializeCategories() {
        try {
          categories = await _apiService_js__WEBPACK_IMPORTED_MODULE_0__.ApiService.fetchCategories();
          console.log("Fetched categories:", categories);
          renderCategories();
          updateCategorySelect();
        } catch (error) {
          console.error("Failed to fetch categories:", error);
          // Optionally show error message to user
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
          try {
            // Add new category via API
            const apiCategory = await _apiService_js__WEBPACK_IMPORTED_MODULE_0__.ApiService.createCategory({
              name,
              color,
            });
            categories.push(apiCategory);
            console.log("Added new category:", apiCategory);
            renderCategories();
            updateCategorySelect();

            // Reset form
            document.getElementById("new-category-name").value = "";
            document.getElementById("new-category-color").value = "#cccccc";
            newCategoryForm.style.display = "none";
          } catch (error) {
            console.error("Failed to create category:", error);
            // Optionally show error message to user
          }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQXFDO0FBQ0k7QUFDekM7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTSw4Q0FBTTtBQUNaLHNDQUFzQyxTQUFTLEVBQUUsSUFBSTtBQUNyRDtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ04sTUFBTSxrREFBUTtBQUNkO0FBQ0EsTUFBTTtBQUNOLE1BQU0sOENBQU07QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1REFBdUQsR0FBRztBQUMxRCxpREFBaUQsR0FBRztBQUNwRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EseURBQXlELEdBQUc7QUFDNUQ7QUFDQSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FDakRvQztBQUNJO0FBQ3pDO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxrREFBUTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSSxrREFBUTtBQUNaLElBQUksOENBQU07QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBLE9BQU87QUFDUDtBQUNBLE1BQU07QUFDTixNQUFNLGtEQUFRO0FBQ2QsTUFBTTtBQUNOLE1BQU0sOENBQU07QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSw4Q0FBOEMsZ0JBQWdCO0FBQzlEO0FBQ0E7QUFDQSxpRUFBaUU7QUFDakU7QUFDQSxNQUFNO0FBQ04sTUFBTSxrREFBUTtBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxrREFBUTtBQUM1QztBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1gsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUMxSXdDO0FBQ0k7QUFDN0M7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0Isa0RBQVE7QUFDaEM7QUFDQTtBQUNBO0FBQ0Esc0RBQXNELFVBQVU7QUFDaEU7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsc0RBQVU7QUFDeEM7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxpQ0FBaUMsS0FBSyxHQUFHLFVBQVU7QUFDbkQsNkJBQTZCLEtBQUssR0FBRyxRQUFRO0FBQzdDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGlDQUFpQywyQ0FBMkM7QUFDNUU7QUFDQSxXQUFXO0FBQ1g7QUFDQTtBQUNBO0FBQ0E7QUFDQSw4QkFBOEIsc0RBQVU7QUFDeEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtDQUFrQyxzREFBVTtBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLHNEQUFVO0FBQ3hCO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUNoUDRDO0FBQzdDO0FBQ087QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9FQUFvRSxnQkFBZ0I7QUFDcEYsMENBQTBDLGNBQWM7QUFDeEQ7QUFDQSx5REFBeUQsWUFBWTtBQUNyRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYyxzREFBVTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFFBQVE7QUFDUjtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDZCQUE2QixzREFBVTtBQUN2QztBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNDQUFzQyxzREFBVTtBQUNoRDtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7QUMzSk07QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQ3RDTTtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztBQ2pCb0M7QUFDSTtBQUN6QztBQUNPO0FBQ1A7QUFDQTtBQUNBLElBQUksOENBQU07QUFDVjtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsNEJBQTRCO0FBQy9DLE9BQU87QUFDUDtBQUNBLHdEQUF3RDtBQUN4RDtBQUNBO0FBQ0Esc0RBQXNELGdCQUFnQjtBQUN0RTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTSxrREFBUTtBQUNkO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNLDhDQUFNO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1gsQ0FBQzs7Ozs7OztVQzlDRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7QUNOeUM7QUFDQTtBQUNJO0FBQzdDO0FBQ0E7QUFDQTtBQUNBLElBQUksa0RBQUk7QUFDUjtBQUNBO0FBQ0EscURBQXFELGtEQUFJO0FBQ3pEO0FBQ0E7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvYXBpU2VydmljZS5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9hdXRoLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2NhbGVuZGFyLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2NhdGVnb3J5LmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2RvbVV0aWxzLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2xvYWRlci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy91c2VyLmpzIiwid2VicGFjazovL3N0YXRpYy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3N0YXRpYy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3N0YXRpYy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMb2FkZXIgfSBmcm9tIFwiLi9sb2FkZXIuanNcIjtcclxuaW1wb3J0IHsgRG9tVXRpbHMgfSBmcm9tIFwiLi9kb21VdGlscy5qc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IEFwaVNlcnZpY2UgPSAoKCkgPT4ge1xyXG4gIGNvbnN0IEFQSV9CQVNFID0gXCIvYXBpXCI7XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlcXVlc3QodXJsLCBtZXRob2QsIGRhdGEpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIExvYWRlci50b2dnbGUodHJ1ZSk7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7QVBJX0JBU0V9JHt1cmx9YCwge1xyXG4gICAgICAgIG1ldGhvZCxcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICB9LFxyXG4gICAgICAgIGNyZWRlbnRpYWxzOiBcImluY2x1ZGVcIixcclxuICAgICAgICBib2R5OiBkYXRhID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiB1bmRlZmluZWQsXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XHJcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9sb2dpbj9yZWFzb249dW5hdXRoZW50aWNhdGVkXCI7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCByZXNwb25zZURhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlRGF0YSk7XHJcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzcG9uc2VEYXRhLmVycm9yIHx8IFwiUmVxdWVzdCBmYWlsZWRcIik7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIERvbVV0aWxzLnNob3dFcnJvcihlcnJvci5tZXNzYWdlKTtcclxuICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBMb2FkZXIudG9nZ2xlKGZhbHNlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICAvLyBUYXNrLXJlbGF0ZWQgZW5kcG9pbnRzXHJcbiAgICBjcmVhdGVUYXNrOiAodGFzaykgPT4gaGFuZGxlUmVxdWVzdChcIi9ldmVudHNcIiwgXCJQT1NUXCIsIHRhc2spLFxyXG4gICAgdXBkYXRlVGFzazogKGlkLCB0YXNrKSA9PiBoYW5kbGVSZXF1ZXN0KGAvZXZlbnRzLyR7aWR9YCwgXCJQVVRcIiwgdGFzayksXHJcbiAgICBkZWxldGVUYXNrOiAoaWQpID0+IGhhbmRsZVJlcXVlc3QoYC9ldmVudHMvJHtpZH1gLCBcIkRFTEVURVwiKSxcclxuICAgIGZldGNoVGFza3M6ICgpID0+IGhhbmRsZVJlcXVlc3QoXCIvZXZlbnRzXCIsIFwiR0VUXCIpLFxyXG4gICAgLy8gQ2F0ZWdvcnktcmVsYXRlZCBlbmRwb2ludHNcclxuICAgIGNyZWF0ZUNhdGVnb3J5OiAoY2F0ZWdvcnkpID0+XHJcbiAgICAgIGhhbmRsZVJlcXVlc3QoXCIvY2F0ZWdvcmllc1wiLCBcIlBPU1RcIiwgY2F0ZWdvcnkpLFxyXG4gICAgZmV0Y2hDYXRlZ29yaWVzOiAoKSA9PiBoYW5kbGVSZXF1ZXN0KFwiL2NhdGVnb3JpZXNcIiwgXCJHRVRcIiksXHJcbiAgICBkZWxldGVDYXRlZ29yeTogKGlkKSA9PiBoYW5kbGVSZXF1ZXN0KGAvY2F0ZWdvcmllcy8ke2lkfWAsIFwiREVMRVRFXCIpLFxyXG4gIH07XHJcbn0pKCk7IiwiaW1wb3J0IHsgTG9hZGVyIH0gZnJvbSBcIi4vbG9hZGVyLmpzXCI7XHJcbmltcG9ydCB7IERvbVV0aWxzIH0gZnJvbSBcIi4vZG9tVXRpbHMuanNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBBdXRoID0gKCgpID0+IHtcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9sb2dpblwiKSB7XHJcbiAgICAgIGluaXQoKTtcclxuICAgICAgY2hlY2tSZWRpcmVjdFJlYXNvbigpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXV0aEZvcm1cIik7XHJcbiAgICBpZiAoIWZvcm0pIHJldHVybiBjb25zb2xlLmVycm9yKFwiQXV0aCBmb3JtIG5vdCBmb3VuZCFcIik7XHJcblxyXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGhhbmRsZVN1Ym1pdCk7XHJcbiAgICBzd2l0Y2hNb2RlKFwibG9naW5cIik7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtbW9kZV1cIikuZm9yRWFjaCgodGFiKSA9PlxyXG4gICAgICB0YWIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICBzd2l0Y2hNb2RlKHRhYi5kYXRhc2V0Lm1vZGUpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHN3aXRjaE1vZGUobW9kZSkge1xyXG4gICAgY29uc3QgbmFtZUZpZWxkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmllbGRcIik7XHJcbiAgICBjb25zdCBzdWJtaXRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYXV0aEZvcm0gYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKTtcclxuICAgIGNvbnN0IHBhc3N3b3JkSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhc3N3b3JkXCIpO1xyXG4gICAgY29uc3QgdGFicyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGFiXCIpO1xyXG5cclxuICAgIGlmIChuYW1lRmllbGQpIHtcclxuICAgICAgbmFtZUZpZWxkLnN0eWxlLmRpc3BsYXkgPSBtb2RlID09PSBcInJlZ2lzdGVyXCIgPyBcImJsb2NrXCIgOiBcIm5vbmVcIjtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lXCIpLnJlcXVpcmVkID0gbW9kZSA9PT0gXCJyZWdpc3RlclwiO1xyXG4gICAgfVxyXG4gICAgdGFicy5mb3JFYWNoKCh0YWIpID0+XHJcbiAgICAgIHRhYi5jbGFzc0xpc3QudG9nZ2xlKFwiYWN0aXZlXCIsIHRhYi5kYXRhc2V0Lm1vZGUgPT09IG1vZGUpXHJcbiAgICApO1xyXG4gICAgaWYgKHN1Ym1pdEJ0bilcclxuICAgICAgc3VibWl0QnRuLnRleHRDb250ZW50ID0gbW9kZSA9PT0gXCJsb2dpblwiID8gXCJMb2dpblwiIDogXCJSZWdpc3RlclwiO1xyXG4gICAgaWYgKHBhc3N3b3JkSW5wdXQpXHJcbiAgICAgIHBhc3N3b3JkSW5wdXQuYXV0b2NvbXBsZXRlID1cclxuICAgICAgICBtb2RlID09PSBcImxvZ2luXCIgPyBcImN1cnJlbnQtcGFzc3dvcmRcIiA6IFwibmV3LXBhc3N3b3JkXCI7XHJcblxyXG4gICAgRG9tVXRpbHMuY2xlYXJNZXNzYWdlcygpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3VibWl0KGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIERvbVV0aWxzLmNsZWFyTWVzc2FnZXMoKTtcclxuICAgIExvYWRlci50b2dnbGUodHJ1ZSk7XHJcblxyXG4gICAgY29uc3QgaXNMb2dpbiA9IGRvY3VtZW50XHJcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1tb2RlPVwibG9naW5cIl0nKVxyXG4gICAgICAuY2xhc3NMaXN0LmNvbnRhaW5zKFwiYWN0aXZlXCIpO1xyXG4gICAgY29uc3QgdXJsID0gaXNMb2dpbiA/IFwiL2FwaS9sb2dpblwiIDogXCIvYXBpL3JlZ2lzdGVyXCI7XHJcbiAgICBjb25zdCBmb3JtRGF0YSA9IHtcclxuICAgICAgZW1haWw6IGdldFZhbChcImVtYWlsXCIpLFxyXG4gICAgICBwYXNzd29yZDogZ2V0VmFsKFwicGFzc3dvcmRcIiksXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICghaXNMb2dpbikgZm9ybURhdGEubmFtZSA9IGdldFZhbChcIm5hbWVcIik7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgdmFsaWRhdGUoZm9ybURhdGEsIGlzTG9naW4pO1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZm9ybURhdGEpLFxyXG4gICAgICB9KTtcclxuICAgICAgYXdhaXQgaGFuZGxlUmVzcG9uc2UocmVzcG9uc2UsIGlzTG9naW4pO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIERvbVV0aWxzLnNob3dFcnJvcihlcnIubWVzc2FnZSB8fCBcIlVuZXhwZWN0ZWQgZXJyb3IgZHVyaW5nIHN1Ym1pc3Npb24uXCIpO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgTG9hZGVyLnRvZ2dsZShmYWxzZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRWYWwoaWQpIHtcclxuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xyXG4gICAgcmV0dXJuIGVsID8gZWwudmFsdWUudHJpbSgpIDogXCJcIjtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHZhbGlkYXRlKGRhdGEsIGlzTG9naW4pIHtcclxuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xyXG4gICAgY29uc3QgZW1haWxSZWdleCA9IC9eW15cXHNAXStAW15cXHNAXStcXC5bXlxcc0BdKyQvO1xyXG5cclxuICAgIGlmICghZGF0YS5lbWFpbCkgZXJyb3JzLnB1c2goXCJFbWFpbCBpcyByZXF1aXJlZC5cIik7XHJcbiAgICBlbHNlIGlmICghZW1haWxSZWdleC50ZXN0KGRhdGEuZW1haWwpKSBlcnJvcnMucHVzaChcIkludmFsaWQgZW1haWwgZm9ybWF0LlwiKTtcclxuICAgIGlmICghZGF0YS5wYXNzd29yZCkgZXJyb3JzLnB1c2goXCJQYXNzd29yZCBpcyByZXF1aXJlZC5cIik7XHJcbiAgICBlbHNlIGlmIChkYXRhLnBhc3N3b3JkLmxlbmd0aCA8IDggJiYgIWlzTG9naW4pXHJcbiAgICAgIGVycm9ycy5wdXNoKFwiUGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA4IGNoYXJhY3RlcnMuXCIpO1xyXG4gICAgaWYgKCFpc0xvZ2luICYmICghZGF0YS5uYW1lIHx8IGRhdGEubmFtZS5sZW5ndGggPCAyKSlcclxuICAgICAgZXJyb3JzLnB1c2goXCJOYW1lIG11c3QgYmUgYXQgbGVhc3QgMiBjaGFyYWN0ZXJzLlwiKTtcclxuXHJcbiAgICBpZiAoZXJyb3JzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKGVycm9ycy5qb2luKFwiXFxuXCIpKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlc3BvbnNlLCBpc0xvZ2luKSB7XHJcbiAgICBjb25zdCBpc0pzb24gPSByZXNwb25zZS5oZWFkZXJzXHJcbiAgICAgIC5nZXQoXCJjb250ZW50LXR5cGVcIilcclxuICAgICAgPy5pbmNsdWRlcyhcImFwcGxpY2F0aW9uL2pzb25cIik7XHJcbiAgICBjb25zdCBkYXRhID0gaXNKc29uXHJcbiAgICAgID8gYXdhaXQgcmVzcG9uc2UuanNvbigpXHJcbiAgICAgIDogeyBtZXNzYWdlOiBhd2FpdCByZXNwb25zZS50ZXh0KCkgfTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlLm9rKVxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5lcnJvciB8fCBgRXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xyXG5cclxuICAgIGlmIChpc0xvZ2luKSB7XHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidXNlclwiLCBKU09OLnN0cmluZ2lmeShkYXRhLnVzZXIgfHwge30pKTtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9hcHBcIjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIERvbVV0aWxzLnNob3dTdWNjZXNzKFxyXG4gICAgICAgIGRhdGEubWVzc2FnZSB8fCBcIlJlZ2lzdHJhdGlvbiBzdWNjZXNzZnVsLiBQbGVhc2UgbG9naW4uXCJcclxuICAgICAgKTtcclxuICAgICAgc3dpdGNoTW9kZShcImxvZ2luXCIpO1xyXG4gICAgICBbXCJlbWFpbFwiLCBcInBhc3N3b3JkXCIsIFwibmFtZVwiXS5mb3JFYWNoKChpZCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xyXG4gICAgICAgIGlmIChlbCkgZWwudmFsdWUgPSBcIlwiO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNoZWNrUmVkaXJlY3RSZWFzb24oKSB7XHJcbiAgICBjb25zdCByZWFzb24gPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGxvY2F0aW9uLnNlYXJjaCkuZ2V0KFwicmVhc29uXCIpO1xyXG4gICAgY29uc3QgbWVzc2FnZXMgPSB7XHJcbiAgICAgIHVuYXV0aGVudGljYXRlZDogXCJQbGVhc2UgbG9nIGluIHRvIGFjY2VzcyB0aGUgYXBwbGljYXRpb24uXCIsXHJcbiAgICAgIGludmFsaWRfdG9rZW46IFwiU2Vzc2lvbiBleHBpcmVkLiBQbGVhc2UgbG9nIGluIGFnYWluLlwiLFxyXG4gICAgICBiYWRfdG9rZW5fY2xhaW1zOiBcIlNlc3Npb24gZGF0YSBpc3N1ZS4gUGxlYXNlIGxvZyBpbiBhZ2Fpbi5cIixcclxuICAgIH07XHJcbiAgICBpZiAocmVhc29uICYmIG1lc3NhZ2VzW3JlYXNvbl0pIERvbVV0aWxzLnNob3dFcnJvcihtZXNzYWdlc1tyZWFzb25dKTtcclxuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsIFwiXCIsIGxvY2F0aW9uLnBhdGhuYW1lKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB7IGluaXQgfTtcclxufSkoKTtcclxuIiwiaW1wb3J0IHsgQ2F0ZWdvcnkgfSBmcm9tIFwiLi9jYXRlZ29yeS5qc1wiO1xyXG5pbXBvcnQgeyBBcGlTZXJ2aWNlIH0gZnJvbSBcIi4vYXBpU2VydmljZS5qc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IFRvZG8gPSAoKCkgPT4ge1xyXG4gIGxldCBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xyXG4gIGxldCBpc0VkaXRpbmcgPSBmYWxzZTtcclxuXHJcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvYXBwXCIpIHtcclxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFzay1mb3JtXCIpO1xyXG4gICAgICBjb25zdCBmb3JtSGVhZGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZm9ybS1oZWFkaW5nXCIpO1xyXG4gICAgICBjb25zdCBzdWJtaXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1Ym1pdC1idXR0b25cIik7XHJcbiAgICAgIGNvbnN0IGRlbGV0ZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVsZXRlLWJ1dHRvblwiKTtcclxuICAgICAgY29uc3QgY2FuY2VsQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW5jZWwtYnV0dG9uXCIpO1xyXG4gICAgICBjb25zdCBhZGRUYXNrQnV0dG9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcclxuICAgICAgICBcIi5jb250ZW50LWhlYWRlci1jb250YWluZXIgPiBidXR0b25cIlxyXG4gICAgICApO1xyXG4gICAgICBjb25zdCBhbGxEYXlDaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWxsRGF5XCIpO1xyXG4gICAgICBjb25zdCB0aW1lSW5wdXRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aW1lSW5wdXRzXCIpO1xyXG5cclxuICAgICAgLy8gVG9nZ2xlIHRpbWUgaW5wdXRzIGJhc2VkIG9uIEFsbCBEYXkgY2hlY2tib3hcclxuICAgICAgYWxsRGF5Q2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XHJcbiAgICAgICAgdGltZUlucHV0cy5zdHlsZS5kaXNwbGF5ID0gYWxsRGF5Q2hlY2tib3guY2hlY2tlZCA/IFwibm9uZVwiIDogXCJmbGV4XCI7XHJcbiAgICAgICAgaWYgKGFsbERheUNoZWNrYm94LmNoZWNrZWQpIHtcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLnZhbHVlID0gXCJcIjtcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5kVGltZVwiKS52YWx1ZSA9IFwiXCI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIC8vIENhbGVuZGFyIGluaXRpYWxpemF0aW9uXHJcbiAgICAgIGNvbnN0IGNhbGVuZGFyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbGVuZGFyXCIpO1xyXG4gICAgICBjb25zdCBjYWxlbmRhciA9IG5ldyBGdWxsQ2FsZW5kYXIuQ2FsZW5kYXIoY2FsZW5kYXJFbCwge1xyXG4gICAgICAgIGluaXRpYWxWaWV3OiBcImRheUdyaWRNb250aFwiLFxyXG4gICAgICAgIGhlYWRlclRvb2xiYXI6IHtcclxuICAgICAgICAgIGxlZnQ6IFwicHJldixuZXh0IHRvZGF5XCIsXHJcbiAgICAgICAgICBjZW50ZXI6IFwidGl0bGVcIixcclxuICAgICAgICAgIHJpZ2h0OiBcImRheUdyaWRNb250aCx0aW1lR3JpZFdlZWssdGltZUdyaWREYXlcIixcclxuICAgICAgICB9LFxyXG4gICAgICAgIGVkaXRhYmxlOiB0cnVlLFxyXG4gICAgICAgIHNlbGVjdGFibGU6IHRydWUsXHJcbiAgICAgICAgc2VsZWN0TWlycm9yOiB0cnVlLFxyXG4gICAgICAgIGRheU1heEV2ZW50czogdHJ1ZSxcclxuICAgICAgICBldmVudHM6IFtdLFxyXG4gICAgICAgIGV2ZW50Q2xpY2s6IGZ1bmN0aW9uIChpbmZvKSB7XHJcbiAgICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBpbmZvLmV2ZW50O1xyXG4gICAgICAgICAgaXNFZGl0aW5nID0gdHJ1ZTtcclxuICAgICAgICAgIHBvcHVsYXRlRm9ybShpbmZvLmV2ZW50KTtcclxuICAgICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZXZlbnREaWRNb3VudDogZnVuY3Rpb24gKGluZm8pIHtcclxuICAgICAgICAgIGNvbnN0IGlzQ29tcGxldGVkID0gaW5mby5ldmVudC5leHRlbmRlZFByb3BzLmNvbXBsZXRlZDtcclxuICAgICAgICAgIGlmIChpc0NvbXBsZXRlZCkge1xyXG4gICAgICAgICAgICBpbmZvLmVsLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiI2QzZDNkM1wiO1xyXG4gICAgICAgICAgICBpbmZvLmVsLnN0eWxlLnRleHREZWNvcmF0aW9uID0gXCJsaW5lLXRocm91Z2hcIjtcclxuICAgICAgICAgICAgaW5mby5lbC5zdHlsZS5vcGFjaXR5ID0gXCIwLjdcIjtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAvLyBBcHBseSBjYXRlZ29yeSBjb2xvclxyXG4gICAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBpbmZvLmV2ZW50LmV4dGVuZGVkUHJvcHMuY2F0ZWdvcnk7XHJcbiAgICAgICAgICBpZiAoY2F0ZWdvcnkgJiYgY2F0ZWdvcnkgIT09IFwiTm9uZVwiKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IGNhdCA9IENhdGVnb3J5LmdldENhdGVnb3JpZXMoKS5maW5kKFxyXG4gICAgICAgICAgICAgIChjKSA9PiBjLm5hbWUgPT09IGNhdGVnb3J5XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICAgIGlmIChjYXQpIHtcclxuICAgICAgICAgICAgICBpbmZvLmVsLnN0eWxlLmJvcmRlckxlZnQgPSBgNHB4IHNvbGlkICR7Y2F0LmNvbG9yfWA7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGluZm8uZWwuc3R5bGUuYm9yZGVyTGVmdCA9IFwiNHB4IHNvbGlkIHRyYW5zcGFyZW50XCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBGZXRjaCB0YXNrcyBmcm9tIEFQSSBhbmQgcmVuZGVyIGNhbGVuZGFyXHJcbiAgICAgIGFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemVDYWxlbmRhcigpIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgY29uc3QgdGFza3MgPSBhd2FpdCBBcGlTZXJ2aWNlLmZldGNoVGFza3MoKTtcclxuICAgICAgICAgIHRhc2tzLmZvckVhY2goKHRhc2spID0+IGNhbGVuZGFyLmFkZEV2ZW50KHRhc2spKTtcclxuICAgICAgICAgIGNhbGVuZGFyLnJlbmRlcigpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGZldGNoIHRhc2tzOlwiLCBlcnJvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpbml0aWFsaXplQ2FsZW5kYXIoKTtcclxuXHJcbiAgICAgIC8vIEV2ZW50IExpc3RlbmVyc1xyXG4gICAgICBhZGRUYXNrQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgICAgaXNFZGl0aW5nID0gZmFsc2U7XHJcbiAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcclxuICAgICAgICBmb3JtLnJlc2V0KCk7XHJcbiAgICAgICAgYWxsRGF5Q2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xyXG4gICAgICAgIHRpbWVJbnB1dHMuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xyXG4gICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBhc3luYyBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICBjb25zdCBmb3JtRGF0YSA9IGdldEZvcm1EYXRhKCk7XHJcblxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBpZiAoaXNFZGl0aW5nKSB7XHJcbiAgICAgICAgICAgIGF3YWl0IHVwZGF0ZVRhc2soZm9ybURhdGEpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgYXdhaXQgY3JlYXRlVGFzayhmb3JtRGF0YSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBmb3JtLnJlc2V0KCk7XHJcbiAgICAgICAgICBhbGxEYXlDaGVja2JveC5jaGVja2VkID0gZmFsc2U7XHJcbiAgICAgICAgICB0aW1lSW5wdXRzLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcclxuICAgICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHNhdmUgdGFzazpcIiwgZXJyb3IpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBkZWxldGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jICgpID0+IHtcclxuICAgICAgICBpZiAoY3VycmVudEVkaXRpbmdUYXNrKSB7XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICBhd2FpdCBkZWxldGVUYXNrKGN1cnJlbnRFZGl0aW5nVGFzay5pZCk7XHJcbiAgICAgICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzay5yZW1vdmUoKTtcclxuICAgICAgICAgICAgZm9ybS5yZXNldCgpO1xyXG4gICAgICAgICAgICBpc0VkaXRpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcclxuICAgICAgICAgICAgdXBkYXRlRm9ybVVJKCk7XHJcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGRlbGV0ZSB0YXNrOlwiLCBlcnJvcik7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNhbmNlbEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgIGZvcm0ucmVzZXQoKTtcclxuICAgICAgICBpc0VkaXRpbmcgPSBmYWxzZTtcclxuICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xyXG4gICAgICAgIGFsbERheUNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcclxuICAgICAgICB0aW1lSW5wdXRzLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcclxuICAgICAgICB1cGRhdGVGb3JtVUkoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBIZWxwZXIgZnVuY3Rpb25zXHJcbiAgICAgIGZ1bmN0aW9uIHVwZGF0ZUZvcm1VSSgpIHtcclxuICAgICAgICBpZiAoaXNFZGl0aW5nKSB7XHJcbiAgICAgICAgICBmb3JtSGVhZGluZy50ZXh0Q29udGVudCA9IFwiRWRpdCBUYXNrXCI7XHJcbiAgICAgICAgICBzdWJtaXRCdXR0b24udGV4dENvbnRlbnQgPSBcIlNhdmUgQ2hhbmdlc1wiO1xyXG4gICAgICAgICAgZGVsZXRlQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XHJcbiAgICAgICAgICBjYW5jZWxCdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICAgIGFkZFRhc2tCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBmb3JtSGVhZGluZy50ZXh0Q29udGVudCA9IFwiQWRkIE5ldyBUYXNrXCI7XHJcbiAgICAgICAgICBzdWJtaXRCdXR0b24udGV4dENvbnRlbnQgPSBcIkFkZCBUYXNrXCI7XHJcbiAgICAgICAgICBkZWxldGVCdXR0b24uY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcclxuICAgICAgICAgIGNhbmNlbEJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgICAgYWRkVGFza0J1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gcG9wdWxhdGVGb3JtKGV2ZW50KSB7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXRsZVwiKS52YWx1ZSA9IGV2ZW50LnRpdGxlO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFza0RhdGVcIikudmFsdWUgPSBldmVudC5zdGFydFN0ci5zdWJzdHJpbmcoXHJcbiAgICAgICAgICAwLFxyXG4gICAgICAgICAgMTBcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IGFsbERheSA9IGV2ZW50LmFsbERheTtcclxuICAgICAgICBhbGxEYXlDaGVja2JveC5jaGVja2VkID0gYWxsRGF5O1xyXG4gICAgICAgIHRpbWVJbnB1dHMuc3R5bGUuZGlzcGxheSA9IGFsbERheSA/IFwibm9uZVwiIDogXCJmbGV4XCI7XHJcblxyXG4gICAgICAgIGlmICghYWxsRGF5KSB7XHJcbiAgICAgICAgICBjb25zdCBzdGFydERhdGUgPSBuZXcgRGF0ZShldmVudC5zdGFydCk7XHJcbiAgICAgICAgICBjb25zdCBlbmREYXRlID0gbmV3IERhdGUoZXZlbnQuZW5kIHx8IGV2ZW50LnN0YXJ0KTtcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLnZhbHVlID0gc3RhcnREYXRlXHJcbiAgICAgICAgICAgIC50b1RpbWVTdHJpbmcoKVxyXG4gICAgICAgICAgICAuc3Vic3RyaW5nKDAsIDUpO1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLnZhbHVlID0gZW5kRGF0ZVxyXG4gICAgICAgICAgICAudG9UaW1lU3RyaW5nKClcclxuICAgICAgICAgICAgLnN1YnN0cmluZygwLCA1KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFRpbWVcIikudmFsdWUgPSBcIlwiO1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLnZhbHVlID0gXCJcIjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVzY3JpcHRpb25cIikudmFsdWUgPVxyXG4gICAgICAgICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5kZXNjcmlwdGlvbiB8fCBcIlwiO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlcIikudmFsdWUgPVxyXG4gICAgICAgICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5wcmlvcml0eSB8fCBcImxvd1wiO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2F0ZWdvcnlcIikudmFsdWUgPVxyXG4gICAgICAgICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5jYXRlZ29yeSB8fCBcIk5vbmVcIjtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbXBsZXRlZFwiKS5jaGVja2VkID1cclxuICAgICAgICAgIGV2ZW50LmV4dGVuZGVkUHJvcHMuY29tcGxldGVkIHx8IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBnZXRGb3JtRGF0YSgpIHtcclxuICAgICAgICBjb25zdCBjYXRlZ29yeVZhbHVlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRlZ29yeVwiKS52YWx1ZTtcclxuICAgICAgICBjb25zdCBhbGxEYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFsbERheVwiKS5jaGVja2VkO1xyXG4gICAgICAgIGNvbnN0IGRhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhc2tEYXRlXCIpLnZhbHVlO1xyXG4gICAgICAgIGxldCBzdGFydCwgZW5kO1xyXG5cclxuICAgICAgICBpZiAoYWxsRGF5KSB7XHJcbiAgICAgICAgICBzdGFydCA9IGRhdGU7XHJcbiAgICAgICAgICBlbmQgPSBkYXRlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0VGltZVwiKS52YWx1ZTtcclxuICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuZFRpbWVcIikudmFsdWU7XHJcbiAgICAgICAgICBzdGFydCA9IHN0YXJ0VGltZSA/IGAke2RhdGV9VCR7c3RhcnRUaW1lfWAgOiBkYXRlO1xyXG4gICAgICAgICAgZW5kID0gZW5kVGltZSA/IGAke2RhdGV9VCR7ZW5kVGltZX1gIDogc3RhcnQ7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgaWQ6IGlzRWRpdGluZyA/IGN1cnJlbnRFZGl0aW5nVGFzay5pZCA6IHVuZGVmaW5lZCxcclxuICAgICAgICAgIHRpdGxlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpdGxlXCIpLnZhbHVlLFxyXG4gICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxyXG4gICAgICAgICAgZW5kOiBlbmQsXHJcbiAgICAgICAgICBhbGxEYXk6IGFsbERheSxcclxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlc2NyaXB0aW9uXCIpLnZhbHVlLFxyXG4gICAgICAgICAgcHJpb3JpdHk6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlcIikudmFsdWUsXHJcbiAgICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnlWYWx1ZSA9PT0gXCJOb25lXCIgPyBudWxsIDogY2F0ZWdvcnlWYWx1ZSxcclxuICAgICAgICAgIGNvbXBsZXRlZDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb21wbGV0ZWRcIikuY2hlY2tlZCxcclxuICAgICAgICAgIGNsYXNzTmFtZTogYHByaW9yaXR5LSR7ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eVwiKS52YWx1ZX0gJHtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb21wbGV0ZWRcIikuY2hlY2tlZCA/IFwiY29tcGxldGVkLXRhc2tcIiA6IFwiXCJcclxuICAgICAgICAgIH1gLFxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVRhc2soZGF0YSkge1xyXG4gICAgICAgIGNvbnN0IG5ld1Rhc2sgPSBhd2FpdCBBcGlTZXJ2aWNlLmNyZWF0ZVRhc2soZGF0YSk7XHJcbiAgICAgICAgY2FsZW5kYXIuYWRkRXZlbnQobmV3VGFzayk7XHJcbiAgICAgICAgcmV0dXJuIG5ld1Rhc2s7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVRhc2soZGF0YSkge1xyXG4gICAgICAgIGNvbnN0IHVwZGF0ZWRUYXNrID0gYXdhaXQgQXBpU2VydmljZS51cGRhdGVUYXNrKGRhdGEuaWQsIGRhdGEpO1xyXG4gICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzay5yZW1vdmUoKTtcclxuICAgICAgICBjYWxlbmRhci5hZGRFdmVudCh1cGRhdGVkVGFzayk7XHJcbiAgICAgICAgcmV0dXJuIHVwZGF0ZWRUYXNrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBhc3luYyBmdW5jdGlvbiBkZWxldGVUYXNrKGlkKSB7XHJcbiAgICAgICAgYXdhaXQgQXBpU2VydmljZS5kZWxldGVUYXNrKGlkKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHJldHVybiB7fTtcclxufSkoKTsiLCJpbXBvcnQgeyBBcGlTZXJ2aWNlIH0gZnJvbSBcIi4vYXBpU2VydmljZS5qc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IENhdGVnb3J5ID0gKCgpID0+IHtcclxuICBsZXQgY2F0ZWdvcmllcyA9IFtdO1xyXG5cclxuICAvLyBIZWxwZXIgZnVuY3Rpb25zIGRlZmluZWQgb3V0c2lkZSBET01Db250ZW50TG9hZGVkXHJcbiAgZnVuY3Rpb24gcmVuZGVyQ2F0ZWdvcmllcygpIHtcclxuICAgIGNvbnN0IGNhdGVnb3JpZXNDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3JpZXMtY29udGFpbmVyXCIpO1xyXG4gICAgY29uc3QgYWRkTmV3Q2F0ZWdvcnlCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZC1uZXctY2F0ZWdvcnktYnRuXCIpO1xyXG4gICAgY29uc3QgbmV3Q2F0ZWdvcnlGb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctY2F0ZWdvcnktZm9ybVwiKTtcclxuXHJcbiAgICBjYXRlZ29yaWVzQ29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XHJcblxyXG4gICAgY2F0ZWdvcmllcy5mb3JFYWNoKChjYXRlZ29yeSwgaW5kZXgpID0+IHtcclxuICAgICAgLy8gRW5zdXJlIGNhdGVnb3J5LmlkIGlzIGEgc3RyaW5nIGZvciBjb25zaXN0ZW5jeVxyXG4gICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcclxuICAgICAgbGkuY2xhc3NOYW1lID0gXCJjYXRlZ29yeS1pdGVtXCI7XHJcbiAgICAgIGxpLmlubmVySFRNTCA9IGBcclxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXRlZ29yeS1jb250ZW50XCI+XHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY2F0ZWdvcnktY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6ICR7Y2F0ZWdvcnkuY29sb3J9O1wiPjwvc3Bhbj4gXHJcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY2F0ZWdvcnktbmFtZVwiPiR7Y2F0ZWdvcnkubmFtZX08L3NwYW4+XHJcbiAgICAgICAgICA8L2Rpdj5cclxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJkZWxldGUtY2F0ZWdvcnktYnRuXCIgZGF0YS1pZD1cIiR7Y2F0ZWdvcnkuaWR9XCI+XHJcbiAgICAgICAgICAgIDxpIGNsYXNzPVwiZmFzIGZhLXRyYXNoXCI+PC9pPlxyXG4gICAgICAgICAgPC9idXR0b24+XHJcbiAgICAgICAgYDtcclxuICAgICAgY2F0ZWdvcmllc0NvbnRhaW5lci5hcHBlbmRDaGlsZChsaSk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIHRvIGRlbGV0ZSBidXR0b25zXHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmRlbGV0ZS1jYXRlZ29yeS1idG5cIikuZm9yRWFjaCgoYnRuKSA9PiB7XHJcbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcclxuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgIC8vIEVuc3VyZSBpZCBpcyB0cmVhdGVkIGFzIGEgc3RyaW5nXHJcbiAgICAgICAgY29uc3QgaWQgPSBidG4uZGF0YXNldC5pZDtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIkF0dGVtcHRpbmcgdG8gZGVsZXRlIGNhdGVnb3J5IHdpdGggaWQ6XCIsIGlkKTtcclxuICAgICAgICBjb25zb2xlLmxvZyhcIkN1cnJlbnQgY2F0ZWdvcmllczpcIiwgY2F0ZWdvcmllcyk7XHJcbiAgICAgICAgZGVsZXRlQ2F0ZWdvcnkoaWQpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFkZCB0aGUgXCJBZGQgTmV3IENhdGVnb3J5XCIgYnV0dG9uIGFuZCBmb3JtIGJhY2tcclxuICAgIGNhdGVnb3JpZXNDb250YWluZXIuYXBwZW5kQ2hpbGQoYWRkTmV3Q2F0ZWdvcnlCdG4pO1xyXG4gICAgY2F0ZWdvcmllc0NvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdDYXRlZ29yeUZvcm0pO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKSB7XHJcbiAgICBjb25zdCBjYXRlZ29yeVNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2F0ZWdvcnlcIik7XHJcbiAgICBjYXRlZ29yeVNlbGVjdC5pbm5lckhUTUwgPSBcIlwiO1xyXG5cclxuICAgIC8vIEFkZCBcIk5vbmVcIiBvcHRpb24gZmlyc3RcclxuICAgIGNvbnN0IG5vbmVPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xyXG4gICAgbm9uZU9wdGlvbi52YWx1ZSA9IFwiTm9uZVwiO1xyXG4gICAgbm9uZU9wdGlvbi50ZXh0Q29udGVudCA9IFwiTm9uZVwiO1xyXG4gICAgY2F0ZWdvcnlTZWxlY3QuYXBwZW5kQ2hpbGQobm9uZU9wdGlvbik7XHJcblxyXG4gICAgLy8gQWRkIGFsbCBjYXRlZ29yeSBvcHRpb25zXHJcbiAgICBjYXRlZ29yaWVzLmZvckVhY2goKGNhdGVnb3J5KSA9PiB7XHJcbiAgICAgIGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XHJcbiAgICAgIG9wdGlvbi52YWx1ZSA9IGNhdGVnb3J5Lm5hbWU7XHJcbiAgICAgIG9wdGlvbi50ZXh0Q29udGVudCA9IGNhdGVnb3J5Lm5hbWU7XHJcbiAgICAgIGNhdGVnb3J5U2VsZWN0LmFwcGVuZENoaWxkKG9wdGlvbik7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZUNhdGVnb3J5KGlkKSB7XHJcbiAgICAvLyBDb252ZXJ0IGlkIHRvIHN0cmluZyBmb3IgY29uc2lzdGVuY3lcclxuICAgIGNvbnN0IGluZGV4ID0gY2F0ZWdvcmllcy5maW5kSW5kZXgoXHJcbiAgICAgIChjKSA9PiBjLmlkLnRvU3RyaW5nKCkgPT09IGlkLnRvU3RyaW5nKClcclxuICAgICk7XHJcbiAgICBjb25zb2xlLmxvZyhcImRlbGV0ZUNhdGVnb3J5IGNhbGxlZCB3aXRoIGlkOlwiLCBpZCwgXCJGb3VuZCBpbmRleDpcIiwgaW5kZXgpO1xyXG5cclxuICAgIGlmIChpbmRleCA+PSAwKSB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgLy8gRGVsZXRlIGNhdGVnb3J5IHZpYSBBUElcclxuICAgICAgICBhd2FpdCBBcGlTZXJ2aWNlLmRlbGV0ZUNhdGVnb3J5KGlkKTtcclxuICAgICAgICAvLyBSZW1vdmUgZnJvbSBsb2NhbCBzdGF0ZVxyXG4gICAgICAgIGNhdGVnb3JpZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICByZW5kZXJDYXRlZ29yaWVzKCk7XHJcbiAgICAgICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKTtcclxuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGRlbGV0ZSBjYXRlZ29yeTpcIiwgZXJyb3IpO1xyXG4gICAgICAgIC8vIE9wdGlvbmFsbHkgc2hvdyBlcnJvciBtZXNzYWdlIHRvIHVzZXJcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkNhdGVnb3J5IG5vdCBmb3VuZCB3aXRoIGlkOlwiLCBpZCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9hcHBcIikge1xyXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24gKCkge1xyXG4gICAgICBjb25zdCBjYXRlZ29yeVNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2F0ZWdvcnlcIik7XHJcbiAgICAgIGNvbnN0IGNhdGVnb3JpZXNDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcclxuICAgICAgICBcImNhdGVnb3JpZXMtY29udGFpbmVyXCJcclxuICAgICAgKTtcclxuICAgICAgY29uc3QgYWRkTmV3Q2F0ZWdvcnlCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZC1uZXctY2F0ZWdvcnktYnRuXCIpO1xyXG4gICAgICBjb25zdCBuZXdDYXRlZ29yeUZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1mb3JtXCIpO1xyXG4gICAgICBjb25zdCBjcmVhdGVDYXRlZ29yeUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3JlYXRlLWNhdGVnb3J5LWJ0blwiKTtcclxuXHJcbiAgICAgIC8vIEZldGNoIGNhdGVnb3JpZXMgZnJvbSBBUElcclxuICAgICAgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZUNhdGVnb3JpZXMoKSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgIGNhdGVnb3JpZXMgPSBhd2FpdCBBcGlTZXJ2aWNlLmZldGNoQ2F0ZWdvcmllcygpO1xyXG4gICAgICAgICAgY29uc29sZS5sb2coXCJGZXRjaGVkIGNhdGVnb3JpZXM6XCIsIGNhdGVnb3JpZXMpO1xyXG4gICAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xyXG4gICAgICAgICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKTtcclxuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBmZXRjaCBjYXRlZ29yaWVzOlwiLCBlcnJvcik7XHJcbiAgICAgICAgICAvLyBPcHRpb25hbGx5IHNob3cgZXJyb3IgbWVzc2FnZSB0byB1c2VyXHJcbiAgICAgICAgICByZW5kZXJDYXRlZ29yaWVzKCk7XHJcbiAgICAgICAgICB1cGRhdGVDYXRlZ29yeVNlbGVjdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaW5pdGlhbGl6ZUNhdGVnb3JpZXMoKTtcclxuXHJcbiAgICAgIC8vIENhdGVnb3J5IG1hbmFnZW1lbnRcclxuICAgICAgYWRkTmV3Q2F0ZWdvcnlCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICBuZXdDYXRlZ29yeUZvcm0uc3R5bGUuZGlzcGxheSA9XHJcbiAgICAgICAgICBuZXdDYXRlZ29yeUZvcm0uc3R5bGUuZGlzcGxheSA9PT0gXCJub25lXCIgPyBcImZsZXhcIiA6IFwibm9uZVwiO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGNyZWF0ZUNhdGVnb3J5QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3LWNhdGVnb3J5LW5hbWVcIikudmFsdWUudHJpbSgpO1xyXG4gICAgICAgIGNvbnN0IGNvbG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctY2F0ZWdvcnktY29sb3JcIikudmFsdWU7XHJcblxyXG4gICAgICAgIGlmIChuYW1lKSB7XHJcbiAgICAgICAgICB0cnkge1xyXG4gICAgICAgICAgICAvLyBBZGQgbmV3IGNhdGVnb3J5IHZpYSBBUElcclxuICAgICAgICAgICAgY29uc3QgYXBpQ2F0ZWdvcnkgPSBhd2FpdCBBcGlTZXJ2aWNlLmNyZWF0ZUNhdGVnb3J5KHtcclxuICAgICAgICAgICAgICBuYW1lLFxyXG4gICAgICAgICAgICAgIGNvbG9yLFxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY2F0ZWdvcmllcy5wdXNoKGFwaUNhdGVnb3J5KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coXCJBZGRlZCBuZXcgY2F0ZWdvcnk6XCIsIGFwaUNhdGVnb3J5KTtcclxuICAgICAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xyXG4gICAgICAgICAgICB1cGRhdGVDYXRlZ29yeVNlbGVjdCgpO1xyXG5cclxuICAgICAgICAgICAgLy8gUmVzZXQgZm9ybVxyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1uYW1lXCIpLnZhbHVlID0gXCJcIjtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctY2F0ZWdvcnktY29sb3JcIikudmFsdWUgPSBcIiNjY2NjY2NcIjtcclxuICAgICAgICAgICAgbmV3Q2F0ZWdvcnlGb3JtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcclxuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gY3JlYXRlIGNhdGVnb3J5OlwiLCBlcnJvcik7XHJcbiAgICAgICAgICAgIC8vIE9wdGlvbmFsbHkgc2hvdyBlcnJvciBtZXNzYWdlIHRvIHVzZXJcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHJldHVybiB7XHJcbiAgICBnZXRDYXRlZ29yaWVzOiAoKSA9PiBjYXRlZ29yaWVzLFxyXG4gICAgcmVuZGVyQ2F0ZWdvcmllcyxcclxuICAgIHVwZGF0ZUNhdGVnb3J5U2VsZWN0LFxyXG4gIH07XHJcbn0pKCk7IiwiZXhwb3J0IGNvbnN0IERvbVV0aWxzID0gKCgpID0+IHtcclxuICBmdW5jdGlvbiBjbGVhck1lc3NhZ2VzKCkge1xyXG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZXNzYWdlQ29udGFpbmVyXCIpO1xyXG4gICAgaWYgKGNvbnRhaW5lcikgY29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICBkb2N1bWVudFxyXG4gICAgICAucXVlcnlTZWxlY3RvckFsbChcIi5lcnJvci1tZXNzYWdlLCAuc3VjY2Vzcy1tZXNzYWdlXCIpXHJcbiAgICAgIC5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgIGlmIChlbC5wYXJlbnROb2RlICE9PSBjb250YWluZXIpIGVsLnJlbW92ZSgpO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNob3dNZXNzYWdlKG1lc3NhZ2UsIHR5cGUgPSBcImVycm9yXCIpIHtcclxuICAgIGNsZWFyTWVzc2FnZXMoKTtcclxuICAgIGNvbnN0IG1lc3NhZ2VFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTmFtZSA9XHJcbiAgICAgIHR5cGUgPT09IFwiZXJyb3JcIiA/IFwiZXJyb3ItbWVzc2FnZVwiIDogXCJzdWNjZXNzLW1lc3NhZ2VcIjtcclxuICAgIG1lc3NhZ2Uuc3BsaXQoXCJcXG5cIikuZm9yRWFjaCgobGluZSkgPT4ge1xyXG4gICAgICBjb25zdCBwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XHJcbiAgICAgIHAudGV4dENvbnRlbnQgPSBsaW5lO1xyXG4gICAgICBtZXNzYWdlRWxlbWVudC5hcHBlbmRDaGlsZChwKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVzc2FnZUNvbnRhaW5lclwiKTtcclxuICAgIGlmIChjb250YWluZXIpIHtcclxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG1lc3NhZ2VFbGVtZW50KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1dGhGb3JtXCIpO1xyXG4gICAgICBmb3JtXHJcbiAgICAgICAgPyBmb3JtLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG1lc3NhZ2VFbGVtZW50LCBmb3JtKVxyXG4gICAgICAgIDogZG9jdW1lbnQuYm9keS5wcmVwZW5kKG1lc3NhZ2VFbGVtZW50KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBjbGVhck1lc3NhZ2VzLFxyXG4gICAgc2hvd0Vycm9yOiAobXNnKSA9PiBzaG93TWVzc2FnZShtc2csIFwiZXJyb3JcIiksXHJcbiAgICBzaG93U3VjY2VzczogKG1zZykgPT4gc2hvd01lc3NhZ2UobXNnLCBcInN1Y2Nlc3NcIiksXHJcbiAgfTtcclxufSkoKTtcclxuIiwiZXhwb3J0IGNvbnN0IExvYWRlciA9ICgoKSA9PiB7XHJcbiAgZnVuY3Rpb24gdG9nZ2xlKHNob3cpIHtcclxuICAgIGxldCBsb2FkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRlclwiKTtcclxuICAgIGlmICghbG9hZGVyICYmIHNob3cpIGxvYWRlciA9IGNyZWF0ZSgpO1xyXG4gICAgaWYgKGxvYWRlcikgbG9hZGVyLnN0eWxlLmRpc3BsYXkgPSBzaG93ID8gXCJmbGV4XCIgOiBcIm5vbmVcIjtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuICAgIGNvbnN0IGxvYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBsb2FkZXIuaWQgPSBcImxvYWRlclwiO1xyXG4gICAgbG9hZGVyLmNsYXNzTmFtZSA9IFwibG9hZGVyXCI7XHJcbiAgICBsb2FkZXIuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJzcGlubmVyXCI+PC9kaXY+JztcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobG9hZGVyKTtcclxuICAgIHJldHVybiBsb2FkZXI7XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyB0b2dnbGUgfTtcclxufSkoKTtcclxuIiwiaW1wb3J0IHsgTG9hZGVyIH0gZnJvbSBcIi4vbG9hZGVyLmpzXCI7XHJcbmltcG9ydCB7IERvbVV0aWxzIH0gZnJvbSBcIi4vZG9tVXRpbHMuanNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBVc2VyID0gKCgpID0+IHtcclxuICBhc3luYyBmdW5jdGlvbiBsb2dvdXQoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIkF0dGVtcHRpbmcgbG9nb3V0Li4uXCIpO1xyXG4gICAgTG9hZGVyLnRvZ2dsZSh0cnVlKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXCIvYXBpL2xvZ291dFwiLCB7XHJcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICBoZWFkZXJzOiB7IEFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpO1xyXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgIGRhdGEuZXJyb3IgfHwgYExvZ291dCBmYWlsZWQgd2l0aCBzdGF0dXM6ICR7cmVzcG9uc2Uuc3RhdHVzfWBcclxuICAgICAgICApO1xyXG4gICAgICBjb25zb2xlLmxvZyhcIkxvZ291dCBzdWNjZXNzZnVsIHZpYSBBUEkuXCIpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkxvZ291dCBBUEkgY2FsbCBmYWlsZWQ6XCIsIGVycm9yKTtcclxuICAgICAgRG9tVXRpbHMuc2hvd0Vycm9yKFxyXG4gICAgICAgIFwiQ291bGQgbm90IHByb3Blcmx5IGxvZyBvdXQuIENsZWFyIGNvb2tpZXMgbWFudWFsbHkgaWYgbmVlZGVkLlwiXHJcbiAgICAgICk7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInVzZXJcIik7XHJcbiAgICAgIExvYWRlci50b2dnbGUoZmFsc2UpO1xyXG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2xvZ2luXCI7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkaXNwbGF5VXNlckRhdGEoKSB7XHJcbiAgICBjb25zdCB1c2VyRGF0YVN0cmluZyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidXNlclwiKTtcclxuICAgIGlmICghdXNlckRhdGFTdHJpbmcpIHJldHVybiBsb2dvdXQoKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHVzZXJEYXRhID0gSlNPTi5wYXJzZSh1c2VyRGF0YVN0cmluZyk7XHJcbiAgICAgIGNvbnN0IHVzZXJOYW1lID0gdXNlckRhdGEubmFtZSB8fCBcIlVzZXJcIjtcclxuICAgICAgY29uc3QgdXNlck5hbWVEaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyLW5hbWUtZGlzcGxheVwiKTtcclxuICAgICAgaWYgKHVzZXJOYW1lRGlzcGxheSkgdXNlck5hbWVEaXNwbGF5LnRleHRDb250ZW50ID0gdXNlck5hbWU7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJJbnZhbGlkIHVzZXIgZGF0YSBpbiBsb2NhbFN0b3JhZ2UuXCIpO1xyXG4gICAgICBsb2dvdXQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7IGxvZ291dCwgZGlzcGxheVVzZXJEYXRhIH07XHJcbn0pKCk7XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuL21vZHVsZXMvdXNlci5qc1wiO1xyXG5pbXBvcnQgeyBBdXRoIH0gZnJvbSBcIi4vbW9kdWxlcy9hdXRoLmpzXCI7XHJcbmltcG9ydCB7IFRvZG8gfSBmcm9tIFwiLi9tb2R1bGVzL2NhbGVuZGFyLmpzXCI7XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvYXBwXCIpIHtcclxuICAgIFVzZXIuZGlzcGxheVVzZXJEYXRhKCk7XHJcbiAgfVxyXG4gIGNvbnN0IGxvZ291dEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLWxvZ291dFwiKTtcclxuICBpZiAobG9nb3V0QnRuKSBsb2dvdXRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIFVzZXIubG9nb3V0KTtcclxuXHJcbiAgY29uc29sZS5sb2coXCJNYWluIGFwcCBpbml0aWFsaXplZC5cIik7XHJcbn0pO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=