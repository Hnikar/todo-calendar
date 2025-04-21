import { ApiService } from "./apiService.js";

export const Category = (() => {
  let categories = [
    { name: "Personal", color: "#f56565" },
    { name: "Work", color: "#63b3ed" },
    { name: "Category 1", color: "#f6e05e" },
  ];

  // Helper functions defined outside DOMContentLoaded
  function renderCategories() {
    const categoriesContainer = document.getElementById("categories-container");
    const addNewCategoryBtn = document.getElementById("add-new-category-btn");
    const newCategoryForm = document.getElementById("new-category-form");

    categoriesContainer.innerHTML = "";

    categories.forEach((category, index) => {
      const li = document.createElement("li");
      li.className = "category-item";
      li.innerHTML = `
          <div class="category-content">
            <span class="category-color" style="background-color: ${category.color};"></span> 
            <span class="category-name">${category.name}</span>
          </div>
          <button class="delete-category-btn" data-index="${index}">
            <i class="fas fa-trash"></i>
          </button>
        `;
      categoriesContainer.appendChild(li);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-category-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        deleteCategory(index);
      });
    });

    // Add the "Add New Category" button and form back
    categoriesContainer.appendChild(addNewCategoryBtn);
    categoriesContainer.appendChild(newCategoryForm);
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

  async function deleteCategory(index) {
    if (index >= 0 && index < categories.length) {
      try {
        const deletedCategoryName = categories[index].name;
        // Delete category via API
        await ApiService.deleteCategory(categories[index].id);
        categories.splice(index, 1);

        // Update tasks that were using this category
        await ApiService.clearCategoryFromTasks(deletedCategoryName);

        renderCategories();
        updateCategorySelect();
      } catch (error) {
        console.error("Failed to delete category:", error);
      }
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    const categorySelect = document.getElementById("category");
    const categoriesContainer = document.getElementById("categories-container");
    const addNewCategoryBtn = document.getElementById("add-new-category-btn");
    const newCategoryForm = document.getElementById("new-category-form");
    const createCategoryBtn = document.getElementById("create-category-btn");

    // Fetch categories from API
    async function initializeCategories() {
      try {
        categories = await ApiService.fetchCategories();
        renderCategories();
        updateCategorySelect();
      } catch (error) {
        console.error("Failed to fetch categories:", error);
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
          const newCategory = await ApiService.createCategory({ name, color });
          categories.push(newCategory);
          renderCategories();
          updateCategorySelect();

          // Reset form
          document.getElementById("new-category-name").value = "";
          document.getElementById("new-category-color").value = "#cccccc";
          newCategoryForm.style.display = "none";
        } catch (error) {
          console.error("Failed to create category:", error);
        }
      }
    });
  });

  return {
    getCategories: () => categories,
    renderCategories,
    updateCategorySelect,
  };
})();
