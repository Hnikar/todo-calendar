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
      const addTaskButton = document.getElementById("btn-add-task");
      const allDayCheckbox = document.getElementById("allDay");
      const timeInputs = document.getElementById("timeInputs");
      const content = document.querySelector(".content");
      const closeTaskFormBtn = document.getElementById("close-task-form");
      const btnCalendar = document.getElementById("btn-calendar");
      const btnUpcoming = document.getElementById("btn-upcoming");
      const btnToday = document.getElementById("btn-today");

      // Helper to show/hide form and backdrop
      function showForm() {
        form.classList.add("visible");
        content.classList.add("form-open");
        form.style.display = "block";
        setTimeout(() => {
          form.focus && form.focus();
        }, 0);
      }
      function hideForm() {
        form.classList.remove("visible");
        content.classList.remove("form-open");
        form.style.display = "none";
        if (addTaskButton) addTaskButton.style.display = "block";
      }

      // Toggle time inputs based on All Day checkbox
      allDayCheckbox.addEventListener("change", () => {
        const isAllDay = allDayCheckbox.checked;
        document.getElementById("startTime").disabled = isAllDay;
        document.getElementById("endTime").disabled = isAllDay;
        if (isAllDay) {
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
          // right: "dayGridMonth,timeGridWeek,timeGridDay",
        },
        editable: true,
        selectable: false,
        selectMirror: true,
        dayMaxEvents: true,
        events: [],
        eventClick: function (info) {
          currentEditingTask = info.event;
          isEditing = true;
          populateForm(info.event);
          updateFormUI();
          showForm();
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

      // Sidebar button event listeners
      if (btnCalendar) {
        btnCalendar.addEventListener("click", () => {
          calendar.changeView("dayGridMonth");
          btnCalendar.classList.add("active");
          btnUpcoming.classList.remove("active");
          // Optionally update header
          document.querySelector(".content-header").textContent = "Calendar";
        });
      }
      if (btnUpcoming) {
        btnUpcoming.addEventListener("click", () => {
          calendar.changeView("listWeek");
          btnUpcoming.classList.add("active");
          btnCalendar.classList.remove("active");
          // Optionally update header
          document.querySelector(".content-header").textContent = "Upcoming";
        });
      }
      if (btnToday) {
        btnToday.addEventListener("click", () => {
          calendar.changeView("timeGridDay", new Date());
          btnToday.classList.add("active");
          btnCalendar.classList.remove("active");
          btnUpcoming.classList.remove("active");
          document.querySelector(".content-header").textContent = "Today";
        });
      }

      // Event Listeners
      if (addTaskButton) {
        addTaskButton.addEventListener("click", () => {
          isEditing = false;
          currentEditingTask = null;
          form.reset();
          allDayCheckbox.checked = false;
          timeInputs.style.display = "flex";
          updateFormUI();
          showForm();
        });
      }

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
          hideForm();
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
            hideForm();
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
        hideForm();
      });

      // Add close (cross) button handler
      if (closeTaskFormBtn) {
        closeTaskFormBtn.addEventListener("click", () => {
          form.reset();
          isEditing = false;
          currentEditingTask = null;
          allDayCheckbox.checked = false;
          timeInputs.style.display = "flex";
          updateFormUI();
          hideForm();
        });
      }

      // Hide form on click outside
      document.addEventListener("mousedown", (e) => {
        if (
          form.classList.contains("visible") &&
          !form.contains(e.target) &&
          !(addTaskButton && addTaskButton.contains(e.target))
        ) {
          form.reset();
          isEditing = false;
          currentEditingTask = null;
          allDayCheckbox.checked = false;
          timeInputs.style.display = "flex";
          updateFormUI();
          hideForm();
        }
      });

      // Hide form initially
      hideForm();

      // Helper functions
      function updateFormUI() {
        if (isEditing) {
          formHeading.textContent = "Edit Task";
          submitButton.textContent = "Save Changes";
          deleteButton.classList.remove("hidden");
          cancelButton.classList.remove("hidden");
          if (addTaskButton) addTaskButton.disabled = true;
        } else {
          formHeading.textContent = "Add New Task";
          submitButton.textContent = "Add Task";
          deleteButton.classList.add("hidden");
          cancelButton.classList.add("hidden");
          if (addTaskButton) addTaskButton.disabled = false;
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
        document.getElementById("startTime").disabled = allDay;
        document.getElementById("endTime").disabled = allDay;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBLE9BQU87O0FBRVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FB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Q0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxXQUFXO0FBQ1gsQ0FBQzs7Ozs7OztVQzlDRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7QUNOeUM7QUFDQTtBQUNJOztBQUU3QztBQUNBO0FBQ0EsSUFBSSxrREFBSTtBQUNSO0FBQ0E7QUFDQSxxREFBcUQsa0RBQUk7O0FBRXpEO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2FwaVNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvYXV0aC5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9jYWxlbmRhci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9jYXRlZ29yeS5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9kb21VdGlscy5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9sb2FkZXIuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvdXNlci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vc3RhdGljL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTG9hZGVyIH0gZnJvbSBcIi4vbG9hZGVyLmpzXCI7XG5pbXBvcnQgeyBEb21VdGlscyB9IGZyb20gXCIuL2RvbVV0aWxzLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBBcGlTZXJ2aWNlID0gKCgpID0+IHtcbiAgY29uc3QgQVBJX0JBU0UgPSBcIi9hcGlcIjtcblxuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVSZXF1ZXN0KHVybCwgbWV0aG9kLCBkYXRhKSB7XG4gICAgdHJ5IHtcbiAgICAgIExvYWRlci50b2dnbGUodHJ1ZSk7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke0FQSV9CQVNFfSR7dXJsfWAsIHtcbiAgICAgICAgbWV0aG9kLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIGNyZWRlbnRpYWxzOiBcImluY2x1ZGVcIixcbiAgICAgICAgYm9keTogZGF0YSA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogdW5kZWZpbmVkLFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2xvZ2luP3JlYXNvbj11bmF1dGhlbnRpY2F0ZWRcIjtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZXNwb25zZURhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICBjb25zb2xlLmxvZyhyZXNwb25zZURhdGEpO1xuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzcG9uc2VEYXRhLmVycm9yIHx8IFwiUmVxdWVzdCBmYWlsZWRcIik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzcG9uc2VEYXRhO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBEb21VdGlscy5zaG93RXJyb3IoZXJyb3IubWVzc2FnZSk7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgTG9hZGVyLnRvZ2dsZShmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICAvLyBUYXNrLXJlbGF0ZWQgZW5kcG9pbnRzXG4gICAgY3JlYXRlVGFzazogKHRhc2spID0+IGhhbmRsZVJlcXVlc3QoXCIvZXZlbnRzXCIsIFwiUE9TVFwiLCB0YXNrKSxcbiAgICB1cGRhdGVUYXNrOiAoaWQsIHRhc2spID0+IGhhbmRsZVJlcXVlc3QoYC9ldmVudHMvJHtpZH1gLCBcIlBVVFwiLCB0YXNrKSxcbiAgICBkZWxldGVUYXNrOiAoaWQpID0+IGhhbmRsZVJlcXVlc3QoYC9ldmVudHMvJHtpZH1gLCBcIkRFTEVURVwiKSxcbiAgICBmZXRjaFRhc2tzOiAoKSA9PiBoYW5kbGVSZXF1ZXN0KFwiL2V2ZW50c1wiLCBcIkdFVFwiKSxcbiAgICAvLyBDYXRlZ29yeS1yZWxhdGVkIGVuZHBvaW50c1xuICAgIGNyZWF0ZUNhdGVnb3J5OiAoY2F0ZWdvcnkpID0+XG4gICAgICBoYW5kbGVSZXF1ZXN0KFwiL2NhdGVnb3JpZXNcIiwgXCJQT1NUXCIsIGNhdGVnb3J5KSxcbiAgICBmZXRjaENhdGVnb3JpZXM6ICgpID0+IGhhbmRsZVJlcXVlc3QoXCIvY2F0ZWdvcmllc1wiLCBcIkdFVFwiKSxcbiAgICBkZWxldGVDYXRlZ29yeTogKGlkKSA9PiBoYW5kbGVSZXF1ZXN0KGAvY2F0ZWdvcmllcy8ke2lkfWAsIFwiREVMRVRFXCIpLFxuICB9O1xufSkoKTtcbiIsImltcG9ydCB7IExvYWRlciB9IGZyb20gXCIuL2xvYWRlci5qc1wiO1xuaW1wb3J0IHsgRG9tVXRpbHMgfSBmcm9tIFwiLi9kb21VdGlscy5qc1wiO1xuXG5leHBvcnQgY29uc3QgQXV0aCA9ICgoKSA9PiB7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9sb2dpblwiKSB7XG4gICAgICBpbml0KCk7XG4gICAgICBjaGVja1JlZGlyZWN0UmVhc29uKCk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBpbml0KCkge1xuICAgIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1dGhGb3JtXCIpO1xuICAgIGlmICghZm9ybSkgcmV0dXJuIGNvbnNvbGUuZXJyb3IoXCJBdXRoIGZvcm0gbm90IGZvdW5kIVwiKTtcblxuICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBoYW5kbGVTdWJtaXQpO1xuICAgIHN3aXRjaE1vZGUoXCJsb2dpblwiKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtbW9kZV1cIikuZm9yRWFjaCgodGFiKSA9PlxuICAgICAgdGFiLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIHN3aXRjaE1vZGUodGFiLmRhdGFzZXQubW9kZSk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBmdW5jdGlvbiBzd2l0Y2hNb2RlKG1vZGUpIHtcbiAgICBjb25zdCBuYW1lRmllbGQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWVsZFwiKTtcbiAgICBjb25zdCBzdWJtaXRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYXV0aEZvcm0gYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKTtcbiAgICBjb25zdCBwYXNzd29yZElucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXNzd29yZFwiKTtcbiAgICBjb25zdCB0YWJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50YWJcIik7XG5cbiAgICBpZiAobmFtZUZpZWxkKSB7XG4gICAgICBuYW1lRmllbGQuc3R5bGUuZGlzcGxheSA9IG1vZGUgPT09IFwicmVnaXN0ZXJcIiA/IFwiYmxvY2tcIiA6IFwibm9uZVwiO1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lXCIpLnJlcXVpcmVkID0gbW9kZSA9PT0gXCJyZWdpc3RlclwiO1xuICAgIH1cbiAgICB0YWJzLmZvckVhY2goKHRhYikgPT5cbiAgICAgIHRhYi5jbGFzc0xpc3QudG9nZ2xlKFwiYWN0aXZlXCIsIHRhYi5kYXRhc2V0Lm1vZGUgPT09IG1vZGUpXG4gICAgKTtcbiAgICBpZiAoc3VibWl0QnRuKVxuICAgICAgc3VibWl0QnRuLnRleHRDb250ZW50ID0gbW9kZSA9PT0gXCJsb2dpblwiID8gXCJMb2dpblwiIDogXCJSZWdpc3RlclwiO1xuICAgIGlmIChwYXNzd29yZElucHV0KVxuICAgICAgcGFzc3dvcmRJbnB1dC5hdXRvY29tcGxldGUgPVxuICAgICAgICBtb2RlID09PSBcImxvZ2luXCIgPyBcImN1cnJlbnQtcGFzc3dvcmRcIiA6IFwibmV3LXBhc3N3b3JkXCI7XG5cbiAgICBEb21VdGlscy5jbGVhck1lc3NhZ2VzKCk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVTdWJtaXQoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBEb21VdGlscy5jbGVhck1lc3NhZ2VzKCk7XG4gICAgTG9hZGVyLnRvZ2dsZSh0cnVlKTtcblxuICAgIGNvbnN0IGlzTG9naW4gPSBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLW1vZGU9XCJsb2dpblwiXScpXG4gICAgICAuY2xhc3NMaXN0LmNvbnRhaW5zKFwiYWN0aXZlXCIpO1xuICAgIGNvbnN0IHVybCA9IGlzTG9naW4gPyBcIi9hcGkvbG9naW5cIiA6IFwiL2FwaS9yZWdpc3RlclwiO1xuICAgIGNvbnN0IGZvcm1EYXRhID0ge1xuICAgICAgZW1haWw6IGdldFZhbChcImVtYWlsXCIpLFxuICAgICAgcGFzc3dvcmQ6IGdldFZhbChcInBhc3N3b3JkXCIpLFxuICAgIH07XG5cbiAgICBpZiAoIWlzTG9naW4pIGZvcm1EYXRhLm5hbWUgPSBnZXRWYWwoXCJuYW1lXCIpO1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhbGlkYXRlKGZvcm1EYXRhLCBpc0xvZ2luKTtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShmb3JtRGF0YSksXG4gICAgICB9KTtcbiAgICAgIGF3YWl0IGhhbmRsZVJlc3BvbnNlKHJlc3BvbnNlLCBpc0xvZ2luKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIERvbVV0aWxzLnNob3dFcnJvcihlcnIubWVzc2FnZSB8fCBcIlVuZXhwZWN0ZWQgZXJyb3IgZHVyaW5nIHN1Ym1pc3Npb24uXCIpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBMb2FkZXIudG9nZ2xlKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBnZXRWYWwoaWQpIHtcbiAgICBjb25zdCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICByZXR1cm4gZWwgPyBlbC52YWx1ZS50cmltKCkgOiBcIlwiO1xuICB9XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGUoZGF0YSwgaXNMb2dpbikge1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIGNvbnN0IGVtYWlsUmVnZXggPSAvXlteXFxzQF0rQFteXFxzQF0rXFwuW15cXHNAXSskLztcblxuICAgIGlmICghZGF0YS5lbWFpbCkgZXJyb3JzLnB1c2goXCJFbWFpbCBpcyByZXF1aXJlZC5cIik7XG4gICAgZWxzZSBpZiAoIWVtYWlsUmVnZXgudGVzdChkYXRhLmVtYWlsKSkgZXJyb3JzLnB1c2goXCJJbnZhbGlkIGVtYWlsIGZvcm1hdC5cIik7XG4gICAgaWYgKCFkYXRhLnBhc3N3b3JkKSBlcnJvcnMucHVzaChcIlBhc3N3b3JkIGlzIHJlcXVpcmVkLlwiKTtcbiAgICBlbHNlIGlmIChkYXRhLnBhc3N3b3JkLmxlbmd0aCA8IDggJiYgIWlzTG9naW4pXG4gICAgICBlcnJvcnMucHVzaChcIlBhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzLlwiKTtcbiAgICBpZiAoIWlzTG9naW4gJiYgKCFkYXRhLm5hbWUgfHwgZGF0YS5uYW1lLmxlbmd0aCA8IDIpKVxuICAgICAgZXJyb3JzLnB1c2goXCJOYW1lIG11c3QgYmUgYXQgbGVhc3QgMiBjaGFyYWN0ZXJzLlwiKTtcblxuICAgIGlmIChlcnJvcnMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoZXJyb3JzLmpvaW4oXCJcXG5cIikpO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzcG9uc2UsIGlzTG9naW4pIHtcbiAgICBjb25zdCBpc0pzb24gPSByZXNwb25zZS5oZWFkZXJzXG4gICAgICAuZ2V0KFwiY29udGVudC10eXBlXCIpXG4gICAgICA/LmluY2x1ZGVzKFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICBjb25zdCBkYXRhID0gaXNKc29uXG4gICAgICA/IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgICAgOiB7IG1lc3NhZ2U6IGF3YWl0IHJlc3BvbnNlLnRleHQoKSB9O1xuXG4gICAgaWYgKCFyZXNwb25zZS5vaylcbiAgICAgIHRocm93IG5ldyBFcnJvcihkYXRhLmVycm9yIHx8IGBFcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG5cbiAgICBpZiAoaXNMb2dpbikge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ1c2VyXCIsIEpTT04uc3RyaW5naWZ5KGRhdGEudXNlciB8fCB7fSkpO1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9hcHBcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgRG9tVXRpbHMuc2hvd1N1Y2Nlc3MoXG4gICAgICAgIGRhdGEubWVzc2FnZSB8fCBcIlJlZ2lzdHJhdGlvbiBzdWNjZXNzZnVsLiBQbGVhc2UgbG9naW4uXCJcbiAgICAgICk7XG4gICAgICBzd2l0Y2hNb2RlKFwibG9naW5cIik7XG4gICAgICBbXCJlbWFpbFwiLCBcInBhc3N3b3JkXCIsIFwibmFtZVwiXS5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgICBjb25zdCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAgICAgaWYgKGVsKSBlbC52YWx1ZSA9IFwiXCI7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja1JlZGlyZWN0UmVhc29uKCkge1xuICAgIGNvbnN0IHJlYXNvbiA9IG5ldyBVUkxTZWFyY2hQYXJhbXMobG9jYXRpb24uc2VhcmNoKS5nZXQoXCJyZWFzb25cIik7XG4gICAgY29uc3QgbWVzc2FnZXMgPSB7XG4gICAgICB1bmF1dGhlbnRpY2F0ZWQ6IFwiUGxlYXNlIGxvZyBpbiB0byBhY2Nlc3MgdGhlIGFwcGxpY2F0aW9uLlwiLFxuICAgICAgaW52YWxpZF90b2tlbjogXCJTZXNzaW9uIGV4cGlyZWQuIFBsZWFzZSBsb2cgaW4gYWdhaW4uXCIsXG4gICAgICBiYWRfdG9rZW5fY2xhaW1zOiBcIlNlc3Npb24gZGF0YSBpc3N1ZS4gUGxlYXNlIGxvZyBpbiBhZ2Fpbi5cIixcbiAgICB9O1xuICAgIGlmIChyZWFzb24gJiYgbWVzc2FnZXNbcmVhc29uXSkgRG9tVXRpbHMuc2hvd0Vycm9yKG1lc3NhZ2VzW3JlYXNvbl0pO1xuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsIFwiXCIsIGxvY2F0aW9uLnBhdGhuYW1lKTtcbiAgfVxuXG4gIHJldHVybiB7IGluaXQgfTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBDYXRlZ29yeSB9IGZyb20gXCIuL2NhdGVnb3J5LmpzXCI7XG5pbXBvcnQgeyBBcGlTZXJ2aWNlIH0gZnJvbSBcIi4vYXBpU2VydmljZS5qc1wiO1xuXG5leHBvcnQgY29uc3QgVG9kbyA9ICgoKSA9PiB7XG4gIGxldCBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xuICBsZXQgaXNFZGl0aW5nID0gZmFsc2U7XG5cbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvYXBwXCIpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YXNrLWZvcm1cIik7XG4gICAgICBjb25zdCBmb3JtSGVhZGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZm9ybS1oZWFkaW5nXCIpO1xuICAgICAgY29uc3Qgc3VibWl0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdWJtaXQtYnV0dG9uXCIpO1xuICAgICAgY29uc3QgZGVsZXRlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZWxldGUtYnV0dG9uXCIpO1xuICAgICAgY29uc3QgY2FuY2VsQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW5jZWwtYnV0dG9uXCIpO1xuICAgICAgY29uc3QgYWRkVGFza0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLWFkZC10YXNrXCIpO1xuICAgICAgY29uc3QgYWxsRGF5Q2hlY2tib3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFsbERheVwiKTtcbiAgICAgIGNvbnN0IHRpbWVJbnB1dHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpbWVJbnB1dHNcIik7XG4gICAgICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpO1xuICAgICAgY29uc3QgY2xvc2VUYXNrRm9ybUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xvc2UtdGFzay1mb3JtXCIpO1xuICAgICAgY29uc3QgYnRuQ2FsZW5kYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1jYWxlbmRhclwiKTtcbiAgICAgIGNvbnN0IGJ0blVwY29taW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG4tdXBjb21pbmdcIik7XG4gICAgICBjb25zdCBidG5Ub2RheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLXRvZGF5XCIpO1xuXG4gICAgICAvLyBIZWxwZXIgdG8gc2hvdy9oaWRlIGZvcm0gYW5kIGJhY2tkcm9wXG4gICAgICBmdW5jdGlvbiBzaG93Rm9ybSgpIHtcbiAgICAgICAgZm9ybS5jbGFzc0xpc3QuYWRkKFwidmlzaWJsZVwiKTtcbiAgICAgICAgY29udGVudC5jbGFzc0xpc3QuYWRkKFwiZm9ybS1vcGVuXCIpO1xuICAgICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGZvcm0uZm9jdXMgJiYgZm9ybS5mb2N1cygpO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGhpZGVGb3JtKCkge1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC5yZW1vdmUoXCJ2aXNpYmxlXCIpO1xuICAgICAgICBjb250ZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJmb3JtLW9wZW5cIik7XG4gICAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICBpZiAoYWRkVGFza0J1dHRvbikgYWRkVGFza0J1dHRvbi5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgfVxuXG4gICAgICAvLyBUb2dnbGUgdGltZSBpbnB1dHMgYmFzZWQgb24gQWxsIERheSBjaGVja2JveFxuICAgICAgYWxsRGF5Q2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGlzQWxsRGF5ID0gYWxsRGF5Q2hlY2tib3guY2hlY2tlZDtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFRpbWVcIikuZGlzYWJsZWQgPSBpc0FsbERheTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLmRpc2FibGVkID0gaXNBbGxEYXk7XG4gICAgICAgIGlmIChpc0FsbERheSkge1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLnZhbHVlID0gXCJcIjtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuZFRpbWVcIikudmFsdWUgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gQ2FsZW5kYXIgaW5pdGlhbGl6YXRpb25cbiAgICAgIGNvbnN0IGNhbGVuZGFyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbGVuZGFyXCIpO1xuICAgICAgY29uc3QgY2FsZW5kYXIgPSBuZXcgRnVsbENhbGVuZGFyLkNhbGVuZGFyKGNhbGVuZGFyRWwsIHtcbiAgICAgICAgaW5pdGlhbFZpZXc6IFwiZGF5R3JpZE1vbnRoXCIsXG4gICAgICAgIGhlYWRlclRvb2xiYXI6IHtcbiAgICAgICAgICBsZWZ0OiBcInByZXYsbmV4dCB0b2RheVwiLFxuICAgICAgICAgIGNlbnRlcjogXCJ0aXRsZVwiLFxuICAgICAgICAgIC8vIHJpZ2h0OiBcImRheUdyaWRNb250aCx0aW1lR3JpZFdlZWssdGltZUdyaWREYXlcIixcbiAgICAgICAgfSxcbiAgICAgICAgZWRpdGFibGU6IHRydWUsXG4gICAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgICBzZWxlY3RNaXJyb3I6IHRydWUsXG4gICAgICAgIGRheU1heEV2ZW50czogdHJ1ZSxcbiAgICAgICAgZXZlbnRzOiBbXSxcbiAgICAgICAgZXZlbnRDbGljazogZnVuY3Rpb24gKGluZm8pIHtcbiAgICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBpbmZvLmV2ZW50O1xuICAgICAgICAgIGlzRWRpdGluZyA9IHRydWU7XG4gICAgICAgICAgcG9wdWxhdGVGb3JtKGluZm8uZXZlbnQpO1xuICAgICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xuICAgICAgICAgIHNob3dGb3JtKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGV2ZW50RGlkTW91bnQ6IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgY29uc3QgaXNDb21wbGV0ZWQgPSBpbmZvLmV2ZW50LmV4dGVuZGVkUHJvcHMuY29tcGxldGVkO1xuICAgICAgICAgIGlmIChpc0NvbXBsZXRlZCkge1xuICAgICAgICAgICAgaW5mby5lbC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiNkM2QzZDNcIjtcbiAgICAgICAgICAgIGluZm8uZWwuc3R5bGUudGV4dERlY29yYXRpb24gPSBcImxpbmUtdGhyb3VnaFwiO1xuICAgICAgICAgICAgaW5mby5lbC5zdHlsZS5vcGFjaXR5ID0gXCIwLjdcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBBcHBseSBjYXRlZ29yeSBjb2xvclxuICAgICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gaW5mby5ldmVudC5leHRlbmRlZFByb3BzLmNhdGVnb3J5O1xuICAgICAgICAgIGlmIChjYXRlZ29yeSAmJiBjYXRlZ29yeSAhPT0gXCJOb25lXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IGNhdCA9IENhdGVnb3J5LmdldENhdGVnb3JpZXMoKS5maW5kKFxuICAgICAgICAgICAgICAoYykgPT4gYy5uYW1lID09PSBjYXRlZ29yeVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmIChjYXQpIHtcbiAgICAgICAgICAgICAgaW5mby5lbC5zdHlsZS5ib3JkZXJMZWZ0ID0gYDRweCBzb2xpZCAke2NhdC5jb2xvcn1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmZvLmVsLnN0eWxlLmJvcmRlckxlZnQgPSBcIjRweCBzb2xpZCB0cmFuc3BhcmVudFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBGZXRjaCB0YXNrcyBmcm9tIEFQSSBhbmQgcmVuZGVyIGNhbGVuZGFyXG4gICAgICBhc3luYyBmdW5jdGlvbiBpbml0aWFsaXplQ2FsZW5kYXIoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgdGFza3MgPSBhd2FpdCBBcGlTZXJ2aWNlLmZldGNoVGFza3MoKTtcbiAgICAgICAgICB0YXNrcy5mb3JFYWNoKCh0YXNrKSA9PiBjYWxlbmRhci5hZGRFdmVudCh0YXNrKSk7XG4gICAgICAgICAgY2FsZW5kYXIucmVuZGVyKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBmZXRjaCB0YXNrczpcIiwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGluaXRpYWxpemVDYWxlbmRhcigpO1xuXG4gICAgICAvLyBTaWRlYmFyIGJ1dHRvbiBldmVudCBsaXN0ZW5lcnNcbiAgICAgIGlmIChidG5DYWxlbmRhcikge1xuICAgICAgICBidG5DYWxlbmRhci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgIGNhbGVuZGFyLmNoYW5nZVZpZXcoXCJkYXlHcmlkTW9udGhcIik7XG4gICAgICAgICAgYnRuQ2FsZW5kYXIuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcbiAgICAgICAgICBidG5VcGNvbWluZy5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xuICAgICAgICAgIC8vIE9wdGlvbmFsbHkgdXBkYXRlIGhlYWRlclxuICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudC1oZWFkZXJcIikudGV4dENvbnRlbnQgPSBcIkNhbGVuZGFyXCI7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGJ0blVwY29taW5nKSB7XG4gICAgICAgIGJ0blVwY29taW5nLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgY2FsZW5kYXIuY2hhbmdlVmlldyhcImxpc3RXZWVrXCIpO1xuICAgICAgICAgIGJ0blVwY29taW5nLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XG4gICAgICAgICAgYnRuQ2FsZW5kYXIuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcbiAgICAgICAgICAvLyBPcHRpb25hbGx5IHVwZGF0ZSBoZWFkZXJcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnQtaGVhZGVyXCIpLnRleHRDb250ZW50ID0gXCJVcGNvbWluZ1wiO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChidG5Ub2RheSkge1xuICAgICAgICBidG5Ub2RheS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgIGNhbGVuZGFyLmNoYW5nZVZpZXcoXCJ0aW1lR3JpZERheVwiLCBuZXcgRGF0ZSgpKTtcbiAgICAgICAgICBidG5Ub2RheS5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xuICAgICAgICAgIGJ0bkNhbGVuZGFyLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XG4gICAgICAgICAgYnRuVXBjb21pbmcuY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcbiAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnQtaGVhZGVyXCIpLnRleHRDb250ZW50ID0gXCJUb2RheVwiO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gRXZlbnQgTGlzdGVuZXJzXG4gICAgICBpZiAoYWRkVGFza0J1dHRvbikge1xuICAgICAgICBhZGRUYXNrQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgaXNFZGl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcbiAgICAgICAgICBmb3JtLnJlc2V0KCk7XG4gICAgICAgICAgYWxsRGF5Q2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgIHRpbWVJbnB1dHMuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xuICAgICAgICAgIHNob3dGb3JtKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgYXN5bmMgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjb25zdCBmb3JtRGF0YSA9IGdldEZvcm1EYXRhKCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoaXNFZGl0aW5nKSB7XG4gICAgICAgICAgICBhd2FpdCB1cGRhdGVUYXNrKGZvcm1EYXRhKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgY3JlYXRlVGFzayhmb3JtRGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZvcm0ucmVzZXQoKTtcbiAgICAgICAgICBhbGxEYXlDaGVja2JveC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgdGltZUlucHV0cy5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG4gICAgICAgICAgdXBkYXRlRm9ybVVJKCk7XG4gICAgICAgICAgaGlkZUZvcm0oKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHNhdmUgdGFzazpcIiwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgZGVsZXRlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmIChjdXJyZW50RWRpdGluZ1Rhc2spIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgZGVsZXRlVGFzayhjdXJyZW50RWRpdGluZ1Rhc2suaWQpO1xuICAgICAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrLnJlbW92ZSgpO1xuICAgICAgICAgICAgZm9ybS5yZXNldCgpO1xuICAgICAgICAgICAgaXNFZGl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xuICAgICAgICAgICAgdXBkYXRlRm9ybVVJKCk7XG4gICAgICAgICAgICBoaWRlRm9ybSgpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGRlbGV0ZSB0YXNrOlwiLCBlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY2FuY2VsQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIGZvcm0ucmVzZXQoKTtcbiAgICAgICAgaXNFZGl0aW5nID0gZmFsc2U7XG4gICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzayA9IG51bGw7XG4gICAgICAgIGFsbERheUNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgdGltZUlucHV0cy5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG4gICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xuICAgICAgICBoaWRlRm9ybSgpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEFkZCBjbG9zZSAoY3Jvc3MpIGJ1dHRvbiBoYW5kbGVyXG4gICAgICBpZiAoY2xvc2VUYXNrRm9ybUJ0bikge1xuICAgICAgICBjbG9zZVRhc2tGb3JtQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgZm9ybS5yZXNldCgpO1xuICAgICAgICAgIGlzRWRpdGluZyA9IGZhbHNlO1xuICAgICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzayA9IG51bGw7XG4gICAgICAgICAgYWxsRGF5Q2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgIHRpbWVJbnB1dHMuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xuICAgICAgICAgIGhpZGVGb3JtKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBIaWRlIGZvcm0gb24gY2xpY2sgb3V0c2lkZVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZSkgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgZm9ybS5jbGFzc0xpc3QuY29udGFpbnMoXCJ2aXNpYmxlXCIpICYmXG4gICAgICAgICAgIWZvcm0uY29udGFpbnMoZS50YXJnZXQpICYmXG4gICAgICAgICAgIShhZGRUYXNrQnV0dG9uICYmIGFkZFRhc2tCdXR0b24uY29udGFpbnMoZS50YXJnZXQpKVxuICAgICAgICApIHtcbiAgICAgICAgICBmb3JtLnJlc2V0KCk7XG4gICAgICAgICAgaXNFZGl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcbiAgICAgICAgICBhbGxEYXlDaGVja2JveC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgdGltZUlucHV0cy5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG4gICAgICAgICAgdXBkYXRlRm9ybVVJKCk7XG4gICAgICAgICAgaGlkZUZvcm0oKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIEhpZGUgZm9ybSBpbml0aWFsbHlcbiAgICAgIGhpZGVGb3JtKCk7XG5cbiAgICAgIC8vIEhlbHBlciBmdW5jdGlvbnNcbiAgICAgIGZ1bmN0aW9uIHVwZGF0ZUZvcm1VSSgpIHtcbiAgICAgICAgaWYgKGlzRWRpdGluZykge1xuICAgICAgICAgIGZvcm1IZWFkaW5nLnRleHRDb250ZW50ID0gXCJFZGl0IFRhc2tcIjtcbiAgICAgICAgICBzdWJtaXRCdXR0b24udGV4dENvbnRlbnQgPSBcIlNhdmUgQ2hhbmdlc1wiO1xuICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xuICAgICAgICAgIGNhbmNlbEJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xuICAgICAgICAgIGlmIChhZGRUYXNrQnV0dG9uKSBhZGRUYXNrQnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3JtSGVhZGluZy50ZXh0Q29udGVudCA9IFwiQWRkIE5ldyBUYXNrXCI7XG4gICAgICAgICAgc3VibWl0QnV0dG9uLnRleHRDb250ZW50ID0gXCJBZGQgVGFza1wiO1xuICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgICAgICAgIGNhbmNlbEJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgICAgICAgIGlmIChhZGRUYXNrQnV0dG9uKSBhZGRUYXNrQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcG9wdWxhdGVGb3JtKGV2ZW50KSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGl0bGVcIikudmFsdWUgPSBldmVudC50aXRsZTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YXNrRGF0ZVwiKS52YWx1ZSA9IGV2ZW50LnN0YXJ0U3RyLnN1YnN0cmluZyhcbiAgICAgICAgICAwLFxuICAgICAgICAgIDEwXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGFsbERheSA9IGV2ZW50LmFsbERheTtcbiAgICAgICAgYWxsRGF5Q2hlY2tib3guY2hlY2tlZCA9IGFsbERheTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFRpbWVcIikuZGlzYWJsZWQgPSBhbGxEYXk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5kVGltZVwiKS5kaXNhYmxlZCA9IGFsbERheTtcblxuICAgICAgICBpZiAoIWFsbERheSkge1xuICAgICAgICAgIGNvbnN0IHN0YXJ0RGF0ZSA9IG5ldyBEYXRlKGV2ZW50LnN0YXJ0KTtcbiAgICAgICAgICBjb25zdCBlbmREYXRlID0gbmV3IERhdGUoZXZlbnQuZW5kIHx8IGV2ZW50LnN0YXJ0KTtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0VGltZVwiKS52YWx1ZSA9IHN0YXJ0RGF0ZVxuICAgICAgICAgICAgLnRvVGltZVN0cmluZygpXG4gICAgICAgICAgICAuc3Vic3RyaW5nKDAsIDUpO1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5kVGltZVwiKS52YWx1ZSA9IGVuZERhdGVcbiAgICAgICAgICAgIC50b1RpbWVTdHJpbmcoKVxuICAgICAgICAgICAgLnN1YnN0cmluZygwLCA1KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0VGltZVwiKS52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLnZhbHVlID0gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVzY3JpcHRpb25cIikudmFsdWUgPVxuICAgICAgICAgIGV2ZW50LmV4dGVuZGVkUHJvcHMuZGVzY3JpcHRpb24gfHwgXCJcIjtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eVwiKS52YWx1ZSA9XG4gICAgICAgICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5wcmlvcml0eSB8fCBcImxvd1wiO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3J5XCIpLnZhbHVlID1cbiAgICAgICAgICBldmVudC5leHRlbmRlZFByb3BzLmNhdGVnb3J5IHx8IFwiTm9uZVwiO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbXBsZXRlZFwiKS5jaGVja2VkID1cbiAgICAgICAgICBldmVudC5leHRlbmRlZFByb3BzLmNvbXBsZXRlZCB8fCBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZ2V0Rm9ybURhdGEoKSB7XG4gICAgICAgIGNvbnN0IGNhdGVnb3J5VmFsdWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3J5XCIpLnZhbHVlO1xuICAgICAgICBjb25zdCBhbGxEYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFsbERheVwiKS5jaGVja2VkO1xuICAgICAgICBjb25zdCBkYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YXNrRGF0ZVwiKS52YWx1ZTtcbiAgICAgICAgbGV0IHN0YXJ0LCBlbmQ7XG5cbiAgICAgICAgaWYgKGFsbERheSkge1xuICAgICAgICAgIHN0YXJ0ID0gZGF0ZTtcbiAgICAgICAgICBlbmQgPSBkYXRlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLnZhbHVlO1xuICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuZFRpbWVcIikudmFsdWU7XG4gICAgICAgICAgc3RhcnQgPSBzdGFydFRpbWUgPyBgJHtkYXRlfVQke3N0YXJ0VGltZX1gIDogZGF0ZTtcbiAgICAgICAgICBlbmQgPSBlbmRUaW1lID8gYCR7ZGF0ZX1UJHtlbmRUaW1lfWAgOiBzdGFydDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IGlzRWRpdGluZyA/IGN1cnJlbnRFZGl0aW5nVGFzay5pZCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICB0aXRsZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXRsZVwiKS52YWx1ZSxcbiAgICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgICAgZW5kOiBlbmQsXG4gICAgICAgICAgYWxsRGF5OiBhbGxEYXksXG4gICAgICAgICAgZGVzY3JpcHRpb246IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVzY3JpcHRpb25cIikudmFsdWUsXG4gICAgICAgICAgcHJpb3JpdHk6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlcIikudmFsdWUsXG4gICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5VmFsdWUgPT09IFwiTm9uZVwiID8gbnVsbCA6IGNhdGVnb3J5VmFsdWUsXG4gICAgICAgICAgY29tcGxldGVkOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbXBsZXRlZFwiKS5jaGVja2VkLFxuICAgICAgICAgIGNsYXNzTmFtZTogYHByaW9yaXR5LSR7ZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eVwiKS52YWx1ZX0gJHtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29tcGxldGVkXCIpLmNoZWNrZWQgPyBcImNvbXBsZXRlZC10YXNrXCIgOiBcIlwiXG4gICAgICAgICAgfWAsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVRhc2soZGF0YSkge1xuICAgICAgICBjb25zdCBuZXdUYXNrID0gYXdhaXQgQXBpU2VydmljZS5jcmVhdGVUYXNrKGRhdGEpO1xuICAgICAgICBjYWxlbmRhci5hZGRFdmVudChuZXdUYXNrKTtcbiAgICAgICAgcmV0dXJuIG5ld1Rhc2s7XG4gICAgICB9XG5cbiAgICAgIGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVRhc2soZGF0YSkge1xuICAgICAgICBjb25zdCB1cGRhdGVkVGFzayA9IGF3YWl0IEFwaVNlcnZpY2UudXBkYXRlVGFzayhkYXRhLmlkLCBkYXRhKTtcbiAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrLnJlbW92ZSgpO1xuICAgICAgICBjYWxlbmRhci5hZGRFdmVudCh1cGRhdGVkVGFzayk7XG4gICAgICAgIHJldHVybiB1cGRhdGVkVGFzaztcbiAgICAgIH1cblxuICAgICAgYXN5bmMgZnVuY3Rpb24gZGVsZXRlVGFzayhpZCkge1xuICAgICAgICBhd2FpdCBBcGlTZXJ2aWNlLmRlbGV0ZVRhc2soaWQpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHJldHVybiB7fTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBBcGlTZXJ2aWNlIH0gZnJvbSBcIi4vYXBpU2VydmljZS5qc1wiO1xuXG5leHBvcnQgY29uc3QgQ2F0ZWdvcnkgPSAoKCkgPT4ge1xuICBsZXQgY2F0ZWdvcmllcyA9IFtdO1xuXG4gIC8vIEhlbHBlciBmdW5jdGlvbnMgZGVmaW5lZCBvdXRzaWRlIERPTUNvbnRlbnRMb2FkZWRcbiAgZnVuY3Rpb24gcmVuZGVyQ2F0ZWdvcmllcygpIHtcbiAgICBjb25zdCBjYXRlZ29yaWVzQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRlZ29yaWVzLWNvbnRhaW5lclwiKTtcblxuICAgIGNhdGVnb3JpZXNDb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcblxuICAgIGNhdGVnb3JpZXMuZm9yRWFjaCgoY2F0ZWdvcnksIGluZGV4KSA9PiB7XG4gICAgICAvLyBFbnN1cmUgY2F0ZWdvcnkuaWQgaXMgYSBzdHJpbmcgZm9yIGNvbnNpc3RlbmN5XG4gICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICAgIGxpLmNsYXNzTmFtZSA9IFwiY2F0ZWdvcnktaXRlbVwiO1xuICAgICAgbGkuaW5uZXJIVE1MID0gYFxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXRlZ29yeS1jb250ZW50XCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNhdGVnb3J5LWNvbG9yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAke2NhdGVnb3J5LmNvbG9yfTtcIj48L3NwYW4+IFxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjYXRlZ29yeS1uYW1lXCI+JHtjYXRlZ29yeS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZGVsZXRlLWNhdGVnb3J5LWJ0blwiIGRhdGEtaWQ9XCIke2NhdGVnb3J5LmlkfVwiPlxuICAgICAgICAgICAgPGkgY2xhc3M9XCJmYXMgZmEtdHJhc2hcIj48L2k+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIGA7XG4gICAgICBjYXRlZ29yaWVzQ29udGFpbmVyLmFwcGVuZENoaWxkKGxpKTtcbiAgICB9KTtcblxuICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgdG8gZGVsZXRlIGJ1dHRvbnNcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmRlbGV0ZS1jYXRlZ29yeS1idG5cIikuZm9yRWFjaCgoYnRuKSA9PiB7XG4gICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIC8vIEVuc3VyZSBpZCBpcyB0cmVhdGVkIGFzIGEgc3RyaW5nXG4gICAgICAgIGNvbnN0IGlkID0gYnRuLmRhdGFzZXQuaWQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQXR0ZW1wdGluZyB0byBkZWxldGUgY2F0ZWdvcnkgd2l0aCBpZDpcIiwgaWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkN1cnJlbnQgY2F0ZWdvcmllczpcIiwgY2F0ZWdvcmllcyk7XG4gICAgICAgIGRlbGV0ZUNhdGVnb3J5KGlkKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKSB7XG4gICAgY29uc3QgY2F0ZWdvcnlTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3J5XCIpO1xuICAgIGNhdGVnb3J5U2VsZWN0LmlubmVySFRNTCA9IFwiXCI7XG5cbiAgICAvLyBBZGQgXCJOb25lXCIgb3B0aW9uIGZpcnN0XG4gICAgY29uc3Qgbm9uZU9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XG4gICAgbm9uZU9wdGlvbi52YWx1ZSA9IFwiTm9uZVwiO1xuICAgIG5vbmVPcHRpb24udGV4dENvbnRlbnQgPSBcIk5vbmVcIjtcbiAgICBjYXRlZ29yeVNlbGVjdC5hcHBlbmRDaGlsZChub25lT3B0aW9uKTtcblxuICAgIC8vIEFkZCBhbGwgY2F0ZWdvcnkgb3B0aW9uc1xuICAgIGNhdGVnb3JpZXMuZm9yRWFjaCgoY2F0ZWdvcnkpID0+IHtcbiAgICAgIGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XG4gICAgICBvcHRpb24udmFsdWUgPSBjYXRlZ29yeS5uYW1lO1xuICAgICAgb3B0aW9uLnRleHRDb250ZW50ID0gY2F0ZWdvcnkubmFtZTtcbiAgICAgIGNhdGVnb3J5U2VsZWN0LmFwcGVuZENoaWxkKG9wdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBkZWxldGVDYXRlZ29yeShpZCkge1xuICAgIC8vIENvbnZlcnQgaWQgdG8gc3RyaW5nIGZvciBjb25zaXN0ZW5jeVxuICAgIGNvbnN0IGluZGV4ID0gY2F0ZWdvcmllcy5maW5kSW5kZXgoXG4gICAgICAoYykgPT4gYy5pZC50b1N0cmluZygpID09PSBpZC50b1N0cmluZygpXG4gICAgKTtcbiAgICBjb25zb2xlLmxvZyhcImRlbGV0ZUNhdGVnb3J5IGNhbGxlZCB3aXRoIGlkOlwiLCBpZCwgXCJGb3VuZCBpbmRleDpcIiwgaW5kZXgpO1xuXG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIERlbGV0ZSBjYXRlZ29yeSB2aWEgQVBJXG4gICAgICAgIGF3YWl0IEFwaVNlcnZpY2UuZGVsZXRlQ2F0ZWdvcnkoaWQpO1xuICAgICAgICAvLyBSZW1vdmUgZnJvbSBsb2NhbCBzdGF0ZVxuICAgICAgICBjYXRlZ29yaWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJlbmRlckNhdGVnb3JpZXMoKTtcbiAgICAgICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZGVsZXRlIGNhdGVnb3J5OlwiLCBlcnJvcik7XG4gICAgICAgIC8vIE9wdGlvbmFsbHkgc2hvdyBlcnJvciBtZXNzYWdlIHRvIHVzZXJcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcihcIkNhdGVnb3J5IG5vdCBmb3VuZCB3aXRoIGlkOlwiLCBpZCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvYXBwXCIpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBjYXRlZ29yeVNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2F0ZWdvcnlcIik7XG4gICAgICBjb25zdCBjYXRlZ29yaWVzQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICAgIFwiY2F0ZWdvcmllcy1jb250YWluZXJcIlxuICAgICAgKTtcbiAgICAgIGNvbnN0IGFkZE5ld0NhdGVnb3J5QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGQtbmV3LWNhdGVnb3J5LWJ0blwiKTtcbiAgICAgIGNvbnN0IG5ld0NhdGVnb3J5Rm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3LWNhdGVnb3J5LWZvcm1cIik7XG4gICAgICBjb25zdCBjcmVhdGVDYXRlZ29yeUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3JlYXRlLWNhdGVnb3J5LWJ0blwiKTtcblxuICAgICAgLy8gRmV0Y2ggY2F0ZWdvcmllcyBmcm9tIEFQSVxuICAgICAgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZUNhdGVnb3JpZXMoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY2F0ZWdvcmllcyA9IGF3YWl0IEFwaVNlcnZpY2UuZmV0Y2hDYXRlZ29yaWVzKCk7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJGZXRjaGVkIGNhdGVnb3JpZXM6XCIsIGNhdGVnb3JpZXMpO1xuICAgICAgICAgIHJlbmRlckNhdGVnb3JpZXMoKTtcbiAgICAgICAgICB1cGRhdGVDYXRlZ29yeVNlbGVjdCgpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZmV0Y2ggY2F0ZWdvcmllczpcIiwgZXJyb3IpO1xuICAgICAgICAgIC8vIE9wdGlvbmFsbHkgc2hvdyBlcnJvciBtZXNzYWdlIHRvIHVzZXJcbiAgICAgICAgICByZW5kZXJDYXRlZ29yaWVzKCk7XG4gICAgICAgICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpbml0aWFsaXplQ2F0ZWdvcmllcygpO1xuXG4gICAgICAvLyBDYXRlZ29yeSBtYW5hZ2VtZW50XG4gICAgICBhZGROZXdDYXRlZ29yeUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICBuZXdDYXRlZ29yeUZvcm0uc3R5bGUuZGlzcGxheSA9XG4gICAgICAgICAgbmV3Q2F0ZWdvcnlGb3JtLnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiID8gXCJmbGV4XCIgOiBcIm5vbmVcIjtcbiAgICAgIH0pO1xuXG4gICAgICBjcmVhdGVDYXRlZ29yeUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctY2F0ZWdvcnktbmFtZVwiKS52YWx1ZS50cmltKCk7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctY2F0ZWdvcnktY29sb3JcIikudmFsdWU7XG5cbiAgICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gQWRkIG5ldyBjYXRlZ29yeSB2aWEgQVBJXG4gICAgICAgICAgICBjb25zdCBhcGlDYXRlZ29yeSA9IGF3YWl0IEFwaVNlcnZpY2UuY3JlYXRlQ2F0ZWdvcnkoe1xuICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICBjb2xvcixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2F0ZWdvcmllcy5wdXNoKGFwaUNhdGVnb3J5KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQWRkZWQgbmV3IGNhdGVnb3J5OlwiLCBhcGlDYXRlZ29yeSk7XG4gICAgICAgICAgICByZW5kZXJDYXRlZ29yaWVzKCk7XG4gICAgICAgICAgICB1cGRhdGVDYXRlZ29yeVNlbGVjdCgpO1xuXG4gICAgICAgICAgICAvLyBSZXNldCBmb3JtXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1uYW1lXCIpLnZhbHVlID0gXCJcIjtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3LWNhdGVnb3J5LWNvbG9yXCIpLnZhbHVlID0gXCIjY2NjY2NjXCI7XG4gICAgICAgICAgICBuZXdDYXRlZ29yeUZvcm0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGNyZWF0ZSBjYXRlZ29yeTpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgLy8gT3B0aW9uYWxseSBzaG93IGVycm9yIG1lc3NhZ2UgdG8gdXNlclxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBnZXRDYXRlZ29yaWVzOiAoKSA9PiBjYXRlZ29yaWVzLFxuICAgIHJlbmRlckNhdGVnb3JpZXMsXG4gICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QsXG4gIH07XG59KSgpO1xuIiwiZXhwb3J0IGNvbnN0IERvbVV0aWxzID0gKCgpID0+IHtcbiAgZnVuY3Rpb24gY2xlYXJNZXNzYWdlcygpIHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lc3NhZ2VDb250YWluZXJcIik7XG4gICAgaWYgKGNvbnRhaW5lcikgY29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLmVycm9yLW1lc3NhZ2UsIC5zdWNjZXNzLW1lc3NhZ2VcIilcbiAgICAgIC5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICBpZiAoZWwucGFyZW50Tm9kZSAhPT0gY29udGFpbmVyKSBlbC5yZW1vdmUoKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvd01lc3NhZ2UobWVzc2FnZSwgdHlwZSA9IFwiZXJyb3JcIikge1xuICAgIGNsZWFyTWVzc2FnZXMoKTtcbiAgICBjb25zdCBtZXNzYWdlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NOYW1lID1cbiAgICAgIHR5cGUgPT09IFwiZXJyb3JcIiA/IFwiZXJyb3ItbWVzc2FnZVwiIDogXCJzdWNjZXNzLW1lc3NhZ2VcIjtcbiAgICBtZXNzYWdlLnNwbGl0KFwiXFxuXCIpLmZvckVhY2goKGxpbmUpID0+IHtcbiAgICAgIGNvbnN0IHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICAgIHAudGV4dENvbnRlbnQgPSBsaW5lO1xuICAgICAgbWVzc2FnZUVsZW1lbnQuYXBwZW5kQ2hpbGQocCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lc3NhZ2VDb250YWluZXJcIik7XG4gICAgaWYgKGNvbnRhaW5lcikge1xuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG1lc3NhZ2VFbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXV0aEZvcm1cIik7XG4gICAgICBmb3JtXG4gICAgICAgID8gZm9ybS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShtZXNzYWdlRWxlbWVudCwgZm9ybSlcbiAgICAgICAgOiBkb2N1bWVudC5ib2R5LnByZXBlbmQobWVzc2FnZUVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2xlYXJNZXNzYWdlcyxcbiAgICBzaG93RXJyb3I6IChtc2cpID0+IHNob3dNZXNzYWdlKG1zZywgXCJlcnJvclwiKSxcbiAgICBzaG93U3VjY2VzczogKG1zZykgPT4gc2hvd01lc3NhZ2UobXNnLCBcInN1Y2Nlc3NcIiksXG4gIH07XG59KSgpO1xuIiwiZXhwb3J0IGNvbnN0IExvYWRlciA9ICgoKSA9PiB7XG4gIGZ1bmN0aW9uIHRvZ2dsZShzaG93KSB7XG4gICAgbGV0IGxvYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGVyXCIpO1xuICAgIGlmICghbG9hZGVyICYmIHNob3cpIGxvYWRlciA9IGNyZWF0ZSgpO1xuICAgIGlmIChsb2FkZXIpIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gc2hvdyA/IFwiZmxleFwiIDogXCJub25lXCI7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgY29uc3QgbG9hZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBsb2FkZXIuaWQgPSBcImxvYWRlclwiO1xuICAgIGxvYWRlci5jbGFzc05hbWUgPSBcImxvYWRlclwiO1xuICAgIGxvYWRlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXJcIj48L2Rpdj4nO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobG9hZGVyKTtcbiAgICByZXR1cm4gbG9hZGVyO1xuICB9XG5cbiAgcmV0dXJuIHsgdG9nZ2xlIH07XG59KSgpO1xuIiwiaW1wb3J0IHsgTG9hZGVyIH0gZnJvbSBcIi4vbG9hZGVyLmpzXCI7XG5pbXBvcnQgeyBEb21VdGlscyB9IGZyb20gXCIuL2RvbVV0aWxzLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBVc2VyID0gKCgpID0+IHtcbiAgYXN5bmMgZnVuY3Rpb24gbG9nb3V0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiQXR0ZW1wdGluZyBsb2dvdXQuLi5cIik7XG4gICAgTG9hZGVyLnRvZ2dsZSh0cnVlKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcIi9hcGkvbG9nb3V0XCIsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgaGVhZGVyczogeyBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKTtcbiAgICAgIGlmICghcmVzcG9uc2Uub2spXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBkYXRhLmVycm9yIHx8IGBMb2dvdXQgZmFpbGVkIHdpdGggc3RhdHVzOiAke3Jlc3BvbnNlLnN0YXR1c31gXG4gICAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZyhcIkxvZ291dCBzdWNjZXNzZnVsIHZpYSBBUEkuXCIpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiTG9nb3V0IEFQSSBjYWxsIGZhaWxlZDpcIiwgZXJyb3IpO1xuICAgICAgRG9tVXRpbHMuc2hvd0Vycm9yKFxuICAgICAgICBcIkNvdWxkIG5vdCBwcm9wZXJseSBsb2cgb3V0LiBDbGVhciBjb29raWVzIG1hbnVhbGx5IGlmIG5lZWRlZC5cIlxuICAgICAgKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJ1c2VyXCIpO1xuICAgICAgTG9hZGVyLnRvZ2dsZShmYWxzZSk7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2xvZ2luXCI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZGlzcGxheVVzZXJEYXRhKCkge1xuICAgIGNvbnN0IHVzZXJEYXRhU3RyaW5nID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ1c2VyXCIpO1xuICAgIGlmICghdXNlckRhdGFTdHJpbmcpIHJldHVybiBsb2dvdXQoKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdXNlckRhdGEgPSBKU09OLnBhcnNlKHVzZXJEYXRhU3RyaW5nKTtcbiAgICAgIGNvbnN0IHVzZXJOYW1lID0gdXNlckRhdGEubmFtZSB8fCBcIlVzZXJcIjtcbiAgICAgIGNvbnN0IHVzZXJOYW1lRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlci1uYW1lLWRpc3BsYXlcIik7XG4gICAgICBpZiAodXNlck5hbWVEaXNwbGF5KSB1c2VyTmFtZURpc3BsYXkudGV4dENvbnRlbnQgPSB1c2VyTmFtZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiSW52YWxpZCB1c2VyIGRhdGEgaW4gbG9jYWxTdG9yYWdlLlwiKTtcbiAgICAgIGxvZ291dCgpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IGxvZ291dCwgZGlzcGxheVVzZXJEYXRhIH07XG59KSgpO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4vbW9kdWxlcy91c2VyLmpzXCI7XG5pbXBvcnQgeyBBdXRoIH0gZnJvbSBcIi4vbW9kdWxlcy9hdXRoLmpzXCI7XG5pbXBvcnQgeyBUb2RvIH0gZnJvbSBcIi4vbW9kdWxlcy9jYWxlbmRhci5qc1wiO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09IFwiL2FwcFwiKSB7XG4gICAgVXNlci5kaXNwbGF5VXNlckRhdGEoKTtcbiAgfVxuICBjb25zdCBsb2dvdXRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1sb2dvdXRcIik7XG4gIGlmIChsb2dvdXRCdG4pIGxvZ291dEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgVXNlci5sb2dvdXQpO1xuXG4gIGNvbnNvbGUubG9nKFwiTWFpbiBhcHAgaW5pdGlhbGl6ZWQuXCIpO1xufSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=