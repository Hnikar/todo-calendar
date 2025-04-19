import { ApiService } from "./api-service.js";
import { DomUtils } from "./domUtils.js";

export const Todo = (() => {
  let calendar;
  let tasks = [];

  async function initializeCalendar() {
    try {
      const data = await ApiService.fetchTasks();
      if (!data) {
        throw new Error("Failed to load tasks");
      }
      tasks = data.tasks || [];

      const calendarEl = document.getElementById("calendar");
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
        events: tasks.map((task) => ({
          id: task.id,
          title: task.title,
          start: task.start || task.taskDate,
          end: task.end || task.taskDate,
          description: task.description,
          priority: task.priority,
          className: `priority-${task.priority}`,
        })),
        eventClick: handleEventClick,
        eventChange: handleEventUpdate,
        eventRemove: handleEventDelete,
      });

      calendar.render();
    } catch (error) {
      console.error("Failed to initialize calendar:", error);
      DomUtils.showError("Failed to load calendar. Please refresh the page.");
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
      const createdTask = await ApiService.createTask(newTask);

      calendar.addEvent({
        id: createdTask.id,
        title: createdTask.title,
        start: createdTask.start || createdTask.taskDate,
        end: createdTask.end || createdTask.taskDate,
        description: createdTask.description,
        priority: createdTask.priority,
        className: `priority-${createdTask.priority}`,
      });

      e.target.reset();
      DomUtils.showSuccess("Task created successfully!");
    } catch (error) {
      console.error("Task creation failed:", error);
      DomUtils.showError("Failed to create task. Please try again.");
    }
  }

  async function handleEventUpdate(info) {
    try {
      await ApiService.updateTask(info.event.id, {
        title: info.event.title,
        taskDate: info.event.start,
        description: info.event.extendedProps.description,
        priority: info.event.extendedProps.priority,
      });
      DomUtils.showSuccess("Task updated successfully!");
    } catch (error) {
      info.revert();
      console.error("Update failed:", error);
      DomUtils.showError("Failed to update task. Changes reverted.");
    }
  }

  async function handleEventDelete(info) {
    try {
      await ApiService.deleteTask(info.event.id);
      DomUtils.showSuccess("Task deleted successfully!");
    } catch (error) {
      calendar.addEvent(info.event);
      console.error("Deletion failed:", error);
      DomUtils.showError("Failed to delete task. Task restored.");
    }
  }

  function handleEventClick(info) {
    let details = `Task: ${info.event.title}\n`;
    details += `Description: ${
      info.event.extendedProps.description || "No description"
    }\n`;
    details += `Priority: ${info.event.extendedProps.priority}\n`;
    details += `Date: ${info.event.start.toLocaleDateString()}`;

    alert(details);
  }

  document.addEventListener("DOMContentLoaded", () => {
    initializeCalendar();
    document
      .getElementById("task-form")
      .addEventListener("submit", handleFormSubmit);
  });

  return { initializeCalendar };
})();
