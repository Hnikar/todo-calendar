document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus();
  initializeAuthForm();
});

document.getElementById('mobileMenu')?.addEventListener('click', () => {
  const nav = document.getElementById('nav');
  nav.style.display = nav.style.display === 'none' ? 'flex' : 'none';
});

document.getElementById('btn-logout')?.addEventListener('click', logout);
// Инициализация формы аутентификации
function initializeAuthForm() {
  const authForm = document.getElementById("authForm");
  if (!authForm) return;

  authForm.addEventListener("submit", handleAuthSubmit);
  switchMode('login');

  // Добавляем обработчики для переключения вкладок
  document.querySelectorAll('[data-mode]').forEach(tab => {
    tab.addEventListener('click', () => switchMode(tab.dataset.mode));
  });
}

// Переключение между режимами логина и регистрации
function switchMode(mode) {
  const nameField = document.getElementById('nameField');
  const tabs = document.querySelectorAll('.tab');

  // Переключение видимости поля имени
  if (nameField) {
    nameField.style.display = mode === 'register' ? 'block' : 'none';
  }

  // Обновление активных вкладок
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });

  // Обновление текста кнопки submit
  const submitButton = document.querySelector('#authForm button[type="submit"]');
  if (submitButton) {
    submitButton.textContent = mode === 'login' ? 'Login' : 'Register';
  }
}

// Обработка отправки формы
async function handleAuthSubmit(e) {
  e.preventDefault();
  toggleLoader(true);
  clearMessages();

  const isLoginMode = document.querySelector('[data-mode="login"]').classList.contains('active');
  const url = isLoginMode ? "/api/login" : "/api/register";

  const formData = {
    email: getInputValue('email'),
    password: getInputValue('password')
  };

  if (!isLoginMode) {
    formData.name = getInputValue('name');
  }

  try {
    // Валидация полей
    validateFormData(formData, isLoginMode);

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const data = await handleResponse(response);

    if (isLoginMode) {
      handleLoginSuccess(data);
    } else {
      handleRegistrationSuccess();
    }
  } catch (error) {
    showError(error.message);
  } finally {
    toggleLoader(false);
  }
}

// Проверка статуса аутентификации
function checkAuthStatus() {
  const token = localStorage.getItem("jwtToken");
  const currentPath = window.location.pathname;
  const authPages = ["/", "/login", "/register"];
  const protectedPages = ["/calendar"];

  if (token) {
    if (authPages.includes(currentPath)) {
      window.location.href = "/calendar";
    }
  } else {
    if (protectedPages.some(page => currentPath.startsWith(page))) {
      window.location.href = "/login";
    }
  }
}

// Вспомогательные функции
function getInputValue(id) {
  const input = document.getElementById(id);
  return input ? input.value.trim() : '';
}

function validateFormData(data, isLoginMode) {
  const errors = [];

  if (!data.email) errors.push("Email is required");
  if (!data.password) errors.push("Password is required");
  if (!isLoginMode && !data.name) errors.push("Name is required");
  if (data.password.length < 8) errors.push("Password must be at least 8 characters");

  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
}

async function handleResponse(response) {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || `HTTP error! status: ${response.status}`);
  }

  return data;
}

function handleLoginSuccess(data) {
  localStorage.setItem("jwtToken", data.token);
  localStorage.setItem("user", JSON.stringify(data.user));
  window.location.href = "/calendar";
}

function handleRegistrationSuccess() {
  showSuccess("Registration successful! Please login.");
  switchMode('login');
  document.getElementById("authForm").reset();
}

function toggleLoader(show) {
  const loader = document.getElementById('loader') || createLoaderElement();
  loader.style.display = show ? 'block' : 'none';
}

function createLoaderElement() {
  const loader = document.createElement('div');
  loader.id = 'loader';
  loader.className = 'loader';
  loader.innerHTML = '<div class="spinner"></div>';
  document.body.appendChild(loader);
  return loader;
}

function clearMessages() {
  document.querySelectorAll('.error-message, .success-message').forEach(el => el.remove());
}

function showError(message) {
  const errorElement = document.createElement('div');
  errorElement.className = 'error-message';
  errorElement.textContent = message;
  appendMessage(errorElement);
}

function showSuccess(message) {
  const successElement = document.createElement('div');
  successElement.className = 'success-message';
  successElement.textContent = message;
  appendMessage(successElement);
}

function appendMessage(element) {
  const container = document.querySelector('.auth-form') || document.body;
  container.prepend(element);
  setTimeout(() => element.remove(), 5000);
}

function logout() {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("user");
  window.location.href = "/login";
}