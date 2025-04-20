/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/modules/api-service.js":
/*!************************************!*\
  !*** ./src/modules/api-service.js ***!
  \************************************/
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
    createTask: (task) => handleRequest("/tasks", "POST", task),
    updateTask: (id, task) => handleRequest(`/tasks/${id}`, "PUT", task),
    deleteTask: (id) => handleRequest(`/tasks/${id}`, "DELETE"),
    fetchTasks: () => handleRequest("/tasks", "GET"),
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
/* harmony import */ var _api_service_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./api-service.js */ "./src/modules/api-service.js");
/* harmony import */ var _domUtils_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./domUtils.js */ "./src/modules/domUtils.js");



const Todo = (() => {
  // let calendar;
  // let tasks = [];
  // let isOnline = navigator.onLine;
  // const LOCAL_TASKS_KEY = "localTasks";
  // const PENDING_ACTIONS_KEY = "pendingActions";

  // // Initialize calendar with both server and local data
  // async function initializeCalendar() {
  //   try {
  //     // Try to load server data first
  //     const serverData = await ApiService.fetchTasks();
  //     tasks = serverData?.tasks || [];
  //   } catch (error) {
  //     console.log("Server unavailable, using local data");
  //     tasks = JSON.parse(localStorage.getItem(LOCAL_TASKS_KEY)) || [];
  //   }

  //   try {
  //     const calendarEl = document.getElementById("calendar");
  //     calendar = new FullCalendar.Calendar(calendarEl, {
  //       initialView: "dayGridMonth",
  //       headerToolbar: {
  //         left: "prev,next today",
  //         center: "title",
  //         right: "dayGridMonth,timeGridWeek,timeGridDay",
  //       },
  //       editable: true,
  //       selectable: true,
  //       selectMirror: true,
  //       dayMaxEvents: true,
  //       events: tasks.map((task) => ({
  //         ...task,
  //         start: task.start || task.taskDate,
  //         end: task.end || task.taskDate,
  //         className: `priority-${task.priority}${
  //           task.local ? " local-task" : ""
  //         }`,
  //       })),
  //       eventClick: handleEventClick,
  //       eventChange: handleEventUpdate,
  //       eventRemove: handleEventDelete,
  //     });

  //     calendar.render();
  //     checkPendingActions();
  //   } catch (error) {
  //     console.error("Calendar initialization failed:", error);
  //     DomUtils.showError("Failed to initialize calendar");
  //   }
  // }

  // async function handleFormSubmit(e) {
  //   e.preventDefault();

  //   const newTask = {
  //     title: document.getElementById("title").value,
  //     taskDate: document.getElementById("taskDate").value,
  //     description: document.getElementById("description").value,
  //     priority: document.getElementById("priority").value,
  //     // Generate temporary ID for local tasks
  //     id: `local-${Date.now()}`,
  //     local: !isOnline,
  //   };

  //   try {
  //     if (isOnline) {
  //       const createdTask = await ApiService.createTask(newTask);
  //       calendar.addEvent({ ...newTask, id: createdTask.id });
  //       DomUtils.showSuccess("Task created successfully!");
  //     } else {
  //       calendar.addEvent(newTask);
  //       saveLocalTask(newTask);
  //       DomUtils.showSuccess("Task saved locally. Will sync when online.");
  //     }

  //     e.target.reset();
  //   } catch (error) {
  //     if (isOnline) {
  //       DomUtils.showError("Failed to create task. Saving locally...");
  //       calendar.addEvent({ ...newTask, local: true });
  //       saveLocalTask(newTask);
  //     } else {
  //       DomUtils.showError("Failed to save task locally");
  //     }
  //   }
  // }

  // async function handleEventUpdate(info) {
  //   try {
  //     if (isOnline) {
  //       await ApiService.updateTask(info.event.id, getTaskData(info.event));
  //       DomUtils.showSuccess("Task updated successfully!");
  //     } else {
  //       queuePendingAction("update", info.event);
  //       DomUtils.showSuccess("Update saved locally");
  //     }
  //   } catch (error) {
  //     info.revert();
  //     DomUtils.showError(
  //       isOnline
  //         ? "Failed to update task. Changes reverted."
  //         : "Failed to save update locally"
  //     );
  //   }
  // }

  // async function handleEventDelete(info) {
  //   try {
  //     if (isOnline) {
  //       await ApiService.deleteTask(info.event.id);
  //       DomUtils.showSuccess("Task deleted successfully!");
  //     } else {
  //       queuePendingAction("delete", info.event);
  //       DomUtils.showSuccess("Deletion queued for sync");
  //     }
  //   } catch (error) {
  //     calendar.addEvent(info.event);
  //     DomUtils.showError(
  //       isOnline
  //         ? "Failed to delete task. Task restored."
  //         : "Failed to queue deletion"
  //     );
  //   }
  // }

  // // Local storage management
  // function saveLocalTask(task) {
  //   const localTasks = JSON.parse(localStorage.getItem(LOCAL_TASKS_KEY)) || [];
  //   localTasks.push(task);
  //   localStorage.setItem(LOCAL_TASKS_KEY, JSON.stringify(localTasks));
  // }

  // function queuePendingAction(type, event) {
  //   const actions = JSON.parse(localStorage.getItem(PENDING_ACTIONS_KEY)) || [];
  //   actions.push({
  //     type,
  //     data: getTaskData(event),
  //     timestamp: new Date().toISOString(),
  //   });
  //   localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(actions));
  // }

  // async function checkPendingActions() {
  //   if (!isOnline) return;

  //   const actions = JSON.parse(localStorage.getItem(PENDING_ACTIONS_KEY)) || [];
  //   while (actions.length > 0) {
  //     const action = actions.shift();
  //     try {
  //       switch (action.type) {
  //         case "create":
  //           await ApiService.createTask(action.data);
  //           break;
  //         case "update":
  //           await ApiService.updateTask(action.data.id, action.data);
  //           break;
  //         case "delete":
  //           await ApiService.deleteTask(action.data.id);
  //           break;
  //       }
  //     } catch (error) {
  //       actions.unshift(action);
  //       break;
  //     }
  //   }

  //   localStorage.removeItem(LOCAL_TASKS_KEY);
  //   localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(actions));
  // }

  // function getTaskData(event) {
  //   return {
  //     id: event.id,
  //     title: event.title,
  //     start: event.start,
  //     end: event.end,
  //     description: event.extendedProps.description,
  //     priority: event.extendedProps.priority,
  //   };
  // }

  // function handleEventClick(info) {
  //   let details = `Task: ${info.event.title}\n`;
  //   details += `Description: ${
  //     info.event.extendedProps.description || "No description"
  //   }\n`;
  //   details += `Priority: ${info.event.extendedProps.priority}\n`;
  //   details += `Date: ${info.event.start.toLocaleDateString()}\n`;
  //   details += info.event.extendedProps.local ? "\n(Local - not synced)" : "";

  //   alert(details);
  // }

  // // Network status detection
  // window.addEventListener("online", () => {
  //   isOnline = true;
  //   checkPendingActions();
  //   DomUtils.showSuccess("Back online. Syncing changes...");
  // });

  // window.addEventListener("offline", () => {
  //   isOnline = false;
  //   DomUtils.showError("Offline mode. Changes will be saved locally.");
  // });

  // document.addEventListener("DOMContentLoaded", () => {
  //   initializeCalendar();
  //   document
  //     .getElementById("task-form")
  //     .addEventListener("submit", handleFormSubmit);
  // });

  document.addEventListener("DOMContentLoaded", function () {
    let tasks = JSON.parse(localStorage.getItem("calendarTasks")) || [];

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
        let details = `Task: ${info.event.title}\n`;
        details += `Description: ${
          info.event.extendedProps.description || "No description"
        }\n`;
        details += `Priority: ${info.event.extendedProps.priority}\n`;

        alert(details);
      },
    });

    calendar.render();

    document
      .getElementById("task-form")
      .addEventListener("submit", function (e) {
        e.preventDefault();

        const title = document.getElementById("title").value;
        const taskDate = document.getElementById("taskDate").value;
        const description = document.getElementById("description").value;
        const priority = document.getElementById("priority").value;

        let start, end;

        start = taskDate;
        end = taskDate;

        const newTask = {
          id: Date.now().toString(),
          title: title,
          start: start,
          end: end,
          description: description,
          priority: priority,
          className: `priority-${priority}`,
        };

        tasks.push(newTask);

        calendar.addEvent(newTask);

        // Save to localStorage
        localStorage.setItem("calendarTasks", JSON.stringify(tasks));

        this.reset();
      });
  });

  return { initializeCalendar };
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1gsQ0FBQzs7Ozs7OztVQzlDRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7QUNOeUM7QUFDQTtBQUNJO0FBQzdDO0FBQ0E7QUFDQTtBQUNBLElBQUksa0RBQUk7QUFDUjtBQUNBO0FBQ0EscURBQXFELGtEQUFJO0FBQ3pEO0FBQ0E7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvYXBpLXNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvYXV0aC5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9jYWxlbmRhci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9kb21VdGlscy5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9sb2FkZXIuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvdXNlci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vc3RhdGljL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTG9hZGVyIH0gZnJvbSBcIi4vbG9hZGVyLmpzXCI7XHJcbmltcG9ydCB7IERvbVV0aWxzIH0gZnJvbSBcIi4vZG9tVXRpbHMuanNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBBcGlTZXJ2aWNlID0gKCgpID0+IHtcclxuICBjb25zdCBBUElfQkFTRSA9IFwiL2FwaVwiO1xyXG5cclxuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVSZXF1ZXN0KHVybCwgbWV0aG9kLCBkYXRhKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBMb2FkZXIudG9nZ2xlKHRydWUpO1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke0FQSV9CQVNFfSR7dXJsfWAsIHtcclxuICAgICAgICBtZXRob2QsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBjcmVkZW50aWFsczogXCJpbmNsdWRlXCIsXHJcbiAgICAgICAgYm9keTogZGF0YSA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogdW5kZWZpbmVkLFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwMSkge1xyXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvbG9naW4/cmVhc29uPXVuYXV0aGVudGljYXRlZFwiO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xyXG5cclxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihyZXNwb25zZURhdGEuZXJyb3IgfHwgXCJSZXF1ZXN0IGZhaWxlZFwiKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gcmVzcG9uc2VEYXRhO1xyXG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAgICAgRG9tVXRpbHMuc2hvd0Vycm9yKGVycm9yLm1lc3NhZ2UpO1xyXG4gICAgICB0aHJvdyBlcnJvcjtcclxuICAgIH0gZmluYWxseSB7XHJcbiAgICAgIExvYWRlci50b2dnbGUoZmFsc2UpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHtcclxuICAgIGNyZWF0ZVRhc2s6ICh0YXNrKSA9PiBoYW5kbGVSZXF1ZXN0KFwiL3Rhc2tzXCIsIFwiUE9TVFwiLCB0YXNrKSxcclxuICAgIHVwZGF0ZVRhc2s6IChpZCwgdGFzaykgPT4gaGFuZGxlUmVxdWVzdChgL3Rhc2tzLyR7aWR9YCwgXCJQVVRcIiwgdGFzayksXHJcbiAgICBkZWxldGVUYXNrOiAoaWQpID0+IGhhbmRsZVJlcXVlc3QoYC90YXNrcy8ke2lkfWAsIFwiREVMRVRFXCIpLFxyXG4gICAgZmV0Y2hUYXNrczogKCkgPT4gaGFuZGxlUmVxdWVzdChcIi90YXNrc1wiLCBcIkdFVFwiKSxcclxuICB9O1xyXG59KSgpO1xyXG4iLCJpbXBvcnQgeyBMb2FkZXIgfSBmcm9tIFwiLi9sb2FkZXIuanNcIjtcclxuaW1wb3J0IHsgRG9tVXRpbHMgfSBmcm9tIFwiLi9kb21VdGlscy5qc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IEF1dGggPSAoKCkgPT4ge1xyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcclxuICAgIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09IFwiL2xvZ2luXCIpIHtcclxuICAgICAgaW5pdCgpO1xyXG4gICAgICBjaGVja1JlZGlyZWN0UmVhc29uKCk7XHJcbiAgICB9XHJcbiAgfSk7XHJcblxyXG4gIGZ1bmN0aW9uIGluaXQoKSB7XHJcbiAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdXRoRm9ybVwiKTtcclxuICAgIGlmICghZm9ybSkgcmV0dXJuIGNvbnNvbGUuZXJyb3IoXCJBdXRoIGZvcm0gbm90IGZvdW5kIVwiKTtcclxuXHJcbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgaGFuZGxlU3VibWl0KTtcclxuICAgIHN3aXRjaE1vZGUoXCJsb2dpblwiKTtcclxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1tb2RlXVwiKS5mb3JFYWNoKCh0YWIpID0+XHJcbiAgICAgIHRhYi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xyXG4gICAgICAgIHN3aXRjaE1vZGUodGFiLmRhdGFzZXQubW9kZSk7XHJcbiAgICAgIH0pXHJcbiAgICApO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gc3dpdGNoTW9kZShtb2RlKSB7XHJcbiAgICBjb25zdCBuYW1lRmllbGQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWVsZFwiKTtcclxuICAgIGNvbnN0IHN1Ym1pdEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNhdXRoRm9ybSBidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpO1xyXG4gICAgY29uc3QgcGFzc3dvcmRJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFzc3dvcmRcIik7XHJcbiAgICBjb25zdCB0YWJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50YWJcIik7XHJcblxyXG4gICAgaWYgKG5hbWVGaWVsZCkge1xyXG4gICAgICBuYW1lRmllbGQuc3R5bGUuZGlzcGxheSA9IG1vZGUgPT09IFwicmVnaXN0ZXJcIiA/IFwiYmxvY2tcIiA6IFwibm9uZVwiO1xyXG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVcIikucmVxdWlyZWQgPSBtb2RlID09PSBcInJlZ2lzdGVyXCI7XHJcbiAgICB9XHJcbiAgICB0YWJzLmZvckVhY2goKHRhYikgPT5cclxuICAgICAgdGFiLmNsYXNzTGlzdC50b2dnbGUoXCJhY3RpdmVcIiwgdGFiLmRhdGFzZXQubW9kZSA9PT0gbW9kZSlcclxuICAgICk7XHJcbiAgICBpZiAoc3VibWl0QnRuKVxyXG4gICAgICBzdWJtaXRCdG4udGV4dENvbnRlbnQgPSBtb2RlID09PSBcImxvZ2luXCIgPyBcIkxvZ2luXCIgOiBcIlJlZ2lzdGVyXCI7XHJcbiAgICBpZiAocGFzc3dvcmRJbnB1dClcclxuICAgICAgcGFzc3dvcmRJbnB1dC5hdXRvY29tcGxldGUgPVxyXG4gICAgICAgIG1vZGUgPT09IFwibG9naW5cIiA/IFwiY3VycmVudC1wYXNzd29yZFwiIDogXCJuZXctcGFzc3dvcmRcIjtcclxuXHJcbiAgICBEb21VdGlscy5jbGVhck1lc3NhZ2VzKCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVTdWJtaXQoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgRG9tVXRpbHMuY2xlYXJNZXNzYWdlcygpO1xyXG4gICAgTG9hZGVyLnRvZ2dsZSh0cnVlKTtcclxuXHJcbiAgICBjb25zdCBpc0xvZ2luID0gZG9jdW1lbnRcclxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLW1vZGU9XCJsb2dpblwiXScpXHJcbiAgICAgIC5jbGFzc0xpc3QuY29udGFpbnMoXCJhY3RpdmVcIik7XHJcbiAgICBjb25zdCB1cmwgPSBpc0xvZ2luID8gXCIvYXBpL2xvZ2luXCIgOiBcIi9hcGkvcmVnaXN0ZXJcIjtcclxuICAgIGNvbnN0IGZvcm1EYXRhID0ge1xyXG4gICAgICBlbWFpbDogZ2V0VmFsKFwiZW1haWxcIiksXHJcbiAgICAgIHBhc3N3b3JkOiBnZXRWYWwoXCJwYXNzd29yZFwiKSxcclxuICAgIH07XHJcblxyXG4gICAgaWYgKCFpc0xvZ2luKSBmb3JtRGF0YS5uYW1lID0gZ2V0VmFsKFwibmFtZVwiKTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICB2YWxpZGF0ZShmb3JtRGF0YSwgaXNMb2dpbik7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XHJcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgIEFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShmb3JtRGF0YSksXHJcbiAgICAgIH0pO1xyXG4gICAgICBhd2FpdCBoYW5kbGVSZXNwb25zZShyZXNwb25zZSwgaXNMb2dpbik7XHJcbiAgICB9IGNhdGNoIChlcnIpIHtcclxuICAgICAgRG9tVXRpbHMuc2hvd0Vycm9yKGVyci5tZXNzYWdlIHx8IFwiVW5leHBlY3RlZCBlcnJvciBkdXJpbmcgc3VibWlzc2lvbi5cIik7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBMb2FkZXIudG9nZ2xlKGZhbHNlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGdldFZhbChpZCkge1xyXG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XHJcbiAgICByZXR1cm4gZWwgPyBlbC52YWx1ZS50cmltKCkgOiBcIlwiO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gdmFsaWRhdGUoZGF0YSwgaXNMb2dpbikge1xyXG4gICAgY29uc3QgZXJyb3JzID0gW107XHJcbiAgICBjb25zdCBlbWFpbFJlZ2V4ID0gL15bXlxcc0BdK0BbXlxcc0BdK1xcLlteXFxzQF0rJC87XHJcblxyXG4gICAgaWYgKCFkYXRhLmVtYWlsKSBlcnJvcnMucHVzaChcIkVtYWlsIGlzIHJlcXVpcmVkLlwiKTtcclxuICAgIGVsc2UgaWYgKCFlbWFpbFJlZ2V4LnRlc3QoZGF0YS5lbWFpbCkpIGVycm9ycy5wdXNoKFwiSW52YWxpZCBlbWFpbCBmb3JtYXQuXCIpO1xyXG4gICAgaWYgKCFkYXRhLnBhc3N3b3JkKSBlcnJvcnMucHVzaChcIlBhc3N3b3JkIGlzIHJlcXVpcmVkLlwiKTtcclxuICAgIGVsc2UgaWYgKGRhdGEucGFzc3dvcmQubGVuZ3RoIDwgOCAmJiAhaXNMb2dpbilcclxuICAgICAgZXJyb3JzLnB1c2goXCJQYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycy5cIik7XHJcbiAgICBpZiAoIWlzTG9naW4gJiYgKCFkYXRhLm5hbWUgfHwgZGF0YS5uYW1lLmxlbmd0aCA8IDIpKVxyXG4gICAgICBlcnJvcnMucHVzaChcIk5hbWUgbXVzdCBiZSBhdCBsZWFzdCAyIGNoYXJhY3RlcnMuXCIpO1xyXG5cclxuICAgIGlmIChlcnJvcnMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoZXJyb3JzLmpvaW4oXCJcXG5cIikpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzcG9uc2UsIGlzTG9naW4pIHtcclxuICAgIGNvbnN0IGlzSnNvbiA9IHJlc3BvbnNlLmhlYWRlcnNcclxuICAgICAgLmdldChcImNvbnRlbnQtdHlwZVwiKVxyXG4gICAgICA/LmluY2x1ZGVzKFwiYXBwbGljYXRpb24vanNvblwiKTtcclxuICAgIGNvbnN0IGRhdGEgPSBpc0pzb25cclxuICAgICAgPyBhd2FpdCByZXNwb25zZS5qc29uKClcclxuICAgICAgOiB7IG1lc3NhZ2U6IGF3YWl0IHJlc3BvbnNlLnRleHQoKSB9O1xyXG5cclxuICAgIGlmICghcmVzcG9uc2Uub2spXHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihkYXRhLmVycm9yIHx8IGBFcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XHJcblxyXG4gICAgaWYgKGlzTG9naW4pIHtcclxuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ1c2VyXCIsIEpTT04uc3RyaW5naWZ5KGRhdGEudXNlciB8fCB7fSkpO1xyXG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2FwcFwiO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgRG9tVXRpbHMuc2hvd1N1Y2Nlc3MoXHJcbiAgICAgICAgZGF0YS5tZXNzYWdlIHx8IFwiUmVnaXN0cmF0aW9uIHN1Y2Nlc3NmdWwuIFBsZWFzZSBsb2dpbi5cIlxyXG4gICAgICApO1xyXG4gICAgICBzd2l0Y2hNb2RlKFwibG9naW5cIik7XHJcbiAgICAgIFtcImVtYWlsXCIsIFwicGFzc3dvcmRcIiwgXCJuYW1lXCJdLmZvckVhY2goKGlkKSA9PiB7XHJcbiAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XHJcbiAgICAgICAgaWYgKGVsKSBlbC52YWx1ZSA9IFwiXCI7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gY2hlY2tSZWRpcmVjdFJlYXNvbigpIHtcclxuICAgIGNvbnN0IHJlYXNvbiA9IG5ldyBVUkxTZWFyY2hQYXJhbXMobG9jYXRpb24uc2VhcmNoKS5nZXQoXCJyZWFzb25cIik7XHJcbiAgICBjb25zdCBtZXNzYWdlcyA9IHtcclxuICAgICAgdW5hdXRoZW50aWNhdGVkOiBcIlBsZWFzZSBsb2cgaW4gdG8gYWNjZXNzIHRoZSBhcHBsaWNhdGlvbi5cIixcclxuICAgICAgaW52YWxpZF90b2tlbjogXCJTZXNzaW9uIGV4cGlyZWQuIFBsZWFzZSBsb2cgaW4gYWdhaW4uXCIsXHJcbiAgICAgIGJhZF90b2tlbl9jbGFpbXM6IFwiU2Vzc2lvbiBkYXRhIGlzc3VlLiBQbGVhc2UgbG9nIGluIGFnYWluLlwiLFxyXG4gICAgfTtcclxuICAgIGlmIChyZWFzb24gJiYgbWVzc2FnZXNbcmVhc29uXSkgRG9tVXRpbHMuc2hvd0Vycm9yKG1lc3NhZ2VzW3JlYXNvbl0pO1xyXG4gICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgXCJcIiwgbG9jYXRpb24ucGF0aG5hbWUpO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgaW5pdCB9O1xyXG59KSgpO1xyXG4iLCJpbXBvcnQgeyBBcGlTZXJ2aWNlIH0gZnJvbSBcIi4vYXBpLXNlcnZpY2UuanNcIjtcclxuaW1wb3J0IHsgRG9tVXRpbHMgfSBmcm9tIFwiLi9kb21VdGlscy5qc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IFRvZG8gPSAoKCkgPT4ge1xyXG4gIC8vIGxldCBjYWxlbmRhcjtcclxuICAvLyBsZXQgdGFza3MgPSBbXTtcclxuICAvLyBsZXQgaXNPbmxpbmUgPSBuYXZpZ2F0b3Iub25MaW5lO1xyXG4gIC8vIGNvbnN0IExPQ0FMX1RBU0tTX0tFWSA9IFwibG9jYWxUYXNrc1wiO1xyXG4gIC8vIGNvbnN0IFBFTkRJTkdfQUNUSU9OU19LRVkgPSBcInBlbmRpbmdBY3Rpb25zXCI7XHJcblxyXG4gIC8vIC8vIEluaXRpYWxpemUgY2FsZW5kYXIgd2l0aCBib3RoIHNlcnZlciBhbmQgbG9jYWwgZGF0YVxyXG4gIC8vIGFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemVDYWxlbmRhcigpIHtcclxuICAvLyAgIHRyeSB7XHJcbiAgLy8gICAgIC8vIFRyeSB0byBsb2FkIHNlcnZlciBkYXRhIGZpcnN0XHJcbiAgLy8gICAgIGNvbnN0IHNlcnZlckRhdGEgPSBhd2FpdCBBcGlTZXJ2aWNlLmZldGNoVGFza3MoKTtcclxuICAvLyAgICAgdGFza3MgPSBzZXJ2ZXJEYXRhPy50YXNrcyB8fCBbXTtcclxuICAvLyAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgLy8gICAgIGNvbnNvbGUubG9nKFwiU2VydmVyIHVuYXZhaWxhYmxlLCB1c2luZyBsb2NhbCBkYXRhXCIpO1xyXG4gIC8vICAgICB0YXNrcyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oTE9DQUxfVEFTS1NfS0VZKSkgfHwgW107XHJcbiAgLy8gICB9XHJcblxyXG4gIC8vICAgdHJ5IHtcclxuICAvLyAgICAgY29uc3QgY2FsZW5kYXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FsZW5kYXJcIik7XHJcbiAgLy8gICAgIGNhbGVuZGFyID0gbmV3IEZ1bGxDYWxlbmRhci5DYWxlbmRhcihjYWxlbmRhckVsLCB7XHJcbiAgLy8gICAgICAgaW5pdGlhbFZpZXc6IFwiZGF5R3JpZE1vbnRoXCIsXHJcbiAgLy8gICAgICAgaGVhZGVyVG9vbGJhcjoge1xyXG4gIC8vICAgICAgICAgbGVmdDogXCJwcmV2LG5leHQgdG9kYXlcIixcclxuICAvLyAgICAgICAgIGNlbnRlcjogXCJ0aXRsZVwiLFxyXG4gIC8vICAgICAgICAgcmlnaHQ6IFwiZGF5R3JpZE1vbnRoLHRpbWVHcmlkV2Vlayx0aW1lR3JpZERheVwiLFxyXG4gIC8vICAgICAgIH0sXHJcbiAgLy8gICAgICAgZWRpdGFibGU6IHRydWUsXHJcbiAgLy8gICAgICAgc2VsZWN0YWJsZTogdHJ1ZSxcclxuICAvLyAgICAgICBzZWxlY3RNaXJyb3I6IHRydWUsXHJcbiAgLy8gICAgICAgZGF5TWF4RXZlbnRzOiB0cnVlLFxyXG4gIC8vICAgICAgIGV2ZW50czogdGFza3MubWFwKCh0YXNrKSA9PiAoe1xyXG4gIC8vICAgICAgICAgLi4udGFzayxcclxuICAvLyAgICAgICAgIHN0YXJ0OiB0YXNrLnN0YXJ0IHx8IHRhc2sudGFza0RhdGUsXHJcbiAgLy8gICAgICAgICBlbmQ6IHRhc2suZW5kIHx8IHRhc2sudGFza0RhdGUsXHJcbiAgLy8gICAgICAgICBjbGFzc05hbWU6IGBwcmlvcml0eS0ke3Rhc2sucHJpb3JpdHl9JHtcclxuICAvLyAgICAgICAgICAgdGFzay5sb2NhbCA/IFwiIGxvY2FsLXRhc2tcIiA6IFwiXCJcclxuICAvLyAgICAgICAgIH1gLFxyXG4gIC8vICAgICAgIH0pKSxcclxuICAvLyAgICAgICBldmVudENsaWNrOiBoYW5kbGVFdmVudENsaWNrLFxyXG4gIC8vICAgICAgIGV2ZW50Q2hhbmdlOiBoYW5kbGVFdmVudFVwZGF0ZSxcclxuICAvLyAgICAgICBldmVudFJlbW92ZTogaGFuZGxlRXZlbnREZWxldGUsXHJcbiAgLy8gICAgIH0pO1xyXG5cclxuICAvLyAgICAgY2FsZW5kYXIucmVuZGVyKCk7XHJcbiAgLy8gICAgIGNoZWNrUGVuZGluZ0FjdGlvbnMoKTtcclxuICAvLyAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgLy8gICAgIGNvbnNvbGUuZXJyb3IoXCJDYWxlbmRhciBpbml0aWFsaXphdGlvbiBmYWlsZWQ6XCIsIGVycm9yKTtcclxuICAvLyAgICAgRG9tVXRpbHMuc2hvd0Vycm9yKFwiRmFpbGVkIHRvIGluaXRpYWxpemUgY2FsZW5kYXJcIik7XHJcbiAgLy8gICB9XHJcbiAgLy8gfVxyXG5cclxuICAvLyBhc3luYyBmdW5jdGlvbiBoYW5kbGVGb3JtU3VibWl0KGUpIHtcclxuICAvLyAgIGUucHJldmVudERlZmF1bHQoKTtcclxuXHJcbiAgLy8gICBjb25zdCBuZXdUYXNrID0ge1xyXG4gIC8vICAgICB0aXRsZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXRsZVwiKS52YWx1ZSxcclxuICAvLyAgICAgdGFza0RhdGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFza0RhdGVcIikudmFsdWUsXHJcbiAgLy8gICAgIGRlc2NyaXB0aW9uOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlc2NyaXB0aW9uXCIpLnZhbHVlLFxyXG4gIC8vICAgICBwcmlvcml0eTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eVwiKS52YWx1ZSxcclxuICAvLyAgICAgLy8gR2VuZXJhdGUgdGVtcG9yYXJ5IElEIGZvciBsb2NhbCB0YXNrc1xyXG4gIC8vICAgICBpZDogYGxvY2FsLSR7RGF0ZS5ub3coKX1gLFxyXG4gIC8vICAgICBsb2NhbDogIWlzT25saW5lLFxyXG4gIC8vICAgfTtcclxuXHJcbiAgLy8gICB0cnkge1xyXG4gIC8vICAgICBpZiAoaXNPbmxpbmUpIHtcclxuICAvLyAgICAgICBjb25zdCBjcmVhdGVkVGFzayA9IGF3YWl0IEFwaVNlcnZpY2UuY3JlYXRlVGFzayhuZXdUYXNrKTtcclxuICAvLyAgICAgICBjYWxlbmRhci5hZGRFdmVudCh7IC4uLm5ld1Rhc2ssIGlkOiBjcmVhdGVkVGFzay5pZCB9KTtcclxuICAvLyAgICAgICBEb21VdGlscy5zaG93U3VjY2VzcyhcIlRhc2sgY3JlYXRlZCBzdWNjZXNzZnVsbHkhXCIpO1xyXG4gIC8vICAgICB9IGVsc2Uge1xyXG4gIC8vICAgICAgIGNhbGVuZGFyLmFkZEV2ZW50KG5ld1Rhc2spO1xyXG4gIC8vICAgICAgIHNhdmVMb2NhbFRhc2sobmV3VGFzayk7XHJcbiAgLy8gICAgICAgRG9tVXRpbHMuc2hvd1N1Y2Nlc3MoXCJUYXNrIHNhdmVkIGxvY2FsbHkuIFdpbGwgc3luYyB3aGVuIG9ubGluZS5cIik7XHJcbiAgLy8gICAgIH1cclxuXHJcbiAgLy8gICAgIGUudGFyZ2V0LnJlc2V0KCk7XHJcbiAgLy8gICB9IGNhdGNoIChlcnJvcikge1xyXG4gIC8vICAgICBpZiAoaXNPbmxpbmUpIHtcclxuICAvLyAgICAgICBEb21VdGlscy5zaG93RXJyb3IoXCJGYWlsZWQgdG8gY3JlYXRlIHRhc2suIFNhdmluZyBsb2NhbGx5Li4uXCIpO1xyXG4gIC8vICAgICAgIGNhbGVuZGFyLmFkZEV2ZW50KHsgLi4ubmV3VGFzaywgbG9jYWw6IHRydWUgfSk7XHJcbiAgLy8gICAgICAgc2F2ZUxvY2FsVGFzayhuZXdUYXNrKTtcclxuICAvLyAgICAgfSBlbHNlIHtcclxuICAvLyAgICAgICBEb21VdGlscy5zaG93RXJyb3IoXCJGYWlsZWQgdG8gc2F2ZSB0YXNrIGxvY2FsbHlcIik7XHJcbiAgLy8gICAgIH1cclxuICAvLyAgIH1cclxuICAvLyB9XHJcblxyXG4gIC8vIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZUV2ZW50VXBkYXRlKGluZm8pIHtcclxuICAvLyAgIHRyeSB7XHJcbiAgLy8gICAgIGlmIChpc09ubGluZSkge1xyXG4gIC8vICAgICAgIGF3YWl0IEFwaVNlcnZpY2UudXBkYXRlVGFzayhpbmZvLmV2ZW50LmlkLCBnZXRUYXNrRGF0YShpbmZvLmV2ZW50KSk7XHJcbiAgLy8gICAgICAgRG9tVXRpbHMuc2hvd1N1Y2Nlc3MoXCJUYXNrIHVwZGF0ZWQgc3VjY2Vzc2Z1bGx5IVwiKTtcclxuICAvLyAgICAgfSBlbHNlIHtcclxuICAvLyAgICAgICBxdWV1ZVBlbmRpbmdBY3Rpb24oXCJ1cGRhdGVcIiwgaW5mby5ldmVudCk7XHJcbiAgLy8gICAgICAgRG9tVXRpbHMuc2hvd1N1Y2Nlc3MoXCJVcGRhdGUgc2F2ZWQgbG9jYWxseVwiKTtcclxuICAvLyAgICAgfVxyXG4gIC8vICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAvLyAgICAgaW5mby5yZXZlcnQoKTtcclxuICAvLyAgICAgRG9tVXRpbHMuc2hvd0Vycm9yKFxyXG4gIC8vICAgICAgIGlzT25saW5lXHJcbiAgLy8gICAgICAgICA/IFwiRmFpbGVkIHRvIHVwZGF0ZSB0YXNrLiBDaGFuZ2VzIHJldmVydGVkLlwiXHJcbiAgLy8gICAgICAgICA6IFwiRmFpbGVkIHRvIHNhdmUgdXBkYXRlIGxvY2FsbHlcIlxyXG4gIC8vICAgICApO1xyXG4gIC8vICAgfVxyXG4gIC8vIH1cclxuXHJcbiAgLy8gYXN5bmMgZnVuY3Rpb24gaGFuZGxlRXZlbnREZWxldGUoaW5mbykge1xyXG4gIC8vICAgdHJ5IHtcclxuICAvLyAgICAgaWYgKGlzT25saW5lKSB7XHJcbiAgLy8gICAgICAgYXdhaXQgQXBpU2VydmljZS5kZWxldGVUYXNrKGluZm8uZXZlbnQuaWQpO1xyXG4gIC8vICAgICAgIERvbVV0aWxzLnNob3dTdWNjZXNzKFwiVGFzayBkZWxldGVkIHN1Y2Nlc3NmdWxseSFcIik7XHJcbiAgLy8gICAgIH0gZWxzZSB7XHJcbiAgLy8gICAgICAgcXVldWVQZW5kaW5nQWN0aW9uKFwiZGVsZXRlXCIsIGluZm8uZXZlbnQpO1xyXG4gIC8vICAgICAgIERvbVV0aWxzLnNob3dTdWNjZXNzKFwiRGVsZXRpb24gcXVldWVkIGZvciBzeW5jXCIpO1xyXG4gIC8vICAgICB9XHJcbiAgLy8gICB9IGNhdGNoIChlcnJvcikge1xyXG4gIC8vICAgICBjYWxlbmRhci5hZGRFdmVudChpbmZvLmV2ZW50KTtcclxuICAvLyAgICAgRG9tVXRpbHMuc2hvd0Vycm9yKFxyXG4gIC8vICAgICAgIGlzT25saW5lXHJcbiAgLy8gICAgICAgICA/IFwiRmFpbGVkIHRvIGRlbGV0ZSB0YXNrLiBUYXNrIHJlc3RvcmVkLlwiXHJcbiAgLy8gICAgICAgICA6IFwiRmFpbGVkIHRvIHF1ZXVlIGRlbGV0aW9uXCJcclxuICAvLyAgICAgKTtcclxuICAvLyAgIH1cclxuICAvLyB9XHJcblxyXG4gIC8vIC8vIExvY2FsIHN0b3JhZ2UgbWFuYWdlbWVudFxyXG4gIC8vIGZ1bmN0aW9uIHNhdmVMb2NhbFRhc2sodGFzaykge1xyXG4gIC8vICAgY29uc3QgbG9jYWxUYXNrcyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oTE9DQUxfVEFTS1NfS0VZKSkgfHwgW107XHJcbiAgLy8gICBsb2NhbFRhc2tzLnB1c2godGFzayk7XHJcbiAgLy8gICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShMT0NBTF9UQVNLU19LRVksIEpTT04uc3RyaW5naWZ5KGxvY2FsVGFza3MpKTtcclxuICAvLyB9XHJcblxyXG4gIC8vIGZ1bmN0aW9uIHF1ZXVlUGVuZGluZ0FjdGlvbih0eXBlLCBldmVudCkge1xyXG4gIC8vICAgY29uc3QgYWN0aW9ucyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oUEVORElOR19BQ1RJT05TX0tFWSkpIHx8IFtdO1xyXG4gIC8vICAgYWN0aW9ucy5wdXNoKHtcclxuICAvLyAgICAgdHlwZSxcclxuICAvLyAgICAgZGF0YTogZ2V0VGFza0RhdGEoZXZlbnQpLFxyXG4gIC8vICAgICB0aW1lc3RhbXA6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSxcclxuICAvLyAgIH0pO1xyXG4gIC8vICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oUEVORElOR19BQ1RJT05TX0tFWSwgSlNPTi5zdHJpbmdpZnkoYWN0aW9ucykpO1xyXG4gIC8vIH1cclxuXHJcbiAgLy8gYXN5bmMgZnVuY3Rpb24gY2hlY2tQZW5kaW5nQWN0aW9ucygpIHtcclxuICAvLyAgIGlmICghaXNPbmxpbmUpIHJldHVybjtcclxuXHJcbiAgLy8gICBjb25zdCBhY3Rpb25zID0gSlNPTi5wYXJzZShsb2NhbFN0b3JhZ2UuZ2V0SXRlbShQRU5ESU5HX0FDVElPTlNfS0VZKSkgfHwgW107XHJcbiAgLy8gICB3aGlsZSAoYWN0aW9ucy5sZW5ndGggPiAwKSB7XHJcbiAgLy8gICAgIGNvbnN0IGFjdGlvbiA9IGFjdGlvbnMuc2hpZnQoKTtcclxuICAvLyAgICAgdHJ5IHtcclxuICAvLyAgICAgICBzd2l0Y2ggKGFjdGlvbi50eXBlKSB7XHJcbiAgLy8gICAgICAgICBjYXNlIFwiY3JlYXRlXCI6XHJcbiAgLy8gICAgICAgICAgIGF3YWl0IEFwaVNlcnZpY2UuY3JlYXRlVGFzayhhY3Rpb24uZGF0YSk7XHJcbiAgLy8gICAgICAgICAgIGJyZWFrO1xyXG4gIC8vICAgICAgICAgY2FzZSBcInVwZGF0ZVwiOlxyXG4gIC8vICAgICAgICAgICBhd2FpdCBBcGlTZXJ2aWNlLnVwZGF0ZVRhc2soYWN0aW9uLmRhdGEuaWQsIGFjdGlvbi5kYXRhKTtcclxuICAvLyAgICAgICAgICAgYnJlYWs7XHJcbiAgLy8gICAgICAgICBjYXNlIFwiZGVsZXRlXCI6XHJcbiAgLy8gICAgICAgICAgIGF3YWl0IEFwaVNlcnZpY2UuZGVsZXRlVGFzayhhY3Rpb24uZGF0YS5pZCk7XHJcbiAgLy8gICAgICAgICAgIGJyZWFrO1xyXG4gIC8vICAgICAgIH1cclxuICAvLyAgICAgfSBjYXRjaCAoZXJyb3IpIHtcclxuICAvLyAgICAgICBhY3Rpb25zLnVuc2hpZnQoYWN0aW9uKTtcclxuICAvLyAgICAgICBicmVhaztcclxuICAvLyAgICAgfVxyXG4gIC8vICAgfVxyXG5cclxuICAvLyAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKExPQ0FMX1RBU0tTX0tFWSk7XHJcbiAgLy8gICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShQRU5ESU5HX0FDVElPTlNfS0VZLCBKU09OLnN0cmluZ2lmeShhY3Rpb25zKSk7XHJcbiAgLy8gfVxyXG5cclxuICAvLyBmdW5jdGlvbiBnZXRUYXNrRGF0YShldmVudCkge1xyXG4gIC8vICAgcmV0dXJuIHtcclxuICAvLyAgICAgaWQ6IGV2ZW50LmlkLFxyXG4gIC8vICAgICB0aXRsZTogZXZlbnQudGl0bGUsXHJcbiAgLy8gICAgIHN0YXJ0OiBldmVudC5zdGFydCxcclxuICAvLyAgICAgZW5kOiBldmVudC5lbmQsXHJcbiAgLy8gICAgIGRlc2NyaXB0aW9uOiBldmVudC5leHRlbmRlZFByb3BzLmRlc2NyaXB0aW9uLFxyXG4gIC8vICAgICBwcmlvcml0eTogZXZlbnQuZXh0ZW5kZWRQcm9wcy5wcmlvcml0eSxcclxuICAvLyAgIH07XHJcbiAgLy8gfVxyXG5cclxuICAvLyBmdW5jdGlvbiBoYW5kbGVFdmVudENsaWNrKGluZm8pIHtcclxuICAvLyAgIGxldCBkZXRhaWxzID0gYFRhc2s6ICR7aW5mby5ldmVudC50aXRsZX1cXG5gO1xyXG4gIC8vICAgZGV0YWlscyArPSBgRGVzY3JpcHRpb246ICR7XHJcbiAgLy8gICAgIGluZm8uZXZlbnQuZXh0ZW5kZWRQcm9wcy5kZXNjcmlwdGlvbiB8fCBcIk5vIGRlc2NyaXB0aW9uXCJcclxuICAvLyAgIH1cXG5gO1xyXG4gIC8vICAgZGV0YWlscyArPSBgUHJpb3JpdHk6ICR7aW5mby5ldmVudC5leHRlbmRlZFByb3BzLnByaW9yaXR5fVxcbmA7XHJcbiAgLy8gICBkZXRhaWxzICs9IGBEYXRlOiAke2luZm8uZXZlbnQuc3RhcnQudG9Mb2NhbGVEYXRlU3RyaW5nKCl9XFxuYDtcclxuICAvLyAgIGRldGFpbHMgKz0gaW5mby5ldmVudC5leHRlbmRlZFByb3BzLmxvY2FsID8gXCJcXG4oTG9jYWwgLSBub3Qgc3luY2VkKVwiIDogXCJcIjtcclxuXHJcbiAgLy8gICBhbGVydChkZXRhaWxzKTtcclxuICAvLyB9XHJcblxyXG4gIC8vIC8vIE5ldHdvcmsgc3RhdHVzIGRldGVjdGlvblxyXG4gIC8vIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwib25saW5lXCIsICgpID0+IHtcclxuICAvLyAgIGlzT25saW5lID0gdHJ1ZTtcclxuICAvLyAgIGNoZWNrUGVuZGluZ0FjdGlvbnMoKTtcclxuICAvLyAgIERvbVV0aWxzLnNob3dTdWNjZXNzKFwiQmFjayBvbmxpbmUuIFN5bmNpbmcgY2hhbmdlcy4uLlwiKTtcclxuICAvLyB9KTtcclxuXHJcbiAgLy8gd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJvZmZsaW5lXCIsICgpID0+IHtcclxuICAvLyAgIGlzT25saW5lID0gZmFsc2U7XHJcbiAgLy8gICBEb21VdGlscy5zaG93RXJyb3IoXCJPZmZsaW5lIG1vZGUuIENoYW5nZXMgd2lsbCBiZSBzYXZlZCBsb2NhbGx5LlwiKTtcclxuICAvLyB9KTtcclxuXHJcbiAgLy8gZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xyXG4gIC8vICAgaW5pdGlhbGl6ZUNhbGVuZGFyKCk7XHJcbiAgLy8gICBkb2N1bWVudFxyXG4gIC8vICAgICAuZ2V0RWxlbWVudEJ5SWQoXCJ0YXNrLWZvcm1cIilcclxuICAvLyAgICAgLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgaGFuZGxlRm9ybVN1Ym1pdCk7XHJcbiAgLy8gfSk7XHJcblxyXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uICgpIHtcclxuICAgIGxldCB0YXNrcyA9IEpTT04ucGFyc2UobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJjYWxlbmRhclRhc2tzXCIpKSB8fCBbXTtcclxuXHJcbiAgICBjb25zdCBjYWxlbmRhckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYWxlbmRhclwiKTtcclxuICAgIGNvbnN0IGNhbGVuZGFyID0gbmV3IEZ1bGxDYWxlbmRhci5DYWxlbmRhcihjYWxlbmRhckVsLCB7XHJcbiAgICAgIGluaXRpYWxWaWV3OiBcImRheUdyaWRNb250aFwiLFxyXG4gICAgICBoZWFkZXJUb29sYmFyOiB7XHJcbiAgICAgICAgbGVmdDogXCJwcmV2LG5leHQgdG9kYXlcIixcclxuICAgICAgICBjZW50ZXI6IFwidGl0bGVcIixcclxuICAgICAgICByaWdodDogXCJkYXlHcmlkTW9udGgsdGltZUdyaWRXZWVrLHRpbWVHcmlkRGF5XCIsXHJcbiAgICAgIH0sXHJcbiAgICAgIGVkaXRhYmxlOiB0cnVlLFxyXG4gICAgICBzZWxlY3RhYmxlOiB0cnVlLFxyXG4gICAgICBzZWxlY3RNaXJyb3I6IHRydWUsXHJcbiAgICAgIGRheU1heEV2ZW50czogdHJ1ZSxcclxuICAgICAgZXZlbnRzOiB0YXNrcyxcclxuICAgICAgZXZlbnRDbGljazogZnVuY3Rpb24gKGluZm8pIHtcclxuICAgICAgICBsZXQgZGV0YWlscyA9IGBUYXNrOiAke2luZm8uZXZlbnQudGl0bGV9XFxuYDtcclxuICAgICAgICBkZXRhaWxzICs9IGBEZXNjcmlwdGlvbjogJHtcclxuICAgICAgICAgIGluZm8uZXZlbnQuZXh0ZW5kZWRQcm9wcy5kZXNjcmlwdGlvbiB8fCBcIk5vIGRlc2NyaXB0aW9uXCJcclxuICAgICAgICB9XFxuYDtcclxuICAgICAgICBkZXRhaWxzICs9IGBQcmlvcml0eTogJHtpbmZvLmV2ZW50LmV4dGVuZGVkUHJvcHMucHJpb3JpdHl9XFxuYDtcclxuXHJcbiAgICAgICAgYWxlcnQoZGV0YWlscyk7XHJcbiAgICAgIH0sXHJcbiAgICB9KTtcclxuXHJcbiAgICBjYWxlbmRhci5yZW5kZXIoKTtcclxuXHJcbiAgICBkb2N1bWVudFxyXG4gICAgICAuZ2V0RWxlbWVudEJ5SWQoXCJ0YXNrLWZvcm1cIilcclxuICAgICAgLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIGNvbnN0IHRpdGxlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXRsZVwiKS52YWx1ZTtcclxuICAgICAgICBjb25zdCB0YXNrRGF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFza0RhdGVcIikudmFsdWU7XHJcbiAgICAgICAgY29uc3QgZGVzY3JpcHRpb24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlc2NyaXB0aW9uXCIpLnZhbHVlO1xyXG4gICAgICAgIGNvbnN0IHByaW9yaXR5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eVwiKS52YWx1ZTtcclxuXHJcbiAgICAgICAgbGV0IHN0YXJ0LCBlbmQ7XHJcblxyXG4gICAgICAgIHN0YXJ0ID0gdGFza0RhdGU7XHJcbiAgICAgICAgZW5kID0gdGFza0RhdGU7XHJcblxyXG4gICAgICAgIGNvbnN0IG5ld1Rhc2sgPSB7XHJcbiAgICAgICAgICBpZDogRGF0ZS5ub3coKS50b1N0cmluZygpLFxyXG4gICAgICAgICAgdGl0bGU6IHRpdGxlLFxyXG4gICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxyXG4gICAgICAgICAgZW5kOiBlbmQsXHJcbiAgICAgICAgICBkZXNjcmlwdGlvbjogZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICBwcmlvcml0eTogcHJpb3JpdHksXHJcbiAgICAgICAgICBjbGFzc05hbWU6IGBwcmlvcml0eS0ke3ByaW9yaXR5fWAsXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgdGFza3MucHVzaChuZXdUYXNrKTtcclxuXHJcbiAgICAgICAgY2FsZW5kYXIuYWRkRXZlbnQobmV3VGFzayk7XHJcblxyXG4gICAgICAgIC8vIFNhdmUgdG8gbG9jYWxTdG9yYWdlXHJcbiAgICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJjYWxlbmRhclRhc2tzXCIsIEpTT04uc3RyaW5naWZ5KHRhc2tzKSk7XHJcblxyXG4gICAgICAgIHRoaXMucmVzZXQoKTtcclxuICAgICAgfSk7XHJcbiAgfSk7XHJcblxyXG4gIHJldHVybiB7IGluaXRpYWxpemVDYWxlbmRhciB9O1xyXG59KSgpOyIsImV4cG9ydCBjb25zdCBEb21VdGlscyA9ICgoKSA9PiB7XHJcbiAgZnVuY3Rpb24gY2xlYXJNZXNzYWdlcygpIHtcclxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVzc2FnZUNvbnRhaW5lclwiKTtcclxuICAgIGlmIChjb250YWluZXIpIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgZG9jdW1lbnRcclxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZXJyb3ItbWVzc2FnZSwgLnN1Y2Nlc3MtbWVzc2FnZVwiKVxyXG4gICAgICAuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICBpZiAoZWwucGFyZW50Tm9kZSAhPT0gY29udGFpbmVyKSBlbC5yZW1vdmUoKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzaG93TWVzc2FnZShtZXNzYWdlLCB0eXBlID0gXCJlcnJvclwiKSB7XHJcbiAgICBjbGVhck1lc3NhZ2VzKCk7XHJcbiAgICBjb25zdCBtZXNzYWdlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBtZXNzYWdlRWxlbWVudC5jbGFzc05hbWUgPVxyXG4gICAgICB0eXBlID09PSBcImVycm9yXCIgPyBcImVycm9yLW1lc3NhZ2VcIiA6IFwic3VjY2Vzcy1tZXNzYWdlXCI7XHJcbiAgICBtZXNzYWdlLnNwbGl0KFwiXFxuXCIpLmZvckVhY2goKGxpbmUpID0+IHtcclxuICAgICAgY29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xyXG4gICAgICBwLnRleHRDb250ZW50ID0gbGluZTtcclxuICAgICAgbWVzc2FnZUVsZW1lbnQuYXBwZW5kQ2hpbGQocCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lc3NhZ2VDb250YWluZXJcIik7XHJcbiAgICBpZiAoY29udGFpbmVyKSB7XHJcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChtZXNzYWdlRWxlbWVudCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdXRoRm9ybVwiKTtcclxuICAgICAgZm9ybVxyXG4gICAgICAgID8gZm9ybS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShtZXNzYWdlRWxlbWVudCwgZm9ybSlcclxuICAgICAgICA6IGRvY3VtZW50LmJvZHkucHJlcGVuZChtZXNzYWdlRWxlbWVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgY2xlYXJNZXNzYWdlcyxcclxuICAgIHNob3dFcnJvcjogKG1zZykgPT4gc2hvd01lc3NhZ2UobXNnLCBcImVycm9yXCIpLFxyXG4gICAgc2hvd1N1Y2Nlc3M6IChtc2cpID0+IHNob3dNZXNzYWdlKG1zZywgXCJzdWNjZXNzXCIpLFxyXG4gIH07XHJcbn0pKCk7XHJcbiIsImV4cG9ydCBjb25zdCBMb2FkZXIgPSAoKCkgPT4ge1xyXG4gIGZ1bmN0aW9uIHRvZ2dsZShzaG93KSB7XHJcbiAgICBsZXQgbG9hZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkZXJcIik7XHJcbiAgICBpZiAoIWxvYWRlciAmJiBzaG93KSBsb2FkZXIgPSBjcmVhdGUoKTtcclxuICAgIGlmIChsb2FkZXIpIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gc2hvdyA/IFwiZmxleFwiIDogXCJub25lXCI7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgICBjb25zdCBsb2FkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgbG9hZGVyLmlkID0gXCJsb2FkZXJcIjtcclxuICAgIGxvYWRlci5jbGFzc05hbWUgPSBcImxvYWRlclwiO1xyXG4gICAgbG9hZGVyLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwic3Bpbm5lclwiPjwvZGl2Pic7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxvYWRlcik7XHJcbiAgICByZXR1cm4gbG9hZGVyO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgdG9nZ2xlIH07XHJcbn0pKCk7XHJcbiIsImltcG9ydCB7IExvYWRlciB9IGZyb20gXCIuL2xvYWRlci5qc1wiO1xyXG5pbXBvcnQgeyBEb21VdGlscyB9IGZyb20gXCIuL2RvbVV0aWxzLmpzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgVXNlciA9ICgoKSA9PiB7XHJcbiAgYXN5bmMgZnVuY3Rpb24gbG9nb3V0KCkge1xyXG4gICAgY29uc29sZS5sb2coXCJBdHRlbXB0aW5nIGxvZ291dC4uLlwiKTtcclxuICAgIExvYWRlci50b2dnbGUodHJ1ZSk7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFwiL2FwaS9sb2dvdXRcIiwge1xyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczogeyBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKTtcclxuICAgICAgaWYgKCFyZXNwb25zZS5vaylcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICBkYXRhLmVycm9yIHx8IGBMb2dvdXQgZmFpbGVkIHdpdGggc3RhdHVzOiAke3Jlc3BvbnNlLnN0YXR1c31gXHJcbiAgICAgICAgKTtcclxuICAgICAgY29uc29sZS5sb2coXCJMb2dvdXQgc3VjY2Vzc2Z1bCB2aWEgQVBJLlwiKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJMb2dvdXQgQVBJIGNhbGwgZmFpbGVkOlwiLCBlcnJvcik7XHJcbiAgICAgIERvbVV0aWxzLnNob3dFcnJvcihcclxuICAgICAgICBcIkNvdWxkIG5vdCBwcm9wZXJseSBsb2cgb3V0LiBDbGVhciBjb29raWVzIG1hbnVhbGx5IGlmIG5lZWRlZC5cIlxyXG4gICAgICApO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJ1c2VyXCIpO1xyXG4gICAgICBMb2FkZXIudG9nZ2xlKGZhbHNlKTtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9sb2dpblwiO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZGlzcGxheVVzZXJEYXRhKCkge1xyXG4gICAgY29uc3QgdXNlckRhdGFTdHJpbmcgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInVzZXJcIik7XHJcbiAgICBpZiAoIXVzZXJEYXRhU3RyaW5nKSByZXR1cm4gbG9nb3V0KCk7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCB1c2VyRGF0YSA9IEpTT04ucGFyc2UodXNlckRhdGFTdHJpbmcpO1xyXG4gICAgICBjb25zdCB1c2VyTmFtZSA9IHVzZXJEYXRhLm5hbWUgfHwgXCJVc2VyXCI7XHJcbiAgICAgIGNvbnN0IHVzZXJOYW1lRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlci1uYW1lLWRpc3BsYXlcIik7XHJcbiAgICAgIGlmICh1c2VyTmFtZURpc3BsYXkpIHVzZXJOYW1lRGlzcGxheS50ZXh0Q29udGVudCA9IHVzZXJOYW1lO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiSW52YWxpZCB1c2VyIGRhdGEgaW4gbG9jYWxTdG9yYWdlLlwiKTtcclxuICAgICAgbG9nb3V0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyBsb2dvdXQsIGRpc3BsYXlVc2VyRGF0YSB9O1xyXG59KSgpO1xyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi9tb2R1bGVzL3VzZXIuanNcIjtcclxuaW1wb3J0IHsgQXV0aCB9IGZyb20gXCIuL21vZHVsZXMvYXV0aC5qc1wiO1xyXG5pbXBvcnQgeyBUb2RvIH0gZnJvbSBcIi4vbW9kdWxlcy9jYWxlbmRhci5qc1wiO1xyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xyXG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09IFwiL2FwcFwiKSB7XHJcbiAgICBVc2VyLmRpc3BsYXlVc2VyRGF0YSgpO1xyXG4gIH1cclxuICBjb25zdCBsb2dvdXRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1sb2dvdXRcIik7XHJcbiAgaWYgKGxvZ291dEJ0bikgbG9nb3V0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBVc2VyLmxvZ291dCk7XHJcblxyXG4gIGNvbnNvbGUubG9nKFwiTWFpbiBhcHAgaW5pdGlhbGl6ZWQuXCIpO1xyXG59KTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9