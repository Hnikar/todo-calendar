// api.service.js
import { Loader } from "./loader.js";
import { DomUtils } from "./domUtils.js";

export const ApiService = (() => {
  const API_BASE = "/api";
  const getAuthHeader = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    return user?.token ? { Authorization: `Bearer ${user.token}` } : {};
  };

  async function handleRequest(url, method, data) {
    try {
      Loader.toggle(true);
      const response = await fetch(`${API_BASE}${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader(),
        },
        body: data ? JSON.stringify(data) : undefined,
      });

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
    createTask: (task) => handleRequest("/tasks", "POST", task),
    updateTask: (id, task) => handleRequest(`/tasks/${id}`, "PUT", task),
    deleteTask: (id) => handleRequest(`/tasks/${id}`, "DELETE"),
    fetchTasks: () => handleRequest("/tasks", "GET"),
  };
})();
