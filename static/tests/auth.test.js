import { Auth } from "../src/modules/auth.js";
import { DomUtils } from "../src/modules/domUtils.js";
import { Loader } from "../src/modules/loader.js";
import fetchMock from "fetch-mock";

// Mocking dependencies
jest.mock("../src/domUtils.js", () => ({
  clearMessages: jest.fn(),
  showError: jest.fn(),
  showSuccess: jest.fn(),
}));
jest.mock("../src/loader.js", () => ({
  toggle: jest.fn(),
}));

// Setting up a simple DOM structure for our tests
document.body.innerHTML = `
<div id="authForm">
  <input id="email" type="email">
  <input id="password" type="password">
  <input id="name" type="text">
  <button type="submit">Submit</button>
  <div class="tab" data-mode="login">Login</div>
  <div class="tab" data-mode="register">Register</div>
</div>
<div id="nameField"></div>
`;

describe("Auth Module", () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    fetchMock.reset();
    document.querySelector('[data-mode="login"]').classList.add("active");
  });

  describe("init", () => {
    it("should initialize the form and switch to login mode", () => {
      Auth.init();
      expect(document.getElementById("nameField").style.display).toBe("none");
      expect(
        document
          .querySelector('[data-mode="login"]')
          .classList.contains("active")
      ).toBe(true);
    });
  });

  describe("switchMode", () => {
    it("should switch to register mode", () => {
      switchMode("register");
      expect(document.getElementById("nameField").style.display).toBe("block");
      expect(
        document
          .querySelector('[data-mode="register"]')
          .classList.contains("active")
      ).toBe(true);
    });

    it("should switch to login mode", () => {
      switchMode("login");
      expect(document.getElementById("nameField").style.display).toBe("none");
      expect(
        document
          .querySelector('[data-mode="login"]')
          .classList.contains("active")
      ).toBe(true);
    });
  });

  describe("handleSubmit", () => {
    it("should handle login submission", async () => {
      fetchMock.post("/api/login", { status: 200, body: { user: {} } });
      document.getElementById("email").value = "test@example.com";
      document.getElementById("password").value = "password";
      await handleSubmit(new Event("submit"));
      expect(localStorage.getItem("user")).toBe("{}");
      expect(window.location.href).toBe("/app");
    });

    it("should handle registration submission", async () => {
      fetchMock.post("/api/register", {
        status: 200,
        body: { message: "Registration successful." },
      });
      document.getElementById("email").value = "test@example.com";
      document.getElementById("password").value = "password";
      document.getElementById("name").value = "Test User";
      switchMode("register");
      await handleSubmit(new Event("submit"));
      expect(DomUtils.showSuccess).toHaveBeenCalledWith(
        "Registration successful. Please login."
      );
    });

    it("should show an error on invalid submission", async () => {
      document.getElementById("email").value = "invalid";
      document.getElementById("password").value = "pass";
      await handleSubmit(new Event("submit"));
      expect(DomUtils.showError).toHaveBeenCalled();
    });
  });

  describe("validate", () => {
    it("should validate a valid login", () => {
      expect(() =>
        validate({ email: "test@example.com", password: "password" }, true)
      ).not.toThrow();
    });

    it("should validate a valid registration", () => {
      expect(() =>
        validate(
          { email: "test@example.com", password: "password", name: "Test" },
          false
        )
      ).not.toThrow();
    });

    it("should throw an error on invalid login", () => {
      expect(() =>
        validate({ email: "invalid", password: "pass" }, true)
      ).toThrow();
    });

    it("should throw an error on invalid registration", () => {
      expect(() =>
        validate({ email: "invalid", password: "pass", name: "T" }, false)
      ).toThrow();
    });
  });

  describe("handleResponse", () => {
    it("should handle a successful login response", async () => {
      const response = new Response(JSON.stringify({ user: {} }), {
        status: 200,
      });
      await handleResponse(response, true);
      expect(localStorage.getItem("user")).toBe("{}");
      expect(window.location.href).toBe("/app");
    });

    it("should handle a successful registration response", async () => {
      const response = new Response(
        JSON.stringify({ message: "Registration successful." }),
        { status: 200 }
      );
      await handleResponse(response, false);
      expect(DomUtils.showSuccess).toHaveBeenCalledWith(
        "Registration successful. Please login."
      );
    });

    it("should handle an error response", async () => {
      const response = new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401 }
      );
      await expect(handleResponse(response, true)).rejects.toThrow(
        "Invalid credentials"
      );
    });
  });

  describe("checkRedirectReason", () => {
    it("should show an error message based on redirect reason", () => {
      history.pushState(null, "", "/login?reason=unauthenticated");
      checkRedirectReason();
      expect(DomUtils.showError).toHaveBeenCalledWith(
        "Please log in to access the application."
      );
    });
  });
});
