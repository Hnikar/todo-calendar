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
        initialView: "listWeek", // Set initial view to Upcoming
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
            allTasks = allTasks.map((t) =>
              t.id === event.id ? updatedTask : t
            );
          } catch (error) {
            info.revert();
            console.error("Failed to update event after drag:", error);
          }
        },
      });

      // Fetch tasks from API and render calendar
      async function initializeCalendar() {
        try {
          const tasks = await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.fetchTasks();
          allTasks = tasks; // Save all tasks for filtering
          tasks.forEach((task) => calendar.addEvent(task));
          calendar.render();
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

      // Highlight Upcoming button on load
      setActiveSidebarButton(btnUpcoming);

      if (btnCalendar) {
        btnCalendar.addEventListener("click", () => {
          calendar.changeView("dayGridMonth");
          setActiveSidebarButton(btnCalendar);
          updateCalendarHeaderButtons("dayGridMonth");
          window.dispatchEvent(
            new CustomEvent("viewChange", { detail: { view: "calendar" } })
          );
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
        });
      }

      // Listen for category filter event
      window.addEventListener("categoryFilter", (e) => {
        const category = e.detail.category;
        calendar.removeAllEvents();
        if (category) {
          calendar.changeView("listYear");
          const filtered = allTasks.filter(
            (task) => (task.category || "None") === category
          );
          filtered.forEach((task) => calendar.addEvent(task));
          // Remove .active from all sidebar-btn and category-item, then highlight the category
          document
            .querySelectorAll(".sidebar-btn, .category-item")
            .forEach((btn) => {
              btn.classList.remove("active");
            });
          // Highlight the correct category item
          const catBtn = Array.from(
            document.querySelectorAll(".category-item")
          ).find((li) => li.textContent.includes(category));
          if (catBtn) catBtn.classList.add("active");
        } else {
          calendar.changeView("dayGridMonth");
          allTasks.forEach((task) => calendar.addEvent(task));
          setActiveSidebarButton(btnCalendar);
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
        // Remove old task from allTasks and add updated one
        allTasks = allTasks.filter((t) => t.id !== data.id);
        allTasks.push(updatedTask);
        currentEditingTask.remove();
        calendar.addEvent(updatedTask);
        return updatedTask;
      }

      async function deleteTask(id) {
        await _apiService_js__WEBPACK_IMPORTED_MODULE_1__.ApiService.deleteTask(id);
        allTasks = allTasks.filter((t) => t.id !== id);
      }

      // After calendar initialization
      function updateCalendarHeaderButtons(viewType) {
        const fcHeader = document.querySelector(".fc-header-toolbar");
        if (!fcHeader) return;
        // Hide header for listWeek (Upcoming), timeGridDay (Today), and listYear (Year)
        if (
          viewType === "listWeek" ||
          viewType === "timeGridDay" ||
          viewType === "listYear" // <-- add listYear here
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
          viewType === "listYear" // <-- add listYear here
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
      }

      calendar.on("viewDidMount", function (arg) {
        updateCalendarHeaderButtons(arg.view.type);
      });

      // Hide header on initial load if in listWeek (Upcoming)
      setTimeout(() => {
        const fcHeader = document.querySelector(".fc-header-toolbar");
        if (fcHeader) fcHeader.style.display = "none";
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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Ozs7QUN0Q007QUFDUDtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsV0FBVztBQUNYLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7O0FDakJvQztBQUNJOztBQUVsQztBQUNQO0FBQ0E7QUFDQSxJQUFJLDhDQUFNO0FBQ1Y7QUFDQTtBQUNBO0FBQ0EsbUJBQW1CLDRCQUE0QjtBQUMvQyxPQUFPOztBQUVQLHdEQUF3RDtBQUN4RDtBQUNBO0FBQ0Esc0RBQXNELGdCQUFnQjtBQUN0RTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTSxrREFBUTtBQUNkO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQSxNQUFNLDhDQUFNO0FBQ1o7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxNQUFNO0FBQ047QUFDQTtBQUNBO0FBQ0E7O0FBRUEsV0FBVztBQUNYLENBQUM7Ozs7Ozs7VUM5Q0Q7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTs7VUFFQTtVQUNBOztVQUVBO1VBQ0E7VUFDQTs7Ozs7V0N0QkE7V0FDQTtXQUNBO1dBQ0E7V0FDQSx5Q0FBeUMsd0NBQXdDO1dBQ2pGO1dBQ0E7V0FDQTs7Ozs7V0NQQTs7Ozs7V0NBQTtXQUNBO1dBQ0E7V0FDQSx1REFBdUQsaUJBQWlCO1dBQ3hFO1dBQ0EsZ0RBQWdELGFBQWE7V0FDN0Q7Ozs7Ozs7Ozs7Ozs7O0FDTnlDO0FBQ0E7QUFDSTs7QUFFN0M7QUFDQTtBQUNBLElBQUksa0RBQUk7QUFDUjtBQUNBO0FBQ0EscURBQXFELGtEQUFJOztBQUV6RDtBQUNBLENBQUMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9hcGlTZXJ2aWNlLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2F1dGguanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvY2FsZW5kYXIuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvY2F0ZWdvcnkuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvZG9tVXRpbHMuanMiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvbG9hZGVyLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL3VzZXIuanMiLCJ3ZWJwYWNrOi8vc3RhdGljL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovL3N0YXRpYy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vc3RhdGljL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vc3RhdGljL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IExvYWRlciB9IGZyb20gXCIuL2xvYWRlci5qc1wiO1xuaW1wb3J0IHsgRG9tVXRpbHMgfSBmcm9tIFwiLi9kb21VdGlscy5qc1wiO1xuXG5leHBvcnQgY29uc3QgQXBpU2VydmljZSA9ICgoKSA9PiB7XG4gIGNvbnN0IEFQSV9CQVNFID0gXCIvYXBpXCI7XG5cbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmVxdWVzdCh1cmwsIG1ldGhvZCwgZGF0YSkge1xuICAgIHRyeSB7XG4gICAgICBMb2FkZXIudG9nZ2xlKHRydWUpO1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHtBUElfQkFTRX0ke3VybH1gLCB7XG4gICAgICAgIG1ldGhvZCxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICB9LFxuICAgICAgICBjcmVkZW50aWFsczogXCJpbmNsdWRlXCIsXG4gICAgICAgIGJvZHk6IGRhdGEgPyBKU09OLnN0cmluZ2lmeShkYXRhKSA6IHVuZGVmaW5lZCxcbiAgICAgIH0pO1xuXG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9sb2dpbj9yZWFzb249dW5hdXRoZW50aWNhdGVkXCI7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcmVzcG9uc2VEYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgY29uc29sZS5sb2cocmVzcG9uc2VEYXRhKTtcbiAgICAgIGlmICghcmVzcG9uc2Uub2spIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKHJlc3BvbnNlRGF0YS5lcnJvciB8fCBcIlJlcXVlc3QgZmFpbGVkXCIpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3BvbnNlRGF0YTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgRG9tVXRpbHMuc2hvd0Vycm9yKGVycm9yLm1lc3NhZ2UpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfSBmaW5hbGx5IHtcbiAgICAgIExvYWRlci50b2dnbGUoZmFsc2UpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgLy8gVGFzay1yZWxhdGVkIGVuZHBvaW50c1xuICAgIGNyZWF0ZVRhc2s6ICh0YXNrKSA9PiB7XG4gICAgICBjb25zdCB7IHByaW9yaXR5LCAuLi5yZXN0IH0gPSB0YXNrO1xuICAgICAgcmV0dXJuIGhhbmRsZVJlcXVlc3QoXCIvZXZlbnRzXCIsIFwiUE9TVFwiLCByZXN0KTtcbiAgICB9LFxuICAgIHVwZGF0ZVRhc2s6IChpZCwgdGFzaykgPT4ge1xuICAgICAgY29uc3QgeyBwcmlvcml0eSwgLi4ucmVzdCB9ID0gdGFzaztcbiAgICAgIHJldHVybiBoYW5kbGVSZXF1ZXN0KGAvZXZlbnRzLyR7aWR9YCwgXCJQVVRcIiwgcmVzdCk7XG4gICAgfSxcbiAgICBkZWxldGVUYXNrOiAoaWQpID0+IGhhbmRsZVJlcXVlc3QoYC9ldmVudHMvJHtpZH1gLCBcIkRFTEVURVwiKSxcbiAgICBmZXRjaFRhc2tzOiAoKSA9PiBoYW5kbGVSZXF1ZXN0KFwiL2V2ZW50c1wiLCBcIkdFVFwiKSxcbiAgICAvLyBDYXRlZ29yeS1yZWxhdGVkIGVuZHBvaW50c1xuICAgIGNyZWF0ZUNhdGVnb3J5OiAoY2F0ZWdvcnkpID0+XG4gICAgICBoYW5kbGVSZXF1ZXN0KFwiL2NhdGVnb3JpZXNcIiwgXCJQT1NUXCIsIGNhdGVnb3J5KSxcbiAgICBmZXRjaENhdGVnb3JpZXM6ICgpID0+IGhhbmRsZVJlcXVlc3QoXCIvY2F0ZWdvcmllc1wiLCBcIkdFVFwiKSxcbiAgICBkZWxldGVDYXRlZ29yeTogKGlkKSA9PiBoYW5kbGVSZXF1ZXN0KGAvY2F0ZWdvcmllcy8ke2lkfWAsIFwiREVMRVRFXCIpLFxuICB9O1xufSkoKTtcbiIsImltcG9ydCB7IExvYWRlciB9IGZyb20gXCIuL2xvYWRlci5qc1wiO1xuaW1wb3J0IHsgRG9tVXRpbHMgfSBmcm9tIFwiLi9kb21VdGlscy5qc1wiO1xuXG5leHBvcnQgY29uc3QgQXV0aCA9ICgoKSA9PiB7XG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9sb2dpblwiKSB7XG4gICAgICBpbml0KCk7XG4gICAgICBjaGVja1JlZGlyZWN0UmVhc29uKCk7XG4gICAgfVxuICB9KTtcblxuICBmdW5jdGlvbiBpbml0KCkge1xuICAgIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImF1dGhGb3JtXCIpO1xuICAgIGlmICghZm9ybSkgcmV0dXJuIGNvbnNvbGUuZXJyb3IoXCJBdXRoIGZvcm0gbm90IGZvdW5kIVwiKTtcblxuICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBoYW5kbGVTdWJtaXQpO1xuICAgIHN3aXRjaE1vZGUoXCJsb2dpblwiKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2RhdGEtbW9kZV1cIikuZm9yRWFjaCgodGFiKSA9PlxuICAgICAgdGFiLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIHN3aXRjaE1vZGUodGFiLmRhdGFzZXQubW9kZSk7XG4gICAgICB9KVxuICAgICk7XG4gIH1cblxuICBmdW5jdGlvbiBzd2l0Y2hNb2RlKG1vZGUpIHtcbiAgICBjb25zdCBuYW1lRmllbGQgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5hbWVGaWVsZFwiKTtcbiAgICBjb25zdCBzdWJtaXRCdG4gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYXV0aEZvcm0gYnV0dG9uW3R5cGU9XCJzdWJtaXRcIl0nKTtcbiAgICBjb25zdCBwYXNzd29yZElucHV0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwYXNzd29yZFwiKTtcbiAgICBjb25zdCB0YWJzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi50YWJcIik7XG5cbiAgICBpZiAobmFtZUZpZWxkKSB7XG4gICAgICBuYW1lRmllbGQuc3R5bGUuZGlzcGxheSA9IG1vZGUgPT09IFwicmVnaXN0ZXJcIiA/IFwiYmxvY2tcIiA6IFwibm9uZVwiO1xuICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lXCIpLnJlcXVpcmVkID0gbW9kZSA9PT0gXCJyZWdpc3RlclwiO1xuICAgIH1cbiAgICB0YWJzLmZvckVhY2goKHRhYikgPT5cbiAgICAgIHRhYi5jbGFzc0xpc3QudG9nZ2xlKFwiYWN0aXZlXCIsIHRhYi5kYXRhc2V0Lm1vZGUgPT09IG1vZGUpXG4gICAgKTtcbiAgICBpZiAoc3VibWl0QnRuKVxuICAgICAgc3VibWl0QnRuLnRleHRDb250ZW50ID0gbW9kZSA9PT0gXCJsb2dpblwiID8gXCJMb2dpblwiIDogXCJSZWdpc3RlclwiO1xuICAgIGlmIChwYXNzd29yZElucHV0KVxuICAgICAgcGFzc3dvcmRJbnB1dC5hdXRvY29tcGxldGUgPVxuICAgICAgICBtb2RlID09PSBcImxvZ2luXCIgPyBcImN1cnJlbnQtcGFzc3dvcmRcIiA6IFwibmV3LXBhc3N3b3JkXCI7XG5cbiAgICBEb21VdGlscy5jbGVhck1lc3NhZ2VzKCk7XG4gIH1cblxuICBhc3luYyBmdW5jdGlvbiBoYW5kbGVTdWJtaXQoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBEb21VdGlscy5jbGVhck1lc3NhZ2VzKCk7XG4gICAgTG9hZGVyLnRvZ2dsZSh0cnVlKTtcblxuICAgIGNvbnN0IGlzTG9naW4gPSBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3IoJ1tkYXRhLW1vZGU9XCJsb2dpblwiXScpXG4gICAgICAuY2xhc3NMaXN0LmNvbnRhaW5zKFwiYWN0aXZlXCIpO1xuICAgIGNvbnN0IHVybCA9IGlzTG9naW4gPyBcIi9hcGkvbG9naW5cIiA6IFwiL2FwaS9yZWdpc3RlclwiO1xuICAgIGNvbnN0IGZvcm1EYXRhID0ge1xuICAgICAgZW1haWw6IGdldFZhbChcImVtYWlsXCIpLFxuICAgICAgcGFzc3dvcmQ6IGdldFZhbChcInBhc3N3b3JkXCIpLFxuICAgIH07XG5cbiAgICBpZiAoIWlzTG9naW4pIGZvcm1EYXRhLm5hbWUgPSBnZXRWYWwoXCJuYW1lXCIpO1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhbGlkYXRlKGZvcm1EYXRhLCBpc0xvZ2luKTtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2godXJsLCB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgICBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShmb3JtRGF0YSksXG4gICAgICB9KTtcbiAgICAgIGF3YWl0IGhhbmRsZVJlc3BvbnNlKHJlc3BvbnNlLCBpc0xvZ2luKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIERvbVV0aWxzLnNob3dFcnJvcihlcnIubWVzc2FnZSB8fCBcIlVuZXhwZWN0ZWQgZXJyb3IgZHVyaW5nIHN1Ym1pc3Npb24uXCIpO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBMb2FkZXIudG9nZ2xlKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBnZXRWYWwoaWQpIHtcbiAgICBjb25zdCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICByZXR1cm4gZWwgPyBlbC52YWx1ZS50cmltKCkgOiBcIlwiO1xuICB9XG5cbiAgZnVuY3Rpb24gdmFsaWRhdGUoZGF0YSwgaXNMb2dpbikge1xuICAgIGNvbnN0IGVycm9ycyA9IFtdO1xuICAgIGNvbnN0IGVtYWlsUmVnZXggPSAvXlteXFxzQF0rQFteXFxzQF0rXFwuW15cXHNAXSskLztcblxuICAgIGlmICghZGF0YS5lbWFpbCkgZXJyb3JzLnB1c2goXCJFbWFpbCBpcyByZXF1aXJlZC5cIik7XG4gICAgZWxzZSBpZiAoIWVtYWlsUmVnZXgudGVzdChkYXRhLmVtYWlsKSkgZXJyb3JzLnB1c2goXCJJbnZhbGlkIGVtYWlsIGZvcm1hdC5cIik7XG4gICAgaWYgKCFkYXRhLnBhc3N3b3JkKSBlcnJvcnMucHVzaChcIlBhc3N3b3JkIGlzIHJlcXVpcmVkLlwiKTtcbiAgICBlbHNlIGlmIChkYXRhLnBhc3N3b3JkLmxlbmd0aCA8IDggJiYgIWlzTG9naW4pXG4gICAgICBlcnJvcnMucHVzaChcIlBhc3N3b3JkIG11c3QgYmUgYXQgbGVhc3QgOCBjaGFyYWN0ZXJzLlwiKTtcbiAgICBpZiAoIWlzTG9naW4gJiYgKCFkYXRhLm5hbWUgfHwgZGF0YS5uYW1lLmxlbmd0aCA8IDIpKVxuICAgICAgZXJyb3JzLnB1c2goXCJOYW1lIG11c3QgYmUgYXQgbGVhc3QgMiBjaGFyYWN0ZXJzLlwiKTtcblxuICAgIGlmIChlcnJvcnMubGVuZ3RoKSB0aHJvdyBuZXcgRXJyb3IoZXJyb3JzLmpvaW4oXCJcXG5cIikpO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzcG9uc2UsIGlzTG9naW4pIHtcbiAgICBjb25zdCBpc0pzb24gPSByZXNwb25zZS5oZWFkZXJzXG4gICAgICAuZ2V0KFwiY29udGVudC10eXBlXCIpXG4gICAgICA/LmluY2x1ZGVzKFwiYXBwbGljYXRpb24vanNvblwiKTtcbiAgICBjb25zdCBkYXRhID0gaXNKc29uXG4gICAgICA/IGF3YWl0IHJlc3BvbnNlLmpzb24oKVxuICAgICAgOiB7IG1lc3NhZ2U6IGF3YWl0IHJlc3BvbnNlLnRleHQoKSB9O1xuXG4gICAgaWYgKCFyZXNwb25zZS5vaylcbiAgICAgIHRocm93IG5ldyBFcnJvcihkYXRhLmVycm9yIHx8IGBFcnJvcjogJHtyZXNwb25zZS5zdGF0dXN9YCk7XG5cbiAgICBpZiAoaXNMb2dpbikge1xuICAgICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJ1c2VyXCIsIEpTT04uc3RyaW5naWZ5KGRhdGEudXNlciB8fCB7fSkpO1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIi9hcHBcIjtcbiAgICB9IGVsc2Uge1xuICAgICAgRG9tVXRpbHMuc2hvd1N1Y2Nlc3MoXG4gICAgICAgIGRhdGEubWVzc2FnZSB8fCBcIlJlZ2lzdHJhdGlvbiBzdWNjZXNzZnVsLiBQbGVhc2UgbG9naW4uXCJcbiAgICAgICk7XG4gICAgICBzd2l0Y2hNb2RlKFwibG9naW5cIik7XG4gICAgICBbXCJlbWFpbFwiLCBcInBhc3N3b3JkXCIsIFwibmFtZVwiXS5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgICBjb25zdCBlbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGlkKTtcbiAgICAgICAgaWYgKGVsKSBlbC52YWx1ZSA9IFwiXCI7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBjaGVja1JlZGlyZWN0UmVhc29uKCkge1xuICAgIGNvbnN0IHJlYXNvbiA9IG5ldyBVUkxTZWFyY2hQYXJhbXMobG9jYXRpb24uc2VhcmNoKS5nZXQoXCJyZWFzb25cIik7XG4gICAgY29uc3QgbWVzc2FnZXMgPSB7XG4gICAgICB1bmF1dGhlbnRpY2F0ZWQ6IFwiUGxlYXNlIGxvZyBpbiB0byBhY2Nlc3MgdGhlIGFwcGxpY2F0aW9uLlwiLFxuICAgICAgaW52YWxpZF90b2tlbjogXCJTZXNzaW9uIGV4cGlyZWQuIFBsZWFzZSBsb2cgaW4gYWdhaW4uXCIsXG4gICAgICBiYWRfdG9rZW5fY2xhaW1zOiBcIlNlc3Npb24gZGF0YSBpc3N1ZS4gUGxlYXNlIGxvZyBpbiBhZ2Fpbi5cIixcbiAgICB9O1xuICAgIGlmIChyZWFzb24gJiYgbWVzc2FnZXNbcmVhc29uXSkgRG9tVXRpbHMuc2hvd0Vycm9yKG1lc3NhZ2VzW3JlYXNvbl0pO1xuICAgIGhpc3RvcnkucmVwbGFjZVN0YXRlKG51bGwsIFwiXCIsIGxvY2F0aW9uLnBhdGhuYW1lKTtcbiAgfVxuXG4gIHJldHVybiB7IGluaXQgfTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBDYXRlZ29yeSB9IGZyb20gXCIuL2NhdGVnb3J5LmpzXCI7XG5pbXBvcnQgeyBBcGlTZXJ2aWNlIH0gZnJvbSBcIi4vYXBpU2VydmljZS5qc1wiO1xuXG5leHBvcnQgY29uc3QgVG9kbyA9ICgoKSA9PiB7XG4gIGxldCBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xuICBsZXQgaXNFZGl0aW5nID0gZmFsc2U7XG4gIGxldCBhbGxUYXNrcyA9IFtdOyAvLyBTdG9yZSBhbGwgdGFza3MgZm9yIGZpbHRlcmluZ1xuXG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09IFwiL2FwcFwiKSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFzay1mb3JtXCIpO1xuICAgICAgY29uc3QgZm9ybUhlYWRpbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImZvcm0taGVhZGluZ1wiKTtcbiAgICAgIGNvbnN0IHN1Ym1pdEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3VibWl0LWJ1dHRvblwiKTtcbiAgICAgIGNvbnN0IGRlbGV0ZUJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVsZXRlLWJ1dHRvblwiKTtcbiAgICAgIGNvbnN0IGNhbmNlbEJ1dHRvbiA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FuY2VsLWJ1dHRvblwiKTtcbiAgICAgIGNvbnN0IGFkZFRhc2tCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1hZGQtdGFza1wiKTtcbiAgICAgIGNvbnN0IGFsbERheUNoZWNrYm94ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhbGxEYXlcIik7XG4gICAgICBjb25zdCB0aW1lSW5wdXRzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aW1lSW5wdXRzXCIpO1xuICAgICAgY29uc3QgY29udGVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuY29udGVudFwiKTtcbiAgICAgIGNvbnN0IGNsb3NlVGFza0Zvcm1CdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNsb3NlLXRhc2stZm9ybVwiKTtcbiAgICAgIGNvbnN0IGJ0bkNhbGVuZGFyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG4tY2FsZW5kYXJcIik7XG4gICAgICBjb25zdCBidG5VcGNvbWluZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLXVwY29taW5nXCIpO1xuICAgICAgY29uc3QgYnRuVG9kYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi10b2RheVwiKTtcblxuICAgICAgLy8gSGVscGVyIHRvIHNob3cvaGlkZSBmb3JtIGFuZCBiYWNrZHJvcFxuICAgICAgZnVuY3Rpb24gc2hvd0Zvcm0oKSB7XG4gICAgICAgIGZvcm0uY2xhc3NMaXN0LmFkZChcInZpc2libGVcIik7XG4gICAgICAgIGNvbnRlbnQuY2xhc3NMaXN0LmFkZChcImZvcm0tb3BlblwiKTtcbiAgICAgICAgZm9ybS5zdHlsZS5kaXNwbGF5ID0gXCJibG9ja1wiO1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBmb3JtLmZvY3VzICYmIGZvcm0uZm9jdXMoKTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9XG4gICAgICBmdW5jdGlvbiBoaWRlRm9ybSgpIHtcbiAgICAgICAgZm9ybS5jbGFzc0xpc3QucmVtb3ZlKFwidmlzaWJsZVwiKTtcbiAgICAgICAgY29udGVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZm9ybS1vcGVuXCIpO1xuICAgICAgICBmb3JtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgaWYgKGFkZFRhc2tCdXR0b24pIGFkZFRhc2tCdXR0b24uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgIH1cblxuICAgICAgLy8gVG9nZ2xlIHRpbWUgaW5wdXRzIGJhc2VkIG9uIEFsbCBEYXkgY2hlY2tib3hcbiAgICAgIGFsbERheUNoZWNrYm94LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgKCkgPT4ge1xuICAgICAgICBjb25zdCBpc0FsbERheSA9IGFsbERheUNoZWNrYm94LmNoZWNrZWQ7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLmRpc2FibGVkID0gaXNBbGxEYXk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5kVGltZVwiKS5kaXNhYmxlZCA9IGlzQWxsRGF5O1xuICAgICAgICBpZiAoaXNBbGxEYXkpIHtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0VGltZVwiKS52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLnZhbHVlID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIENhbGVuZGFyIGluaXRpYWxpemF0aW9uXG4gICAgICBjb25zdCBjYWxlbmRhckVsID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYWxlbmRhclwiKTtcbiAgICAgIGNvbnN0IGNhbGVuZGFyID0gbmV3IEZ1bGxDYWxlbmRhci5DYWxlbmRhcihjYWxlbmRhckVsLCB7XG4gICAgICAgIGluaXRpYWxWaWV3OiBcImxpc3RXZWVrXCIsIC8vIFNldCBpbml0aWFsIHZpZXcgdG8gVXBjb21pbmdcbiAgICAgICAgZWRpdGFibGU6IHRydWUsXG4gICAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgICBzZWxlY3RNaXJyb3I6IHRydWUsXG4gICAgICAgIGRheU1heEV2ZW50czogdHJ1ZSxcbiAgICAgICAgZXZlbnRzOiBbXSxcbiAgICAgICAgZXZlbnRDbGljazogZnVuY3Rpb24gKGluZm8pIHtcbiAgICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBpbmZvLmV2ZW50O1xuICAgICAgICAgIGlzRWRpdGluZyA9IHRydWU7XG4gICAgICAgICAgcG9wdWxhdGVGb3JtKGluZm8uZXZlbnQpO1xuICAgICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xuICAgICAgICAgIHNob3dGb3JtKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGV2ZW50RGlkTW91bnQ6IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgY29uc3QgaXNDb21wbGV0ZWQgPSBpbmZvLmV2ZW50LmV4dGVuZGVkUHJvcHMuY29tcGxldGVkO1xuICAgICAgICAgIGlmIChpc0NvbXBsZXRlZCkge1xuICAgICAgICAgICAgaW5mby5lbC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiNkM2QzZDNcIjtcbiAgICAgICAgICAgIGluZm8uZWwuc3R5bGUudGV4dERlY29yYXRpb24gPSBcImxpbmUtdGhyb3VnaFwiO1xuICAgICAgICAgICAgaW5mby5lbC5zdHlsZS5vcGFjaXR5ID0gXCIwLjdcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBBcHBseSBjYXRlZ29yeSBjb2xvclxuICAgICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gaW5mby5ldmVudC5leHRlbmRlZFByb3BzLmNhdGVnb3J5O1xuICAgICAgICAgIGlmIChjYXRlZ29yeSAmJiBjYXRlZ29yeSAhPT0gXCJOb25lXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IGNhdCA9IENhdGVnb3J5LmdldENhdGVnb3JpZXMoKS5maW5kKFxuICAgICAgICAgICAgICAoYykgPT4gYy5uYW1lID09PSBjYXRlZ29yeVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmIChjYXQpIHtcbiAgICAgICAgICAgICAgaW5mby5lbC5zdHlsZS5ib3JkZXJMZWZ0ID0gYDRweCBzb2xpZCAke2NhdC5jb2xvcn1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmZvLmVsLnN0eWxlLmJvcmRlckxlZnQgPSBcIjRweCBzb2xpZCB0cmFuc3BhcmVudFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXZlbnREcm9wOiBhc3luYyBmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBldmVudCA9IGluZm8uZXZlbnQ7XG4gICAgICAgICAgICBsZXQgc3RhcnQgPSBldmVudC5zdGFydDtcbiAgICAgICAgICAgIGxldCBlbmQgPSBldmVudC5lbmQ7XG5cbiAgICAgICAgICAgIC8vIEZvcm1hdCBzdGFydCBhbmQgZW5kIGFzICdZWVlZLU1NLUREVEhIOm1tJ1xuICAgICAgICAgICAgZnVuY3Rpb24gZm9ybWF0RGF0ZVRpbWUoZHQpIHtcbiAgICAgICAgICAgICAgaWYgKCFkdCkgcmV0dXJuIFwiXCI7XG4gICAgICAgICAgICAgIC8vIFBhZCBtb250aCwgZGF5LCBob3VyLCBtaW51dGVcbiAgICAgICAgICAgICAgY29uc3QgeXl5eSA9IGR0LmdldEZ1bGxZZWFyKCk7XG4gICAgICAgICAgICAgIGNvbnN0IG1tID0gU3RyaW5nKGR0LmdldE1vbnRoKCkgKyAxKS5wYWRTdGFydCgyLCBcIjBcIik7XG4gICAgICAgICAgICAgIGNvbnN0IGRkID0gU3RyaW5nKGR0LmdldERhdGUoKSkucGFkU3RhcnQoMiwgXCIwXCIpO1xuICAgICAgICAgICAgICBjb25zdCBoaCA9IFN0cmluZyhkdC5nZXRIb3VycygpKS5wYWRTdGFydCgyLCBcIjBcIik7XG4gICAgICAgICAgICAgIGNvbnN0IG1pbiA9IFN0cmluZyhkdC5nZXRNaW51dGVzKCkpLnBhZFN0YXJ0KDIsIFwiMFwiKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGAke3l5eXl9LSR7bW19LSR7ZGR9VCR7aGh9OiR7bWlufWA7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCBmb3JtYXR0ZWRTdGFydCwgZm9ybWF0dGVkRW5kO1xuXG4gICAgICAgICAgICBpZiAoZXZlbnQuYWxsRGF5KSB7XG4gICAgICAgICAgICAgIC8vIEZvciBhbGxEYXksIHVzZSBkYXRlIG9ubHlcbiAgICAgICAgICAgICAgZm9ybWF0dGVkU3RhcnQgPSBldmVudC5zdGFydFN0ci5zbGljZSgwLCAxMCk7XG4gICAgICAgICAgICAgIGlmIChldmVudC5lbmQpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlbmREYXRlID0gbmV3IERhdGUoZXZlbnQuZW5kKTtcbiAgICAgICAgICAgICAgICBlbmREYXRlLnNldERhdGUoZW5kRGF0ZS5nZXREYXRlKCkgLSAxKTtcbiAgICAgICAgICAgICAgICBmb3JtYXR0ZWRFbmQgPSBlbmREYXRlLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGZvcm1hdHRlZEVuZCA9IGZvcm1hdHRlZFN0YXJ0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBGb3IgdGltZWQgZXZlbnRzLCB1c2UgJ1lZWVktTU0tRERUSEg6bW0nXG4gICAgICAgICAgICAgIGZvcm1hdHRlZFN0YXJ0ID0gZm9ybWF0RGF0ZVRpbWUoc3RhcnQpO1xuICAgICAgICAgICAgICBmb3JtYXR0ZWRFbmQgPSBlbmQgPyBmb3JtYXREYXRlVGltZShlbmQpIDogZm9ybWF0dGVkU3RhcnQ7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IHVwZGF0ZWREYXRhID0ge1xuICAgICAgICAgICAgICBpZDogZXZlbnQuaWQsXG4gICAgICAgICAgICAgIHRpdGxlOiBldmVudC50aXRsZSxcbiAgICAgICAgICAgICAgc3RhcnQ6IGZvcm1hdHRlZFN0YXJ0LFxuICAgICAgICAgICAgICBlbmQ6IGZvcm1hdHRlZEVuZCxcbiAgICAgICAgICAgICAgYWxsRGF5OiBldmVudC5hbGxEYXksXG4gICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBldmVudC5leHRlbmRlZFByb3BzLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICBjYXRlZ29yeTogZXZlbnQuZXh0ZW5kZWRQcm9wcy5jYXRlZ29yeSxcbiAgICAgICAgICAgICAgY29tcGxldGVkOiBldmVudC5leHRlbmRlZFByb3BzLmNvbXBsZXRlZCxcbiAgICAgICAgICAgICAgY2xhc3NOYW1lOiBldmVudC5jbGFzc05hbWVzXG4gICAgICAgICAgICAgICAgLmZpbHRlcihcbiAgICAgICAgICAgICAgICAgIChjKSA9PlxuICAgICAgICAgICAgICAgICAgICBjICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICAgICAgICAgICAgYyAhPT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICBjLnN0YXJ0c1dpdGgoXCJwcmlvcml0eS1cIikgPT09IGZhbHNlXG4gICAgICAgICAgICAgICAgKVxuICAgICAgICAgICAgICAgIC5qb2luKFwiIFwiKSxcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICBjb25zdCB1cGRhdGVkVGFzayA9IGF3YWl0IEFwaVNlcnZpY2UudXBkYXRlVGFzayhcbiAgICAgICAgICAgICAgZXZlbnQuaWQsXG4gICAgICAgICAgICAgIHVwZGF0ZWREYXRhXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgYWxsVGFza3MgPSBhbGxUYXNrcy5tYXAoKHQpID0+XG4gICAgICAgICAgICAgIHQuaWQgPT09IGV2ZW50LmlkID8gdXBkYXRlZFRhc2sgOiB0XG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgICBpbmZvLnJldmVydCgpO1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byB1cGRhdGUgZXZlbnQgYWZ0ZXIgZHJhZzpcIiwgZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgIH0pO1xuXG4gICAgICAvLyBGZXRjaCB0YXNrcyBmcm9tIEFQSSBhbmQgcmVuZGVyIGNhbGVuZGFyXG4gICAgICBhc3luYyBmdW5jdGlvbiBpbml0aWFsaXplQ2FsZW5kYXIoKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgY29uc3QgdGFza3MgPSBhd2FpdCBBcGlTZXJ2aWNlLmZldGNoVGFza3MoKTtcbiAgICAgICAgICBhbGxUYXNrcyA9IHRhc2tzOyAvLyBTYXZlIGFsbCB0YXNrcyBmb3IgZmlsdGVyaW5nXG4gICAgICAgICAgdGFza3MuZm9yRWFjaCgodGFzaykgPT4gY2FsZW5kYXIuYWRkRXZlbnQodGFzaykpO1xuICAgICAgICAgIGNhbGVuZGFyLnJlbmRlcigpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZmV0Y2ggdGFza3M6XCIsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpbml0aWFsaXplQ2FsZW5kYXIoKTtcblxuICAgICAgLy8gU2lkZWJhciBidXR0b24gZXZlbnQgbGlzdGVuZXJzXG4gICAgICBmdW5jdGlvbiBzZXRBY3RpdmVTaWRlYmFyQnV0dG9uKGFjdGl2ZUJ0bikge1xuICAgICAgICBkb2N1bWVudFxuICAgICAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNpZGViYXItYnRuLCAuY2F0ZWdvcnktaXRlbVwiKVxuICAgICAgICAgIC5mb3JFYWNoKChidG4pID0+IHtcbiAgICAgICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICBpZiAoYWN0aXZlQnRuKSBhY3RpdmVCdG4uY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcbiAgICAgIH1cblxuICAgICAgLy8gSGlnaGxpZ2h0IFVwY29taW5nIGJ1dHRvbiBvbiBsb2FkXG4gICAgICBzZXRBY3RpdmVTaWRlYmFyQnV0dG9uKGJ0blVwY29taW5nKTtcblxuICAgICAgaWYgKGJ0bkNhbGVuZGFyKSB7XG4gICAgICAgIGJ0bkNhbGVuZGFyLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgY2FsZW5kYXIuY2hhbmdlVmlldyhcImRheUdyaWRNb250aFwiKTtcbiAgICAgICAgICBzZXRBY3RpdmVTaWRlYmFyQnV0dG9uKGJ0bkNhbGVuZGFyKTtcbiAgICAgICAgICB1cGRhdGVDYWxlbmRhckhlYWRlckJ1dHRvbnMoXCJkYXlHcmlkTW9udGhcIik7XG4gICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJ2aWV3Q2hhbmdlXCIsIHsgZGV0YWlsOiB7IHZpZXc6IFwiY2FsZW5kYXJcIiB9IH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoYnRuVXBjb21pbmcpIHtcbiAgICAgICAgYnRuVXBjb21pbmcuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICBjYWxlbmRhci5jaGFuZ2VWaWV3KFwibGlzdFdlZWtcIik7XG4gICAgICAgICAgc2V0QWN0aXZlU2lkZWJhckJ1dHRvbihidG5VcGNvbWluZyk7XG4gICAgICAgICAgdXBkYXRlQ2FsZW5kYXJIZWFkZXJCdXR0b25zKFwibGlzdFdlZWtcIik7XG4gICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJ2aWV3Q2hhbmdlXCIsIHsgZGV0YWlsOiB7IHZpZXc6IFwidXBjb21pbmdcIiB9IH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgICBpZiAoYnRuVG9kYXkpIHtcbiAgICAgICAgYnRuVG9kYXkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICBjYWxlbmRhci5jaGFuZ2VWaWV3KFwidGltZUdyaWREYXlcIiwgbmV3IERhdGUoKSk7XG4gICAgICAgICAgc2V0QWN0aXZlU2lkZWJhckJ1dHRvbihidG5Ub2RheSk7XG4gICAgICAgICAgdXBkYXRlQ2FsZW5kYXJIZWFkZXJCdXR0b25zKFwidGltZUdyaWREYXlcIik7XG4gICAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJ2aWV3Q2hhbmdlXCIsIHsgZGV0YWlsOiB7IHZpZXc6IFwidG9kYXlcIiB9IH0pXG4gICAgICAgICAgKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIExpc3RlbiBmb3IgY2F0ZWdvcnkgZmlsdGVyIGV2ZW50XG4gICAgICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcihcImNhdGVnb3J5RmlsdGVyXCIsIChlKSA9PiB7XG4gICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gZS5kZXRhaWwuY2F0ZWdvcnk7XG4gICAgICAgIGNhbGVuZGFyLnJlbW92ZUFsbEV2ZW50cygpO1xuICAgICAgICBpZiAoY2F0ZWdvcnkpIHtcbiAgICAgICAgICBjYWxlbmRhci5jaGFuZ2VWaWV3KFwibGlzdFllYXJcIik7XG4gICAgICAgICAgY29uc3QgZmlsdGVyZWQgPSBhbGxUYXNrcy5maWx0ZXIoXG4gICAgICAgICAgICAodGFzaykgPT4gKHRhc2suY2F0ZWdvcnkgfHwgXCJOb25lXCIpID09PSBjYXRlZ29yeVxuICAgICAgICAgICk7XG4gICAgICAgICAgZmlsdGVyZWQuZm9yRWFjaCgodGFzaykgPT4gY2FsZW5kYXIuYWRkRXZlbnQodGFzaykpO1xuICAgICAgICAgIC8vIFJlbW92ZSAuYWN0aXZlIGZyb20gYWxsIHNpZGViYXItYnRuIGFuZCBjYXRlZ29yeS1pdGVtLCB0aGVuIGhpZ2hsaWdodCB0aGUgY2F0ZWdvcnlcbiAgICAgICAgICBkb2N1bWVudFxuICAgICAgICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2lkZWJhci1idG4sIC5jYXRlZ29yeS1pdGVtXCIpXG4gICAgICAgICAgICAuZm9yRWFjaCgoYnRuKSA9PiB7XG4gICAgICAgICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgLy8gSGlnaGxpZ2h0IHRoZSBjb3JyZWN0IGNhdGVnb3J5IGl0ZW1cbiAgICAgICAgICBjb25zdCBjYXRCdG4gPSBBcnJheS5mcm9tKFxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5jYXRlZ29yeS1pdGVtXCIpXG4gICAgICAgICAgKS5maW5kKChsaSkgPT4gbGkudGV4dENvbnRlbnQuaW5jbHVkZXMoY2F0ZWdvcnkpKTtcbiAgICAgICAgICBpZiAoY2F0QnRuKSBjYXRCdG4uY2xhc3NMaXN0LmFkZChcImFjdGl2ZVwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBjYWxlbmRhci5jaGFuZ2VWaWV3KFwiZGF5R3JpZE1vbnRoXCIpO1xuICAgICAgICAgIGFsbFRhc2tzLmZvckVhY2goKHRhc2spID0+IGNhbGVuZGFyLmFkZEV2ZW50KHRhc2spKTtcbiAgICAgICAgICBzZXRBY3RpdmVTaWRlYmFyQnV0dG9uKGJ0bkNhbGVuZGFyKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIEV2ZW50IExpc3RlbmVyc1xuICAgICAgaWYgKGFkZFRhc2tCdXR0b24pIHtcbiAgICAgICAgYWRkVGFza0J1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgIGlzRWRpdGluZyA9IGZhbHNlO1xuICAgICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzayA9IG51bGw7XG4gICAgICAgICAgZm9ybS5yZXNldCgpO1xuICAgICAgICAgIGFsbERheUNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICB0aW1lSW5wdXRzLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgICB1cGRhdGVGb3JtVUkoKTtcbiAgICAgICAgICBzaG93Rm9ybSgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKFwic3VibWl0XCIsIGFzeW5jIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgY29uc3QgZm9ybURhdGEgPSBnZXRGb3JtRGF0YSgpO1xuXG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKGlzRWRpdGluZykge1xuICAgICAgICAgICAgYXdhaXQgdXBkYXRlVGFzayhmb3JtRGF0YSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGF3YWl0IGNyZWF0ZVRhc2soZm9ybURhdGEpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmb3JtLnJlc2V0KCk7XG4gICAgICAgICAgYWxsRGF5Q2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgIHRpbWVJbnB1dHMuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xuICAgICAgICAgIGhpZGVGb3JtKCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBzYXZlIHRhc2s6XCIsIGVycm9yKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGRlbGV0ZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgYXN5bmMgKCkgPT4ge1xuICAgICAgICBpZiAoY3VycmVudEVkaXRpbmdUYXNrKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGF3YWl0IGRlbGV0ZVRhc2soY3VycmVudEVkaXRpbmdUYXNrLmlkKTtcbiAgICAgICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzay5yZW1vdmUoKTtcbiAgICAgICAgICAgIGZvcm0ucmVzZXQoKTtcbiAgICAgICAgICAgIGlzRWRpdGluZyA9IGZhbHNlO1xuICAgICAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcbiAgICAgICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xuICAgICAgICAgICAgaGlkZUZvcm0oKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBkZWxldGUgdGFzazpcIiwgZXJyb3IpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNhbmNlbEJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICBmb3JtLnJlc2V0KCk7XG4gICAgICAgIGlzRWRpdGluZyA9IGZhbHNlO1xuICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xuICAgICAgICBhbGxEYXlDaGVja2JveC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgIHRpbWVJbnB1dHMuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICB1cGRhdGVGb3JtVUkoKTtcbiAgICAgICAgaGlkZUZvcm0oKTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyBBZGQgY2xvc2UgKGNyb3NzKSBidXR0b24gaGFuZGxlclxuICAgICAgaWYgKGNsb3NlVGFza0Zvcm1CdG4pIHtcbiAgICAgICAgY2xvc2VUYXNrRm9ybUJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgIGZvcm0ucmVzZXQoKTtcbiAgICAgICAgICBpc0VkaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xuICAgICAgICAgIGFsbERheUNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICB0aW1lSW5wdXRzLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgICB1cGRhdGVGb3JtVUkoKTtcbiAgICAgICAgICBoaWRlRm9ybSgpO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gSGlkZSBmb3JtIG9uIGNsaWNrIG91dHNpZGVcbiAgICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZWRvd25cIiwgKGUpID0+IHtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIGZvcm0uY2xhc3NMaXN0LmNvbnRhaW5zKFwidmlzaWJsZVwiKSAmJlxuICAgICAgICAgICFmb3JtLmNvbnRhaW5zKGUudGFyZ2V0KSAmJlxuICAgICAgICAgICEoYWRkVGFza0J1dHRvbiAmJiBhZGRUYXNrQnV0dG9uLmNvbnRhaW5zKGUudGFyZ2V0KSlcbiAgICAgICAgKSB7XG4gICAgICAgICAgZm9ybS5yZXNldCgpO1xuICAgICAgICAgIGlzRWRpdGluZyA9IGZhbHNlO1xuICAgICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzayA9IG51bGw7XG4gICAgICAgICAgYWxsRGF5Q2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICAgIHRpbWVJbnB1dHMuc3R5bGUuZGlzcGxheSA9IFwiZmxleFwiO1xuICAgICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xuICAgICAgICAgIGhpZGVGb3JtKCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBIaWRlIGZvcm0gaW5pdGlhbGx5XG4gICAgICBoaWRlRm9ybSgpO1xuXG4gICAgICAvLyBIZWxwZXIgZnVuY3Rpb25zXG4gICAgICBmdW5jdGlvbiB1cGRhdGVGb3JtVUkoKSB7XG4gICAgICAgIGlmIChpc0VkaXRpbmcpIHtcbiAgICAgICAgICBmb3JtSGVhZGluZy50ZXh0Q29udGVudCA9IFwiRWRpdCBUYXNrXCI7XG4gICAgICAgICAgc3VibWl0QnV0dG9uLnRleHRDb250ZW50ID0gXCJTYXZlIENoYW5nZXNcIjtcbiAgICAgICAgICBkZWxldGVCdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcbiAgICAgICAgICBjYW5jZWxCdXR0b24uY2xhc3NMaXN0LnJlbW92ZShcImhpZGRlblwiKTtcbiAgICAgICAgICBpZiAoYWRkVGFza0J1dHRvbikgYWRkVGFza0J1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZm9ybUhlYWRpbmcudGV4dENvbnRlbnQgPSBcIkFkZCBOZXcgVGFza1wiO1xuICAgICAgICAgIHN1Ym1pdEJ1dHRvbi50ZXh0Q29udGVudCA9IFwiQWRkIFRhc2tcIjtcbiAgICAgICAgICBkZWxldGVCdXR0b24uY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICAgICAgICBjYW5jZWxCdXR0b24uY2xhc3NMaXN0LmFkZChcImhpZGRlblwiKTtcbiAgICAgICAgICBpZiAoYWRkVGFza0J1dHRvbikgYWRkVGFza0J1dHRvbi5kaXNhYmxlZCA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHBvcHVsYXRlRm9ybShldmVudCkge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpdGxlXCIpLnZhbHVlID0gZXZlbnQudGl0bGU7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGFza0RhdGVcIikudmFsdWUgPSBldmVudC5zdGFydFN0ci5zdWJzdHJpbmcoXG4gICAgICAgICAgMCxcbiAgICAgICAgICAxMFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBhbGxEYXkgPSBldmVudC5hbGxEYXk7XG4gICAgICAgIGFsbERheUNoZWNrYm94LmNoZWNrZWQgPSBhbGxEYXk7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLmRpc2FibGVkID0gYWxsRGF5O1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuZFRpbWVcIikuZGlzYWJsZWQgPSBhbGxEYXk7XG5cbiAgICAgICAgaWYgKCFhbGxEYXkpIHtcbiAgICAgICAgICBjb25zdCBzdGFydERhdGUgPSBuZXcgRGF0ZShldmVudC5zdGFydCk7XG4gICAgICAgICAgY29uc3QgZW5kRGF0ZSA9IG5ldyBEYXRlKGV2ZW50LmVuZCB8fCBldmVudC5zdGFydCk7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFRpbWVcIikudmFsdWUgPSBzdGFydERhdGVcbiAgICAgICAgICAgIC50b1RpbWVTdHJpbmcoKVxuICAgICAgICAgICAgLnN1YnN0cmluZygwLCA1KTtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuZFRpbWVcIikudmFsdWUgPSBlbmREYXRlXG4gICAgICAgICAgICAudG9UaW1lU3RyaW5nKClcbiAgICAgICAgICAgIC5zdWJzdHJpbmcoMCwgNSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFRpbWVcIikudmFsdWUgPSBcIlwiO1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5kVGltZVwiKS52YWx1ZSA9IFwiXCI7XG4gICAgICAgIH1cblxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlc2NyaXB0aW9uXCIpLnZhbHVlID1cbiAgICAgICAgICBldmVudC5leHRlbmRlZFByb3BzLmRlc2NyaXB0aW9uIHx8IFwiXCI7XG4gICAgICAgIC8vIFJlbW92ZSBwcmlvcml0eVxuICAgICAgICAvLyBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInByaW9yaXR5XCIpLnZhbHVlID1cbiAgICAgICAgLy8gICBldmVudC5leHRlbmRlZFByb3BzLnByaW9yaXR5IHx8IFwibG93XCI7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2F0ZWdvcnlcIikudmFsdWUgPVxuICAgICAgICAgIGV2ZW50LmV4dGVuZGVkUHJvcHMuY2F0ZWdvcnkgfHwgXCJOb25lXCI7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29tcGxldGVkXCIpLmNoZWNrZWQgPVxuICAgICAgICAgIGV2ZW50LmV4dGVuZGVkUHJvcHMuY29tcGxldGVkIHx8IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBnZXRGb3JtRGF0YSgpIHtcbiAgICAgICAgY29uc3QgY2F0ZWdvcnlWYWx1ZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2F0ZWdvcnlcIikudmFsdWU7XG4gICAgICAgIGNvbnN0IGFsbERheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWxsRGF5XCIpLmNoZWNrZWQ7XG4gICAgICAgIGNvbnN0IGRhdGUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhc2tEYXRlXCIpLnZhbHVlO1xuICAgICAgICBsZXQgc3RhcnQsIGVuZDtcblxuICAgICAgICBpZiAoYWxsRGF5KSB7XG4gICAgICAgICAgc3RhcnQgPSBkYXRlO1xuICAgICAgICAgIGVuZCA9IGRhdGU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY29uc3Qgc3RhcnRUaW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFRpbWVcIikudmFsdWU7XG4gICAgICAgICAgY29uc3QgZW5kVGltZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5kVGltZVwiKS52YWx1ZTtcbiAgICAgICAgICBzdGFydCA9IHN0YXJ0VGltZSA/IGAke2RhdGV9VCR7c3RhcnRUaW1lfWAgOiBkYXRlO1xuICAgICAgICAgIGVuZCA9IGVuZFRpbWUgPyBgJHtkYXRlfVQke2VuZFRpbWV9YCA6IHN0YXJ0O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBpZDogaXNFZGl0aW5nID8gY3VycmVudEVkaXRpbmdUYXNrLmlkIDogdW5kZWZpbmVkLFxuICAgICAgICAgIHRpdGxlOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRpdGxlXCIpLnZhbHVlLFxuICAgICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgICBlbmQ6IGVuZCxcbiAgICAgICAgICBhbGxEYXk6IGFsbERheSxcbiAgICAgICAgICBkZXNjcmlwdGlvbjogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXNjcmlwdGlvblwiKS52YWx1ZSxcbiAgICAgICAgICAvLyBSZW1vdmUgcHJpb3JpdHlcbiAgICAgICAgICAvLyBwcmlvcml0eTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eVwiKS52YWx1ZSxcbiAgICAgICAgICBjYXRlZ29yeTogY2F0ZWdvcnlWYWx1ZSA9PT0gXCJOb25lXCIgPyBudWxsIDogY2F0ZWdvcnlWYWx1ZSxcbiAgICAgICAgICBjb21wbGV0ZWQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29tcGxldGVkXCIpLmNoZWNrZWQsXG4gICAgICAgICAgLy8gUmVtb3ZlIHByaW9yaXR5IGZyb20gY2xhc3NOYW1lXG4gICAgICAgICAgY2xhc3NOYW1lOiBgJHtcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY29tcGxldGVkXCIpLmNoZWNrZWQgPyBcImNvbXBsZXRlZC10YXNrXCIgOiBcIlwiXG4gICAgICAgICAgfWAsXG4gICAgICAgIH07XG4gICAgICB9XG5cbiAgICAgIGFzeW5jIGZ1bmN0aW9uIGNyZWF0ZVRhc2soZGF0YSkge1xuICAgICAgICBjb25zdCBuZXdUYXNrID0gYXdhaXQgQXBpU2VydmljZS5jcmVhdGVUYXNrKGRhdGEpO1xuICAgICAgICBhbGxUYXNrcy5wdXNoKG5ld1Rhc2spO1xuICAgICAgICBjYWxlbmRhci5hZGRFdmVudChuZXdUYXNrKTtcbiAgICAgICAgcmV0dXJuIG5ld1Rhc2s7XG4gICAgICB9XG5cbiAgICAgIGFzeW5jIGZ1bmN0aW9uIHVwZGF0ZVRhc2soZGF0YSkge1xuICAgICAgICBjb25zdCB1cGRhdGVkVGFzayA9IGF3YWl0IEFwaVNlcnZpY2UudXBkYXRlVGFzayhkYXRhLmlkLCBkYXRhKTtcbiAgICAgICAgLy8gUmVtb3ZlIG9sZCB0YXNrIGZyb20gYWxsVGFza3MgYW5kIGFkZCB1cGRhdGVkIG9uZVxuICAgICAgICBhbGxUYXNrcyA9IGFsbFRhc2tzLmZpbHRlcigodCkgPT4gdC5pZCAhPT0gZGF0YS5pZCk7XG4gICAgICAgIGFsbFRhc2tzLnB1c2godXBkYXRlZFRhc2spO1xuICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sucmVtb3ZlKCk7XG4gICAgICAgIGNhbGVuZGFyLmFkZEV2ZW50KHVwZGF0ZWRUYXNrKTtcbiAgICAgICAgcmV0dXJuIHVwZGF0ZWRUYXNrO1xuICAgICAgfVxuXG4gICAgICBhc3luYyBmdW5jdGlvbiBkZWxldGVUYXNrKGlkKSB7XG4gICAgICAgIGF3YWl0IEFwaVNlcnZpY2UuZGVsZXRlVGFzayhpZCk7XG4gICAgICAgIGFsbFRhc2tzID0gYWxsVGFza3MuZmlsdGVyKCh0KSA9PiB0LmlkICE9PSBpZCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEFmdGVyIGNhbGVuZGFyIGluaXRpYWxpemF0aW9uXG4gICAgICBmdW5jdGlvbiB1cGRhdGVDYWxlbmRhckhlYWRlckJ1dHRvbnModmlld1R5cGUpIHtcbiAgICAgICAgY29uc3QgZmNIZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmZjLWhlYWRlci10b29sYmFyXCIpO1xuICAgICAgICBpZiAoIWZjSGVhZGVyKSByZXR1cm47XG4gICAgICAgIC8vIEhpZGUgaGVhZGVyIGZvciBsaXN0V2VlayAoVXBjb21pbmcpLCB0aW1lR3JpZERheSAoVG9kYXkpLCBhbmQgbGlzdFllYXIgKFllYXIpXG4gICAgICAgIGlmIChcbiAgICAgICAgICB2aWV3VHlwZSA9PT0gXCJsaXN0V2Vla1wiIHx8XG4gICAgICAgICAgdmlld1R5cGUgPT09IFwidGltZUdyaWREYXlcIiB8fFxuICAgICAgICAgIHZpZXdUeXBlID09PSBcImxpc3RZZWFyXCIgLy8gPC0tIGFkZCBsaXN0WWVhciBoZXJlXG4gICAgICAgICkge1xuICAgICAgICAgIGZjSGVhZGVyLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBmY0hlYWRlci5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwcmV2QnRuID0gZmNIZWFkZXIucXVlcnlTZWxlY3RvcihcIi5mYy1wcmV2LWJ1dHRvblwiKTtcbiAgICAgICAgY29uc3QgbmV4dEJ0biA9IGZjSGVhZGVyLnF1ZXJ5U2VsZWN0b3IoXCIuZmMtbmV4dC1idXR0b25cIik7XG4gICAgICAgIGNvbnN0IHRvZGF5QnRuID0gZmNIZWFkZXIucXVlcnlTZWxlY3RvcihcIi5mYy10b2RheS1idXR0b25cIik7XG4gICAgICAgIC8vIEhpZGUgcmlnaHQtc2lkZSB2aWV3IHN3aXRjaGVycyBpZiBwcmVzZW50XG4gICAgICAgIGNvbnN0IHJpZ2h0QnRucyA9IGZjSGVhZGVyLnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgXCIuZmMtdG9vbGJhci1jaHVuazpsYXN0LWNoaWxkIC5mYy1idXR0b25cIlxuICAgICAgICApO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgdmlld1R5cGUgPT09IFwibGlzdFdlZWtcIiB8fFxuICAgICAgICAgIHZpZXdUeXBlID09PSBcInRpbWVHcmlkRGF5XCIgfHxcbiAgICAgICAgICB2aWV3VHlwZSA9PT0gXCJsaXN0WWVhclwiIC8vIDwtLSBhZGQgbGlzdFllYXIgaGVyZVxuICAgICAgICApIHtcbiAgICAgICAgICBpZiAocHJldkJ0bikgcHJldkJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgaWYgKG5leHRCdG4pIG5leHRCdG4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgIGlmICh0b2RheUJ0bikgdG9kYXlCdG4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgIHJpZ2h0QnRucy5mb3JFYWNoKChidG4pID0+IChidG4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHByZXZCdG4pIHByZXZCdG4uc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICAgICAgaWYgKG5leHRCdG4pIG5leHRCdG4uc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICAgICAgaWYgKHRvZGF5QnRuKSB0b2RheUJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJcIjtcbiAgICAgICAgICByaWdodEJ0bnMuZm9yRWFjaCgoYnRuKSA9PiAoYnRuLnN0eWxlLmRpc3BsYXkgPSBcIlwiKSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgY2FsZW5kYXIub24oXCJ2aWV3RGlkTW91bnRcIiwgZnVuY3Rpb24gKGFyZykge1xuICAgICAgICB1cGRhdGVDYWxlbmRhckhlYWRlckJ1dHRvbnMoYXJnLnZpZXcudHlwZSk7XG4gICAgICB9KTtcblxuICAgICAgLy8gSGlkZSBoZWFkZXIgb24gaW5pdGlhbCBsb2FkIGlmIGluIGxpc3RXZWVrIChVcGNvbWluZylcbiAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBjb25zdCBmY0hlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoXCIuZmMtaGVhZGVyLXRvb2xiYXJcIik7XG4gICAgICAgIGlmIChmY0hlYWRlcikgZmNIZWFkZXIuc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgfSwgMTAwKTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4ge307XG59KSgpO1xuIiwiaW1wb3J0IHsgQXBpU2VydmljZSB9IGZyb20gXCIuL2FwaVNlcnZpY2UuanNcIjtcblxuZXhwb3J0IGNvbnN0IENhdGVnb3J5ID0gKCgpID0+IHtcbiAgbGV0IGNhdGVnb3JpZXMgPSBbXTtcbiAgbGV0IGFjdGl2ZUNhdGVnb3J5ID0gbnVsbDsgLy8gVHJhY2sgdGhlIGN1cnJlbnRseSBzZWxlY3RlZCBjYXRlZ29yeVxuXG4gIC8vIEhlbHBlciBmdW5jdGlvbnMgZGVmaW5lZCBvdXRzaWRlIERPTUNvbnRlbnRMb2FkZWRcbiAgZnVuY3Rpb24gcmVuZGVyQ2F0ZWdvcmllcygpIHtcbiAgICBjb25zdCBjYXRlZ29yaWVzQ29udGFpbmVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRlZ29yaWVzLWNvbnRhaW5lclwiKTtcblxuICAgIGNhdGVnb3JpZXNDb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcblxuICAgIGNhdGVnb3JpZXMuZm9yRWFjaCgoY2F0ZWdvcnksIGluZGV4KSA9PiB7XG4gICAgICAvLyBFbnN1cmUgY2F0ZWdvcnkuaWQgaXMgYSBzdHJpbmcgZm9yIGNvbnNpc3RlbmN5XG4gICAgICBjb25zdCBsaSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaVwiKTtcbiAgICAgIGxpLmNsYXNzTmFtZSA9IFwiY2F0ZWdvcnktaXRlbVwiO1xuICAgICAgaWYgKGFjdGl2ZUNhdGVnb3J5ID09PSBjYXRlZ29yeS5uYW1lKSB7XG4gICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XG4gICAgICB9XG4gICAgICBsaS5pbm5lckhUTUwgPSBgXG4gICAgICAgICAgPGRpdiBjbGFzcz1cImNhdGVnb3J5LWNvbnRlbnRcIj5cbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiY2F0ZWdvcnktY29sb3JcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6ICR7Y2F0ZWdvcnkuY29sb3J9O1wiPjwvc3Bhbj4gXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNhdGVnb3J5LW5hbWVcIj4ke2NhdGVnb3J5Lm5hbWV9PC9zcGFuPlxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJkZWxldGUtY2F0ZWdvcnktYnRuXCIgZGF0YS1pZD1cIiR7Y2F0ZWdvcnkuaWR9XCI+XG4gICAgICAgICAgICA8aSBjbGFzcz1cImZhcyBmYS10cmFzaFwiPjwvaT5cbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgYDtcbiAgICAgIC8vIEFkZCBjbGljayBldmVudCBmb3IgZmlsdGVyaW5nXG4gICAgICBsaS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcbiAgICAgICAgLy8gUHJldmVudCBjbGljayBpZiBkZWxldGUgYnV0dG9uIGlzIGNsaWNrZWRcbiAgICAgICAgaWYgKGUudGFyZ2V0LmNsb3Nlc3QoXCIuZGVsZXRlLWNhdGVnb3J5LWJ0blwiKSkgcmV0dXJuO1xuICAgICAgICBhY3RpdmVDYXRlZ29yeSA9IGNhdGVnb3J5Lm5hbWU7XG4gICAgICAgIC8vIFJlbW92ZSAuYWN0aXZlIGZyb20gYWxsIHNpZGViYXItYnRuIGFuZCBjYXRlZ29yeS1pdGVtXG4gICAgICAgIGRvY3VtZW50XG4gICAgICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuc2lkZWJhci1idG4sIC5jYXRlZ29yeS1pdGVtXCIpXG4gICAgICAgICAgLmZvckVhY2goKGJ0bikgPT4ge1xuICAgICAgICAgICAgYnRuLmNsYXNzTGlzdC5yZW1vdmUoXCJhY3RpdmVcIik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIGxpLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XG4gICAgICAgIHJlbmRlckNhdGVnb3JpZXMoKTtcbiAgICAgICAgLy8gRGlzcGF0Y2ggY3VzdG9tIGV2ZW50IGZvciBmaWx0ZXJpbmdcbiAgICAgICAgd2luZG93LmRpc3BhdGNoRXZlbnQoXG4gICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwiY2F0ZWdvcnlGaWx0ZXJcIiwge1xuICAgICAgICAgICAgZGV0YWlsOiB7IGNhdGVnb3J5OiBjYXRlZ29yeS5uYW1lIH0sXG4gICAgICAgICAgfSlcbiAgICAgICAgKTtcbiAgICAgIH0pO1xuICAgICAgY2F0ZWdvcmllc0NvbnRhaW5lci5hcHBlbmRDaGlsZChsaSk7XG4gICAgfSk7XG5cbiAgICAvLyBBZGQgZXZlbnQgbGlzdGVuZXJzIHRvIGRlbGV0ZSBidXR0b25zXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5kZWxldGUtY2F0ZWdvcnktYnRuXCIpLmZvckVhY2goKGJ0bikgPT4ge1xuICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoZSkgPT4ge1xuICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAvLyBFbnN1cmUgaWQgaXMgdHJlYXRlZCBhcyBhIHN0cmluZ1xuICAgICAgICBjb25zdCBpZCA9IGJ0bi5kYXRhc2V0LmlkO1xuICAgICAgICBjb25zb2xlLmxvZyhcIkF0dGVtcHRpbmcgdG8gZGVsZXRlIGNhdGVnb3J5IHdpdGggaWQ6XCIsIGlkKTtcbiAgICAgICAgY29uc29sZS5sb2coXCJDdXJyZW50IGNhdGVnb3JpZXM6XCIsIGNhdGVnb3JpZXMpO1xuICAgICAgICBkZWxldGVDYXRlZ29yeShpZCk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHVwZGF0ZUNhdGVnb3J5U2VsZWN0KCkge1xuICAgIGNvbnN0IGNhdGVnb3J5U2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRlZ29yeVwiKTtcbiAgICBjYXRlZ29yeVNlbGVjdC5pbm5lckhUTUwgPSBcIlwiO1xuXG4gICAgLy8gQWRkIFwiTm9uZVwiIG9wdGlvbiBmaXJzdFxuICAgIGNvbnN0IG5vbmVPcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xuICAgIG5vbmVPcHRpb24udmFsdWUgPSBcIk5vbmVcIjtcbiAgICBub25lT3B0aW9uLnRleHRDb250ZW50ID0gXCJOb25lXCI7XG4gICAgY2F0ZWdvcnlTZWxlY3QuYXBwZW5kQ2hpbGQobm9uZU9wdGlvbik7XG5cbiAgICAvLyBBZGQgYWxsIGNhdGVnb3J5IG9wdGlvbnNcbiAgICBjYXRlZ29yaWVzLmZvckVhY2goKGNhdGVnb3J5KSA9PiB7XG4gICAgICBjb25zdCBvcHRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpO1xuICAgICAgb3B0aW9uLnZhbHVlID0gY2F0ZWdvcnkubmFtZTtcbiAgICAgIG9wdGlvbi50ZXh0Q29udGVudCA9IGNhdGVnb3J5Lm5hbWU7XG4gICAgICBjYXRlZ29yeVNlbGVjdC5hcHBlbmRDaGlsZChvcHRpb24pO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gZGVsZXRlQ2F0ZWdvcnkoaWQpIHtcbiAgICAvLyBDb252ZXJ0IGlkIHRvIHN0cmluZyBmb3IgY29uc2lzdGVuY3lcbiAgICBjb25zdCBpbmRleCA9IGNhdGVnb3JpZXMuZmluZEluZGV4KFxuICAgICAgKGMpID0+IGMuaWQudG9TdHJpbmcoKSA9PT0gaWQudG9TdHJpbmcoKVxuICAgICk7XG4gICAgY29uc29sZS5sb2coXCJkZWxldGVDYXRlZ29yeSBjYWxsZWQgd2l0aCBpZDpcIiwgaWQsIFwiRm91bmQgaW5kZXg6XCIsIGluZGV4KTtcblxuICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICB0cnkge1xuICAgICAgICAvLyBEZWxldGUgY2F0ZWdvcnkgdmlhIEFQSVxuICAgICAgICBhd2FpdCBBcGlTZXJ2aWNlLmRlbGV0ZUNhdGVnb3J5KGlkKTtcbiAgICAgICAgLy8gUmVtb3ZlIGZyb20gbG9jYWwgc3RhdGVcbiAgICAgICAgY2F0ZWdvcmllcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICByZW5kZXJDYXRlZ29yaWVzKCk7XG4gICAgICAgIHVwZGF0ZUNhdGVnb3J5U2VsZWN0KCk7XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGRlbGV0ZSBjYXRlZ29yeTpcIiwgZXJyb3IpO1xuICAgICAgICAvLyBPcHRpb25hbGx5IHNob3cgZXJyb3IgbWVzc2FnZSB0byB1c2VyXG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJDYXRlZ29yeSBub3QgZm91bmQgd2l0aCBpZDpcIiwgaWQpO1xuICAgIH1cbiAgfVxuXG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09IFwiL2FwcFwiKSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIkRPTUNvbnRlbnRMb2FkZWRcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgY29uc3QgY2F0ZWdvcnlTZWxlY3QgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3J5XCIpO1xuICAgICAgY29uc3QgY2F0ZWdvcmllc0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFxuICAgICAgICBcImNhdGVnb3JpZXMtY29udGFpbmVyXCJcbiAgICAgICk7XG4gICAgICBjb25zdCBhZGROZXdDYXRlZ29yeUJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWRkLW5ldy1jYXRlZ29yeS1idG5cIik7XG4gICAgICBjb25zdCBuZXdDYXRlZ29yeUZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1mb3JtXCIpO1xuICAgICAgY29uc3QgY3JlYXRlQ2F0ZWdvcnlCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNyZWF0ZS1jYXRlZ29yeS1idG5cIik7XG5cbiAgICAgIC8vIEZldGNoIGNhdGVnb3JpZXMgZnJvbSBBUElcbiAgICAgIGFzeW5jIGZ1bmN0aW9uIGluaXRpYWxpemVDYXRlZ29yaWVzKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNhdGVnb3JpZXMgPSBhd2FpdCBBcGlTZXJ2aWNlLmZldGNoQ2F0ZWdvcmllcygpO1xuICAgICAgICAgIGNvbnNvbGUubG9nKFwiRmV0Y2hlZCBjYXRlZ29yaWVzOlwiLCBjYXRlZ29yaWVzKTtcbiAgICAgICAgICByZW5kZXJDYXRlZ29yaWVzKCk7XG4gICAgICAgICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGZldGNoIGNhdGVnb3JpZXM6XCIsIGVycm9yKTtcbiAgICAgICAgICAvLyBPcHRpb25hbGx5IHNob3cgZXJyb3IgbWVzc2FnZSB0byB1c2VyXG4gICAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xuICAgICAgICAgIHVwZGF0ZUNhdGVnb3J5U2VsZWN0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaW5pdGlhbGl6ZUNhdGVnb3JpZXMoKTtcblxuICAgICAgLy8gQ2F0ZWdvcnkgbWFuYWdlbWVudFxuICAgICAgYWRkTmV3Q2F0ZWdvcnlCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgbmV3Q2F0ZWdvcnlGb3JtLnN0eWxlLmRpc3BsYXkgPVxuICAgICAgICAgIG5ld0NhdGVnb3J5Rm9ybS5zdHlsZS5kaXNwbGF5ID09PSBcIm5vbmVcIiA/IFwiZmxleFwiIDogXCJub25lXCI7XG4gICAgICB9KTtcblxuICAgICAgY3JlYXRlQ2F0ZWdvcnlCdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jICgpID0+IHtcbiAgICAgICAgY29uc3QgbmFtZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3LWNhdGVnb3J5LW5hbWVcIikudmFsdWUudHJpbSgpO1xuICAgICAgICBjb25zdCBjb2xvciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3LWNhdGVnb3J5LWNvbG9yXCIpLnZhbHVlO1xuXG4gICAgICAgIGlmIChuYW1lKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIC8vIEFkZCBuZXcgY2F0ZWdvcnkgdmlhIEFQSVxuICAgICAgICAgICAgY29uc3QgYXBpQ2F0ZWdvcnkgPSBhd2FpdCBBcGlTZXJ2aWNlLmNyZWF0ZUNhdGVnb3J5KHtcbiAgICAgICAgICAgICAgbmFtZSxcbiAgICAgICAgICAgICAgY29sb3IsXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhdGVnb3JpZXMucHVzaChhcGlDYXRlZ29yeSk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIkFkZGVkIG5ldyBjYXRlZ29yeTpcIiwgYXBpQ2F0ZWdvcnkpO1xuICAgICAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xuICAgICAgICAgICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QoKTtcblxuICAgICAgICAgICAgLy8gUmVzZXQgZm9ybVxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctY2F0ZWdvcnktbmFtZVwiKS52YWx1ZSA9IFwiXCI7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1jb2xvclwiKS52YWx1ZSA9IFwiI2NjY2NjY1wiO1xuICAgICAgICAgICAgbmV3Q2F0ZWdvcnlGb3JtLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBjcmVhdGUgY2F0ZWdvcnk6XCIsIGVycm9yKTtcbiAgICAgICAgICAgIC8vIE9wdGlvbmFsbHkgc2hvdyBlcnJvciBtZXNzYWdlIHRvIHVzZXJcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBBZGQgYSBnbG9iYWwgbGlzdGVuZXIgdG8gY2xlYXIgZmlsdGVyIHdoZW4gY2xpY2tpbmcgXCJDYWxlbmRhclwiIG9yIFwiVXBjb21pbmdcIiBvciBcIlRvZGF5XCJcbiAgICAgIFtcImJ0bi1jYWxlbmRhclwiLCBcImJ0bi11cGNvbWluZ1wiLCBcImJ0bi10b2RheVwiXS5mb3JFYWNoKChpZCkgPT4ge1xuICAgICAgICBjb25zdCBidG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgICAgIGlmIChidG4pIHtcbiAgICAgICAgICBidG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICAgIGFjdGl2ZUNhdGVnb3J5ID0gbnVsbDtcbiAgICAgICAgICAgIHJlbmRlckNhdGVnb3JpZXMoKTtcbiAgICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgICBuZXcgQ3VzdG9tRXZlbnQoXCJjYXRlZ29yeUZpbHRlclwiLCB7IGRldGFpbDogeyBjYXRlZ29yeTogbnVsbCB9IH0pXG4gICAgICAgICAgICApO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfVxuICByZXR1cm4ge1xuICAgIGdldENhdGVnb3JpZXM6ICgpID0+IGNhdGVnb3JpZXMsXG4gICAgcmVuZGVyQ2F0ZWdvcmllcyxcbiAgICB1cGRhdGVDYXRlZ29yeVNlbGVjdCxcbiAgfTtcbn0pKCk7XG4iLCJleHBvcnQgY29uc3QgRG9tVXRpbHMgPSAoKCkgPT4ge1xuICBmdW5jdGlvbiBjbGVhck1lc3NhZ2VzKCkge1xuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVzc2FnZUNvbnRhaW5lclwiKTtcbiAgICBpZiAoY29udGFpbmVyKSBjb250YWluZXIuaW5uZXJIVE1MID0gXCJcIjtcbiAgICBkb2N1bWVudFxuICAgICAgLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZXJyb3ItbWVzc2FnZSwgLnN1Y2Nlc3MtbWVzc2FnZVwiKVxuICAgICAgLmZvckVhY2goKGVsKSA9PiB7XG4gICAgICAgIGlmIChlbC5wYXJlbnROb2RlICE9PSBjb250YWluZXIpIGVsLnJlbW92ZSgpO1xuICAgICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBzaG93TWVzc2FnZShtZXNzYWdlLCB0eXBlID0gXCJlcnJvclwiKSB7XG4gICAgY2xlYXJNZXNzYWdlcygpO1xuICAgIGNvbnN0IG1lc3NhZ2VFbGVtZW50ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBtZXNzYWdlRWxlbWVudC5jbGFzc05hbWUgPVxuICAgICAgdHlwZSA9PT0gXCJlcnJvclwiID8gXCJlcnJvci1tZXNzYWdlXCIgOiBcInN1Y2Nlc3MtbWVzc2FnZVwiO1xuICAgIG1lc3NhZ2Uuc3BsaXQoXCJcXG5cIikuZm9yRWFjaCgobGluZSkgPT4ge1xuICAgICAgY29uc3QgcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJwXCIpO1xuICAgICAgcC50ZXh0Q29udGVudCA9IGxpbmU7XG4gICAgICBtZXNzYWdlRWxlbWVudC5hcHBlbmRDaGlsZChwKTtcbiAgICB9KTtcblxuICAgIGNvbnN0IGNvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibWVzc2FnZUNvbnRhaW5lclwiKTtcbiAgICBpZiAoY29udGFpbmVyKSB7XG4gICAgICBjb250YWluZXIuYXBwZW5kQ2hpbGQobWVzc2FnZUVsZW1lbnQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdXRoRm9ybVwiKTtcbiAgICAgIGZvcm1cbiAgICAgICAgPyBmb3JtLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKG1lc3NhZ2VFbGVtZW50LCBmb3JtKVxuICAgICAgICA6IGRvY3VtZW50LmJvZHkucHJlcGVuZChtZXNzYWdlRWxlbWVudCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBjbGVhck1lc3NhZ2VzLFxuICAgIHNob3dFcnJvcjogKG1zZykgPT4gc2hvd01lc3NhZ2UobXNnLCBcImVycm9yXCIpLFxuICAgIHNob3dTdWNjZXNzOiAobXNnKSA9PiBzaG93TWVzc2FnZShtc2csIFwic3VjY2Vzc1wiKSxcbiAgfTtcbn0pKCk7XG4iLCJleHBvcnQgY29uc3QgTG9hZGVyID0gKCgpID0+IHtcbiAgZnVuY3Rpb24gdG9nZ2xlKHNob3cpIHtcbiAgICBsZXQgbG9hZGVyID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsb2FkZXJcIik7XG4gICAgaWYgKCFsb2FkZXIgJiYgc2hvdykgbG9hZGVyID0gY3JlYXRlKCk7XG4gICAgaWYgKGxvYWRlcikgbG9hZGVyLnN0eWxlLmRpc3BsYXkgPSBzaG93ID8gXCJmbGV4XCIgOiBcIm5vbmVcIjtcbiAgfVxuXG4gIGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgICBjb25zdCBsb2FkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGxvYWRlci5pZCA9IFwibG9hZGVyXCI7XG4gICAgbG9hZGVyLmNsYXNzTmFtZSA9IFwibG9hZGVyXCI7XG4gICAgbG9hZGVyLmlubmVySFRNTCA9ICc8ZGl2IGNsYXNzPVwic3Bpbm5lclwiPjwvZGl2Pic7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChsb2FkZXIpO1xuICAgIHJldHVybiBsb2FkZXI7XG4gIH1cblxuICByZXR1cm4geyB0b2dnbGUgfTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBMb2FkZXIgfSBmcm9tIFwiLi9sb2FkZXIuanNcIjtcbmltcG9ydCB7IERvbVV0aWxzIH0gZnJvbSBcIi4vZG9tVXRpbHMuanNcIjtcblxuZXhwb3J0IGNvbnN0IFVzZXIgPSAoKCkgPT4ge1xuICBhc3luYyBmdW5jdGlvbiBsb2dvdXQoKSB7XG4gICAgY29uc29sZS5sb2coXCJBdHRlbXB0aW5nIGxvZ291dC4uLlwiKTtcbiAgICBMb2FkZXIudG9nZ2xlKHRydWUpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKFwiL2FwaS9sb2dvdXRcIiwge1xuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICBoZWFkZXJzOiB7IEFjY2VwdDogXCJhcHBsaWNhdGlvbi9qc29uXCIgfSxcbiAgICAgIH0pO1xuXG4gICAgICBjb25zdCBkYXRhID0gYXdhaXQgcmVzcG9uc2UuanNvbigpLmNhdGNoKCgpID0+ICh7fSkpO1xuICAgICAgaWYgKCFyZXNwb25zZS5vaylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGRhdGEuZXJyb3IgfHwgYExvZ291dCBmYWlsZWQgd2l0aCBzdGF0dXM6ICR7cmVzcG9uc2Uuc3RhdHVzfWBcbiAgICAgICAgKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiTG9nb3V0IHN1Y2Nlc3NmdWwgdmlhIEFQSS5cIik7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJMb2dvdXQgQVBJIGNhbGwgZmFpbGVkOlwiLCBlcnJvcik7XG4gICAgICBEb21VdGlscy5zaG93RXJyb3IoXG4gICAgICAgIFwiQ291bGQgbm90IHByb3Blcmx5IGxvZyBvdXQuIENsZWFyIGNvb2tpZXMgbWFudWFsbHkgaWYgbmVlZGVkLlwiXG4gICAgICApO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBsb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbShcInVzZXJcIik7XG4gICAgICBMb2FkZXIudG9nZ2xlKGZhbHNlKTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvbG9naW5cIjtcbiAgICB9XG4gIH1cblxuICBmdW5jdGlvbiBkaXNwbGF5VXNlckRhdGEoKSB7XG4gICAgY29uc3QgdXNlckRhdGFTdHJpbmcgPSBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInVzZXJcIik7XG4gICAgaWYgKCF1c2VyRGF0YVN0cmluZykgcmV0dXJuIGxvZ291dCgpO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCB1c2VyRGF0YSA9IEpTT04ucGFyc2UodXNlckRhdGFTdHJpbmcpO1xuICAgICAgY29uc3QgdXNlck5hbWUgPSB1c2VyRGF0YS5uYW1lIHx8IFwiVXNlclwiO1xuICAgICAgY29uc3QgdXNlck5hbWVEaXNwbGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ1c2VyLW5hbWUtZGlzcGxheVwiKTtcbiAgICAgIGlmICh1c2VyTmFtZURpc3BsYXkpIHVzZXJOYW1lRGlzcGxheS50ZXh0Q29udGVudCA9IHVzZXJOYW1lO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoXCJJbnZhbGlkIHVzZXIgZGF0YSBpbiBsb2NhbFN0b3JhZ2UuXCIpO1xuICAgICAgbG9nb3V0KCk7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHsgbG9nb3V0LCBkaXNwbGF5VXNlckRhdGEgfTtcbn0pKCk7XG4iLCIvLyBUaGUgbW9kdWxlIGNhY2hlXG52YXIgX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fID0ge307XG5cbi8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG5mdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuXHR2YXIgY2FjaGVkTW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXTtcblx0aWYgKGNhY2hlZE1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG5cdFx0cmV0dXJuIGNhY2hlZE1vZHVsZS5leHBvcnRzO1xuXHR9XG5cdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG5cdHZhciBtb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdID0ge1xuXHRcdC8vIG5vIG1vZHVsZS5pZCBuZWVkZWRcblx0XHQvLyBubyBtb2R1bGUubG9hZGVkIG5lZWRlZFxuXHRcdGV4cG9ydHM6IHt9XG5cdH07XG5cblx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG5cdF9fd2VicGFja19tb2R1bGVzX19bbW9kdWxlSWRdKG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG5cdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG5cdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbn1cblxuIiwiLy8gZGVmaW5lIGdldHRlciBmdW5jdGlvbnMgZm9yIGhhcm1vbnkgZXhwb3J0c1xuX193ZWJwYWNrX3JlcXVpcmVfXy5kID0gKGV4cG9ydHMsIGRlZmluaXRpb24pID0+IHtcblx0Zm9yKHZhciBrZXkgaW4gZGVmaW5pdGlvbikge1xuXHRcdGlmKF9fd2VicGFja19yZXF1aXJlX18ubyhkZWZpbml0aW9uLCBrZXkpICYmICFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywga2V5KSkge1xuXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIGtleSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGRlZmluaXRpb25ba2V5XSB9KTtcblx0XHR9XG5cdH1cbn07IiwiX193ZWJwYWNrX3JlcXVpcmVfXy5vID0gKG9iaiwgcHJvcCkgPT4gKE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmosIHByb3ApKSIsIi8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uciA9IChleHBvcnRzKSA9PiB7XG5cdGlmKHR5cGVvZiBTeW1ib2wgIT09ICd1bmRlZmluZWQnICYmIFN5bWJvbC50b1N0cmluZ1RhZykge1xuXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBTeW1ib2wudG9TdHJpbmdUYWcsIHsgdmFsdWU6ICdNb2R1bGUnIH0pO1xuXHR9XG5cdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG59OyIsImltcG9ydCB7IFVzZXIgfSBmcm9tIFwiLi9tb2R1bGVzL3VzZXIuanNcIjtcbmltcG9ydCB7IEF1dGggfSBmcm9tIFwiLi9tb2R1bGVzL2F1dGguanNcIjtcbmltcG9ydCB7IFRvZG8gfSBmcm9tIFwiLi9tb2R1bGVzL2NhbGVuZGFyLmpzXCI7XG5cbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsICgpID0+IHtcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvYXBwXCIpIHtcbiAgICBVc2VyLmRpc3BsYXlVc2VyRGF0YSgpO1xuICB9XG4gIGNvbnN0IGxvZ291dEJ0biA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLWxvZ291dFwiKTtcbiAgaWYgKGxvZ291dEJ0bikgbG9nb3V0QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBVc2VyLmxvZ291dCk7XG5cbiAgY29uc29sZS5sb2coXCJNYWluIGFwcCBpbml0aWFsaXplZC5cIik7XG59KTtcbiJdLCJuYW1lcyI6W10sInNvdXJjZVJvb3QiOiIifQ==