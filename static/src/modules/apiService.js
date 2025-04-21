import { Loader } from "./loader.js";
import { DomUtils } from "./domUtils.js";

export const ApiService = (() => {
  const API_BASE = "/api";

  async function handleRequest(url, method, data) {
    try {
      Loader.toggle(true);
      const response = await fetch(`${API_BASE}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: data ? JSON.stringify(data) : undefined,
      });

      if (response.status === 401) {
        window.location.href = "/login?reason=unauthenticated";
        return;
      }

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Request failed");
      }
      return responseData;
    } catch (error) {
      DomUtils.showError(error.message);
      throw error;
    } finally {
      Loader.toggle(false);
    }
  }

  return {
    // Task-related endpoints
    createTask: (task) => handleRequest("/tasks", "POST", task),
    updateTask: (id, task) => handleRequest(`/tasks/${id}`, "PUT", task),
    deleteTask: (id) => handleRequest(`/tasks/${id}`, "DELETE"),
    fetchTasks: () => handleRequest("/tasks", "GET"),
    // Category-related endpoints
    createCategory: (category) =>
      handleRequest("/categories", "POST", category),
    fetchCategories: () => handleRequest("/categories", "GET"),
    deleteCategory: (id) => handleRequest(`/categories/${id}`, "DELETE"),
    clearCategoryFromTasks: (categoryName) =>
      handleRequest(`/tasks/clear-category/${categoryName}`, "PATCH"),
  };
})();
