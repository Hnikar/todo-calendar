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
        eventDrop: async function (info) {
          try {
            const event = info.event;
            let start = event.startStr;
            let end = event.endStr;

            // Fix for allDay events: FullCalendar uses exclusive end date
            if (event.allDay) {
              // If end is present, subtract one day to get the inclusive end
              if (event.end) {
                const endDate = new Date(event.end);
                endDate.setDate(endDate.getDate() - 1);
                // Format as yyyy-mm-dd
                end = endDate.toISOString().slice(0, 10);
              } else {
                end = start;
              }
            } else {
              // For timed events, use end as is, or set to start if not present
              end = event.endStr || start;
            }

            const updatedData = {
              id: event.id,
              title: event.title,
              start: start,
              end: end,
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
        const prevBtn = fcHeader.querySelector(".fc-prev-button");
        const nextBtn = fcHeader.querySelector(".fc-next-button");
        const todayBtn = fcHeader.querySelector(".fc-today-button");
        // Hide right-side view switchers if present
        const rightBtns = fcHeader.querySelectorAll(
          ".fc-toolbar-chunk:last-child .fc-button"
        );
        if (viewType === "listWeek" || viewType === "timeGridDay") {
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUFDL0MsT0FBTzs7QUFFUCx3REFBd0Q7QUFDeEQ7QUFDQTtBQUNBLHNEQUFzRCxnQkFBZ0I7QUFDdEU7QUFDQTtBQUNBLE1BQU07QUFDTjtBQUNBLE1BQU0sa0RBQVE7QUFDZDtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTSw4Q0FBTTtBQUNaO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFdBQVc7QUFDWCxDQUFDOzs7Ozs7O1VDOUNEO1VBQ0E7O1VBRUE7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7VUFDQTtVQUNBO1VBQ0E7O1VBRUE7VUFDQTs7VUFFQTtVQUNBO1VBQ0E7Ozs7O1dDdEJBO1dBQ0E7V0FDQTtXQUNBO1dBQ0EseUNBQXlDLHdDQUF3QztXQUNqRjtXQUNBO1dBQ0E7Ozs7O1dDUEE7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7Ozs7Ozs7Ozs7OztBQ055QztBQUNBO0FBQ0k7O0FBRTdDO0FBQ0E7QUFDQSxJQUFJLGtEQUFJO0FBQ1I7QUFDQTtBQUNBLHFEQUFxRCxrREFBSTs7QUFFekQ7QUFDQSxDQUFDIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vc3RhdGljLy4vc3JjL21vZHVsZXMvYXBpU2VydmljZS5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy9hdXRoLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2NhbGVuZGFyLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2NhdGVnb3J5LmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2RvbVV0aWxzLmpzIiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9tb2R1bGVzL2xvYWRlci5qcyIsIndlYnBhY2s6Ly9zdGF0aWMvLi9zcmMvbW9kdWxlcy91c2VyLmpzIiwid2VicGFjazovL3N0YXRpYy93ZWJwYWNrL2Jvb3RzdHJhcCIsIndlYnBhY2s6Ly9zdGF0aWMvd2VicGFjay9ydW50aW1lL2RlZmluZSBwcm9wZXJ0eSBnZXR0ZXJzIiwid2VicGFjazovL3N0YXRpYy93ZWJwYWNrL3J1bnRpbWUvaGFzT3duUHJvcGVydHkgc2hvcnRoYW5kIiwid2VicGFjazovL3N0YXRpYy93ZWJwYWNrL3J1bnRpbWUvbWFrZSBuYW1lc3BhY2Ugb2JqZWN0Iiwid2VicGFjazovL3N0YXRpYy8uL3NyYy9pbmRleC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBMb2FkZXIgfSBmcm9tIFwiLi9sb2FkZXIuanNcIjtcbmltcG9ydCB7IERvbVV0aWxzIH0gZnJvbSBcIi4vZG9tVXRpbHMuanNcIjtcblxuZXhwb3J0IGNvbnN0IEFwaVNlcnZpY2UgPSAoKCkgPT4ge1xuICBjb25zdCBBUElfQkFTRSA9IFwiL2FwaVwiO1xuXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlcXVlc3QodXJsLCBtZXRob2QsIGRhdGEpIHtcbiAgICB0cnkge1xuICAgICAgTG9hZGVyLnRvZ2dsZSh0cnVlKTtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7QVBJX0JBU0V9JHt1cmx9YCwge1xuICAgICAgICBtZXRob2QsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgfSxcbiAgICAgICAgY3JlZGVudGlhbHM6IFwiaW5jbHVkZVwiLFxuICAgICAgICBib2R5OiBkYXRhID8gSlNPTi5zdHJpbmdpZnkoZGF0YSkgOiB1bmRlZmluZWQsXG4gICAgICB9KTtcblxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvbG9naW4/cmVhc29uPXVuYXV0aGVudGljYXRlZFwiO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHJlc3BvbnNlRGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIGNvbnNvbGUubG9nKHJlc3BvbnNlRGF0YSk7XG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihyZXNwb25zZURhdGEuZXJyb3IgfHwgXCJSZXF1ZXN0IGZhaWxlZFwiKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXNwb25zZURhdGE7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIERvbVV0aWxzLnNob3dFcnJvcihlcnJvci5tZXNzYWdlKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBMb2FkZXIudG9nZ2xlKGZhbHNlKTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4ge1xuICAgIC8vIFRhc2stcmVsYXRlZCBlbmRwb2ludHNcbiAgICBjcmVhdGVUYXNrOiAodGFzaykgPT4ge1xuICAgICAgY29uc3QgeyBwcmlvcml0eSwgLi4ucmVzdCB9ID0gdGFzaztcbiAgICAgIHJldHVybiBoYW5kbGVSZXF1ZXN0KFwiL2V2ZW50c1wiLCBcIlBPU1RcIiwgcmVzdCk7XG4gICAgfSxcbiAgICB1cGRhdGVUYXNrOiAoaWQsIHRhc2spID0+IHtcbiAgICAgIGNvbnN0IHsgcHJpb3JpdHksIC4uLnJlc3QgfSA9IHRhc2s7XG4gICAgICByZXR1cm4gaGFuZGxlUmVxdWVzdChgL2V2ZW50cy8ke2lkfWAsIFwiUFVUXCIsIHJlc3QpO1xuICAgIH0sXG4gICAgZGVsZXRlVGFzazogKGlkKSA9PiBoYW5kbGVSZXF1ZXN0KGAvZXZlbnRzLyR7aWR9YCwgXCJERUxFVEVcIiksXG4gICAgZmV0Y2hUYXNrczogKCkgPT4gaGFuZGxlUmVxdWVzdChcIi9ldmVudHNcIiwgXCJHRVRcIiksXG4gICAgLy8gQ2F0ZWdvcnktcmVsYXRlZCBlbmRwb2ludHNcbiAgICBjcmVhdGVDYXRlZ29yeTogKGNhdGVnb3J5KSA9PlxuICAgICAgaGFuZGxlUmVxdWVzdChcIi9jYXRlZ29yaWVzXCIsIFwiUE9TVFwiLCBjYXRlZ29yeSksXG4gICAgZmV0Y2hDYXRlZ29yaWVzOiAoKSA9PiBoYW5kbGVSZXF1ZXN0KFwiL2NhdGVnb3JpZXNcIiwgXCJHRVRcIiksXG4gICAgZGVsZXRlQ2F0ZWdvcnk6IChpZCkgPT4gaGFuZGxlUmVxdWVzdChgL2NhdGVnb3JpZXMvJHtpZH1gLCBcIkRFTEVURVwiKSxcbiAgfTtcbn0pKCk7XG4iLCJpbXBvcnQgeyBMb2FkZXIgfSBmcm9tIFwiLi9sb2FkZXIuanNcIjtcbmltcG9ydCB7IERvbVV0aWxzIH0gZnJvbSBcIi4vZG9tVXRpbHMuanNcIjtcblxuZXhwb3J0IGNvbnN0IEF1dGggPSAoKCkgPT4ge1xuICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSA9PT0gXCIvbG9naW5cIikge1xuICAgICAgaW5pdCgpO1xuICAgICAgY2hlY2tSZWRpcmVjdFJlYXNvbigpO1xuICAgIH1cbiAgfSk7XG5cbiAgZnVuY3Rpb24gaW5pdCgpIHtcbiAgICBjb25zdCBmb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJhdXRoRm9ybVwiKTtcbiAgICBpZiAoIWZvcm0pIHJldHVybiBjb25zb2xlLmVycm9yKFwiQXV0aCBmb3JtIG5vdCBmb3VuZCFcIik7XG5cbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoXCJzdWJtaXRcIiwgaGFuZGxlU3VibWl0KTtcbiAgICBzd2l0Y2hNb2RlKFwibG9naW5cIik7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIltkYXRhLW1vZGVdXCIpLmZvckVhY2goKHRhYikgPT5cbiAgICAgIHRhYi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICBzd2l0Y2hNb2RlKHRhYi5kYXRhc2V0Lm1vZGUpO1xuICAgICAgfSlcbiAgICApO1xuICB9XG5cbiAgZnVuY3Rpb24gc3dpdGNoTW9kZShtb2RlKSB7XG4gICAgY29uc3QgbmFtZUZpZWxkID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuYW1lRmllbGRcIik7XG4gICAgY29uc3Qgc3VibWl0QnRuID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2F1dGhGb3JtIGJ1dHRvblt0eXBlPVwic3VibWl0XCJdJyk7XG4gICAgY29uc3QgcGFzc3dvcmRJbnB1dCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicGFzc3dvcmRcIik7XG4gICAgY29uc3QgdGFicyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIudGFiXCIpO1xuXG4gICAgaWYgKG5hbWVGaWVsZCkge1xuICAgICAgbmFtZUZpZWxkLnN0eWxlLmRpc3BsYXkgPSBtb2RlID09PSBcInJlZ2lzdGVyXCIgPyBcImJsb2NrXCIgOiBcIm5vbmVcIjtcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmFtZVwiKS5yZXF1aXJlZCA9IG1vZGUgPT09IFwicmVnaXN0ZXJcIjtcbiAgICB9XG4gICAgdGFicy5mb3JFYWNoKCh0YWIpID0+XG4gICAgICB0YWIuY2xhc3NMaXN0LnRvZ2dsZShcImFjdGl2ZVwiLCB0YWIuZGF0YXNldC5tb2RlID09PSBtb2RlKVxuICAgICk7XG4gICAgaWYgKHN1Ym1pdEJ0bilcbiAgICAgIHN1Ym1pdEJ0bi50ZXh0Q29udGVudCA9IG1vZGUgPT09IFwibG9naW5cIiA/IFwiTG9naW5cIiA6IFwiUmVnaXN0ZXJcIjtcbiAgICBpZiAocGFzc3dvcmRJbnB1dClcbiAgICAgIHBhc3N3b3JkSW5wdXQuYXV0b2NvbXBsZXRlID1cbiAgICAgICAgbW9kZSA9PT0gXCJsb2dpblwiID8gXCJjdXJyZW50LXBhc3N3b3JkXCIgOiBcIm5ldy1wYXNzd29yZFwiO1xuXG4gICAgRG9tVXRpbHMuY2xlYXJNZXNzYWdlcygpO1xuICB9XG5cbiAgYXN5bmMgZnVuY3Rpb24gaGFuZGxlU3VibWl0KGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgRG9tVXRpbHMuY2xlYXJNZXNzYWdlcygpO1xuICAgIExvYWRlci50b2dnbGUodHJ1ZSk7XG5cbiAgICBjb25zdCBpc0xvZ2luID0gZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yKCdbZGF0YS1tb2RlPVwibG9naW5cIl0nKVxuICAgICAgLmNsYXNzTGlzdC5jb250YWlucyhcImFjdGl2ZVwiKTtcbiAgICBjb25zdCB1cmwgPSBpc0xvZ2luID8gXCIvYXBpL2xvZ2luXCIgOiBcIi9hcGkvcmVnaXN0ZXJcIjtcbiAgICBjb25zdCBmb3JtRGF0YSA9IHtcbiAgICAgIGVtYWlsOiBnZXRWYWwoXCJlbWFpbFwiKSxcbiAgICAgIHBhc3N3b3JkOiBnZXRWYWwoXCJwYXNzd29yZFwiKSxcbiAgICB9O1xuXG4gICAgaWYgKCFpc0xvZ2luKSBmb3JtRGF0YS5uYW1lID0gZ2V0VmFsKFwibmFtZVwiKTtcblxuICAgIHRyeSB7XG4gICAgICB2YWxpZGF0ZShmb3JtRGF0YSwgaXNMb2dpbik7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKHVybCwge1xuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgXCJDb250ZW50LVR5cGVcIjogXCJhcHBsaWNhdGlvbi9qc29uXCIsXG4gICAgICAgICAgQWNjZXB0OiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoZm9ybURhdGEpLFxuICAgICAgfSk7XG4gICAgICBhd2FpdCBoYW5kbGVSZXNwb25zZShyZXNwb25zZSwgaXNMb2dpbik7XG4gICAgfSBjYXRjaCAoZXJyKSB7XG4gICAgICBEb21VdGlscy5zaG93RXJyb3IoZXJyLm1lc3NhZ2UgfHwgXCJVbmV4cGVjdGVkIGVycm9yIGR1cmluZyBzdWJtaXNzaW9uLlwiKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgTG9hZGVyLnRvZ2dsZShmYWxzZSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZ2V0VmFsKGlkKSB7XG4gICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgcmV0dXJuIGVsID8gZWwudmFsdWUudHJpbSgpIDogXCJcIjtcbiAgfVxuXG4gIGZ1bmN0aW9uIHZhbGlkYXRlKGRhdGEsIGlzTG9naW4pIHtcbiAgICBjb25zdCBlcnJvcnMgPSBbXTtcbiAgICBjb25zdCBlbWFpbFJlZ2V4ID0gL15bXlxcc0BdK0BbXlxcc0BdK1xcLlteXFxzQF0rJC87XG5cbiAgICBpZiAoIWRhdGEuZW1haWwpIGVycm9ycy5wdXNoKFwiRW1haWwgaXMgcmVxdWlyZWQuXCIpO1xuICAgIGVsc2UgaWYgKCFlbWFpbFJlZ2V4LnRlc3QoZGF0YS5lbWFpbCkpIGVycm9ycy5wdXNoKFwiSW52YWxpZCBlbWFpbCBmb3JtYXQuXCIpO1xuICAgIGlmICghZGF0YS5wYXNzd29yZCkgZXJyb3JzLnB1c2goXCJQYXNzd29yZCBpcyByZXF1aXJlZC5cIik7XG4gICAgZWxzZSBpZiAoZGF0YS5wYXNzd29yZC5sZW5ndGggPCA4ICYmICFpc0xvZ2luKVxuICAgICAgZXJyb3JzLnB1c2goXCJQYXNzd29yZCBtdXN0IGJlIGF0IGxlYXN0IDggY2hhcmFjdGVycy5cIik7XG4gICAgaWYgKCFpc0xvZ2luICYmICghZGF0YS5uYW1lIHx8IGRhdGEubmFtZS5sZW5ndGggPCAyKSlcbiAgICAgIGVycm9ycy5wdXNoKFwiTmFtZSBtdXN0IGJlIGF0IGxlYXN0IDIgY2hhcmFjdGVycy5cIik7XG5cbiAgICBpZiAoZXJyb3JzLmxlbmd0aCkgdGhyb3cgbmV3IEVycm9yKGVycm9ycy5qb2luKFwiXFxuXCIpKTtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlc3BvbnNlLCBpc0xvZ2luKSB7XG4gICAgY29uc3QgaXNKc29uID0gcmVzcG9uc2UuaGVhZGVyc1xuICAgICAgLmdldChcImNvbnRlbnQtdHlwZVwiKVxuICAgICAgPy5pbmNsdWRlcyhcImFwcGxpY2F0aW9uL2pzb25cIik7XG4gICAgY29uc3QgZGF0YSA9IGlzSnNvblxuICAgICAgPyBhd2FpdCByZXNwb25zZS5qc29uKClcbiAgICAgIDogeyBtZXNzYWdlOiBhd2FpdCByZXNwb25zZS50ZXh0KCkgfTtcblxuICAgIGlmICghcmVzcG9uc2Uub2spXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoZGF0YS5lcnJvciB8fCBgRXJyb3I6ICR7cmVzcG9uc2Uuc3RhdHVzfWApO1xuXG4gICAgaWYgKGlzTG9naW4pIHtcbiAgICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwidXNlclwiLCBKU09OLnN0cmluZ2lmeShkYXRhLnVzZXIgfHwge30pKTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCIvYXBwXCI7XG4gICAgfSBlbHNlIHtcbiAgICAgIERvbVV0aWxzLnNob3dTdWNjZXNzKFxuICAgICAgICBkYXRhLm1lc3NhZ2UgfHwgXCJSZWdpc3RyYXRpb24gc3VjY2Vzc2Z1bC4gUGxlYXNlIGxvZ2luLlwiXG4gICAgICApO1xuICAgICAgc3dpdGNoTW9kZShcImxvZ2luXCIpO1xuICAgICAgW1wiZW1haWxcIiwgXCJwYXNzd29yZFwiLCBcIm5hbWVcIl0uZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgICAgY29uc3QgZWwgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChpZCk7XG4gICAgICAgIGlmIChlbCkgZWwudmFsdWUgPSBcIlwiO1xuICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gY2hlY2tSZWRpcmVjdFJlYXNvbigpIHtcbiAgICBjb25zdCByZWFzb24gPSBuZXcgVVJMU2VhcmNoUGFyYW1zKGxvY2F0aW9uLnNlYXJjaCkuZ2V0KFwicmVhc29uXCIpO1xuICAgIGNvbnN0IG1lc3NhZ2VzID0ge1xuICAgICAgdW5hdXRoZW50aWNhdGVkOiBcIlBsZWFzZSBsb2cgaW4gdG8gYWNjZXNzIHRoZSBhcHBsaWNhdGlvbi5cIixcbiAgICAgIGludmFsaWRfdG9rZW46IFwiU2Vzc2lvbiBleHBpcmVkLiBQbGVhc2UgbG9nIGluIGFnYWluLlwiLFxuICAgICAgYmFkX3Rva2VuX2NsYWltczogXCJTZXNzaW9uIGRhdGEgaXNzdWUuIFBsZWFzZSBsb2cgaW4gYWdhaW4uXCIsXG4gICAgfTtcbiAgICBpZiAocmVhc29uICYmIG1lc3NhZ2VzW3JlYXNvbl0pIERvbVV0aWxzLnNob3dFcnJvcihtZXNzYWdlc1tyZWFzb25dKTtcbiAgICBoaXN0b3J5LnJlcGxhY2VTdGF0ZShudWxsLCBcIlwiLCBsb2NhdGlvbi5wYXRobmFtZSk7XG4gIH1cblxuICByZXR1cm4geyBpbml0IH07XG59KSgpO1xuIiwiaW1wb3J0IHsgQ2F0ZWdvcnkgfSBmcm9tIFwiLi9jYXRlZ29yeS5qc1wiO1xuaW1wb3J0IHsgQXBpU2VydmljZSB9IGZyb20gXCIuL2FwaVNlcnZpY2UuanNcIjtcblxuZXhwb3J0IGNvbnN0IFRvZG8gPSAoKCkgPT4ge1xuICBsZXQgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcbiAgbGV0IGlzRWRpdGluZyA9IGZhbHNlO1xuICBsZXQgYWxsVGFza3MgPSBbXTsgLy8gU3RvcmUgYWxsIHRhc2tzIGZvciBmaWx0ZXJpbmdcblxuICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9hcHBcIikge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGZvcm0gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhc2stZm9ybVwiKTtcbiAgICAgIGNvbnN0IGZvcm1IZWFkaW5nID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJmb3JtLWhlYWRpbmdcIik7XG4gICAgICBjb25zdCBzdWJtaXRCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN1Ym1pdC1idXR0b25cIik7XG4gICAgICBjb25zdCBkZWxldGVCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImRlbGV0ZS1idXR0b25cIik7XG4gICAgICBjb25zdCBjYW5jZWxCdXR0b24gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbmNlbC1idXR0b25cIik7XG4gICAgICBjb25zdCBhZGRUYXNrQnV0dG9uID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG4tYWRkLXRhc2tcIik7XG4gICAgICBjb25zdCBhbGxEYXlDaGVja2JveCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYWxsRGF5XCIpO1xuICAgICAgY29uc3QgdGltZUlucHV0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidGltZUlucHV0c1wiKTtcbiAgICAgIGNvbnN0IGNvbnRlbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKFwiLmNvbnRlbnRcIik7XG4gICAgICBjb25zdCBjbG9zZVRhc2tGb3JtQnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjbG9zZS10YXNrLWZvcm1cIik7XG4gICAgICBjb25zdCBidG5DYWxlbmRhciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYnRuLWNhbGVuZGFyXCIpO1xuICAgICAgY29uc3QgYnRuVXBjb21pbmcgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi11cGNvbWluZ1wiKTtcbiAgICAgIGNvbnN0IGJ0blRvZGF5ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJidG4tdG9kYXlcIik7XG5cbiAgICAgIC8vIEhlbHBlciB0byBzaG93L2hpZGUgZm9ybSBhbmQgYmFja2Ryb3BcbiAgICAgIGZ1bmN0aW9uIHNob3dGb3JtKCkge1xuICAgICAgICBmb3JtLmNsYXNzTGlzdC5hZGQoXCJ2aXNpYmxlXCIpO1xuICAgICAgICBjb250ZW50LmNsYXNzTGlzdC5hZGQoXCJmb3JtLW9wZW5cIik7XG4gICAgICAgIGZvcm0uc3R5bGUuZGlzcGxheSA9IFwiYmxvY2tcIjtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgZm9ybS5mb2N1cyAmJiBmb3JtLmZvY3VzKCk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfVxuICAgICAgZnVuY3Rpb24gaGlkZUZvcm0oKSB7XG4gICAgICAgIGZvcm0uY2xhc3NMaXN0LnJlbW92ZShcInZpc2libGVcIik7XG4gICAgICAgIGNvbnRlbnQuY2xhc3NMaXN0LnJlbW92ZShcImZvcm0tb3BlblwiKTtcbiAgICAgICAgZm9ybS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgIGlmIChhZGRUYXNrQnV0dG9uKSBhZGRUYXNrQnV0dG9uLnN0eWxlLmRpc3BsYXkgPSBcImJsb2NrXCI7XG4gICAgICB9XG5cbiAgICAgIC8vIFRvZ2dsZSB0aW1lIGlucHV0cyBiYXNlZCBvbiBBbGwgRGF5IGNoZWNrYm94XG4gICAgICBhbGxEYXlDaGVja2JveC5hZGRFdmVudExpc3RlbmVyKFwiY2hhbmdlXCIsICgpID0+IHtcbiAgICAgICAgY29uc3QgaXNBbGxEYXkgPSBhbGxEYXlDaGVja2JveC5jaGVja2VkO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0VGltZVwiKS5kaXNhYmxlZCA9IGlzQWxsRGF5O1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuZFRpbWVcIikuZGlzYWJsZWQgPSBpc0FsbERheTtcbiAgICAgICAgaWYgKGlzQWxsRGF5KSB7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJzdGFydFRpbWVcIikudmFsdWUgPSBcIlwiO1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZW5kVGltZVwiKS52YWx1ZSA9IFwiXCI7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBDYWxlbmRhciBpbml0aWFsaXphdGlvblxuICAgICAgY29uc3QgY2FsZW5kYXJFbCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FsZW5kYXJcIik7XG4gICAgICBjb25zdCBjYWxlbmRhciA9IG5ldyBGdWxsQ2FsZW5kYXIuQ2FsZW5kYXIoY2FsZW5kYXJFbCwge1xuICAgICAgICBpbml0aWFsVmlldzogXCJsaXN0V2Vla1wiLCAvLyBTZXQgaW5pdGlhbCB2aWV3IHRvIFVwY29taW5nXG4gICAgICAgIGhlYWRlclRvb2xiYXI6IHtcbiAgICAgICAgICBsZWZ0OiBcInByZXYsbmV4dCB0b2RheVwiLFxuICAgICAgICAgIGNlbnRlcjogXCJ0aXRsZVwiLFxuICAgICAgICAgIC8vIHJpZ2h0OiBcImRheUdyaWRNb250aCx0aW1lR3JpZFdlZWssdGltZUdyaWREYXlcIixcbiAgICAgICAgfSxcbiAgICAgICAgZWRpdGFibGU6IHRydWUsXG4gICAgICAgIHNlbGVjdGFibGU6IGZhbHNlLFxuICAgICAgICBzZWxlY3RNaXJyb3I6IHRydWUsXG4gICAgICAgIGRheU1heEV2ZW50czogdHJ1ZSxcbiAgICAgICAgZXZlbnRzOiBbXSxcbiAgICAgICAgZXZlbnRDbGljazogZnVuY3Rpb24gKGluZm8pIHtcbiAgICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBpbmZvLmV2ZW50O1xuICAgICAgICAgIGlzRWRpdGluZyA9IHRydWU7XG4gICAgICAgICAgcG9wdWxhdGVGb3JtKGluZm8uZXZlbnQpO1xuICAgICAgICAgIHVwZGF0ZUZvcm1VSSgpO1xuICAgICAgICAgIHNob3dGb3JtKCk7XG4gICAgICAgIH0sXG4gICAgICAgIGV2ZW50RGlkTW91bnQ6IGZ1bmN0aW9uIChpbmZvKSB7XG4gICAgICAgICAgY29uc3QgaXNDb21wbGV0ZWQgPSBpbmZvLmV2ZW50LmV4dGVuZGVkUHJvcHMuY29tcGxldGVkO1xuICAgICAgICAgIGlmIChpc0NvbXBsZXRlZCkge1xuICAgICAgICAgICAgaW5mby5lbC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcIiNkM2QzZDNcIjtcbiAgICAgICAgICAgIGluZm8uZWwuc3R5bGUudGV4dERlY29yYXRpb24gPSBcImxpbmUtdGhyb3VnaFwiO1xuICAgICAgICAgICAgaW5mby5lbC5zdHlsZS5vcGFjaXR5ID0gXCIwLjdcIjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBBcHBseSBjYXRlZ29yeSBjb2xvclxuICAgICAgICAgIGNvbnN0IGNhdGVnb3J5ID0gaW5mby5ldmVudC5leHRlbmRlZFByb3BzLmNhdGVnb3J5O1xuICAgICAgICAgIGlmIChjYXRlZ29yeSAmJiBjYXRlZ29yeSAhPT0gXCJOb25lXCIpIHtcbiAgICAgICAgICAgIGNvbnN0IGNhdCA9IENhdGVnb3J5LmdldENhdGVnb3JpZXMoKS5maW5kKFxuICAgICAgICAgICAgICAoYykgPT4gYy5uYW1lID09PSBjYXRlZ29yeVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGlmIChjYXQpIHtcbiAgICAgICAgICAgICAgaW5mby5lbC5zdHlsZS5ib3JkZXJMZWZ0ID0gYDRweCBzb2xpZCAke2NhdC5jb2xvcn1gO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpbmZvLmVsLnN0eWxlLmJvcmRlckxlZnQgPSBcIjRweCBzb2xpZCB0cmFuc3BhcmVudFwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZXZlbnREcm9wOiBhc3luYyBmdW5jdGlvbiAoaW5mbykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBldmVudCA9IGluZm8uZXZlbnQ7XG4gICAgICAgICAgICBsZXQgc3RhcnQgPSBldmVudC5zdGFydFN0cjtcbiAgICAgICAgICAgIGxldCBlbmQgPSBldmVudC5lbmRTdHI7XG5cbiAgICAgICAgICAgIC8vIEZpeCBmb3IgYWxsRGF5IGV2ZW50czogRnVsbENhbGVuZGFyIHVzZXMgZXhjbHVzaXZlIGVuZCBkYXRlXG4gICAgICAgICAgICBpZiAoZXZlbnQuYWxsRGF5KSB7XG4gICAgICAgICAgICAgIC8vIElmIGVuZCBpcyBwcmVzZW50LCBzdWJ0cmFjdCBvbmUgZGF5IHRvIGdldCB0aGUgaW5jbHVzaXZlIGVuZFxuICAgICAgICAgICAgICBpZiAoZXZlbnQuZW5kKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZW5kRGF0ZSA9IG5ldyBEYXRlKGV2ZW50LmVuZCk7XG4gICAgICAgICAgICAgICAgZW5kRGF0ZS5zZXREYXRlKGVuZERhdGUuZ2V0RGF0ZSgpIC0gMSk7XG4gICAgICAgICAgICAgICAgLy8gRm9ybWF0IGFzIHl5eXktbW0tZGRcbiAgICAgICAgICAgICAgICBlbmQgPSBlbmREYXRlLnRvSVNPU3RyaW5nKCkuc2xpY2UoMCwgMTApO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGVuZCA9IHN0YXJ0O1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAvLyBGb3IgdGltZWQgZXZlbnRzLCB1c2UgZW5kIGFzIGlzLCBvciBzZXQgdG8gc3RhcnQgaWYgbm90IHByZXNlbnRcbiAgICAgICAgICAgICAgZW5kID0gZXZlbnQuZW5kU3RyIHx8IHN0YXJ0O1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCB1cGRhdGVkRGF0YSA9IHtcbiAgICAgICAgICAgICAgaWQ6IGV2ZW50LmlkLFxuICAgICAgICAgICAgICB0aXRsZTogZXZlbnQudGl0bGUsXG4gICAgICAgICAgICAgIHN0YXJ0OiBzdGFydCxcbiAgICAgICAgICAgICAgZW5kOiBlbmQsXG4gICAgICAgICAgICAgIGFsbERheTogZXZlbnQuYWxsRGF5LFxuICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogZXZlbnQuZXh0ZW5kZWRQcm9wcy5kZXNjcmlwdGlvbixcbiAgICAgICAgICAgICAgY2F0ZWdvcnk6IGV2ZW50LmV4dGVuZGVkUHJvcHMuY2F0ZWdvcnksXG4gICAgICAgICAgICAgIGNvbXBsZXRlZDogZXZlbnQuZXh0ZW5kZWRQcm9wcy5jb21wbGV0ZWQsXG4gICAgICAgICAgICAgIGNsYXNzTmFtZTogZXZlbnQuY2xhc3NOYW1lc1xuICAgICAgICAgICAgICAgIC5maWx0ZXIoXG4gICAgICAgICAgICAgICAgICAoYykgPT5cbiAgICAgICAgICAgICAgICAgICAgYyAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgICAgICAgICAgIGMgIT09IG51bGwgJiZcbiAgICAgICAgICAgICAgICAgICAgYy5zdGFydHNXaXRoKFwicHJpb3JpdHktXCIpID09PSBmYWxzZVxuICAgICAgICAgICAgICAgIClcbiAgICAgICAgICAgICAgICAuam9pbihcIiBcIiksXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgY29uc3QgdXBkYXRlZFRhc2sgPSBhd2FpdCBBcGlTZXJ2aWNlLnVwZGF0ZVRhc2soXG4gICAgICAgICAgICAgIGV2ZW50LmlkLFxuICAgICAgICAgICAgICB1cGRhdGVkRGF0YVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIGFsbFRhc2tzID0gYWxsVGFza3MubWFwKCh0KSA9PlxuICAgICAgICAgICAgICB0LmlkID09PSBldmVudC5pZCA/IHVwZGF0ZWRUYXNrIDogdFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgICAgaW5mby5yZXZlcnQoKTtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gdXBkYXRlIGV2ZW50IGFmdGVyIGRyYWc6XCIsIGVycm9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICB9KTtcblxuICAgICAgLy8gRmV0Y2ggdGFza3MgZnJvbSBBUEkgYW5kIHJlbmRlciBjYWxlbmRhclxuICAgICAgYXN5bmMgZnVuY3Rpb24gaW5pdGlhbGl6ZUNhbGVuZGFyKCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGNvbnN0IHRhc2tzID0gYXdhaXQgQXBpU2VydmljZS5mZXRjaFRhc2tzKCk7XG4gICAgICAgICAgYWxsVGFza3MgPSB0YXNrczsgLy8gU2F2ZSBhbGwgdGFza3MgZm9yIGZpbHRlcmluZ1xuICAgICAgICAgIHRhc2tzLmZvckVhY2goKHRhc2spID0+IGNhbGVuZGFyLmFkZEV2ZW50KHRhc2spKTtcbiAgICAgICAgICBjYWxlbmRhci5yZW5kZXIoKTtcbiAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRmFpbGVkIHRvIGZldGNoIHRhc2tzOlwiLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaW5pdGlhbGl6ZUNhbGVuZGFyKCk7XG5cbiAgICAgIC8vIFNpZGViYXIgYnV0dG9uIGV2ZW50IGxpc3RlbmVyc1xuICAgICAgZnVuY3Rpb24gc2V0QWN0aXZlU2lkZWJhckJ1dHRvbihhY3RpdmVCdG4pIHtcbiAgICAgICAgZG9jdW1lbnRcbiAgICAgICAgICAucXVlcnlTZWxlY3RvckFsbChcIi5zaWRlYmFyLWJ0biwgLmNhdGVnb3J5LWl0ZW1cIilcbiAgICAgICAgICAuZm9yRWFjaCgoYnRuKSA9PiB7XG4gICAgICAgICAgICBidG4uY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgaWYgKGFjdGl2ZUJ0bikgYWN0aXZlQnRuLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XG4gICAgICB9XG5cbiAgICAgIC8vIEhpZ2hsaWdodCBVcGNvbWluZyBidXR0b24gb24gbG9hZFxuICAgICAgc2V0QWN0aXZlU2lkZWJhckJ1dHRvbihidG5VcGNvbWluZyk7XG5cbiAgICAgIGlmIChidG5DYWxlbmRhcikge1xuICAgICAgICBidG5DYWxlbmRhci5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKCkgPT4ge1xuICAgICAgICAgIGNhbGVuZGFyLmNoYW5nZVZpZXcoXCJkYXlHcmlkTW9udGhcIik7XG4gICAgICAgICAgc2V0QWN0aXZlU2lkZWJhckJ1dHRvbihidG5DYWxlbmRhcik7XG4gICAgICAgICAgdXBkYXRlQ2FsZW5kYXJIZWFkZXJCdXR0b25zKFwiZGF5R3JpZE1vbnRoXCIpO1xuICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwidmlld0NoYW5nZVwiLCB7IGRldGFpbDogeyB2aWV3OiBcImNhbGVuZGFyXCIgfSB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGJ0blVwY29taW5nKSB7XG4gICAgICAgIGJ0blVwY29taW5nLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgY2FsZW5kYXIuY2hhbmdlVmlldyhcImxpc3RXZWVrXCIpO1xuICAgICAgICAgIHNldEFjdGl2ZVNpZGViYXJCdXR0b24oYnRuVXBjb21pbmcpO1xuICAgICAgICAgIHVwZGF0ZUNhbGVuZGFySGVhZGVyQnV0dG9ucyhcImxpc3RXZWVrXCIpO1xuICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwidmlld0NoYW5nZVwiLCB7IGRldGFpbDogeyB2aWV3OiBcInVwY29taW5nXCIgfSB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgaWYgKGJ0blRvZGF5KSB7XG4gICAgICAgIGJ0blRvZGF5LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgY2FsZW5kYXIuY2hhbmdlVmlldyhcInRpbWVHcmlkRGF5XCIsIG5ldyBEYXRlKCkpO1xuICAgICAgICAgIHNldEFjdGl2ZVNpZGViYXJCdXR0b24oYnRuVG9kYXkpO1xuICAgICAgICAgIHVwZGF0ZUNhbGVuZGFySGVhZGVyQnV0dG9ucyhcInRpbWVHcmlkRGF5XCIpO1xuICAgICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwidmlld0NoYW5nZVwiLCB7IGRldGFpbDogeyB2aWV3OiBcInRvZGF5XCIgfSB9KVxuICAgICAgICAgICk7XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBMaXN0ZW4gZm9yIGNhdGVnb3J5IGZpbHRlciBldmVudFxuICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoXCJjYXRlZ29yeUZpbHRlclwiLCAoZSkgPT4ge1xuICAgICAgICBjb25zdCBjYXRlZ29yeSA9IGUuZGV0YWlsLmNhdGVnb3J5O1xuICAgICAgICBjYWxlbmRhci5yZW1vdmVBbGxFdmVudHMoKTtcbiAgICAgICAgaWYgKGNhdGVnb3J5KSB7XG4gICAgICAgICAgY2FsZW5kYXIuY2hhbmdlVmlldyhcImxpc3RZZWFyXCIpO1xuICAgICAgICAgIGNvbnN0IGZpbHRlcmVkID0gYWxsVGFza3MuZmlsdGVyKFxuICAgICAgICAgICAgKHRhc2spID0+ICh0YXNrLmNhdGVnb3J5IHx8IFwiTm9uZVwiKSA9PT0gY2F0ZWdvcnlcbiAgICAgICAgICApO1xuICAgICAgICAgIGZpbHRlcmVkLmZvckVhY2goKHRhc2spID0+IGNhbGVuZGFyLmFkZEV2ZW50KHRhc2spKTtcbiAgICAgICAgICAvLyBSZW1vdmUgLmFjdGl2ZSBmcm9tIGFsbCBzaWRlYmFyLWJ0biBhbmQgY2F0ZWdvcnktaXRlbSwgdGhlbiBoaWdobGlnaHQgdGhlIGNhdGVnb3J5XG4gICAgICAgICAgZG9jdW1lbnRcbiAgICAgICAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNpZGViYXItYnRuLCAuY2F0ZWdvcnktaXRlbVwiKVxuICAgICAgICAgICAgLmZvckVhY2goKGJ0bikgPT4ge1xuICAgICAgICAgICAgICBidG4uY2xhc3NMaXN0LnJlbW92ZShcImFjdGl2ZVwiKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIC8vIEhpZ2hsaWdodCB0aGUgY29ycmVjdCBjYXRlZ29yeSBpdGVtXG4gICAgICAgICAgY29uc3QgY2F0QnRuID0gQXJyYXkuZnJvbShcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuY2F0ZWdvcnktaXRlbVwiKVxuICAgICAgICAgICkuZmluZCgobGkpID0+IGxpLnRleHRDb250ZW50LmluY2x1ZGVzKGNhdGVnb3J5KSk7XG4gICAgICAgICAgaWYgKGNhdEJ0bikgY2F0QnRuLmNsYXNzTGlzdC5hZGQoXCJhY3RpdmVcIik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2FsZW5kYXIuY2hhbmdlVmlldyhcImRheUdyaWRNb250aFwiKTtcbiAgICAgICAgICBhbGxUYXNrcy5mb3JFYWNoKCh0YXNrKSA9PiBjYWxlbmRhci5hZGRFdmVudCh0YXNrKSk7XG4gICAgICAgICAgc2V0QWN0aXZlU2lkZWJhckJ1dHRvbihidG5DYWxlbmRhcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICAvLyBFdmVudCBMaXN0ZW5lcnNcbiAgICAgIGlmIChhZGRUYXNrQnV0dG9uKSB7XG4gICAgICAgIGFkZFRhc2tCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICBpc0VkaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xuICAgICAgICAgIGZvcm0ucmVzZXQoKTtcbiAgICAgICAgICBhbGxEYXlDaGVja2JveC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgdGltZUlucHV0cy5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG4gICAgICAgICAgdXBkYXRlRm9ybVVJKCk7XG4gICAgICAgICAgc2hvd0Zvcm0oKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGZvcm0uYWRkRXZlbnRMaXN0ZW5lcihcInN1Ym1pdFwiLCBhc3luYyBmdW5jdGlvbiAoZSkge1xuICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIGNvbnN0IGZvcm1EYXRhID0gZ2V0Rm9ybURhdGEoKTtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmIChpc0VkaXRpbmcpIHtcbiAgICAgICAgICAgIGF3YWl0IHVwZGF0ZVRhc2soZm9ybURhdGEpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBhd2FpdCBjcmVhdGVUYXNrKGZvcm1EYXRhKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgZm9ybS5yZXNldCgpO1xuICAgICAgICAgIGFsbERheUNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICB0aW1lSW5wdXRzLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgICB1cGRhdGVGb3JtVUkoKTtcbiAgICAgICAgICBoaWRlRm9ybSgpO1xuICAgICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gc2F2ZSB0YXNrOlwiLCBlcnJvcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBkZWxldGVCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGFzeW5jICgpID0+IHtcbiAgICAgICAgaWYgKGN1cnJlbnRFZGl0aW5nVGFzaykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBhd2FpdCBkZWxldGVUYXNrKGN1cnJlbnRFZGl0aW5nVGFzay5pZCk7XG4gICAgICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sucmVtb3ZlKCk7XG4gICAgICAgICAgICBmb3JtLnJlc2V0KCk7XG4gICAgICAgICAgICBpc0VkaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIGN1cnJlbnRFZGl0aW5nVGFzayA9IG51bGw7XG4gICAgICAgICAgICB1cGRhdGVGb3JtVUkoKTtcbiAgICAgICAgICAgIGhpZGVGb3JtKCk7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gZGVsZXRlIHRhc2s6XCIsIGVycm9yKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICBjYW5jZWxCdXR0b24uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgZm9ybS5yZXNldCgpO1xuICAgICAgICBpc0VkaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcbiAgICAgICAgYWxsRGF5Q2hlY2tib3guY2hlY2tlZCA9IGZhbHNlO1xuICAgICAgICB0aW1lSW5wdXRzLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgdXBkYXRlRm9ybVVJKCk7XG4gICAgICAgIGhpZGVGb3JtKCk7XG4gICAgICB9KTtcblxuICAgICAgLy8gQWRkIGNsb3NlIChjcm9zcykgYnV0dG9uIGhhbmRsZXJcbiAgICAgIGlmIChjbG9zZVRhc2tGb3JtQnRuKSB7XG4gICAgICAgIGNsb3NlVGFza0Zvcm1CdG4uYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsICgpID0+IHtcbiAgICAgICAgICBmb3JtLnJlc2V0KCk7XG4gICAgICAgICAgaXNFZGl0aW5nID0gZmFsc2U7XG4gICAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrID0gbnVsbDtcbiAgICAgICAgICBhbGxEYXlDaGVja2JveC5jaGVja2VkID0gZmFsc2U7XG4gICAgICAgICAgdGltZUlucHV0cy5zdHlsZS5kaXNwbGF5ID0gXCJmbGV4XCI7XG4gICAgICAgICAgdXBkYXRlRm9ybVVJKCk7XG4gICAgICAgICAgaGlkZUZvcm0oKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIC8vIEhpZGUgZm9ybSBvbiBjbGljayBvdXRzaWRlXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwibW91c2Vkb3duXCIsIChlKSA9PiB7XG4gICAgICAgIGlmIChcbiAgICAgICAgICBmb3JtLmNsYXNzTGlzdC5jb250YWlucyhcInZpc2libGVcIikgJiZcbiAgICAgICAgICAhZm9ybS5jb250YWlucyhlLnRhcmdldCkgJiZcbiAgICAgICAgICAhKGFkZFRhc2tCdXR0b24gJiYgYWRkVGFza0J1dHRvbi5jb250YWlucyhlLnRhcmdldCkpXG4gICAgICAgICkge1xuICAgICAgICAgIGZvcm0ucmVzZXQoKTtcbiAgICAgICAgICBpc0VkaXRpbmcgPSBmYWxzZTtcbiAgICAgICAgICBjdXJyZW50RWRpdGluZ1Rhc2sgPSBudWxsO1xuICAgICAgICAgIGFsbERheUNoZWNrYm94LmNoZWNrZWQgPSBmYWxzZTtcbiAgICAgICAgICB0aW1lSW5wdXRzLnN0eWxlLmRpc3BsYXkgPSBcImZsZXhcIjtcbiAgICAgICAgICB1cGRhdGVGb3JtVUkoKTtcbiAgICAgICAgICBoaWRlRm9ybSgpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gSGlkZSBmb3JtIGluaXRpYWxseVxuICAgICAgaGlkZUZvcm0oKTtcblxuICAgICAgLy8gSGVscGVyIGZ1bmN0aW9uc1xuICAgICAgZnVuY3Rpb24gdXBkYXRlRm9ybVVJKCkge1xuICAgICAgICBpZiAoaXNFZGl0aW5nKSB7XG4gICAgICAgICAgZm9ybUhlYWRpbmcudGV4dENvbnRlbnQgPSBcIkVkaXQgVGFza1wiO1xuICAgICAgICAgIHN1Ym1pdEJ1dHRvbi50ZXh0Q29udGVudCA9IFwiU2F2ZSBDaGFuZ2VzXCI7XG4gICAgICAgICAgZGVsZXRlQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XG4gICAgICAgICAgY2FuY2VsQnV0dG9uLmNsYXNzTGlzdC5yZW1vdmUoXCJoaWRkZW5cIik7XG4gICAgICAgICAgaWYgKGFkZFRhc2tCdXR0b24pIGFkZFRhc2tCdXR0b24uZGlzYWJsZWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGZvcm1IZWFkaW5nLnRleHRDb250ZW50ID0gXCJBZGQgTmV3IFRhc2tcIjtcbiAgICAgICAgICBzdWJtaXRCdXR0b24udGV4dENvbnRlbnQgPSBcIkFkZCBUYXNrXCI7XG4gICAgICAgICAgZGVsZXRlQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgY2FuY2VsQnV0dG9uLmNsYXNzTGlzdC5hZGQoXCJoaWRkZW5cIik7XG4gICAgICAgICAgaWYgKGFkZFRhc2tCdXR0b24pIGFkZFRhc2tCdXR0b24uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBwb3B1bGF0ZUZvcm0oZXZlbnQpIHtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXRsZVwiKS52YWx1ZSA9IGV2ZW50LnRpdGxlO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInRhc2tEYXRlXCIpLnZhbHVlID0gZXZlbnQuc3RhcnRTdHIuc3Vic3RyaW5nKFxuICAgICAgICAgIDAsXG4gICAgICAgICAgMTBcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgYWxsRGF5ID0gZXZlbnQuYWxsRGF5O1xuICAgICAgICBhbGxEYXlDaGVja2JveC5jaGVja2VkID0gYWxsRGF5O1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcInN0YXJ0VGltZVwiKS5kaXNhYmxlZCA9IGFsbERheTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLmRpc2FibGVkID0gYWxsRGF5O1xuXG4gICAgICAgIGlmICghYWxsRGF5KSB7XG4gICAgICAgICAgY29uc3Qgc3RhcnREYXRlID0gbmV3IERhdGUoZXZlbnQuc3RhcnQpO1xuICAgICAgICAgIGNvbnN0IGVuZERhdGUgPSBuZXcgRGF0ZShldmVudC5lbmQgfHwgZXZlbnQuc3RhcnQpO1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLnZhbHVlID0gc3RhcnREYXRlXG4gICAgICAgICAgICAudG9UaW1lU3RyaW5nKClcbiAgICAgICAgICAgIC5zdWJzdHJpbmcoMCwgNSk7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJlbmRUaW1lXCIpLnZhbHVlID0gZW5kRGF0ZVxuICAgICAgICAgICAgLnRvVGltZVN0cmluZygpXG4gICAgICAgICAgICAuc3Vic3RyaW5nKDAsIDUpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLnZhbHVlID0gXCJcIjtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuZFRpbWVcIikudmFsdWUgPSBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJkZXNjcmlwdGlvblwiKS52YWx1ZSA9XG4gICAgICAgICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5kZXNjcmlwdGlvbiB8fCBcIlwiO1xuICAgICAgICAvLyBSZW1vdmUgcHJpb3JpdHlcbiAgICAgICAgLy8gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwcmlvcml0eVwiKS52YWx1ZSA9XG4gICAgICAgIC8vICAgZXZlbnQuZXh0ZW5kZWRQcm9wcy5wcmlvcml0eSB8fCBcImxvd1wiO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3J5XCIpLnZhbHVlID1cbiAgICAgICAgICBldmVudC5leHRlbmRlZFByb3BzLmNhdGVnb3J5IHx8IFwiTm9uZVwiO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbXBsZXRlZFwiKS5jaGVja2VkID1cbiAgICAgICAgICBldmVudC5leHRlbmRlZFByb3BzLmNvbXBsZXRlZCB8fCBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gZ2V0Rm9ybURhdGEoKSB7XG4gICAgICAgIGNvbnN0IGNhdGVnb3J5VmFsdWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhdGVnb3J5XCIpLnZhbHVlO1xuICAgICAgICBjb25zdCBhbGxEYXkgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFsbERheVwiKS5jaGVja2VkO1xuICAgICAgICBjb25zdCBkYXRlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0YXNrRGF0ZVwiKS52YWx1ZTtcbiAgICAgICAgbGV0IHN0YXJ0LCBlbmQ7XG5cbiAgICAgICAgaWYgKGFsbERheSkge1xuICAgICAgICAgIHN0YXJ0ID0gZGF0ZTtcbiAgICAgICAgICBlbmQgPSBkYXRlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnN0IHN0YXJ0VGltZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwic3RhcnRUaW1lXCIpLnZhbHVlO1xuICAgICAgICAgIGNvbnN0IGVuZFRpbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImVuZFRpbWVcIikudmFsdWU7XG4gICAgICAgICAgc3RhcnQgPSBzdGFydFRpbWUgPyBgJHtkYXRlfVQke3N0YXJ0VGltZX1gIDogZGF0ZTtcbiAgICAgICAgICBlbmQgPSBlbmRUaW1lID8gYCR7ZGF0ZX1UJHtlbmRUaW1lfWAgOiBzdGFydDtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgaWQ6IGlzRWRpdGluZyA/IGN1cnJlbnRFZGl0aW5nVGFzay5pZCA6IHVuZGVmaW5lZCxcbiAgICAgICAgICB0aXRsZTogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJ0aXRsZVwiKS52YWx1ZSxcbiAgICAgICAgICBzdGFydDogc3RhcnQsXG4gICAgICAgICAgZW5kOiBlbmQsXG4gICAgICAgICAgYWxsRGF5OiBhbGxEYXksXG4gICAgICAgICAgZGVzY3JpcHRpb246IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiZGVzY3JpcHRpb25cIikudmFsdWUsXG4gICAgICAgICAgLy8gUmVtb3ZlIHByaW9yaXR5XG4gICAgICAgICAgLy8gcHJpb3JpdHk6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicHJpb3JpdHlcIikudmFsdWUsXG4gICAgICAgICAgY2F0ZWdvcnk6IGNhdGVnb3J5VmFsdWUgPT09IFwiTm9uZVwiID8gbnVsbCA6IGNhdGVnb3J5VmFsdWUsXG4gICAgICAgICAgY29tcGxldGVkOiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbXBsZXRlZFwiKS5jaGVja2VkLFxuICAgICAgICAgIC8vIFJlbW92ZSBwcmlvcml0eSBmcm9tIGNsYXNzTmFtZVxuICAgICAgICAgIGNsYXNzTmFtZTogYCR7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNvbXBsZXRlZFwiKS5jaGVja2VkID8gXCJjb21wbGV0ZWQtdGFza1wiIDogXCJcIlxuICAgICAgICAgIH1gLFxuICAgICAgICB9O1xuICAgICAgfVxuXG4gICAgICBhc3luYyBmdW5jdGlvbiBjcmVhdGVUYXNrKGRhdGEpIHtcbiAgICAgICAgY29uc3QgbmV3VGFzayA9IGF3YWl0IEFwaVNlcnZpY2UuY3JlYXRlVGFzayhkYXRhKTtcbiAgICAgICAgYWxsVGFza3MucHVzaChuZXdUYXNrKTtcbiAgICAgICAgY2FsZW5kYXIuYWRkRXZlbnQobmV3VGFzayk7XG4gICAgICAgIHJldHVybiBuZXdUYXNrO1xuICAgICAgfVxuXG4gICAgICBhc3luYyBmdW5jdGlvbiB1cGRhdGVUYXNrKGRhdGEpIHtcbiAgICAgICAgY29uc3QgdXBkYXRlZFRhc2sgPSBhd2FpdCBBcGlTZXJ2aWNlLnVwZGF0ZVRhc2soZGF0YS5pZCwgZGF0YSk7XG4gICAgICAgIC8vIFJlbW92ZSBvbGQgdGFzayBmcm9tIGFsbFRhc2tzIGFuZCBhZGQgdXBkYXRlZCBvbmVcbiAgICAgICAgYWxsVGFza3MgPSBhbGxUYXNrcy5maWx0ZXIoKHQpID0+IHQuaWQgIT09IGRhdGEuaWQpO1xuICAgICAgICBhbGxUYXNrcy5wdXNoKHVwZGF0ZWRUYXNrKTtcbiAgICAgICAgY3VycmVudEVkaXRpbmdUYXNrLnJlbW92ZSgpO1xuICAgICAgICBjYWxlbmRhci5hZGRFdmVudCh1cGRhdGVkVGFzayk7XG4gICAgICAgIHJldHVybiB1cGRhdGVkVGFzaztcbiAgICAgIH1cblxuICAgICAgYXN5bmMgZnVuY3Rpb24gZGVsZXRlVGFzayhpZCkge1xuICAgICAgICBhd2FpdCBBcGlTZXJ2aWNlLmRlbGV0ZVRhc2soaWQpO1xuICAgICAgICBhbGxUYXNrcyA9IGFsbFRhc2tzLmZpbHRlcigodCkgPT4gdC5pZCAhPT0gaWQpO1xuICAgICAgfVxuXG4gICAgICAvLyBBZnRlciBjYWxlbmRhciBpbml0aWFsaXphdGlvblxuICAgICAgZnVuY3Rpb24gdXBkYXRlQ2FsZW5kYXJIZWFkZXJCdXR0b25zKHZpZXdUeXBlKSB7XG4gICAgICAgIGNvbnN0IGZjSGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcIi5mYy1oZWFkZXItdG9vbGJhclwiKTtcbiAgICAgICAgaWYgKCFmY0hlYWRlcikgcmV0dXJuO1xuICAgICAgICBjb25zdCBwcmV2QnRuID0gZmNIZWFkZXIucXVlcnlTZWxlY3RvcihcIi5mYy1wcmV2LWJ1dHRvblwiKTtcbiAgICAgICAgY29uc3QgbmV4dEJ0biA9IGZjSGVhZGVyLnF1ZXJ5U2VsZWN0b3IoXCIuZmMtbmV4dC1idXR0b25cIik7XG4gICAgICAgIGNvbnN0IHRvZGF5QnRuID0gZmNIZWFkZXIucXVlcnlTZWxlY3RvcihcIi5mYy10b2RheS1idXR0b25cIik7XG4gICAgICAgIC8vIEhpZGUgcmlnaHQtc2lkZSB2aWV3IHN3aXRjaGVycyBpZiBwcmVzZW50XG4gICAgICAgIGNvbnN0IHJpZ2h0QnRucyA9IGZjSGVhZGVyLnF1ZXJ5U2VsZWN0b3JBbGwoXG4gICAgICAgICAgXCIuZmMtdG9vbGJhci1jaHVuazpsYXN0LWNoaWxkIC5mYy1idXR0b25cIlxuICAgICAgICApO1xuICAgICAgICBpZiAodmlld1R5cGUgPT09IFwibGlzdFdlZWtcIiB8fCB2aWV3VHlwZSA9PT0gXCJ0aW1lR3JpZERheVwiKSB7XG4gICAgICAgICAgaWYgKHByZXZCdG4pIHByZXZCdG4uc3R5bGUuZGlzcGxheSA9IFwibm9uZVwiO1xuICAgICAgICAgIGlmIChuZXh0QnRuKSBuZXh0QnRuLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICBpZiAodG9kYXlCdG4pIHRvZGF5QnRuLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIjtcbiAgICAgICAgICByaWdodEJ0bnMuZm9yRWFjaCgoYnRuKSA9PiAoYnRuLnN0eWxlLmRpc3BsYXkgPSBcIm5vbmVcIikpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChwcmV2QnRuKSBwcmV2QnRuLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgICAgICAgIGlmIChuZXh0QnRuKSBuZXh0QnRuLnN0eWxlLmRpc3BsYXkgPSBcIlwiO1xuICAgICAgICAgIGlmICh0b2RheUJ0bikgdG9kYXlCdG4uc3R5bGUuZGlzcGxheSA9IFwiXCI7XG4gICAgICAgICAgcmlnaHRCdG5zLmZvckVhY2goKGJ0bikgPT4gKGJ0bi5zdHlsZS5kaXNwbGF5ID0gXCJcIikpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGNhbGVuZGFyLm9uKFwidmlld0RpZE1vdW50XCIsIGZ1bmN0aW9uIChhcmcpIHtcbiAgICAgICAgdXBkYXRlQ2FsZW5kYXJIZWFkZXJCdXR0b25zKGFyZy52aWV3LnR5cGUpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHt9O1xufSkoKTtcbiIsImltcG9ydCB7IEFwaVNlcnZpY2UgfSBmcm9tIFwiLi9hcGlTZXJ2aWNlLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBDYXRlZ29yeSA9ICgoKSA9PiB7XG4gIGxldCBjYXRlZ29yaWVzID0gW107XG4gIGxldCBhY3RpdmVDYXRlZ29yeSA9IG51bGw7IC8vIFRyYWNrIHRoZSBjdXJyZW50bHkgc2VsZWN0ZWQgY2F0ZWdvcnlcblxuICAvLyBIZWxwZXIgZnVuY3Rpb25zIGRlZmluZWQgb3V0c2lkZSBET01Db250ZW50TG9hZGVkXG4gIGZ1bmN0aW9uIHJlbmRlckNhdGVnb3JpZXMoKSB7XG4gICAgY29uc3QgY2F0ZWdvcmllc0NvbnRhaW5lciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2F0ZWdvcmllcy1jb250YWluZXJcIik7XG5cbiAgICBjYXRlZ29yaWVzQ29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XG5cbiAgICBjYXRlZ29yaWVzLmZvckVhY2goKGNhdGVnb3J5LCBpbmRleCkgPT4ge1xuICAgICAgLy8gRW5zdXJlIGNhdGVnb3J5LmlkIGlzIGEgc3RyaW5nIGZvciBjb25zaXN0ZW5jeVxuICAgICAgY29uc3QgbGkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7XG4gICAgICBsaS5jbGFzc05hbWUgPSBcImNhdGVnb3J5LWl0ZW1cIjtcbiAgICAgIGlmIChhY3RpdmVDYXRlZ29yeSA9PT0gY2F0ZWdvcnkubmFtZSkge1xuICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xuICAgICAgfVxuICAgICAgbGkuaW5uZXJIVE1MID0gYFxuICAgICAgICAgIDxkaXYgY2xhc3M9XCJjYXRlZ29yeS1jb250ZW50XCI+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImNhdGVnb3J5LWNvbG9yXCIgc3R5bGU9XCJiYWNrZ3JvdW5kLWNvbG9yOiAke2NhdGVnb3J5LmNvbG9yfTtcIj48L3NwYW4+IFxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJjYXRlZ29yeS1uYW1lXCI+JHtjYXRlZ29yeS5uYW1lfTwvc3Bhbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiZGVsZXRlLWNhdGVnb3J5LWJ0blwiIGRhdGEtaWQ9XCIke2NhdGVnb3J5LmlkfVwiPlxuICAgICAgICAgICAgPGkgY2xhc3M9XCJmYXMgZmEtdHJhc2hcIj48L2k+XG4gICAgICAgICAgPC9idXR0b24+XG4gICAgICAgIGA7XG4gICAgICAvLyBBZGQgY2xpY2sgZXZlbnQgZm9yIGZpbHRlcmluZ1xuICAgICAgbGkuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIChlKSA9PiB7XG4gICAgICAgIC8vIFByZXZlbnQgY2xpY2sgaWYgZGVsZXRlIGJ1dHRvbiBpcyBjbGlja2VkXG4gICAgICAgIGlmIChlLnRhcmdldC5jbG9zZXN0KFwiLmRlbGV0ZS1jYXRlZ29yeS1idG5cIikpIHJldHVybjtcbiAgICAgICAgYWN0aXZlQ2F0ZWdvcnkgPSBjYXRlZ29yeS5uYW1lO1xuICAgICAgICAvLyBSZW1vdmUgLmFjdGl2ZSBmcm9tIGFsbCBzaWRlYmFyLWJ0biBhbmQgY2F0ZWdvcnktaXRlbVxuICAgICAgICBkb2N1bWVudFxuICAgICAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLnNpZGViYXItYnRuLCAuY2F0ZWdvcnktaXRlbVwiKVxuICAgICAgICAgIC5mb3JFYWNoKChidG4pID0+IHtcbiAgICAgICAgICAgIGJ0bi5jbGFzc0xpc3QucmVtb3ZlKFwiYWN0aXZlXCIpO1xuICAgICAgICAgIH0pO1xuICAgICAgICBsaS5jbGFzc0xpc3QuYWRkKFwiYWN0aXZlXCIpO1xuICAgICAgICByZW5kZXJDYXRlZ29yaWVzKCk7XG4gICAgICAgIC8vIERpc3BhdGNoIGN1c3RvbSBldmVudCBmb3IgZmlsdGVyaW5nXG4gICAgICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KFxuICAgICAgICAgIG5ldyBDdXN0b21FdmVudChcImNhdGVnb3J5RmlsdGVyXCIsIHtcbiAgICAgICAgICAgIGRldGFpbDogeyBjYXRlZ29yeTogY2F0ZWdvcnkubmFtZSB9LFxuICAgICAgICAgIH0pXG4gICAgICAgICk7XG4gICAgICB9KTtcbiAgICAgIGNhdGVnb3JpZXNDb250YWluZXIuYXBwZW5kQ2hpbGQobGkpO1xuICAgIH0pO1xuXG4gICAgLy8gQWRkIGV2ZW50IGxpc3RlbmVycyB0byBkZWxldGUgYnV0dG9uc1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoXCIuZGVsZXRlLWNhdGVnb3J5LWJ0blwiKS5mb3JFYWNoKChidG4pID0+IHtcbiAgICAgIGJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGUpID0+IHtcbiAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgLy8gRW5zdXJlIGlkIGlzIHRyZWF0ZWQgYXMgYSBzdHJpbmdcbiAgICAgICAgY29uc3QgaWQgPSBidG4uZGF0YXNldC5pZDtcbiAgICAgICAgY29uc29sZS5sb2coXCJBdHRlbXB0aW5nIHRvIGRlbGV0ZSBjYXRlZ29yeSB3aXRoIGlkOlwiLCBpZCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiQ3VycmVudCBjYXRlZ29yaWVzOlwiLCBjYXRlZ29yaWVzKTtcbiAgICAgICAgZGVsZXRlQ2F0ZWdvcnkoaWQpO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiB1cGRhdGVDYXRlZ29yeVNlbGVjdCgpIHtcbiAgICBjb25zdCBjYXRlZ29yeVNlbGVjdCA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2F0ZWdvcnlcIik7XG4gICAgY2F0ZWdvcnlTZWxlY3QuaW5uZXJIVE1MID0gXCJcIjtcblxuICAgIC8vIEFkZCBcIk5vbmVcIiBvcHRpb24gZmlyc3RcbiAgICBjb25zdCBub25lT3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKTtcbiAgICBub25lT3B0aW9uLnZhbHVlID0gXCJOb25lXCI7XG4gICAgbm9uZU9wdGlvbi50ZXh0Q29udGVudCA9IFwiTm9uZVwiO1xuICAgIGNhdGVnb3J5U2VsZWN0LmFwcGVuZENoaWxkKG5vbmVPcHRpb24pO1xuXG4gICAgLy8gQWRkIGFsbCBjYXRlZ29yeSBvcHRpb25zXG4gICAgY2F0ZWdvcmllcy5mb3JFYWNoKChjYXRlZ29yeSkgPT4ge1xuICAgICAgY29uc3Qgb3B0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcIm9wdGlvblwiKTtcbiAgICAgIG9wdGlvbi52YWx1ZSA9IGNhdGVnb3J5Lm5hbWU7XG4gICAgICBvcHRpb24udGV4dENvbnRlbnQgPSBjYXRlZ29yeS5uYW1lO1xuICAgICAgY2F0ZWdvcnlTZWxlY3QuYXBwZW5kQ2hpbGQob3B0aW9uKTtcbiAgICB9KTtcbiAgfVxuXG4gIGFzeW5jIGZ1bmN0aW9uIGRlbGV0ZUNhdGVnb3J5KGlkKSB7XG4gICAgLy8gQ29udmVydCBpZCB0byBzdHJpbmcgZm9yIGNvbnNpc3RlbmN5XG4gICAgY29uc3QgaW5kZXggPSBjYXRlZ29yaWVzLmZpbmRJbmRleChcbiAgICAgIChjKSA9PiBjLmlkLnRvU3RyaW5nKCkgPT09IGlkLnRvU3RyaW5nKClcbiAgICApO1xuICAgIGNvbnNvbGUubG9nKFwiZGVsZXRlQ2F0ZWdvcnkgY2FsbGVkIHdpdGggaWQ6XCIsIGlkLCBcIkZvdW5kIGluZGV4OlwiLCBpbmRleCk7XG5cbiAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgdHJ5IHtcbiAgICAgICAgLy8gRGVsZXRlIGNhdGVnb3J5IHZpYSBBUElcbiAgICAgICAgYXdhaXQgQXBpU2VydmljZS5kZWxldGVDYXRlZ29yeShpZCk7XG4gICAgICAgIC8vIFJlbW92ZSBmcm9tIGxvY2FsIHN0YXRlXG4gICAgICAgIGNhdGVnb3JpZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xuICAgICAgICB1cGRhdGVDYXRlZ29yeVNlbGVjdCgpO1xuICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBkZWxldGUgY2F0ZWdvcnk6XCIsIGVycm9yKTtcbiAgICAgICAgLy8gT3B0aW9uYWxseSBzaG93IGVycm9yIG1lc3NhZ2UgdG8gdXNlclxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiQ2F0ZWdvcnkgbm90IGZvdW5kIHdpdGggaWQ6XCIsIGlkKTtcbiAgICB9XG4gIH1cblxuICBpZiAod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lID09PSBcIi9hcHBcIikge1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgIGNvbnN0IGNhdGVnb3J5U2VsZWN0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjYXRlZ29yeVwiKTtcbiAgICAgIGNvbnN0IGNhdGVnb3JpZXNDb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcbiAgICAgICAgXCJjYXRlZ29yaWVzLWNvbnRhaW5lclwiXG4gICAgICApO1xuICAgICAgY29uc3QgYWRkTmV3Q2F0ZWdvcnlCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImFkZC1uZXctY2F0ZWdvcnktYnRuXCIpO1xuICAgICAgY29uc3QgbmV3Q2F0ZWdvcnlGb3JtID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctY2F0ZWdvcnktZm9ybVwiKTtcbiAgICAgIGNvbnN0IGNyZWF0ZUNhdGVnb3J5QnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJjcmVhdGUtY2F0ZWdvcnktYnRuXCIpO1xuXG4gICAgICAvLyBGZXRjaCBjYXRlZ29yaWVzIGZyb20gQVBJXG4gICAgICBhc3luYyBmdW5jdGlvbiBpbml0aWFsaXplQ2F0ZWdvcmllcygpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICBjYXRlZ29yaWVzID0gYXdhaXQgQXBpU2VydmljZS5mZXRjaENhdGVnb3JpZXMoKTtcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIkZldGNoZWQgY2F0ZWdvcmllczpcIiwgY2F0ZWdvcmllcyk7XG4gICAgICAgICAgcmVuZGVyQ2F0ZWdvcmllcygpO1xuICAgICAgICAgIHVwZGF0ZUNhdGVnb3J5U2VsZWN0KCk7XG4gICAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihcIkZhaWxlZCB0byBmZXRjaCBjYXRlZ29yaWVzOlwiLCBlcnJvcik7XG4gICAgICAgICAgLy8gT3B0aW9uYWxseSBzaG93IGVycm9yIG1lc3NhZ2UgdG8gdXNlclxuICAgICAgICAgIHJlbmRlckNhdGVnb3JpZXMoKTtcbiAgICAgICAgICB1cGRhdGVDYXRlZ29yeVNlbGVjdCgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGluaXRpYWxpemVDYXRlZ29yaWVzKCk7XG5cbiAgICAgIC8vIENhdGVnb3J5IG1hbmFnZW1lbnRcbiAgICAgIGFkZE5ld0NhdGVnb3J5QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgIG5ld0NhdGVnb3J5Rm9ybS5zdHlsZS5kaXNwbGF5ID1cbiAgICAgICAgICBuZXdDYXRlZ29yeUZvcm0uc3R5bGUuZGlzcGxheSA9PT0gXCJub25lXCIgPyBcImZsZXhcIiA6IFwibm9uZVwiO1xuICAgICAgfSk7XG5cbiAgICAgIGNyZWF0ZUNhdGVnb3J5QnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBhc3luYyAoKSA9PiB7XG4gICAgICAgIGNvbnN0IG5hbWUgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1uYW1lXCIpLnZhbHVlLnRyaW0oKTtcbiAgICAgICAgY29uc3QgY29sb3IgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm5ldy1jYXRlZ29yeS1jb2xvclwiKS52YWx1ZTtcblxuICAgICAgICBpZiAobmFtZSkge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAvLyBBZGQgbmV3IGNhdGVnb3J5IHZpYSBBUElcbiAgICAgICAgICAgIGNvbnN0IGFwaUNhdGVnb3J5ID0gYXdhaXQgQXBpU2VydmljZS5jcmVhdGVDYXRlZ29yeSh7XG4gICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgIGNvbG9yLFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjYXRlZ29yaWVzLnB1c2goYXBpQ2F0ZWdvcnkpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coXCJBZGRlZCBuZXcgY2F0ZWdvcnk6XCIsIGFwaUNhdGVnb3J5KTtcbiAgICAgICAgICAgIHJlbmRlckNhdGVnb3JpZXMoKTtcbiAgICAgICAgICAgIHVwZGF0ZUNhdGVnb3J5U2VsZWN0KCk7XG5cbiAgICAgICAgICAgIC8vIFJlc2V0IGZvcm1cbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibmV3LWNhdGVnb3J5LW5hbWVcIikudmFsdWUgPSBcIlwiO1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJuZXctY2F0ZWdvcnktY29sb3JcIikudmFsdWUgPSBcIiNjY2NjY2NcIjtcbiAgICAgICAgICAgIG5ld0NhdGVnb3J5Rm9ybS5zdHlsZS5kaXNwbGF5ID0gXCJub25lXCI7XG4gICAgICAgICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoXCJGYWlsZWQgdG8gY3JlYXRlIGNhdGVnb3J5OlwiLCBlcnJvcik7XG4gICAgICAgICAgICAvLyBPcHRpb25hbGx5IHNob3cgZXJyb3IgbWVzc2FnZSB0byB1c2VyXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gQWRkIGEgZ2xvYmFsIGxpc3RlbmVyIHRvIGNsZWFyIGZpbHRlciB3aGVuIGNsaWNraW5nIFwiQ2FsZW5kYXJcIiBvciBcIlVwY29taW5nXCIgb3IgXCJUb2RheVwiXG4gICAgICBbXCJidG4tY2FsZW5kYXJcIiwgXCJidG4tdXBjb21pbmdcIiwgXCJidG4tdG9kYXlcIl0uZm9yRWFjaCgoaWQpID0+IHtcbiAgICAgICAgY29uc3QgYnRuID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoaWQpO1xuICAgICAgICBpZiAoYnRuKSB7XG4gICAgICAgICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCAoKSA9PiB7XG4gICAgICAgICAgICBhY3RpdmVDYXRlZ29yeSA9IG51bGw7XG4gICAgICAgICAgICByZW5kZXJDYXRlZ29yaWVzKCk7XG4gICAgICAgICAgICB3aW5kb3cuZGlzcGF0Y2hFdmVudChcbiAgICAgICAgICAgICAgbmV3IEN1c3RvbUV2ZW50KFwiY2F0ZWdvcnlGaWx0ZXJcIiwgeyBkZXRhaWw6IHsgY2F0ZWdvcnk6IG51bGwgfSB9KVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBnZXRDYXRlZ29yaWVzOiAoKSA9PiBjYXRlZ29yaWVzLFxuICAgIHJlbmRlckNhdGVnb3JpZXMsXG4gICAgdXBkYXRlQ2F0ZWdvcnlTZWxlY3QsXG4gIH07XG59KSgpO1xuIiwiZXhwb3J0IGNvbnN0IERvbVV0aWxzID0gKCgpID0+IHtcbiAgZnVuY3Rpb24gY2xlYXJNZXNzYWdlcygpIHtcbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lc3NhZ2VDb250YWluZXJcIik7XG4gICAgaWYgKGNvbnRhaW5lcikgY29udGFpbmVyLmlubmVySFRNTCA9IFwiXCI7XG4gICAgZG9jdW1lbnRcbiAgICAgIC5xdWVyeVNlbGVjdG9yQWxsKFwiLmVycm9yLW1lc3NhZ2UsIC5zdWNjZXNzLW1lc3NhZ2VcIilcbiAgICAgIC5mb3JFYWNoKChlbCkgPT4ge1xuICAgICAgICBpZiAoZWwucGFyZW50Tm9kZSAhPT0gY29udGFpbmVyKSBlbC5yZW1vdmUoKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gc2hvd01lc3NhZ2UobWVzc2FnZSwgdHlwZSA9IFwiZXJyb3JcIikge1xuICAgIGNsZWFyTWVzc2FnZXMoKTtcbiAgICBjb25zdCBtZXNzYWdlRWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgbWVzc2FnZUVsZW1lbnQuY2xhc3NOYW1lID1cbiAgICAgIHR5cGUgPT09IFwiZXJyb3JcIiA/IFwiZXJyb3ItbWVzc2FnZVwiIDogXCJzdWNjZXNzLW1lc3NhZ2VcIjtcbiAgICBtZXNzYWdlLnNwbGl0KFwiXFxuXCIpLmZvckVhY2goKGxpbmUpID0+IHtcbiAgICAgIGNvbnN0IHAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwicFwiKTtcbiAgICAgIHAudGV4dENvbnRlbnQgPSBsaW5lO1xuICAgICAgbWVzc2FnZUVsZW1lbnQuYXBwZW5kQ2hpbGQocCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBjb250YWluZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcIm1lc3NhZ2VDb250YWluZXJcIik7XG4gICAgaWYgKGNvbnRhaW5lcikge1xuICAgICAgY29udGFpbmVyLmFwcGVuZENoaWxkKG1lc3NhZ2VFbGVtZW50KTtcbiAgICB9IGVsc2Uge1xuICAgICAgY29uc3QgZm9ybSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiYXV0aEZvcm1cIik7XG4gICAgICBmb3JtXG4gICAgICAgID8gZm9ybS5wYXJlbnROb2RlLmluc2VydEJlZm9yZShtZXNzYWdlRWxlbWVudCwgZm9ybSlcbiAgICAgICAgOiBkb2N1bWVudC5ib2R5LnByZXBlbmQobWVzc2FnZUVsZW1lbnQpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7XG4gICAgY2xlYXJNZXNzYWdlcyxcbiAgICBzaG93RXJyb3I6IChtc2cpID0+IHNob3dNZXNzYWdlKG1zZywgXCJlcnJvclwiKSxcbiAgICBzaG93U3VjY2VzczogKG1zZykgPT4gc2hvd01lc3NhZ2UobXNnLCBcInN1Y2Nlc3NcIiksXG4gIH07XG59KSgpO1xuIiwiZXhwb3J0IGNvbnN0IExvYWRlciA9ICgoKSA9PiB7XG4gIGZ1bmN0aW9uIHRvZ2dsZShzaG93KSB7XG4gICAgbGV0IGxvYWRlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwibG9hZGVyXCIpO1xuICAgIGlmICghbG9hZGVyICYmIHNob3cpIGxvYWRlciA9IGNyZWF0ZSgpO1xuICAgIGlmIChsb2FkZXIpIGxvYWRlci5zdHlsZS5kaXNwbGF5ID0gc2hvdyA/IFwiZmxleFwiIDogXCJub25lXCI7XG4gIH1cblxuICBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gICAgY29uc3QgbG9hZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBsb2FkZXIuaWQgPSBcImxvYWRlclwiO1xuICAgIGxvYWRlci5jbGFzc05hbWUgPSBcImxvYWRlclwiO1xuICAgIGxvYWRlci5pbm5lckhUTUwgPSAnPGRpdiBjbGFzcz1cInNwaW5uZXJcIj48L2Rpdj4nO1xuICAgIGRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQobG9hZGVyKTtcbiAgICByZXR1cm4gbG9hZGVyO1xuICB9XG5cbiAgcmV0dXJuIHsgdG9nZ2xlIH07XG59KSgpO1xuIiwiaW1wb3J0IHsgTG9hZGVyIH0gZnJvbSBcIi4vbG9hZGVyLmpzXCI7XG5pbXBvcnQgeyBEb21VdGlscyB9IGZyb20gXCIuL2RvbVV0aWxzLmpzXCI7XG5cbmV4cG9ydCBjb25zdCBVc2VyID0gKCgpID0+IHtcbiAgYXN5bmMgZnVuY3Rpb24gbG9nb3V0KCkge1xuICAgIGNvbnNvbGUubG9nKFwiQXR0ZW1wdGluZyBsb2dvdXQuLi5cIik7XG4gICAgTG9hZGVyLnRvZ2dsZSh0cnVlKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChcIi9hcGkvbG9nb3V0XCIsIHtcbiAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgICAgaGVhZGVyczogeyBBY2NlcHQ6IFwiYXBwbGljYXRpb24vanNvblwiIH0sXG4gICAgICB9KTtcblxuICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKTtcbiAgICAgIGlmICghcmVzcG9uc2Uub2spXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBkYXRhLmVycm9yIHx8IGBMb2dvdXQgZmFpbGVkIHdpdGggc3RhdHVzOiAke3Jlc3BvbnNlLnN0YXR1c31gXG4gICAgICAgICk7XG4gICAgICBjb25zb2xlLmxvZyhcIkxvZ291dCBzdWNjZXNzZnVsIHZpYSBBUEkuXCIpO1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiTG9nb3V0IEFQSSBjYWxsIGZhaWxlZDpcIiwgZXJyb3IpO1xuICAgICAgRG9tVXRpbHMuc2hvd0Vycm9yKFxuICAgICAgICBcIkNvdWxkIG5vdCBwcm9wZXJseSBsb2cgb3V0LiBDbGVhciBjb29raWVzIG1hbnVhbGx5IGlmIG5lZWRlZC5cIlxuICAgICAgKTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oXCJ1c2VyXCIpO1xuICAgICAgTG9hZGVyLnRvZ2dsZShmYWxzZSk7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiL2xvZ2luXCI7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZGlzcGxheVVzZXJEYXRhKCkge1xuICAgIGNvbnN0IHVzZXJEYXRhU3RyaW5nID0gbG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJ1c2VyXCIpO1xuICAgIGlmICghdXNlckRhdGFTdHJpbmcpIHJldHVybiBsb2dvdXQoKTtcbiAgICB0cnkge1xuICAgICAgY29uc3QgdXNlckRhdGEgPSBKU09OLnBhcnNlKHVzZXJEYXRhU3RyaW5nKTtcbiAgICAgIGNvbnN0IHVzZXJOYW1lID0gdXNlckRhdGEubmFtZSB8fCBcIlVzZXJcIjtcbiAgICAgIGNvbnN0IHVzZXJOYW1lRGlzcGxheSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwidXNlci1uYW1lLWRpc3BsYXlcIik7XG4gICAgICBpZiAodXNlck5hbWVEaXNwbGF5KSB1c2VyTmFtZURpc3BsYXkudGV4dENvbnRlbnQgPSB1c2VyTmFtZTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKFwiSW52YWxpZCB1c2VyIGRhdGEgaW4gbG9jYWxTdG9yYWdlLlwiKTtcbiAgICAgIGxvZ291dCgpO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiB7IGxvZ291dCwgZGlzcGxheVVzZXJEYXRhIH07XG59KSgpO1xuIiwiLy8gVGhlIG1vZHVsZSBjYWNoZVxudmFyIF9fd2VicGFja19tb2R1bGVfY2FjaGVfXyA9IHt9O1xuXG4vLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXHQvLyBDaGVjayBpZiBtb2R1bGUgaXMgaW4gY2FjaGVcblx0dmFyIGNhY2hlZE1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF07XG5cdGlmIChjYWNoZWRNb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuXHRcdHJldHVybiBjYWNoZWRNb2R1bGUuZXhwb3J0cztcblx0fVxuXHQvLyBDcmVhdGUgYSBuZXcgbW9kdWxlIChhbmQgcHV0IGl0IGludG8gdGhlIGNhY2hlKVxuXHR2YXIgbW9kdWxlID0gX193ZWJwYWNrX21vZHVsZV9jYWNoZV9fW21vZHVsZUlkXSA9IHtcblx0XHQvLyBubyBtb2R1bGUuaWQgbmVlZGVkXG5cdFx0Ly8gbm8gbW9kdWxlLmxvYWRlZCBuZWVkZWRcblx0XHRleHBvcnRzOiB7fVxuXHR9O1xuXG5cdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuXHRfX3dlYnBhY2tfbW9kdWxlc19fW21vZHVsZUlkXShtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuXHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuXHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG59XG5cbiIsIi8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb25zIGZvciBoYXJtb255IGV4cG9ydHNcbl9fd2VicGFja19yZXF1aXJlX18uZCA9IChleHBvcnRzLCBkZWZpbml0aW9uKSA9PiB7XG5cdGZvcih2YXIga2V5IGluIGRlZmluaXRpb24pIHtcblx0XHRpZihfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZGVmaW5pdGlvbiwga2V5KSAmJiAhX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIGtleSkpIHtcblx0XHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBrZXksIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBkZWZpbml0aW9uW2tleV0gfSk7XG5cdFx0fVxuXHR9XG59OyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCJpbXBvcnQgeyBVc2VyIH0gZnJvbSBcIi4vbW9kdWxlcy91c2VyLmpzXCI7XG5pbXBvcnQgeyBBdXRoIH0gZnJvbSBcIi4vbW9kdWxlcy9hdXRoLmpzXCI7XG5pbXBvcnQgeyBUb2RvIH0gZnJvbSBcIi4vbW9kdWxlcy9jYWxlbmRhci5qc1wiO1xuXG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLCAoKSA9PiB7XG4gIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUgPT09IFwiL2FwcFwiKSB7XG4gICAgVXNlci5kaXNwbGF5VXNlckRhdGEoKTtcbiAgfVxuICBjb25zdCBsb2dvdXRCdG4gPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImJ0bi1sb2dvdXRcIik7XG4gIGlmIChsb2dvdXRCdG4pIGxvZ291dEJ0bi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgVXNlci5sb2dvdXQpO1xuXG4gIGNvbnNvbGUubG9nKFwiTWFpbiBhcHAgaW5pdGlhbGl6ZWQuXCIpO1xufSk7XG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=