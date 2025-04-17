document.addEventListener("DOMContentLoaded", () => {
  initializeAuthForm();
  checkForRedirectReason();
});

function initializeAuthForm() {
  const authForm = document.getElementById("authForm");
  if (!authForm) {
    console.error("Auth form not found!");
    return;
  }
  authForm.addEventListener("submit", handleAuthSubmit);
  switchMode('login');
  document.querySelectorAll('[data-mode]').forEach(tab => {
    tab.addEventListener('click', () => switchMode(tab.dataset.mode));
  });
}

function checkForRedirectReason() {
  const params = new URLSearchParams(window.location.search);
  const reason = params.get('reason');
  if (reason) {
    let message = "An issue occurred. Please log in.";
    switch (reason) {
      case 'unauthenticated':
        message = "Please log in to access the application.";
        break;
      case 'invalid_token':
        message = "Your session is invalid or expired. Please log in again.";
        break;
      case 'bad_token_claims':
        message = "There was an issue with your session data. Please log in again.";
        break;
    }
    showError(message);
    window.history.replaceState(null, '', window.location.pathname);
  }
}

function switchMode(mode) {
  const nameField = document.getElementById('nameField');
  const tabs = document.querySelectorAll('.tab');
  const submitButton = document.querySelector('#authForm button[type="submit"]');
  const passwordInput = document.getElementById('password');

  if (nameField) {
    nameField.style.display = mode === 'register' ? 'block' : 'none';
    // Устанавливаем required только для регистрации
    document.getElementById('name').required = (mode === 'register');
  }
  tabs.forEach(tab => {
    tab.classList.toggle('active', tab.dataset.mode === mode);
  });
  if (submitButton) {
    submitButton.textContent = mode === 'login' ? 'Login' : 'Register';
  }
  // Меняем autocomplete для пароля
  if(passwordInput) {
    passwordInput.autocomplete = (mode === 'login') ? 'current-password' : 'new-password';
  }
  clearMessages();
}

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
    validateFormData(formData, isLoginMode);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(formData)
    });
    await handleResponse(response, isLoginMode);
  } catch (error) {
    showError(error.message || "An unexpected error occurred during submission.");
  } finally {
    toggleLoader(false);
  }
}

function getInputValue(id) {
  const input = document.getElementById(id);
  return input ? input.value.trim() : '';
}

function validateFormData(data, isLoginMode) {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email) {
    errors.push("Email is required.");
  } else if (!emailRegex.test(data.email)) {
    errors.push("Please enter a valid email address.");
  }
  if (!data.password) {
    errors.push("Password is required.");
  } else if (data.password.length < 8 && !isLoginMode) {
    errors.push("Password must be at least 8 characters long.");
  }
  if (!isLoginMode && !data.name) {
    errors.push("Name is required for registration.");
  } else if (!isLoginMode && data.name.length < 2) {
    errors.push("Name must be at least 2 characters long.");
  }
  if (errors.length > 0) {
    throw new Error(errors.join("\n"));
  }
}

async function handleResponse(response, isLoginMode) {
  let data = {}; // Инициализируем пустым объектом
  try {
    // Проверяем Content-Type перед парсингом JSON
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json(); // Парсим JSON, если он есть
    } else {
      // Если не JSON, читаем как текст (на случай текстовых ошибок от сервера)
      const textResponse = await response.text();
      if (!response.ok) { throw new Error(textResponse || `Server error: ${response.status}`); }
      // Если ответ OK, но не JSON - можно просто вернуть сообщение
      data = { message: textResponse || "Operation successful, but no JSON data returned." };
    }
  } catch (e) {
    console.error("Error parsing response:", e);
    if (!response.ok) { throw new Error(`Server error: ${response.status}. Could not parse response body.`); }
    // Если ответ OK, но парсинг упал
    data = { message: "Operation successful, but failed to parse response." };
  }


  if (!response.ok) {
    throw new Error(data.error || `Request failed with status: ${response.status}`);
  }
  if (isLoginMode) {
    handleLoginSuccess(data);
  } else {
    handleRegistrationSuccess(data);
  }
}

function handleLoginSuccess(data) {
  if (data.user) {
    localStorage.setItem("user", JSON.stringify(data.user));
    console.log("User data saved to localStorage:", data.user);
  } else {
    console.warn("User data not received on login success.");
    // Можно попытаться извлечь из cookie, но это не стандартно
  }
  console.log("Login successful, redirecting to /app");
  window.location.href = "/app";
}

function handleRegistrationSuccess(data) {
  showSuccess(data.message || "Registration successful! Please login.");
  switchMode('login');

  const emailInput = document.getElementById("email");
  if (emailInput) emailInput.value = '';
  const passwordInput = document.getElementById("password");
  if (passwordInput) passwordInput.value = '';
  const nameInput = document.getElementById("name");
  if (nameInput) nameInput.value = '';
}

function toggleLoader(show) {
  let loader = document.getElementById('loader');
  if (!loader && show) {
    loader = createLoaderElement();
  }
  if (loader) {
    loader.style.display = show ? 'flex' : 'none';
  }
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
  const container = document.getElementById('messageContainer');
  if(container) {
    container.innerHTML = ''; // Очищаем контейнер
  }
  // Убираем старые отдельные сообщения, если они были вне контейнера
  document.querySelectorAll('.error-message, .success-message').forEach(el => {
    if(el.parentNode !== container) {
      el.remove();
    }
  });
}


function showMessage(message, type = 'error') {
  clearMessages();
  const messageElement = document.createElement('div');
  messageElement.className = type === 'error' ? 'error-message' : 'success-message';
  // Разделяем сообщение по \n и создаем отдельные <p> для каждой строки
  message.split('\n').forEach(line => {
    const p = document.createElement('p');
    p.textContent = line;
    messageElement.appendChild(p);
  });

  const container = document.getElementById('messageContainer');
  if (container) {
    container.appendChild(messageElement);
  } else {
    // Fallback, если контейнера нет
    const form = document.getElementById('authForm');
    if (form) {
      form.parentNode.insertBefore(messageElement, form);
    } else {
      document.body.prepend(messageElement);
    }
  }

  // Автоматически НЕ убираем сообщение, пользователь должен видеть его
  // setTimeout(() => messageElement.remove(), 7000);
}


function showError(message) {
  showMessage(message, 'error');
}

function showSuccess(message) {
  showMessage(message, 'success');
}

// Функцию logout нужно будет определить глобально или импортировать в index.js
// Оставляем ее здесь для полноты, но вызов будет из index.js
async function logout() {
  console.log("Attempting logout...");
  toggleLoader(true);
  try {
    const response = await fetch('/api/logout', {
      method: 'POST',
      headers: {
        "Accept": "application/json",
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Logout failed with status: ${response.status}`);
    }
    console.log("Logout successful via API.");
  } catch (error) {
    console.error("Logout API call failed:", error);
    showError("Could not properly log out from server. Please clear your cookies manually if issues persist.");
  } finally {
    localStorage.removeItem("user");
    // Cookie очищается на сервере, здесь делать ничего не нужно
    toggleLoader(false);
    window.location.href = "/login";
  }
}