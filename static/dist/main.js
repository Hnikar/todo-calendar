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
// api.service.js



const ApiService = (() => {
  const API_BASE = "/api";
  const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
  };

  async function handleRequest(url, method, data) {
    try {
      _loader_js__WEBPACK_IMPORTED_MODULE_0__.Loader.toggle(true);
      const response = await fetch(`${API_BASE}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: data ? JSON.stringify(data) : undefined,
      });

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


const Todo = (() => {
  let calendar;
  let tasks = [];

  async function initializeCalendar() {
    try {
      // const data = await ApiService.fetchTasks();
      // tasks = data.tasks || [];

      // ВЫШЕ РАСКОМЕНТИТЬ КОГА БУДЕШЬ ДОКРУЧИВАТЬ СЕРВЕР. Я ДОБАВИЛ ЧИСТО ЧТОБЫ ОНО ОШИБКУ НЕ ВЫБИВАЛО БЕЗ СЕРВЕРА ПОКА ЧТО

      tasks = [];
      const calendarEl = document.getElementById("calendar");
      calendar = new FullCalendar.Calendar(calendarEl, {
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
        eventClick: handleEventClick,
        eventChange: handleEventUpdate,
        eventRemove: handleEventDelete,
      });

      calendar.render();
    } catch (error) {
      console.error("Failed to initialize calendar:", error);
    }
  }

  async function handleFormSubmit(e) {
    e.preventDefault();

    const newTask = {
      title: document.getElementById("title").value,
      taskDate: document.getElementById("taskDate").value,
      description: document.getElementById("description").value,
      priority: document.getElementById("priority").value,
    };

    try {
      const createdTask = await _api_service_js__WEBPACK_IMPORTED_MODULE_0__.ApiService.createTask(newTask);

      calendar.addEvent({
        id: createdTask.id,
        title: createdTask.title,
        start: createdTask.taskDate,
        end: createdTask.taskDate,
        description: createdTask.description,
        priority: createdTask.priority,
        className: `priority-${createdTask.priority}`,
      });

      e.target.reset();
    } catch (error) {
      console.error("Task creation failed:", error);
    }
  }

  async function handleEventUpdate(info) {
    try {
      await _api_service_js__WEBPACK_IMPORTED_MODULE_0__.ApiService.updateTask(info.event.id, {
        title: info.event.title,
        taskDate: info.event.start,
        description: info.event.extendedProps.description,
        priority: info.event.extendedProps.priority,
      });
    } catch (error) {
      info.revert();
      console.error("Update failed:", error);
    }
  }

  async function handleEventDelete(info) {
    try {
      await _api_service_js__WEBPACK_IMPORTED_MODULE_0__.ApiService.deleteTask(info.event.id);
    } catch (error) {
      calendar.addEvent(info.event);
      console.error("Deletion failed:", error);
    }
  }

  function handleEventClick(info) {
    let details = `Task: ${info.event.title}\n`;
    details += `Description: ${
      info.event.extendedProps.description || "No description"
    }\n`;
    details += `Priority: ${info.event.extendedProps.priority}\n`;
    alert(details);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initializeCalendar();
    document
      .getElementById("task-form")
      .addEventListener("submit", handleFormSubmit);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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RUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7OztBQ055QztBQUNBO0FBQ0k7QUFDN0M7QUFDQTtBQUNBO0FBQ0EsSUFBSSxrREFBSTtBQUNSO0FBQ0E7QUFDQSxxREFBcUQsa0RBQUk7QUFDekQ7QUFDQTtBQUNBLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9hcGktc2VydmljZS5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9hdXRoLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2NhbGVuZGFyLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2RvbVV0aWxzLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2xvYWRlci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy91c2VyLmpzIiwid2VicGFjazovL3N0YXRpYy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3N0YXRpYy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3N0YXRpYy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBhcGkuc2VydmljZS5qc1xyXG5pbXBvcnQgeyBMb2FkZXIgfSBmcm9tIFwiLi9sb2FkZXIuanNcIjtcclxuaW1wb3J0IHsgRG9tVXRpbHMgfSBmcm9tIFwiLi9kb21VdGlscy5qc1wiO1xyXG5cclxuZXhwb3J0IGNvbnN0IEFwaVNlcnZpY2UgPSAoKCkgPT4ge1xyXG4gIGNvbnN0IEFQSV9CQVNFID0gXCIvYXBpXCI7XHJcbiAgY29uc3QgZ2V0QXV0aEhlYWRlciA9ICgpID0+IHtcclxuICAgIGNvbnN0IHVzZXIgPSBKU09OLnBhcnNlKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwidXNlclwiKSk7XHJcbiAgICByZXR1cm4gdXNlcj8udG9rZW4gPyB7IEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHt1c2VyLnRva2VufWAgfSA6IHt9O1xyXG4gIH07XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlcXVlc3QodXJsLCBtZXRob2QsIGRhdGEpIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIExvYWRlci50b2dnbGUodHJ1ZSk7XHJcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7QVBJX0JBU0V9JHt1cmx9YCwge1xyXG4gICAgICAgIG1ldGhvZCxcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcclxuICAgICAgICAgIC4uLmdldEF1dGhIZWFkZXIoKSxcclxuICAgICAgICB9LFxyXG4gICAgICAgIGJvZHk6IGRhdGEgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IHVuZGVmaW5lZCxcclxuICAgICAgfSk7XHJcblxyXG4gICAgICBjb25zdCByZXNwb25zZURhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XHJcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IocmVzcG9uc2VEYXRhLmVycm9yIHx8IFwiUmVxdWVzdCBmYWlsZWRcIik7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIERvbVV0aWxzLnNob3dFcnJvcihlcnJvci5tZXNzYWdlKTtcclxuICAgICAgdGhyb3cgZXJyb3I7XHJcbiAgICB9IGZpbmFsbHkge1xyXG4gICAgICBMb2FkZXIudG9nZ2xlKGZhbHNlKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHJldHVybiB7XHJcbiAgICBjcmVhdGVUYXNrOiAodGFzaykgPT4gaGFuZGxlUmVxdWVzdChcIi90YXNrc1wiLCBcIlBPU1RcIiwgdGFzayksXHJcbiAgICB1cGRhdGVUYXNrOiAoaWQsIHRhc2spID0+IGhhbmRsZVJlcXVlc3QoYC90YXNrcy8ke2lkfWAsIFwiUFVUXCIsIHRhc2spLFxyXG4gICAgZGVsZXRlVGFzazogKGlkKSA9PiBoYW5kbGVSZXF1ZXN0KGAvdGFza3MvJHtpZH1gLCBcIkRFTEVURVwiKSxcclxuICAgIGZldGNoVGFza3M6ICgpID0+IGhhbmRsZVJlcXVlc3QoXCIvdGFza3NcIiwgXCJHRVRcIiksXHJcbiAgfTtcclxufSkoKTtcclxuIiwiaW1wb3J0IHsgTG9hZGVyIH0gZnJvbSBcIi4vbG9hZGVyLmpzXCI7XHJcbmltcG9ydCB7IERvbVV0aWxzIH0gZnJvbSBcIi4vZG9tVXRpbHMuanNcIjtcclxuXHJcbmV4cG9ydCBjb25zdCBBdXRoID0gKCgpID0+IHtcclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9sb2dpblwiKSB7XHJcbiAgICAgIGluaXQoKTtcclxuICAgICAgY2hlY2tSZWRpcmVjdFJlYXNvbigpO1xyXG4gICAgfVxyXG4gIH0pO1xyXG5cclxuICBmdW5jdGlvbiBpbml0KCkge1xyXG4gICAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXV0aEZvcm1cIik7XHJcbiAgICBpZiAoIWZvcm0pIHJldHVybiBjb25zb2xlLmVycm9yKFwiQXV0aCBmb3JtIG5vdCBmb3VuZCFcIik7XHJcblxyXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGhhbmRsZVN1Ym1pdCk7XHJcbiAgICBzd2l0Y2hNb2RlKFwibG9naW5cIik7XHJcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtbW9kZV1cIikuZm9yRWFjaCgodGFiKSA9PlxyXG4gICAgICB0YWIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcclxuICAgICAgICBzd2l0Y2hNb2RlKHRhYi5kYXRhc2V0Lm1vZGUpO1xyXG4gICAgICB9KVxyXG4gICAgKTtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHN3aXRjaE1vZGUobW9kZSkge1xyXG4gICAgY29uc3QgbmFtZUZpZWxkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmllbGRcIik7XHJcbiAgICBjb25zdCBzdWJtaXRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYXV0aEZvcm0gYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKTtcclxuICAgIGNvbnN0IHBhc3N3b3JkSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhc3N3b3JkXCIpO1xyXG4gICAgY29uc3QgdGFicyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGFiXCIpO1xyXG5cclxuICAgIGlmIChuYW1lRmllbGQpIHtcclxuICAgICAgbmFtZUZpZWxkLnN0eWxlLmRpc3BsYXkgPSBtb2RlID09PSBcInJlZ2lzdGVyXCIgPyBcImJsb2NrXCIgOiBcIm5vbmVcIjtcclxuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lXCIpLnJlcXVpcmVkID0gbW9kZSA9PT0gXCJyZWdpc3RlclwiO1xyXG4gICAgfVxyXG4gICAgdGFicy5mb3JFYWNoKCh0YWIpID0+XHJcbiAgICAgIHRhYi5jbGFzc0xpc3QudG9nZ2xlKFwiYWN0aXZlXCIsIHRhYi5kYXRhc2V0Lm1vZGUgPT09IG1vZGUpXHJcbiAgICApO1xyXG4gICAgaWYgKHN1Ym1pdEJ0bilcclxuICAgICAgc3VibWl0QnRuLnRleHRDb250ZW50ID0gbW9kZSA9PT0gXCJsb2dpblwiID8gXCJMb2dpblwiIDogXCJSZWdpc3RlclwiO1xyXG4gICAgaWYgKHBhc3N3b3JkSW5wdXQpXHJcbiAgICAgIHBhc3N3b3JkSW5wdXQuYXV0b2NvbXBsZXRlID1cclxuICAgICAgICBtb2RlID09PSBcImxvZ2luXCIgPyBcImN1cnJlbnQtcGFzc3dvcmRcIiA6IFwibmV3LXBhc3N3b3JkXCI7XHJcblxyXG4gICAgRG9tVXRpbHMuY2xlYXJNZXNzYWdlcygpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3VibWl0KGUpIHtcclxuICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgIERvbVV0aWxzLmNsZWFyTWVzc2FnZXMoKTtcclxuICAgIExvYWRlci50b2dnbGUodHJ1ZSk7XHJcblxyXG4gICAgY29uc3QgaXNMb2dpbiA9IGRvY3VtZW50XHJcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1tb2RlPVwibG9naW5cIl0nKVxyXG4gICAgICAuY2xhc3NMaXN0LmNvbnRhaW5zKFwiYWN0aXZlXCIpO1xyXG4gICAgY29uc3QgdXJsID0gaXNMb2dpbiA/IFwiL2FwaS9sb2dpblwiIDogXCIvYXBpL3JlZ2lzdGVyXCI7XHJcbiAgICBjb25zdCBmb3JtRGF0YSA9IHtcclxuICAgICAgZW1haWw6IGdldFZhbChcImVtYWlsXCIpLFxyXG4gICAgICBwYXNzd29yZDogZ2V0VmFsKFwicGFzc3dvcmRcIiksXHJcbiAgICB9O1xyXG5cclxuICAgIGlmICghaXNMb2dpbikgZm9ybURhdGEubmFtZSA9IGdldFZhbChcIm5hbWVcIik7XHJcblxyXG4gICAgdHJ5IHtcclxuICAgICAgdmFsaWRhdGUoZm9ybURhdGEsIGlzTG9naW4pO1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXHJcbiAgICAgICAgICBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZm9ybURhdGEpLFxyXG4gICAgICB9KTtcclxuICAgICAgYXdhaXQgaGFuZGxlUmVzcG9uc2UocmVzcG9uc2UsIGlzTG9naW4pO1xyXG4gICAgfSBjYXRjaCAoZXJyKSB7XHJcbiAgICAgIERvbVV0aWxzLnNob3dFcnJvcihlcnIubWVzc2FnZSB8fCBcIlVuZXhwZWN0ZWQgZXJyb3IgZHVyaW5nIHN1Ym1pc3Npb24uXCIpO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgTG9hZGVyLnRvZ2dsZShmYWxzZSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBnZXRWYWwoaWQpIHtcclxuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xyXG4gICAgcmV0dXJuIGVsID8gZWwudmFsdWUudHJpbSgpIDogXCJcIjtcclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIHZhbGlkYXRlKGRhdGEsIGlzTG9naW4pIHtcclxuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xyXG4gICAgY29uc3QgZW1haWxSZWdleCA9IC9eW15cXHNAXStAW15cXHNAXStcXC5bXlxcc0BdKyQvO1xyXG5cclxuICAgIGlmICghZGF0YS5lbWFpbCkgZXJyb3JzLnB1c2goXCJFbWFpbCBpcyByZXF1aXJlZC5cIik7XHJcbiAgICBlbHNlIGlmICghZW1haWxSZWdleC50ZXN0KGRhdGEuZW1haWwpKSBlcnJvcnMucHVzaChcIkludmFsaWQgZW1haWwgZm9ybWF0LlwiKTtcclxuICAgIGlmICghZGF0YS5wYXNzd29yZCkgZXJyb3JzLnB1c2goXCJQYXNzd29yZCBpcyByZXF1aXJlZC5cIik7XHJcbiAgICBlbHNlIGlmIChkYXRhLnBhc3N3b3JkLmxlbmd0aCA8IDggJiYgIWlzTG9naW4pXHJcbiAgICAgIGVycm9ycy5wdXNoKFwiUGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA4IGNoYXJhY3RlcnMuXCIpO1xyXG4gICAgaWYgKCFpc0xvZ2luICYmICghZGF0YS5uYW1lIHx8IGRhdGEubmFtZS5sZW5ndGggPCAyKSlcclxuICAgICAgZXJyb3JzLnB1c2goXCJOYW1lIG11c3QgYmUgYXQgbGVhc3QgMiBjaGFyYWN0ZXJzLlwiKTtcclxuXHJcbiAgICBpZiAoZXJyb3JzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKGVycm9ycy5qb2luKFwiXFxuXCIpKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlc3BvbnNlLCBpc0xvZ2luKSB7XHJcbiAgICBjb25zdCBpc0pzb24gPSByZXNwb25zZS5oZWFkZXJzXHJcbiAgICAgIC5nZXQoXCJjb250ZW50LXR5cGVcIilcclxuICAgICAgPy5pbmNsdWRlcyhcImFwcGxpY2F0aW9uL2pzb25cIik7XHJcbiAgICBjb25zdCBkYXRhID0gaXNKc29uXHJcbiAgICAgID8gYXdhaXQgcmVzcG9uc2UuanNvbigpXHJcbiAgICAgIDogeyBtZXNzYWdlOiBhd2FpdCByZXNwb25zZS50ZXh0KCkgfTtcclxuXHJcbiAgICBpZiAoIXJlc3BvbnNlLm9rKVxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5lcnJvciB8fCBgRXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xyXG5cclxuICAgIGlmIChpc0xvZ2luKSB7XHJcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidXNlclwiLCBKU09OLnN0cmluZ2lmeShkYXRhLnVzZXIgfHwge30pKTtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9hcHBcIjtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIERvbVV0aWxzLnNob3dTdWNjZXNzKFxyXG4gICAgICAgIGRhdGEubWVzc2FnZSB8fCBcIlJlZ2lzdHJhdGlvbiBzdWNjZXNzZnVsLiBQbGVhc2UgbG9naW4uXCJcclxuICAgICAgKTtcclxuICAgICAgc3dpdGNoTW9kZShcImxvZ2luXCIpO1xyXG4gICAgICBbXCJlbWFpbFwiLCBcInBhc3N3b3JkXCIsIFwibmFtZVwiXS5mb3JFYWNoKChpZCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xyXG4gICAgICAgIGlmIChlbCkgZWwudmFsdWUgPSBcIlwiO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGZ1bmN0aW9uIGNoZWNrUmVkaXJlY3RSZWFzb24oKSB7XHJcbiAgICBjb25zdCByZWFzb24gPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGxvY2F0aW9uLnNlYXJjaCkuZ2V0KFwicmVhc29uXCIpO1xyXG4gICAgY29uc3QgbWVzc2FnZXMgPSB7XHJcbiAgICAgIHVuYXV0aGVudGljYXRlZDogXCJQbGVhc2UgbG9nIGluIHRvIGFjY2VzcyB0aGUgYXBwbGljYXRpb24uXCIsXHJcbiAgICAgIGludmFsaWRfdG9rZW46IFwiU2Vzc2lvbiBleHBpcmVkLiBQbGVhc2UgbG9nIGluIGFnYWluLlwiLFxyXG4gICAgICBiYWRfdG9rZW5fY2xhaW1zOiBcIlNlc3Npb24gZGF0YSBpc3N1ZS4gUGxlYXNlIGxvZyBpbiBhZ2Fpbi5cIixcclxuICAgIH07XHJcbiAgICBpZiAocmVhc29uICYmIG1lc3NhZ2VzW3JlYXNvbl0pIERvbVV0aWxzLnNob3dFcnJvcihtZXNzYWdlc1tyZWFzb25dKTtcclxuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsIFwiXCIsIGxvY2F0aW9uLnBhdGhuYW1lKTtcclxuICB9XHJcblxyXG4gIHJldHVybiB7IGluaXQgfTtcclxufSkoKTtcclxuIiwiaW1wb3J0IHsgQXBpU2VydmljZSB9IGZyb20gXCIuL2FwaS1zZXJ2aWNlLmpzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgVG9kbyA9ICgoKSA9PiB7XHJcbiAgbGV0IGNhbGVuZGFyO1xyXG4gIGxldCB0YXNrcyA9IFtdO1xyXG5cclxuICBhc3luYyBmdW5jdGlvbiBpbml0aWFsaXplQ2FsZW5kYXIoKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICAvLyBjb25zdCBkYXRhID0gYXdhaXQgQXBpU2VydmljZS5mZXRjaFRhc2tzKCk7XHJcbiAgICAgIC8vIHRhc2tzID0gZGF0YS50YXNrcyB8fCBbXTtcclxuXHJcbiAgICAgIC8vINCS0KvQqNCVINCg0JDQodCa0J7QnNCV0J3QotCY0KLQrCDQmtCe0JPQkCDQkdCj0JTQldCo0Kwg0JTQntCa0KDQo9Cn0JjQktCQ0KLQrCDQodCV0KDQktCV0KAuINCvINCU0J7QkdCQ0JLQmNCbINCn0JjQodCi0J4g0KfQotCe0JHQqyDQntCd0J4g0J7QqNCY0JHQmtCjINCd0JUg0JLQq9CR0JjQktCQ0JvQniDQkdCV0Jcg0KHQldCg0JLQldCg0JAg0J/QntCa0JAg0KfQotCeXHJcblxyXG4gICAgICB0YXNrcyA9IFtdO1xyXG4gICAgICBjb25zdCBjYWxlbmRhckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYWxlbmRhclwiKTtcclxuICAgICAgY2FsZW5kYXIgPSBuZXcgRnVsbENhbGVuZGFyLkNhbGVuZGFyKGNhbGVuZGFyRWwsIHtcclxuICAgICAgICBpbml0aWFsVmlldzogXCJkYXlHcmlkTW9udGhcIixcclxuICAgICAgICBoZWFkZXJUb29sYmFyOiB7XHJcbiAgICAgICAgICBsZWZ0OiBcInByZXYsbmV4dCB0b2RheVwiLFxyXG4gICAgICAgICAgY2VudGVyOiBcInRpdGxlXCIsXHJcbiAgICAgICAgICByaWdodDogXCJkYXlHcmlkTW9udGgsdGltZUdyaWRXZWVrLHRpbWVHcmlkRGF5XCIsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcclxuICAgICAgICBzZWxlY3RhYmxlOiB0cnVlLFxyXG4gICAgICAgIHNlbGVjdE1pcnJvcjogdHJ1ZSxcclxuICAgICAgICBkYXlNYXhFdmVudHM6IHRydWUsXHJcbiAgICAgICAgZXZlbnRzOiB0YXNrcyxcclxuICAgICAgICBldmVudENsaWNrOiBoYW5kbGVFdmVudENsaWNrLFxyXG4gICAgICAgIGV2ZW50Q2hhbmdlOiBoYW5kbGVFdmVudFVwZGF0ZSxcclxuICAgICAgICBldmVudFJlbW92ZTogaGFuZGxlRXZlbnREZWxldGUsXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY2FsZW5kYXIucmVuZGVyKCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGluaXRpYWxpemUgY2FsZW5kYXI6XCIsIGVycm9yKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZUZvcm1TdWJtaXQoZSkge1xyXG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgIGNvbnN0IG5ld1Rhc2sgPSB7XHJcbiAgICAgIHRpdGxlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpdGxlXCIpLnZhbHVlLFxyXG4gICAgICB0YXNrRGF0ZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YXNrRGF0ZVwiKS52YWx1ZSxcclxuICAgICAgZGVzY3JpcHRpb246IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVzY3JpcHRpb25cIikudmFsdWUsXHJcbiAgICAgIHByaW9yaXR5OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5XCIpLnZhbHVlLFxyXG4gICAgfTtcclxuXHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCBjcmVhdGVkVGFzayA9IGF3YWl0IEFwaVNlcnZpY2UuY3JlYXRlVGFzayhuZXdUYXNrKTtcclxuXHJcbiAgICAgIGNhbGVuZGFyLmFkZEV2ZW50KHtcclxuICAgICAgICBpZDogY3JlYXRlZFRhc2suaWQsXHJcbiAgICAgICAgdGl0bGU6IGNyZWF0ZWRUYXNrLnRpdGxlLFxyXG4gICAgICAgIHN0YXJ0OiBjcmVhdGVkVGFzay50YXNrRGF0ZSxcclxuICAgICAgICBlbmQ6IGNyZWF0ZWRUYXNrLnRhc2tEYXRlLFxyXG4gICAgICAgIGRlc2NyaXB0aW9uOiBjcmVhdGVkVGFzay5kZXNjcmlwdGlvbixcclxuICAgICAgICBwcmlvcml0eTogY3JlYXRlZFRhc2sucHJpb3JpdHksXHJcbiAgICAgICAgY2xhc3NOYW1lOiBgcHJpb3JpdHktJHtjcmVhdGVkVGFzay5wcmlvcml0eX1gLFxyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIGUudGFyZ2V0LnJlc2V0KCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiVGFzayBjcmVhdGlvbiBmYWlsZWQ6XCIsIGVycm9yKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZUV2ZW50VXBkYXRlKGluZm8pIHtcclxuICAgIHRyeSB7XHJcbiAgICAgIGF3YWl0IEFwaVNlcnZpY2UudXBkYXRlVGFzayhpbmZvLmV2ZW50LmlkLCB7XHJcbiAgICAgICAgdGl0bGU6IGluZm8uZXZlbnQudGl0bGUsXHJcbiAgICAgICAgdGFza0RhdGU6IGluZm8uZXZlbnQuc3RhcnQsXHJcbiAgICAgICAgZGVzY3JpcHRpb246IGluZm8uZXZlbnQuZXh0ZW5kZWRQcm9wcy5kZXNjcmlwdGlvbixcclxuICAgICAgICBwcmlvcml0eTogaW5mby5ldmVudC5leHRlbmRlZFByb3BzLnByaW9yaXR5LFxyXG4gICAgICB9KTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGluZm8ucmV2ZXJ0KCk7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJVcGRhdGUgZmFpbGVkOlwiLCBlcnJvcik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVFdmVudERlbGV0ZShpbmZvKSB7XHJcbiAgICB0cnkge1xyXG4gICAgICBhd2FpdCBBcGlTZXJ2aWNlLmRlbGV0ZVRhc2soaW5mby5ldmVudC5pZCk7XHJcbiAgICB9IGNhdGNoIChlcnJvcikge1xyXG4gICAgICBjYWxlbmRhci5hZGRFdmVudChpbmZvLmV2ZW50KTtcclxuICAgICAgY29uc29sZS5lcnJvcihcIkRlbGV0aW9uIGZhaWxlZDpcIiwgZXJyb3IpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gaGFuZGxlRXZlbnRDbGljayhpbmZvKSB7XHJcbiAgICBsZXQgZGV0YWlscyA9IGBUYXNrOiAke2luZm8uZXZlbnQudGl0bGV9XFxuYDtcclxuICAgIGRldGFpbHMgKz0gYERlc2NyaXB0aW9uOiAke1xyXG4gICAgICBpbmZvLmV2ZW50LmV4dGVuZGVkUHJvcHMuZGVzY3JpcHRpb24gfHwgXCJObyBkZXNjcmlwdGlvblwiXHJcbiAgICB9XFxuYDtcclxuICAgIGRldGFpbHMgKz0gYFByaW9yaXR5OiAke2luZm8uZXZlbnQuZXh0ZW5kZWRQcm9wcy5wcmlvcml0eX1cXG5gO1xyXG4gICAgYWxlcnQoZGV0YWlscyk7XHJcbiAgfVxyXG5cclxuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XHJcbiAgICBpbml0aWFsaXplQ2FsZW5kYXIoKTtcclxuICAgIGRvY3VtZW50XHJcbiAgICAgIC5nZXRFbGVtZW50QnlJZChcInRhc2stZm9ybVwiKVxyXG4gICAgICAuYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBoYW5kbGVGb3JtU3VibWl0KTtcclxuICB9KTtcclxuXHJcbiAgcmV0dXJuIHsgaW5pdGlhbGl6ZUNhbGVuZGFyIH07XHJcbn0pKCk7XHJcbiIsImV4cG9ydCBjb25zdCBEb21VdGlscyA9ICgoKSA9PiB7XHJcbiAgZnVuY3Rpb24gY2xlYXJNZXNzYWdlcygpIHtcclxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVzc2FnZUNvbnRhaW5lclwiKTtcclxuICAgIGlmIChjb250YWluZXIpIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xyXG4gICAgZG9jdW1lbnRcclxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZXJyb3ItbWVzc2FnZSwgLnN1Y2Nlc3MtbWVzc2FnZVwiKVxyXG4gICAgICAuZm9yRWFjaCgoZWwpID0+IHtcclxuICAgICAgICBpZiAoZWwucGFyZW50Tm9kZSAhPT0gY29udGFpbmVyKSBlbC5yZW1vdmUoKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBzaG93TWVzc2FnZShtZXNzYWdlLCB0eXBlID0gXCJlcnJvclwiKSB7XHJcbiAgICBjbGVhck1lc3NhZ2VzKCk7XHJcbiAgICBjb25zdCBtZXNzYWdlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XHJcbiAgICBtZXNzYWdlRWxlbWVudC5jbGFzc05hbWUgPVxyXG4gICAgICB0eXBlID09PSBcImVycm9yXCIgPyBcImVycm9yLW1lc3NhZ2VcIiA6IFwic3VjY2Vzcy1tZXNzYWdlXCI7XHJcbiAgICBtZXNzYWdlLnNwbGl0KFwiXFxuXCIpLmZvckVhY2goKGxpbmUpID0+IHtcclxuICAgICAgY29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xyXG4gICAgICBwLnRleHRDb250ZW50ID0gbGluZTtcclxuICAgICAgbWVzc2FnZUVsZW1lbnQuYXBwZW5kQ2hpbGQocCk7XHJcbiAgICB9KTtcclxuXHJcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lc3NhZ2VDb250YWluZXJcIik7XHJcbiAgICBpZiAoY29udGFpbmVyKSB7XHJcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChtZXNzYWdlRWxlbWVudCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdXRoRm9ybVwiKTtcclxuICAgICAgZm9ybVxyXG4gICAgICAgID8gZm9ybS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShtZXNzYWdlRWxlbWVudCwgZm9ybSlcclxuICAgICAgICA6IGRvY3VtZW50LmJvZHkucHJlcGVuZChtZXNzYWdlRWxlbWVudCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4ge1xyXG4gICAgY2xlYXJNZXNzYWdlcyxcclxuICAgIHNob3dFcnJvcjogKG1zZykgPT4gc2hvd01lc3NhZ2UobXNnLCBcImVycm9yXCIpLFxyXG4gICAgc2hvd1N1Y2Nlc3M6IChtc2cpID0+IHNob3dNZXNzYWdlKG1zZywgXCJzdWNjZXNzXCIpLFxyXG4gIH07XHJcbn0pKCk7XHJcbiIsImV4cG9ydCBjb25zdCBMb2FkZXIgPSAoKCkgPT4ge1xyXG4gIGZ1bmN0aW9uIHRvZ2dsZShzaG93KSB7XHJcbiAgICBsZXQgbG9hZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkZXJcIik7XHJcbiAgICBpZiAoIWxvYWRlciAmJiBzaG93KSBsb2FkZXIgPSBjcmVhdGUoKTtcclxuICAgIGlmIChsb2FkZXIpIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gc2hvdyA/IFwiZmxleFwiIDogXCJub25lXCI7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBjcmVhdGUoKSB7XHJcbiAgICBjb25zdCBsb2FkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xyXG4gICAgbG9hZGVyLmlkID0gXCJsb2FkZXJcIjtcclxuICAgIGxvYWRlci5jbGFzc05hbWUgPSBcImxvYWRlclwiO1xyXG4gICAgbG9hZGVyLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwic3Bpbm5lclwiPjwvZGl2Pic7XHJcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGxvYWRlcik7XHJcbiAgICByZXR1cm4gbG9hZGVyO1xyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHsgdG9nZ2xlIH07XHJcbn0pKCk7XHJcbiIsImltcG9ydCB7IExvYWRlciB9IGZyb20gXCIuL2xvYWRlci5qc1wiO1xyXG5pbXBvcnQgeyBEb21VdGlscyB9IGZyb20gXCIuL2RvbVV0aWxzLmpzXCI7XHJcblxyXG5leHBvcnQgY29uc3QgVXNlciA9ICgoKSA9PiB7XHJcbiAgYXN5bmMgZnVuY3Rpb24gbG9nb3V0KCkge1xyXG4gICAgY29uc29sZS5sb2coXCJBdHRlbXB0aW5nIGxvZ291dC4uLlwiKTtcclxuICAgIExvYWRlci50b2dnbGUodHJ1ZSk7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFwiL2FwaS9sb2dvdXRcIiwge1xyXG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXHJcbiAgICAgICAgaGVhZGVyczogeyBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKTtcclxuICAgICAgaWYgKCFyZXNwb25zZS5vaylcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICBkYXRhLmVycm9yIHx8IGBMb2dvdXQgZmFpbGVkIHdpdGggc3RhdHVzOiAke3Jlc3BvbnNlLnN0YXR1c31gXHJcbiAgICAgICAgKTtcclxuICAgICAgY29uc29sZS5sb2coXCJMb2dvdXQgc3VjY2Vzc2Z1bCB2aWEgQVBJLlwiKTtcclxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XHJcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJMb2dvdXQgQVBJIGNhbGwgZmFpbGVkOlwiLCBlcnJvcik7XHJcbiAgICAgIERvbVV0aWxzLnNob3dFcnJvcihcclxuICAgICAgICBcIkNvdWxkIG5vdCBwcm9wZXJseSBsb2cgb3V0LiBDbGVhciBjb29raWVzIG1hbnVhbGx5IGlmIG5lZWRlZC5cIlxyXG4gICAgICApO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJ1c2VyXCIpO1xyXG4gICAgICBMb2FkZXIudG9nZ2xlKGZhbHNlKTtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9sb2dpblwiO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZGlzcGxheVVzZXJEYXRhKCkge1xyXG4gICAgY29uc3QgdXNlckRhdGFTdHJpbmcgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInVzZXJcIik7XHJcbiAgICBpZiAoIXVzZXJEYXRhU3RyaW5nKSByZXR1cm4gbG9nb3V0KCk7XHJcbiAgICB0cnkge1xyXG4gICAgICBjb25zdCB1c2VyRGF0YSA9IEpTT04ucGFyc2UodXNlckRhdGFTdHJpbmcpO1xyXG4gICAgICBjb25zdCB1c2VyTmFtZSA9IHVzZXJEYXRhLm5hbWUgfHwgXCJVc2VyXCI7XHJcbiAgICAgIGNvbnN0IHVzZXJOYW1lRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlci1uYW1lLWRpc3BsYXlcIik7XHJcbiAgICAgIGlmICh1c2VyTmFtZURpc3BsYXkpIHVzZXJOYW1lRGlzcGxheS50ZXh0Q29udGVudCA9IHVzZXJOYW1lO1xyXG4gICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICBjb25zb2xlLmVycm9yKFwiSW52YWxpZCB1c2VyIGRhdGEgaW4gbG9jYWxTdG9yYWdlLlwiKTtcclxuICAgICAgbG9nb3V0KCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXR1cm4geyBsb2dvdXQsIGRpc3BsYXlVc2VyRGF0YSB9O1xyXG59KSgpO1xyXG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi9tb2R1bGVzL3VzZXIuanNcIjtcclxuaW1wb3J0IHsgQXV0aCB9IGZyb20gXCIuL21vZHVsZXMvYXV0aC5qc1wiO1xyXG5pbXBvcnQgeyBUb2RvIH0gZnJvbSBcIi4vbW9kdWxlcy9jYWxlbmRhci5qc1wiO1xyXG5cclxuZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xyXG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09IFwiL2FwcFwiKSB7XHJcbiAgICBVc2VyLmRpc3BsYXlVc2VyRGF0YSgpO1xyXG4gIH1cclxuICBjb25zdCBsb2dvdXRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1sb2dvdXRcIik7XHJcbiAgaWYgKGxvZ291dEJ0bikgbG9nb3V0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBVc2VyLmxvZ291dCk7XHJcblxyXG4gIGNvbnNvbGUubG9nKFwiTWFpbiBhcHAgaW5pdGlhbGl6ZWQuXCIpO1xyXG59KTtcclxuIl0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9