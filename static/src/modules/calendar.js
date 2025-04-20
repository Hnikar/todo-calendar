import { ApiService } from "./api-service.js";
import { DomUtils } from "./domUtils.js";

export const Todo = (() => {
  let calendar;
  let tasks = [];

  function initializeBaseCalendar() {
    const calendarEl = document.getElementById("calendar");
    if (!calendarEl) return;

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
      events: [],
      eventClick: handleEventClick,
      eventChange: handleEventUpdate,
      eventRemove: handleEventDelete,
    });

    calendar.render();
  }

  async function loadInitialTasks() {
    try {
      const data = await ApiService.fetchTasks();
      if (data?.tasks?.length) {
        tasks = data.tasks.map((task) => ({
          id: task.id,
          title: task.title,
          start: task.start || task.taskDate,
          end: task.end || task.taskDate,
          description: task.description,
          priority: task.priority,
          className: `priority-${task.priority}`,
        }));

        calendar.batchRendering(() => {
          tasks.forEach((task) => calendar.addEvent(task));
        });

        DomUtils.showSuccess("Tasks loaded from server");
      }
    } catch (error) {
      console.warn("Offline mode:", error);
      DomUtils.showInfo("Working offline - changes may not be saved");
    }
  }

  async function initializeCalendar() {
    // Always create calendar first
    initializeBaseCalendar();

    // Then try to load data silently
    try {
      await loadInitialTasks();
    } catch (error) {
      // Fail silently, calendar already exists
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
      // Try to save to server
      const createdTask = await ApiService.createTask(newTask);

      // Add to calendar with server-generated ID
      calendar.addEvent({
        id: createdTask.id,
        ...newTask,
        start: newTask.taskDate,
        end: newTask.taskDate,
        className: `priority-${newTask.priority}`,
      });

      DomUtils.showSuccess("Task saved to server");
    } catch (error) {
      // Fallback: Add locally with client ID
      const localTask = {
        ...newTask,
        id: `local-${Date.now()}`,
        className: `priority-${newTask.priority}`,
      };

      calendar.addEvent(localTask);
      DomUtils.showWarning("Task saved locally (offline)");
    }

    e.target.reset();
  }

  async function handleEventUpdate(info) {
    const originalEvent = { ...info.event.toPlainObject() };

    try {
      await ApiService.updateTask(info.event.id, {
        title: info.event.title,
        taskDate: info.event.start,
        description: info.event.extendedProps.description,
        priority: info.event.extendedProps.priority,
      });
      DomUtils.showSuccess("Changes saved to server");
    } catch (error) {
      info.revert();
      DomUtils.showError("Failed to save changes. Restored original.");
      console.warn("Update failed:", error);
    }
  }

  async function handleEventDelete(info) {
    const eventCopy = info.event.toPlainObject();

    try {
      await ApiService.deleteTask(info.event.id);
      DomUtils.showSuccess("Task deleted from server");
    } catch (error) {
      calendar.addEvent(eventCopy);
      DomUtils.showWarning("Deletion failed. Task restored.");
      console.warn("Delete failed:", error);
    }
  }

  function handleEventClick(info) {
    const event = info.event;
    const description = event.extendedProps.description || "No description";
    const priority = event.extendedProps.priority || "not set";
    const date = event.start?.toLocaleDateString() || "Unknown date";

    const details = [
      `Task: ${event.title}`,
      `Description: ${description}`,
      `Priority: ${priority}`,
      `Date: ${date}`,
    ].join("\n");

    alert(details);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initializeCalendar();
    document
      .getElementById("task-form")
      ?.addEventListener("submit", handleFormSubmit);
  });

  return { initializeCalendar };
})();