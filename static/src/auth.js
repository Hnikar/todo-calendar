document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
  initializeAuthForm();
});

// Initialize form based on URL parameters
function initializeAuthForm() {
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get("mode") || "login";

  // Set initial form state
  if (mode === "register") {
    setupRegistrationForm();
  } else {
    setupLoginForm();
  }

  // Form submission handler
  document.getElementById("authForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const isRegister = window.location.search.includes("mode=register");

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (isRegister) {
      await handleRegistration(email, password);
    } else {
      await handleLogin(email, password);
    }
  });
}

function setupRegistrationForm() {
  document.getElementById("formTitle").textContent = "Sign Up";
  document.getElementById("submitButton").textContent = "Create Account";
  document.getElementById("toggleAuth").innerHTML =
    'Already have an account? <a href="#" onclick="switchMode(\'login\')">Log In</a>';
}

function setupLoginForm() {
  document.getElementById("formTitle").textContent = "Log In";
  document.getElementById("submitButton").textContent = "Sign In";
  document.getElementById("toggleAuth").innerHTML =
    'Don\'t have an account? <a href="#" onclick="switchMode(\'register\')">Sign Up</a>';
}

function switchMode(mode) {
  window.history.replaceState({}, "", `?mode=${mode}`);
  if (mode === "register") {
    setupRegistrationForm();
  } else {
    setupLoginForm();
  }
}

async function handleRegistration(email, password) {
  try {
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Registration successful! Please log in.");
      window.location.href = "/login";
    } else {
      showError(data.error || "Registration failed");
    }
  } catch (error) {
    showError("Network error. Please try again.");
  }
}

async function handleLogin(email, password) {
  try {
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("jwtToken", data.token);
      window.location.href = "/calendar";
    } else {
      showError(data.error || "Invalid credentials");
    }
  } catch (error) {
    showError("Network error. Please try again.");
  }
}

function checkAuthStatus() {
  const token = localStorage.getItem("jwtToken");
  const currentPath = window.location.pathname;

  // Redirect authenticated users away from auth pages
  if (token && (currentPath === "/login" || currentPath === "/register")) {
    window.location.href = "/calendar";
  }
  // Redirect unauthenticated users from protected pages
  else if (!token && !["/login", "/register"].includes(currentPath)) {
    window.location.href = "/login";
  }
}

function showError(message) {
  const errorElement = document.createElement("div");
  errorElement.className = "error-message";
  errorElement.textContent = message;

  const authForm = document.querySelector(".auth-form");
  authForm.prepend(errorElement);

  setTimeout(() => errorElement.remove(), 5000);
}

// For use in other pages
function logout() {
  localStorage.removeItem("jwtToken");
  window.location.href = "/login";
}
