
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

        // Пытаемся прочитать ответ, даже если он не ok
        const data = await response.json().catch(() => ({})); // Возвращаем {} если ответ не JSON

        // Проверяем статус ответа
        if (!response.ok) {
            // Используем сообщение об ошибке из ответа сервера, если оно есть
            throw new Error(data.error || `Logout request failed with status: ${response.status}`);
        }

        console.log("Logout successful via API.");

    } catch (error) {
        console.error("Logout API call failed:", error);
        // Можно показать сообщение пользователю, но редирект все равно нужен
        // alert(`Logout error: ${error.message}`);
    } finally {
        // Важно: Всегда выполняем этот блок
        localStorage.removeItem("user"); // Удаляем данные пользователя из localStorage
        console.log("User data removed from localStorage.");

        toggleLoader(false); // Скрываем лоадер

        // Перенаправляем на страницу входа
        window.location.href = "/login";
        console.log("Redirecting to /login");
    }
}

// --- Логика, выполняющаяся при загрузке страницы /app ---
document.addEventListener('DOMContentLoaded', () => {
    console.log("Main application page '/app' loaded.");
    displayUserData(); // Отображаем данные пользователя (имя и т.д.)

    // Назначаем обработчик кнопке выхода
    const logoutButton = document.getElementById('btn-logout');
    if (logoutButton) {
        logoutButton.addEventListener('click', logout); // При клике вызываем нашу функцию logout
        console.log("Logout button event listener attached.");
    } else {
        console.warn("Logout button (id='btn-logout') not found.");
    }

    // Назначаем обработчик кнопке загрузки событий (это твой пример)
    const fetchEventsButton = document.getElementById('fetchEventsBtn');
    if(fetchEventsButton) {
        fetchEventsButton.addEventListener('click', fetchAndDisplayEvents);
    }

    initializeMainApp(); // Вызываем функцию инициализации основного приложения
});

// --- Функция отображения данных пользователя ---
function displayUserData() {
    const userDataString = localStorage.getItem('user');
    let userName = 'Guest'; // Имя по умолчанию

    if (userDataString) {
        try {
            // Пытаемся распарсить данные пользователя из localStorage
            const userData = JSON.parse(userDataString);
            userName = userData.name || 'User'; // Берем имя или 'User' если имени нет
            console.log(`User data found: Welcome, ${userName}!`);
        } catch (e) {
            console.error("Failed to parse user data from localStorage:", e);
            // Если данные в localStorage невалидны, лучше разлогинить пользователя
            logout(); // Вызываем logout при ошибке парсинга
            return; // Прерываем выполнение функции, т.к. сейчас будет редирект
        }
    } else {
        // Этого не должно случиться на странице /app, если middleware работает правильно
        console.warn("User data not found in localStorage on main page. Possible issue with login flow or middleware.");
        // Можно показать 'Guest', но безопаснее разлогинить
        // logout();
    }

    // Находим элемент для отображения имени и вставляем его
    const userNameDisplay = document.getElementById('user-name-display');
    if (userNameDisplay) {
        userNameDisplay.textContent = userName;
        console.log(`Displayed user name: ${userName}`);
    } else {
        console.warn("Element with id='user-name-display' not found in index.html.");
    }
}

// --- Функция инициализации основного приложения (календаря и т.д.) ---
function initializeMainApp() {
    console.log("Initializing main calendar application components...");
    // Сюда добавляй код для:
    // - Инициализации библиотеки календаря (если используется)
    // - Загрузки событий при старте
    // - Настройки других интерактивных элементов
}

// --- Пример функции для загрузки событий ---
async function fetchAndDisplayEvents() {
    const outputDiv = document.getElementById('eventsOutput');
    if (!outputDiv) return; // Выходим, если нет элемента для вывода

    outputDiv.innerHTML = 'Loading events...'; // Показываем сообщение о загрузке
    toggleLoader(true); // Используем общий лоадер

    try {
        // Отправляем GET запрос на API для получения событий
        const response = await fetch('/api/events', {
            method: 'GET',
            headers: {
                'Accept': 'application/json' // Ожидаем JSON
                // Authorization header не нужен, т.к. используем cookie
            }
        });

        // Проверяем статус ответа
        if (!response.ok) {
            // Пытаемся получить текст ошибки из JSON ответа
            const errorData = await response.json().catch(() => ({ error: `HTTP error! Status: ${response.status}` }));
            throw new Error(errorData.error || `HTTP error! Status: ${response.status}`);
        }

        // Получаем и обрабатываем события
        const events = await response.json();
        if (events && Array.isArray(events) && events.length > 0) {
            // Форматируем вывод JSON
            outputDiv.innerHTML = '<h4>Received Events:</h4><pre>' + JSON.stringify(events, null, 2) + '</pre>';
        } else {
            outputDiv.innerHTML = 'No events found for your account.'; // Сообщение, если событий нет
        }

    } catch (error) {
        console.error('Error fetching events:', error);
        // Показываем сообщение об ошибке
        outputDiv.innerHTML = `<p class="api-error-message">Error loading events: ${error.message}</p>`;
    } finally {
        toggleLoader(false); // Всегда скрываем лоадер после завершения запроса
    }
}