import { ApiService } from "./apiService.js";

export const Category = (() => {
  let categories = [
    { id: "default_1", name: "Personal", color: "#f56565" },
    { id: "default_2", name: "Work", color: "#63b3ed" },
    { id: "default_3", name: "Category 1", color: "#f6e05e" },
  ];

  // Local Storage Service for Categories
  const LocalStorageService = {
    getCategories() {
      const categories = localStorage.getItem("categories");
      return categories ? JSON.parse(categories) : [];
    },
    saveCategory(category) {
      const categories = this.getCategories();
      categories.push(category);
      localStorage.setItem("categories", JSON.stringify(categories));
      return category;
    },
    deleteCategory(id) {
      const categories = this.getCategories();
      const updatedCategories = categories.filter((c) => c.id !== id);
      localStorage.setItem("categories", JSON.stringify(updatedCategories));
      // Update tasks to clear deleted category
      this.clearCategoryFromTasks(id);
    },
    clearCategoryFromTasks(categoryId) {
      const tasks = JSON.parse(localStorage.getItem("tasks") || "[]");
      const updatedTasks = tasks.map((task) => {
        if (task.category === categoryId) {
          return { ...task, category: null };
        }
        return task;
      });
      localStorage.setItem("tasks", JSON.stringify(updatedTasks));
    },
    generateId() {
      return "local_cat_" + Math.random().toString(36).substr(2, 9); // Simple unique ID for local categories
    },
  };

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
          <button class="delete-category-btn" data-id="${category.id}">
            <i class="fas fa-trash"></i>
          </button>
        `;
      categoriesContainer.appendChild(li);
    });

    // Add event listeners to delete buttons
    document.querySelectorAll(".delete-category-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        deleteCategory(id);
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

  async function deleteCategory(id) {
    const index = categories.findIndex((c) => c.id === id);
    if (index >= 0) {
      try {
        const deletedCategoryName = categories[index].name;
        // Delete category via API
        await ApiService.deleteCategory(id);
        categories.splice(index, 1);
        // Update tasks via API
        await ApiService.clearCategoryFromTasks(deletedCategoryName);
        // Update localStorage as backup
        LocalStorageService.deleteCategory(id);
      } catch (error) {
        console.warn("Server unavailable, deleting from localStorage:", error);
        // Delete from local categories
        categories.splice(index, 1);
        LocalStorageService.deleteCategory(id);
      }
      renderCategories();
      updateCategorySelect();
    }
  }
  if (window.location.pathname === "/app") {
    document.addEventListener("DOMContentLoaded", function () {
      const categorySelect = document.getElementById("category");
      const categoriesContainer = document.getElementById(
        "categories-container"
      );
      const addNewCategoryBtn = document.getElementById("add-new-category-btn");
      const newCategoryForm = document.getElementById("new-category-form");
      const createCategoryBtn = document.getElementById("create-category-btn");

      // Fetch categories from API or localStorage
      async function initializeCategories() {
        try {
          categories = await ApiService.fetchCategories();
          renderCategories();
          updateCategorySelect();
          // Save server categories to localStorage as backup
          localStorage.setItem("categories", JSON.stringify(categories));
        } catch (error) {
          console.warn("Server unavailable, using localStorage:", error);
          categories = LocalStorageService.getCategories();
          renderCategories();
          updateCategorySelect();
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
          const newCategory = {
            id: LocalStorageService.generateId(),
            name,
            color,
          };
          try {
            // Add new category via API
            const apiCategory = await ApiService.createCategory({
              name,
              color,
            });
            categories.push(apiCategory);
            // Save to localStorage as backup
            LocalStorageService.saveCategory(apiCategory);
          } catch (error) {
            console.warn("Server unavailable, saving to localStorage:", error);
            categories.push(newCategory);
            LocalStorageService.saveCategory(newCategory);
          }
          renderCategories();
          updateCategorySelect();

          // Reset form
          document.getElementById("new-category-name").value = "";
          document.getElementById("new-category-color").value = "#cccccc";
          newCategoryForm.style.display = "none";
        }
      });
    });
  }
  return {
    getCategories: () => categories,
    renderCategories,
    updateCategorySelect,
  };
})();