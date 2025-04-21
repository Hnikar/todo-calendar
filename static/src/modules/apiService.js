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
      console.log(responseData);
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
    createTask: (task) => handleRequest("/events", "POST", task),
    updateTask: (id, task) => handleRequest(`/events/${id}`, "PUT", task),
    deleteTask: (id) => handleRequest(`/events/${id}`, "DELETE"),
    fetchTasks: () => handleRequest("/events", "GET"),
    // Category-related endpoints
    createCategory: (category) =>
      handleRequest("/categories", "POST", category),
    fetchCategories: () => handleRequest("/categories", "GET"),
    deleteCategory: (id) => handleRequest(`/categories/${id}`, "DELETE"),
  };
})();