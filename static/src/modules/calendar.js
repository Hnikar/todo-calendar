export const Todo = (() => {
  let currentEditingTask = null;
  let isEditing = false;
  let lists = [
    { name: "Personal", color: "#f56565" },
    { name: "Work", color: "#63b3ed" },
    { name: "List 1", color: "#f6e05e" },
  ];

  document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("task-form");
    const formHeading = document.getElementById("form-heading");
    const submitButton = document.getElementById("submit-button");
    const deleteButton = document.getElementById("delete-button");
    const cancelButton = document.getElementById("cancel-button");
    const addTaskButton = document.querySelector(
      ".content-header-container > button"
    );
    const categorySelect = document.getElementById("category");
    const listsContainer = document.getElementById("lists-container");
    const addNewListBtn = document.getElementById("add-new-list-btn");
    const newListForm = document.getElementById("new-list-form");
    const createListBtn = document.getElementById("create-list-btn");

    // Initialize tasks from localStorage
    let tasks = JSON.parse(localStorage.getItem("calendarTasks")) || [];

    // Initialize lists from localStorage or default
    const savedLists = JSON.parse(localStorage.getItem("calendarLists"));
    if (savedLists && savedLists.length > 0) {
      lists = savedLists;
    }

    // Render lists
    renderLists();
    updateCategorySelect();

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

        // Apply category color
        const category = info.event.extendedProps.category;
        if (category && category !== "None") {
          const list = lists.find((l) => l.name === category);
          if (list) {
            info.el.style.borderLeft = `4px solid ${list.color}`;
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

    // List management
    addNewListBtn.addEventListener("click", () => {
      newListForm.style.display =
        newListForm.style.display === "none" ? "flex" : "none";
    });

    createListBtn.addEventListener("click", () => {
      const name = document.getElementById("new-list-name").value.trim();
      const color = document.getElementById("new-list-color").value;

      if (name) {
        // Add new list
        lists.push({ name, color });
        saveLists();
        renderLists();
        updateCategorySelect();

        // Reset form
        document.getElementById("new-list-name").value = "";
        document.getElementById("new-list-color").value = "#cccccc";
        newListForm.style.display = "none";
      }
    });

    // Helper functions
    function renderLists() {
      listsContainer.innerHTML = "";

      lists.forEach((list, index) => {
        const li = document.createElement("li");
        li.className = "list-item";
        li.innerHTML = `
          <div class="list-content">
            <span class="list-color" style="background-color: ${list.color};"></span> 
            <span class="list-name">${list.name}</span>
          </div>
          <button class="delete-list-btn" data-index="${index}">
            <i class="fas fa-trash"></i>
          </button>
        `;
        listsContainer.appendChild(li);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-list-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const index = parseInt(btn.dataset.index);
          deleteList(index);
        });
      });

      // Add the "Add New List" button back
      listsContainer.appendChild(addNewListBtn);
      listsContainer.appendChild(newListForm);
    }

    function deleteList(index) {
      if (index >= 0 && index < lists.length) {
        // Remove the list
        lists.splice(index, 1);
        saveLists();

        // Update tasks that were using this category
        tasks = tasks.map((task) => {
          if (task.extendedProps?.category === lists[index]?.name) {
            return {
              ...task,
              extendedProps: {
                ...task.extendedProps,
                category: null,
              },
            };
          }
          return task;
        });
        saveTasks();

        // Re-render the calendar to update the events
        calendar.removeAllEvents();
        calendar.addEventSource(tasks);

        // Update the UI
        renderLists();
        updateCategorySelect();
      }
    }

    function updateCategorySelect() {
      categorySelect.innerHTML = "";

      // Add "None" option first
      const noneOption = document.createElement("option");
      noneOption.value = "None";
      noneOption.textContent = "None";
      categorySelect.appendChild(noneOption);

      // Add all list categories
      lists.forEach((list) => {
        const option = document.createElement("option");
        option.value = list.name;
        option.textContent = list.name;
        categorySelect.appendChild(option);
      });
    }

    function saveLists() {
      localStorage.setItem("calendarLists", JSON.stringify(lists));
    }

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
        id: isEditing ? currentEditingTask.id : Date.now().toString(),
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
})();