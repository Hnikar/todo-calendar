import { Loader } from "./loader.js";
import { DomUtils } from "./domUtils.js";

export const ApiService = (() => {
  const API_BASE = "/api";

  async function handleRequest(url, method, data, options = {}) {
    const { showLoader = true } = options;
    try {
      if (showLoader) Loader.toggle(true);
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
      if (showLoader) Loader.toggle(false);
    }
  }

  return {
    // Task-related endpoints
    createTask: (task, options) => {
      const { priority, ...rest } = task;
      return handleRequest("/events", "POST", rest, options);
    },
    updateTask: (id, task, options) => {
      const { priority, ...rest } = task;
      return handleRequest(`/events/${id}`, "PUT", rest, options);
    },
    deleteTask: (id, options) =>
      handleRequest(`/events/${id}`, "DELETE", undefined, options),
    fetchTasks: (options) =>
      handleRequest("/events", "GET", undefined, options),
    // Category-related endpoints
    createCategory: (category, options) =>
      handleRequest("/categories", "POST", category, options),
    fetchCategories: (options) =>
      handleRequest("/categories", "GET", undefined, options),
    deleteCategory: (id, options) =>
      handleRequest(`/categories/${id}`, "DELETE", undefined, options),
  };
})();
