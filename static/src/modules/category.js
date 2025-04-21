export const Category = (() => {
  let catagories = [
    { name: "Personal", color: "#f56565" },
    { name: "Work", color: "#63b3ed" },
    { name: "Catagory 1", color: "#f6e05e" },
  ];

  document.addEventListener("DOMContentLoaded", function () {
    const catagorySelect = document.getElementById("catagory");
    const catagoriesContainer = document.getElementById("catagories-container");
    const addNewCatagoryBtn = document.getElementById("add-new-catagory-btn");
    const newCatagoryForm = document.getElementById("new-catagory-form");
    const createCatagoryBtn = document.getElementById("create-catagory-btn");

    // Initialize catagories from localStorage or default
    const savedCatagories = JSON.parse(
      localStorage.getItem("calendarCatagories")
    );
    if (savedCatagories && savedCatagories.length > 0) {
      catagories = savedCatagories;
    }

    // Render catagories and update select
    renderCatagories();
    updateCatagorySelect();

    // Catagory management
    addNewCatagoryBtn.addEventListener("click", () => {
      newCatagoryForm.style.display =
        newCatagoryForm.style.display === "none" ? "flex" : "none";
    });

    createCatagoryBtn.addEventListener("click", () => {
      const name = document.getElementById("new-catagory-name").value.trim();
      const color = document.getElementById("new-catagory-color").value;

      if (name) {
        // Add new catagory
        catagories.push({ name, color });
        saveCatagories();
        renderCatagories();
        updateCatagorySelect();

        // Reset form
        document.getElementById("new-catagory-name").value = "";
        document.getElementById("new-catagory-color").value = "#cccccc";
        newCatagoryForm.style.display = "none";
      }
    });

    // Helper functions
    function renderCatagories() {
      catagoriesContainer.innerHTML = "";

      catagories.forEach((catagory, index) => {
        const li = document.createElement("li");
        li.className = "catagory-item";
        li.innerHTML = `
            <div class="catagory-content">
              <span class="catagory-color" style="background-color: ${catagory.color};"></span> 
              <span class="catagory-name">${catagory.name}</span>
            </div>
            <button class="delete-catagory-btn" data-index="${index}">
              <i class="fas fa-trash"></i>
            </button>
          `;
        catagoriesContainer.appendChild(li);
      });

      // Add event listeners to delete buttons
      document.querySelectorAll(".delete-catagory-btn").forEach((btn) => {
        btn.addEventListener("click", (e) => {
          e.stopPropagation();
          const index = parseInt(btn.dataset.index);
          deleteCatagory(index);
        });
      });

      // Add the "Add New Catagory" button and form back
      catagoriesContainer.appendChild(addNewCatagoryBtn);
      catagoriesContainer.appendChild(newCatagoryForm);
    }

    function deleteCatagory(index) {
      if (index >= 0 && index < catagories.length) {
        // Remove the catagory
        const deletedCatagoryName = catagories[index].name;
        catagories.splice(index, 1);
        saveCatagories();

        // Update tasks that were using this catagory
        let tasks = JSON.parse(localStorage.getItem("calendarTasks")) || [];
        tasks = tasks.map((task) => {
          if (task.extendedProps?.catagory === deletedCatagoryName) {
            return {
              ...task,
              extendedProps: {
                ...task.extendedProps,
                catagory: null,
              },
            };
          }
          return task;
        });
        localStorage.setItem("calendarTasks", JSON.stringify(tasks));

        // Re-render the calendar (Note: Calendar is in Todo module, so we rely on UI update)
        renderCatagories();
        updateCatagorySelect();
      }
    }

    function updateCatagorySelect() {
      catagorySelect.innerHTML = "";

      // Add "None" option first
      const noneOption = document.createElement("option");
      noneOption.value = "None";
      noneOption.textContent = "None";
      catagorySelect.appendChild(noneOption);

      // Add all catagory options
      catagories.forEach((catagory) => {
        const option = document.createElement("option");
        option.value = catagory.name;
        option.textContent = catagory.name;
        catagorySelect.appendChild(option);
      });
    }

    function saveCatagories() {
      localStorage.setItem("calendarCatagories", JSON.stringify(catagories));
    }
  });

  return {
    getCatagories: () => catagories,
    renderCatagories: () => renderCatagories(),
    updateCatagorySelect: () => updateCatagorySelect(),
  };
})();
