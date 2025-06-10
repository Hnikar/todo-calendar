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
    createTask: (task) => {
      const { priority, ...rest } = task;
      return handleRequest("/events", "POST", rest);
    },
    updateTask: (id, task) => {
      const { priority, ...rest } = task;
      return handleRequest(`/events/${id}`, "PUT", rest);
    },
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
              updatedData
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
        const newTask = await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.createTask(data);
        allTasks.push(newTask);
        calendar.addEvent(newTask);
        return newTask;
      }

      async function updateTask(data) {
        const updatedTask = await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.updateTask(data.id, data);
        // Ensure allTasks has only one event per ID (replace old with new)
        allTasks = [
          ...allTasks.filter((t) => t.id !== updatedTask.id),
          updatedTask,
        ];
        currentEditingTask.remove();
        calendar.addEvent(updatedTask);
        return updatedTask;
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
            <span class="category-color" style="background-color: ${category.color};"></span> 
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7O0FBQXFDO0FBQ0k7O0FBRWxDO0FBQ1A7O0FBRUE7QUFDQTtBQUNBLE1BQU0sOENBQU07QUFDWixzQ0FBc0MsU0FBUyxFQUFFLElBQUk7QUFDckQ7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ04sTUFBTSxrREFBUTtBQUNkO0FBQ0EsTUFBTTtBQUNOLE1BQU0sOENBQU07QUFDWjtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsb0JBQW9CO0FBQ2xDO0FBQ0EsS0FBSztBQUNMO0FBQ0EsY0FBYyxvQkFBb0I7QUFDbEMsc0NBQXNDLEdBQUc7QUFDekMsS0FBSztBQUNMLGlEQUFpRCxHQUFHO0FBQ3BEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx5REFBeUQsR0FBRztBQUM1RDtBQUNBLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUN0RHdDOztBQUVsQztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxHQUFHOztBQUVIO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsSUFBSSxrREFBUTtBQUNaOztBQUVBO0FBQ0E7QUFDQSxJQUFJLGtEQUFROztBQUVaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSxPQUFPO0FBQ1A7QUFDQSxNQUFNO0FBQ04sTUFBTSxrREFBUTtBQUNkO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTs7QUFFVjtBQUNBLDhDQUE4QyxnQkFBZ0I7O0FBRTlEO0FBQ0EsaUVBQWlFO0FBQ2pFO0FBQ0EsTUFBTTtBQUNOLE1BQU0sa0RBQVE7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1A7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9DQUFvQyxrREFBUTtBQUM1QztBQUNBOztBQUVBLFdBQVc7QUFDWCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7OztBQ3RJd0M7QUFDSTs7QUFFdEM7QUFDUDtBQUNBO0FBQ0EscUJBQXFCOztBQUVyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwyQkFBMkIsbURBQW1EO0FBQzlFLDJCQUEyQixtREFBbUQ7QUFDOUU7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSx3QkFBd0Isa0RBQVE7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzREFBc0QsVUFBVTtBQUNoRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0JBQXdCLEtBQUssR0FBRyxHQUFHLEdBQUcsR0FBRyxHQUFHLEdBQUcsR0FBRyxJQUFJO0FBQ3REOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCO0FBQ2hCO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esc0NBQXNDLHNEQUFVO0FBQ2hEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFlBQVk7QUFDWjtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1gsU0FBUztBQUNULE9BQU87O0FBRVA7QUFDQTtBQUNBO0FBQ0EsOEJBQThCLHNEQUFVO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYLFVBQVU7QUFDVjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSw0Q0FBNEMsVUFBVSxvQkFBb0I7QUFDMUU7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1gsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsNENBQTRDLFVBQVUsb0JBQW9CO0FBQzFFO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRDQUE0QyxVQUFVLGlCQUFpQjtBQUN2RTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWCxTQUFTO0FBQ1Q7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGFBQWE7QUFDYjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFdBQVc7QUFDWCxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTtBQUNBLHFEQUFxRDtBQUNyRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFZO0FBQ1o7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSxpQ0FBaUMsS0FBSyxHQUFHLFVBQVU7QUFDbkQsNkJBQTZCLEtBQUssR0FBRyxRQUFRO0FBQzdDOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxXQUFXO0FBQ1g7QUFDQTs7QUFFQTtBQUNBLDhCQUE4QixzREFBVTtBQUN4QztBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBLGtDQUFrQyxzREFBVTtBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsc0RBQVU7QUFDeEI7QUFDQTtBQUNBLDBDQUEwQyxRQUFRO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBO0FBQ0EsQ0FBQzs7Ozs7Ozs7Ozs7Ozs7OztBQ2xtQjRDOztBQUV0QztBQUNQO0FBQ0EsNkJBQTZCOztBQUU3QjtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esb0VBQW9FLGdCQUFnQjtBQUNwRiwwQ0FBMEMsY0FBYztBQUN4RDtBQUNBLHlEQUF5RCxZQUFZO0FBQ3JFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsV0FBVztBQUNYO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBc0IseUJBQXlCO0FBQy9DLFdBQVc7QUFDWDtBQUNBLE9BQU87QUFDUDtBQUNBLEtBQUs7O0FBRUw7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTDs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGNBQWMsc0RBQVU7QUFDeEI7QUFDQTtBQUNBO0FBQ0E7QUFDQSxRQUFRO0FBQ1I7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsNkJBQTZCLHNEQUFVO0FBQ3ZDO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPOztBQUVQO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSwwREFBMEQsYUFBYTtBQUN2RTtBQUNBLHNDQUFzQyxzREFBVTtBQUNoRDtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsWUFBWTtBQUNaO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsT0FBTzs7QUFFUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0RBQWtELFVBQVUsa0JBQWtCO0FBQzlFO0FBQ0EsV0FBVztBQUNYO0FBQ0EsT0FBTztBQUNQLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7QUM3TE07QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE9BQU87QUFDUDs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLOztBQUVMO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPO0FBQ1AsS0FBSztBQUNMOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7Ozs7Ozs7Ozs7Ozs7OztBQzlETTtBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsUUFBUTtBQUNSO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTLFFBQVE7QUFDakI7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsV0FBVztBQUNYLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7QUM3QndDOztBQUVsQztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUIsNEJBQTRCO0FBQy9DLE9BQU87O0FBRVAsd0RBQXdEO0FBQ3hEO0FBQ0E7QUFDQSxzREFBc0QsZ0JBQWdCO0FBQ3RFO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNLGtEQUFRO0FBQ2Q7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFdBQVc7QUFDWCxDQUFDOzs7Ozs7O1VDM0NEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7OztBQ055QztBQUNBO0FBQ0k7O0FBRTdDO0FBQ0E7QUFDQSxJQUFJLGtEQUFJO0FBQ1I7QUFDQTtBQUNBLHFEQUFxRCxrREFBSTs7QUFFekQ7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvYXBpU2VydmljZS5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9hdXRoLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2NhbGVuZGFyLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2NhdGVnb3J5LmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2RvbVV0aWxzLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2xvYWRlci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy91c2VyLmpzIiwid2VicGFjazovL3N0YXRpYy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3N0YXRpYy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3N0YXRpYy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMb2FkZXIgfSBmcm9tIFwiLi9sb2FkZXIuanNcIjtcbmltcG9ydCB7IERvbVV0aWxzIH0gZnJvbSBcIi4vZG9tVXRpbHMuanNcIjtcblxuZXhwb3J0IGNvbnN0IEFwaVNlcnZpY2UgPSAoKCkgPT4ge1xuICBjb25zdCBBUElfQkFTRSA9IFwiL2FwaVwiO1xuXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlcXVlc3QodXJsLCBtZXRob2QsIGRhdGEpIHtcbiAgICB0cnkge1xuICAgICAgTG9hZGVyLnRvZ2dsZSh0cnVlKTtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7QVBJX0JBU0V9JHt1cmx9YCwge1xuICAgICAgICBtZXRob2QsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgfSxcbiAgICAgICAgY3JlZGVudGlhbHM6IFwiaW5jbHVkZVwiLFxuICAgICAgICBib2R5OiBkYXRhID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiB1bmRlZmluZWQsXG4gICAgICB9KTtcblxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvbG9naW4/cmVhc29uPXVuYXV0aGVudGljYXRlZFwiO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3BvbnNlRGF0YS5lcnJvciB8fCBcIlJlcXVlc3QgZmFpbGVkXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgRG9tVXRpbHMuc2hvd0Vycm9yKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIExvYWRlci50b2dnbGUoZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgLy8gVGFzay1yZWxhdGVkIGVuZHBvaW50c1xuICAgIGNyZWF0ZVRhc2s6ICh0YXNrKSA9PiB7XG4gICAgICBjb25zdCB7IHByaW9yaXR5LCAuLi5yZXN0IH0gPSB0YXNrO1xuICAgICAgcmV0dXJuIGhhbmRsZVJlcXVlc3QoXCIvZXZlbnRzXCIsIFwiUE9TVFwiLCByZXN0KTtcbiAgICB9LFxuICAgIHVwZGF0ZVRhc2s6IChpZCwgdGFzaykgPT4ge1xuICAgICAgY29uc3QgeyBwcmlvcml0eSwgLi4ucmVzdCB9ID0gdGFzaztcbiAgICAgIHJldHVybiBoYW5kbGVSZXF1ZXN0KGAvZXZlbnRzLyR7aWR9YCwgXCJQVVRcIiwgcmVzdCk7XG4gICAgfSxcbiAgICBkZWxldGVUYXNrOiAoaWQpID0+IGhhbmRsZVJlcXVlc3QoYC9ldmVudHMvJHtpZH1gLCBcIkRFTEVURVwiKSxcbiAgICBmZXRjaFRhc2tzOiAoKSA9PiBoYW5kbGVSZXF1ZXN0KFwiL2V2ZW50c1wiLCBcIkdFVFwiKSxcbiAgICAvLyBDYXRlZ29yeS1yZWxhdGVkIGVuZHBvaW50c1xuICAgIGNyZWF0ZUNhdGVnb3J5OiAoY2F0ZWdvcnkpID0+XG4gICAgICBoYW5kbGVSZXF1ZXN0KFwiL2NhdGVnb3JpZXNcIiwgXCJQT1NUXCIsIGNhdGVnb3J5KSxcbiAgICBmZXRjaENhdGVnb3JpZXM6ICgpID0+IGhhbmRsZVJlcXVlc3QoXCIvY2F0ZWdvcmllc1wiLCBcIkdFVFwiKSxcbiAgICBkZWxldGVDYXRlZ29yeTogKGlkKSA9PiBoYW5kbGVSZXF1ZXN0KGAvY2F0ZWdvcmllcy8ke2lkfWAsIFwiREVMRVRFXCIpLFxuICB9O1xufSkoKTtcbiIsImltcG9ydCB7IERvbVV0aWxzIH0gZnJvbSBcIi4vZG9tVXRpbHMuanNcIjtcblxuZXhwb3J0IGNvbnN0IEF1dGggPSAoKCkgPT4ge1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvbG9naW5cIikge1xuICAgICAgaW5pdCgpO1xuICAgICAgY2hlY2tSZWRpcmVjdFJlYXNvbigpO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdXRoRm9ybVwiKTtcbiAgICBpZiAoIWZvcm0pIHJldHVybiBjb25zb2xlLmVycm9yKFwiQXV0aCBmb3JtIG5vdCBmb3VuZCFcIik7XG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgaGFuZGxlU3VibWl0KTtcbiAgICBzd2l0Y2hNb2RlKFwibG9naW5cIik7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLW1vZGVdXCIpLmZvckVhY2goKHRhYikgPT5cbiAgICAgIHRhYi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICBzd2l0Y2hNb2RlKHRhYi5kYXRhc2V0Lm1vZGUpO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gc3dpdGNoTW9kZShtb2RlKSB7XG4gICAgY29uc3QgbmFtZUZpZWxkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmllbGRcIik7XG4gICAgY29uc3Qgc3VibWl0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2F1dGhGb3JtIGJ1dHRvblt0eXBlPVwic3VibWl0XCJdJyk7XG4gICAgY29uc3QgcGFzc3dvcmRJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFzc3dvcmRcIik7XG4gICAgY29uc3QgdGFicyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGFiXCIpO1xuXG4gICAgaWYgKG5hbWVGaWVsZCkge1xuICAgICAgbmFtZUZpZWxkLnN0eWxlLmRpc3BsYXkgPSBtb2RlID09PSBcInJlZ2lzdGVyXCIgPyBcImJsb2NrXCIgOiBcIm5vbmVcIjtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZVwiKS5yZXF1aXJlZCA9IG1vZGUgPT09IFwicmVnaXN0ZXJcIjtcbiAgICB9XG4gICAgdGFicy5mb3JFYWNoKCh0YWIpID0+XG4gICAgICB0YWIuY2xhc3NMaXN0LnRvZ2dsZShcImFjdGl2ZVwiLCB0YWIuZGF0YXNldC5tb2RlID09PSBtb2RlKVxuICAgICk7XG4gICAgaWYgKHN1Ym1pdEJ0bilcbiAgICAgIHN1Ym1pdEJ0bi50ZXh0Q29udGVudCA9IG1vZGUgPT09IFwibG9naW5cIiA/IFwiTG9naW5cIiA6IFwiUmVnaXN0ZXJcIjtcbiAgICBpZiAocGFzc3dvcmRJbnB1dClcbiAgICAgIHBhc3N3b3JkSW5wdXQuYXV0b2NvbXBsZXRlID1cbiAgICAgICAgbW9kZSA9PT0gXCJsb2dpblwiID8gXCJjdXJyZW50LXBhc3N3b3JkXCIgOiBcIm5ldy1wYXNzd29yZFwiO1xuXG4gICAgRG9tVXRpbHMuY2xlYXJNZXNzYWdlcygpO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3VibWl0KGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgRG9tVXRpbHMuY2xlYXJNZXNzYWdlcygpO1xuXG4gICAgY29uc3QgaXNMb2dpbiA9IGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvcignW2RhdGEtbW9kZT1cImxvZ2luXCJdJylcbiAgICAgIC5jbGFzc0xpc3QuY29udGFpbnMoXCJhY3RpdmVcIik7XG4gICAgY29uc3QgdXJsID0gaXNMb2dpbiA/IFwiL2FwaS9sb2dpblwiIDogXCIvYXBpL3JlZ2lzdGVyXCI7XG4gICAgY29uc3QgZm9ybURhdGEgPSB7XG4gICAgICBlbWFpbDogZ2V0VmFsKFwiZW1haWxcIiksXG4gICAgICBwYXNzd29yZDogZ2V0VmFsKFwicGFzc3dvcmRcIiksXG4gICAgfTtcblxuICAgIGlmICghaXNMb2dpbikgZm9ybURhdGEubmFtZSA9IGdldFZhbChcIm5hbWVcIik7XG5cbiAgICB0cnkge1xuICAgICAgdmFsaWRhdGUoZm9ybURhdGEsIGlzTG9naW4pO1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICAgIEFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KGZvcm1EYXRhKSxcbiAgICAgIH0pO1xuICAgICAgYXdhaXQgaGFuZGxlUmVzcG9uc2UocmVzcG9uc2UsIGlzTG9naW4pO1xuICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgRG9tVXRpbHMuc2hvd0Vycm9yKGVyci5tZXNzYWdlIHx8IFwiVW5leHBlY3RlZCBlcnJvciBkdXJpbmcgc3VibWlzc2lvbi5cIik7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0VmFsKGlkKSB7XG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgcmV0dXJuIGVsID8gZWwudmFsdWUudHJpbSgpIDogXCJcIjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlKGRhdGEsIGlzTG9naW4pIHtcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBjb25zdCBlbWFpbFJlZ2V4ID0gL15bXlxcc0BdK0BbXlxcc0BdK1xcLlteXFxzQF0rJC87XG5cbiAgICBpZiAoIWRhdGEuZW1haWwpIGVycm9ycy5wdXNoKFwiRW1haWwgaXMgcmVxdWlyZWQuXCIpO1xuICAgIGVsc2UgaWYgKCFlbWFpbFJlZ2V4LnRlc3QoZGF0YS5lbWFpbCkpIGVycm9ycy5wdXNoKFwiSW52YWxpZCBlbWFpbCBmb3JtYXQuXCIpO1xuICAgIGlmICghZGF0YS5wYXNzd29yZCkgZXJyb3JzLnB1c2goXCJQYXNzd29yZCBpcyByZXF1aXJlZC5cIik7XG4gICAgZWxzZSBpZiAoZGF0YS5wYXNzd29yZC5sZW5ndGggPCA4ICYmICFpc0xvZ2luKVxuICAgICAgZXJyb3JzLnB1c2goXCJQYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycy5cIik7XG4gICAgaWYgKCFpc0xvZ2luICYmICghZGF0YS5uYW1lIHx8IGRhdGEubmFtZS5sZW5ndGggPCAyKSlcbiAgICAgIGVycm9ycy5wdXNoKFwiTmFtZSBtdXN0IGJlIGF0IGxlYXN0IDIgY2hhcmFjdGVycy5cIik7XG5cbiAgICBpZiAoZXJyb3JzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKGVycm9ycy5qb2luKFwiXFxuXCIpKTtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlc3BvbnNlLCBpc0xvZ2luKSB7XG4gICAgY29uc3QgaXNKc29uID0gcmVzcG9uc2UuaGVhZGVyc1xuICAgICAgLmdldChcImNvbnRlbnQtdHlwZVwiKVxuICAgICAgPy5pbmNsdWRlcyhcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgY29uc3QgZGF0YSA9IGlzSnNvblxuICAgICAgPyBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICAgIDogeyBtZXNzYWdlOiBhd2FpdCByZXNwb25zZS50ZXh0KCkgfTtcblxuICAgIGlmICghcmVzcG9uc2Uub2spXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5lcnJvciB8fCBgRXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuXG4gICAgaWYgKGlzTG9naW4pIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidXNlclwiLCBKU09OLnN0cmluZ2lmeShkYXRhLnVzZXIgfHwge30pKTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvYXBwXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIERvbVV0aWxzLnNob3dTdWNjZXNzKFxuICAgICAgICBkYXRhLm1lc3NhZ2UgfHwgXCJSZWdpc3RyYXRpb24gc3VjY2Vzc2Z1bC4gUGxlYXNlIGxvZ2luLlwiXG4gICAgICApO1xuICAgICAgc3dpdGNoTW9kZShcImxvZ2luXCIpO1xuICAgICAgW1wiZW1haWxcIiwgXCJwYXNzd29yZFwiLCBcIm5hbWVcIl0uZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgICAgIGlmIChlbCkgZWwudmFsdWUgPSBcIlwiO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tSZWRpcmVjdFJlYXNvbigpIHtcbiAgICBjb25zdCByZWFzb24gPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGxvY2F0aW9uLnNlYXJjaCkuZ2V0KFwicmVhc29uXCIpO1xuICAgIGNvbnN0IG1lc3NhZ2VzID0ge1xuICAgICAgdW5hdXRoZW50aWNhdGVkOiBcIlBsZWFzZSBsb2cgaW4gdG8gYWNjZXNzIHRoZSBhcHBsaWNhdGlvbi5cIixcbiAgICAgIGludmFsaWRfdG9rZW46IFwiU2Vzc2lvbiBleHBpcmVkLiBQbGVhc2UgbG9nIGluIGFnYWluLlwiLFxuICAgICAgYmFkX3Rva2VuX2NsYWltczogXCJTZXNzaW9uIGRhdGEgaXNzdWUuIFBsZWFzZSBsb2cgaW4gYWdhaW4uXCIsXG4gICAgfTtcbiAgICBpZiAocmVhc29uICYmIG1lc3NhZ2VzW3JlYXNvbl0pIERvbVV0aWxzLnNob3dFcnJvcihtZXNzYWdlc1tyZWFzb25dKTtcbiAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZShudWxsLCBcIlwiLCBsb2NhdGlvbi5wYXRobmFtZSk7XG4gIH1cblxuICByZXR1cm4geyBpbml0IH07XG59KSgpO1xuIiwiaW1wb3J0IHsgQ2F0ZWdvcnkgfSBmcm9tIFwiLi9jYXRlZ29yeS5qc1wiO1xuaW1wb3J0IHsgQXBpU2VydmljZSB9IGZyb20gXCIuL2FwaVNlcnZpY2UuanNcIjtcblxuZXhwb3J0IGNvbnN0IFRvZG8gPSAoKCkgPT4ge1xuICBsZXQgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcbiAgbGV0IGlzRWRpdGluZyA9IGZhbHNlO1xuICBsZXQgYWxsVGFza3MgPSBbXTsgLy8gU3RvcmUgYWxsIHRhc2tzIGZvciBmaWx0ZXJpbmdcblxuICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9hcHBcIikge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhc2stZm9ybVwiKTtcbiAgICAgIGNvbnN0IGZvcm1IZWFkaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb3JtLWhlYWRpbmdcIik7XG4gICAgICBjb25zdCBzdWJtaXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1Ym1pdC1idXR0b25cIik7XG4gICAgICBjb25zdCBkZWxldGVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbGV0ZS1idXR0b25cIik7XG4gICAgICBjb25zdCBjYW5jZWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbmNlbC1idXR0b25cIik7XG4gICAgICBjb25zdCBhZGRUYXNrQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG4tYWRkLXRhc2tcIik7XG4gICAgICBjb25zdCBhbGxEYXlDaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWxsRGF5XCIpO1xuICAgICAgY29uc3QgdGltZUlucHV0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGltZUlucHV0c1wiKTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XG4gICAgICBjb25zdCBjbG9zZVRhc2tGb3JtQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjbG9zZS10YXNrLWZvcm1cIik7XG4gICAgICBjb25zdCBidG5DYWxlbmRhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLWNhbGVuZGFyXCIpO1xuICAgICAgY29uc3QgYnRuVXBjb21pbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi11cGNvbWluZ1wiKTtcbiAgICAgIGNvbnN0IGJ0blRvZGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG4tdG9kYXlcIik7XG5cbiAgICAgIC8vIEhlbHBlciB0byBzaG93L2hpZGUgZm9ybSBhbmQgYmFja2Ryb3BcbiAgICAgIGZ1bmN0aW9uIHNob3dGb3JtKCkge1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC5hZGQoXCJ2aXNpYmxlXCIpO1xuICAgICAgICBjb250ZW50LmNsYXNzTGlzdC5hZGQoXCJmb3JtLW9wZW5cIik7XG4gICAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgLy8gQWx3YXlzIGVuYWJsZSB0aW1lIGlucHV0cyBvbiBmb3JtIG9wZW5cbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFRpbWVcIikuZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGZvcm0uZm9jdXMgJiYgZm9ybS5mb2N1cygpO1xuICAgICAgICB9LCAwKTtcbiAgICAgIH1cbiAgICAgIGZ1bmN0aW9uIGhpZGVGb3JtKCkge1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC5yZW1vdmUoXCJ2aXNpYmxlXCIpO1xuICAgICAgICBjb250ZW50LmNsYXNzTGlzdC5yZW1vdmUoXCJmb3JtLW9wZW5cIik7XG4gICAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICBpZiAoYWRkVGFza0J1dHRvbikgYWRkVGFza0J1dHRvbi5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgfVxuXG4gICAgICAvLyBUb2dnbGUgdGltZSBpbnB1dHMgYmFzZWQgb24gQWxsIERheSBjaGVja2JveFxuICAgICAgYWxsRGF5Q2hlY2tib3guYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgIGNvbnN0IGlzQWxsRGF5ID0gYWxsRGF5Q2hlY2tib3guY2hlY2tlZDtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFRpbWVcIikuZGlzYWJsZWQgPSBpc0FsbERheTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLmRpc2FibGVkID0gaXNBbGxEYXk7XG4gICAgICAgIGlmIChpc0FsbERheSkge1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLnZhbHVlID0gXCJcIjtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuZFRpbWVcIikudmFsdWUgPSBcIlwiO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gQ2FsZW5kYXIgaW5pdGlhbGl6YXRpb25cbiAgICAgIGNvbnN0IGNhbGVuZGFyRWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbGVuZGFyXCIpO1xuXG4gICAgICAvLyBIaWRlIGhlYWRlciBpbW1lZGlhdGVseSBiZWZvcmUgY2FsZW5kYXIgaXMgcmVuZGVyZWRcbiAgICAgIGZ1bmN0aW9uIHByZUhpZGVIZWFkZXIoKSB7XG4gICAgICAgIC8vIEhpZGUgaGVhZGVyIGFuZCBjYWxlbmRhciBjb250YWluZXIgYmVmb3JlIHJlbmRlciB0byBhdm9pZCBsYXlvdXQgZmxhc2hcbiAgICAgICAgY29uc3QgZmNIZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmZjLWhlYWRlci10b29sYmFyXCIpO1xuICAgICAgICBpZiAoZmNIZWFkZXIpIGZjSGVhZGVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgaWYgKGNhbGVuZGFyRWwpIGNhbGVuZGFyRWwuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgICB9XG4gICAgICBwcmVIaWRlSGVhZGVyKCk7XG5cbiAgICAgIGNvbnN0IGNhbGVuZGFyID0gbmV3IEZ1bGxDYWxlbmRhci5DYWxlbmRhcihjYWxlbmRhckVsLCB7XG4gICAgICAgIGluaXRpYWxWaWV3OiBcImRheUdyaWRNb250aFwiLFxuICAgICAgICBlZGl0YWJsZTogdHJ1ZSxcbiAgICAgICAgc2VsZWN0YWJsZTogZmFsc2UsXG4gICAgICAgIHNlbGVjdE1pcnJvcjogdHJ1ZSxcbiAgICAgICAgZGF5TWF4RXZlbnRzOiB0cnVlLFxuICAgICAgICBldmVudHM6IFtdLFxuICAgICAgICBldmVudFRpbWVGb3JtYXQ6IHsgaG91cjogXCIyLWRpZ2l0XCIsIG1pbnV0ZTogXCIyLWRpZ2l0XCIsIGhvdXIxMjogZmFsc2UgfSwgLy8gMjQtaG91ciBmb3JtYXQgZm9yIGV2ZW50IHRpbWVzXG4gICAgICAgIHNsb3RMYWJlbEZvcm1hdDogeyBob3VyOiBcIjItZGlnaXRcIiwgbWludXRlOiBcIjItZGlnaXRcIiwgaG91cjEyOiBmYWxzZSB9LCAvLyAyNC1ob3VyIGZvcm1hdCBmb3IgdGltZSBheGlzIGluIHRpbWVHcmlkIHZpZXdzXG4gICAgICAgIC8vIFNob3cgY3VzdG9tIG1lc3NhZ2Ugd2hlbiBubyBldmVudHNcbiAgICAgICAgbm9FdmVudHNDb250ZW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgcmV0dXJuIFwiTm8gdGFza3MgdG8gZGlzcGxheVwiO1xuICAgICAgICB9LFxuICAgICAgICAvLyBQcmV2ZW50IGRyYWdnaW5nIGFsbC1kYXkgZXZlbnRzIGluIHdlZWsgKGxpc3RXZWVrKSBhbmQgdG9kYXkgKHRpbWVHcmlkRGF5KSB2aWV3c1xuICAgICAgICBldmVudEFsbG93OiBmdW5jdGlvbiAoZHJvcEluZm8sIGRyYWdnZWRFdmVudCkge1xuICAgICAgICAgIGNvbnN0IHZpZXdUeXBlID0gY2FsZW5kYXIudmlldyA/IGNhbGVuZGFyLnZpZXcudHlwZSA6IFwiXCI7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgKHZpZXdUeXBlID09PSBcImxpc3RXZWVrXCIgfHwgdmlld1R5cGUgPT09IFwidGltZUdyaWREYXlcIikgJiZcbiAgICAgICAgICAgIGRyYWdnZWRFdmVudC5hbGxEYXlcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0sXG4gICAgICAgIGV2ZW50Q2xpY2s6IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gaW5mby5ldmVudDtcbiAgICAgICAgICBpc0VkaXRpbmcgPSB0cnVlO1xuICAgICAgICAgIHBvcHVsYXRlRm9ybShpbmZvLmV2ZW50KTtcbiAgICAgICAgICB1cGRhdGVGb3JtVUkoKTtcbiAgICAgICAgICBzaG93Rm9ybSgpO1xuICAgICAgICB9LFxuICAgICAgICBldmVudERpZE1vdW50OiBmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICAgIGNvbnN0IGlzQ29tcGxldGVkID0gaW5mby5ldmVudC5leHRlbmRlZFByb3BzLmNvbXBsZXRlZDtcbiAgICAgICAgICBpZiAoaXNDb21wbGV0ZWQpIHtcbiAgICAgICAgICAgIGluZm8uZWwuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCIjZDNkM2QzXCI7XG4gICAgICAgICAgICBpbmZvLmVsLnN0eWxlLnRleHREZWNvcmF0aW9uID0gXCJsaW5lLXRocm91Z2hcIjtcbiAgICAgICAgICAgIGluZm8uZWwuc3R5bGUub3BhY2l0eSA9IFwiMC43XCI7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQXBwbHkgY2F0ZWdvcnkgY29sb3IgdG8gdGhlIHdob2xlIGV2ZW50IGJvZHlcbiAgICAgICAgICBjb25zdCBjYXRlZ29yeSA9IGluZm8uZXZlbnQuZXh0ZW5kZWRQcm9wcy5jYXRlZ29yeTtcbiAgICAgICAgICBpZiAoY2F0ZWdvcnkgJiYgY2F0ZWdvcnkgIT09IFwiTm9uZVwiKSB7XG4gICAgICAgICAgICBjb25zdCBjYXQgPSBDYXRlZ29yeS5nZXRDYXRlZ29yaWVzKCkuZmluZChcbiAgICAgICAgICAgICAgKGMpID0+IGMubmFtZSA9PT0gY2F0ZWdvcnlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBpZiAoY2F0KSB7XG4gICAgICAgICAgICAgIGluZm8uZWwuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gY2F0LmNvbG9yO1xuICAgICAgICAgICAgICBpbmZvLmVsLnN0eWxlLmJvcmRlckxlZnQgPSBgNHB4IHNvbGlkICR7Y2F0LmNvbG9yfWA7XG4gICAgICAgICAgICAgIC8vIEZvciBsaXN0IHZpZXdzLCBhbHNvIHNldCBjb2xvciBmb3IgLmZjLWxpc3QtZXZlbnQtZG90IGlmIHByZXNlbnRcbiAgICAgICAgICAgICAgY29uc3QgZG90ID0gaW5mby5lbC5xdWVyeVNlbGVjdG9yKFwiLmZjLWxpc3QtZXZlbnQtZG90XCIpO1xuICAgICAgICAgICAgICBpZiAoZG90KSBkb3Quc3R5bGUuYmFja2dyb3VuZENvbG9yID0gY2F0LmNvbG9yO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmZvLmVsLnN0eWxlLmJvcmRlckxlZnQgPSBcIjRweCBzb2xpZCB0cmFuc3BhcmVudFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXZlbnREcm9wOiBhc3luYyBmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBldmVudCA9IGluZm8uZXZlbnQ7XG4gICAgICAgICAgICBsZXQgc3RhcnQgPSBldmVudC5zdGFydDtcbiAgICAgICAgICAgIGxldCBlbmQgPSBldmVudC5lbmQ7XG5cbiAgICAgICAgICAgIC8vIEZvcm1hdCBzdGFydCBhbmQgZW5kIGFzICdZWVlZLU1NLUREVEhIOm1tJ1xuICAgICAgICAgICAgZnVuY3Rpb24gZm9ybWF0RGF0ZVRpbWUoZHQpIHtcbiAgICAgICAgICAgICAgaWYgKCFkdCkgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICAgIC8vIFBhZCBtb250aCwgZGF5LCBob3VyLCBtaW51dGVcbiAgICAgICAgICAgICAgY29uc3QgeXl5eSA9IGR0LmdldEZ1bGxZZWFyKCk7XG4gICAgICAgICAgICAgIGNvbnN0IG1tID0gU3RyaW5nKGR0LmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCBcIjBcIik7XG4gICAgICAgICAgICAgIGNvbnN0IGRkID0gU3RyaW5nKGR0LmdldERhdGUoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuICAgICAgICAgICAgICBjb25zdCBoaCA9IFN0cmluZyhkdC5nZXRIb3VycygpKS5wYWRTdGFydCgyLCBcIjBcIik7XG4gICAgICAgICAgICAgIGNvbnN0IG1pbiA9IFN0cmluZyhkdC5nZXRNaW51dGVzKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGAke3l5eXl9LSR7bW19LSR7ZGR9VCR7aGh9OiR7bWlufWA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBmb3JtYXR0ZWRTdGFydCwgZm9ybWF0dGVkRW5kO1xuXG4gICAgICAgICAgICBpZiAoZXZlbnQuYWxsRGF5KSB7XG4gICAgICAgICAgICAgIC8vIEZvciBhbGxEYXksIHVzZSBkYXRlIG9ubHlcbiAgICAgICAgICAgICAgZm9ybWF0dGVkU3RhcnQgPSBldmVudC5zdGFydFN0ci5zbGljZSgwLCAxMCk7XG4gICAgICAgICAgICAgIGlmIChldmVudC5lbmQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbmREYXRlID0gbmV3IERhdGUoZXZlbnQuZW5kKTtcbiAgICAgICAgICAgICAgICBlbmREYXRlLnNldERhdGUoZW5kRGF0ZS5nZXREYXRlKCkgLSAxKTtcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRFbmQgPSBlbmREYXRlLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvcm1hdHRlZEVuZCA9IGZvcm1hdHRlZFN0YXJ0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBGb3IgdGltZWQgZXZlbnRzLCB1c2UgJ1lZWVktTU0tRERUSEg6bW0nXG4gICAgICAgICAgICAgIGZvcm1hdHRlZFN0YXJ0ID0gZm9ybWF0RGF0ZVRpbWUoc3RhcnQpO1xuICAgICAgICAgICAgICBmb3JtYXR0ZWRFbmQgPSBlbmQgPyBmb3JtYXREYXRlVGltZShlbmQpIDogZm9ybWF0dGVkU3RhcnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWREYXRhID0ge1xuICAgICAgICAgICAgICBpZDogZXZlbnQuaWQsXG4gICAgICAgICAgICAgIHRpdGxlOiBldmVudC50aXRsZSxcbiAgICAgICAgICAgICAgc3RhcnQ6IGZvcm1hdHRlZFN0YXJ0LFxuICAgICAgICAgICAgICBlbmQ6IGZvcm1hdHRlZEVuZCxcbiAgICAgICAgICAgICAgYWxsRGF5OiBldmVudC5hbGxEYXksXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBldmVudC5leHRlbmRlZFByb3BzLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICBjYXRlZ29yeTogZXZlbnQuZXh0ZW5kZWRQcm9wcy5jYXRlZ29yeSxcbiAgICAgICAgICAgICAgY29tcGxldGVkOiBldmVudC5leHRlbmRlZFByb3BzLmNvbXBsZXRlZCxcbiAgICAgICAgICAgICAgY2xhc3NOYW1lOiBldmVudC5jbGFzc05hbWVzXG4gICAgICAgICAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgIChjKSA9PlxuICAgICAgICAgICAgICAgICAgICBjICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgYyAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICBjLnN0YXJ0c1dpdGgoXCJwcmlvcml0eS1cIikgPT09IGZhbHNlXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC5qb2luKFwiIFwiKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVkVGFzayA9IGF3YWl0IEFwaVNlcnZpY2UudXBkYXRlVGFzayhcbiAgICAgICAgICAgICAgZXZlbnQuaWQsXG4gICAgICAgICAgICAgIHVwZGF0ZWREYXRhXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgLy8gRW5zdXJlIGFsbFRhc2tzIGhhcyBvbmx5IG9uZSBldmVudCBwZXIgSUQgKHJlcGxhY2Ugb2xkIHdpdGggbmV3KVxuICAgICAgICAgICAgYWxsVGFza3MgPSBbXG4gICAgICAgICAgICAgIC4uLmFsbFRhc2tzLmZpbHRlcigodCkgPT4gdC5pZCAhPT0gdXBkYXRlZFRhc2suaWQpLFxuICAgICAgICAgICAgICB1cGRhdGVkVGFzayxcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICAvLyBSZW1vdmUgYW5kIHJlLWFkZCB0aGUgZXZlbnQgdG8gZm9yY2UgdXBkYXRlIGluIGFsbCB2aWV3c1xuICAgICAgICAgICAgY29uc3QgY3VycmVudCA9IGNhbGVuZGFyLmdldEV2ZW50QnlJZChldmVudC5pZCk7XG4gICAgICAgICAgICBpZiAoY3VycmVudCkgY3VycmVudC5yZW1vdmUoKTtcbiAgICAgICAgICAgIGNhbGVuZGFyLmFkZEV2ZW50KHVwZGF0ZWRUYXNrKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgaW5mby5yZXZlcnQoKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gdXBkYXRlIGV2ZW50IGFmdGVyIGRyYWc6XCIsIGVycm9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXdEaWRNb3VudDogZnVuY3Rpb24gKGFyZykge1xuICAgICAgICAgIHVwZGF0ZUNhbGVuZGFySGVhZGVyQnV0dG9ucyhhcmcudmlldy50eXBlKTtcbiAgICAgICAgICAvLyBBbHdheXMgZm9yY2UgYSByZXNpemUgYWZ0ZXIgYW55IHZpZXcgY2hhbmdlXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjYWxlbmRhci51cGRhdGVTaXplKCk7XG4gICAgICAgICAgICAvLyBTaG93IGNhbGVuZGFyIGFmdGVyIHJlc2l6ZSB0byBhdm9pZCBmbGFzaFxuICAgICAgICAgICAgaWYgKGNhbGVuZGFyRWwpIGNhbGVuZGFyRWwuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9LFxuICAgICAgfSk7XG5cbiAgICAgIC8vIEZldGNoIHRhc2tzIGZyb20gQVBJIGFuZCByZW5kZXIgY2FsZW5kYXJcbiAgICAgIGFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemVDYWxlbmRhcigpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjb25zdCB0YXNrcyA9IGF3YWl0IEFwaVNlcnZpY2UuZmV0Y2hUYXNrcygpO1xuICAgICAgICAgIGFsbFRhc2tzID0gdGFza3M7XG4gICAgICAgICAgdGFza3MuZm9yRWFjaCgodGFzaykgPT4gY2FsZW5kYXIuYWRkRXZlbnQodGFzaykpO1xuICAgICAgICAgIGNhbGVuZGFyLnJlbmRlcigpO1xuICAgICAgICAgIC8vIEZvcmNlIGNvcnJlY3Qgc2l6ZSBhbmQgc2hvdyBhZnRlciBpbml0aWFsIHJlbmRlclxuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY2FsZW5kYXIudXBkYXRlU2l6ZSgpO1xuICAgICAgICAgICAgaWYgKGNhbGVuZGFyRWwpIGNhbGVuZGFyRWwuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZmV0Y2ggdGFza3M6XCIsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpbml0aWFsaXplQ2FsZW5kYXIoKTtcblxuICAgICAgLy8gU2lkZWJhciBidXR0b24gZXZlbnQgbGlzdGVuZXJzXG4gICAgICBmdW5jdGlvbiBzZXRBY3RpdmVTaWRlYmFyQnV0dG9uKGFjdGl2ZUJ0bikge1xuICAgICAgICBkb2N1bWVudFxuICAgICAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNpZGViYXItYnRuLCAuY2F0ZWdvcnktaXRlbVwiKVxuICAgICAgICAgIC5mb3JFYWNoKChidG4pID0+IHtcbiAgICAgICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICBpZiAoYWN0aXZlQnRuKSBhY3RpdmVCdG4uY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcbiAgICAgIH1cblxuICAgICAgLy8gSGlnaGxpZ2h0IENhbGVuZGFyIGJ1dHRvbiBvbiBsb2FkXG4gICAgICBzZXRBY3RpdmVTaWRlYmFyQnV0dG9uKGJ0bkNhbGVuZGFyKTtcblxuICAgICAgaWYgKGJ0bkNhbGVuZGFyKSB7XG4gICAgICAgIGJ0bkNhbGVuZGFyLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgY2FsZW5kYXIuY2hhbmdlVmlldyhcImRheUdyaWRNb250aFwiKTtcbiAgICAgICAgICBzZXRBY3RpdmVTaWRlYmFyQnV0dG9uKGJ0bkNhbGVuZGFyKTtcbiAgICAgICAgICB1cGRhdGVDYWxlbmRhckhlYWRlckJ1dHRvbnMoXCJkYXlHcmlkTW9udGhcIik7XG4gICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJ2aWV3Q2hhbmdlXCIsIHsgZGV0YWlsOiB7IHZpZXc6IFwiY2FsZW5kYXJcIiB9IH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNhbGVuZGFyLnVwZGF0ZVNpemUoKTtcbiAgICAgICAgICAgIGlmIChjYWxlbmRhckVsKSBjYWxlbmRhckVsLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoYnRuVXBjb21pbmcpIHtcbiAgICAgICAgYnRuVXBjb21pbmcuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICBjYWxlbmRhci5jaGFuZ2VWaWV3KFwibGlzdFdlZWtcIik7XG4gICAgICAgICAgc2V0QWN0aXZlU2lkZWJhckJ1dHRvbihidG5VcGNvbWluZyk7XG4gICAgICAgICAgdXBkYXRlQ2FsZW5kYXJIZWFkZXJCdXR0b25zKFwibGlzdFdlZWtcIik7XG4gICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJ2aWV3Q2hhbmdlXCIsIHsgZGV0YWlsOiB7IHZpZXc6IFwidXBjb21pbmdcIiB9IH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNhbGVuZGFyLnVwZGF0ZVNpemUoKTtcbiAgICAgICAgICAgIGlmIChjYWxlbmRhckVsKSBjYWxlbmRhckVsLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoYnRuVG9kYXkpIHtcbiAgICAgICAgYnRuVG9kYXkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICBjYWxlbmRhci5jaGFuZ2VWaWV3KFwidGltZUdyaWREYXlcIiwgbmV3IERhdGUoKSk7XG4gICAgICAgICAgc2V0QWN0aXZlU2lkZWJhckJ1dHRvbihidG5Ub2RheSk7XG4gICAgICAgICAgdXBkYXRlQ2FsZW5kYXJIZWFkZXJCdXR0b25zKFwidGltZUdyaWREYXlcIik7XG4gICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJ2aWV3Q2hhbmdlXCIsIHsgZGV0YWlsOiB7IHZpZXc6IFwidG9kYXlcIiB9IH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNhbGVuZGFyLnVwZGF0ZVNpemUoKTtcbiAgICAgICAgICAgIGlmIChjYWxlbmRhckVsKSBjYWxlbmRhckVsLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIExpc3RlbiBmb3IgY2F0ZWdvcnkgZmlsdGVyIGV2ZW50XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImNhdGVnb3J5RmlsdGVyXCIsIChlKSA9PiB7XG4gICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gZS5kZXRhaWwuY2F0ZWdvcnk7XG4gICAgICAgIGNhbGVuZGFyLnJlbW92ZUFsbEV2ZW50cygpO1xuICAgICAgICBpZiAoY2F0ZWdvcnkpIHtcbiAgICAgICAgICBjYWxlbmRhci5jaGFuZ2VWaWV3KFwibGlzdFllYXJcIik7XG4gICAgICAgICAgLy8gT25seSBhZGQgdW5pcXVlIGV2ZW50cyBieSBJRFxuICAgICAgICAgIGNvbnN0IGZpbHRlcmVkID0gW107XG4gICAgICAgICAgY29uc3Qgc2VlbiA9IG5ldyBTZXQoKTtcbiAgICAgICAgICBmb3IgKGNvbnN0IHRhc2sgb2YgYWxsVGFza3MpIHtcbiAgICAgICAgICAgIGlmICgodGFzay5jYXRlZ29yeSB8fCBcIk5vbmVcIikgPT09IGNhdGVnb3J5ICYmICFzZWVuLmhhcyh0YXNrLmlkKSkge1xuICAgICAgICAgICAgICBmaWx0ZXJlZC5wdXNoKHRhc2spO1xuICAgICAgICAgICAgICBzZWVuLmFkZCh0YXNrLmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgZmlsdGVyZWQuZm9yRWFjaCgodGFzaykgPT4gY2FsZW5kYXIuYWRkRXZlbnQodGFzaykpO1xuICAgICAgICAgIGRvY3VtZW50XG4gICAgICAgICAgICAucXVlcnlTZWxlY3RvckFsbChcIi5zaWRlYmFyLWJ0biwgLmNhdGVnb3J5LWl0ZW1cIilcbiAgICAgICAgICAgIC5mb3JFYWNoKChidG4pID0+IHtcbiAgICAgICAgICAgICAgYnRuLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICBjb25zdCBjYXRCdG4gPSBBcnJheS5mcm9tKFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5jYXRlZ29yeS1pdGVtXCIpXG4gICAgICAgICAgKS5maW5kKChsaSkgPT4gbGkudGV4dENvbnRlbnQuaW5jbHVkZXMoY2F0ZWdvcnkpKTtcbiAgICAgICAgICBpZiAoY2F0QnRuKSBjYXRCdG4uY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNhbGVuZGFyLnVwZGF0ZVNpemUoKTtcbiAgICAgICAgICAgIGlmIChjYWxlbmRhckVsKSBjYWxlbmRhckVsLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYWxlbmRhci5jaGFuZ2VWaWV3KFwiZGF5R3JpZE1vbnRoXCIpO1xuICAgICAgICAgIC8vIE9ubHkgYWRkIHVuaXF1ZSBldmVudHMgYnkgSURcbiAgICAgICAgICBjb25zdCB1bmlxdWUgPSBbXTtcbiAgICAgICAgICBjb25zdCBzZWVuID0gbmV3IFNldCgpO1xuICAgICAgICAgIGZvciAoY29uc3QgdGFzayBvZiBhbGxUYXNrcykge1xuICAgICAgICAgICAgaWYgKCFzZWVuLmhhcyh0YXNrLmlkKSkge1xuICAgICAgICAgICAgICB1bmlxdWUucHVzaCh0YXNrKTtcbiAgICAgICAgICAgICAgc2Vlbi5hZGQodGFzay5pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIHVuaXF1ZS5mb3JFYWNoKCh0YXNrKSA9PiBjYWxlbmRhci5hZGRFdmVudCh0YXNrKSk7XG4gICAgICAgICAgc2V0QWN0aXZlU2lkZWJhckJ1dHRvbihidG5DYWxlbmRhcik7XG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjYWxlbmRhci51cGRhdGVTaXplKCk7XG4gICAgICAgICAgICBpZiAoY2FsZW5kYXJFbCkgY2FsZW5kYXJFbC5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBFdmVudCBMaXN0ZW5lcnNcbiAgICAgIGlmIChhZGRUYXNrQnV0dG9uKSB7XG4gICAgICAgIGFkZFRhc2tCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICBpc0VkaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xuICAgICAgICAgIGZvcm0ucmVzZXQoKTtcbiAgICAgICAgICBhbGxEYXlDaGVja2JveC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgdGltZUlucHV0cy5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG4gICAgICAgICAgdXBkYXRlRm9ybVVJKCk7XG4gICAgICAgICAgc2hvd0Zvcm0oKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBhc3luYyBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IGZvcm1EYXRhID0gZ2V0Rm9ybURhdGEoKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChpc0VkaXRpbmcpIHtcbiAgICAgICAgICAgIGF3YWl0IHVwZGF0ZVRhc2soZm9ybURhdGEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhd2FpdCBjcmVhdGVUYXNrKGZvcm1EYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZm9ybS5yZXNldCgpO1xuICAgICAgICAgIGFsbERheUNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICB0aW1lSW5wdXRzLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgICB1cGRhdGVGb3JtVUkoKTtcbiAgICAgICAgICBoaWRlRm9ybSgpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gc2F2ZSB0YXNrOlwiLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBkZWxldGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKGN1cnJlbnRFZGl0aW5nVGFzaykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBkZWxldGVUYXNrKGN1cnJlbnRFZGl0aW5nVGFzay5pZCk7IC8vIDwtLSBDYWxscyBkZWxldGVUYXNrLCB3aGljaCB1cGRhdGVzIGFsbFRhc2tzXG4gICAgICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sucmVtb3ZlKCk7XG4gICAgICAgICAgICBmb3JtLnJlc2V0KCk7XG4gICAgICAgICAgICBpc0VkaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzayA9IG51bGw7XG4gICAgICAgICAgICB1cGRhdGVGb3JtVUkoKTtcbiAgICAgICAgICAgIGhpZGVGb3JtKCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZGVsZXRlIHRhc2s6XCIsIGVycm9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjYW5jZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgZm9ybS5yZXNldCgpO1xuICAgICAgICBpc0VkaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcbiAgICAgICAgYWxsRGF5Q2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICB0aW1lSW5wdXRzLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgdXBkYXRlRm9ybVVJKCk7XG4gICAgICAgIGhpZGVGb3JtKCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gQWRkIGNsb3NlIChjcm9zcykgYnV0dG9uIGhhbmRsZXJcbiAgICAgIGlmIChjbG9zZVRhc2tGb3JtQnRuKSB7XG4gICAgICAgIGNsb3NlVGFza0Zvcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICBmb3JtLnJlc2V0KCk7XG4gICAgICAgICAgaXNFZGl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcbiAgICAgICAgICBhbGxEYXlDaGVja2JveC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgdGltZUlucHV0cy5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG4gICAgICAgICAgdXBkYXRlRm9ybVVJKCk7XG4gICAgICAgICAgaGlkZUZvcm0oKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEhpZGUgZm9ybSBvbiBjbGljayBvdXRzaWRlXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChlKSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBmb3JtLmNsYXNzTGlzdC5jb250YWlucyhcInZpc2libGVcIikgJiZcbiAgICAgICAgICAhZm9ybS5jb250YWlucyhlLnRhcmdldCkgJiZcbiAgICAgICAgICAhKGFkZFRhc2tCdXR0b24gJiYgYWRkVGFza0J1dHRvbi5jb250YWlucyhlLnRhcmdldCkpXG4gICAgICAgICkge1xuICAgICAgICAgIGZvcm0ucmVzZXQoKTtcbiAgICAgICAgICBpc0VkaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xuICAgICAgICAgIGFsbERheUNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICB0aW1lSW5wdXRzLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgICB1cGRhdGVGb3JtVUkoKTtcbiAgICAgICAgICBoaWRlRm9ybSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gSGlkZSBmb3JtIGluaXRpYWxseVxuICAgICAgaGlkZUZvcm0oKTtcblxuICAgICAgLy8gSGVscGVyIGZ1bmN0aW9uc1xuICAgICAgZnVuY3Rpb24gdXBkYXRlRm9ybVVJKCkge1xuICAgICAgICBpZiAoaXNFZGl0aW5nKSB7XG4gICAgICAgICAgZm9ybUhlYWRpbmcudGV4dENvbnRlbnQgPSBcIkVkaXQgVGFza1wiO1xuICAgICAgICAgIHN1Ym1pdEJ1dHRvbi50ZXh0Q29udGVudCA9IFwiU2F2ZSBDaGFuZ2VzXCI7XG4gICAgICAgICAgZGVsZXRlQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XG4gICAgICAgICAgY2FuY2VsQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XG4gICAgICAgICAgaWYgKGFkZFRhc2tCdXR0b24pIGFkZFRhc2tCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvcm1IZWFkaW5nLnRleHRDb250ZW50ID0gXCJBZGQgTmV3IFRhc2tcIjtcbiAgICAgICAgICBzdWJtaXRCdXR0b24udGV4dENvbnRlbnQgPSBcIkFkZCBUYXNrXCI7XG4gICAgICAgICAgZGVsZXRlQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgY2FuY2VsQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgaWYgKGFkZFRhc2tCdXR0b24pIGFkZFRhc2tCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBwb3B1bGF0ZUZvcm0oZXZlbnQpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXRsZVwiKS52YWx1ZSA9IGV2ZW50LnRpdGxlO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhc2tEYXRlXCIpLnZhbHVlID0gZXZlbnQuc3RhcnRTdHIuc3Vic3RyaW5nKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgMTBcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgYWxsRGF5ID0gZXZlbnQuYWxsRGF5O1xuICAgICAgICBhbGxEYXlDaGVja2JveC5jaGVja2VkID0gYWxsRGF5O1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0VGltZVwiKS5kaXNhYmxlZCA9IGFsbERheTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLmRpc2FibGVkID0gYWxsRGF5O1xuXG4gICAgICAgIGlmICghYWxsRGF5KSB7XG4gICAgICAgICAgY29uc3Qgc3RhcnREYXRlID0gbmV3IERhdGUoZXZlbnQuc3RhcnQpO1xuICAgICAgICAgIGNvbnN0IGVuZERhdGUgPSBuZXcgRGF0ZShldmVudC5lbmQgfHwgZXZlbnQuc3RhcnQpO1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLnZhbHVlID0gc3RhcnREYXRlXG4gICAgICAgICAgICAudG9UaW1lU3RyaW5nKClcbiAgICAgICAgICAgIC5zdWJzdHJpbmcoMCwgNSk7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLnZhbHVlID0gZW5kRGF0ZVxuICAgICAgICAgICAgLnRvVGltZVN0cmluZygpXG4gICAgICAgICAgICAuc3Vic3RyaW5nKDAsIDUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLnZhbHVlID0gXCJcIjtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuZFRpbWVcIikudmFsdWUgPSBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXNjcmlwdGlvblwiKS52YWx1ZSA9XG4gICAgICAgICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5kZXNjcmlwdGlvbiB8fCBcIlwiO1xuICAgICAgICAvLyBSZW1vdmUgcHJpb3JpdHlcbiAgICAgICAgLy8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eVwiKS52YWx1ZSA9XG4gICAgICAgIC8vICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5wcmlvcml0eSB8fCBcImxvd1wiO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3J5XCIpLnZhbHVlID1cbiAgICAgICAgICBldmVudC5leHRlbmRlZFByb3BzLmNhdGVnb3J5IHx8IFwiTm9uZVwiO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbXBsZXRlZFwiKS5jaGVja2VkID1cbiAgICAgICAgICBldmVudC5leHRlbmRlZFByb3BzLmNvbXBsZXRlZCB8fCBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZ2V0Rm9ybURhdGEoKSB7XG4gICAgICAgIGNvbnN0IGNhdGVnb3J5VmFsdWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3J5XCIpLnZhbHVlO1xuICAgICAgICBjb25zdCBhbGxEYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFsbERheVwiKS5jaGVja2VkO1xuICAgICAgICBjb25zdCBkYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YXNrRGF0ZVwiKS52YWx1ZTtcbiAgICAgICAgbGV0IHN0YXJ0LCBlbmQ7XG5cbiAgICAgICAgaWYgKGFsbERheSkge1xuICAgICAgICAgIHN0YXJ0ID0gZGF0ZTtcbiAgICAgICAgICBlbmQgPSBkYXRlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLnZhbHVlO1xuICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuZFRpbWVcIikudmFsdWU7XG4gICAgICAgICAgc3RhcnQgPSBzdGFydFRpbWUgPyBgJHtkYXRlfVQke3N0YXJ0VGltZX1gIDogZGF0ZTtcbiAgICAgICAgICBlbmQgPSBlbmRUaW1lID8gYCR7ZGF0ZX1UJHtlbmRUaW1lfWAgOiBzdGFydDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IGlzRWRpdGluZyA/IGN1cnJlbnRFZGl0aW5nVGFzay5pZCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICB0aXRsZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXRsZVwiKS52YWx1ZSxcbiAgICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgICAgZW5kOiBlbmQsXG4gICAgICAgICAgYWxsRGF5OiBhbGxEYXksXG4gICAgICAgICAgZGVzY3JpcHRpb246IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVzY3JpcHRpb25cIikudmFsdWUsXG4gICAgICAgICAgLy8gUmVtb3ZlIHByaW9yaXR5XG4gICAgICAgICAgLy8gcHJpb3JpdHk6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlcIikudmFsdWUsXG4gICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5VmFsdWUgPT09IFwiTm9uZVwiID8gbnVsbCA6IGNhdGVnb3J5VmFsdWUsXG4gICAgICAgICAgY29tcGxldGVkOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbXBsZXRlZFwiKS5jaGVja2VkLFxuICAgICAgICAgIC8vIFJlbW92ZSBwcmlvcml0eSBmcm9tIGNsYXNzTmFtZVxuICAgICAgICAgIGNsYXNzTmFtZTogYCR7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbXBsZXRlZFwiKS5jaGVja2VkID8gXCJjb21wbGV0ZWQtdGFza1wiIDogXCJcIlxuICAgICAgICAgIH1gLFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBhc3luYyBmdW5jdGlvbiBjcmVhdGVUYXNrKGRhdGEpIHtcbiAgICAgICAgY29uc3QgbmV3VGFzayA9IGF3YWl0IEFwaVNlcnZpY2UuY3JlYXRlVGFzayhkYXRhKTtcbiAgICAgICAgYWxsVGFza3MucHVzaChuZXdUYXNrKTtcbiAgICAgICAgY2FsZW5kYXIuYWRkRXZlbnQobmV3VGFzayk7XG4gICAgICAgIHJldHVybiBuZXdUYXNrO1xuICAgICAgfVxuXG4gICAgICBhc3luYyBmdW5jdGlvbiB1cGRhdGVUYXNrKGRhdGEpIHtcbiAgICAgICAgY29uc3QgdXBkYXRlZFRhc2sgPSBhd2FpdCBBcGlTZXJ2aWNlLnVwZGF0ZVRhc2soZGF0YS5pZCwgZGF0YSk7XG4gICAgICAgIC8vIEVuc3VyZSBhbGxUYXNrcyBoYXMgb25seSBvbmUgZXZlbnQgcGVyIElEIChyZXBsYWNlIG9sZCB3aXRoIG5ldylcbiAgICAgICAgYWxsVGFza3MgPSBbXG4gICAgICAgICAgLi4uYWxsVGFza3MuZmlsdGVyKCh0KSA9PiB0LmlkICE9PSB1cGRhdGVkVGFzay5pZCksXG4gICAgICAgICAgdXBkYXRlZFRhc2ssXG4gICAgICAgIF07XG4gICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzay5yZW1vdmUoKTtcbiAgICAgICAgY2FsZW5kYXIuYWRkRXZlbnQodXBkYXRlZFRhc2spO1xuICAgICAgICByZXR1cm4gdXBkYXRlZFRhc2s7XG4gICAgICB9XG5cbiAgICAgIGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZVRhc2soaWQpIHtcbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgXCJhbGxUYXNrcyBiZWZvcmUgZGVsZXRlOlwiLFxuICAgICAgICAgIGFsbFRhc2tzLm1hcCgodCkgPT4gdC5pZClcbiAgICAgICAgKTtcbiAgICAgICAgYXdhaXQgQXBpU2VydmljZS5kZWxldGVUYXNrKGlkKTtcbiAgICAgICAgLy8gRW5zdXJlIGlkIGNvbXBhcmlzb24gaXMgYWx3YXlzIHN0cmluZy1iYXNlZCBhbmQgdXBkYXRlIGFycmF5IGluIHBsYWNlXG4gICAgICAgIGNvbnN0IGlkU3RyID0gU3RyaW5nKGlkKTtcbiAgICAgICAgZm9yIChsZXQgaSA9IGFsbFRhc2tzLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgICAgICAgaWYgKFN0cmluZyhhbGxUYXNrc1tpXS5pZCkgPT09IGlkU3RyKSB7XG4gICAgICAgICAgICBhbGxUYXNrcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnNvbGUubG9nKFwiRGVsZXRlZCB0YXNrIGlkOlwiLCBpZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFxuICAgICAgICAgIFwiYWxsVGFza3MgYWZ0ZXIgZGVsZXRlOlwiLFxuICAgICAgICAgIGFsbFRhc2tzLm1hcCgodCkgPT4gdC5pZClcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gQWZ0ZXIgY2FsZW5kYXIgaW5pdGlhbGl6YXRpb25cbiAgICAgIGZ1bmN0aW9uIHVwZGF0ZUNhbGVuZGFySGVhZGVyQnV0dG9ucyh2aWV3VHlwZSkge1xuICAgICAgICBjb25zdCBmY0hlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZmMtaGVhZGVyLXRvb2xiYXJcIik7XG4gICAgICAgIGlmICghZmNIZWFkZXIpIHJldHVybjtcbiAgICAgICAgLy8gSGlkZSBoZWFkZXIgZm9yIGxpc3RXZWVrIChVcGNvbWluZyksIHRpbWVHcmlkRGF5IChUb2RheSksIGFuZCBsaXN0WWVhciAoWWVhcilcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHZpZXdUeXBlID09PSBcImxpc3RXZWVrXCIgfHxcbiAgICAgICAgICB2aWV3VHlwZSA9PT0gXCJ0aW1lR3JpZERheVwiIHx8XG4gICAgICAgICAgdmlld1R5cGUgPT09IFwibGlzdFllYXJcIlxuICAgICAgICApIHtcbiAgICAgICAgICBmY0hlYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZmNIZWFkZXIuc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcHJldkJ0biA9IGZjSGVhZGVyLnF1ZXJ5U2VsZWN0b3IoXCIuZmMtcHJldi1idXR0b25cIik7XG4gICAgICAgIGNvbnN0IG5leHRCdG4gPSBmY0hlYWRlci5xdWVyeVNlbGVjdG9yKFwiLmZjLW5leHQtYnV0dG9uXCIpO1xuICAgICAgICBjb25zdCB0b2RheUJ0biA9IGZjSGVhZGVyLnF1ZXJ5U2VsZWN0b3IoXCIuZmMtdG9kYXktYnV0dG9uXCIpO1xuICAgICAgICAvLyBIaWRlIHJpZ2h0LXNpZGUgdmlldyBzd2l0Y2hlcnMgaWYgcHJlc2VudFxuICAgICAgICBjb25zdCByaWdodEJ0bnMgPSBmY0hlYWRlci5xdWVyeVNlbGVjdG9yQWxsKFxuICAgICAgICAgIFwiLmZjLXRvb2xiYXItY2h1bms6bGFzdC1jaGlsZCAuZmMtYnV0dG9uXCJcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHZpZXdUeXBlID09PSBcImxpc3RXZWVrXCIgfHxcbiAgICAgICAgICB2aWV3VHlwZSA9PT0gXCJ0aW1lR3JpZERheVwiIHx8XG4gICAgICAgICAgdmlld1R5cGUgPT09IFwibGlzdFllYXJcIlxuICAgICAgICApIHtcbiAgICAgICAgICBpZiAocHJldkJ0bikgcHJldkJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgaWYgKG5leHRCdG4pIG5leHRCdG4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgIGlmICh0b2RheUJ0bikgdG9kYXlCdG4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgIHJpZ2h0QnRucy5mb3JFYWNoKChidG4pID0+IChidG4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHByZXZCdG4pIHByZXZCdG4uc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICAgICAgaWYgKG5leHRCdG4pIG5leHRCdG4uc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICAgICAgaWYgKHRvZGF5QnRuKSB0b2RheUJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgICAgICByaWdodEJ0bnMuZm9yRWFjaCgoYnRuKSA9PiAoYnRuLnN0eWxlLmRpc3BsYXkgPSBcIlwiKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgLmZjLXNjcm9sbGdyaWQtc2VjdGlvbi1oZWFkZXIgb24gXCJ0b2RheVwiIHZpZXcgKHRpbWVHcmlkRGF5KVxuICAgICAgICBjb25zdCBzZWN0aW9uSGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcbiAgICAgICAgICBcIi5mYy1zY3JvbGxncmlkLXNlY3Rpb24taGVhZGVyXCJcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKHZpZXdUeXBlID09PSBcInRpbWVHcmlkRGF5XCIpIHtcbiAgICAgICAgICBpZiAoc2VjdGlvbkhlYWRlcikgc2VjdGlvbkhlYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHNlY3Rpb25IZWFkZXIpIHNlY3Rpb25IZWFkZXIuc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2FsZW5kYXIub24oXCJ2aWV3RGlkTW91bnRcIiwgZnVuY3Rpb24gKGFyZykge1xuICAgICAgICB1cGRhdGVDYWxlbmRhckhlYWRlckJ1dHRvbnMoYXJnLnZpZXcudHlwZSk7XG4gICAgICB9KTtcblxuICAgICAgLy8gUmVuZGVyIGNhbGVuZGFyIGFmdGVyIERPTSBpcyByZWFkeSBhbmQgaGVhZGVyIGlzIGhpZGRlblxuICAgICAgY2FsZW5kYXIucmVuZGVyKCk7XG5cbiAgICAgIC8vIEhpZGUgaGVhZGVyIG9uIGluaXRpYWwgbG9hZCBpZiBpbiBsaXN0V2VlayAoVXBjb21pbmcpXG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgY29uc3QgZmNIZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmZjLWhlYWRlci10b29sYmFyXCIpO1xuICAgICAgICBpZiAoZmNIZWFkZXIpIGZjSGVhZGVyLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgICAgfSwgMTAwKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4ge307XG59KSgpO1xuIiwiaW1wb3J0IHsgQXBpU2VydmljZSB9IGZyb20gXCIuL2FwaVNlcnZpY2UuanNcIjtcblxuZXhwb3J0IGNvbnN0IENhdGVnb3J5ID0gKCgpID0+IHtcbiAgbGV0IGNhdGVnb3JpZXMgPSBbXTtcbiAgbGV0IGFjdGl2ZUNhdGVnb3J5ID0gbnVsbDsgLy8gVHJhY2sgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBjYXRlZ29yeVxuXG4gIC8vIEhlbHBlciBmdW5jdGlvbnMgZGVmaW5lZCBvdXRzaWRlIERPTUNvbnRlbnRMb2FkZWRcbiAgZnVuY3Rpb24gcmVuZGVyQ2F0ZWdvcmllcygpIHtcbiAgICBjb25zdCBjYXRlZ29yaWVzQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRlZ29yaWVzLWNvbnRhaW5lclwiKTtcblxuICAgIGNhdGVnb3JpZXNDb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcblxuICAgIGNhdGVnb3JpZXMuZm9yRWFjaCgoY2F0ZWdvcnksIGluZGV4KSA9PiB7XG4gICAgICAvLyBFbnN1cmUgY2F0ZWdvcnkuaWQgaXMgYSBzdHJpbmcgZm9yIGNvbnNpc3RlbmN5XG4gICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICAgIGxpLmNsYXNzTmFtZSA9IFwiY2F0ZWdvcnktaXRlbVwiO1xuICAgICAgaWYgKGFjdGl2ZUNhdGVnb3J5ID09PSBjYXRlZ29yeS5uYW1lKSB7XG4gICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XG4gICAgICB9XG4gICAgICBsaS5pbm5lckhUTUwgPSBgXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhdGVnb3J5LWNvbnRlbnRcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY2F0ZWdvcnktY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6ICR7Y2F0ZWdvcnkuY29sb3J9O1wiPjwvc3Bhbj4gXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNhdGVnb3J5LW5hbWVcIj4ke2NhdGVnb3J5Lm5hbWV9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJkZWxldGUtY2F0ZWdvcnktYnRuXCIgZGF0YS1pZD1cIiR7Y2F0ZWdvcnkuaWR9XCI+XG4gICAgICAgICAgICA8aSBjbGFzcz1cImZhcyBmYS10cmFzaFwiPjwvaT5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgYDtcbiAgICAgIC8vIEFkZCBjbGljayBldmVudCBmb3IgZmlsdGVyaW5nXG4gICAgICBsaS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcbiAgICAgICAgLy8gUHJldmVudCBjbGljayBpZiBkZWxldGUgYnV0dG9uIGlzIGNsaWNrZWRcbiAgICAgICAgaWYgKGUudGFyZ2V0LmNsb3Nlc3QoXCIuZGVsZXRlLWNhdGVnb3J5LWJ0blwiKSkgcmV0dXJuO1xuICAgICAgICBhY3RpdmVDYXRlZ29yeSA9IGNhdGVnb3J5Lm5hbWU7XG4gICAgICAgIC8vIFJlbW92ZSAuYWN0aXZlIGZyb20gYWxsIHNpZGViYXItYnRuIGFuZCBjYXRlZ29yeS1pdGVtXG4gICAgICAgIGRvY3VtZW50XG4gICAgICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2lkZWJhci1idG4sIC5jYXRlZ29yeS1pdGVtXCIpXG4gICAgICAgICAgLmZvckVhY2goKGJ0bikgPT4ge1xuICAgICAgICAgICAgYnRuLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XG4gICAgICAgIHJlbmRlckNhdGVnb3JpZXMoKTtcbiAgICAgICAgLy8gRGlzcGF0Y2ggY3VzdG9tIGV2ZW50IGZvciBmaWx0ZXJpbmdcbiAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwiY2F0ZWdvcnlGaWx0ZXJcIiwge1xuICAgICAgICAgICAgZGV0YWlsOiB7IGNhdGVnb3J5OiBjYXRlZ29yeS5uYW1lIH0sXG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgICAgY2F0ZWdvcmllc0NvbnRhaW5lci5hcHBlbmRDaGlsZChsaSk7XG4gICAgfSk7XG5cbiAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIHRvIGRlbGV0ZSBidXR0b25zXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5kZWxldGUtY2F0ZWdvcnktYnRuXCIpLmZvckVhY2goKGJ0bikgPT4ge1xuICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAvLyBFbnN1cmUgaWQgaXMgdHJlYXRlZCBhcyBhIHN0cmluZ1xuICAgICAgICBjb25zdCBpZCA9IGJ0bi5kYXRhc2V0LmlkO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkF0dGVtcHRpbmcgdG8gZGVsZXRlIGNhdGVnb3J5IHdpdGggaWQ6XCIsIGlkKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJDdXJyZW50IGNhdGVnb3JpZXM6XCIsIGNhdGVnb3JpZXMpO1xuICAgICAgICBkZWxldGVDYXRlZ29yeShpZCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUNhdGVnb3J5U2VsZWN0KCkge1xuICAgIGNvbnN0IGNhdGVnb3J5U2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRlZ29yeVwiKTtcbiAgICBjYXRlZ29yeVNlbGVjdC5pbm5lckhUTUwgPSBcIlwiO1xuXG4gICAgLy8gQWRkIFwiTm9uZVwiIG9wdGlvbiBmaXJzdFxuICAgIGNvbnN0IG5vbmVPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xuICAgIG5vbmVPcHRpb24udmFsdWUgPSBcIk5vbmVcIjtcbiAgICBub25lT3B0aW9uLnRleHRDb250ZW50ID0gXCJOb25lXCI7XG4gICAgY2F0ZWdvcnlTZWxlY3QuYXBwZW5kQ2hpbGQobm9uZU9wdGlvbik7XG5cbiAgICAvLyBBZGQgYWxsIGNhdGVnb3J5IG9wdGlvbnNcbiAgICBjYXRlZ29yaWVzLmZvckVhY2goKGNhdGVnb3J5KSA9PiB7XG4gICAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xuICAgICAgb3B0aW9uLnZhbHVlID0gY2F0ZWdvcnkubmFtZTtcbiAgICAgIG9wdGlvbi50ZXh0Q29udGVudCA9IGNhdGVnb3J5Lm5hbWU7XG4gICAgICBjYXRlZ29yeVNlbGVjdC5hcHBlbmRDaGlsZChvcHRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gZGVsZXRlQ2F0ZWdvcnkoaWQpIHtcbiAgICAvLyBDb252ZXJ0IGlkIHRvIHN0cmluZyBmb3IgY29uc2lzdGVuY3lcbiAgICBjb25zdCBpbmRleCA9IGNhdGVnb3JpZXMuZmluZEluZGV4KFxuICAgICAgKGMpID0+IGMuaWQudG9TdHJpbmcoKSA9PT0gaWQudG9TdHJpbmcoKVxuICAgICk7XG4gICAgY29uc29sZS5sb2coXCJkZWxldGVDYXRlZ29yeSBjYWxsZWQgd2l0aCBpZDpcIiwgaWQsIFwiRm91bmQgaW5kZXg6XCIsIGluZGV4KTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBEZWxldGUgY2F0ZWdvcnkgdmlhIEFQSVxuICAgICAgICBhd2FpdCBBcGlTZXJ2aWNlLmRlbGV0ZUNhdGVnb3J5KGlkKTtcbiAgICAgICAgLy8gUmVtb3ZlIGZyb20gbG9jYWwgc3RhdGVcbiAgICAgICAgY2F0ZWdvcmllcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICByZW5kZXJDYXRlZ29yaWVzKCk7XG4gICAgICAgIHVwZGF0ZUNhdGVnb3J5U2VsZWN0KCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGRlbGV0ZSBjYXRlZ29yeTpcIiwgZXJyb3IpO1xuICAgICAgICAvLyBPcHRpb25hbGx5IHNob3cgZXJyb3IgbWVzc2FnZSB0byB1c2VyXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJDYXRlZ29yeSBub3QgZm91bmQgd2l0aCBpZDpcIiwgaWQpO1xuICAgIH1cbiAgfVxuXG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09IFwiL2FwcFwiKSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgY2F0ZWdvcnlTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3J5XCIpO1xuICAgICAgY29uc3QgY2F0ZWdvcmllc0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgICBcImNhdGVnb3JpZXMtY29udGFpbmVyXCJcbiAgICAgICk7XG4gICAgICBjb25zdCBhZGROZXdDYXRlZ29yeUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkLW5ldy1jYXRlZ29yeS1idG5cIik7XG4gICAgICBjb25zdCBuZXdDYXRlZ29yeUZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1mb3JtXCIpO1xuICAgICAgY29uc3QgY3JlYXRlQ2F0ZWdvcnlCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNyZWF0ZS1jYXRlZ29yeS1idG5cIik7XG5cbiAgICAgIC8vIEZldGNoIGNhdGVnb3JpZXMgZnJvbSBBUElcbiAgICAgIGFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemVDYXRlZ29yaWVzKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNhdGVnb3JpZXMgPSBhd2FpdCBBcGlTZXJ2aWNlLmZldGNoQ2F0ZWdvcmllcygpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmV0Y2hlZCBjYXRlZ29yaWVzOlwiLCBjYXRlZ29yaWVzKTtcbiAgICAgICAgICByZW5kZXJDYXRlZ29yaWVzKCk7XG4gICAgICAgICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGZldGNoIGNhdGVnb3JpZXM6XCIsIGVycm9yKTtcbiAgICAgICAgICAvLyBPcHRpb25hbGx5IHNob3cgZXJyb3IgbWVzc2FnZSB0byB1c2VyXG4gICAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xuICAgICAgICAgIHVwZGF0ZUNhdGVnb3J5U2VsZWN0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaW5pdGlhbGl6ZUNhdGVnb3JpZXMoKTtcblxuICAgICAgLy8gQ2F0ZWdvcnkgbWFuYWdlbWVudFxuICAgICAgYWRkTmV3Q2F0ZWdvcnlCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgbmV3Q2F0ZWdvcnlGb3JtLnN0eWxlLmRpc3BsYXkgPVxuICAgICAgICAgIG5ld0NhdGVnb3J5Rm9ybS5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIiA/IFwiZmxleFwiIDogXCJub25lXCI7XG4gICAgICB9KTtcblxuICAgICAgY3JlYXRlQ2F0ZWdvcnlCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3LWNhdGVnb3J5LW5hbWVcIikudmFsdWUudHJpbSgpO1xuICAgICAgICBjb25zdCBjb2xvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3LWNhdGVnb3J5LWNvbG9yXCIpLnZhbHVlO1xuXG4gICAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIExvZyB0aGUgcGF5bG9hZCBiZWluZyBzZW50IHRvIHRoZSBiYWNrZW5kXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlNlbmRpbmcgY2F0ZWdvcnkgdG8gYmFja2VuZDpcIiwgeyBuYW1lLCBjb2xvciB9KTtcbiAgICAgICAgICAgIC8vIEFkZCBuZXcgY2F0ZWdvcnkgdmlhIEFQSVxuICAgICAgICAgICAgY29uc3QgYXBpQ2F0ZWdvcnkgPSBhd2FpdCBBcGlTZXJ2aWNlLmNyZWF0ZUNhdGVnb3J5KHtcbiAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgY29sb3IsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhdGVnb3JpZXMucHVzaChhcGlDYXRlZ29yeSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkFkZGVkIG5ldyBjYXRlZ29yeTpcIiwgYXBpQ2F0ZWdvcnkpO1xuICAgICAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xuICAgICAgICAgICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKTtcblxuICAgICAgICAgICAgLy8gUmVzZXQgZm9ybVxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctY2F0ZWdvcnktbmFtZVwiKS52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1jb2xvclwiKS52YWx1ZSA9IFwiI2NjY2NjY1wiO1xuICAgICAgICAgICAgbmV3Q2F0ZWdvcnlGb3JtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBjcmVhdGUgY2F0ZWdvcnk6XCIsIGVycm9yKTtcbiAgICAgICAgICAgIC8vIE9wdGlvbmFsbHkgc2hvdyBlcnJvciBtZXNzYWdlIHRvIHVzZXJcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBBZGQgYSBnbG9iYWwgbGlzdGVuZXIgdG8gY2xlYXIgZmlsdGVyIHdoZW4gY2xpY2tpbmcgXCJDYWxlbmRhclwiIG9yIFwiVXBjb21pbmdcIiBvciBcIlRvZGF5XCJcbiAgICAgIFtcImJ0bi1jYWxlbmRhclwiLCBcImJ0bi11cGNvbWluZ1wiLCBcImJ0bi10b2RheVwiXS5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgICAgIGlmIChidG4pIHtcbiAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICAgIGFjdGl2ZUNhdGVnb3J5ID0gbnVsbDtcbiAgICAgICAgICAgIHJlbmRlckNhdGVnb3JpZXMoKTtcbiAgICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJjYXRlZ29yeUZpbHRlclwiLCB7IGRldGFpbDogeyBjYXRlZ29yeTogbnVsbCB9IH0pXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGdldENhdGVnb3JpZXM6ICgpID0+IGNhdGVnb3JpZXMsXG4gICAgcmVuZGVyQ2F0ZWdvcmllcyxcbiAgICB1cGRhdGVDYXRlZ29yeVNlbGVjdCxcbiAgfTtcbn0pKCk7XG4iLCJleHBvcnQgY29uc3QgRG9tVXRpbHMgPSAoKCkgPT4ge1xuICBmdW5jdGlvbiBjbGVhck1lc3NhZ2VzKCkge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVzc2FnZUNvbnRhaW5lclwiKTtcbiAgICBpZiAoY29udGFpbmVyKSBjb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZXJyb3ItbWVzc2FnZSwgLnN1Y2Nlc3MtbWVzc2FnZVwiKVxuICAgICAgLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICAgIGlmIChlbC5wYXJlbnROb2RlICE9PSBjb250YWluZXIpIGVsLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBzaG93TWVzc2FnZShtZXNzYWdlLCB0eXBlID0gXCJlcnJvclwiKSB7XG4gICAgY2xlYXJNZXNzYWdlcygpO1xuICAgIGNvbnN0IG1lc3NhZ2VFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBtZXNzYWdlRWxlbWVudC5jbGFzc05hbWUgPVxuICAgICAgdHlwZSA9PT0gXCJlcnJvclwiID8gXCJlcnJvci1tZXNzYWdlXCIgOiBcInN1Y2Nlc3MtbWVzc2FnZVwiO1xuICAgIG1lc3NhZ2Uuc3BsaXQoXCJcXG5cIikuZm9yRWFjaCgobGluZSkgPT4ge1xuICAgICAgY29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgcC50ZXh0Q29udGVudCA9IGxpbmU7XG4gICAgICBtZXNzYWdlRWxlbWVudC5hcHBlbmRDaGlsZChwKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVzc2FnZUNvbnRhaW5lclwiKTtcbiAgICBpZiAoY29udGFpbmVyKSB7XG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobWVzc2FnZUVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdXRoRm9ybVwiKTtcbiAgICAgIGZvcm1cbiAgICAgICAgPyBmb3JtLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG1lc3NhZ2VFbGVtZW50LCBmb3JtKVxuICAgICAgICA6IGRvY3VtZW50LmJvZHkucHJlcGVuZChtZXNzYWdlRWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgLy8gQ3JlYXRlIGEgZmxvYXRpbmcgZXJyb3IgbWVzc2FnZSBjb250YWluZXIgaWYgbm90IHByZXNlbnRcbiAgZnVuY3Rpb24gc2hvd0Zsb2F0aW5nRXJyb3IobWVzc2FnZSwgdHlwZSA9IFwiZXJyb3JcIikge1xuICAgIGxldCBmbG9hdGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZmxvYXRpbmdNZXNzYWdlXCIpO1xuICAgIGlmICghZmxvYXRpbmcpIHtcbiAgICAgIGZsb2F0aW5nID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICAgIGZsb2F0aW5nLmlkID0gXCJmbG9hdGluZ01lc3NhZ2VcIjtcbiAgICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQoZmxvYXRpbmcpO1xuICAgIH1cbiAgICBmbG9hdGluZy50ZXh0Q29udGVudCA9IG1lc3NhZ2U7XG4gICAgZmxvYXRpbmcuY2xhc3NOYW1lID1cbiAgICAgIHR5cGUgPT09IFwic3VjY2Vzc1wiXG4gICAgICAgID8gXCJmbG9hdGluZy1tZXNzYWdlIHN1Y2Nlc3NcIlxuICAgICAgICA6IFwiZmxvYXRpbmctbWVzc2FnZSBlcnJvclwiO1xuICAgIGZsb2F0aW5nLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBmbG9hdGluZy5jbGFzc0xpc3QuYWRkKFwiZmFkZS1vdXRcIik7XG4gICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgZmxvYXRpbmcuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICBmbG9hdGluZy5jbGFzc0xpc3QucmVtb3ZlKFwiZmFkZS1vdXRcIik7XG4gICAgICB9LCAxMDAwKTtcbiAgICB9LCAzMDAwKTtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2xlYXJNZXNzYWdlcyxcbiAgICBzaG93RXJyb3I6IChtc2cpID0+IHNob3dGbG9hdGluZ0Vycm9yKG1zZywgXCJlcnJvclwiKSxcbiAgICBzaG93U3VjY2VzczogKG1zZykgPT4gc2hvd0Zsb2F0aW5nRXJyb3IobXNnLCBcInN1Y2Nlc3NcIiksXG4gICAgc2hvd0Zsb2F0aW5nRXJyb3IsXG4gIH07XG59KSgpO1xuIiwiZXhwb3J0IGNvbnN0IExvYWRlciA9ICgoKSA9PiB7XG4gIGZ1bmN0aW9uIHRvZ2dsZShzaG93KSB7XG4gICAgbGV0IGxvYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGVyXCIpO1xuICAgIGlmICghbG9hZGVyICYmIHNob3cpIGxvYWRlciA9IGNyZWF0ZSgpO1xuICAgIGlmIChsb2FkZXIpIHtcbiAgICAgIGlmIChzaG93KSB7XG4gICAgICAgIGxvYWRlci5jbGFzc0xpc3QucmVtb3ZlKFwiaGlkZVwiKTtcbiAgICAgICAgbG9hZGVyLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGxvYWRlci5jbGFzc0xpc3QuYWRkKFwiaGlkZVwiKTtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgaWYgKGxvYWRlci5jbGFzc0xpc3QuY29udGFpbnMoXCJoaWRlXCIpKSB7XG4gICAgICAgICAgICBsb2FkZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSwgMzAwKTsgLy8gbWF0Y2ggQ1NTIHRyYW5zaXRpb24gZHVyYXRpb25cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgY29uc3QgbG9hZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBsb2FkZXIuaWQgPSBcImxvYWRlclwiO1xuICAgIGxvYWRlci5jbGFzc05hbWUgPSBcImxvYWRlclwiO1xuICAgIGxvYWRlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXJcIj48L2Rpdj4nO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobG9hZGVyKTtcbiAgICByZXR1cm4gbG9hZGVyO1xuICB9XG5cbiAgcmV0dXJuIHsgdG9nZ2xlIH07XG59KSgpO1xuIiwiaW1wb3J0IHsgRG9tVXRpbHMgfSBmcm9tIFwiLi9kb21VdGlscy5qc1wiO1xuXG5leHBvcnQgY29uc3QgVXNlciA9ICgoKSA9PiB7XG4gIGFzeW5jIGZ1bmN0aW9uIGxvZ291dCgpIHtcbiAgICBjb25zb2xlLmxvZyhcIkF0dGVtcHRpbmcgbG9nb3V0Li4uXCIpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFwiL2FwaS9sb2dvdXRcIiwge1xuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICBoZWFkZXJzOiB7IEFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpO1xuICAgICAgaWYgKCFyZXNwb25zZS5vaylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGRhdGEuZXJyb3IgfHwgYExvZ291dCBmYWlsZWQgd2l0aCBzdGF0dXM6ICR7cmVzcG9uc2Uuc3RhdHVzfWBcbiAgICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiTG9nb3V0IHN1Y2Nlc3NmdWwgdmlhIEFQSS5cIik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJMb2dvdXQgQVBJIGNhbGwgZmFpbGVkOlwiLCBlcnJvcik7XG4gICAgICBEb21VdGlscy5zaG93RXJyb3IoXG4gICAgICAgIFwiQ291bGQgbm90IHByb3Blcmx5IGxvZyBvdXQuIENsZWFyIGNvb2tpZXMgbWFudWFsbHkgaWYgbmVlZGVkLlwiXG4gICAgICApO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInVzZXJcIik7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2xvZ2luXCI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZGlzcGxheVVzZXJEYXRhKCkge1xuICAgIGNvbnN0IHVzZXJEYXRhU3RyaW5nID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ1c2VyXCIpO1xuICAgIGlmICghdXNlckRhdGFTdHJpbmcpIHJldHVybiBsb2dvdXQoKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdXNlckRhdGEgPSBKU09OLnBhcnNlKHVzZXJEYXRhU3RyaW5nKTtcbiAgICAgIGNvbnN0IHVzZXJOYW1lID0gdXNlckRhdGEubmFtZSB8fCBcIlVzZXJcIjtcbiAgICAgIGNvbnN0IHVzZXJOYW1lRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlci1uYW1lLWRpc3BsYXlcIik7XG4gICAgICBpZiAodXNlck5hbWVEaXNwbGF5KSB1c2VyTmFtZURpc3BsYXkudGV4dENvbnRlbnQgPSB1c2VyTmFtZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiSW52YWxpZCB1c2VyIGRhdGEgaW4gbG9jYWxTdG9yYWdlLlwiKTtcbiAgICAgIGxvZ291dCgpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IGxvZ291dCwgZGlzcGxheVVzZXJEYXRhIH07XG59KSgpO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4vbW9kdWxlcy91c2VyLmpzXCI7XG5pbXBvcnQgeyBBdXRoIH0gZnJvbSBcIi4vbW9kdWxlcy9hdXRoLmpzXCI7XG5pbXBvcnQgeyBUb2RvIH0gZnJvbSBcIi4vbW9kdWxlcy9jYWxlbmRhci5qc1wiO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09IFwiL2FwcFwiKSB7XG4gICAgVXNlci5kaXNwbGF5VXNlckRhdGEoKTtcbiAgfVxuICBjb25zdCBsb2dvdXRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1sb2dvdXRcIik7XG4gIGlmIChsb2dvdXRCdG4pIGxvZ291dEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgVXNlci5sb2dvdXQpO1xuXG4gIGNvbnNvbGUubG9nKFwiTWFpbiBhcHAgaW5pdGlhbGl6ZWQuXCIpO1xufSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=