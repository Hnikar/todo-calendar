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
            }
          } else {
            info.el.style.borderLeft = "4px solid transparent";
          }

          // Remove the .fc-daygrid-event-dot element if present
          const dot = info.el.querySelector('.fc-daygrid-event-dot');
          if (dot) dot.remove();
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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O0FBQ0E7QUFDQTtBQUNBOztBQUVBLFdBQVc7QUFDWCxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0FDN0J3Qzs7QUFFbEM7QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLDRCQUE0QjtBQUMvQyxPQUFPOztBQUVQLHdEQUF3RDtBQUN4RDtBQUNBO0FBQ0Esc0RBQXNELGdCQUFnQjtBQUN0RTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTSxrREFBUTtBQUNkO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBO0FBQ0E7QUFDQTs7QUFFQSxXQUFXO0FBQ1gsQ0FBQzs7Ozs7OztVQzNDRDtVQUNBOztVQUVBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBOztVQUVBO1VBQ0E7O1VBRUE7VUFDQTtVQUNBOzs7OztXQ3RCQTtXQUNBO1dBQ0E7V0FDQTtXQUNBLHlDQUF5Qyx3Q0FBd0M7V0FDakY7V0FDQTtXQUNBOzs7OztXQ1BBOzs7OztXQ0FBO1dBQ0E7V0FDQTtXQUNBLHVEQUF1RCxpQkFBaUI7V0FDeEU7V0FDQSxnREFBZ0QsYUFBYTtXQUM3RDs7Ozs7Ozs7Ozs7Ozs7QUNOeUM7QUFDQTtBQUNJOztBQUU3QztBQUNBO0FBQ0EsSUFBSSxrREFBSTtBQUNSO0FBQ0E7QUFDQSxxREFBcUQsa0RBQUk7O0FBRXpEO0FBQ0EsQ0FBQyIsInNvdXJjZXMiOlsid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2FwaVNlcnZpY2UuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvYXV0aC5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9jYWxlbmRhci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9jYXRlZ29yeS5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9kb21VdGlscy5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9sb2FkZXIuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvdXNlci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vc3RhdGljL3dlYnBhY2svcnVudGltZS9kZWZpbmUgcHJvcGVydHkgZ2V0dGVycyIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ydW50aW1lL2hhc093blByb3BlcnR5IHNob3J0aGFuZCIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ydW50aW1lL21ha2UgbmFtZXNwYWNlIG9iamVjdCIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgTG9hZGVyIH0gZnJvbSBcIi4vbG9hZGVyLmpzXCI7XG5pbXBvcnQgeyBEb21VdGlscyB9IGZyb20gXCIuL2RvbVV0aWxzLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBBcGlTZXJ2aWNlID0gKCgpID0+IHtcbiAgY29uc3QgQVBJX0JBU0UgPSBcIi9hcGlcIjtcblxuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVSZXF1ZXN0KHVybCwgbWV0aG9kLCBkYXRhKSB7XG4gICAgdHJ5IHtcbiAgICAgIExvYWRlci50b2dnbGUodHJ1ZSk7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke0FQSV9CQVNFfSR7dXJsfWAsIHtcbiAgICAgICAgbWV0aG9kLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgIH0sXG4gICAgICAgIGNyZWRlbnRpYWxzOiBcImluY2x1ZGVcIixcbiAgICAgICAgYm9keTogZGF0YSA/IEpTT04uc3RyaW5naWZ5KGRhdGEpIDogdW5kZWZpbmVkLFxuICAgICAgfSk7XG5cbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQwMSkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2xvZ2luP3JlYXNvbj11bmF1dGhlbnRpY2F0ZWRcIjtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBjb25zdCByZXNwb25zZURhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihyZXNwb25zZURhdGEuZXJyb3IgfHwgXCJSZXF1ZXN0IGZhaWxlZFwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNwb25zZURhdGE7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIERvbVV0aWxzLnNob3dFcnJvcihlcnJvci5tZXNzYWdlKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBMb2FkZXIudG9nZ2xlKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIC8vIFRhc2stcmVsYXRlZCBlbmRwb2ludHNcbiAgICBjcmVhdGVUYXNrOiAodGFzaykgPT4ge1xuICAgICAgY29uc3QgeyBwcmlvcml0eSwgLi4ucmVzdCB9ID0gdGFzaztcbiAgICAgIHJldHVybiBoYW5kbGVSZXF1ZXN0KFwiL2V2ZW50c1wiLCBcIlBPU1RcIiwgcmVzdCk7XG4gICAgfSxcbiAgICB1cGRhdGVUYXNrOiAoaWQsIHRhc2spID0+IHtcbiAgICAgIGNvbnN0IHsgcHJpb3JpdHksIC4uLnJlc3QgfSA9IHRhc2s7XG4gICAgICByZXR1cm4gaGFuZGxlUmVxdWVzdChgL2V2ZW50cy8ke2lkfWAsIFwiUFVUXCIsIHJlc3QpO1xuICAgIH0sXG4gICAgZGVsZXRlVGFzazogKGlkKSA9PiBoYW5kbGVSZXF1ZXN0KGAvZXZlbnRzLyR7aWR9YCwgXCJERUxFVEVcIiksXG4gICAgZmV0Y2hUYXNrczogKCkgPT4gaGFuZGxlUmVxdWVzdChcIi9ldmVudHNcIiwgXCJHRVRcIiksXG4gICAgLy8gQ2F0ZWdvcnktcmVsYXRlZCBlbmRwb2ludHNcbiAgICBjcmVhdGVDYXRlZ29yeTogKGNhdGVnb3J5KSA9PlxuICAgICAgaGFuZGxlUmVxdWVzdChcIi9jYXRlZ29yaWVzXCIsIFwiUE9TVFwiLCBjYXRlZ29yeSksXG4gICAgZmV0Y2hDYXRlZ29yaWVzOiAoKSA9PiBoYW5kbGVSZXF1ZXN0KFwiL2NhdGVnb3JpZXNcIiwgXCJHRVRcIiksXG4gICAgZGVsZXRlQ2F0ZWdvcnk6IChpZCkgPT4gaGFuZGxlUmVxdWVzdChgL2NhdGVnb3JpZXMvJHtpZH1gLCBcIkRFTEVURVwiKSxcbiAgfTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBEb21VdGlscyB9IGZyb20gXCIuL2RvbVV0aWxzLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBBdXRoID0gKCgpID0+IHtcbiAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgKCkgPT4ge1xuICAgIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09IFwiL2xvZ2luXCIpIHtcbiAgICAgIGluaXQoKTtcbiAgICAgIGNoZWNrUmVkaXJlY3RSZWFzb24oKTtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIGluaXQoKSB7XG4gICAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXV0aEZvcm1cIik7XG4gICAgaWYgKCFmb3JtKSByZXR1cm4gY29uc29sZS5lcnJvcihcIkF1dGggZm9ybSBub3QgZm91bmQhXCIpO1xuXG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGhhbmRsZVN1Ym1pdCk7XG4gICAgc3dpdGNoTW9kZShcImxvZ2luXCIpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCJbZGF0YS1tb2RlXVwiKS5mb3JFYWNoKCh0YWIpID0+XG4gICAgICB0YWIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgc3dpdGNoTW9kZSh0YWIuZGF0YXNldC5tb2RlKTtcbiAgICAgIH0pXG4gICAgKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN3aXRjaE1vZGUobW9kZSkge1xuICAgIGNvbnN0IG5hbWVGaWVsZCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZUZpZWxkXCIpO1xuICAgIGNvbnN0IHN1Ym1pdEJ0biA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNhdXRoRm9ybSBidXR0b25bdHlwZT1cInN1Ym1pdFwiXScpO1xuICAgIGNvbnN0IHBhc3N3b3JkSW5wdXQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInBhc3N3b3JkXCIpO1xuICAgIGNvbnN0IHRhYnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLnRhYlwiKTtcblxuICAgIGlmIChuYW1lRmllbGQpIHtcbiAgICAgIG5hbWVGaWVsZC5zdHlsZS5kaXNwbGF5ID0gbW9kZSA9PT0gXCJyZWdpc3RlclwiID8gXCJibG9ja1wiIDogXCJub25lXCI7XG4gICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVcIikucmVxdWlyZWQgPSBtb2RlID09PSBcInJlZ2lzdGVyXCI7XG4gICAgfVxuICAgIHRhYnMuZm9yRWFjaCgodGFiKSA9PlxuICAgICAgdGFiLmNsYXNzTGlzdC50b2dnbGUoXCJhY3RpdmVcIiwgdGFiLmRhdGFzZXQubW9kZSA9PT0gbW9kZSlcbiAgICApO1xuICAgIGlmIChzdWJtaXRCdG4pXG4gICAgICBzdWJtaXRCdG4udGV4dENvbnRlbnQgPSBtb2RlID09PSBcImxvZ2luXCIgPyBcIkxvZ2luXCIgOiBcIlJlZ2lzdGVyXCI7XG4gICAgaWYgKHBhc3N3b3JkSW5wdXQpXG4gICAgICBwYXNzd29yZElucHV0LmF1dG9jb21wbGV0ZSA9XG4gICAgICAgIG1vZGUgPT09IFwibG9naW5cIiA/IFwiY3VycmVudC1wYXNzd29yZFwiIDogXCJuZXctcGFzc3dvcmRcIjtcblxuICAgIERvbVV0aWxzLmNsZWFyTWVzc2FnZXMoKTtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVN1Ym1pdChlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIERvbVV0aWxzLmNsZWFyTWVzc2FnZXMoKTtcblxuICAgIGNvbnN0IGlzTG9naW4gPSBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLW1vZGU9XCJsb2dpblwiXScpXG4gICAgICAuY2xhc3NMaXN0LmNvbnRhaW5zKFwiYWN0aXZlXCIpO1xuICAgIGNvbnN0IHVybCA9IGlzTG9naW4gPyBcIi9hcGkvbG9naW5cIiA6IFwiL2FwaS9yZWdpc3RlclwiO1xuICAgIGNvbnN0IGZvcm1EYXRhID0ge1xuICAgICAgZW1haWw6IGdldFZhbChcImVtYWlsXCIpLFxuICAgICAgcGFzc3dvcmQ6IGdldFZhbChcInBhc3N3b3JkXCIpLFxuICAgIH07XG5cbiAgICBpZiAoIWlzTG9naW4pIGZvcm1EYXRhLm5hbWUgPSBnZXRWYWwoXCJuYW1lXCIpO1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhbGlkYXRlKGZvcm1EYXRhLCBpc0xvZ2luKTtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShmb3JtRGF0YSksXG4gICAgICB9KTtcbiAgICAgIGF3YWl0IGhhbmRsZVJlc3BvbnNlKHJlc3BvbnNlLCBpc0xvZ2luKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIERvbVV0aWxzLnNob3dFcnJvcihlcnIubWVzc2FnZSB8fCBcIlVuZXhwZWN0ZWQgZXJyb3IgZHVyaW5nIHN1Ym1pc3Npb24uXCIpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGdldFZhbChpZCkge1xuICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgIHJldHVybiBlbCA/IGVsLnZhbHVlLnRyaW0oKSA6IFwiXCI7XG4gIH1cblxuICBmdW5jdGlvbiB2YWxpZGF0ZShkYXRhLCBpc0xvZ2luKSB7XG4gICAgY29uc3QgZXJyb3JzID0gW107XG4gICAgY29uc3QgZW1haWxSZWdleCA9IC9eW15cXHNAXStAW15cXHNAXStcXC5bXlxcc0BdKyQvO1xuXG4gICAgaWYgKCFkYXRhLmVtYWlsKSBlcnJvcnMucHVzaChcIkVtYWlsIGlzIHJlcXVpcmVkLlwiKTtcbiAgICBlbHNlIGlmICghZW1haWxSZWdleC50ZXN0KGRhdGEuZW1haWwpKSBlcnJvcnMucHVzaChcIkludmFsaWQgZW1haWwgZm9ybWF0LlwiKTtcbiAgICBpZiAoIWRhdGEucGFzc3dvcmQpIGVycm9ycy5wdXNoKFwiUGFzc3dvcmQgaXMgcmVxdWlyZWQuXCIpO1xuICAgIGVsc2UgaWYgKGRhdGEucGFzc3dvcmQubGVuZ3RoIDwgOCAmJiAhaXNMb2dpbilcbiAgICAgIGVycm9ycy5wdXNoKFwiUGFzc3dvcmQgbXVzdCBiZSBhdCBsZWFzdCA4IGNoYXJhY3RlcnMuXCIpO1xuICAgIGlmICghaXNMb2dpbiAmJiAoIWRhdGEubmFtZSB8fCBkYXRhLm5hbWUubGVuZ3RoIDwgMikpXG4gICAgICBlcnJvcnMucHVzaChcIk5hbWUgbXVzdCBiZSBhdCBsZWFzdCAyIGNoYXJhY3RlcnMuXCIpO1xuXG4gICAgaWYgKGVycm9ycy5sZW5ndGgpIHRocm93IG5ldyBFcnJvcihlcnJvcnMuam9pbihcIlxcblwiKSk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXNwb25zZSwgaXNMb2dpbikge1xuICAgIGNvbnN0IGlzSnNvbiA9IHJlc3BvbnNlLmhlYWRlcnNcbiAgICAgIC5nZXQoXCJjb250ZW50LXR5cGVcIilcbiAgICAgID8uaW5jbHVkZXMoXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgIGNvbnN0IGRhdGEgPSBpc0pzb25cbiAgICAgID8gYXdhaXQgcmVzcG9uc2UuanNvbigpXG4gICAgICA6IHsgbWVzc2FnZTogYXdhaXQgcmVzcG9uc2UudGV4dCgpIH07XG5cbiAgICBpZiAoIXJlc3BvbnNlLm9rKVxuICAgICAgdGhyb3cgbmV3IEVycm9yKGRhdGEuZXJyb3IgfHwgYEVycm9yOiAke3Jlc3BvbnNlLnN0YXR1c31gKTtcblxuICAgIGlmIChpc0xvZ2luKSB7XG4gICAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcInVzZXJcIiwgSlNPTi5zdHJpbmdpZnkoZGF0YS51c2VyIHx8IHt9KSk7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2FwcFwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBEb21VdGlscy5zaG93U3VjY2VzcyhcbiAgICAgICAgZGF0YS5tZXNzYWdlIHx8IFwiUmVnaXN0cmF0aW9uIHN1Y2Nlc3NmdWwuIFBsZWFzZSBsb2dpbi5cIlxuICAgICAgKTtcbiAgICAgIHN3aXRjaE1vZGUoXCJsb2dpblwiKTtcbiAgICAgIFtcImVtYWlsXCIsIFwicGFzc3dvcmRcIiwgXCJuYW1lXCJdLmZvckVhY2goKGlkKSA9PiB7XG4gICAgICAgIGNvbnN0IGVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgICAgICBpZiAoZWwpIGVsLnZhbHVlID0gXCJcIjtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNoZWNrUmVkaXJlY3RSZWFzb24oKSB7XG4gICAgY29uc3QgcmVhc29uID0gbmV3IFVSTFNlYXJjaFBhcmFtcyhsb2NhdGlvbi5zZWFyY2gpLmdldChcInJlYXNvblwiKTtcbiAgICBjb25zdCBtZXNzYWdlcyA9IHtcbiAgICAgIHVuYXV0aGVudGljYXRlZDogXCJQbGVhc2UgbG9nIGluIHRvIGFjY2VzcyB0aGUgYXBwbGljYXRpb24uXCIsXG4gICAgICBpbnZhbGlkX3Rva2VuOiBcIlNlc3Npb24gZXhwaXJlZC4gUGxlYXNlIGxvZyBpbiBhZ2Fpbi5cIixcbiAgICAgIGJhZF90b2tlbl9jbGFpbXM6IFwiU2Vzc2lvbiBkYXRhIGlzc3VlLiBQbGVhc2UgbG9nIGluIGFnYWluLlwiLFxuICAgIH07XG4gICAgaWYgKHJlYXNvbiAmJiBtZXNzYWdlc1tyZWFzb25dKSBEb21VdGlscy5zaG93RXJyb3IobWVzc2FnZXNbcmVhc29uXSk7XG4gICAgaGlzdG9yeS5yZXBsYWNlU3RhdGUobnVsbCwgXCJcIiwgbG9jYXRpb24ucGF0aG5hbWUpO1xuICB9XG5cbiAgcmV0dXJuIHsgaW5pdCB9O1xufSkoKTtcbiIsImltcG9ydCB7IENhdGVnb3J5IH0gZnJvbSBcIi4vY2F0ZWdvcnkuanNcIjtcbmltcG9ydCB7IEFwaVNlcnZpY2UgfSBmcm9tIFwiLi9hcGlTZXJ2aWNlLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBUb2RvID0gKCgpID0+IHtcbiAgbGV0IGN1cnJlbnRFZGl0aW5nVGFzayA9IG51bGw7XG4gIGxldCBpc0VkaXRpbmcgPSBmYWxzZTtcbiAgbGV0IGFsbFRhc2tzID0gW107IC8vIFN0b3JlIGFsbCB0YXNrcyBmb3IgZmlsdGVyaW5nXG5cbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvYXBwXCIpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YXNrLWZvcm1cIik7XG4gICAgICBjb25zdCBmb3JtSGVhZGluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZm9ybS1oZWFkaW5nXCIpO1xuICAgICAgY29uc3Qgc3VibWl0QnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdWJtaXQtYnV0dG9uXCIpO1xuICAgICAgY29uc3QgZGVsZXRlQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZWxldGUtYnV0dG9uXCIpO1xuICAgICAgY29uc3QgY2FuY2VsQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYW5jZWwtYnV0dG9uXCIpO1xuICAgICAgY29uc3QgYWRkVGFza0J1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLWFkZC10YXNrXCIpO1xuICAgICAgY29uc3QgYWxsRGF5Q2hlY2tib3ggPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFsbERheVwiKTtcbiAgICAgIGNvbnN0IHRpbWVJbnB1dHMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpbWVJbnB1dHNcIik7XG4gICAgICBjb25zdCBjb250ZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5jb250ZW50XCIpO1xuICAgICAgY29uc3QgY2xvc2VUYXNrRm9ybUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2xvc2UtdGFzay1mb3JtXCIpO1xuICAgICAgY29uc3QgYnRuQ2FsZW5kYXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1jYWxlbmRhclwiKTtcbiAgICAgIGNvbnN0IGJ0blVwY29taW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG4tdXBjb21pbmdcIik7XG4gICAgICBjb25zdCBidG5Ub2RheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLXRvZGF5XCIpO1xuXG4gICAgICAvLyBIZWxwZXIgdG8gc2hvdy9oaWRlIGZvcm0gYW5kIGJhY2tkcm9wXG4gICAgICBmdW5jdGlvbiBzaG93Rm9ybSgpIHtcbiAgICAgICAgZm9ybS5jbGFzc0xpc3QuYWRkKFwidmlzaWJsZVwiKTtcbiAgICAgICAgY29udGVudC5jbGFzc0xpc3QuYWRkKFwiZm9ybS1vcGVuXCIpO1xuICAgICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICAgIC8vIEFsd2F5cyBlbmFibGUgdGltZSBpbnB1dHMgb24gZm9ybSBvcGVuXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5kVGltZVwiKS5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBmb3JtLmZvY3VzICYmIGZvcm0uZm9jdXMoKTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBoaWRlRm9ybSgpIHtcbiAgICAgICAgZm9ybS5jbGFzc0xpc3QucmVtb3ZlKFwidmlzaWJsZVwiKTtcbiAgICAgICAgY29udGVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZm9ybS1vcGVuXCIpO1xuICAgICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgaWYgKGFkZFRhc2tCdXR0b24pIGFkZFRhc2tCdXR0b24uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgIH1cblxuICAgICAgLy8gVG9nZ2xlIHRpbWUgaW5wdXRzIGJhc2VkIG9uIEFsbCBEYXkgY2hlY2tib3hcbiAgICAgIGFsbERheUNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICBjb25zdCBpc0FsbERheSA9IGFsbERheUNoZWNrYm94LmNoZWNrZWQ7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLmRpc2FibGVkID0gaXNBbGxEYXk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5kVGltZVwiKS5kaXNhYmxlZCA9IGlzQWxsRGF5O1xuICAgICAgICBpZiAoaXNBbGxEYXkpIHtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0VGltZVwiKS52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLnZhbHVlID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIENhbGVuZGFyIGluaXRpYWxpemF0aW9uXG4gICAgICBjb25zdCBjYWxlbmRhckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYWxlbmRhclwiKTtcblxuICAgICAgLy8gSGlkZSBoZWFkZXIgaW1tZWRpYXRlbHkgYmVmb3JlIGNhbGVuZGFyIGlzIHJlbmRlcmVkXG4gICAgICBmdW5jdGlvbiBwcmVIaWRlSGVhZGVyKCkge1xuICAgICAgICAvLyBIaWRlIGhlYWRlciBhbmQgY2FsZW5kYXIgY29udGFpbmVyIGJlZm9yZSByZW5kZXIgdG8gYXZvaWQgbGF5b3V0IGZsYXNoXG4gICAgICAgIGNvbnN0IGZjSGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5mYy1oZWFkZXItdG9vbGJhclwiKTtcbiAgICAgICAgaWYgKGZjSGVhZGVyKSBmY0hlYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIGlmIChjYWxlbmRhckVsKSBjYWxlbmRhckVsLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgICAgfVxuICAgICAgcHJlSGlkZUhlYWRlcigpO1xuXG4gICAgICBjb25zdCBjYWxlbmRhciA9IG5ldyBGdWxsQ2FsZW5kYXIuQ2FsZW5kYXIoY2FsZW5kYXJFbCwge1xuICAgICAgICBpbml0aWFsVmlldzogXCJkYXlHcmlkTW9udGhcIixcbiAgICAgICAgZWRpdGFibGU6IHRydWUsXG4gICAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgICBzZWxlY3RNaXJyb3I6IHRydWUsXG4gICAgICAgIGRheU1heEV2ZW50czogdHJ1ZSxcbiAgICAgICAgZXZlbnRzOiBbXSxcbiAgICAgICAgZXZlbnRUaW1lRm9ybWF0OiB7IGhvdXI6IFwiMi1kaWdpdFwiLCBtaW51dGU6IFwiMi1kaWdpdFwiLCBob3VyMTI6IGZhbHNlIH0sIC8vIDI0LWhvdXIgZm9ybWF0IGZvciBldmVudCB0aW1lc1xuICAgICAgICBzbG90TGFiZWxGb3JtYXQ6IHsgaG91cjogXCIyLWRpZ2l0XCIsIG1pbnV0ZTogXCIyLWRpZ2l0XCIsIGhvdXIxMjogZmFsc2UgfSwgLy8gMjQtaG91ciBmb3JtYXQgZm9yIHRpbWUgYXhpcyBpbiB0aW1lR3JpZCB2aWV3c1xuICAgICAgICAvLyBTaG93IGN1c3RvbSBtZXNzYWdlIHdoZW4gbm8gZXZlbnRzXG4gICAgICAgIG5vRXZlbnRzQ29udGVudDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgIHJldHVybiBcIk5vIHRhc2tzIHRvIGRpc3BsYXlcIjtcbiAgICAgICAgfSxcbiAgICAgICAgLy8gUHJldmVudCBkcmFnZ2luZyBhbGwtZGF5IGV2ZW50cyBpbiB3ZWVrIChsaXN0V2VlaykgYW5kIHRvZGF5ICh0aW1lR3JpZERheSkgdmlld3NcbiAgICAgICAgZXZlbnRBbGxvdzogZnVuY3Rpb24gKGRyb3BJbmZvLCBkcmFnZ2VkRXZlbnQpIHtcbiAgICAgICAgICBjb25zdCB2aWV3VHlwZSA9IGNhbGVuZGFyLnZpZXcgPyBjYWxlbmRhci52aWV3LnR5cGUgOiBcIlwiO1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgICh2aWV3VHlwZSA9PT0gXCJsaXN0V2Vla1wiIHx8IHZpZXdUeXBlID09PSBcInRpbWVHcmlkRGF5XCIpICYmXG4gICAgICAgICAgICBkcmFnZ2VkRXZlbnQuYWxsRGF5XG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9LFxuICAgICAgICBldmVudENsaWNrOiBmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzayA9IGluZm8uZXZlbnQ7XG4gICAgICAgICAgaXNFZGl0aW5nID0gdHJ1ZTtcbiAgICAgICAgICBwb3B1bGF0ZUZvcm0oaW5mby5ldmVudCk7XG4gICAgICAgICAgdXBkYXRlRm9ybVVJKCk7XG4gICAgICAgICAgc2hvd0Zvcm0oKTtcbiAgICAgICAgfSxcbiAgICAgICAgZXZlbnREaWRNb3VudDogZnVuY3Rpb24gKGluZm8pIHtcbiAgICAgICAgICBjb25zdCBpc0NvbXBsZXRlZCA9IGluZm8uZXZlbnQuZXh0ZW5kZWRQcm9wcy5jb21wbGV0ZWQ7XG4gICAgICAgICAgaWYgKGlzQ29tcGxldGVkKSB7XG4gICAgICAgICAgICBpbmZvLmVsLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwiI2QzZDNkM1wiO1xuICAgICAgICAgICAgaW5mby5lbC5zdHlsZS50ZXh0RGVjb3JhdGlvbiA9IFwibGluZS10aHJvdWdoXCI7XG4gICAgICAgICAgICBpbmZvLmVsLnN0eWxlLm9wYWNpdHkgPSBcIjAuN1wiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIEFwcGx5IGNhdGVnb3J5IGNvbG9yIHRvIHRoZSB3aG9sZSBldmVudCBib2R5XG4gICAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBpbmZvLmV2ZW50LmV4dGVuZGVkUHJvcHMuY2F0ZWdvcnk7XG4gICAgICAgICAgaWYgKGNhdGVnb3J5ICYmIGNhdGVnb3J5ICE9PSBcIk5vbmVcIikge1xuICAgICAgICAgICAgY29uc3QgY2F0ID0gQ2F0ZWdvcnkuZ2V0Q2F0ZWdvcmllcygpLmZpbmQoXG4gICAgICAgICAgICAgIChjKSA9PiBjLm5hbWUgPT09IGNhdGVnb3J5XG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgaWYgKGNhdCkge1xuICAgICAgICAgICAgICBpbmZvLmVsLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IGNhdC5jb2xvcjtcbiAgICAgICAgICAgICAgaW5mby5lbC5zdHlsZS5ib3JkZXJMZWZ0ID0gYDRweCBzb2xpZCAke2NhdC5jb2xvcn1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmZvLmVsLnN0eWxlLmJvcmRlckxlZnQgPSBcIjRweCBzb2xpZCB0cmFuc3BhcmVudFwiO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFJlbW92ZSB0aGUgLmZjLWRheWdyaWQtZXZlbnQtZG90IGVsZW1lbnQgaWYgcHJlc2VudFxuICAgICAgICAgIGNvbnN0IGRvdCA9IGluZm8uZWwucXVlcnlTZWxlY3RvcignLmZjLWRheWdyaWQtZXZlbnQtZG90Jyk7XG4gICAgICAgICAgaWYgKGRvdCkgZG90LnJlbW92ZSgpO1xuICAgICAgICB9LFxuICAgICAgICBldmVudERyb3A6IGFzeW5jIGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGNvbnN0IGV2ZW50ID0gaW5mby5ldmVudDtcbiAgICAgICAgICAgIGxldCBzdGFydCA9IGV2ZW50LnN0YXJ0O1xuICAgICAgICAgICAgbGV0IGVuZCA9IGV2ZW50LmVuZDtcblxuICAgICAgICAgICAgLy8gRm9ybWF0IHN0YXJ0IGFuZCBlbmQgYXMgJ1lZWVktTU0tRERUSEg6bW0nXG4gICAgICAgICAgICBmdW5jdGlvbiBmb3JtYXREYXRlVGltZShkdCkge1xuICAgICAgICAgICAgICBpZiAoIWR0KSByZXR1cm4gXCJcIjtcbiAgICAgICAgICAgICAgLy8gUGFkIG1vbnRoLCBkYXksIGhvdXIsIG1pbnV0ZVxuICAgICAgICAgICAgICBjb25zdCB5eXl5ID0gZHQuZ2V0RnVsbFllYXIoKTtcbiAgICAgICAgICAgICAgY29uc3QgbW0gPSBTdHJpbmcoZHQuZ2V0TW9udGgoKSArIDEpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcbiAgICAgICAgICAgICAgY29uc3QgZGQgPSBTdHJpbmcoZHQuZ2V0RGF0ZSgpKS5wYWRTdGFydCgyLCBcIjBcIik7XG4gICAgICAgICAgICAgIGNvbnN0IGhoID0gU3RyaW5nKGR0LmdldEhvdXJzKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcbiAgICAgICAgICAgICAgY29uc3QgbWluID0gU3RyaW5nKGR0LmdldE1pbnV0ZXMoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuICAgICAgICAgICAgICByZXR1cm4gYCR7eXl5eX0tJHttbX0tJHtkZH1UJHtoaH06JHttaW59YDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IGZvcm1hdHRlZFN0YXJ0LCBmb3JtYXR0ZWRFbmQ7XG5cbiAgICAgICAgICAgIGlmIChldmVudC5hbGxEYXkpIHtcbiAgICAgICAgICAgICAgLy8gRm9yIGFsbERheSwgdXNlIGRhdGUgb25seVxuICAgICAgICAgICAgICBmb3JtYXR0ZWRTdGFydCA9IGV2ZW50LnN0YXJ0U3RyLnNsaWNlKDAsIDEwKTtcbiAgICAgICAgICAgICAgaWYgKGV2ZW50LmVuZCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVuZERhdGUgPSBuZXcgRGF0ZShldmVudC5lbmQpO1xuICAgICAgICAgICAgICAgIGVuZERhdGUuc2V0RGF0ZShlbmREYXRlLmdldERhdGUoKSAtIDEpO1xuICAgICAgICAgICAgICAgIGZvcm1hdHRlZEVuZCA9IGVuZERhdGUudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZm9ybWF0dGVkRW5kID0gZm9ybWF0dGVkU3RhcnQ7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIEZvciB0aW1lZCBldmVudHMsIHVzZSAnWVlZWS1NTS1ERFRISDptbSdcbiAgICAgICAgICAgICAgZm9ybWF0dGVkU3RhcnQgPSBmb3JtYXREYXRlVGltZShzdGFydCk7XG4gICAgICAgICAgICAgIGZvcm1hdHRlZEVuZCA9IGVuZCA/IGZvcm1hdERhdGVUaW1lKGVuZCkgOiBmb3JtYXR0ZWRTdGFydDtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgdXBkYXRlZERhdGEgPSB7XG4gICAgICAgICAgICAgIGlkOiBldmVudC5pZCxcbiAgICAgICAgICAgICAgdGl0bGU6IGV2ZW50LnRpdGxlLFxuICAgICAgICAgICAgICBzdGFydDogZm9ybWF0dGVkU3RhcnQsXG4gICAgICAgICAgICAgIGVuZDogZm9ybWF0dGVkRW5kLFxuICAgICAgICAgICAgICBhbGxEYXk6IGV2ZW50LmFsbERheSxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGV2ZW50LmV4dGVuZGVkUHJvcHMuZGVzY3JpcHRpb24sXG4gICAgICAgICAgICAgIGNhdGVnb3J5OiBldmVudC5leHRlbmRlZFByb3BzLmNhdGVnb3J5LFxuICAgICAgICAgICAgICBjb21wbGV0ZWQ6IGV2ZW50LmV4dGVuZGVkUHJvcHMuY29tcGxldGVkLFxuICAgICAgICAgICAgICBjbGFzc05hbWU6IGV2ZW50LmNsYXNzTmFtZXNcbiAgICAgICAgICAgICAgICAuZmlsdGVyKFxuICAgICAgICAgICAgICAgICAgKGMpID0+XG4gICAgICAgICAgICAgICAgICAgIGMgIT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICBjICE9PSBudWxsICYmXG4gICAgICAgICAgICAgICAgICAgIGMuc3RhcnRzV2l0aChcInByaW9yaXR5LVwiKSA9PT0gZmFsc2VcbiAgICAgICAgICAgICAgICApXG4gICAgICAgICAgICAgICAgLmpvaW4oXCIgXCIpLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWRUYXNrID0gYXdhaXQgQXBpU2VydmljZS51cGRhdGVUYXNrKFxuICAgICAgICAgICAgICBldmVudC5pZCxcbiAgICAgICAgICAgICAgdXBkYXRlZERhdGFcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICAvLyBFbnN1cmUgYWxsVGFza3MgaGFzIG9ubHkgb25lIGV2ZW50IHBlciBJRCAocmVwbGFjZSBvbGQgd2l0aCBuZXcpXG4gICAgICAgICAgICBhbGxUYXNrcyA9IFtcbiAgICAgICAgICAgICAgLi4uYWxsVGFza3MuZmlsdGVyKCh0KSA9PiB0LmlkICE9PSB1cGRhdGVkVGFzay5pZCksXG4gICAgICAgICAgICAgIHVwZGF0ZWRUYXNrLFxuICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIC8vIFJlbW92ZSBhbmQgcmUtYWRkIHRoZSBldmVudCB0byBmb3JjZSB1cGRhdGUgaW4gYWxsIHZpZXdzXG4gICAgICAgICAgICBjb25zdCBjdXJyZW50ID0gY2FsZW5kYXIuZ2V0RXZlbnRCeUlkKGV2ZW50LmlkKTtcbiAgICAgICAgICAgIGlmIChjdXJyZW50KSBjdXJyZW50LnJlbW92ZSgpO1xuICAgICAgICAgICAgY2FsZW5kYXIuYWRkRXZlbnQodXBkYXRlZFRhc2spO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBpbmZvLnJldmVydCgpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byB1cGRhdGUgZXZlbnQgYWZ0ZXIgZHJhZzpcIiwgZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgdmlld0RpZE1vdW50OiBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgICAgdXBkYXRlQ2FsZW5kYXJIZWFkZXJCdXR0b25zKGFyZy52aWV3LnR5cGUpO1xuICAgICAgICAgIC8vIEFsd2F5cyBmb3JjZSBhIHJlc2l6ZSBhZnRlciBhbnkgdmlldyBjaGFuZ2VcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNhbGVuZGFyLnVwZGF0ZVNpemUoKTtcbiAgICAgICAgICAgIC8vIFNob3cgY2FsZW5kYXIgYWZ0ZXIgcmVzaXplIHRvIGF2b2lkIGZsYXNoXG4gICAgICAgICAgICBpZiAoY2FsZW5kYXJFbCkgY2FsZW5kYXJFbC5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgLy8gRmV0Y2ggdGFza3MgZnJvbSBBUEkgYW5kIHJlbmRlciBjYWxlbmRhclxuICAgICAgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZUNhbGVuZGFyKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHRhc2tzID0gYXdhaXQgQXBpU2VydmljZS5mZXRjaFRhc2tzKCk7XG4gICAgICAgICAgYWxsVGFza3MgPSB0YXNrcztcbiAgICAgICAgICB0YXNrcy5mb3JFYWNoKCh0YXNrKSA9PiBjYWxlbmRhci5hZGRFdmVudCh0YXNrKSk7XG4gICAgICAgICAgY2FsZW5kYXIucmVuZGVyKCk7XG4gICAgICAgICAgLy8gRm9yY2UgY29ycmVjdCBzaXplIGFuZCBzaG93IGFmdGVyIGluaXRpYWwgcmVuZGVyXG4gICAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBjYWxlbmRhci51cGRhdGVTaXplKCk7XG4gICAgICAgICAgICBpZiAoY2FsZW5kYXJFbCkgY2FsZW5kYXJFbC5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBmZXRjaCB0YXNrczpcIiwgZXJyb3IpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGluaXRpYWxpemVDYWxlbmRhcigpO1xuXG4gICAgICAvLyBTaWRlYmFyIGJ1dHRvbiBldmVudCBsaXN0ZW5lcnNcbiAgICAgIGZ1bmN0aW9uIHNldEFjdGl2ZVNpZGViYXJCdXR0b24oYWN0aXZlQnRuKSB7XG4gICAgICAgIGRvY3VtZW50XG4gICAgICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2lkZWJhci1idG4sIC5jYXRlZ29yeS1pdGVtXCIpXG4gICAgICAgICAgLmZvckVhY2goKGJ0bikgPT4ge1xuICAgICAgICAgICAgYnRuLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIGlmIChhY3RpdmVCdG4pIGFjdGl2ZUJ0bi5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xuICAgICAgfVxuXG4gICAgICAvLyBIaWdobGlnaHQgQ2FsZW5kYXIgYnV0dG9uIG9uIGxvYWRcbiAgICAgIHNldEFjdGl2ZVNpZGViYXJCdXR0b24oYnRuQ2FsZW5kYXIpO1xuXG4gICAgICBpZiAoYnRuQ2FsZW5kYXIpIHtcbiAgICAgICAgYnRuQ2FsZW5kYXIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICBjYWxlbmRhci5jaGFuZ2VWaWV3KFwiZGF5R3JpZE1vbnRoXCIpO1xuICAgICAgICAgIHNldEFjdGl2ZVNpZGViYXJCdXR0b24oYnRuQ2FsZW5kYXIpO1xuICAgICAgICAgIHVwZGF0ZUNhbGVuZGFySGVhZGVyQnV0dG9ucyhcImRheUdyaWRNb250aFwiKTtcbiAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudChcInZpZXdDaGFuZ2VcIiwgeyBkZXRhaWw6IHsgdmlldzogXCJjYWxlbmRhclwiIH0gfSlcbiAgICAgICAgICApO1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY2FsZW5kYXIudXBkYXRlU2l6ZSgpO1xuICAgICAgICAgICAgaWYgKGNhbGVuZGFyRWwpIGNhbGVuZGFyRWwuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChidG5VcGNvbWluZykge1xuICAgICAgICBidG5VcGNvbWluZy5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgIGNhbGVuZGFyLmNoYW5nZVZpZXcoXCJsaXN0V2Vla1wiKTtcbiAgICAgICAgICBzZXRBY3RpdmVTaWRlYmFyQnV0dG9uKGJ0blVwY29taW5nKTtcbiAgICAgICAgICB1cGRhdGVDYWxlbmRhckhlYWRlckJ1dHRvbnMoXCJsaXN0V2Vla1wiKTtcbiAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudChcInZpZXdDaGFuZ2VcIiwgeyBkZXRhaWw6IHsgdmlldzogXCJ1cGNvbWluZ1wiIH0gfSlcbiAgICAgICAgICApO1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY2FsZW5kYXIudXBkYXRlU2l6ZSgpO1xuICAgICAgICAgICAgaWYgKGNhbGVuZGFyRWwpIGNhbGVuZGFyRWwuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICAgIGlmIChidG5Ub2RheSkge1xuICAgICAgICBidG5Ub2RheS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgIGNhbGVuZGFyLmNoYW5nZVZpZXcoXCJ0aW1lR3JpZERheVwiLCBuZXcgRGF0ZSgpKTtcbiAgICAgICAgICBzZXRBY3RpdmVTaWRlYmFyQnV0dG9uKGJ0blRvZGF5KTtcbiAgICAgICAgICB1cGRhdGVDYWxlbmRhckhlYWRlckJ1dHRvbnMoXCJ0aW1lR3JpZERheVwiKTtcbiAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudChcInZpZXdDaGFuZ2VcIiwgeyBkZXRhaWw6IHsgdmlldzogXCJ0b2RheVwiIH0gfSlcbiAgICAgICAgICApO1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY2FsZW5kYXIudXBkYXRlU2l6ZSgpO1xuICAgICAgICAgICAgaWYgKGNhbGVuZGFyRWwpIGNhbGVuZGFyRWwuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gTGlzdGVuIGZvciBjYXRlZ29yeSBmaWx0ZXIgZXZlbnRcbiAgICAgIHdpbmRvdy5hZGRFdmVudExpc3RlbmVyKFwiY2F0ZWdvcnlGaWx0ZXJcIiwgKGUpID0+IHtcbiAgICAgICAgY29uc3QgY2F0ZWdvcnkgPSBlLmRldGFpbC5jYXRlZ29yeTtcbiAgICAgICAgY2FsZW5kYXIucmVtb3ZlQWxsRXZlbnRzKCk7XG4gICAgICAgIGlmIChjYXRlZ29yeSkge1xuICAgICAgICAgIGNhbGVuZGFyLmNoYW5nZVZpZXcoXCJsaXN0WWVhclwiKTtcbiAgICAgICAgICAvLyBPbmx5IGFkZCB1bmlxdWUgZXZlbnRzIGJ5IElEXG4gICAgICAgICAgY29uc3QgZmlsdGVyZWQgPSBbXTtcbiAgICAgICAgICBjb25zdCBzZWVuID0gbmV3IFNldCgpO1xuICAgICAgICAgIGZvciAoY29uc3QgdGFzayBvZiBhbGxUYXNrcykge1xuICAgICAgICAgICAgaWYgKCh0YXNrLmNhdGVnb3J5IHx8IFwiTm9uZVwiKSA9PT0gY2F0ZWdvcnkgJiYgIXNlZW4uaGFzKHRhc2suaWQpKSB7XG4gICAgICAgICAgICAgIGZpbHRlcmVkLnB1c2godGFzayk7XG4gICAgICAgICAgICAgIHNlZW4uYWRkKHRhc2suaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBmaWx0ZXJlZC5mb3JFYWNoKCh0YXNrKSA9PiBjYWxlbmRhci5hZGRFdmVudCh0YXNrKSk7XG4gICAgICAgICAgZG9jdW1lbnRcbiAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNpZGViYXItYnRuLCAuY2F0ZWdvcnktaXRlbVwiKVxuICAgICAgICAgICAgLmZvckVhY2goKGJ0bikgPT4ge1xuICAgICAgICAgICAgICBidG4uY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIGNvbnN0IGNhdEJ0biA9IEFycmF5LmZyb20oXG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmNhdGVnb3J5LWl0ZW1cIilcbiAgICAgICAgICApLmZpbmQoKGxpKSA9PiBsaS50ZXh0Q29udGVudC5pbmNsdWRlcyhjYXRlZ29yeSkpO1xuICAgICAgICAgIGlmIChjYXRCdG4pIGNhdEJ0bi5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xuICAgICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY2FsZW5kYXIudXBkYXRlU2l6ZSgpO1xuICAgICAgICAgICAgaWYgKGNhbGVuZGFyRWwpIGNhbGVuZGFyRWwuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNhbGVuZGFyLmNoYW5nZVZpZXcoXCJkYXlHcmlkTW9udGhcIik7XG4gICAgICAgICAgLy8gT25seSBhZGQgdW5pcXVlIGV2ZW50cyBieSBJRFxuICAgICAgICAgIGNvbnN0IHVuaXF1ZSA9IFtdO1xuICAgICAgICAgIGNvbnN0IHNlZW4gPSBuZXcgU2V0KCk7XG4gICAgICAgICAgZm9yIChjb25zdCB0YXNrIG9mIGFsbFRhc2tzKSB7XG4gICAgICAgICAgICBpZiAoIXNlZW4uaGFzKHRhc2suaWQpKSB7XG4gICAgICAgICAgICAgIHVuaXF1ZS5wdXNoKHRhc2spO1xuICAgICAgICAgICAgICBzZWVuLmFkZCh0YXNrLmlkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgICAgdW5pcXVlLmZvckVhY2goKHRhc2spID0+IGNhbGVuZGFyLmFkZEV2ZW50KHRhc2spKTtcbiAgICAgICAgICBzZXRBY3RpdmVTaWRlYmFyQnV0dG9uKGJ0bkNhbGVuZGFyKTtcbiAgICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIGNhbGVuZGFyLnVwZGF0ZVNpemUoKTtcbiAgICAgICAgICAgIGlmIChjYWxlbmRhckVsKSBjYWxlbmRhckVsLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIEV2ZW50IExpc3RlbmVyc1xuICAgICAgaWYgKGFkZFRhc2tCdXR0b24pIHtcbiAgICAgICAgYWRkVGFza0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgIGlzRWRpdGluZyA9IGZhbHNlO1xuICAgICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzayA9IG51bGw7XG4gICAgICAgICAgZm9ybS5yZXNldCgpO1xuICAgICAgICAgIGFsbERheUNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICB0aW1lSW5wdXRzLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgICB1cGRhdGVGb3JtVUkoKTtcbiAgICAgICAgICBzaG93Rm9ybSgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGFzeW5jIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgZm9ybURhdGEgPSBnZXRGb3JtRGF0YSgpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKGlzRWRpdGluZykge1xuICAgICAgICAgICAgYXdhaXQgdXBkYXRlVGFzayhmb3JtRGF0YSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF3YWl0IGNyZWF0ZVRhc2soZm9ybURhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3JtLnJlc2V0KCk7XG4gICAgICAgICAgYWxsRGF5Q2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgIHRpbWVJbnB1dHMuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xuICAgICAgICAgIGhpZGVGb3JtKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBzYXZlIHRhc2s6XCIsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGRlbGV0ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoY3VycmVudEVkaXRpbmdUYXNrKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGRlbGV0ZVRhc2soY3VycmVudEVkaXRpbmdUYXNrLmlkKTsgLy8gPC0tIENhbGxzIGRlbGV0ZVRhc2ssIHdoaWNoIHVwZGF0ZXMgYWxsVGFza3NcbiAgICAgICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzay5yZW1vdmUoKTtcbiAgICAgICAgICAgIGZvcm0ucmVzZXQoKTtcbiAgICAgICAgICAgIGlzRWRpdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcbiAgICAgICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xuICAgICAgICAgICAgaGlkZUZvcm0oKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBkZWxldGUgdGFzazpcIiwgZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNhbmNlbEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICBmb3JtLnJlc2V0KCk7XG4gICAgICAgIGlzRWRpdGluZyA9IGZhbHNlO1xuICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xuICAgICAgICBhbGxEYXlDaGVja2JveC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgIHRpbWVJbnB1dHMuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICB1cGRhdGVGb3JtVUkoKTtcbiAgICAgICAgaGlkZUZvcm0oKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBBZGQgY2xvc2UgKGNyb3NzKSBidXR0b24gaGFuZGxlclxuICAgICAgaWYgKGNsb3NlVGFza0Zvcm1CdG4pIHtcbiAgICAgICAgY2xvc2VUYXNrRm9ybUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgIGZvcm0ucmVzZXQoKTtcbiAgICAgICAgICBpc0VkaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xuICAgICAgICAgIGFsbERheUNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICB0aW1lSW5wdXRzLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgICB1cGRhdGVGb3JtVUkoKTtcbiAgICAgICAgICBoaWRlRm9ybSgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gSGlkZSBmb3JtIG9uIGNsaWNrIG91dHNpZGVcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGUpID0+IHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGZvcm0uY2xhc3NMaXN0LmNvbnRhaW5zKFwidmlzaWJsZVwiKSAmJlxuICAgICAgICAgICFmb3JtLmNvbnRhaW5zKGUudGFyZ2V0KSAmJlxuICAgICAgICAgICEoYWRkVGFza0J1dHRvbiAmJiBhZGRUYXNrQnV0dG9uLmNvbnRhaW5zKGUudGFyZ2V0KSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgZm9ybS5yZXNldCgpO1xuICAgICAgICAgIGlzRWRpdGluZyA9IGZhbHNlO1xuICAgICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzayA9IG51bGw7XG4gICAgICAgICAgYWxsRGF5Q2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgIHRpbWVJbnB1dHMuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xuICAgICAgICAgIGhpZGVGb3JtKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBIaWRlIGZvcm0gaW5pdGlhbGx5XG4gICAgICBoaWRlRm9ybSgpO1xuXG4gICAgICAvLyBIZWxwZXIgZnVuY3Rpb25zXG4gICAgICBmdW5jdGlvbiB1cGRhdGVGb3JtVUkoKSB7XG4gICAgICAgIGlmIChpc0VkaXRpbmcpIHtcbiAgICAgICAgICBmb3JtSGVhZGluZy50ZXh0Q29udGVudCA9IFwiRWRpdCBUYXNrXCI7XG4gICAgICAgICAgc3VibWl0QnV0dG9uLnRleHRDb250ZW50ID0gXCJTYXZlIENoYW5nZXNcIjtcbiAgICAgICAgICBkZWxldGVCdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcbiAgICAgICAgICBjYW5jZWxCdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcbiAgICAgICAgICBpZiAoYWRkVGFza0J1dHRvbikgYWRkVGFza0J1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9ybUhlYWRpbmcudGV4dENvbnRlbnQgPSBcIkFkZCBOZXcgVGFza1wiO1xuICAgICAgICAgIHN1Ym1pdEJ1dHRvbi50ZXh0Q29udGVudCA9IFwiQWRkIFRhc2tcIjtcbiAgICAgICAgICBkZWxldGVCdXR0b24uY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICAgICAgICBjYW5jZWxCdXR0b24uY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICAgICAgICBpZiAoYWRkVGFza0J1dHRvbikgYWRkVGFza0J1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHBvcHVsYXRlRm9ybShldmVudCkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpdGxlXCIpLnZhbHVlID0gZXZlbnQudGl0bGU7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFza0RhdGVcIikudmFsdWUgPSBldmVudC5zdGFydFN0ci5zdWJzdHJpbmcoXG4gICAgICAgICAgMCxcbiAgICAgICAgICAxMFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBhbGxEYXkgPSBldmVudC5hbGxEYXk7XG4gICAgICAgIGFsbERheUNoZWNrYm94LmNoZWNrZWQgPSBhbGxEYXk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLmRpc2FibGVkID0gYWxsRGF5O1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuZFRpbWVcIikuZGlzYWJsZWQgPSBhbGxEYXk7XG5cbiAgICAgICAgaWYgKCFhbGxEYXkpIHtcbiAgICAgICAgICBjb25zdCBzdGFydERhdGUgPSBuZXcgRGF0ZShldmVudC5zdGFydCk7XG4gICAgICAgICAgY29uc3QgZW5kRGF0ZSA9IG5ldyBEYXRlKGV2ZW50LmVuZCB8fCBldmVudC5zdGFydCk7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFRpbWVcIikudmFsdWUgPSBzdGFydERhdGVcbiAgICAgICAgICAgIC50b1RpbWVTdHJpbmcoKVxuICAgICAgICAgICAgLnN1YnN0cmluZygwLCA1KTtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuZFRpbWVcIikudmFsdWUgPSBlbmREYXRlXG4gICAgICAgICAgICAudG9UaW1lU3RyaW5nKClcbiAgICAgICAgICAgIC5zdWJzdHJpbmcoMCwgNSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFRpbWVcIikudmFsdWUgPSBcIlwiO1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5kVGltZVwiKS52YWx1ZSA9IFwiXCI7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlc2NyaXB0aW9uXCIpLnZhbHVlID1cbiAgICAgICAgICBldmVudC5leHRlbmRlZFByb3BzLmRlc2NyaXB0aW9uIHx8IFwiXCI7XG4gICAgICAgIC8vIFJlbW92ZSBwcmlvcml0eVxuICAgICAgICAvLyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5XCIpLnZhbHVlID1cbiAgICAgICAgLy8gICBldmVudC5leHRlbmRlZFByb3BzLnByaW9yaXR5IHx8IFwibG93XCI7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2F0ZWdvcnlcIikudmFsdWUgPVxuICAgICAgICAgIGV2ZW50LmV4dGVuZGVkUHJvcHMuY2F0ZWdvcnkgfHwgXCJOb25lXCI7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29tcGxldGVkXCIpLmNoZWNrZWQgPVxuICAgICAgICAgIGV2ZW50LmV4dGVuZGVkUHJvcHMuY29tcGxldGVkIHx8IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBnZXRGb3JtRGF0YSgpIHtcbiAgICAgICAgY29uc3QgY2F0ZWdvcnlWYWx1ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2F0ZWdvcnlcIikudmFsdWU7XG4gICAgICAgIGNvbnN0IGFsbERheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWxsRGF5XCIpLmNoZWNrZWQ7XG4gICAgICAgIGNvbnN0IGRhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhc2tEYXRlXCIpLnZhbHVlO1xuICAgICAgICBsZXQgc3RhcnQsIGVuZDtcblxuICAgICAgICBpZiAoYWxsRGF5KSB7XG4gICAgICAgICAgc3RhcnQgPSBkYXRlO1xuICAgICAgICAgIGVuZCA9IGRhdGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFRpbWVcIikudmFsdWU7XG4gICAgICAgICAgY29uc3QgZW5kVGltZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5kVGltZVwiKS52YWx1ZTtcbiAgICAgICAgICBzdGFydCA9IHN0YXJ0VGltZSA/IGAke2RhdGV9VCR7c3RhcnRUaW1lfWAgOiBkYXRlO1xuICAgICAgICAgIGVuZCA9IGVuZFRpbWUgPyBgJHtkYXRlfVQke2VuZFRpbWV9YCA6IHN0YXJ0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogaXNFZGl0aW5nID8gY3VycmVudEVkaXRpbmdUYXNrLmlkIDogdW5kZWZpbmVkLFxuICAgICAgICAgIHRpdGxlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpdGxlXCIpLnZhbHVlLFxuICAgICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgICBlbmQ6IGVuZCxcbiAgICAgICAgICBhbGxEYXk6IGFsbERheSxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXNjcmlwdGlvblwiKS52YWx1ZSxcbiAgICAgICAgICAvLyBSZW1vdmUgcHJpb3JpdHlcbiAgICAgICAgICAvLyBwcmlvcml0eTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eVwiKS52YWx1ZSxcbiAgICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnlWYWx1ZSA9PT0gXCJOb25lXCIgPyBudWxsIDogY2F0ZWdvcnlWYWx1ZSxcbiAgICAgICAgICBjb21wbGV0ZWQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29tcGxldGVkXCIpLmNoZWNrZWQsXG4gICAgICAgICAgLy8gUmVtb3ZlIHByaW9yaXR5IGZyb20gY2xhc3NOYW1lXG4gICAgICAgICAgY2xhc3NOYW1lOiBgJHtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29tcGxldGVkXCIpLmNoZWNrZWQgPyBcImNvbXBsZXRlZC10YXNrXCIgOiBcIlwiXG4gICAgICAgICAgfWAsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVRhc2soZGF0YSkge1xuICAgICAgICBjb25zdCBuZXdUYXNrID0gYXdhaXQgQXBpU2VydmljZS5jcmVhdGVUYXNrKGRhdGEpO1xuICAgICAgICBhbGxUYXNrcy5wdXNoKG5ld1Rhc2spO1xuICAgICAgICBjYWxlbmRhci5hZGRFdmVudChuZXdUYXNrKTtcbiAgICAgICAgcmV0dXJuIG5ld1Rhc2s7XG4gICAgICB9XG5cbiAgICAgIGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVRhc2soZGF0YSkge1xuICAgICAgICBjb25zdCB1cGRhdGVkVGFzayA9IGF3YWl0IEFwaVNlcnZpY2UudXBkYXRlVGFzayhkYXRhLmlkLCBkYXRhKTtcbiAgICAgICAgLy8gRW5zdXJlIGFsbFRhc2tzIGhhcyBvbmx5IG9uZSBldmVudCBwZXIgSUQgKHJlcGxhY2Ugb2xkIHdpdGggbmV3KVxuICAgICAgICBhbGxUYXNrcyA9IFtcbiAgICAgICAgICAuLi5hbGxUYXNrcy5maWx0ZXIoKHQpID0+IHQuaWQgIT09IHVwZGF0ZWRUYXNrLmlkKSxcbiAgICAgICAgICB1cGRhdGVkVGFzayxcbiAgICAgICAgXTtcbiAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrLnJlbW92ZSgpO1xuICAgICAgICBjYWxlbmRhci5hZGRFdmVudCh1cGRhdGVkVGFzayk7XG4gICAgICAgIHJldHVybiB1cGRhdGVkVGFzaztcbiAgICAgIH1cblxuICAgICAgYXN5bmMgZnVuY3Rpb24gZGVsZXRlVGFzayhpZCkge1xuICAgICAgICBjb25zb2xlLmxvZyhcbiAgICAgICAgICBcImFsbFRhc2tzIGJlZm9yZSBkZWxldGU6XCIsXG4gICAgICAgICAgYWxsVGFza3MubWFwKCh0KSA9PiB0LmlkKVxuICAgICAgICApO1xuICAgICAgICBhd2FpdCBBcGlTZXJ2aWNlLmRlbGV0ZVRhc2soaWQpO1xuICAgICAgICAvLyBFbnN1cmUgaWQgY29tcGFyaXNvbiBpcyBhbHdheXMgc3RyaW5nLWJhc2VkIGFuZCB1cGRhdGUgYXJyYXkgaW4gcGxhY2VcbiAgICAgICAgY29uc3QgaWRTdHIgPSBTdHJpbmcoaWQpO1xuICAgICAgICBmb3IgKGxldCBpID0gYWxsVGFza3MubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgICBpZiAoU3RyaW5nKGFsbFRhc2tzW2ldLmlkKSA9PT0gaWRTdHIpIHtcbiAgICAgICAgICAgIGFsbFRhc2tzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgY29uc29sZS5sb2coXCJEZWxldGVkIHRhc2sgaWQ6XCIsIGlkKTtcbiAgICAgICAgY29uc29sZS5sb2coXG4gICAgICAgICAgXCJhbGxUYXNrcyBhZnRlciBkZWxldGU6XCIsXG4gICAgICAgICAgYWxsVGFza3MubWFwKCh0KSA9PiB0LmlkKVxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyBBZnRlciBjYWxlbmRhciBpbml0aWFsaXphdGlvblxuICAgICAgZnVuY3Rpb24gdXBkYXRlQ2FsZW5kYXJIZWFkZXJCdXR0b25zKHZpZXdUeXBlKSB7XG4gICAgICAgIGNvbnN0IGZjSGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5mYy1oZWFkZXItdG9vbGJhclwiKTtcbiAgICAgICAgaWYgKCFmY0hlYWRlcikgcmV0dXJuO1xuICAgICAgICAvLyBIaWRlIGhlYWRlciBmb3IgbGlzdFdlZWsgKFVwY29taW5nKSwgdGltZUdyaWREYXkgKFRvZGF5KSwgYW5kIGxpc3RZZWFyIChZZWFyKVxuICAgICAgICBpZiAoXG4gICAgICAgICAgdmlld1R5cGUgPT09IFwibGlzdFdlZWtcIiB8fFxuICAgICAgICAgIHZpZXdUeXBlID09PSBcInRpbWVHcmlkRGF5XCIgfHxcbiAgICAgICAgICB2aWV3VHlwZSA9PT0gXCJsaXN0WWVhclwiXG4gICAgICAgICkge1xuICAgICAgICAgIGZjSGVhZGVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmY0hlYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcmV2QnRuID0gZmNIZWFkZXIucXVlcnlTZWxlY3RvcihcIi5mYy1wcmV2LWJ1dHRvblwiKTtcbiAgICAgICAgY29uc3QgbmV4dEJ0biA9IGZjSGVhZGVyLnF1ZXJ5U2VsZWN0b3IoXCIuZmMtbmV4dC1idXR0b25cIik7XG4gICAgICAgIGNvbnN0IHRvZGF5QnRuID0gZmNIZWFkZXIucXVlcnlTZWxlY3RvcihcIi5mYy10b2RheS1idXR0b25cIik7XG4gICAgICAgIC8vIEhpZGUgcmlnaHQtc2lkZSB2aWV3IHN3aXRjaGVycyBpZiBwcmVzZW50XG4gICAgICAgIGNvbnN0IHJpZ2h0QnRucyA9IGZjSGVhZGVyLnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgXCIuZmMtdG9vbGJhci1jaHVuazpsYXN0LWNoaWxkIC5mYy1idXR0b25cIlxuICAgICAgICApO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgdmlld1R5cGUgPT09IFwibGlzdFdlZWtcIiB8fFxuICAgICAgICAgIHZpZXdUeXBlID09PSBcInRpbWVHcmlkRGF5XCIgfHxcbiAgICAgICAgICB2aWV3VHlwZSA9PT0gXCJsaXN0WWVhclwiXG4gICAgICAgICkge1xuICAgICAgICAgIGlmIChwcmV2QnRuKSBwcmV2QnRuLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICBpZiAobmV4dEJ0bikgbmV4dEJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgaWYgKHRvZGF5QnRuKSB0b2RheUJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgcmlnaHRCdG5zLmZvckVhY2goKGJ0bikgPT4gKGJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCIpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAocHJldkJ0bikgcHJldkJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgICAgICBpZiAobmV4dEJ0bikgbmV4dEJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgICAgICBpZiAodG9kYXlCdG4pIHRvZGF5QnRuLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgICAgICAgIHJpZ2h0QnRucy5mb3JFYWNoKChidG4pID0+IChidG4uc3R5bGUuZGlzcGxheSA9IFwiXCIpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFJlbW92ZSAuZmMtc2Nyb2xsZ3JpZC1zZWN0aW9uLWhlYWRlciBvbiBcInRvZGF5XCIgdmlldyAodGltZUdyaWREYXkpXG4gICAgICAgIGNvbnN0IHNlY3Rpb25IZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFxuICAgICAgICAgIFwiLmZjLXNjcm9sbGdyaWQtc2VjdGlvbi1oZWFkZXJcIlxuICAgICAgICApO1xuICAgICAgICBpZiAodmlld1R5cGUgPT09IFwidGltZUdyaWREYXlcIikge1xuICAgICAgICAgIGlmIChzZWN0aW9uSGVhZGVyKSBzZWN0aW9uSGVhZGVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoc2VjdGlvbkhlYWRlcikgc2VjdGlvbkhlYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjYWxlbmRhci5vbihcInZpZXdEaWRNb3VudFwiLCBmdW5jdGlvbiAoYXJnKSB7XG4gICAgICAgIHVwZGF0ZUNhbGVuZGFySGVhZGVyQnV0dG9ucyhhcmcudmlldy50eXBlKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBSZW5kZXIgY2FsZW5kYXIgYWZ0ZXIgRE9NIGlzIHJlYWR5IGFuZCBoZWFkZXIgaXMgaGlkZGVuXG4gICAgICBjYWxlbmRhci5yZW5kZXIoKTtcblxuICAgICAgLy8gSGlkZSBoZWFkZXIgb24gaW5pdGlhbCBsb2FkIGlmIGluIGxpc3RXZWVrIChVcGNvbWluZylcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCBmY0hlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZmMtaGVhZGVyLXRvb2xiYXJcIik7XG4gICAgICAgIGlmIChmY0hlYWRlcikgZmNIZWFkZXIuc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICB9LCAxMDApO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiB7fTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBBcGlTZXJ2aWNlIH0gZnJvbSBcIi4vYXBpU2VydmljZS5qc1wiO1xuXG5leHBvcnQgY29uc3QgQ2F0ZWdvcnkgPSAoKCkgPT4ge1xuICBsZXQgY2F0ZWdvcmllcyA9IFtdO1xuICBsZXQgYWN0aXZlQ2F0ZWdvcnkgPSBudWxsOyAvLyBUcmFjayB0aGUgY3VycmVudGx5IHNlbGVjdGVkIGNhdGVnb3J5XG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9ucyBkZWZpbmVkIG91dHNpZGUgRE9NQ29udGVudExvYWRlZFxuICBmdW5jdGlvbiByZW5kZXJDYXRlZ29yaWVzKCkge1xuICAgIGNvbnN0IGNhdGVnb3JpZXNDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3JpZXMtY29udGFpbmVyXCIpO1xuXG4gICAgY2F0ZWdvcmllc0NvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xuXG4gICAgY2F0ZWdvcmllcy5mb3JFYWNoKChjYXRlZ29yeSwgaW5kZXgpID0+IHtcbiAgICAgIC8vIEVuc3VyZSBjYXRlZ29yeS5pZCBpcyBhIHN0cmluZyBmb3IgY29uc2lzdGVuY3lcbiAgICAgIGNvbnN0IGxpID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpXCIpO1xuICAgICAgbGkuY2xhc3NOYW1lID0gXCJjYXRlZ29yeS1pdGVtXCI7XG4gICAgICBpZiAoYWN0aXZlQ2F0ZWdvcnkgPT09IGNhdGVnb3J5Lm5hbWUpIHtcbiAgICAgICAgbGkuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcbiAgICAgIH1cbiAgICAgIGxpLmlubmVySFRNTCA9IGBcbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiY2F0ZWdvcnktY29udGVudFwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjYXRlZ29yeS1jb2xvclwiIHN0eWxlPVwiYmFja2dyb3VuZC1jb2xvcjogJHtjYXRlZ29yeS5jb2xvcn07XCI+PC9zcGFuPiBcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY2F0ZWdvcnktbmFtZVwiPiR7Y2F0ZWdvcnkubmFtZX08L3NwYW4+XG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImRlbGV0ZS1jYXRlZ29yeS1idG5cIiBkYXRhLWlkPVwiJHtjYXRlZ29yeS5pZH1cIj5cbiAgICAgICAgICAgIDxpIGNsYXNzPVwiZmFzIGZhLXRyYXNoXCI+PC9pPlxuICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICBgO1xuICAgICAgLy8gQWRkIGNsaWNrIGV2ZW50IGZvciBmaWx0ZXJpbmdcbiAgICAgIGxpLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xuICAgICAgICAvLyBQcmV2ZW50IGNsaWNrIGlmIGRlbGV0ZSBidXR0b24gaXMgY2xpY2tlZFxuICAgICAgICBpZiAoZS50YXJnZXQuY2xvc2VzdChcIi5kZWxldGUtY2F0ZWdvcnktYnRuXCIpKSByZXR1cm47XG4gICAgICAgIGFjdGl2ZUNhdGVnb3J5ID0gY2F0ZWdvcnkubmFtZTtcbiAgICAgICAgLy8gUmVtb3ZlIC5hY3RpdmUgZnJvbSBhbGwgc2lkZWJhci1idG4gYW5kIGNhdGVnb3J5LWl0ZW1cbiAgICAgICAgZG9jdW1lbnRcbiAgICAgICAgICAucXVlcnlTZWxlY3RvckFsbChcIi5zaWRlYmFyLWJ0biwgLmNhdGVnb3J5LWl0ZW1cIilcbiAgICAgICAgICAuZm9yRWFjaCgoYnRuKSA9PiB7XG4gICAgICAgICAgICBidG4uY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgbGkuY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcbiAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xuICAgICAgICAvLyBEaXNwYXRjaCBjdXN0b20gZXZlbnQgZm9yIGZpbHRlcmluZ1xuICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJjYXRlZ29yeUZpbHRlclwiLCB7XG4gICAgICAgICAgICBkZXRhaWw6IHsgY2F0ZWdvcnk6IGNhdGVnb3J5Lm5hbWUgfSxcbiAgICAgICAgICB9KVxuICAgICAgICApO1xuICAgICAgfSk7XG4gICAgICBjYXRlZ29yaWVzQ29udGFpbmVyLmFwcGVuZENoaWxkKGxpKTtcbiAgICB9KTtcblxuICAgIC8vIEFkZCBldmVudCBsaXN0ZW5lcnMgdG8gZGVsZXRlIGJ1dHRvbnNcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiLmRlbGV0ZS1jYXRlZ29yeS1idG5cIikuZm9yRWFjaCgoYnRuKSA9PiB7XG4gICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XG4gICAgICAgIC8vIEVuc3VyZSBpZCBpcyB0cmVhdGVkIGFzIGEgc3RyaW5nXG4gICAgICAgIGNvbnN0IGlkID0gYnRuLmRhdGFzZXQuaWQ7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQXR0ZW1wdGluZyB0byBkZWxldGUgY2F0ZWdvcnkgd2l0aCBpZDpcIiwgaWQpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkN1cnJlbnQgY2F0ZWdvcmllczpcIiwgY2F0ZWdvcmllcyk7XG4gICAgICAgIGRlbGV0ZUNhdGVnb3J5KGlkKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKSB7XG4gICAgY29uc3QgY2F0ZWdvcnlTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3J5XCIpO1xuICAgIGNhdGVnb3J5U2VsZWN0LmlubmVySFRNTCA9IFwiXCI7XG5cbiAgICAvLyBBZGQgXCJOb25lXCIgb3B0aW9uIGZpcnN0XG4gICAgY29uc3Qgbm9uZU9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XG4gICAgbm9uZU9wdGlvbi52YWx1ZSA9IFwiTm9uZVwiO1xuICAgIG5vbmVPcHRpb24udGV4dENvbnRlbnQgPSBcIk5vbmVcIjtcbiAgICBjYXRlZ29yeVNlbGVjdC5hcHBlbmRDaGlsZChub25lT3B0aW9uKTtcblxuICAgIC8vIEFkZCBhbGwgY2F0ZWdvcnkgb3B0aW9uc1xuICAgIGNhdGVnb3JpZXMuZm9yRWFjaCgoY2F0ZWdvcnkpID0+IHtcbiAgICAgIGNvbnN0IG9wdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvcHRpb25cIik7XG4gICAgICBvcHRpb24udmFsdWUgPSBjYXRlZ29yeS5uYW1lO1xuICAgICAgb3B0aW9uLnRleHRDb250ZW50ID0gY2F0ZWdvcnkubmFtZTtcbiAgICAgIGNhdGVnb3J5U2VsZWN0LmFwcGVuZENoaWxkKG9wdGlvbik7XG4gICAgfSk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBkZWxldGVDYXRlZ29yeShpZCkge1xuICAgIC8vIENvbnZlcnQgaWQgdG8gc3RyaW5nIGZvciBjb25zaXN0ZW5jeVxuICAgIGNvbnN0IGluZGV4ID0gY2F0ZWdvcmllcy5maW5kSW5kZXgoXG4gICAgICAoYykgPT4gYy5pZC50b1N0cmluZygpID09PSBpZC50b1N0cmluZygpXG4gICAgKTtcbiAgICBjb25zb2xlLmxvZyhcImRlbGV0ZUNhdGVnb3J5IGNhbGxlZCB3aXRoIGlkOlwiLCBpZCwgXCJGb3VuZCBpbmRleDpcIiwgaW5kZXgpO1xuXG4gICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIC8vIERlbGV0ZSBjYXRlZ29yeSB2aWEgQVBJXG4gICAgICAgIGF3YWl0IEFwaVNlcnZpY2UuZGVsZXRlQ2F0ZWdvcnkoaWQpO1xuICAgICAgICAvLyBSZW1vdmUgZnJvbSBsb2NhbCBzdGF0ZVxuICAgICAgICBjYXRlZ29yaWVzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHJlbmRlckNhdGVnb3JpZXMoKTtcbiAgICAgICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZGVsZXRlIGNhdGVnb3J5OlwiLCBlcnJvcik7XG4gICAgICAgIC8vIE9wdGlvbmFsbHkgc2hvdyBlcnJvciBtZXNzYWdlIHRvIHVzZXJcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgY29uc29sZS5lcnJvcihcIkNhdGVnb3J5IG5vdCBmb3VuZCB3aXRoIGlkOlwiLCBpZCk7XG4gICAgfVxuICB9XG5cbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvYXBwXCIpIHtcbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICBjb25zdCBjYXRlZ29yeVNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2F0ZWdvcnlcIik7XG4gICAgICBjb25zdCBjYXRlZ29yaWVzQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXG4gICAgICAgIFwiY2F0ZWdvcmllcy1jb250YWluZXJcIlxuICAgICAgKTtcbiAgICAgIGNvbnN0IGFkZE5ld0NhdGVnb3J5QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhZGQtbmV3LWNhdGVnb3J5LWJ0blwiKTtcbiAgICAgIGNvbnN0IG5ld0NhdGVnb3J5Rm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3LWNhdGVnb3J5LWZvcm1cIik7XG4gICAgICBjb25zdCBjcmVhdGVDYXRlZ29yeUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY3JlYXRlLWNhdGVnb3J5LWJ0blwiKTtcblxuICAgICAgLy8gRmV0Y2ggY2F0ZWdvcmllcyBmcm9tIEFQSVxuICAgICAgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZUNhdGVnb3JpZXMoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY2F0ZWdvcmllcyA9IGF3YWl0IEFwaVNlcnZpY2UuZmV0Y2hDYXRlZ29yaWVzKCk7XG4gICAgICAgICAgY29uc29sZS5sb2coXCJGZXRjaGVkIGNhdGVnb3JpZXM6XCIsIGNhdGVnb3JpZXMpO1xuICAgICAgICAgIHJlbmRlckNhdGVnb3JpZXMoKTtcbiAgICAgICAgICB1cGRhdGVDYXRlZ29yeVNlbGVjdCgpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZmV0Y2ggY2F0ZWdvcmllczpcIiwgZXJyb3IpO1xuICAgICAgICAgIC8vIE9wdGlvbmFsbHkgc2hvdyBlcnJvciBtZXNzYWdlIHRvIHVzZXJcbiAgICAgICAgICByZW5kZXJDYXRlZ29yaWVzKCk7XG4gICAgICAgICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpbml0aWFsaXplQ2F0ZWdvcmllcygpO1xuXG4gICAgICAvLyBDYXRlZ29yeSBtYW5hZ2VtZW50XG4gICAgICBhZGROZXdDYXRlZ29yeUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICBuZXdDYXRlZ29yeUZvcm0uc3R5bGUuZGlzcGxheSA9XG4gICAgICAgICAgbmV3Q2F0ZWdvcnlGb3JtLnN0eWxlLmRpc3BsYXkgPT09IFwibm9uZVwiID8gXCJmbGV4XCIgOiBcIm5vbmVcIjtcbiAgICAgIH0pO1xuXG4gICAgICBjcmVhdGVDYXRlZ29yeUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgICBjb25zdCBuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctY2F0ZWdvcnktbmFtZVwiKS52YWx1ZS50cmltKCk7XG4gICAgICAgIGNvbnN0IGNvbG9yID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctY2F0ZWdvcnktY29sb3JcIikudmFsdWU7XG5cbiAgICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgLy8gTG9nIHRoZSBwYXlsb2FkIGJlaW5nIHNlbnQgdG8gdGhlIGJhY2tlbmRcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiU2VuZGluZyBjYXRlZ29yeSB0byBiYWNrZW5kOlwiLCB7IG5hbWUsIGNvbG9yIH0pO1xuICAgICAgICAgICAgLy8gQWRkIG5ldyBjYXRlZ29yeSB2aWEgQVBJXG4gICAgICAgICAgICBjb25zdCBhcGlDYXRlZ29yeSA9IGF3YWl0IEFwaVNlcnZpY2UuY3JlYXRlQ2F0ZWdvcnkoe1xuICAgICAgICAgICAgICBuYW1lLFxuICAgICAgICAgICAgICBjb2xvcixcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2F0ZWdvcmllcy5wdXNoKGFwaUNhdGVnb3J5KTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiQWRkZWQgbmV3IGNhdGVnb3J5OlwiLCBhcGlDYXRlZ29yeSk7XG4gICAgICAgICAgICByZW5kZXJDYXRlZ29yaWVzKCk7XG4gICAgICAgICAgICB1cGRhdGVDYXRlZ29yeVNlbGVjdCgpO1xuXG4gICAgICAgICAgICAvLyBSZXNldCBmb3JtXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1uYW1lXCIpLnZhbHVlID0gXCJcIjtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3LWNhdGVnb3J5LWNvbG9yXCIpLnZhbHVlID0gXCIjY2NjY2NjXCI7XG4gICAgICAgICAgICBuZXdDYXRlZ29yeUZvcm0uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGNyZWF0ZSBjYXRlZ29yeTpcIiwgZXJyb3IpO1xuICAgICAgICAgICAgLy8gT3B0aW9uYWxseSBzaG93IGVycm9yIG1lc3NhZ2UgdG8gdXNlclxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIEFkZCBhIGdsb2JhbCBsaXN0ZW5lciB0byBjbGVhciBmaWx0ZXIgd2hlbiBjbGlja2luZyBcIkNhbGVuZGFyXCIgb3IgXCJVcGNvbWluZ1wiIG9yIFwiVG9kYXlcIlxuICAgICAgW1wiYnRuLWNhbGVuZGFyXCIsIFwiYnRuLXVwY29taW5nXCIsIFwiYnRuLXRvZGF5XCJdLmZvckVhY2goKGlkKSA9PiB7XG4gICAgICAgIGNvbnN0IGJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAgICAgaWYgKGJ0bikge1xuICAgICAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgICAgYWN0aXZlQ2F0ZWdvcnkgPSBudWxsO1xuICAgICAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xuICAgICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICAgIG5ldyBDdXN0b21FdmVudChcImNhdGVnb3J5RmlsdGVyXCIsIHsgZGV0YWlsOiB7IGNhdGVnb3J5OiBudWxsIH0gfSlcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG4gIHJldHVybiB7XG4gICAgZ2V0Q2F0ZWdvcmllczogKCkgPT4gY2F0ZWdvcmllcyxcbiAgICByZW5kZXJDYXRlZ29yaWVzLFxuICAgIHVwZGF0ZUNhdGVnb3J5U2VsZWN0LFxuICB9O1xufSkoKTtcbiIsImV4cG9ydCBjb25zdCBEb21VdGlscyA9ICgoKSA9PiB7XG4gIGZ1bmN0aW9uIGNsZWFyTWVzc2FnZXMoKSB7XG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZXNzYWdlQ29udGFpbmVyXCIpO1xuICAgIGlmIChjb250YWluZXIpIGNvbnRhaW5lci5pbm5lckhUTUwgPSBcIlwiO1xuICAgIGRvY3VtZW50XG4gICAgICAucXVlcnlTZWxlY3RvckFsbChcIi5lcnJvci1tZXNzYWdlLCAuc3VjY2Vzcy1tZXNzYWdlXCIpXG4gICAgICAuZm9yRWFjaCgoZWwpID0+IHtcbiAgICAgICAgaWYgKGVsLnBhcmVudE5vZGUgIT09IGNvbnRhaW5lcikgZWwucmVtb3ZlKCk7XG4gICAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNob3dNZXNzYWdlKG1lc3NhZ2UsIHR5cGUgPSBcImVycm9yXCIpIHtcbiAgICBjbGVhck1lc3NhZ2VzKCk7XG4gICAgY29uc3QgbWVzc2FnZUVsZW1lbnQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIG1lc3NhZ2VFbGVtZW50LmNsYXNzTmFtZSA9XG4gICAgICB0eXBlID09PSBcImVycm9yXCIgPyBcImVycm9yLW1lc3NhZ2VcIiA6IFwic3VjY2Vzcy1tZXNzYWdlXCI7XG4gICAgbWVzc2FnZS5zcGxpdChcIlxcblwiKS5mb3JFYWNoKChsaW5lKSA9PiB7XG4gICAgICBjb25zdCBwID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInBcIik7XG4gICAgICBwLnRleHRDb250ZW50ID0gbGluZTtcbiAgICAgIG1lc3NhZ2VFbGVtZW50LmFwcGVuZENoaWxkKHApO1xuICAgIH0pO1xuXG4gICAgY29uc3QgY29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJtZXNzYWdlQ29udGFpbmVyXCIpO1xuICAgIGlmIChjb250YWluZXIpIHtcbiAgICAgIGNvbnRhaW5lci5hcHBlbmRDaGlsZChtZXNzYWdlRWxlbWVudCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1dGhGb3JtXCIpO1xuICAgICAgZm9ybVxuICAgICAgICA/IGZvcm0ucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUobWVzc2FnZUVsZW1lbnQsIGZvcm0pXG4gICAgICAgIDogZG9jdW1lbnQuYm9keS5wcmVwZW5kKG1lc3NhZ2VFbGVtZW50KTtcbiAgICB9XG4gIH1cblxuICAvLyBDcmVhdGUgYSBmbG9hdGluZyBlcnJvciBtZXNzYWdlIGNvbnRhaW5lciBpZiBub3QgcHJlc2VudFxuICBmdW5jdGlvbiBzaG93RmxvYXRpbmdFcnJvcihtZXNzYWdlLCB0eXBlID0gXCJlcnJvclwiKSB7XG4gICAgbGV0IGZsb2F0aW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmbG9hdGluZ01lc3NhZ2VcIik7XG4gICAgaWYgKCFmbG9hdGluZykge1xuICAgICAgZmxvYXRpbmcgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgZmxvYXRpbmcuaWQgPSBcImZsb2F0aW5nTWVzc2FnZVwiO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChmbG9hdGluZyk7XG4gICAgfVxuICAgIGZsb2F0aW5nLnRleHRDb250ZW50ID0gbWVzc2FnZTtcbiAgICBmbG9hdGluZy5jbGFzc05hbWUgPVxuICAgICAgdHlwZSA9PT0gXCJzdWNjZXNzXCJcbiAgICAgICAgPyBcImZsb2F0aW5nLW1lc3NhZ2Ugc3VjY2Vzc1wiXG4gICAgICAgIDogXCJmbG9hdGluZy1tZXNzYWdlIGVycm9yXCI7XG4gICAgZmxvYXRpbmcuc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgIGZsb2F0aW5nLmNsYXNzTGlzdC5hZGQoXCJmYWRlLW91dFwiKTtcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBmbG9hdGluZy5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIGZsb2F0aW5nLmNsYXNzTGlzdC5yZW1vdmUoXCJmYWRlLW91dFwiKTtcbiAgICAgIH0sIDEwMDApO1xuICAgIH0sIDMwMDApO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjbGVhck1lc3NhZ2VzLFxuICAgIHNob3dFcnJvcjogKG1zZykgPT4gc2hvd0Zsb2F0aW5nRXJyb3IobXNnLCBcImVycm9yXCIpLFxuICAgIHNob3dTdWNjZXNzOiAobXNnKSA9PiBzaG93RmxvYXRpbmdFcnJvcihtc2csIFwic3VjY2Vzc1wiKSxcbiAgICBzaG93RmxvYXRpbmdFcnJvcixcbiAgfTtcbn0pKCk7XG4iLCJleHBvcnQgY29uc3QgTG9hZGVyID0gKCgpID0+IHtcbiAgZnVuY3Rpb24gdG9nZ2xlKHNob3cpIHtcbiAgICBsZXQgbG9hZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkZXJcIik7XG4gICAgaWYgKCFsb2FkZXIgJiYgc2hvdykgbG9hZGVyID0gY3JlYXRlKCk7XG4gICAgaWYgKGxvYWRlcikge1xuICAgICAgaWYgKHNob3cpIHtcbiAgICAgICAgbG9hZGVyLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRlXCIpO1xuICAgICAgICBsb2FkZXIuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9hZGVyLmNsYXNzTGlzdC5hZGQoXCJoaWRlXCIpO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBpZiAobG9hZGVyLmNsYXNzTGlzdC5jb250YWlucyhcImhpZGVcIikpIHtcbiAgICAgICAgICAgIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgfVxuICAgICAgICB9LCAzMDApOyAvLyBtYXRjaCBDU1MgdHJhbnNpdGlvbiBkdXJhdGlvblxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICBjb25zdCBsb2FkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGxvYWRlci5pZCA9IFwibG9hZGVyXCI7XG4gICAgbG9hZGVyLmNsYXNzTmFtZSA9IFwibG9hZGVyXCI7XG4gICAgbG9hZGVyLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwic3Bpbm5lclwiPjwvZGl2Pic7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsb2FkZXIpO1xuICAgIHJldHVybiBsb2FkZXI7XG4gIH1cblxuICByZXR1cm4geyB0b2dnbGUgfTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBEb21VdGlscyB9IGZyb20gXCIuL2RvbVV0aWxzLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBVc2VyID0gKCgpID0+IHtcbiAgYXN5bmMgZnVuY3Rpb24gbG9nb3V0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiQXR0ZW1wdGluZyBsb2dvdXQuLi5cIik7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goXCIvYXBpL2xvZ291dFwiLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHsgQWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIiB9LFxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCByZXNwb25zZS5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSk7XG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgZGF0YS5lcnJvciB8fCBgTG9nb3V0IGZhaWxlZCB3aXRoIHN0YXR1czogJHtyZXNwb25zZS5zdGF0dXN9YFxuICAgICAgICApO1xuICAgICAgY29uc29sZS5sb2coXCJMb2dvdXQgc3VjY2Vzc2Z1bCB2aWEgQVBJLlwiKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcihcIkxvZ291dCBBUEkgY2FsbCBmYWlsZWQ6XCIsIGVycm9yKTtcbiAgICAgIERvbVV0aWxzLnNob3dFcnJvcihcbiAgICAgICAgXCJDb3VsZCBub3QgcHJvcGVybHkgbG9nIG91dC4gQ2xlYXIgY29va2llcyBtYW51YWxseSBpZiBuZWVkZWQuXCJcbiAgICAgICk7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIGxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwidXNlclwiKTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvbG9naW5cIjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkaXNwbGF5VXNlckRhdGEoKSB7XG4gICAgY29uc3QgdXNlckRhdGFTdHJpbmcgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInVzZXJcIik7XG4gICAgaWYgKCF1c2VyRGF0YVN0cmluZykgcmV0dXJuIGxvZ291dCgpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB1c2VyRGF0YSA9IEpTT04ucGFyc2UodXNlckRhdGFTdHJpbmcpO1xuICAgICAgY29uc3QgdXNlck5hbWUgPSB1c2VyRGF0YS5uYW1lIHx8IFwiVXNlclwiO1xuICAgICAgY29uc3QgdXNlck5hbWVEaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyLW5hbWUtZGlzcGxheVwiKTtcbiAgICAgIGlmICh1c2VyTmFtZURpc3BsYXkpIHVzZXJOYW1lRGlzcGxheS50ZXh0Q29udGVudCA9IHVzZXJOYW1lO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJJbnZhbGlkIHVzZXIgZGF0YSBpbiBsb2NhbFN0b3JhZ2UuXCIpO1xuICAgICAgbG9nb3V0KCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgbG9nb3V0LCBkaXNwbGF5VXNlckRhdGEgfTtcbn0pKCk7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi9tb2R1bGVzL3VzZXIuanNcIjtcbmltcG9ydCB7IEF1dGggfSBmcm9tIFwiLi9tb2R1bGVzL2F1dGguanNcIjtcbmltcG9ydCB7IFRvZG8gfSBmcm9tIFwiLi9tb2R1bGVzL2NhbGVuZGFyLmpzXCI7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvYXBwXCIpIHtcbiAgICBVc2VyLmRpc3BsYXlVc2VyRGF0YSgpO1xuICB9XG4gIGNvbnN0IGxvZ291dEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLWxvZ291dFwiKTtcbiAgaWYgKGxvZ291dEJ0bikgbG9nb3V0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBVc2VyLmxvZ291dCk7XG5cbiAgY29uc29sZS5sb2coXCJNYWluIGFwcCBpbml0aWFsaXplZC5cIik7XG59KTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==