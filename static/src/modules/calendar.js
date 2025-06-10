import { Category } from "./category.js";
import { ApiService } from "./apiService.js";

export const Todo = (() => {
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

          // Apply category color
          const category = info.event.extendedProps.category;
          if (category && category !== "None") {
            const cat = Category.getCategories().find(
              (c) => c.name === category
            );
            if (cat) {
              console.log(
                `Assigning color "${cat.color}" to event "${info.event.title}" (category: "${category}")`
              );
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
            const updatedTask = await ApiService.updateTask(
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
          const tasks = await ApiService.fetchTasks();
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
        const newTask = await ApiService.createTask(data);
        allTasks.push(newTask);
        calendar.addEvent(newTask);
        return newTask;
      }

      async function updateTask(data) {
        const updatedTask = await ApiService.updateTask(data.id, data);
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
        console.log("allTasks before delete:", allTasks.map((t) => t.id));
        await ApiService.deleteTask(id);
        // Ensure id comparison is always string-based and update array in place
        const idStr = String(id);
        for (let i = allTasks.length - 1; i >= 0; i--) {
          if (String(allTasks[i].id) === idStr) {
            allTasks.splice(i, 1);
          }
        }
        console.log("Deleted task id:", id);
        console.log("allTasks after delete:", allTasks.map((t) => t.id));
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
