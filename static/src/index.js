document.addEventListener('DOMContentLoaded', () => {
    console.log("Main application page '/app' loaded.");
    displayUserData(); // Отображаем данные пользователя

    // Назначаем обработчик кнопке выхода
    const logoutButton = document.getElementById('btn-logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout); // Используем функцию logout
    } else {
        console.warn("Logout button (id='btn-logout') not found.");
    }

    // Назначаем обработчик кнопке загрузки событий (пример)
    const fetchEventsButton = document.getElementById('fetchEventsBtn');
    if(fetchEventsButton) {
        fetchEventsButton.addEventListener('click', fetchAndDisplayEvents);
    }

    initializeMainApp(); // Инициализация остальной части приложения
});

function displayUserData() {
    const userDataString = localStorage.getItem('user');
    let userName = 'Guest'; // Имя по умолчанию

    if (userDataString) {
        try {
            const userData = JSON.parse(userDataString);
            userName = userData.name || 'User';
            console.log(`Welcome, ${userName}!`);
        } catch (e) {
            console.error("Failed to parse user data from localStorage:", e);
            // Если данные в localStorage повреждены, лучше разлогинить
            logout(); // Вызываем logout при ошибке парсинга
            return; // Прерываем выполнение функции
        }
    } else {
        // Если данных нет, хотя страница /app загрузилась - это странно
        console.warn("User data not found in localStorage on main page. Server might not have sent it or middleware failed.");
        // В production можно или показать 'Guest' или вызвать logout()
        // logout();
    }

    // Отображаем имя пользователя
    const userNameDisplay = document.getElementById('user-name-display');
    if (userNameDisplay) {
        userNameDisplay.textContent = userName;
    }
}

function initializeMainApp() {
    console.log("Initializing main calendar application components...");
    // Здесь будет твоя логика:
    // - Инициализация календаря (если используешь библиотеку)
    // - Настройка обработчиков событий для календаря
    // - Загрузка категорий/тегов и т.д.
}

// Пример функции для загрузки событий
async function fetchAndDisplayEvents() {
    const outputDiv = document.getElementById('eventsOutput');
    const loader = document.getElementById('loader'); // Используем тот же лоадер
    if (!outputDiv) return;

    outputDiv.innerHTML = 'Loading events...';
    if(loader) loader.style.display = 'flex';

    try {
        const response = await fetch('/api/events', {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                // 'Authorization': 'Bearer ' + token // Не нужно, cookie используется
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: `HTTP error! Status: ${response.status}` }));
            throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }

        const events = await response.json();

        if (events && events.length > 0) {
            outputDiv.innerHTML = '<pre>' + JSON.stringify(events, null, 2) + '</pre>';
        } else {
            outputDiv.innerHTML = 'No events found.';
        }

    } catch (error) {
        console.error('Error fetching events:', error);
        outputDiv.innerHTML = `Error loading events: ${error.message}`;
    } finally {
        if(loader) loader.style.display = 'none';
    }
}

// Убедись, что функция logout из auth.js доступна здесь
// Если используешь модули: import { logout } from './auth.js';
// Если просто подключаешь скрипты: она должна быть глобальной.