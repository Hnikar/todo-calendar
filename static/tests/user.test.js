import { User } from "../src/modules/user.js";
import { Loader } from "../src/modules/loader.js";
import { DomUtils } from "../src/modules/domUtils.js";

describe("User Module", () => {
  describe("logout", () => {
    beforeEach(() => {
      // Mocking localStorage
      localStorage.removeItem("user");
      // Mocking console
      console.log = jest.fn();
      console.error = jest.fn();
      // Mocking Loader and DomUtils
      Loader.toggle = jest.fn();
      DomUtils.showError = jest.fn();
      // Mocking fetch
      global.fetch = jest.fn();
    });

    it("should successfully log out and redirect to login page", async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });

      await User.logout();

      expect(console.log).toHaveBeenCalledWith("Attempting logout...");
      expect(Loader.toggle).toHaveBeenCalledWith(true);
      expect(fetch).toHaveBeenCalledWith("/api/logout", {
        method: "POST",
        headers: { Accept: "application/json" },
      });
      expect(console.log).toHaveBeenCalledWith("Logout successful via API.");
      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
      expect(Loader.toggle).toHaveBeenCalledWith(false);
      expect(window.location.href).toBe("/login");
    });

    it("should handle API error and show error message", async () => {
      fetch.mockResolvedValue({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ error: "Bad Request" }),
      });

      await User.logout();

      expect(console.error).toHaveBeenCalledWith(
        "Logout API call failed:",
        "Bad Request"
      );
      expect(DomUtils.showError).toHaveBeenCalledWith(
        "Could not properly log out. Clear cookies manually if needed."
      );
      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
      expect(Loader.toggle).toHaveBeenCalledWith(false);
      expect(window.location.href).toBe("/login");
    });

    it("should handle network error and show error message", async () => {
      fetch.mockRejectedValue(new Error("Network Error"));

      await User.logout();

      expect(console.error).toHaveBeenCalledWith(
        "Logout API call failed:",
        new Error("Network Error")
      );
      expect(DomUtils.showError).toHaveBeenCalledWith(
        "Could not properly log out. Clear cookies manually if needed."
      );
      expect(localStorage.removeItem).toHaveBeenCalledWith("user");
      expect(Loader.toggle).toHaveBeenCalledWith(false);
      expect(window.location.href).toBe("/login");
    });
  });

  describe("displayUserData", () => {
    beforeEach(() => {
      // Mocking localStorage
      localStorage.removeItem("user");
      // Mocking console
      console.error = jest.fn();
      // Mocking document
      document.getElementById = jest.fn();
    });

    it("should display user data if valid data is in localStorage", () => {
      const userData = { name: "John Doe" };
      localStorage.setItem("user", JSON.stringify(userData));
      const userNameDisplay = { textContent: "" };
      document.getElementById.mockReturnValue(userNameDisplay);

      User.displayUserData();

      expect(userNameDisplay.textContent).toBe("John Doe");
    });

    it("should log out if no user data is in localStorage", () => {
      const logoutSpy = jest.spyOn(User, "logout");
      User.displayUserData();
      expect(logoutSpy).toHaveBeenCalled();
    });

    it("should log out if user data in localStorage is invalid", () => {
      localStorage.setItem("user", "invalid json");
      const logoutSpy = jest.spyOn(User, "logout");
      User.displayUserData();
      expect(console.error).toHaveBeenCalledWith(
        "Invalid user data in localStorage."
      );
      expect(logoutSpy).toHaveBeenCalled();
    });
  });
});
