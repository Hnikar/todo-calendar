import { Category } from "./category.js";
import { ApiService } from "./apiService.js"; // Import ApiService

export const Todo = (() => {
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

    // Fetch tasks from API and render calendar
    async function initializeCalendar() {
      try {
        const tasks = await ApiService.fetchTasks();
        tasks.forEach((task) => calendar.addEvent(task));
        calendar.render();
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    }

    initializeCalendar();

    // Event Listeners
    addTaskButton.addEventListener("click", () => {
      isEditing = false;
      currentEditingTask = null;
      form.reset();
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
        updateFormUI();
      } catch (error) {
        console.error("Failed to save task:", error);
      }
    });

    deleteButton.addEventListener("click", async () => {
      if (currentEditingTask) {
        try {
          await ApiService.deleteTask(currentEditingTask.id);
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
      document.getElementById("category").value =
        event.extendedProps.category || "None";
      document.getElementById("completed").checked =
        event.extendedProps.completed || false;
    }

    function getFormData() {
      const categoryValue = document.getElementById("category").value;
      return {
        id: isEditing ? currentEditingTask.id : undefined, // ID is managed by server
        title: document.getElementById("title").value,
        start: document.getElementById("taskDate").value,
        end: document.getElementById("taskDate").value,
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
      const newTask = await ApiService.createTask(data);
      calendar.addEvent(newTask);
    }

    async function updateTask(data) {
      const updatedTask = await ApiService.updateTask(data.id, data);
      currentEditingTask.remove();
      calendar.addEvent(updatedTask);
    }
  });
  return {
    // Expose methods if needed by Category module
  };
})();
