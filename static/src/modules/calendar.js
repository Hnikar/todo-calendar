import { Category } from "./category.js";
import { ApiService } from "./apiService.js"; // Import ApiService

export const Todo = (() => {
  let currentEditingTask = null;
  let isEditing = false;

  // Local Storage Service
  const LocalStorageService = {
    getTasks() {
      const tasks = localStorage.getItem("tasks");
      return tasks ? JSON.parse(tasks) : [];
    },
    saveTask(task) {
      const tasks = this.getTasks();
      tasks.push(task);
      localStorage.setItem("tasks", JSON.stringify(tasks));
      return task;
    },
    updateTask(id, updatedTask) {
      const tasks = this.getTasks();
      const index = tasks.findIndex((t) => t.id === id);
      if (index !== -1) {
        tasks[index] = { ...tasks[index], ...updatedTask };
        localStorage.setItem("tasks", JSON.stringify(tasks));
        return tasks[index];
      }
      return null;
    },
    deleteTask(id) {
      const tasks = this.getTasks();
      const updatedTasks = tasks.filter((t) => t.id !== id);
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    },
    generateId() {
      return "local_" + Math.random().toString(36).substr(2, 9); // Simple unique ID for local tasks
    },
  };

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("task-form");
    const formHeading = document.getElementById("form-heading");
    const submitButton = document.getElementById("submit-button");
    const deleteButton = document.getElementById("delete-button");
    const cancelButton = document.getElementById("cancel-button");
    const addTaskButton = document.querySelector(
      ".content-header-container > button"
    );
    const allDayCheckbox = document.getElementById("allDay");
    const timeInputs = document.getElementById("timeInputs");

    // Toggle time inputs based on All Day checkbox
    allDayCheckbox.addEventListener("change", () => {
      timeInputs.style.display = allDayCheckbox.checked ? "none" : "flex";
      if (allDayCheckbox.checked) {
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
        right: "dayGridMonth,timeGridWeek,timeGridDay",
      },
      editable: true,
      selectable: true,
      selectMirror: true,
      dayMaxEvents: true,
      events: [], // Initialize empty, populate via fetchTasks
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

        // Apply category color (handled by Category module)
        const category = info.event.extendedProps.category;
        if (category && category !== "None") {
          const cat = Category.getCategories().find((c) => c.name === category);
          if (cat) {
            info.el.style.borderLeft = `4px solid ${cat.color}`;
          }
        } else {
          info.el.style.borderLeft = "4px solid transparent";
        }
      },
    });

    // Fetch tasks from API or localStorage and render calendar
    async function initializeCalendar() {
      try {
        const tasks = await ApiService.fetchTasks();
        tasks.forEach((task) => calendar.addEvent(task));
        // Save server tasks to localStorage as backup
        localStorage.setItem("tasks", JSON.stringify(tasks));
      } catch (error) {
        console.warn("Server unavailable, using localStorage:", error);
        const localTasks = LocalStorageService.getTasks();
        localTasks.forEach((task) => calendar.addEvent(task));
      }
      calendar.render();
    }

    initializeCalendar();

    // Event Listeners
    addTaskButton.addEventListener("click", () => {
      isEditing = false;
      currentEditingTask = null;
      form.reset();
      allDayCheckbox.checked = false;
      timeInputs.style.display = "flex";
      updateFormUI();
    });

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
      const allDay = event.allDay;
      allDayCheckbox.checked = allDay;
      timeInputs.style.display = allDay ? "none" : "flex";

      // Handle time inputs for non-all-day events
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
        id: isEditing ? currentEditingTask.id : undefined, // ID is managed by server or localStorage
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
      try {
        const newTask = await ApiService.createTask(data);
        calendar.addEvent(newTask);
        // Save to localStorage as backup
        LocalStorageService.saveTask(newTask);
        return newTask;
      } catch (error) {
        console.warn("Server unavailable, saving to localStorage:", error);
        const localTask = { ...data, id: LocalStorageService.generateId() };
        LocalStorageService.saveTask(localTask);
        calendar.addEvent(localTask);
        return localTask;
      }
    }

    async function updateTask(data) {
      try {
        const updatedTask = await ApiService.updateTask(data.id, data);
        currentEditingTask.remove();
        calendar.addEvent(updatedTask);
        // Update localStorage as backup
        LocalStorageService.updateTask(data.id, updatedTask);
        return updatedTask;
      } catch (error) {
        console.warn("Server unavailable, updating in localStorage:", error);
        const updatedTask = LocalStorageService.updateTask(data.id, data);
        if (updatedTask) {
          currentEditingTask.remove();
          calendar.addEvent(updatedTask);
          return updatedTask;
        }
        throw new Error("Task not found in localStorage");
      }
    }

    async function deleteTask(id) {
      try {
        await ApiService.deleteTask(id);
        // Update localStorage
        LocalStorageService.deleteTask(id);
      } catch (error) {
        console.warn("Server unavailable, deleting from localStorage:", error);
        LocalStorageService.deleteTask(id);
      }
    }
  });
  return {
    // Expose methods if needed by Category module
  };
})();