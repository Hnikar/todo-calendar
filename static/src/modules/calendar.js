import { Category } from "./category";
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

    // Initialize tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem("calendarTasks")) || [];

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
      events: tasks,
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

        // Apply catagory color (handled by Category module)
        const catagory = info.event.extendedProps.catagory;
        if (catagory && catagory !== "None") {
          const cat = Category.getCatagories().find((c) => c.name === catagory);
          if (cat) {
            info.el.style.borderLeft = `4px solid ${cat.color}`;
          }
        } else {
          info.el.style.borderLeft = "4px solid transparent";
        }
      },
    });

    calendar.render();

    // Event Listeners
    addTaskButton.addEventListener("click", () => {
      isEditing = false;
      currentEditingTask = null;
      form.reset();
      updateFormUI();
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      const formData = getFormData();

      if (isEditing) {
        updateTask(formData);
      } else {
        createTask(formData);
      }

      form.reset();
      updateFormUI();
    });

    deleteButton.addEventListener("click", () => {
      if (currentEditingTask) {
        tasks = tasks.filter((t) => t.id !== currentEditingTask.id);
        currentEditingTask.remove();
        saveTasks();
        form.reset();
        isEditing = false;
        currentEditingTask = null;
        updateFormUI();
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
      document.getElementById("catagory").value =
        event.extendedProps.catagory || "None";
      document.getElementById("completed").checked =
        event.extendedProps.completed || false;
    }

    function getFormData() {
      const catagoryValue = document.getElementById("catagory").value;
      return {
        id: isEditing ? currentEditingTask.id : Date.now().toString(),
        title: document.getElementById("title").value,
        start: document.getElementById("taskDate").value,
        end: document.getElementById("taskDate").value,
        description: document.getElementById("description").value,
        priority: document.getElementById("priority").value,
        catagory: catagoryValue === "None" ? null : catagoryValue,
        completed: document.getElementById("completed").checked,
        className: `priority-${document.getElementById("priority").value} ${
          document.getElementById("completed").checked ? "completed-task" : ""
        }`,
      };
    }

    function createTask(data) {
      tasks.push(data);
      calendar.addEvent(data);
      saveTasks();
    }

    function updateTask(data) {
      const index = tasks.findIndex((t) => t.id === data.id);
      if (index > -1) {
        tasks[index] = data;
        currentEditingTask.remove();
        calendar.addEvent(data);
        saveTasks();
      }
    }

    function saveTasks() {
      localStorage.setItem("calendarTasks", JSON.stringify(tasks));
    }

    // Initial UI update
    updateFormUI();
  });

  return {
    // Expose methods if needed by Category module
  };
})();
