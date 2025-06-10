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

  async function handleRequest(url, method, data, options = {}) {
    const { showLoader = true } = options;
    try {
      if (showLoader) _loader_js__WEBPACK_IMPORTED_MODULE_0__.Loader.toggle(true);
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
      if (showLoader) _loader_js__WEBPACK_IMPORTED_MODULE_0__.Loader.toggle(false);
    }
  }

  return {
    // Task-related endpoints
    createTask: (task, options) => {
      const { priority, ...rest } = task;
      return handleRequest("/events", "POST", rest, options);
    },
    updateTask: (id, task, options) => {
      const { priority, ...rest } = task;
      return handleRequest(`/events/${id}`, "PUT", rest, options);
    },
    deleteTask: (id, options) =>
      handleRequest(`/events/${id}`, "DELETE", undefined, options),
    fetchTasks: (options) =>
      handleRequest("/events", "GET", undefined, options),
    // Category-related endpoints
    createCategory: (category, options) =>
      handleRequest("/categories", "POST", category, options),
    fetchCategories: (options) =>
      handleRequest("/categories", "GET", undefined, options),
    deleteCategory: (id, options) =>
      handleRequest(`/categories/${id}`, "DELETE", undefined, options),
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
/* harmony import */ var _domUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./domUtils.js */ "./src/modules/domUtils.js");


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

    _domUtils_js__WEBPACK_IMPORTED_MODULE_0__.DomUtils.clearMessages();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    _domUtils_js__WEBPACK_IMPORTED_MODULE_0__.DomUtils.clearMessages();

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
      _domUtils_js__WEBPACK_IMPORTED_MODULE_0__.DomUtils.showError(err.message || "Unexpected error during submission.");
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
      _domUtils_js__WEBPACK_IMPORTED_MODULE_0__.DomUtils.showSuccess(
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
    if (reason && messages[reason]) _domUtils_js__WEBPACK_IMPORTED_MODULE_0__.DomUtils.showError(messages[reason]);
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
/* harmony import */ var _loader_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./loader.js */ "./src/modules/loader.js");



const Todo = (() => {
  let currentEditingTask = null;
  let isEditing = false;
  let allTasks = []; // Store all tasks for filtering

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
        // Always enable time inputs on form open
        document.getElementById("startTime").disabled = false;
        document.getElementById("endTime").disabled = false;
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

      // Hide header immediately before calendar is rendered
      function preHideHeader() {
        // Hide header and calendar container before render to avoid layout flash
        const fcHeader = document.querySelector(".fc-header-toolbar");
        if (fcHeader) fcHeader.style.display = "none";
        if (calendarEl) calendarEl.style.visibility = "hidden";
      }
      preHideHeader();

      const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        editable: true,
        selectable: false,
        selectMirror: true,
        dayMaxEvents: true,
        events: [],
        eventTimeFormat: { hour: "2-digit", minute: "2-digit", hour12: false }, // 24-hour format for event times
        slotLabelFormat: { hour: "2-digit", minute: "2-digit", hour12: false }, // 24-hour format for time axis in timeGrid views
        // Show custom message when no events
        noEventsContent: function () {
          return "No tasks to display";
        },
        // Prevent dragging all-day events in week (listWeek) and today (timeGridDay) views
        eventAllow: function (dropInfo, draggedEvent) {
          const viewType = calendar.view ? calendar.view.type : "";
          if (
            (viewType === "listWeek" || viewType === "timeGridDay") &&
            draggedEvent.allDay
          ) {
            return false;
          }
          return true;
        },
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

          // Apply category color to the whole event body
          const category = info.event.extendedProps.category;
          if (category && category !== "None") {
            const cat = _category_js__WEBPACK_IMPORTED_MODULE_0__.Category.getCategories().find(
              (c) => c.name === category
            );
            if (cat) {
              info.el.style.backgroundColor = cat.color;
              info.el.style.borderLeft = `4px solid ${cat.color}`;
              // For list views, also set color for .fc-list-event-dot if present
              const dot = info.el.querySelector(".fc-list-event-dot");
              if (dot) dot.style.backgroundColor = cat.color;
            }
          } else {
            info.el.style.borderLeft = "4px solid transparent";
          }
        },
        eventDrop: async function (info) {
          try {
            const event = info.event;
            let start = event.start;
            let end = event.end;

            // Format start and end as 'YYYY-MM-DDTHH:mm'
            function formatDateTime(dt) {
              if (!dt) return "";
              // Pad month, day, hour, minute
              const yyyy = dt.getFullYear();
              const mm = String(dt.getMonth() + 1).padStart(2, "0");
              const dd = String(dt.getDate()).padStart(2, "0");
              const hh = String(dt.getHours()).padStart(2, "0");
              const min = String(dt.getMinutes()).padStart(2, "0");
              return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
            }

            let formattedStart, formattedEnd;

            if (event.allDay) {
              // For allDay, use date only
              formattedStart = event.startStr.slice(0, 10);
              if (event.end) {
                const endDate = new Date(event.end);
                endDate.setDate(endDate.getDate() - 1);
                formattedEnd = endDate.toISOString().slice(0, 10);
              } else {
                formattedEnd = formattedStart;
              }
            } else {
              // For timed events, use 'YYYY-MM-DDTHH:mm'
              formattedStart = formatDateTime(start);
              formattedEnd = end ? formatDateTime(end) : formattedStart;
            }

            const updatedData = {
              id: event.id,
              title: event.title,
              start: formattedStart,
              end: formattedEnd,
              allDay: event.allDay,
              description: event.extendedProps.description,
              category: event.extendedProps.category,
              completed: event.extendedProps.completed,
              className: event.classNames
                .filter(
                  (c) =>
                    c !== undefined &&
                    c !== null &&
                    c.startsWith("priority-") === false
                )
                .join(" "),
            };
            const updatedTask = await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.updateTask(
              event.id,
              updatedData,
              { showLoader: false }
            );
            // Ensure allTasks has only one event per ID (replace old with new)
            allTasks = [
              ...allTasks.filter((t) => t.id !== updatedTask.id),
              updatedTask,
            ];
            // Remove and re-add the event to force update in all views
            const current = calendar.getEventById(event.id);
            if (current) current.remove();
            calendar.addEvent(updatedTask);
          } catch (error) {
            info.revert();
            console.error("Failed to update event after drag:", error);
          }
        },
        eventResize: async function (info) {
          try {
            const event = info.event;
            let start = event.start;
            let end = event.end;

            function formatDateTime(dt) {
              if (!dt) return "";
              const yyyy = dt.getFullYear();
              const mm = String(dt.getMonth() + 1).padStart(2, "0");
              const dd = String(dt.getDate()).padStart(2, "0");
              const hh = String(dt.getHours()).padStart(2, "0");
              const min = String(dt.getMinutes()).padStart(2, "0");
              return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
            }

            let formattedStart, formattedEnd;
            if (event.allDay) {
              formattedStart = event.startStr.slice(0, 10);
              if (event.end) {
                const endDate = new Date(event.end);
                endDate.setDate(endDate.getDate() - 1);
                formattedEnd = endDate.toISOString().slice(0, 10);
              } else {
                formattedEnd = formattedStart;
              }
            } else {
              formattedStart = formatDateTime(start);
              formattedEnd = end ? formatDateTime(end) : formattedStart;
            }

            const updatedData = {
              id: event.id,
              title: event.title,
              start: formattedStart,
              end: formattedEnd,
              allDay: event.allDay,
              description: event.extendedProps.description,
              category: event.extendedProps.category,
              completed: event.extendedProps.completed,
              className: event.classNames
                .filter(
                  (c) =>
                    c !== undefined &&
                    c !== null &&
                    c.startsWith("priority-") === false
                )
                .join(" "),
            };
            const updatedTask = await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.updateTask(
              event.id,
              updatedData,
              { showLoader: false }
            );
            allTasks = [
              ...allTasks.filter((t) => t.id !== updatedTask.id),
              updatedTask,
            ];
            const current = calendar.getEventById(event.id);
            if (current) current.remove();
            calendar.addEvent(updatedTask);
          } catch (error) {
            info.revert();
            console.error("Failed to update event after resize:", error);
          }
        },
        viewDidMount: function (arg) {
          updateCalendarHeaderButtons(arg.view.type);
          // Always force a resize after any view change
          setTimeout(() => {
            calendar.updateSize();
            // Show calendar after resize to avoid flash
            if (calendarEl) calendarEl.style.visibility = "visible";
          }, 0);
        },
      });

      // Fetch tasks from API and render calendar
      async function initializeCalendar() {
        try {
          const tasks = await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.fetchTasks();
          allTasks = tasks;
          tasks.forEach((task) => calendar.addEvent(task));
          calendar.render();
          // Force correct size and show after initial render
          setTimeout(() => {
            calendar.updateSize();
            if (calendarEl) calendarEl.style.visibility = "visible";
          }, 0);
        } catch (error) {
          console.error("Failed to fetch tasks:", error);
        }
      }

      initializeCalendar();

      // Sidebar button event listeners
      function setActiveSidebarButton(activeBtn) {
        document
          .querySelectorAll(".sidebar-btn, .category-item")
          .forEach((btn) => {
            btn.classList.remove("active");
          });
        if (activeBtn) activeBtn.classList.add("active");
      }

      // Highlight Calendar button on load
      setActiveSidebarButton(btnCalendar);

      if (btnCalendar) {
        btnCalendar.addEventListener("click", () => {
          calendar.changeView("dayGridMonth");
          setActiveSidebarButton(btnCalendar);
          updateCalendarHeaderButtons("dayGridMonth");
          window.dispatchEvent(
            new CustomEvent("viewChange", { detail: { view: "calendar" } })
          );
          setTimeout(() => {
            calendar.updateSize();
            if (calendarEl) calendarEl.style.visibility = "visible";
          }, 0);
        });
      }
      if (btnUpcoming) {
        btnUpcoming.addEventListener("click", () => {
          calendar.changeView("listWeek");
          setActiveSidebarButton(btnUpcoming);
          updateCalendarHeaderButtons("listWeek");
          window.dispatchEvent(
            new CustomEvent("viewChange", { detail: { view: "upcoming" } })
          );
          setTimeout(() => {
            calendar.updateSize();
            if (calendarEl) calendarEl.style.visibility = "visible";
          }, 0);
        });
      }
      if (btnToday) {
        btnToday.addEventListener("click", () => {
          calendar.changeView("timeGridDay", new Date());
          setActiveSidebarButton(btnToday);
          updateCalendarHeaderButtons("timeGridDay");
          window.dispatchEvent(
            new CustomEvent("viewChange", { detail: { view: "today" } })
          );
          setTimeout(() => {
            calendar.updateSize();
            if (calendarEl) calendarEl.style.visibility = "visible";
          }, 0);
        });
      }

      // Listen for category filter event
      window.addEventListener("categoryFilter", (e) => {
        const category = e.detail.category;
        calendar.removeAllEvents();
        if (category) {
          calendar.changeView("listYear");
          // Only add unique events by ID
          const filtered = [];
          const seen = new Set();
          for (const task of allTasks) {
            if ((task.category || "None") === category && !seen.has(task.id)) {
              filtered.push(task);
              seen.add(task.id);
            }
          }
          filtered.forEach((task) => calendar.addEvent(task));
          document
            .querySelectorAll(".sidebar-btn, .category-item")
            .forEach((btn) => {
              btn.classList.remove("active");
            });
          const catBtn = Array.from(
            document.querySelectorAll(".category-item")
          ).find((li) => li.textContent.includes(category));
          if (catBtn) catBtn.classList.add("active");
          setTimeout(() => {
            calendar.updateSize();
            if (calendarEl) calendarEl.style.visibility = "visible";
          }, 0);
        } else {
          calendar.changeView("dayGridMonth");
          // Only add unique events by ID
          const unique = [];
          const seen = new Set();
          for (const task of allTasks) {
            if (!seen.has(task.id)) {
              unique.push(task);
              seen.add(task.id);
            }
          }
          unique.forEach((task) => calendar.addEvent(task));
          setActiveSidebarButton(btnCalendar);
          setTimeout(() => {
            calendar.updateSize();
            if (calendarEl) calendarEl.style.visibility = "visible";
          }, 0);
        }
      });

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
            await deleteTask(currentEditingTask.id); // <-- Calls deleteTask, which updates allTasks
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
        // Remove priority
        // document.getElementById("priority").value =
        //   event.extendedProps.priority || "low";
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
          // Remove priority
          // priority: document.getElementById("priority").value,
          category: categoryValue === "None" ? null : categoryValue,
          completed: document.getElementById("completed").checked,
          // Remove priority from className
          className: `${
            document.getElementById("completed").checked ? "completed-task" : ""
          }`,
        };
      }

      async function createTask(data) {
        try {
          const newTask = await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.createTask(data, {
            showLoader: false,
          });
          allTasks.push(newTask);
          calendar.addEvent(newTask);
          return newTask;
        } finally {
          // Loader.toggle(false); // Remove loader
        }
      }

      async function updateTask(data) {
        try {
          const updatedTask = await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.updateTask(data.id, data, {
            showLoader: false,
          });
          allTasks = [
            ...allTasks.filter((t) => t.id !== updatedTask.id),
            updatedTask,
          ];
          currentEditingTask.remove();
          calendar.addEvent(updatedTask);
          return updatedTask;
        } finally {
          // Loader.toggle(false); // Remove loader
        }
      }

      async function deleteTask(id) {
        console.log(
          "allTasks before delete:",
          allTasks.map((t) => t.id)
        );
        await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.deleteTask(id);
        // Ensure id comparison is always string-based and update array in place
        const idStr = String(id);
        for (let i = allTasks.length - 1; i >= 0; i--) {
          if (String(allTasks[i].id) === idStr) {
            allTasks.splice(i, 1);
          }
        }
        console.log("Deleted task id:", id);
        console.log(
          "allTasks after delete:",
          allTasks.map((t) => t.id)
        );
      }

      // After calendar initialization
      function updateCalendarHeaderButtons(viewType) {
        const fcHeader = document.querySelector(".fc-header-toolbar");
        if (!fcHeader) return;
        // Hide header for listWeek (Upcoming), timeGridDay (Today), and listYear (Year)
        if (
          viewType === "listWeek" ||
          viewType === "timeGridDay" ||
          viewType === "listYear"
        ) {
          fcHeader.style.display = "none";
        } else {
          fcHeader.style.display = "";
        }
        const prevBtn = fcHeader.querySelector(".fc-prev-button");
        const nextBtn = fcHeader.querySelector(".fc-next-button");
        const todayBtn = fcHeader.querySelector(".fc-today-button");
        // Hide right-side view switchers if present
        const rightBtns = fcHeader.querySelectorAll(
          ".fc-toolbar-chunk:last-child .fc-button"
        );
        if (
          viewType === "listWeek" ||
          viewType === "timeGridDay" ||
          viewType === "listYear"
        ) {
          if (prevBtn) prevBtn.style.display = "none";
          if (nextBtn) nextBtn.style.display = "none";
          if (todayBtn) todayBtn.style.display = "none";
          rightBtns.forEach((btn) => (btn.style.display = "none"));
        } else {
          if (prevBtn) prevBtn.style.display = "";
          if (nextBtn) nextBtn.style.display = "";
          if (todayBtn) todayBtn.style.display = "";
          rightBtns.forEach((btn) => (btn.style.display = ""));
        }

        // Remove .fc-scrollgrid-section-header on "today" view (timeGridDay)
        const sectionHeader = document.querySelector(
          ".fc-scrollgrid-section-header"
        );
        if (viewType === "timeGridDay") {
          if (sectionHeader) sectionHeader.style.display = "none";
        } else {
          if (sectionHeader) sectionHeader.style.display = "";
        }
      }

      calendar.on("viewDidMount", function (arg) {
        updateCalendarHeaderButtons(arg.view.type);
      });

      // Render calendar after DOM is ready and header is hidden
      calendar.render();

      // Hide header on initial load if in listWeek (Upcoming)
      setTimeout(() => {
        const fcHeader = document.querySelector(".fc-header-toolbar");
        if (fcHeader) fcHeader.style.display = "";
      }, 100);
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
  let activeCategory = null; // Track the currently selected category

  // Helper functions defined outside DOMContentLoaded
  function renderCategories() {
    const categoriesContainer = document.getElementById("categories-container");

    categoriesContainer.innerHTML = "";

    categories.forEach((category, index) => {
      // Ensure category.id is a string for consistency
      const li = document.createElement("li");
      li.className = "category-item";
      if (activeCategory === category.name) {
        li.classList.add("active");
      }
      li.innerHTML = `
          <div class="category-content">
            <span class="category-dot" style="background-color:${category.color};"></span>
            <span class="category-name">${category.name}</span>
          </div>
          <button class="delete-category-btn" data-id="${category.id}">
            <i class="fas fa-trash"></i>
          </button>
        `;
      // Add click event for filtering
      li.addEventListener("click", (e) => {
        // Prevent click if delete button is clicked
        if (e.target.closest(".delete-category-btn")) return;
        activeCategory = category.name;
        // Remove .active from all sidebar-btn and category-item
        document
          .querySelectorAll(".sidebar-btn, .category-item")
          .forEach((btn) => {
            btn.classList.remove("active");
          });
        li.classList.add("active");
        renderCategories();
        // Dispatch custom event for filtering
        window.dispatchEvent(
          new CustomEvent("categoryFilter", {
            detail: { category: category.name },
          })
        );
      });
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
            // Log the payload being sent to the backend
            console.log("Sending category to backend:", { name, color });
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

      // Add a global listener to clear filter when clicking "Calendar" or "Upcoming" or "Today"
      ["btn-calendar", "btn-upcoming", "btn-today"].forEach((id) => {
        const btn = document.getElementById(id);
        if (btn) {
          btn.addEventListener("click", () => {
            activeCategory = null;
            renderCategories();
            window.dispatchEvent(
              new CustomEvent("categoryFilter", { detail: { category: null } })
            );
          });
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

  // Create a floating error message container if not present
  function showFloatingError(message, type = "error") {
    let floating = document.getElementById("floatingMessage");
    if (!floating) {
      floating = document.createElement("div");
      floating.id = "floatingMessage";
      document.body.appendChild(floating);
    }
    floating.textContent = message;
    floating.className =
      type === "success"
        ? "floating-message success"
        : "floating-message error";
    floating.style.display = "block";
    setTimeout(() => {
      floating.classList.add("fade-out");
      setTimeout(() => {
        floating.style.display = "none";
        floating.classList.remove("fade-out");
      }, 1000);
    }, 3000);
  }

  return {
    clearMessages,
    showError: (msg) => showFloatingError(msg, "error"),
    showSuccess: (msg) => showFloatingError(msg, "success"),
    showFloatingError,
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
    if (loader) {
      if (show) {
        loader.classList.remove("hide");
        loader.style.display = "flex";
      } else {
        loader.classList.add("hide");
        setTimeout(() => {
          if (loader.classList.contains("hide")) {
            loader.style.display = "none";
          }
        }, 300); // match CSS transition duration
      }
    }
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
/* harmony import */ var _domUtils_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./domUtils.js */ "./src/modules/domUtils.js");


const User = (() => {
  async function logout() {
    console.log("Attempting logout...");
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
      _domUtils_js__WEBPACK_IMPORTED_MODULE_0__.DomUtils.showError(
        "Could not properly log out. Clear cookies manually if needed."
      );
    } finally {
      localStorage.removeItem("user");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTtBQUNBLHFEQUFxRDtBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxpQ0FBaUMsS0FBSyxHQUFHLFVBQVU7QUFDbkQsNkJBQTZCLEtBQUssR0FBRyxRQUFRO0FB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QUFXO0FBQ1gsQ0FBQzs7Ozs7OztVQzNDRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7QUNOeUM7QUFDQTtBQUNJOztBQUU3QztBQUNBO0FBQ0EsSUFBSSxrREFBSTtBQUNSO0FBQ0E7QUFDQSxxREFBcUQsa0RBQUk7O0FBRXpEO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2FwaVNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvYXV0aC5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9jYWxlbmRhci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9jYXRlZ29yeS5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9kb21VdGlscy5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9sb2FkZXIuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvdXNlci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vc3RhdGljL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTG9hZGVyIH0gZnJvbSBcIi4vbG9hZGVyLmpzXCI7XG5pbXBvcnQgeyBEb21VdGlscyB9IGZyb20gXCIuL2RvbVV0aWxzLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBBcGlTZXJ2aWNlID0gKCgpID0+IHtcbiAgY29uc3QgQVBJX0JBU0UgPSBcIi9hcGlcIjtcblxuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVSZXF1ZXN0KHVybCwgbWV0aG9kLCBkYXRhLCBvcHRpb25zID0ge30pIHtcbiAgICBjb25zdCB7IHNob3dMb2FkZXIgPSB0cnVlIH0gPSBvcHRpb25zO1xuICAgIHRyeSB7XG4gICAgICBpZiAoc2hvd0xvYWRlcikgTG9hZGVyLnRvZ2dsZSh0cnVlKTtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7QVBJX0JBU0V9JHt1cmx9YCwge1xuICAgICAgICBtZXRob2QsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgfSxcbiAgICAgICAgY3JlZGVudGlhbHM6IFwiaW5jbHVkZVwiLFxuICAgICAgICBib2R5OiBkYXRhID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiB1bmRlZmluZWQsXG4gICAgICB9KTtcblxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvbG9naW4/cmVhc29uPXVuYXV0aGVudGljYXRlZFwiO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3BvbnNlRGF0YS5lcnJvciB8fCBcIlJlcXVlc3QgZmFpbGVkXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgRG9tVXRpbHMuc2hvd0Vycm9yKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGlmIChzaG93TG9hZGVyKSBMb2FkZXIudG9nZ2xlKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIC8vIFRhc2stcmVsYXRlZCBlbmRwb2ludHNcbiAgICBjcmVhdGVUYXNrOiAodGFzaywgb3B0aW9ucykgPT4ge1xuICAgICAgY29uc3QgeyBwcmlvcml0eSwgLi4ucmVzdCB9ID0gdGFzaztcbiAgICAgIHJldHVybiBoYW5kbGVSZXF1ZXN0KFwiL2V2ZW50c1wiLCBcIlBPU1RcIiwgcmVzdCwgb3B0aW9ucyk7XG4gICAgfSxcbiAgICB1cGRhdGVUYXNrOiAoaWQsIHRhc2ssIG9wdGlvbnMpID0+IHtcbiAgICAgIGNvbnN0IHsgcHJpb3JpdHksIC4uLnJlc3QgfSA9IHRhc2s7XG4gICAgICByZXR1cm4gaGFuZGxlUmVxdWVzdChgL2V2ZW50cy8ke2lkfWAsIFwiUFVUXCIsIHJlc3QsIG9wdGlvbnMpO1xuICAgIH0sXG4gICAgZGVsZXRlVGFzazogKGlkLCBvcHRpb25zKSA9PlxuICAgICAgaGFuZGxlUmVxdWVzdChgL2V2ZW50cy8ke2lkfWAsIFwiREVMRVRFXCIsIHVuZGVmaW5lZCwgb3B0aW9ucyksXG4gICAgZmV0Y2hUYXNrczogKG9wdGlvbnMpID0+XG4gICAgICBoYW5kbGVSZXF1ZXN0KFwiL2V2ZW50c1wiLCBcIkdFVFwiLCB1bmRlZmluZWQsIG9wdGlvbnMpLFxuICAgIC8vIENhdGVnb3J5LXJlbGF0ZWQgZW5kcG9pbnRzXG4gICAgY3JlYXRlQ2F0ZWdvcnk6IChjYXRlZ29yeSwgb3B0aW9ucykgPT5cbiAgICAgIGhhbmRsZVJlcXVlc3QoXCIvY2F0ZWdvcmllc1wiLCBcIlBPU1RcIiwgY2F0ZWdvcnksIG9wdGlvbnMpLFxuICAgIGZldGNoQ2F0ZWdvcmllczogKG9wdGlvbnMpID0+XG4gICAgICBoYW5kbGVSZXF1ZXN0KFwiL2NhdGVnb3JpZXNcIiwgXCJHRVRcIiwgdW5kZWZpbmVkLCBvcHRpb25zKSxcbiAgICBkZWxldGVDYXRlZ29yeTogKGlkLCBvcHRpb25zKSA9PlxuICAgICAgaGFuZGxlUmVxdWVzdChgL2NhdGVnb3JpZXMvJHtpZH1gLCBcIkRFTEVURVwiLCB1bmRlZmluZWQsIG9wdGlvbnMpLFxuICB9O1xufSkoKTtcbiIsImltcG9ydCB7IERvbVV0aWxzIH0gZnJvbSBcIi4vZG9tVXRpbHMuanNcIjtcblxuZXhwb3J0IGNvbnN0IEF1dGggPSAoKCkgPT4ge1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvbG9naW5cIikge1xuICAgICAgaW5pdCgpO1xuICAgICAgY2hlY2tSZWRpcmVjdFJlYXNvbigpO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdXRoRm9ybVwiKTtcbiAgICBpZiAoIWZvcm0pIHJldHVybiBjb25zb2xlLmVycm9yKFwiQXV0aCBmb3JtIG5vdCBmb3VuZCFcIik7XG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgaGFuZGxlU3VibWl0KTtcbiAgICBzd2l0Y2hNb2RlKFwibG9naW5cIik7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLW1vZGVdXCIpLmZvckVhY2goKHRhYikgPT5cbiAgICAgIHRhYi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICBzd2l0Y2hNb2RlKHRhYi5kYXRhc2V0Lm1vZGUpO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gc3dpdGNoTW9kZShtb2RlKSB7XG4gICAgY29uc3QgbmFtZUZpZWxkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmllbGRcIik7XG4gICAgY29uc3Qgc3VibWl0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2F1dGhGb3JtIGJ1dHRvblt0eXBlPVwic3VibWl0XCJdJyk7XG4gICAgY29uc3QgcGFzc3dvcmRJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFzc3dvcmRcIik7XG4gICAgY29uc3QgdGFicyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGFiXCIpO1xuXG4gICAgaWYgKG5hbWVGaWVsZCkge1xuICAgICAgbmFtZUZpZWxkLnN0eWxlLmRpc3BsYXkgPSBtb2RlID09PSBcInJlZ2lzdGVyXCIgPyBcImJsb2NrXCIgOiBcIm5vbmVcIjtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZVwiKS5yZXF1aXJlZCA9IG1vZGUgPT09IFwicmVnaXN0ZXJcIjtcbiAgICB9XG4gICAgdGFicy5mb3JFYWNoKCh0YWIpID0+XG4gICAgICB0YWIuY2xhc3NMaXN0LnRvZ2dsZShcImFjdGl2ZVwiLCB0YWIuZGF0YXNldC5tb2RlID09PSBtb2RlKVxuICAgICk7XG4gICAgaWYgKHN1Ym1pdEJ0bilcbiAgICAgIHN1Ym1pdEJ0bi50ZXh0Q29udGVudCA9IG1vZGUgPT09IFwibG9naW5cIiA/IFwiTG9naW5cIiA6IFwiUmVnaXN0ZXJcIjtcbiAgICBpZiAocGFzc3dvcmRJbnB1dClcbiAgICAgIHBhc3N3b3JkSW5wdXQuYXV0b2NvbXBsZXRlID1cbiAgICAgICAgbW9kZSA9PT0gXCJsb2dpblwiID8gXCJjdXJyZW50LXBhc3N3b3JkXCIgOiBcIm5ldy1wYXNzd29yZFwiO1xuXG4gICAgRG9tVXRpbHMuY2xlYXJNZXNzYWdlcygpO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3VibWl0KGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgRG9tVXRpbHMuY2xlYXJNZXNzYWdlcygpO1xuXG4gICAgY29uc3QgaXNMb2dpbiA9IGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignW2RhdGEtbW9kZT1cImxvZ2luXCJdJylcbiAgICAgIC5jbGFzc0xpc3QuY29udGFpbnMoXCJhY3RpdmVcIik7XG4gICAgY29uc3QgdXJsID0gaXNMb2dpbiA/IFwiL2FwaS9sb2dpblwiIDogXCIvYXBpL3JlZ2lzdGVyXCI7XG4gICAgY29uc3QgZm9ybURhdGEgPSB7XG4gICAgICBlbWFpbDogZ2V0VmFsKFwiZW1haWxcIiksXG4gICAgICBwYXNzd29yZDogZ2V0VmFsKFwicGFzc3dvcmRcIiksXG4gICAgfTtcblxuICAgIGlmICghaXNMb2dpbikgZm9ybURhdGEubmFtZSA9IGdldFZhbChcIm5hbWVcIik7XG5cbiAgICB0cnkge1xuICAgICAgdmFsaWRhdGUoZm9ybURhdGEsIGlzTG9naW4pO1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgIEFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGZvcm1EYXRhKSxcbiAgICAgIH0pO1xuICAgICAgYXdhaXQgaGFuZGxlUmVzcG9uc2UocmVzcG9uc2UsIGlzTG9naW4pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgRG9tVXRpbHMuc2hvd0Vycm9yKGVyci5tZXNzYWdlIHx8IFwiVW5leHBlY3RlZCBlcnJvciBkdXJpbmcgc3VibWlzc2lvbi5cIik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0VmFsKGlkKSB7XG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgcmV0dXJuIGVsID8gZWwudmFsdWUudHJpbSgpIDogXCJcIjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlKGRhdGEsIGlzTG9naW4pIHtcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBjb25zdCBlbWFpbFJlZ2V4ID0gL15bXlxcc0BdK0BbXlxcc0BdK1xcLlteXFxzQF0rJC87XG5cbiAgICBpZiAoIWRhdGEuZW1haWwpIGVycm9ycy5wdXNoKFwiRW1haWwgaXMgcmVxdWlyZWQuXCIpO1xuICAgIGVsc2UgaWYgKCFlbWFpbFJlZ2V4LnRlc3QoZGF0YS5lbWFpbCkpIGVycm9ycy5wdXNoKFwiSW52YWxpZCBlbWFpbCBmb3JtYXQuXCIpO1xuICAgIGlmICghZGF0YS5wYXNzd29yZCkgZXJyb3JzLnB1c2goXCJQYXNzd29yZCBpcyByZXF1aXJlZC5cIik7XG4gICAgZWxzZSBpZiAoZGF0YS5wYXNzd29yZC5sZW5ndGggPCA4ICYmICFpc0xvZ2luKVxuICAgICAgZXJyb3JzLnB1c2goXCJQYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycy5cIik7XG4gICAgaWYgKCFpc0xvZ2luICYmICghZGF0YS5uYW1lIHx8IGRhdGEubmFtZS5sZW5ndGggPCAyKSlcbiAgICAgIGVycm9ycy5wdXNoKFwiTmFtZSBtdXN0IGJlIGF0IGxlYXN0IDIgY2hhcmFjdGVycy5cIik7XG5cbiAgICBpZiAoZXJyb3JzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKGVycm9ycy5qb2luKFwiXFxuXCIpKTtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlc3BvbnNlLCBpc0xvZ2luKSB7XG4gICAgY29uc3QgaXNKc29uID0gcmVzcG9uc2UuaGVhZGVyc1xuICAgICAgLmdldChcImNvbnRlbnQtdHlwZVwiKVxuICAgICAgPy5pbmNsdWRlcyhcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgY29uc3QgZGF0YSA9IGlzSnNvblxuICAgICAgPyBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICAgIDogeyBtZXNzYWdlOiBhd2FpdCByZXNwb25zZS50ZXh0KCkgfTtcblxuICAgIGlmICghcmVzcG9uc2Uub2spXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5lcnJvciB8fCBgRXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuXG4gICAgaWYgKGlzTG9naW4pIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidXNlclwiLCBKU09OLnN0cmluZ2lmeShkYXRhLnVzZXIgfHwge30pKTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvYXBwXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIERvbVV0aWxzLnNob3dTdWNjZXNzKFxuICAgICAgICBkYXRhLm1lc3NhZ2UgfHwgXCJSZWdpc3RyYXRpb24gc3VjY2Vzc2Z1bC4gUGxlYXNlIGxvZ2luLlwiXG4gICAgICApO1xuICAgICAgc3dpdGNoTW9kZShcImxvZ2luXCIpO1xuICAgICAgW1wiZW1haWxcIiwgXCJwYXNzd29yZFwiLCBcIm5hbWVcIl0uZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgICAgIGlmIChlbCkgZWwudmFsdWUgPSBcIlwiO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tSZWRpcmVjdFJlYXNvbigpIHtcbiAgICBjb25zdCByZWFzb24gPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGxvY2F0aW9uLnNlYXJjaCkuZ2V0KFwicmVhc29uXCIpO1xuICAgIGNvbnN0IG1lc3NhZ2VzID0ge1xuICAgICAgdW5hdXRoZW50aWNhdGVkOiBcIlBsZWFzZSBsb2cgaW4gdG8gYWNjZXNzIHRoZSBhcHBsaWNhdGlvbi5cIixcbiAgICAgIGludmFsaWRfdG9rZW46IFwiU2Vzc2lvbiBleHBpcmVkLiBQbGVhc2UgbG9nIGluIGFnYWluLlwiLFxuICAgICAgYmFkX3Rva2VuX2NsYWltczogXCJTZXNzaW9uIGRhdGEgaXNzdWUuIFBsZWFzZSBsb2cgaW4gYWdhaW4uXCIsXG4gICAgfTtcbiAgICBpZiAocmVhc29uICYmIG1lc3NhZ2VzW3JlYXNvbl0pIERvbVV0aWxzLnNob3dFcnJvcihtZXNzYWdlc1tyZWFzb25dKTtcbiAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZShudWxsLCBcIlwiLCBsb2NhdGlvbi5wYXRobmFtZSk7XG4gIH1cblxuICByZXR1cm4geyBpbml0IH07XG59KSgpO1xuIiwiaW1wb3J0IHsgQ2F0ZWdvcnkgfSBmcm9tIFwiLi9jYXRlZ29yeS5qc1wiO1xuaW1wb3J0IHsgQXBpU2VydmljZSB9IGZyb20gXCIuL2FwaVNlcnZpY2UuanNcIjtcbmltcG9ydCB7IExvYWRlciB9IGZyb20gXCIuL2xvYWRlci5qc1wiO1xuZXhwb3J0IGNvbnN0IFRvZG8gPSAoKCkgPT4ge1xuICBsZXQgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcbiAgbGV0IGlzRWRpdGluZyA9IGZhbHNlO1xuICBsZXQgYWxsVGFza3MgPSBbXTsgLy8gU3RvcmUgYWxsIHRhc2tzIGZvciBmaWx0ZXJpbmdcblxuICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9hcHBcIikge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhc2stZm9ybVwiKTtcbiAgICAgIGNvbnN0IGZvcm1IZWFkaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb3JtLWhlYWRpbmdcIik7XG4gICAgICBjb25zdCBzdWJtaXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1Ym1pdC1idXR0b25cIik7XG4gICAgICBjb25zdCBkZWxldGVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbGV0ZS1idXR0b25cIik7XG4gICAgICBjb25zdCBjYW5jZWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbmNlbC1idXR0b25cIik7XG4gICAgICBjb25zdCBhZGRUYXNrQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG4tYWRkLXRhc2tcIik7XG4gICAgICBjb25zdCBhbGxEYXlDaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWxsRGF5XCIpO1xuICAgICAgY29uc3QgdGltZUlucHV0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGltZUlucHV0c1wiKTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XG4gICAgICBjb25zdCBjbG9zZVRhc2tGb3JtQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjbG9zZS10YXNrLWZvcm1cIik7XG4gICAgICBjb25zdCBidG5DYWxlbmRhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLWNhbGVuZGFyXCIpO1xuICAgICAgY29uc3QgYnRuVXBjb21pbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi11cGNvbWluZ1wiKTtcbiAgICAgIGNvbnN0IGJ0blRvZGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG4tdG9kYXlcIik7XG5cbiAgICAgIC8vIEhlbHBlciB0byBzaG93L2hpZGUgZm9ybSBhbmQgYmFja2Ryb3BcbiAgICAgIGZ1bmN0aW9uIHNob3dGb3JtKCkge1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC5hZGQoXCJ2aXNpYmxlXCIpO1xuICAgICAgICBjb250ZW50LmNsYXNzTGlzdC5hZGQoXCJmb3JtLW9wZW5cIik7XG4gICAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgLy8gQWx3YXlzIGVuYWJsZSB0aW1lIGlucHV0cyBvbiBmb3JtIG9wZW5cbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFRpbWVcIikuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGZvcm0uZm9jdXMgJiYgZm9ybS5mb2N1cygpO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGhpZGVGb3JtKCkge1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC5yZW1vdmUoXCJ2aXNpYmxlXCIpO1xuICAgICAgICBjb250ZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJmb3JtLW9wZW5cIik7XG4gICAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICBpZiAoYWRkVGFza0J1dHRvbikgYWRkVGFza0J1dHRvbi5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgfVxuXG4gICAgICAvLyBUb2dnbGUgdGltZSBpbnB1dHMgYmFzZWQgb24gQWxsIERheSBjaGVja2JveFxuICAgICAgYWxsRGF5Q2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGlzQWxsRGF5ID0gYWxsRGF5Q2hlY2tib3guY2hlY2tlZDtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFRpbWVcIikuZGlzYWJsZWQgPSBpc0FsbERheTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLmRpc2FibGVkID0gaXNBbGxEYXk7XG4gICAgICAgIGlmIChpc0FsbERheSkge1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLnZhbHVlID0gXCJcIjtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuZFRpbWVcIikudmFsdWUgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gQ2FsZW5kYXIgaW5pdGlhbGl6YXRpb25cbiAgICAgIGNvbnN0IGNhbGVuZGFyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbGVuZGFyXCIpO1xuXG4gICAgICAvLyBIaWRlIGhlYWRlciBpbW1lZGlhdGVseSBiZWZvcmUgY2FsZW5kYXIgaXMgcmVuZGVyZWRcbiAgICAgIGZ1bmN0aW9uIHByZUhpZGVIZWFkZXIoKSB7XG4gICAgICAgIC8vIEhpZGUgaGVhZGVyIGFuZCBjYWxlbmRhciBjb250YWluZXIgYmVmb3JlIHJlbmRlciB0byBhdm9pZCBsYXlvdXQgZmxhc2hcbiAgICAgICAgY29uc3QgZmNIZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmZjLWhlYWRlci10b29sYmFyXCIpO1xuICAgICAgICBpZiAoZmNIZWFkZXIpIGZjSGVhZGVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgaWYgKGNhbGVuZGFyRWwpIGNhbGVuZGFyRWwuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgICB9XG4gICAgICBwcmVIaWRlSGVhZGVyKCk7XG5cbiAgICAgIGNvbnN0IGNhbGVuZGFyID0gbmV3IEZ1bGxDYWxlbmRhci5DYWxlbmRhcihjYWxlbmRhckVsLCB7XG4gICAgICAgIGluaXRpYWxWaWV3OiBcImRheUdyaWRNb250aFwiLFxuICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcbiAgICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICAgIHNlbGVjdE1pcnJvcjogdHJ1ZSxcbiAgICAgICAgZGF5TWF4RXZlbnRzOiB0cnVlLFxuICAgICAgICBldmVudHM6IFtdLFxuICAgICAgICBldmVudFRpbWVGb3JtYXQ6IHsgaG91cjogXCIyLWRpZ2l0XCIsIG1pbnV0ZTogXCIyLWRpZ2l0XCIsIGhvdXIxMjogZmFsc2UgfSwgLy8gMjQtaG91ciBmb3JtYXQgZm9yIGV2ZW50IHRpbWVzXG4gICAgICAgIHNsb3RMYWJlbEZvcm1hdDogeyBob3VyOiBcIjItZGlnaXRcIiwgbWludXRlOiBcIjItZGlnaXRcIiwgaG91cjEyOiBmYWxzZSB9LCAvLyAyNC1ob3VyIGZvcm1hdCBmb3IgdGltZSBheGlzIGluIHRpbWVHcmlkIHZpZXdzXG4gICAgICAgIC8vIFNob3cgY3VzdG9tIG1lc3NhZ2Ugd2hlbiBubyBldmVudHNcbiAgICAgICAgbm9FdmVudHNDb250ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIFwiTm8gdGFza3MgdG8gZGlzcGxheVwiO1xuICAgICAgICB9LFxuICAgICAgICAvLyBQcmV2ZW50IGRyYWdnaW5nIGFsbC1kYXkgZXZlbnRzIGluIHdlZWsgKGxpc3RXZWVrKSBhbmQgdG9kYXkgKHRpbWVHcmlkRGF5KSB2aWV3c1xuICAgICAgICBldmVudEFsbG93OiBmdW5jdGlvbiAoZHJvcEluZm8sIGRyYWdnZWRFdmVudCkge1xuICAgICAgICAgIGNvbnN0IHZpZXdUeXBlID0gY2FsZW5kYXIudmlldyA/IGNhbGVuZGFyLnZpZXcudHlwZSA6IFwiXCI7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgKHZpZXdUeXBlID09PSBcImxpc3RXZWVrXCIgfHwgdmlld1R5cGUgPT09IFwidGltZUdyaWREYXlcIikgJiZcbiAgICAgICAgICAgIGRyYWdnZWRFdmVudC5hbGxEYXlcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIGV2ZW50Q2xpY2s6IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gaW5mby5ldmVudDtcbiAgICAgICAgICBpc0VkaXRpbmcgPSB0cnVlO1xuICAgICAgICAgIHBvcHVsYXRlRm9ybShpbmZvLmV2ZW50KTtcbiAgICAgICAgICB1cGRhdGVGb3JtVUkoKTtcbiAgICAgICAgICBzaG93Rm9ybSgpO1xuICAgICAgICB9LFxuICAgICAgICBldmVudERpZE1vdW50OiBmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICAgIGNvbnN0IGlzQ29tcGxldGVkID0gaW5mby5ldmVudC5leHRlbmRlZFByb3BzLmNvbXBsZXRlZDtcbiAgICAgICAgICBpZiAoaXNDb21wbGV0ZWQpIHtcbiAgICAgICAgICAgIGluZm8uZWwuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCIjZDNkM2QzXCI7XG4gICAgICAgICAgICBpbmZvLmVsLnN0eWxlLnRleHREZWNvcmF0aW9uID0gXCJsaW5lLXRocm91Z2hcIjtcbiAgICAgICAgICAgIGluZm8uZWwuc3R5bGUub3BhY2l0eSA9IFwiMC43XCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQXBwbHkgY2F0ZWdvcnkgY29sb3IgdG8gdGhlIHdob2xlIGV2ZW50IGJvZHlcbiAgICAgICAgICBjb25zdCBjYXRlZ29yeSA9IGluZm8uZXZlbnQuZXh0ZW5kZWRQcm9wcy5jYXRlZ29yeTtcbiAgICAgICAgICBpZiAoY2F0ZWdvcnkgJiYgY2F0ZWdvcnkgIT09IFwiTm9uZVwiKSB7XG4gICAgICAgICAgICBjb25zdCBjYXQgPSBDYXRlZ29yeS5nZXRDYXRlZ29yaWVzKCkuZmluZChcbiAgICAgICAgICAgICAgKGMpID0+IGMubmFtZSA9PT0gY2F0ZWdvcnlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoY2F0KSB7XG4gICAgICAgICAgICAgIGluZm8uZWwuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gY2F0LmNvbG9yO1xuICAgICAgICAgICAgICBpbmZvLmVsLnN0eWxlLmJvcmRlckxlZnQgPSBgNHB4IHNvbGlkICR7Y2F0LmNvbG9yfWA7XG4gICAgICAgICAgICAgIC8vIEZvciBsaXN0IHZpZXdzLCBhbHNvIHNldCBjb2xvciBmb3IgLmZjLWxpc3QtZXZlbnQtZG90IGlmIHByZXNlbnRcbiAgICAgICAgICAgICAgY29uc3QgZG90ID0gaW5mby5lbC5xdWVyeVNlbGVjdG9yKFwiLmZjLWxpc3QtZXZlbnQtZG90XCIpO1xuICAgICAgICAgICAgICBpZiAoZG90KSBkb3Quc3R5bGUuYmFja2dyb3VuZENvbG9yID0gY2F0LmNvbG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmZvLmVsLnN0eWxlLmJvcmRlckxlZnQgPSBcIjRweCBzb2xpZCB0cmFuc3BhcmVudFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXZlbnREcm9wOiBhc3luYyBmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBldmVudCA9IGluZm8uZXZlbnQ7XG4gICAgICAgICAgICBsZXQgc3RhcnQgPSBldmVudC5zdGFydDtcbiAgICAgICAgICAgIGxldCBlbmQgPSBldmVudC5lbmQ7XG5cbiAgICAgICAgICAgIC8vIEZvcm1hdCBzdGFydCBhbmQgZW5kIGFzICdZWVlZLU1NLUREVEhIOm1tJ1xuICAgICAgICAgICAgZnVuY3Rpb24gZm9ybWF0RGF0ZVRpbWUoZHQpIHtcbiAgICAgICAgICAgICAgaWYgKCFkdCkgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICAgIC8vIFBhZCBtb250aCwgZGF5LCBob3VyLCBtaW51dGVcbiAgICAgICAgICAgICAgY29uc3QgeXl5eSA9IGR0LmdldEZ1bGxZZWFyKCk7XG4gICAgICAgICAgICAgIGNvbnN0IG1tID0gU3RyaW5nKGR0LmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCBcIjBcIik7XG4gICAgICAgICAgICAgIGNvbnN0IGRkID0gU3RyaW5nKGR0LmdldERhdGUoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuICAgICAgICAgICAgICBjb25zdCBoaCA9IFN0cmluZyhkdC5nZXRIb3VycygpKS5wYWRTdGFydCgyLCBcIjBcIik7XG4gICAgICAgICAgICAgIGNvbnN0IG1pbiA9IFN0cmluZyhkdC5nZXRNaW51dGVzKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGAke3l5eXl9LSR7bW19LSR7ZGR9VCR7aGh9OiR7bWlufWA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBmb3JtYXR0ZWRTdGFydCwgZm9ybWF0dGVkRW5kO1xuXG4gICAgICAgICAgICBpZiAoZXZlbnQuYWxsRGF5KSB7XG4gICAgICAgICAgICAgIC8vIEZvciBhbGxEYXksIHVzZSBkYXRlIG9ubHlcbiAgICAgICAgICAgICAgZm9ybWF0dGVkU3RhcnQgPSBldmVudC5zdGFydFN0ci5zbGljZSgwLCAxMCk7XG4gICAgICAgICAgICAgIGlmIChldmVudC5lbmQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbmREYXRlID0gbmV3IERhdGUoZXZlbnQuZW5kKTtcbiAgICAgICAgICAgICAgICBlbmREYXRlLnNldERhdGUoZW5kRGF0ZS5nZXREYXRlKCkgLSAxKTtcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRFbmQgPSBlbmREYXRlLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvcm1hdHRlZEVuZCA9IGZvcm1hdHRlZFN0YXJ0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBGb3IgdGltZWQgZXZlbnRzLCB1c2UgJ1lZWVktTU0tRERUSEg6bW0nXG4gICAgICAgICAgICAgIGZvcm1hdHRlZFN0YXJ0ID0gZm9ybWF0RGF0ZVRpbWUoc3RhcnQpO1xuICAgICAgICAgICAgICBmb3JtYXR0ZWRFbmQgPSBlbmQgPyBmb3JtYXREYXRlVGltZShlbmQpIDogZm9ybWF0dGVkU3RhcnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWREYXRhID0ge1xuICAgICAgICAgICAgICBpZDogZXZlbnQuaWQsXG4gICAgICAgICAgICAgIHRpdGxlOiBldmVudC50aXRsZSxcbiAgICAgICAgICAgICAgc3RhcnQ6IGZvcm1hdHRlZFN0YXJ0LFxuICAgICAgICAgICAgICBlbmQ6IGZvcm1hdHRlZEVuZCxcbiAgICAgICAgICAgICAgYWxsRGF5OiBldmVudC5hbGxEYXksXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBldmVudC5leHRlbmRlZFByb3BzLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICBjYXRlZ29yeTogZXZlbnQuZXh0ZW5kZWRQcm9wcy5jYXRlZ29yeSxcbiAgICAgICAgICAgICAgY29tcGxldGVkOiBldmVudC5leHRlbmRlZFByb3BzLmNvbXBsZXRlZCxcbiAgICAgICAgICAgICAgY2xhc3NOYW1lOiBldmVudC5jbGFzc05hbWVzXG4gICAgICAgICAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgIChjKSA9PlxuICAgICAgICAgICAgICAgICAgICBjICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgYyAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICBjLnN0YXJ0c1dpdGgoXCJwcmlvcml0eS1cIikgPT09IGZhbHNlXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC5qb2luKFwiIFwiKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVkVGFzayA9IGF3YWl0IEFwaVNlcnZpY2UudXBkYXRlVGFzayhcbiAgICAgICAgICAgICAgZXZlbnQuaWQsXG4gICAgICAgICAgICAgIHVwZGF0ZWREYXRhLFxuICAgICAgICAgICAgICB7IHNob3dMb2FkZXI6IGZhbHNlIH1cbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICAvLyBFbnN1cmUgYWxsVGFza3MgaGFzIG9ubHkgb25lIGV2ZW50IHBlciBJRCAocmVwbGFjZSBvbGQgd2l0aCBuZXcpXG4gICAgICAgICAgICBhbGxUYXNrcyA9IFtcbiAgICAgICAgICAgICAgLi4uYWxsVGFza3MuZmlsdGVyKCh0KSA9PiB0LmlkICE9PSB1cGRhdGVkVGFzay5pZCksXG4gICAgICAgICAgICAgIHVwZGF0ZWRUYXNrLFxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIC8vIFJlbW92ZSBhbmQgcmUtYWRkIHRoZSBldmVudCB0byBmb3JjZSB1cGRhdGUgaW4gYWxsIHZpZXdzXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gY2FsZW5kYXIuZ2V0RXZlbnRCeUlkKGV2ZW50LmlkKTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50KSBjdXJyZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgY2FsZW5kYXIuYWRkRXZlbnQodXBkYXRlZFRhc2spO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBpbmZvLnJldmVydCgpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byB1cGRhdGUgZXZlbnQgYWZ0ZXIgZHJhZzpcIiwgZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXZlbnRSZXNpemU6IGFzeW5jIGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gaW5mby5ldmVudDtcbiAgICAgICAgICAgIGxldCBzdGFydCA9IGV2ZW50LnN0YXJ0O1xuICAgICAgICAgICAgbGV0IGVuZCA9IGV2ZW50LmVuZDtcblxuICAgICAgICAgICAgZnVuY3Rpb24gZm9ybWF0RGF0ZVRpbWUoZHQpIHtcbiAgICAgICAgICAgICAgaWYgKCFkdCkgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICAgIGNvbnN0IHl5eXkgPSBkdC5nZXRGdWxsWWVhcigpO1xuICAgICAgICAgICAgICBjb25zdCBtbSA9IFN0cmluZyhkdC5nZXRNb250aCgpICsgMSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuICAgICAgICAgICAgICBjb25zdCBkZCA9IFN0cmluZyhkdC5nZXREYXRlKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcbiAgICAgICAgICAgICAgY29uc3QgaGggPSBTdHJpbmcoZHQuZ2V0SG91cnMoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuICAgICAgICAgICAgICBjb25zdCBtaW4gPSBTdHJpbmcoZHQuZ2V0TWludXRlcygpKS5wYWRTdGFydCgyLCBcIjBcIik7XG4gICAgICAgICAgICAgIHJldHVybiBgJHt5eXl5fS0ke21tfS0ke2RkfVQke2hofToke21pbn1gO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgZm9ybWF0dGVkU3RhcnQsIGZvcm1hdHRlZEVuZDtcbiAgICAgICAgICAgIGlmIChldmVudC5hbGxEYXkpIHtcbiAgICAgICAgICAgICAgZm9ybWF0dGVkU3RhcnQgPSBldmVudC5zdGFydFN0ci5zbGljZSgwLCAxMCk7XG4gICAgICAgICAgICAgIGlmIChldmVudC5lbmQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbmREYXRlID0gbmV3IERhdGUoZXZlbnQuZW5kKTtcbiAgICAgICAgICAgICAgICBlbmREYXRlLnNldERhdGUoZW5kRGF0ZS5nZXREYXRlKCkgLSAxKTtcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRFbmQgPSBlbmREYXRlLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvcm1hdHRlZEVuZCA9IGZvcm1hdHRlZFN0YXJ0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBmb3JtYXR0ZWRTdGFydCA9IGZvcm1hdERhdGVUaW1lKHN0YXJ0KTtcbiAgICAgICAgICAgICAgZm9ybWF0dGVkRW5kID0gZW5kID8gZm9ybWF0RGF0ZVRpbWUoZW5kKSA6IGZvcm1hdHRlZFN0YXJ0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB1cGRhdGVkRGF0YSA9IHtcbiAgICAgICAgICAgICAgaWQ6IGV2ZW50LmlkLFxuICAgICAgICAgICAgICB0aXRsZTogZXZlbnQudGl0bGUsXG4gICAgICAgICAgICAgIHN0YXJ0OiBmb3JtYXR0ZWRTdGFydCxcbiAgICAgICAgICAgICAgZW5kOiBmb3JtYXR0ZWRFbmQsXG4gICAgICAgICAgICAgIGFsbERheTogZXZlbnQuYWxsRGF5LFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZXZlbnQuZXh0ZW5kZWRQcm9wcy5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgY2F0ZWdvcnk6IGV2ZW50LmV4dGVuZGVkUHJvcHMuY2F0ZWdvcnksXG4gICAgICAgICAgICAgIGNvbXBsZXRlZDogZXZlbnQuZXh0ZW5kZWRQcm9wcy5jb21wbGV0ZWQsXG4gICAgICAgICAgICAgIGNsYXNzTmFtZTogZXZlbnQuY2xhc3NOYW1lc1xuICAgICAgICAgICAgICAgIC5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAoYykgPT5cbiAgICAgICAgICAgICAgICAgICAgYyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIGMgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgYy5zdGFydHNXaXRoKFwicHJpb3JpdHktXCIpID09PSBmYWxzZVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAuam9pbihcIiBcIiksXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgdXBkYXRlZFRhc2sgPSBhd2FpdCBBcGlTZXJ2aWNlLnVwZGF0ZVRhc2soXG4gICAgICAgICAgICAgIGV2ZW50LmlkLFxuICAgICAgICAgICAgICB1cGRhdGVkRGF0YSxcbiAgICAgICAgICAgICAgeyBzaG93TG9hZGVyOiBmYWxzZSB9XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgYWxsVGFza3MgPSBbXG4gICAgICAgICAgICAgIC4uLmFsbFRhc2tzLmZpbHRlcigodCkgPT4gdC5pZCAhPT0gdXBkYXRlZFRhc2suaWQpLFxuICAgICAgICAgICAgICB1cGRhdGVkVGFzayxcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gY2FsZW5kYXIuZ2V0RXZlbnRCeUlkKGV2ZW50LmlkKTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50KSBjdXJyZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgY2FsZW5kYXIuYWRkRXZlbnQodXBkYXRlZFRhc2spO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBpbmZvLnJldmVydCgpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byB1cGRhdGUgZXZlbnQgYWZ0ZXIgcmVzaXplOlwiLCBlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB2aWV3RGlkTW91bnQ6IGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgICB1cGRhdGVDYWxlbmRhckhlYWRlckJ1dHRvbnMoYXJnLnZpZXcudHlwZSk7XG4gICAgICAgICAgLy8gQWx3YXlzIGZvcmNlIGEgcmVzaXplIGFmdGVyIGFueSB2aWV3IGNoYW5nZVxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY2FsZW5kYXIudXBkYXRlU2l6ZSgpO1xuICAgICAgICAgICAgLy8gU2hvdyBjYWxlbmRhciBhZnRlciByZXNpemUgdG8gYXZvaWQgZmxhc2hcbiAgICAgICAgICAgIGlmIChjYWxlbmRhckVsKSBjYWxlbmRhckVsLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBGZXRjaCB0YXNrcyBmcm9tIEFQSSBhbmQgcmVuZGVyIGNhbGVuZGFyXG4gICAgICBhc3luYyBmdW5jdGlvbiBpbml0aWFsaXplQ2FsZW5kYXIoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgdGFza3MgPSBhd2FpdCBBcGlTZXJ2aWNlLmZldGNoVGFza3MoKTtcbiAgICAgICAgICBhbGxUYXNrcyA9IHRhc2tzO1xuICAgICAgICAgIHRhc2tzLmZvckVhY2goKHRhc2spID0+IGNhbGVuZGFyLmFkZEV2ZW50KHRhc2spKTtcbiAgICAgICAgICBjYWxlbmRhci5yZW5kZXIoKTtcbiAgICAgICAgICAvLyBGb3JjZSBjb3JyZWN0IHNpemUgYW5kIHNob3cgYWZ0ZXIgaW5pdGlhbCByZW5kZXJcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNhbGVuZGFyLnVwZGF0ZVNpemUoKTtcbiAgICAgICAgICAgIGlmIChjYWxlbmRhckVsKSBjYWxlbmRhckVsLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGZldGNoIHRhc2tzOlwiLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaW5pdGlhbGl6ZUNhbGVuZGFyKCk7XG5cbiAgICAgIC8vIFNpZGViYXIgYnV0dG9uIGV2ZW50IGxpc3RlbmVyc1xuICAgICAgZnVuY3Rpb24gc2V0QWN0aXZlU2lkZWJhckJ1dHRvbihhY3RpdmVCdG4pIHtcbiAgICAgICAgZG9jdW1lbnRcbiAgICAgICAgICAucXVlcnlTZWxlY3RvckFsbChcIi5zaWRlYmFyLWJ0biwgLmNhdGVnb3J5LWl0ZW1cIilcbiAgICAgICAgICAuZm9yRWFjaCgoYnRuKSA9PiB7XG4gICAgICAgICAgICBidG4uY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgaWYgKGFjdGl2ZUJ0bikgYWN0aXZlQnRuLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XG4gICAgICB9XG5cbiAgICAgIC8vIEhpZ2hsaWdodCBDYWxlbmRhciBidXR0b24gb24gbG9hZFxuICAgICAgc2V0QWN0aXZlU2lkZWJhckJ1dHRvbihidG5DYWxlbmRhcik7XG5cbiAgICAgIGlmIChidG5DYWxlbmRhcikge1xuICAgICAgICBidG5DYWxlbmRhci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgIGNhbGVuZGFyLmNoYW5nZVZpZXcoXCJkYXlHcmlkTW9udGhcIik7XG4gICAgICAgICAgc2V0QWN0aXZlU2lkZWJhckJ1dHRvbihidG5DYWxlbmRhcik7XG4gICAgICAgICAgdXBkYXRlQ2FsZW5kYXJIZWFkZXJCdXR0b25zKFwiZGF5R3JpZE1vbnRoXCIpO1xuICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwidmlld0NoYW5nZVwiLCB7IGRldGFpbDogeyB2aWV3OiBcImNhbGVuZGFyXCIgfSB9KVxuICAgICAgICAgICk7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjYWxlbmRhci51cGRhdGVTaXplKCk7XG4gICAgICAgICAgICBpZiAoY2FsZW5kYXJFbCkgY2FsZW5kYXJFbC5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGJ0blVwY29taW5nKSB7XG4gICAgICAgIGJ0blVwY29taW5nLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgY2FsZW5kYXIuY2hhbmdlVmlldyhcImxpc3RXZWVrXCIpO1xuICAgICAgICAgIHNldEFjdGl2ZVNpZGViYXJCdXR0b24oYnRuVXBjb21pbmcpO1xuICAgICAgICAgIHVwZGF0ZUNhbGVuZGFySGVhZGVyQnV0dG9ucyhcImxpc3RXZWVrXCIpO1xuICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwidmlld0NoYW5nZVwiLCB7IGRldGFpbDogeyB2aWV3OiBcInVwY29taW5nXCIgfSB9KVxuICAgICAgICAgICk7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjYWxlbmRhci51cGRhdGVTaXplKCk7XG4gICAgICAgICAgICBpZiAoY2FsZW5kYXJFbCkgY2FsZW5kYXJFbC5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGJ0blRvZGF5KSB7XG4gICAgICAgIGJ0blRvZGF5LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgY2FsZW5kYXIuY2hhbmdlVmlldyhcInRpbWVHcmlkRGF5XCIsIG5ldyBEYXRlKCkpO1xuICAgICAgICAgIHNldEFjdGl2ZVNpZGViYXJCdXR0b24oYnRuVG9kYXkpO1xuICAgICAgICAgIHVwZGF0ZUNhbGVuZGFySGVhZGVyQnV0dG9ucyhcInRpbWVHcmlkRGF5XCIpO1xuICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwidmlld0NoYW5nZVwiLCB7IGRldGFpbDogeyB2aWV3OiBcInRvZGF5XCIgfSB9KVxuICAgICAgICAgICk7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjYWxlbmRhci51cGRhdGVTaXplKCk7XG4gICAgICAgICAgICBpZiAoY2FsZW5kYXJFbCkgY2FsZW5kYXJFbC5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBMaXN0ZW4gZm9yIGNhdGVnb3J5IGZpbHRlciBldmVudFxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJjYXRlZ29yeUZpbHRlclwiLCAoZSkgPT4ge1xuICAgICAgICBjb25zdCBjYXRlZ29yeSA9IGUuZGV0YWlsLmNhdGVnb3J5O1xuICAgICAgICBjYWxlbmRhci5yZW1vdmVBbGxFdmVudHMoKTtcbiAgICAgICAgaWYgKGNhdGVnb3J5KSB7XG4gICAgICAgICAgY2FsZW5kYXIuY2hhbmdlVmlldyhcImxpc3RZZWFyXCIpO1xuICAgICAgICAgIC8vIE9ubHkgYWRkIHVuaXF1ZSBldmVudHMgYnkgSURcbiAgICAgICAgICBjb25zdCBmaWx0ZXJlZCA9IFtdO1xuICAgICAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0KCk7XG4gICAgICAgICAgZm9yIChjb25zdCB0YXNrIG9mIGFsbFRhc2tzKSB7XG4gICAgICAgICAgICBpZiAoKHRhc2suY2F0ZWdvcnkgfHwgXCJOb25lXCIpID09PSBjYXRlZ29yeSAmJiAhc2Vlbi5oYXModGFzay5pZCkpIHtcbiAgICAgICAgICAgICAgZmlsdGVyZWQucHVzaCh0YXNrKTtcbiAgICAgICAgICAgICAgc2Vlbi5hZGQodGFzay5pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGZpbHRlcmVkLmZvckVhY2goKHRhc2spID0+IGNhbGVuZGFyLmFkZEV2ZW50KHRhc2spKTtcbiAgICAgICAgICBkb2N1bWVudFxuICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2lkZWJhci1idG4sIC5jYXRlZ29yeS1pdGVtXCIpXG4gICAgICAgICAgICAuZm9yRWFjaCgoYnRuKSA9PiB7XG4gICAgICAgICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgY29uc3QgY2F0QnRuID0gQXJyYXkuZnJvbShcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2F0ZWdvcnktaXRlbVwiKVxuICAgICAgICAgICkuZmluZCgobGkpID0+IGxpLnRleHRDb250ZW50LmluY2x1ZGVzKGNhdGVnb3J5KSk7XG4gICAgICAgICAgaWYgKGNhdEJ0bikgY2F0QnRuLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjYWxlbmRhci51cGRhdGVTaXplKCk7XG4gICAgICAgICAgICBpZiAoY2FsZW5kYXJFbCkgY2FsZW5kYXJFbC5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FsZW5kYXIuY2hhbmdlVmlldyhcImRheUdyaWRNb250aFwiKTtcbiAgICAgICAgICAvLyBPbmx5IGFkZCB1bmlxdWUgZXZlbnRzIGJ5IElEXG4gICAgICAgICAgY29uc3QgdW5pcXVlID0gW107XG4gICAgICAgICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQoKTtcbiAgICAgICAgICBmb3IgKGNvbnN0IHRhc2sgb2YgYWxsVGFza3MpIHtcbiAgICAgICAgICAgIGlmICghc2Vlbi5oYXModGFzay5pZCkpIHtcbiAgICAgICAgICAgICAgdW5pcXVlLnB1c2godGFzayk7XG4gICAgICAgICAgICAgIHNlZW4uYWRkKHRhc2suaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB1bmlxdWUuZm9yRWFjaCgodGFzaykgPT4gY2FsZW5kYXIuYWRkRXZlbnQodGFzaykpO1xuICAgICAgICAgIHNldEFjdGl2ZVNpZGViYXJCdXR0b24oYnRuQ2FsZW5kYXIpO1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY2FsZW5kYXIudXBkYXRlU2l6ZSgpO1xuICAgICAgICAgICAgaWYgKGNhbGVuZGFyRWwpIGNhbGVuZGFyRWwuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gRXZlbnQgTGlzdGVuZXJzXG4gICAgICBpZiAoYWRkVGFza0J1dHRvbikge1xuICAgICAgICBhZGRUYXNrQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgaXNFZGl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcbiAgICAgICAgICBmb3JtLnJlc2V0KCk7XG4gICAgICAgICAgYWxsRGF5Q2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgIHRpbWVJbnB1dHMuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xuICAgICAgICAgIHNob3dGb3JtKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgYXN5bmMgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICBjb25zdCBmb3JtRGF0YSA9IGdldEZvcm1EYXRhKCk7XG5cbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBpZiAoaXNFZGl0aW5nKSB7XG4gICAgICAgICAgICBhd2FpdCB1cGRhdGVUYXNrKGZvcm1EYXRhKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgY3JlYXRlVGFzayhmb3JtRGF0YSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZvcm0ucmVzZXQoKTtcbiAgICAgICAgICBhbGxEYXlDaGVja2JveC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgdGltZUlucHV0cy5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG4gICAgICAgICAgdXBkYXRlRm9ybVVJKCk7XG4gICAgICAgICAgaGlkZUZvcm0oKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIHNhdmUgdGFzazpcIiwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgZGVsZXRlQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGlmIChjdXJyZW50RWRpdGluZ1Rhc2spIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgZGVsZXRlVGFzayhjdXJyZW50RWRpdGluZ1Rhc2suaWQpOyAvLyA8LS0gQ2FsbHMgZGVsZXRlVGFzaywgd2hpY2ggdXBkYXRlcyBhbGxUYXNrc1xuICAgICAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrLnJlbW92ZSgpO1xuICAgICAgICAgICAgZm9ybS5yZXNldCgpO1xuICAgICAgICAgICAgaXNFZGl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xuICAgICAgICAgICAgdXBkYXRlRm9ybVVJKCk7XG4gICAgICAgICAgICBoaWRlRm9ybSgpO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGRlbGV0ZSB0YXNrOlwiLCBlcnJvcik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgY2FuY2VsQnV0dG9uLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIGZvcm0ucmVzZXQoKTtcbiAgICAgICAgaXNFZGl0aW5nID0gZmFsc2U7XG4gICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzayA9IG51bGw7XG4gICAgICAgIGFsbERheUNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgdGltZUlucHV0cy5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG4gICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xuICAgICAgICBoaWRlRm9ybSgpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIEFkZCBjbG9zZSAoY3Jvc3MpIGJ1dHRvbiBoYW5kbGVyXG4gICAgICBpZiAoY2xvc2VUYXNrRm9ybUJ0bikge1xuICAgICAgICBjbG9zZVRhc2tGb3JtQnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgZm9ybS5yZXNldCgpO1xuICAgICAgICAgIGlzRWRpdGluZyA9IGZhbHNlO1xuICAgICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzayA9IG51bGw7XG4gICAgICAgICAgYWxsRGF5Q2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgIHRpbWVJbnB1dHMuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xuICAgICAgICAgIGhpZGVGb3JtKCk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBIaWRlIGZvcm0gb24gY2xpY2sgb3V0c2lkZVxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZG93blwiLCAoZSkgPT4ge1xuICAgICAgICBpZiAoXG4gICAgICAgICAgZm9ybS5jbGFzc0xpc3QuY29udGFpbnMoXCJ2aXNpYmxlXCIpICYmXG4gICAgICAgICAgIWZvcm0uY29udGFpbnMoZS50YXJnZXQpICYmXG4gICAgICAgICAgIShhZGRUYXNrQnV0dG9uICYmIGFkZFRhc2tCdXR0b24uY29udGFpbnMoZS50YXJnZXQpKVxuICAgICAgICApIHtcbiAgICAgICAgICBmb3JtLnJlc2V0KCk7XG4gICAgICAgICAgaXNFZGl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcbiAgICAgICAgICBhbGxEYXlDaGVja2JveC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgdGltZUlucHV0cy5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG4gICAgICAgICAgdXBkYXRlRm9ybVVJKCk7XG4gICAgICAgICAgaGlkZUZvcm0oKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIEhpZGUgZm9ybSBpbml0aWFsbHlcbiAgICAgIGhpZGVGb3JtKCk7XG5cbiAgICAgIC8vIEhlbHBlciBmdW5jdGlvbnNcbiAgICAgIGZ1bmN0aW9uIHVwZGF0ZUZvcm1VSSgpIHtcbiAgICAgICAgaWYgKGlzRWRpdGluZykge1xuICAgICAgICAgIGZvcm1IZWFkaW5nLnRleHRDb250ZW50ID0gXCJFZGl0IFRhc2tcIjtcbiAgICAgICAgICBzdWJtaXRCdXR0b24udGV4dENvbnRlbnQgPSBcIlNhdmUgQ2hhbmdlc1wiO1xuICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xuICAgICAgICAgIGNhbmNlbEJ1dHRvbi5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZGVuXCIpO1xuICAgICAgICAgIGlmIChhZGRUYXNrQnV0dG9uKSBhZGRUYXNrQnV0dG9uLmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmb3JtSGVhZGluZy50ZXh0Q29udGVudCA9IFwiQWRkIE5ldyBUYXNrXCI7XG4gICAgICAgICAgc3VibWl0QnV0dG9uLnRleHRDb250ZW50ID0gXCJBZGQgVGFza1wiO1xuICAgICAgICAgIGRlbGV0ZUJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgICAgICAgIGNhbmNlbEJ1dHRvbi5jbGFzc0xpc3QuYWRkKFwiaGlkZGVuXCIpO1xuICAgICAgICAgIGlmIChhZGRUYXNrQnV0dG9uKSBhZGRUYXNrQnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gcG9wdWxhdGVGb3JtKGV2ZW50KSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGl0bGVcIikudmFsdWUgPSBldmVudC50aXRsZTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YXNrRGF0ZVwiKS52YWx1ZSA9IGV2ZW50LnN0YXJ0U3RyLnN1YnN0cmluZyhcbiAgICAgICAgICAwLFxuICAgICAgICAgIDEwXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGFsbERheSA9IGV2ZW50LmFsbERheTtcbiAgICAgICAgYWxsRGF5Q2hlY2tib3guY2hlY2tlZCA9IGFsbERheTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFRpbWVcIikuZGlzYWJsZWQgPSBhbGxEYXk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5kVGltZVwiKS5kaXNhYmxlZCA9IGFsbERheTtcblxuICAgICAgICBpZiAoIWFsbERheSkge1xuICAgICAgICAgIGNvbnN0IHN0YXJ0RGF0ZSA9IG5ldyBEYXRlKGV2ZW50LnN0YXJ0KTtcbiAgICAgICAgICBjb25zdCBlbmREYXRlID0gbmV3IERhdGUoZXZlbnQuZW5kIHx8IGV2ZW50LnN0YXJ0KTtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0VGltZVwiKS52YWx1ZSA9IHN0YXJ0RGF0ZVxuICAgICAgICAgICAgLnRvVGltZVN0cmluZygpXG4gICAgICAgICAgICAuc3Vic3RyaW5nKDAsIDUpO1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5kVGltZVwiKS52YWx1ZSA9IGVuZERhdGVcbiAgICAgICAgICAgIC50b1RpbWVTdHJpbmcoKVxuICAgICAgICAgICAgLnN1YnN0cmluZygwLCA1KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0VGltZVwiKS52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLnZhbHVlID0gXCJcIjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVzY3JpcHRpb25cIikudmFsdWUgPVxuICAgICAgICAgIGV2ZW50LmV4dGVuZGVkUHJvcHMuZGVzY3JpcHRpb24gfHwgXCJcIjtcbiAgICAgICAgLy8gUmVtb3ZlIHByaW9yaXR5XG4gICAgICAgIC8vIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlcIikudmFsdWUgPVxuICAgICAgICAvLyAgIGV2ZW50LmV4dGVuZGVkUHJvcHMucHJpb3JpdHkgfHwgXCJsb3dcIjtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRlZ29yeVwiKS52YWx1ZSA9XG4gICAgICAgICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5jYXRlZ29yeSB8fCBcIk5vbmVcIjtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb21wbGV0ZWRcIikuY2hlY2tlZCA9XG4gICAgICAgICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5jb21wbGV0ZWQgfHwgZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGdldEZvcm1EYXRhKCkge1xuICAgICAgICBjb25zdCBjYXRlZ29yeVZhbHVlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRlZ29yeVwiKS52YWx1ZTtcbiAgICAgICAgY29uc3QgYWxsRGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhbGxEYXlcIikuY2hlY2tlZDtcbiAgICAgICAgY29uc3QgZGF0ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFza0RhdGVcIikudmFsdWU7XG4gICAgICAgIGxldCBzdGFydCwgZW5kO1xuXG4gICAgICAgIGlmIChhbGxEYXkpIHtcbiAgICAgICAgICBzdGFydCA9IGRhdGU7XG4gICAgICAgICAgZW5kID0gZGF0ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjb25zdCBzdGFydFRpbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0VGltZVwiKS52YWx1ZTtcbiAgICAgICAgICBjb25zdCBlbmRUaW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLnZhbHVlO1xuICAgICAgICAgIHN0YXJ0ID0gc3RhcnRUaW1lID8gYCR7ZGF0ZX1UJHtzdGFydFRpbWV9YCA6IGRhdGU7XG4gICAgICAgICAgZW5kID0gZW5kVGltZSA/IGAke2RhdGV9VCR7ZW5kVGltZX1gIDogc3RhcnQ7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGlkOiBpc0VkaXRpbmcgPyBjdXJyZW50RWRpdGluZ1Rhc2suaWQgOiB1bmRlZmluZWQsXG4gICAgICAgICAgdGl0bGU6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGl0bGVcIikudmFsdWUsXG4gICAgICAgICAgc3RhcnQ6IHN0YXJ0LFxuICAgICAgICAgIGVuZDogZW5kLFxuICAgICAgICAgIGFsbERheTogYWxsRGF5LFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlc2NyaXB0aW9uXCIpLnZhbHVlLFxuICAgICAgICAgIC8vIFJlbW92ZSBwcmlvcml0eVxuICAgICAgICAgIC8vIHByaW9yaXR5OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5XCIpLnZhbHVlLFxuICAgICAgICAgIGNhdGVnb3J5OiBjYXRlZ29yeVZhbHVlID09PSBcIk5vbmVcIiA/IG51bGwgOiBjYXRlZ29yeVZhbHVlLFxuICAgICAgICAgIGNvbXBsZXRlZDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb21wbGV0ZWRcIikuY2hlY2tlZCxcbiAgICAgICAgICAvLyBSZW1vdmUgcHJpb3JpdHkgZnJvbSBjbGFzc05hbWVcbiAgICAgICAgICBjbGFzc05hbWU6IGAke1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjb21wbGV0ZWRcIikuY2hlY2tlZCA/IFwiY29tcGxldGVkLXRhc2tcIiA6IFwiXCJcbiAgICAgICAgICB9YCxcbiAgICAgICAgfTtcbiAgICAgIH1cblxuICAgICAgYXN5bmMgZnVuY3Rpb24gY3JlYXRlVGFzayhkYXRhKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgbmV3VGFzayA9IGF3YWl0IEFwaVNlcnZpY2UuY3JlYXRlVGFzayhkYXRhLCB7XG4gICAgICAgICAgICBzaG93TG9hZGVyOiBmYWxzZSxcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBhbGxUYXNrcy5wdXNoKG5ld1Rhc2spO1xuICAgICAgICAgIGNhbGVuZGFyLmFkZEV2ZW50KG5ld1Rhc2spO1xuICAgICAgICAgIHJldHVybiBuZXdUYXNrO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIC8vIExvYWRlci50b2dnbGUoZmFsc2UpOyAvLyBSZW1vdmUgbG9hZGVyXG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgYXN5bmMgZnVuY3Rpb24gdXBkYXRlVGFzayhkYXRhKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgdXBkYXRlZFRhc2sgPSBhd2FpdCBBcGlTZXJ2aWNlLnVwZGF0ZVRhc2soZGF0YS5pZCwgZGF0YSwge1xuICAgICAgICAgICAgc2hvd0xvYWRlcjogZmFsc2UsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgYWxsVGFza3MgPSBbXG4gICAgICAgICAgICAuLi5hbGxUYXNrcy5maWx0ZXIoKHQpID0+IHQuaWQgIT09IHVwZGF0ZWRUYXNrLmlkKSxcbiAgICAgICAgICAgIHVwZGF0ZWRUYXNrLFxuICAgICAgICAgIF07XG4gICAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrLnJlbW92ZSgpO1xuICAgICAgICAgIGNhbGVuZGFyLmFkZEV2ZW50KHVwZGF0ZWRUYXNrKTtcbiAgICAgICAgICByZXR1cm4gdXBkYXRlZFRhc2s7XG4gICAgICAgIH0gZmluYWxseSB7XG4gICAgICAgICAgLy8gTG9hZGVyLnRvZ2dsZShmYWxzZSk7IC8vIFJlbW92ZSBsb2FkZXJcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBhc3luYyBmdW5jdGlvbiBkZWxldGVUYXNrKGlkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgIFwiYWxsVGFza3MgYmVmb3JlIGRlbGV0ZTpcIixcbiAgICAgICAgICBhbGxUYXNrcy5tYXAoKHQpID0+IHQuaWQpXG4gICAgICAgICk7XG4gICAgICAgIGF3YWl0IEFwaVNlcnZpY2UuZGVsZXRlVGFzayhpZCk7XG4gICAgICAgIC8vIEVuc3VyZSBpZCBjb21wYXJpc29uIGlzIGFsd2F5cyBzdHJpbmctYmFzZWQgYW5kIHVwZGF0ZSBhcnJheSBpbiBwbGFjZVxuICAgICAgICBjb25zdCBpZFN0ciA9IFN0cmluZyhpZCk7XG4gICAgICAgIGZvciAobGV0IGkgPSBhbGxUYXNrcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICAgIGlmIChTdHJpbmcoYWxsVGFza3NbaV0uaWQpID09PSBpZFN0cikge1xuICAgICAgICAgICAgYWxsVGFza3Muc3BsaWNlKGksIDEpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zb2xlLmxvZyhcIkRlbGV0ZWQgdGFzayBpZDpcIiwgaWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICBcImFsbFRhc2tzIGFmdGVyIGRlbGV0ZTpcIixcbiAgICAgICAgICBhbGxUYXNrcy5tYXAoKHQpID0+IHQuaWQpXG4gICAgICAgICk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFmdGVyIGNhbGVuZGFyIGluaXRpYWxpemF0aW9uXG4gICAgICBmdW5jdGlvbiB1cGRhdGVDYWxlbmRhckhlYWRlckJ1dHRvbnModmlld1R5cGUpIHtcbiAgICAgICAgY29uc3QgZmNIZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmZjLWhlYWRlci10b29sYmFyXCIpO1xuICAgICAgICBpZiAoIWZjSGVhZGVyKSByZXR1cm47XG4gICAgICAgIC8vIEhpZGUgaGVhZGVyIGZvciBsaXN0V2VlayAoVXBjb21pbmcpLCB0aW1lR3JpZERheSAoVG9kYXkpLCBhbmQgbGlzdFllYXIgKFllYXIpXG4gICAgICAgIGlmIChcbiAgICAgICAgICB2aWV3VHlwZSA9PT0gXCJsaXN0V2Vla1wiIHx8XG4gICAgICAgICAgdmlld1R5cGUgPT09IFwidGltZUdyaWREYXlcIiB8fFxuICAgICAgICAgIHZpZXdUeXBlID09PSBcImxpc3RZZWFyXCJcbiAgICAgICAgKSB7XG4gICAgICAgICAgZmNIZWFkZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZjSGVhZGVyLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByZXZCdG4gPSBmY0hlYWRlci5xdWVyeVNlbGVjdG9yKFwiLmZjLXByZXYtYnV0dG9uXCIpO1xuICAgICAgICBjb25zdCBuZXh0QnRuID0gZmNIZWFkZXIucXVlcnlTZWxlY3RvcihcIi5mYy1uZXh0LWJ1dHRvblwiKTtcbiAgICAgICAgY29uc3QgdG9kYXlCdG4gPSBmY0hlYWRlci5xdWVyeVNlbGVjdG9yKFwiLmZjLXRvZGF5LWJ1dHRvblwiKTtcbiAgICAgICAgLy8gSGlkZSByaWdodC1zaWRlIHZpZXcgc3dpdGNoZXJzIGlmIHByZXNlbnRcbiAgICAgICAgY29uc3QgcmlnaHRCdG5zID0gZmNIZWFkZXIucXVlcnlTZWxlY3RvckFsbChcbiAgICAgICAgICBcIi5mYy10b29sYmFyLWNodW5rOmxhc3QtY2hpbGQgLmZjLWJ1dHRvblwiXG4gICAgICAgICk7XG4gICAgICAgIGlmIChcbiAgICAgICAgICB2aWV3VHlwZSA9PT0gXCJsaXN0V2Vla1wiIHx8XG4gICAgICAgICAgdmlld1R5cGUgPT09IFwidGltZUdyaWREYXlcIiB8fFxuICAgICAgICAgIHZpZXdUeXBlID09PSBcImxpc3RZZWFyXCJcbiAgICAgICAgKSB7XG4gICAgICAgICAgaWYgKHByZXZCdG4pIHByZXZCdG4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgIGlmIChuZXh0QnRuKSBuZXh0QnRuLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICBpZiAodG9kYXlCdG4pIHRvZGF5QnRuLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICByaWdodEJ0bnMuZm9yRWFjaCgoYnRuKSA9PiAoYnRuLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChwcmV2QnRuKSBwcmV2QnRuLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgICAgICAgIGlmIChuZXh0QnRuKSBuZXh0QnRuLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgICAgICAgIGlmICh0b2RheUJ0bikgdG9kYXlCdG4uc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICAgICAgcmlnaHRCdG5zLmZvckVhY2goKGJ0bikgPT4gKGJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJcIikpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIC5mYy1zY3JvbGxncmlkLXNlY3Rpb24taGVhZGVyIG9uIFwidG9kYXlcIiB2aWV3ICh0aW1lR3JpZERheSlcbiAgICAgICAgY29uc3Qgc2VjdGlvbkhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXG4gICAgICAgICAgXCIuZmMtc2Nyb2xsZ3JpZC1zZWN0aW9uLWhlYWRlclwiXG4gICAgICAgICk7XG4gICAgICAgIGlmICh2aWV3VHlwZSA9PT0gXCJ0aW1lR3JpZERheVwiKSB7XG4gICAgICAgICAgaWYgKHNlY3Rpb25IZWFkZXIpIHNlY3Rpb25IZWFkZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChzZWN0aW9uSGVhZGVyKSBzZWN0aW9uSGVhZGVyLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNhbGVuZGFyLm9uKFwidmlld0RpZE1vdW50XCIsIGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgdXBkYXRlQ2FsZW5kYXJIZWFkZXJCdXR0b25zKGFyZy52aWV3LnR5cGUpO1xuICAgICAgfSk7XG5cbiAgICAgIC8vIFJlbmRlciBjYWxlbmRhciBhZnRlciBET00gaXMgcmVhZHkgYW5kIGhlYWRlciBpcyBoaWRkZW5cbiAgICAgIGNhbGVuZGFyLnJlbmRlcigpO1xuXG4gICAgICAvLyBIaWRlIGhlYWRlciBvbiBpbml0aWFsIGxvYWQgaWYgaW4gbGlzdFdlZWsgKFVwY29taW5nKVxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGNvbnN0IGZjSGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5mYy1oZWFkZXItdG9vbGJhclwiKTtcbiAgICAgICAgaWYgKGZjSGVhZGVyKSBmY0hlYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgIH0sIDEwMCk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHt9O1xufSkoKTtcbiIsImltcG9ydCB7IEFwaVNlcnZpY2UgfSBmcm9tIFwiLi9hcGlTZXJ2aWNlLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBDYXRlZ29yeSA9ICgoKSA9PiB7XG4gIGxldCBjYXRlZ29yaWVzID0gW107XG4gIGxldCBhY3RpdmVDYXRlZ29yeSA9IG51bGw7IC8vIFRyYWNrIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgY2F0ZWdvcnlcblxuICAvLyBIZWxwZXIgZnVuY3Rpb25zIGRlZmluZWQgb3V0c2lkZSBET01Db250ZW50TG9hZGVkXG4gIGZ1bmN0aW9uIHJlbmRlckNhdGVnb3JpZXMoKSB7XG4gICAgY29uc3QgY2F0ZWdvcmllc0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2F0ZWdvcmllcy1jb250YWluZXJcIik7XG5cbiAgICBjYXRlZ29yaWVzQ29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XG5cbiAgICBjYXRlZ29yaWVzLmZvckVhY2goKGNhdGVnb3J5LCBpbmRleCkgPT4ge1xuICAgICAgLy8gRW5zdXJlIGNhdGVnb3J5LmlkIGlzIGEgc3RyaW5nIGZvciBjb25zaXN0ZW5jeVxuICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgICBsaS5jbGFzc05hbWUgPSBcImNhdGVnb3J5LWl0ZW1cIjtcbiAgICAgIGlmIChhY3RpdmVDYXRlZ29yeSA9PT0gY2F0ZWdvcnkubmFtZSkge1xuICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xuICAgICAgfVxuICAgICAgbGkuaW5uZXJIVE1MID0gYFxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXRlZ29yeS1jb250ZW50XCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNhdGVnb3J5LWRvdFwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjoke2NhdGVnb3J5LmNvbG9yfTtcIj48L3NwYW4+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNhdGVnb3J5LW5hbWVcIj4ke2NhdGVnb3J5Lm5hbWV9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJkZWxldGUtY2F0ZWdvcnktYnRuXCIgZGF0YS1pZD1cIiR7Y2F0ZWdvcnkuaWR9XCI+XG4gICAgICAgICAgICA8aSBjbGFzcz1cImZhcyBmYS10cmFzaFwiPjwvaT5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgYDtcbiAgICAgIC8vIEFkZCBjbGljayBldmVudCBmb3IgZmlsdGVyaW5nXG4gICAgICBsaS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcbiAgICAgICAgLy8gUHJldmVudCBjbGljayBpZiBkZWxldGUgYnV0dG9uIGlzIGNsaWNrZWRcbiAgICAgICAgaWYgKGUudGFyZ2V0LmNsb3Nlc3QoXCIuZGVsZXRlLWNhdGVnb3J5LWJ0blwiKSkgcmV0dXJuO1xuICAgICAgICBhY3RpdmVDYXRlZ29yeSA9IGNhdGVnb3J5Lm5hbWU7XG4gICAgICAgIC8vIFJlbW92ZSAuYWN0aXZlIGZyb20gYWxsIHNpZGViYXItYnRuIGFuZCBjYXRlZ29yeS1pdGVtXG4gICAgICAgIGRvY3VtZW50XG4gICAgICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2lkZWJhci1idG4sIC5jYXRlZ29yeS1pdGVtXCIpXG4gICAgICAgICAgLmZvckVhY2goKGJ0bikgPT4ge1xuICAgICAgICAgICAgYnRuLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XG4gICAgICAgIHJlbmRlckNhdGVnb3JpZXMoKTtcbiAgICAgICAgLy8gRGlzcGF0Y2ggY3VzdG9tIGV2ZW50IGZvciBmaWx0ZXJpbmdcbiAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwiY2F0ZWdvcnlGaWx0ZXJcIiwge1xuICAgICAgICAgICAgZGV0YWlsOiB7IGNhdGVnb3J5OiBjYXRlZ29yeS5uYW1lIH0sXG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgICAgY2F0ZWdvcmllc0NvbnRhaW5lci5hcHBlbmRDaGlsZChsaSk7XG4gICAgfSk7XG5cbiAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIHRvIGRlbGV0ZSBidXR0b25zXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5kZWxldGUtY2F0ZWdvcnktYnRuXCIpLmZvckVhY2goKGJ0bikgPT4ge1xuICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAvLyBFbnN1cmUgaWQgaXMgdHJlYXRlZCBhcyBhIHN0cmluZ1xuICAgICAgICBjb25zdCBpZCA9IGJ0bi5kYXRhc2V0LmlkO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkF0dGVtcHRpbmcgdG8gZGVsZXRlIGNhdGVnb3J5IHdpdGggaWQ6XCIsIGlkKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJDdXJyZW50IGNhdGVnb3JpZXM6XCIsIGNhdGVnb3JpZXMpO1xuICAgICAgICBkZWxldGVDYXRlZ29yeShpZCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUNhdGVnb3J5U2VsZWN0KCkge1xuICAgIGNvbnN0IGNhdGVnb3J5U2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRlZ29yeVwiKTtcbiAgICBjYXRlZ29yeVNlbGVjdC5pbm5lckhUTUwgPSBcIlwiO1xuXG4gICAgLy8gQWRkIFwiTm9uZVwiIG9wdGlvbiBmaXJzdFxuICAgIGNvbnN0IG5vbmVPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xuICAgIG5vbmVPcHRpb24udmFsdWUgPSBcIk5vbmVcIjtcbiAgICBub25lT3B0aW9uLnRleHRDb250ZW50ID0gXCJOb25lXCI7XG4gICAgY2F0ZWdvcnlTZWxlY3QuYXBwZW5kQ2hpbGQobm9uZU9wdGlvbik7XG5cbiAgICAvLyBBZGQgYWxsIGNhdGVnb3J5IG9wdGlvbnNcbiAgICBjYXRlZ29yaWVzLmZvckVhY2goKGNhdGVnb3J5KSA9PiB7XG4gICAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xuICAgICAgb3B0aW9uLnZhbHVlID0gY2F0ZWdvcnkubmFtZTtcbiAgICAgIG9wdGlvbi50ZXh0Q29udGVudCA9IGNhdGVnb3J5Lm5hbWU7XG4gICAgICBjYXRlZ29yeVNlbGVjdC5hcHBlbmRDaGlsZChvcHRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gZGVsZXRlQ2F0ZWdvcnkoaWQpIHtcbiAgICAvLyBDb252ZXJ0IGlkIHRvIHN0cmluZyBmb3IgY29uc2lzdGVuY3lcbiAgICBjb25zdCBpbmRleCA9IGNhdGVnb3JpZXMuZmluZEluZGV4KFxuICAgICAgKGMpID0+IGMuaWQudG9TdHJpbmcoKSA9PT0gaWQudG9TdHJpbmcoKVxuICAgICk7XG4gICAgY29uc29sZS5sb2coXCJkZWxldGVDYXRlZ29yeSBjYWxsZWQgd2l0aCBpZDpcIiwgaWQsIFwiRm91bmQgaW5kZXg6XCIsIGluZGV4KTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBEZWxldGUgY2F0ZWdvcnkgdmlhIEFQSVxuICAgICAgICBhd2FpdCBBcGlTZXJ2aWNlLmRlbGV0ZUNhdGVnb3J5KGlkKTtcbiAgICAgICAgLy8gUmVtb3ZlIGZyb20gbG9jYWwgc3RhdGVcbiAgICAgICAgY2F0ZWdvcmllcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICByZW5kZXJDYXRlZ29yaWVzKCk7XG4gICAgICAgIHVwZGF0ZUNhdGVnb3J5U2VsZWN0KCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGRlbGV0ZSBjYXRlZ29yeTpcIiwgZXJyb3IpO1xuICAgICAgICAvLyBPcHRpb25hbGx5IHNob3cgZXJyb3IgbWVzc2FnZSB0byB1c2VyXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJDYXRlZ29yeSBub3QgZm91bmQgd2l0aCBpZDpcIiwgaWQpO1xuICAgIH1cbiAgfVxuXG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09IFwiL2FwcFwiKSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgY2F0ZWdvcnlTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3J5XCIpO1xuICAgICAgY29uc3QgY2F0ZWdvcmllc0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgICBcImNhdGVnb3JpZXMtY29udGFpbmVyXCJcbiAgICAgICk7XG4gICAgICBjb25zdCBhZGROZXdDYXRlZ29yeUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkLW5ldy1jYXRlZ29yeS1idG5cIik7XG4gICAgICBjb25zdCBuZXdDYXRlZ29yeUZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1mb3JtXCIpO1xuICAgICAgY29uc3QgY3JlYXRlQ2F0ZWdvcnlCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNyZWF0ZS1jYXRlZ29yeS1idG5cIik7XG5cbiAgICAgIC8vIEZldGNoIGNhdGVnb3JpZXMgZnJvbSBBUElcbiAgICAgIGFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemVDYXRlZ29yaWVzKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNhdGVnb3JpZXMgPSBhd2FpdCBBcGlTZXJ2aWNlLmZldGNoQ2F0ZWdvcmllcygpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmV0Y2hlZCBjYXRlZ29yaWVzOlwiLCBjYXRlZ29yaWVzKTtcbiAgICAgICAgICByZW5kZXJDYXRlZ29yaWVzKCk7XG4gICAgICAgICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGZldGNoIGNhdGVnb3JpZXM6XCIsIGVycm9yKTtcbiAgICAgICAgICAvLyBPcHRpb25hbGx5IHNob3cgZXJyb3IgbWVzc2FnZSB0byB1c2VyXG4gICAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xuICAgICAgICAgIHVwZGF0ZUNhdGVnb3J5U2VsZWN0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaW5pdGlhbGl6ZUNhdGVnb3JpZXMoKTtcblxuICAgICAgLy8gQ2F0ZWdvcnkgbWFuYWdlbWVudFxuICAgICAgYWRkTmV3Q2F0ZWdvcnlCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgbmV3Q2F0ZWdvcnlGb3JtLnN0eWxlLmRpc3BsYXkgPVxuICAgICAgICAgIG5ld0NhdGVnb3J5Rm9ybS5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIiA/IFwiZmxleFwiIDogXCJub25lXCI7XG4gICAgICB9KTtcblxuICAgICAgY3JlYXRlQ2F0ZWdvcnlCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3LWNhdGVnb3J5LW5hbWVcIikudmFsdWUudHJpbSgpO1xuICAgICAgICBjb25zdCBjb2xvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3LWNhdGVnb3J5LWNvbG9yXCIpLnZhbHVlO1xuXG4gICAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIExvZyB0aGUgcGF5bG9hZCBiZWluZyBzZW50IHRvIHRoZSBiYWNrZW5kXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNlbmRpbmcgY2F0ZWdvcnkgdG8gYmFja2VuZDpcIiwgeyBuYW1lLCBjb2xvciB9KTtcbiAgICAgICAgICAgIC8vIEFkZCBuZXcgY2F0ZWdvcnkgdmlhIEFQSVxuICAgICAgICAgICAgY29uc3QgYXBpQ2F0ZWdvcnkgPSBhd2FpdCBBcGlTZXJ2aWNlLmNyZWF0ZUNhdGVnb3J5KHtcbiAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgY29sb3IsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhdGVnb3JpZXMucHVzaChhcGlDYXRlZ29yeSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkFkZGVkIG5ldyBjYXRlZ29yeTpcIiwgYXBpQ2F0ZWdvcnkpO1xuICAgICAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xuICAgICAgICAgICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKTtcblxuICAgICAgICAgICAgLy8gUmVzZXQgZm9ybVxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctY2F0ZWdvcnktbmFtZVwiKS52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1jb2xvclwiKS52YWx1ZSA9IFwiI2NjY2NjY1wiO1xuICAgICAgICAgICAgbmV3Q2F0ZWdvcnlGb3JtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBjcmVhdGUgY2F0ZWdvcnk6XCIsIGVycm9yKTtcbiAgICAgICAgICAgIC8vIE9wdGlvbmFsbHkgc2hvdyBlcnJvciBtZXNzYWdlIHRvIHVzZXJcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBBZGQgYSBnbG9iYWwgbGlzdGVuZXIgdG8gY2xlYXIgZmlsdGVyIHdoZW4gY2xpY2tpbmcgXCJDYWxlbmRhclwiIG9yIFwiVXBjb21pbmdcIiBvciBcIlRvZGF5XCJcbiAgICAgIFtcImJ0bi1jYWxlbmRhclwiLCBcImJ0bi11cGNvbWluZ1wiLCBcImJ0bi10b2RheVwiXS5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgICAgIGlmIChidG4pIHtcbiAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICAgIGFjdGl2ZUNhdGVnb3J5ID0gbnVsbDtcbiAgICAgICAgICAgIHJlbmRlckNhdGVnb3JpZXMoKTtcbiAgICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJjYXRlZ29yeUZpbHRlclwiLCB7IGRldGFpbDogeyBjYXRlZ29yeTogbnVsbCB9IH0pXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGdldENhdGVnb3JpZXM6ICgpID0+IGNhdGVnb3JpZXMsXG4gICAgcmVuZGVyQ2F0ZWdvcmllcyxcbiAgICB1cGRhdGVDYXRlZ29yeVNlbGVjdCxcbiAgfTtcbn0pKCk7XG4iLCJleHBvcnQgY29uc3QgRG9tVXRpbHMgPSAoKCkgPT4ge1xuICBmdW5jdGlvbiBjbGVhck1lc3NhZ2VzKCkge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVzc2FnZUNvbnRhaW5lclwiKTtcbiAgICBpZiAoY29udGFpbmVyKSBjb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZXJyb3ItbWVzc2FnZSwgLnN1Y2Nlc3MtbWVzc2FnZVwiKVxuICAgICAgLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICAgIGlmIChlbC5wYXJlbnROb2RlICE9PSBjb250YWluZXIpIGVsLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBzaG93TWVzc2FnZShtZXNzYWdlLCB0eXBlID0gXCJlcnJvclwiKSB7XG4gICAgY2xlYXJNZXNzYWdlcygpO1xuICAgIGNvbnN0IG1lc3NhZ2VFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBtZXNzYWdlRWxlbWVudC5jbGFzc05hbWUgPVxuICAgICAgdHlwZSA9PT0gXCJlcnJvclwiID8gXCJlcnJvci1tZXNzYWdlXCIgOiBcInN1Y2Nlc3MtbWVzc2FnZVwiO1xuICAgIG1lc3NhZ2Uuc3BsaXQoXCJcXG5cIikuZm9yRWFjaCgobGluZSkgPT4ge1xuICAgICAgY29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgcC50ZXh0Q29udGVudCA9IGxpbmU7XG4gICAgICBtZXNzYWdlRWxlbWVudC5hcHBlbmRDaGlsZChwKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVzc2FnZUNvbnRhaW5lclwiKTtcbiAgICBpZiAoY29udGFpbmVyKSB7XG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobWVzc2FnZUVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdXRoRm9ybVwiKTtcbiAgICAgIGZvcm1cbiAgICAgICAgPyBmb3JtLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG1lc3NhZ2VFbGVtZW50LCBmb3JtKVxuICAgICAgICA6IGRvY3VtZW50LmJvZHkucHJlcGVuZChtZXNzYWdlRWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ3JlYXRlIGEgZmxvYXRpbmcgZXJyb3IgbWVzc2FnZSBjb250YWluZXIgaWYgbm90IHByZXNlbnRcbiAgZnVuY3Rpb24gc2hvd0Zsb2F0aW5nRXJyb3IobWVzc2FnZSwgdHlwZSA9IFwiZXJyb3JcIikge1xuICAgIGxldCBmbG9hdGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmxvYXRpbmdNZXNzYWdlXCIpO1xuICAgIGlmICghZmxvYXRpbmcpIHtcbiAgICAgIGZsb2F0aW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIGZsb2F0aW5nLmlkID0gXCJmbG9hdGluZ01lc3NhZ2VcIjtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZmxvYXRpbmcpO1xuICAgIH1cbiAgICBmbG9hdGluZy50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gICAgZmxvYXRpbmcuY2xhc3NOYW1lID1cbiAgICAgIHR5cGUgPT09IFwic3VjY2Vzc1wiXG4gICAgICAgID8gXCJmbG9hdGluZy1tZXNzYWdlIHN1Y2Nlc3NcIlxuICAgICAgICA6IFwiZmxvYXRpbmctbWVzc2FnZSBlcnJvclwiO1xuICAgIGZsb2F0aW5nLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBmbG9hdGluZy5jbGFzc0xpc3QuYWRkKFwiZmFkZS1vdXRcIik7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgZmxvYXRpbmcuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICBmbG9hdGluZy5jbGFzc0xpc3QucmVtb3ZlKFwiZmFkZS1vdXRcIik7XG4gICAgICB9LCAxMDAwKTtcbiAgICB9LCAzMDAwKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2xlYXJNZXNzYWdlcyxcbiAgICBzaG93RXJyb3I6IChtc2cpID0+IHNob3dGbG9hdGluZ0Vycm9yKG1zZywgXCJlcnJvclwiKSxcbiAgICBzaG93U3VjY2VzczogKG1zZykgPT4gc2hvd0Zsb2F0aW5nRXJyb3IobXNnLCBcInN1Y2Nlc3NcIiksXG4gICAgc2hvd0Zsb2F0aW5nRXJyb3IsXG4gIH07XG59KSgpO1xuIiwiZXhwb3J0IGNvbnN0IExvYWRlciA9ICgoKSA9PiB7XG4gIGZ1bmN0aW9uIHRvZ2dsZShzaG93KSB7XG4gICAgbGV0IGxvYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGVyXCIpO1xuICAgIGlmICghbG9hZGVyICYmIHNob3cpIGxvYWRlciA9IGNyZWF0ZSgpO1xuICAgIGlmIChsb2FkZXIpIHtcbiAgICAgIGlmIChzaG93KSB7XG4gICAgICAgIGxvYWRlci5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKTtcbiAgICAgICAgbG9hZGVyLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvYWRlci5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgaWYgKGxvYWRlci5jbGFzc0xpc3QuY29udGFpbnMoXCJoaWRlXCIpKSB7XG4gICAgICAgICAgICBsb2FkZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgMzAwKTsgLy8gbWF0Y2ggQ1NTIHRyYW5zaXRpb24gZHVyYXRpb25cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgY29uc3QgbG9hZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBsb2FkZXIuaWQgPSBcImxvYWRlclwiO1xuICAgIGxvYWRlci5jbGFzc05hbWUgPSBcImxvYWRlclwiO1xuICAgIGxvYWRlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXJcIj48L2Rpdj4nO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobG9hZGVyKTtcbiAgICByZXR1cm4gbG9hZGVyO1xuICB9XG5cbiAgcmV0dXJuIHsgdG9nZ2xlIH07XG59KSgpO1xuIiwiaW1wb3J0IHsgRG9tVXRpbHMgfSBmcm9tIFwiLi9kb21VdGlscy5qc1wiO1xuXG5leHBvcnQgY29uc3QgVXNlciA9ICgoKSA9PiB7XG4gIGFzeW5jIGZ1bmN0aW9uIGxvZ291dCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkF0dGVtcHRpbmcgbG9nb3V0Li4uXCIpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFwiL2FwaS9sb2dvdXRcIiwge1xuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICBoZWFkZXJzOiB7IEFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpO1xuICAgICAgaWYgKCFyZXNwb25zZS5vaylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGRhdGEuZXJyb3IgfHwgYExvZ291dCBmYWlsZWQgd2l0aCBzdGF0dXM6ICR7cmVzcG9uc2Uuc3RhdHVzfWBcbiAgICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiTG9nb3V0IHN1Y2Nlc3NmdWwgdmlhIEFQSS5cIik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJMb2dvdXQgQVBJIGNhbGwgZmFpbGVkOlwiLCBlcnJvcik7XG4gICAgICBEb21VdGlscy5zaG93RXJyb3IoXG4gICAgICAgIFwiQ291bGQgbm90IHByb3Blcmx5IGxvZyBvdXQuIENsZWFyIGNvb2tpZXMgbWFudWFsbHkgaWYgbmVlZGVkLlwiXG4gICAgICApO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInVzZXJcIik7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2xvZ2luXCI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZGlzcGxheVVzZXJEYXRhKCkge1xuICAgIGNvbnN0IHVzZXJEYXRhU3RyaW5nID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ1c2VyXCIpO1xuICAgIGlmICghdXNlckRhdGFTdHJpbmcpIHJldHVybiBsb2dvdXQoKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdXNlckRhdGEgPSBKU09OLnBhcnNlKHVzZXJEYXRhU3RyaW5nKTtcbiAgICAgIGNvbnN0IHVzZXJOYW1lID0gdXNlckRhdGEubmFtZSB8fCBcIlVzZXJcIjtcbiAgICAgIGNvbnN0IHVzZXJOYW1lRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlci1uYW1lLWRpc3BsYXlcIik7XG4gICAgICBpZiAodXNlck5hbWVEaXNwbGF5KSB1c2VyTmFtZURpc3BsYXkudGV4dENvbnRlbnQgPSB1c2VyTmFtZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiSW52YWxpZCB1c2VyIGRhdGEgaW4gbG9jYWxTdG9yYWdlLlwiKTtcbiAgICAgIGxvZ291dCgpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IGxvZ291dCwgZGlzcGxheVVzZXJEYXRhIH07XG59KSgpO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4vbW9kdWxlcy91c2VyLmpzXCI7XG5pbXBvcnQgeyBBdXRoIH0gZnJvbSBcIi4vbW9kdWxlcy9hdXRoLmpzXCI7XG5pbXBvcnQgeyBUb2RvIH0gZnJvbSBcIi4vbW9kdWxlcy9jYWxlbmRhci5qc1wiO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09IFwiL2FwcFwiKSB7XG4gICAgVXNlci5kaXNwbGF5VXNlckRhdGEoKTtcbiAgfVxuICBjb25zdCBsb2dvdXRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1sb2dvdXRcIik7XG4gIGlmIChsb2dvdXRCdG4pIGxvZ291dEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgVXNlci5sb2dvdXQpO1xuXG4gIGNvbnNvbGUubG9nKFwiTWFpbiBhcHAgaW5pdGlhbGl6ZWQuXCIpO1xufSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=