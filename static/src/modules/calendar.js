import { ApiService } from "./api-service.js";

export const Todo = (() => {
  let calendar;
  let tasks = [];

  async function initializeCalendar() {
    try {
      // const data = await ApiService.fetchTasks();
      // tasks = data.tasks || [];

      // ВЫШЕ РАСКОМЕНТИТЬ КОГА БУДЕШЬ ДОКРУЧИВАТЬ СЕРВЕР. Я ДОБАВИЛ ЧИСТО ЧТОБЫ ОНО ОШИБКУ НЕ ВЫБИВАЛО БЕЗ СЕРВЕРА МОМЕНТАЛЬНО

      tasks = [];
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
        events: tasks,
        eventClick: handleEventClick,
        eventChange: handleEventUpdate,
        eventRemove: handleEventDelete,
      });

      calendar.render();
    } catch (error) {
      console.error("Failed to initialize calendar:", error);
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
        start: createdTask.taskDate,
        end: createdTask.taskDate,
        description: createdTask.description,
        priority: createdTask.priority,
        className: `priority-${createdTask.priority}`,
      });

      e.target.reset();
    } catch (error) {
      console.error("Task creation failed:", error);
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
    } catch (error) {
      info.revert();
      console.error("Update failed:", error);
    }
  }

  async function handleEventDelete(info) {
    try {
      await ApiService.deleteTask(info.event.id);
    } catch (error) {
      calendar.addEvent(info.event);
      console.error("Deletion failed:", error);
    }
  }

  function handleEventClick(info) {
    let details = `Task: ${info.event.title}\n`;
    details += `Description: ${
      info.event.extendedProps.description || "No description"
    }\n`;
    details += `Priority: ${info.event.extendedProps.priority}\n`;
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
