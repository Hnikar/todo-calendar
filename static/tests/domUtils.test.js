describe("DomUtils", () => {
  beforeEach(() => {
    // Set up our document body
    document.body.innerHTML =
      '<div id="messageContainer"></div>' + '<form id="authForm"></form>';
  });

  describe("clearMessages", () => {
    it("should clear messages from messageContainer", () => {
      document.getElementById("messageContainer").innerHTML =
        "<div class='error-message'>Error</div>";
      DomUtils.clearMessages();
      expect(document.getElementById("messageContainer").innerHTML).toBe("");
    });

    it("should remove error and success messages not in messageContainer", () => {
      const errorDiv = document.createElement("div");
      errorDiv.className = "error-message";
      document.body.appendChild(errorDiv);

      const successDiv = document.createElement("div");
      successDiv.className = "success-message";
      document.body.appendChild(successDiv);

      DomUtils.clearMessages();
      expect(document.body.contains(errorDiv)).toBe(false);
      expect(document.body.contains(successDiv)).toBe(false);
    });

    it("should do nothing if there are no messages", () => {
      document.body.innerHTML = "";
      expect(() => DomUtils.clearMessages()).not.toThrow();
    });
  });

  describe("showMessage", () => {
    it("should show an error message in messageContainer", () => {
      DomUtils.showMessage("Error occurred", "error");
      const messageElement = document.querySelector(".error-message");
      expect(messageElement).not.toBeNull();
      expect(messageElement.textContent).toBe("Error occurred");
    });

    it("should show a success message in messageContainer", () => {
      DomUtils.showMessage("Operation successful", "success");
      const messageElement = document.querySelector(".success-message");
      expect(messageElement).not.toBeNull();
      expect(messageElement.textContent).toBe("Operation successful");
    });

    it("should clear previous messages before showing a new one", () => {
      DomUtils.showMessage("First error", "error");
      DomUtils.showMessage("Second error", "error");
      const messageElements = document.querySelectorAll(".error-message");
      expect(messageElements.length).toBe(1);
      expect(messageElements[0].textContent).toBe("Second error");
    });

    it("should append message to messageContainer if it exists", () => {
      const container = document.getElementById("messageContainer");
      DomUtils.showMessage("Error occurred", "error");
      expect(container.children.length).toBe(1);
    });

    it("should prepend message to body if messageContainer does not exist and authForm exists", () => {
      const container = document.getElementById("messageContainer");
      container.remove();
      const form = document.getElementById("authForm");
      DomUtils.showMessage("Error occurred", "error");
      expect(form.previousElementSibling.className).toBe("error-message");
    });

    it("should prepend message to body if neither messageContainer nor authForm exists", () => {
      const container = document.getElementById("messageContainer");
      container.remove();
      const form = document.getElementById("authForm");
      form.remove();
      DomUtils.showMessage("Error occurred", "error");
      expect(document.body.firstElementChild.className).toBe("error-message");
    });
  });

  describe("showError", () => {
    it("should show an error message", () => {
      DomUtils.showError("An error occurred");
      const messageElement = document.querySelector(".error-message");
      expect(messageElement).not.toBeNull();
      expect(messageElement.textContent).toBe("An error occurred");
    });
  });

  describe("showSuccess", () => {
    it("should show a success message", () => {
      DomUtils.showSuccess("Operation successful");
      const messageElement = document.querySelector(".success-message");
      expect(messageElement).not.toBeNull();
      expect(messageElement.textContent).toBe("Operation successful");
    });
  });
});
