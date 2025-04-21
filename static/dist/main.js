/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

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
/* harmony import */ var _category__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./category */ "./src/modules/category.js");

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

    // Initialize tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem("calendarTasks")) || [];

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
      events: tasks,
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

        // Apply catagory color (handled by Category module)
        const catagory = info.event.extendedProps.catagory;
        if (catagory && catagory !== "None") {
          const cat = _category__WEBPACK_IMPORTED_MODULE_0__.Category.getCatagories().find((c) => c.name === catagory);
          if (cat) {
            info.el.style.borderLeft = `4px solid ${cat.color}`;
          }
        } else {
          info.el.style.borderLeft = "4px solid transparent";
        }
      },
    });

    calendar.render();

    // Event Listeners
    addTaskButton.addEventListener("click", () => {
      isEditing = false;
      currentEditingTask = null;
      form.reset();
      updateFormUI();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = getFormData();

      if (isEditing) {
        updateTask(formData);
      } else {
        createTask(formData);
      }

      form.reset();
      updateFormUI();
    });

    deleteButton.addEventListener("click", () => {
      if (currentEditingTask) {
        tasks = tasks.filter((t) => t.id !== currentEditingTask.id);
        currentEditingTask.remove();
        saveTasks();
        form.reset();
        isEditing = false;
        currentEditingTask = null;
        updateFormUI();
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
      document.getElementById("catagory").value =
        event.extendedProps.catagory || "None";
      document.getElementById("completed").checked =
        event.extendedProps.completed || false;
    }

    function getFormData() {
      const catagoryValue = document.getElementById("catagory").value;
      return {
        id: isEditing ? currentEditingTask.id : Date.now().toString(),
        title: document.getElementById("title").value,
        start: document.getElementById("taskDate").value,
        end: document.getElementById("taskDate").value,
        description: document.getElementById("description").value,
        priority: document.getElementById("priority").value,
        catagory: catagoryValue === "None" ? null : catagoryValue,
        completed: document.getElementById("completed").checked,
        className: `priority-${document.getElementById("priority").value} ${
          document.getElementById("completed").checked ? "completed-task" : ""
        }`,
      };
    }

    function createTask(data) {
      tasks.push(data);
      calendar.addEvent(data);
      saveTasks();
    }

    function updateTask(data) {
      const index = tasks.findIndex((t) => t.id === data.id);
      if (index > -1) {
        tasks[index] = data;
        currentEditingTask.remove();
        calendar.addEvent(data);
        saveTasks();
      }
    }

    function saveTasks() {
      localStorage.setItem("calendarTasks", JSON.stringify(tasks));
    }

    // Initial UI update
    updateFormUI();
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
const Category = (() => {
  let catagories = [
    { name: "Personal", color: "#f56565" },
    { name: "Work", color: "#63b3ed" },
    { name: "Catagory 1", color: "#f6e05e" },
  ];

  document.addEventListener("DOMContentLoaded", function () {
    const catagorySelect = document.getElementById("catagory");
    const catagoriesContainer = document.getElementById("catagories-container");
    const addNewCatagoryBtn = document.getElementById("add-new-catagory-btn");
    const newCatagoryForm = document.getElementById("new-catagory-form");
    const createCatagoryBtn = document.getElementById("create-catagory-btn");

    // Initialize catagories from localStorage or default
    const savedCatagories = JSON.parse(
      localStorage.getItem("calendarCatagories")
    );
    if (savedCatagories && savedCatagories.length > 0) {
      catagories = savedCatagories;
    }

    // Render catagories and update select
    renderCatagories();
    updateCatagorySelect();

    // Catagory management
    addNewCatagoryBtn.addEventListener("click", () => {
      newCatagoryForm.style.display =
        newCatagoryForm.style.display === "none" ? "flex" : "none";
    });

    createCatagoryBtn.addEventListener("click", () => {
      const name = document.getElementById("new-catagory-name").value.trim();
      const color = document.getElementById("new-catagory-color").value;

      if (name) {
        // Add new catagory
        catagories.push({ name, color });
        saveCatagories();
        renderCatagories();
        updateCatagorySelect();

        // Reset form
        document.getElementById("new-catagory-name").value = "";
        document.getElementById("new-catagory-color").value = "#cccccc";
        newCatagoryForm.style.display = "none";
      }
    });

    // Helper functions
    function renderCatagories() {
      catagoriesContainer.innerHTML = "";

      catagories.forEach((catagory, index) => {
        const li = document.createElement("li");
        li.className = "catagory-item";
        li.innerHTML = `
            <div class="catagory-content">
              <span class="catagory-color" style="background-color: ${catagory.color};"></span> 
              <span class="catagory-name">${catagory.name}</span>
            </div>
            <button class="delete-catagory-btn" data-index="${index}">
              <i class="fas fa-trash"></i>
            </button>
          `;
        catagoriesContainer.appendChild(li);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-catagory-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const index = parseInt(btn.dataset.index);
          deleteCatagory(index);
        });
      });

      // Add the "Add New Catagory" button and form back
      catagoriesContainer.appendChild(addNewCatagoryBtn);
      catagoriesContainer.appendChild(newCatagoryForm);
    }

    function deleteCatagory(index) {
      if (index >= 0 && index < catagories.length) {
        // Remove the catagory
        const deletedCatagoryName = catagories[index].name;
        catagories.splice(index, 1);
        saveCatagories();

        // Update tasks that were using this catagory
        let tasks = JSON.parse(localStorage.getItem("calendarTasks")) || [];
        tasks = tasks.map((task) => {
          if (task.extendedProps?.catagory === deletedCatagoryName) {
            return {
              ...task,
              extendedProps: {
                ...task.extendedProps,
                catagory: null,
              },
            };
          }
          return task;
        });
        localStorage.setItem("calendarTasks", JSON.stringify(tasks));

        // Re-render the calendar (Note: Calendar is in Todo module, so we rely on UI update)
        renderCatagories();
        updateCatagorySelect();
      }
    }

    function updateCatagorySelect() {
      catagorySelect.innerHTML = "";

      // Add "None" option first
      const noneOption = document.createElement("option");
      noneOption.value = "None";
      noneOption.textContent = "None";
      catagorySelect.appendChild(noneOption);

      // Add all catagory options
      catagories.forEach((catagory) => {
        const option = document.createElement("option");
        option.value = catagory.name;
        option.textContent = catagory.name;
        catagorySelect.appendChild(option);
      });
    }

    function saveCatagories() {
      localStorage.setItem("calendarCatagories", JSON.stringify(catagories));
    }
  });

  return {
    getCatagories: () => catagories,
    renderCatagories: () => renderCatagories(),
    updateCatagorySelect: () => updateCatagorySelect(),
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQXFDO0FBQ0k7QUFDekM7QUFDTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLGtEQUFRO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJLGtEQUFRO0FBQ1osSUFBSSw4Q0FBTTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0EsT0FBTztBQUNQO0FBQ0EsTUFBTTtBQUNOLE1BQU0sa0RBQVE7QUFDZCxNQUFNO0FBQ04sTUFBTSw4Q0FBTTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBLDhDQUE4QyxnQkFBZ0I7QUFDOUQ7QUFDQTtBQUNBLGlFQUFpRTtBQUNqRTtBQUNBLE1BQU07QUFDTixNQUFNLGtEQUFRO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0NBQW9DLGtEQUFRO0FBQzVDO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FDMUlxQztBQUMvQjtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0JBQXNCLCtDQUFRO0FBQzlCO0FBQ0Esb0RBQW9ELFVBQVU7QUFDOUQ7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBLE9BQU87QUFDUCxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwrQkFBK0IsMkNBQTJDO0FBQzFFO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsR0FBRztBQUNIO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7O0FDbkxNO0FBQ1A7QUFDQSxNQUFNLG9DQUFvQztBQUMxQyxNQUFNLGdDQUFnQztBQUN0QyxNQUFNLHNDQUFzQztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDBCQUEwQixhQUFhO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHNFQUFzRSxnQkFBZ0I7QUFDdEYsNENBQTRDLGNBQWM7QUFDMUQ7QUFDQSw4REFBOEQsTUFBTTtBQUNwRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxlQUFlO0FBQ2Y7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEdBQUc7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUM1SU07QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsS0FBSztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQ3RDTTtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztBQ2pCb0M7QUFDSTtBQUN6QztBQUNPO0FBQ1A7QUFDQTtBQUNBLElBQUksOENBQU07QUFDVjtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsNEJBQTRCO0FBQy9DLE9BQU87QUFDUDtBQUNBLHdEQUF3RDtBQUN4RDtBQUNBO0FBQ0Esc0RBQXNELGdCQUFnQjtBQUN0RTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTSxrREFBUTtBQUNkO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNLDhDQUFNO0FBQ1o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1gsQ0FBQzs7Ozs7OztVQzlDRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7QUNOeUM7QUFDQTtBQUNJO0FBQzdDO0FBQ0E7QUFDQTtBQUNBLElBQUksa0RBQUk7QUFDUjtBQUNBO0FBQ0EscURBQXFELGtEQUFJO0FBQ3pEO0FBQ0E7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvYXV0aC5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9jYWxlbmRhci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9jYXRlZ29yeS5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9kb21VdGlscy5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9sb2FkZXIuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvdXNlci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vc3RhdGljL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTG9hZGVyIH0gZnJvbSBcIi4vbG9hZGVyLmpzXCI7XHJcbmltcG9ydCB7IERvbVV0aWxzIH0gZnJvbSBcIi4vZG9tVXRpbHMuanNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBBdXRoID0gKCgpID0+IHtcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9sb2dpblwiKSB7XHJcbiAgICAgIGluaXQoKTtcclxuICAgICAgY2hlY2tSZWRpcmVjdFJlYXNvbigpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXV0aEZvcm1cIik7XHJcbiAgICBpZiAoIWZvcm0pIHJldHVybiBjb25zb2xlLmVycm9yKFwiQXV0aCBmb3JtIG5vdCBmb3VuZCFcIik7XHJcblxyXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGhhbmRsZVN1Ym1pdCk7XHJcbiAgICBzd2l0Y2hNb2RlKFwibG9naW5cIik7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtbW9kZV1cIikuZm9yRWFjaCgodGFiKSA9PlxyXG4gICAgICB0YWIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICBzd2l0Y2hNb2RlKHRhYi5kYXRhc2V0Lm1vZGUpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHN3aXRjaE1vZGUobW9kZSkge1xyXG4gICAgY29uc3QgbmFtZUZpZWxkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmllbGRcIik7XHJcbiAgICBjb25zdCBzdWJtaXRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYXV0aEZvcm0gYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKTtcclxuICAgIGNvbnN0IHBhc3N3b3JkSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhc3N3b3JkXCIpO1xyXG4gICAgY29uc3QgdGFicyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGFiXCIpO1xyXG5cclxuICAgIGlmIChuYW1lRmllbGQpIHtcclxuICAgICAgbmFtZUZpZWxkLnN0eWxlLmRpc3BsYXkgPSBtb2RlID09PSBcInJlZ2lzdGVyXCIgPyBcImJsb2NrXCIgOiBcIm5vbmVcIjtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lXCIpLnJlcXVpcmVkID0gbW9kZSA9PT0gXCJyZWdpc3RlclwiO1xyXG4gICAgfVxyXG4gICAgdGFicy5mb3JFYWNoKCh0YWIpID0+XHJcbiAgICAgIHRhYi5jbGFzc0xpc3QudG9nZ2xlKFwiYWN0aXZlXCIsIHRhYi5kYXRhc2V0Lm1vZGUgPT09IG1vZGUpXHJcbiAgICApO1xyXG4gICAgaWYgKHN1Ym1pdEJ0bilcclxuICAgICAgc3VibWl0QnRuLnRleHRDb250ZW50ID0gbW9kZSA9PT0gXCJsb2dpblwiID8gXCJMb2dpblwiIDogXCJSZWdpc3RlclwiO1xyXG4gICAgaWYgKHBhc3N3b3JkSW5wdXQpXHJcbiAgICAgIHBhc3N3b3JkSW5wdXQuYXV0b2NvbXBsZXRlID1cclxuICAgICAgICBtb2RlID09PSBcImxvZ2luXCIgPyBcImN1cnJlbnQtcGFzc3dvcmRcIiA6IFwibmV3LXBhc3N3b3JkXCI7XHJcblxyXG4gICAgRG9tVXRpbHMuY2xlYXJNZXNzYWdlcygpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3VibWl0KGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIERvbVV0aWxzLmNsZWFyTWVzc2FnZXMoKTtcclxuICAgIExvYWRlci50b2dnbGUodHJ1ZSk7XHJcblxyXG4gICAgY29uc3QgaXNMb2dpbiA9IGRvY3VtZW50XHJcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1tb2RlPVwibG9naW5cIl0nKVxyXG4gICAgICAuY2xhc3NMaXN0LmNvbnRhaW5zKFwiYWN0aXZlXCIpO1xyXG4gICAgY29uc3QgdXJsID0gaXNMb2dpbiA/IFwiL2FwaS9sb2dpblwiIDogXCIvYXBpL3JlZ2lzdGVyXCI7XHJcbiAgICBjb25zdCBmb3JtRGF0YSA9IHtcclxuICAgICAgZW1haWw6IGdldFZhbChcImVtYWlsXCIpLFxyXG4gICAgICBwYXNzd29yZDogZ2V0VmFsKFwicGFzc3dvcmRcIiksXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICghaXNMb2dpbikgZm9ybURhdGEubmFtZSA9IGdldFZhbChcIm5hbWVcIik7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgdmFsaWRhdGUoZm9ybURhdGEsIGlzTG9naW4pO1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZm9ybURhdGEpLFxyXG4gICAgICB9KTtcclxuICAgICAgYXdhaXQgaGFuZGxlUmVzcG9uc2UocmVzcG9uc2UsIGlzTG9naW4pO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIERvbVV0aWxzLnNob3dFcnJvcihlcnIubWVzc2FnZSB8fCBcIlVuZXhwZWN0ZWQgZXJyb3IgZHVyaW5nIHN1Ym1pc3Npb24uXCIpO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgTG9hZGVyLnRvZ2dsZShmYWxzZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRWYWwoaWQpIHtcclxuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xyXG4gICAgcmV0dXJuIGVsID8gZWwudmFsdWUudHJpbSgpIDogXCJcIjtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHZhbGlkYXRlKGRhdGEsIGlzTG9naW4pIHtcclxuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xyXG4gICAgY29uc3QgZW1haWxSZWdleCA9IC9eW15cXHNAXStAW15cXHNAXStcXC5bXlxcc0BdKyQvO1xyXG5cclxuICAgIGlmICghZGF0YS5lbWFpbCkgZXJyb3JzLnB1c2goXCJFbWFpbCBpcyByZXF1aXJlZC5cIik7XHJcbiAgICBlbHNlIGlmICghZW1haWxSZWdleC50ZXN0KGRhdGEuZW1haWwpKSBlcnJvcnMucHVzaChcIkludmFsaWQgZW1haWwgZm9ybWF0LlwiKTtcclxuICAgIGlmICghZGF0YS5wYXNzd29yZCkgZXJyb3JzLnB1c2goXCJQYXNzd29yZCBpcyByZXF1aXJlZC5cIik7XHJcbiAgICBlbHNlIGlmIChkYXRhLnBhc3N3b3JkLmxlbmd0aCA8IDggJiYgIWlzTG9naW4pXHJcbiAgICAgIGVycm9ycy5wdXNoKFwiUGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA4IGNoYXJhY3RlcnMuXCIpO1xyXG4gICAgaWYgKCFpc0xvZ2luICYmICghZGF0YS5uYW1lIHx8IGRhdGEubmFtZS5sZW5ndGggPCAyKSlcclxuICAgICAgZXJyb3JzLnB1c2goXCJOYW1lIG11c3QgYmUgYXQgbGVhc3QgMiBjaGFyYWN0ZXJzLlwiKTtcclxuXHJcbiAgICBpZiAoZXJyb3JzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKGVycm9ycy5qb2luKFwiXFxuXCIpKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlc3BvbnNlLCBpc0xvZ2luKSB7XHJcbiAgICBjb25zdCBpc0pzb24gPSByZXNwb25zZS5oZWFkZXJzXHJcbiAgICAgIC5nZXQoXCJjb250ZW50LXR5cGVcIilcclxuICAgICAgPy5pbmNsdWRlcyhcImFwcGxpY2F0aW9uL2pzb25cIik7XHJcbiAgICBjb25zdCBkYXRhID0gaXNKc29uXHJcbiAgICAgID8gYXdhaXQgcmVzcG9uc2UuanNvbigpXHJcbiAgICAgIDogeyBtZXNzYWdlOiBhd2FpdCByZXNwb25zZS50ZXh0KCkgfTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlLm9rKVxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5lcnJvciB8fCBgRXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xyXG5cclxuICAgIGlmIChpc0xvZ2luKSB7XHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidXNlclwiLCBKU09OLnN0cmluZ2lmeShkYXRhLnVzZXIgfHwge30pKTtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9hcHBcIjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIERvbVV0aWxzLnNob3dTdWNjZXNzKFxyXG4gICAgICAgIGRhdGEubWVzc2FnZSB8fCBcIlJlZ2lzdHJhdGlvbiBzdWNjZXNzZnVsLiBQbGVhc2UgbG9naW4uXCJcclxuICAgICAgKTtcclxuICAgICAgc3dpdGNoTW9kZShcImxvZ2luXCIpO1xyXG4gICAgICBbXCJlbWFpbFwiLCBcInBhc3N3b3JkXCIsIFwibmFtZVwiXS5mb3JFYWNoKChpZCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xyXG4gICAgICAgIGlmIChlbCkgZWwudmFsdWUgPSBcIlwiO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNoZWNrUmVkaXJlY3RSZWFzb24oKSB7XHJcbiAgICBjb25zdCByZWFzb24gPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGxvY2F0aW9uLnNlYXJjaCkuZ2V0KFwicmVhc29uXCIpO1xyXG4gICAgY29uc3QgbWVzc2FnZXMgPSB7XHJcbiAgICAgIHVuYXV0aGVudGljYXRlZDogXCJQbGVhc2UgbG9nIGluIHRvIGFjY2VzcyB0aGUgYXBwbGljYXRpb24uXCIsXHJcbiAgICAgIGludmFsaWRfdG9rZW46IFwiU2Vzc2lvbiBleHBpcmVkLiBQbGVhc2UgbG9nIGluIGFnYWluLlwiLFxyXG4gICAgICBiYWRfdG9rZW5fY2xhaW1zOiBcIlNlc3Npb24gZGF0YSBpc3N1ZS4gUGxlYXNlIGxvZyBpbiBhZ2Fpbi5cIixcclxuICAgIH07XHJcbiAgICBpZiAocmVhc29uICYmIG1lc3NhZ2VzW3JlYXNvbl0pIERvbVV0aWxzLnNob3dFcnJvcihtZXNzYWdlc1tyZWFzb25dKTtcclxuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsIFwiXCIsIGxvY2F0aW9uLnBhdGhuYW1lKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB7IGluaXQgfTtcclxufSkoKTtcclxuIiwiaW1wb3J0IHsgQ2F0ZWdvcnkgfSBmcm9tIFwiLi9jYXRlZ29yeVwiO1xyXG5leHBvcnQgY29uc3QgVG9kbyA9ICgoKSA9PiB7XHJcbiAgbGV0IGN1cnJlbnRFZGl0aW5nVGFzayA9IG51bGw7XHJcbiAgbGV0IGlzRWRpdGluZyA9IGZhbHNlO1xyXG5cclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbiAoKSB7XHJcbiAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YXNrLWZvcm1cIik7XHJcbiAgICBjb25zdCBmb3JtSGVhZGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZm9ybS1oZWFkaW5nXCIpO1xyXG4gICAgY29uc3Qgc3VibWl0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdWJtaXQtYnV0dG9uXCIpO1xyXG4gICAgY29uc3QgZGVsZXRlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZWxldGUtYnV0dG9uXCIpO1xyXG4gICAgY29uc3QgY2FuY2VsQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW5jZWwtYnV0dG9uXCIpO1xyXG4gICAgY29uc3QgYWRkVGFza0J1dHRvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXHJcbiAgICAgIFwiLmNvbnRlbnQtaGVhZGVyLWNvbnRhaW5lciA+IGJ1dHRvblwiXHJcbiAgICApO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgdGFza3MgZnJvbSBsb2NhbFN0b3JhZ2VcclxuICAgIGxldCB0YXNrcyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJjYWxlbmRhclRhc2tzXCIpKSB8fCBbXTtcclxuXHJcbiAgICAvLyBDYWxlbmRhciBpbml0aWFsaXphdGlvblxyXG4gICAgY29uc3QgY2FsZW5kYXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FsZW5kYXJcIik7XHJcbiAgICBjb25zdCBjYWxlbmRhciA9IG5ldyBGdWxsQ2FsZW5kYXIuQ2FsZW5kYXIoY2FsZW5kYXJFbCwge1xyXG4gICAgICBpbml0aWFsVmlldzogXCJkYXlHcmlkTW9udGhcIixcclxuICAgICAgaGVhZGVyVG9vbGJhcjoge1xyXG4gICAgICAgIGxlZnQ6IFwicHJldixuZXh0IHRvZGF5XCIsXHJcbiAgICAgICAgY2VudGVyOiBcInRpdGxlXCIsXHJcbiAgICAgICAgcmlnaHQ6IFwiZGF5R3JpZE1vbnRoLHRpbWVHcmlkV2Vlayx0aW1lR3JpZERheVwiLFxyXG4gICAgICB9LFxyXG4gICAgICBlZGl0YWJsZTogdHJ1ZSxcclxuICAgICAgc2VsZWN0YWJsZTogdHJ1ZSxcclxuICAgICAgc2VsZWN0TWlycm9yOiB0cnVlLFxyXG4gICAgICBkYXlNYXhFdmVudHM6IHRydWUsXHJcbiAgICAgIGV2ZW50czogdGFza3MsXHJcbiAgICAgIGV2ZW50Q2xpY2s6IGZ1bmN0aW9uIChpbmZvKSB7XHJcbiAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gaW5mby5ldmVudDtcclxuICAgICAgICBpc0VkaXRpbmcgPSB0cnVlO1xyXG4gICAgICAgIHBvcHVsYXRlRm9ybShpbmZvLmV2ZW50KTtcclxuICAgICAgICB1cGRhdGVGb3JtVUkoKTtcclxuICAgICAgfSxcclxuICAgICAgZXZlbnREaWRNb3VudDogZnVuY3Rpb24gKGluZm8pIHtcclxuICAgICAgICBjb25zdCBpc0NvbXBsZXRlZCA9IGluZm8uZXZlbnQuZXh0ZW5kZWRQcm9wcy5jb21wbGV0ZWQ7XHJcbiAgICAgICAgaWYgKGlzQ29tcGxldGVkKSB7XHJcbiAgICAgICAgICBpbmZvLmVsLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiI2QzZDNkM1wiO1xyXG4gICAgICAgICAgaW5mby5lbC5zdHlsZS50ZXh0RGVjb3JhdGlvbiA9IFwibGluZS10aHJvdWdoXCI7XHJcbiAgICAgICAgICBpbmZvLmVsLnN0eWxlLm9wYWNpdHkgPSBcIjAuN1wiO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgLy8gQXBwbHkgY2F0YWdvcnkgY29sb3IgKGhhbmRsZWQgYnkgQ2F0ZWdvcnkgbW9kdWxlKVxyXG4gICAgICAgIGNvbnN0IGNhdGFnb3J5ID0gaW5mby5ldmVudC5leHRlbmRlZFByb3BzLmNhdGFnb3J5O1xyXG4gICAgICAgIGlmIChjYXRhZ29yeSAmJiBjYXRhZ29yeSAhPT0gXCJOb25lXCIpIHtcclxuICAgICAgICAgIGNvbnN0IGNhdCA9IENhdGVnb3J5LmdldENhdGFnb3JpZXMoKS5maW5kKChjKSA9PiBjLm5hbWUgPT09IGNhdGFnb3J5KTtcclxuICAgICAgICAgIGlmIChjYXQpIHtcclxuICAgICAgICAgICAgaW5mby5lbC5zdHlsZS5ib3JkZXJMZWZ0ID0gYDRweCBzb2xpZCAke2NhdC5jb2xvcn1gO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpbmZvLmVsLnN0eWxlLmJvcmRlckxlZnQgPSBcIjRweCBzb2xpZCB0cmFuc3BhcmVudFwiO1xyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0pO1xyXG5cclxuICAgIGNhbGVuZGFyLnJlbmRlcigpO1xyXG5cclxuICAgIC8vIEV2ZW50IExpc3RlbmVyc1xyXG4gICAgYWRkVGFza0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICBpc0VkaXRpbmcgPSBmYWxzZTtcclxuICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcclxuICAgICAgZm9ybS5yZXNldCgpO1xyXG4gICAgICB1cGRhdGVGb3JtVUkoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgIGNvbnN0IGZvcm1EYXRhID0gZ2V0Rm9ybURhdGEoKTtcclxuXHJcbiAgICAgIGlmIChpc0VkaXRpbmcpIHtcclxuICAgICAgICB1cGRhdGVUYXNrKGZvcm1EYXRhKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBjcmVhdGVUYXNrKGZvcm1EYXRhKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZm9ybS5yZXNldCgpO1xyXG4gICAgICB1cGRhdGVGb3JtVUkoKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGRlbGV0ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICBpZiAoY3VycmVudEVkaXRpbmdUYXNrKSB7XHJcbiAgICAgICAgdGFza3MgPSB0YXNrcy5maWx0ZXIoKHQpID0+IHQuaWQgIT09IGN1cnJlbnRFZGl0aW5nVGFzay5pZCk7XHJcbiAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrLnJlbW92ZSgpO1xyXG4gICAgICAgIHNhdmVUYXNrcygpO1xyXG4gICAgICAgIGZvcm0ucmVzZXQoKTtcclxuICAgICAgICBpc0VkaXRpbmcgPSBmYWxzZTtcclxuICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xyXG4gICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuXHJcbiAgICBjYW5jZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgZm9ybS5yZXNldCgpO1xyXG4gICAgICBpc0VkaXRpbmcgPSBmYWxzZTtcclxuICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcclxuICAgICAgdXBkYXRlRm9ybVVJKCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICAvLyBIZWxwZXIgZnVuY3Rpb25zXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVGb3JtVUkoKSB7XHJcbiAgICAgIGlmIChpc0VkaXRpbmcpIHtcclxuICAgICAgICBmb3JtSGVhZGluZy50ZXh0Q29udGVudCA9IFwiRWRpdCBUYXNrXCI7XHJcbiAgICAgICAgc3VibWl0QnV0dG9uLnRleHRDb250ZW50ID0gXCJTYXZlIENoYW5nZXNcIjtcclxuICAgICAgICBkZWxldGVCdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICBjYW5jZWxCdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcclxuICAgICAgICBhZGRUYXNrQnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBmb3JtSGVhZGluZy50ZXh0Q29udGVudCA9IFwiQWRkIE5ldyBUYXNrXCI7XHJcbiAgICAgICAgc3VibWl0QnV0dG9uLnRleHRDb250ZW50ID0gXCJBZGQgVGFza1wiO1xyXG4gICAgICAgIGRlbGV0ZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGNhbmNlbEJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xyXG4gICAgICAgIGFkZFRhc2tCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHBvcHVsYXRlRm9ybShldmVudCkge1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpdGxlXCIpLnZhbHVlID0gZXZlbnQudGl0bGU7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFza0RhdGVcIikudmFsdWUgPSBldmVudC5zdGFydFN0ci5zdWJzdHJpbmcoXHJcbiAgICAgICAgMCxcclxuICAgICAgICAxMFxyXG4gICAgICApO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlc2NyaXB0aW9uXCIpLnZhbHVlID1cclxuICAgICAgICBldmVudC5leHRlbmRlZFByb3BzLmRlc2NyaXB0aW9uIHx8IFwiXCI7XHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlcIikudmFsdWUgPVxyXG4gICAgICAgIGV2ZW50LmV4dGVuZGVkUHJvcHMucHJpb3JpdHkgfHwgXCJsb3dcIjtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRhZ29yeVwiKS52YWx1ZSA9XHJcbiAgICAgICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5jYXRhZ29yeSB8fCBcIk5vbmVcIjtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb21wbGV0ZWRcIikuY2hlY2tlZCA9XHJcbiAgICAgICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5jb21wbGV0ZWQgfHwgZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gZ2V0Rm9ybURhdGEoKSB7XHJcbiAgICAgIGNvbnN0IGNhdGFnb3J5VmFsdWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGFnb3J5XCIpLnZhbHVlO1xyXG4gICAgICByZXR1cm4ge1xyXG4gICAgICAgIGlkOiBpc0VkaXRpbmcgPyBjdXJyZW50RWRpdGluZ1Rhc2suaWQgOiBEYXRlLm5vdygpLnRvU3RyaW5nKCksXHJcbiAgICAgICAgdGl0bGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGl0bGVcIikudmFsdWUsXHJcbiAgICAgICAgc3RhcnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFza0RhdGVcIikudmFsdWUsXHJcbiAgICAgICAgZW5kOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhc2tEYXRlXCIpLnZhbHVlLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlc2NyaXB0aW9uXCIpLnZhbHVlLFxyXG4gICAgICAgIHByaW9yaXR5OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5XCIpLnZhbHVlLFxyXG4gICAgICAgIGNhdGFnb3J5OiBjYXRhZ29yeVZhbHVlID09PSBcIk5vbmVcIiA/IG51bGwgOiBjYXRhZ29yeVZhbHVlLFxyXG4gICAgICAgIGNvbXBsZXRlZDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb21wbGV0ZWRcIikuY2hlY2tlZCxcclxuICAgICAgICBjbGFzc05hbWU6IGBwcmlvcml0eS0ke2RvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlcIikudmFsdWV9ICR7XHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbXBsZXRlZFwiKS5jaGVja2VkID8gXCJjb21wbGV0ZWQtdGFza1wiIDogXCJcIlxyXG4gICAgICAgIH1gLFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNyZWF0ZVRhc2soZGF0YSkge1xyXG4gICAgICB0YXNrcy5wdXNoKGRhdGEpO1xyXG4gICAgICBjYWxlbmRhci5hZGRFdmVudChkYXRhKTtcclxuICAgICAgc2F2ZVRhc2tzKCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdXBkYXRlVGFzayhkYXRhKSB7XHJcbiAgICAgIGNvbnN0IGluZGV4ID0gdGFza3MuZmluZEluZGV4KCh0KSA9PiB0LmlkID09PSBkYXRhLmlkKTtcclxuICAgICAgaWYgKGluZGV4ID4gLTEpIHtcclxuICAgICAgICB0YXNrc1tpbmRleF0gPSBkYXRhO1xyXG4gICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzay5yZW1vdmUoKTtcclxuICAgICAgICBjYWxlbmRhci5hZGRFdmVudChkYXRhKTtcclxuICAgICAgICBzYXZlVGFza3MoKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNhdmVUYXNrcygpIHtcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJjYWxlbmRhclRhc2tzXCIsIEpTT04uc3RyaW5naWZ5KHRhc2tzKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gSW5pdGlhbCBVSSB1cGRhdGVcclxuICAgIHVwZGF0ZUZvcm1VSSgpO1xyXG4gIH0pO1xyXG5cclxuICByZXR1cm4ge1xyXG4gICAgLy8gRXhwb3NlIG1ldGhvZHMgaWYgbmVlZGVkIGJ5IENhdGVnb3J5IG1vZHVsZVxyXG4gIH07XHJcbn0pKCk7XHJcbiIsImV4cG9ydCBjb25zdCBDYXRlZ29yeSA9ICgoKSA9PiB7XHJcbiAgbGV0IGNhdGFnb3JpZXMgPSBbXHJcbiAgICB7IG5hbWU6IFwiUGVyc29uYWxcIiwgY29sb3I6IFwiI2Y1NjU2NVwiIH0sXHJcbiAgICB7IG5hbWU6IFwiV29ya1wiLCBjb2xvcjogXCIjNjNiM2VkXCIgfSxcclxuICAgIHsgbmFtZTogXCJDYXRhZ29yeSAxXCIsIGNvbG9yOiBcIiNmNmUwNWVcIiB9LFxyXG4gIF07XHJcblxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgIGNvbnN0IGNhdGFnb3J5U2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRhZ29yeVwiKTtcclxuICAgIGNvbnN0IGNhdGFnb3JpZXNDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGFnb3JpZXMtY29udGFpbmVyXCIpO1xyXG4gICAgY29uc3QgYWRkTmV3Q2F0YWdvcnlCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZC1uZXctY2F0YWdvcnktYnRuXCIpO1xyXG4gICAgY29uc3QgbmV3Q2F0YWdvcnlGb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctY2F0YWdvcnktZm9ybVwiKTtcclxuICAgIGNvbnN0IGNyZWF0ZUNhdGFnb3J5QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjcmVhdGUtY2F0YWdvcnktYnRuXCIpO1xyXG5cclxuICAgIC8vIEluaXRpYWxpemUgY2F0YWdvcmllcyBmcm9tIGxvY2FsU3RvcmFnZSBvciBkZWZhdWx0XHJcbiAgICBjb25zdCBzYXZlZENhdGFnb3JpZXMgPSBKU09OLnBhcnNlKFxyXG4gICAgICBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcImNhbGVuZGFyQ2F0YWdvcmllc1wiKVxyXG4gICAgKTtcclxuICAgIGlmIChzYXZlZENhdGFnb3JpZXMgJiYgc2F2ZWRDYXRhZ29yaWVzLmxlbmd0aCA+IDApIHtcclxuICAgICAgY2F0YWdvcmllcyA9IHNhdmVkQ2F0YWdvcmllcztcclxuICAgIH1cclxuXHJcbiAgICAvLyBSZW5kZXIgY2F0YWdvcmllcyBhbmQgdXBkYXRlIHNlbGVjdFxyXG4gICAgcmVuZGVyQ2F0YWdvcmllcygpO1xyXG4gICAgdXBkYXRlQ2F0YWdvcnlTZWxlY3QoKTtcclxuXHJcbiAgICAvLyBDYXRhZ29yeSBtYW5hZ2VtZW50XHJcbiAgICBhZGROZXdDYXRhZ29yeUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICBuZXdDYXRhZ29yeUZvcm0uc3R5bGUuZGlzcGxheSA9XHJcbiAgICAgICAgbmV3Q2F0YWdvcnlGb3JtLnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiID8gXCJmbGV4XCIgOiBcIm5vbmVcIjtcclxuICAgIH0pO1xyXG5cclxuICAgIGNyZWF0ZUNhdGFnb3J5QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XHJcbiAgICAgIGNvbnN0IG5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRhZ29yeS1uYW1lXCIpLnZhbHVlLnRyaW0oKTtcclxuICAgICAgY29uc3QgY29sb3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRhZ29yeS1jb2xvclwiKS52YWx1ZTtcclxuXHJcbiAgICAgIGlmIChuYW1lKSB7XHJcbiAgICAgICAgLy8gQWRkIG5ldyBjYXRhZ29yeVxyXG4gICAgICAgIGNhdGFnb3JpZXMucHVzaCh7IG5hbWUsIGNvbG9yIH0pO1xyXG4gICAgICAgIHNhdmVDYXRhZ29yaWVzKCk7XHJcbiAgICAgICAgcmVuZGVyQ2F0YWdvcmllcygpO1xyXG4gICAgICAgIHVwZGF0ZUNhdGFnb3J5U2VsZWN0KCk7XHJcblxyXG4gICAgICAgIC8vIFJlc2V0IGZvcm1cclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRhZ29yeS1uYW1lXCIpLnZhbHVlID0gXCJcIjtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRhZ29yeS1jb2xvclwiKS52YWx1ZSA9IFwiI2NjY2NjY1wiO1xyXG4gICAgICAgIG5ld0NhdGFnb3J5Rm9ybS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEhlbHBlciBmdW5jdGlvbnNcclxuICAgIGZ1bmN0aW9uIHJlbmRlckNhdGFnb3JpZXMoKSB7XHJcbiAgICAgIGNhdGFnb3JpZXNDb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcclxuXHJcbiAgICAgIGNhdGFnb3JpZXMuZm9yRWFjaCgoY2F0YWdvcnksIGluZGV4KSA9PiB7XHJcbiAgICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XHJcbiAgICAgICAgbGkuY2xhc3NOYW1lID0gXCJjYXRhZ29yeS1pdGVtXCI7XHJcbiAgICAgICAgbGkuaW5uZXJIVE1MID0gYFxyXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2F0YWdvcnktY29udGVudFwiPlxyXG4gICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY2F0YWdvcnktY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6ICR7Y2F0YWdvcnkuY29sb3J9O1wiPjwvc3Bhbj4gXHJcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjYXRhZ29yeS1uYW1lXCI+JHtjYXRhZ29yeS5uYW1lfTwvc3Bhbj5cclxuICAgICAgICAgICAgPC9kaXY+XHJcbiAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJkZWxldGUtY2F0YWdvcnktYnRuXCIgZGF0YS1pbmRleD1cIiR7aW5kZXh9XCI+XHJcbiAgICAgICAgICAgICAgPGkgY2xhc3M9XCJmYXMgZmEtdHJhc2hcIj48L2k+XHJcbiAgICAgICAgICAgIDwvYnV0dG9uPlxyXG4gICAgICAgICAgYDtcclxuICAgICAgICBjYXRhZ29yaWVzQ29udGFpbmVyLmFwcGVuZENoaWxkKGxpKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIHRvIGRlbGV0ZSBidXR0b25zXHJcbiAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZGVsZXRlLWNhdGFnb3J5LWJ0blwiKS5mb3JFYWNoKChidG4pID0+IHtcclxuICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XHJcbiAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgY29uc3QgaW5kZXggPSBwYXJzZUludChidG4uZGF0YXNldC5pbmRleCk7XHJcbiAgICAgICAgICBkZWxldGVDYXRhZ29yeShpbmRleCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgLy8gQWRkIHRoZSBcIkFkZCBOZXcgQ2F0YWdvcnlcIiBidXR0b24gYW5kIGZvcm0gYmFja1xyXG4gICAgICBjYXRhZ29yaWVzQ29udGFpbmVyLmFwcGVuZENoaWxkKGFkZE5ld0NhdGFnb3J5QnRuKTtcclxuICAgICAgY2F0YWdvcmllc0NvbnRhaW5lci5hcHBlbmRDaGlsZChuZXdDYXRhZ29yeUZvcm0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGRlbGV0ZUNhdGFnb3J5KGluZGV4KSB7XHJcbiAgICAgIGlmIChpbmRleCA+PSAwICYmIGluZGV4IDwgY2F0YWdvcmllcy5sZW5ndGgpIHtcclxuICAgICAgICAvLyBSZW1vdmUgdGhlIGNhdGFnb3J5XHJcbiAgICAgICAgY29uc3QgZGVsZXRlZENhdGFnb3J5TmFtZSA9IGNhdGFnb3JpZXNbaW5kZXhdLm5hbWU7XHJcbiAgICAgICAgY2F0YWdvcmllcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIHNhdmVDYXRhZ29yaWVzKCk7XHJcblxyXG4gICAgICAgIC8vIFVwZGF0ZSB0YXNrcyB0aGF0IHdlcmUgdXNpbmcgdGhpcyBjYXRhZ29yeVxyXG4gICAgICAgIGxldCB0YXNrcyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJjYWxlbmRhclRhc2tzXCIpKSB8fCBbXTtcclxuICAgICAgICB0YXNrcyA9IHRhc2tzLm1hcCgodGFzaykgPT4ge1xyXG4gICAgICAgICAgaWYgKHRhc2suZXh0ZW5kZWRQcm9wcz8uY2F0YWdvcnkgPT09IGRlbGV0ZWRDYXRhZ29yeU5hbWUpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAuLi50YXNrLFxyXG4gICAgICAgICAgICAgIGV4dGVuZGVkUHJvcHM6IHtcclxuICAgICAgICAgICAgICAgIC4uLnRhc2suZXh0ZW5kZWRQcm9wcyxcclxuICAgICAgICAgICAgICAgIGNhdGFnb3J5OiBudWxsLFxyXG4gICAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gdGFzaztcclxuICAgICAgICB9KTtcclxuICAgICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImNhbGVuZGFyVGFza3NcIiwgSlNPTi5zdHJpbmdpZnkodGFza3MpKTtcclxuXHJcbiAgICAgICAgLy8gUmUtcmVuZGVyIHRoZSBjYWxlbmRhciAoTm90ZTogQ2FsZW5kYXIgaXMgaW4gVG9kbyBtb2R1bGUsIHNvIHdlIHJlbHkgb24gVUkgdXBkYXRlKVxyXG4gICAgICAgIHJlbmRlckNhdGFnb3JpZXMoKTtcclxuICAgICAgICB1cGRhdGVDYXRhZ29yeVNlbGVjdCgpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdXBkYXRlQ2F0YWdvcnlTZWxlY3QoKSB7XHJcbiAgICAgIGNhdGFnb3J5U2VsZWN0LmlubmVySFRNTCA9IFwiXCI7XHJcblxyXG4gICAgICAvLyBBZGQgXCJOb25lXCIgb3B0aW9uIGZpcnN0XHJcbiAgICAgIGNvbnN0IG5vbmVPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xyXG4gICAgICBub25lT3B0aW9uLnZhbHVlID0gXCJOb25lXCI7XHJcbiAgICAgIG5vbmVPcHRpb24udGV4dENvbnRlbnQgPSBcIk5vbmVcIjtcclxuICAgICAgY2F0YWdvcnlTZWxlY3QuYXBwZW5kQ2hpbGQobm9uZU9wdGlvbik7XHJcblxyXG4gICAgICAvLyBBZGQgYWxsIGNhdGFnb3J5IG9wdGlvbnNcclxuICAgICAgY2F0YWdvcmllcy5mb3JFYWNoKChjYXRhZ29yeSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XHJcbiAgICAgICAgb3B0aW9uLnZhbHVlID0gY2F0YWdvcnkubmFtZTtcclxuICAgICAgICBvcHRpb24udGV4dENvbnRlbnQgPSBjYXRhZ29yeS5uYW1lO1xyXG4gICAgICAgIGNhdGFnb3J5U2VsZWN0LmFwcGVuZENoaWxkKG9wdGlvbik7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHNhdmVDYXRhZ29yaWVzKCkge1xyXG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcImNhbGVuZGFyQ2F0YWdvcmllc1wiLCBKU09OLnN0cmluZ2lmeShjYXRhZ29yaWVzKSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBnZXRDYXRhZ29yaWVzOiAoKSA9PiBjYXRhZ29yaWVzLFxyXG4gICAgcmVuZGVyQ2F0YWdvcmllczogKCkgPT4gcmVuZGVyQ2F0YWdvcmllcygpLFxyXG4gICAgdXBkYXRlQ2F0YWdvcnlTZWxlY3Q6ICgpID0+IHVwZGF0ZUNhdGFnb3J5U2VsZWN0KCksXHJcbiAgfTtcclxufSkoKTtcclxuIiwiZXhwb3J0IGNvbnN0IERvbVV0aWxzID0gKCgpID0+IHtcclxuICBmdW5jdGlvbiBjbGVhck1lc3NhZ2VzKCkge1xyXG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZXNzYWdlQ29udGFpbmVyXCIpO1xyXG4gICAgaWYgKGNvbnRhaW5lcikgY29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XHJcbiAgICBkb2N1bWVudFxyXG4gICAgICAucXVlcnlTZWxlY3RvckFsbChcIi5lcnJvci1tZXNzYWdlLCAuc3VjY2Vzcy1tZXNzYWdlXCIpXHJcbiAgICAgIC5mb3JFYWNoKChlbCkgPT4ge1xyXG4gICAgICAgIGlmIChlbC5wYXJlbnROb2RlICE9PSBjb250YWluZXIpIGVsLnJlbW92ZSgpO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHNob3dNZXNzYWdlKG1lc3NhZ2UsIHR5cGUgPSBcImVycm9yXCIpIHtcclxuICAgIGNsZWFyTWVzc2FnZXMoKTtcclxuICAgIGNvbnN0IG1lc3NhZ2VFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcclxuICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTmFtZSA9XHJcbiAgICAgIHR5cGUgPT09IFwiZXJyb3JcIiA/IFwiZXJyb3ItbWVzc2FnZVwiIDogXCJzdWNjZXNzLW1lc3NhZ2VcIjtcclxuICAgIG1lc3NhZ2Uuc3BsaXQoXCJcXG5cIikuZm9yRWFjaCgobGluZSkgPT4ge1xyXG4gICAgICBjb25zdCBwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XHJcbiAgICAgIHAudGV4dENvbnRlbnQgPSBsaW5lO1xyXG4gICAgICBtZXNzYWdlRWxlbWVudC5hcHBlbmRDaGlsZChwKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVzc2FnZUNvbnRhaW5lclwiKTtcclxuICAgIGlmIChjb250YWluZXIpIHtcclxuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG1lc3NhZ2VFbGVtZW50KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1dGhGb3JtXCIpO1xyXG4gICAgICBmb3JtXHJcbiAgICAgICAgPyBmb3JtLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG1lc3NhZ2VFbGVtZW50LCBmb3JtKVxyXG4gICAgICAgIDogZG9jdW1lbnQuYm9keS5wcmVwZW5kKG1lc3NhZ2VFbGVtZW50KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBjbGVhck1lc3NhZ2VzLFxyXG4gICAgc2hvd0Vycm9yOiAobXNnKSA9PiBzaG93TWVzc2FnZShtc2csIFwiZXJyb3JcIiksXHJcbiAgICBzaG93U3VjY2VzczogKG1zZykgPT4gc2hvd01lc3NhZ2UobXNnLCBcInN1Y2Nlc3NcIiksXHJcbiAgfTtcclxufSkoKTtcclxuIiwiZXhwb3J0IGNvbnN0IExvYWRlciA9ICgoKSA9PiB7XHJcbiAgZnVuY3Rpb24gdG9nZ2xlKHNob3cpIHtcclxuICAgIGxldCBsb2FkZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxvYWRlclwiKTtcclxuICAgIGlmICghbG9hZGVyICYmIHNob3cpIGxvYWRlciA9IGNyZWF0ZSgpO1xyXG4gICAgaWYgKGxvYWRlcikgbG9hZGVyLnN0eWxlLmRpc3BsYXkgPSBzaG93ID8gXCJmbGV4XCIgOiBcIm5vbmVcIjtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNyZWF0ZSgpIHtcclxuICAgIGNvbnN0IGxvYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBsb2FkZXIuaWQgPSBcImxvYWRlclwiO1xyXG4gICAgbG9hZGVyLmNsYXNzTmFtZSA9IFwibG9hZGVyXCI7XHJcbiAgICBsb2FkZXIuaW5uZXJIVE1MID0gJzxkaXYgY2xhc3M9XCJzcGlubmVyXCI+PC9kaXY+JztcclxuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobG9hZGVyKTtcclxuICAgIHJldHVybiBsb2FkZXI7XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyB0b2dnbGUgfTtcclxufSkoKTtcclxuIiwiaW1wb3J0IHsgTG9hZGVyIH0gZnJvbSBcIi4vbG9hZGVyLmpzXCI7XHJcbmltcG9ydCB7IERvbVV0aWxzIH0gZnJvbSBcIi4vZG9tVXRpbHMuanNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBVc2VyID0gKCgpID0+IHtcclxuICBhc3luYyBmdW5jdGlvbiBsb2dvdXQoKSB7XHJcbiAgICBjb25zb2xlLmxvZyhcIkF0dGVtcHRpbmcgbG9nb3V0Li4uXCIpO1xyXG4gICAgTG9hZGVyLnRvZ2dsZSh0cnVlKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXCIvYXBpL2xvZ291dFwiLCB7XHJcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICBoZWFkZXJzOiB7IEFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpO1xyXG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKVxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgIGRhdGEuZXJyb3IgfHwgYExvZ291dCBmYWlsZWQgd2l0aCBzdGF0dXM6ICR7cmVzcG9uc2Uuc3RhdHVzfWBcclxuICAgICAgICApO1xyXG4gICAgICBjb25zb2xlLmxvZyhcIkxvZ291dCBzdWNjZXNzZnVsIHZpYSBBUEkuXCIpO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkxvZ291dCBBUEkgY2FsbCBmYWlsZWQ6XCIsIGVycm9yKTtcclxuICAgICAgRG9tVXRpbHMuc2hvd0Vycm9yKFxyXG4gICAgICAgIFwiQ291bGQgbm90IHByb3Blcmx5IGxvZyBvdXQuIENsZWFyIGNvb2tpZXMgbWFudWFsbHkgaWYgbmVlZGVkLlwiXHJcbiAgICAgICk7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInVzZXJcIik7XHJcbiAgICAgIExvYWRlci50b2dnbGUoZmFsc2UpO1xyXG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2xvZ2luXCI7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBkaXNwbGF5VXNlckRhdGEoKSB7XHJcbiAgICBjb25zdCB1c2VyRGF0YVN0cmluZyA9IGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidXNlclwiKTtcclxuICAgIGlmICghdXNlckRhdGFTdHJpbmcpIHJldHVybiBsb2dvdXQoKTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGNvbnN0IHVzZXJEYXRhID0gSlNPTi5wYXJzZSh1c2VyRGF0YVN0cmluZyk7XHJcbiAgICAgIGNvbnN0IHVzZXJOYW1lID0gdXNlckRhdGEubmFtZSB8fCBcIlVzZXJcIjtcclxuICAgICAgY29uc3QgdXNlck5hbWVEaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyLW5hbWUtZGlzcGxheVwiKTtcclxuICAgICAgaWYgKHVzZXJOYW1lRGlzcGxheSkgdXNlck5hbWVEaXNwbGF5LnRleHRDb250ZW50ID0gdXNlck5hbWU7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJJbnZhbGlkIHVzZXIgZGF0YSBpbiBsb2NhbFN0b3JhZ2UuXCIpO1xyXG4gICAgICBsb2dvdXQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7IGxvZ291dCwgZGlzcGxheVVzZXJEYXRhIH07XHJcbn0pKCk7XHJcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0obW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSAob2JqLCBwcm9wKSA9PiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwgcHJvcCkpIiwiLy8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5yID0gKGV4cG9ydHMpID0+IHtcblx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG5cdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG5cdH1cblx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbn07IiwiaW1wb3J0IHsgVXNlciB9IGZyb20gXCIuL21vZHVsZXMvdXNlci5qc1wiO1xyXG5pbXBvcnQgeyBBdXRoIH0gZnJvbSBcIi4vbW9kdWxlcy9hdXRoLmpzXCI7XHJcbmltcG9ydCB7IFRvZG8gfSBmcm9tIFwiLi9tb2R1bGVzL2NhbGVuZGFyLmpzXCI7XHJcblxyXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvYXBwXCIpIHtcclxuICAgIFVzZXIuZGlzcGxheVVzZXJEYXRhKCk7XHJcbiAgfVxyXG4gIGNvbnN0IGxvZ291dEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLWxvZ291dFwiKTtcclxuICBpZiAobG9nb3V0QnRuKSBsb2dvdXRCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIFVzZXIubG9nb3V0KTtcclxuXHJcbiAgY29uc29sZS5sb2coXCJNYWluIGFwcCBpbml0aWFsaXplZC5cIik7XHJcbn0pO1xyXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=