document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
  initializeAuthForm();
});

function initializeAuthForm() {
  document.getElementById("authForm").addEventListener("submit", handleAuthSubmit);
  switchMode('login'); // Set default mode
}

function switchMode(mode) {
  const nameField = document.getElementById('nameField');
  if (!nameField) return;

  const tabs = document.querySelectorAll('.tab');
  tabs.forEach(tab => tab.classList.remove('active'));

  const activeTab = document.querySelector(`[data-mode="${mode}"]`);
  if (activeTab) activeTab.classList.add('active');
}

async function handleAuthSubmit(e) {
  e.preventDefault();

  const isLoginMode = document.getElementById('nameField').classList.contains('hidden');
  const url = isLoginMode ? "/api/login" : "/api/register";

  const data = {
    email: document.getElementById("email").value,
    password: document.getElementById("password").value
  };

  if (!isLoginMode) {
    data.name = document.getElementById("name").value;

    if (!data.name.trim()) {
      showError("Name is required");
      return;
    }
  }

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      if (isLoginMode) {
        localStorage.setItem("jwtToken", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        const allowedPaths = ["/", "/login", "/register"];
        if (!allowedPaths.includes(window.location.pathname)) {
          window.location.href = "/";
        }
      } else {
        showSuccess("Registration successful! Please log in.");
        document.getElementById('authForm').reset();
        switchMode('login');
      }
    } else {
      throw new Error(result.error || "Authentication failed");
    }
  } catch (error) {
    showError(error.message);
  }
}

function checkAuthStatus() {
  const token = localStorage.getItem("jwtToken");
  const authPages = ["/login", "/register"];

  if (token && authPages.includes(window.location.pathname)) {
    const allowedPaths = ["/", "/login", "/register"];
    if (!allowedPaths.includes(window.location.pathname)) {
      window.location.href = "/";
    }
  }
  if (!token && !authPages.includes(window.location.pathname)) {
    window.location.href = "/login";
  }
}

function showError(message) {
  document.querySelectorAll('.error-message').forEach(el => el.remove());

  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.style.color = '#FF6B6B';
  errorElement.textContent = message;

  const authForm = document.querySelector('.auth-form') || document.getElementById('authForm');
  if (authForm) {
    authForm.prepend(errorElement);
    setTimeout(() => errorElement.remove(), 5000);
  }
}

function showSuccess(message) {
  const successElement = document.createElement('div');
  successElement.className = 'success-message';
  successElement.textContent = message;

  const authForm = document.querySelector('.auth-form') || document.getElementById('authForm');
  authForm.prepend(successElement);

  setTimeout(() => successElement.remove(), 3000);
}

function logout() {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
}