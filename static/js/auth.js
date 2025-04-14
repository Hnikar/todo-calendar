// auth.js - Authentication logic for registration and login

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus(); // Redirect if already logged in

    // Registration form handler
    if (document.getElementById('registerForm')) {
        document.getElementById('registerForm').addEventListener('submit', handleRegistration);
    }

    // Login form handler
    if (document.getElementById('loginForm')) {
        document.getElementById('loginForm').addEventListener('submit', handleLogin);
    }
});

// Handle user registration
async function handleRegistration(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Registration successful! Please log in.');
            window.location.href = '/login';
        } else {
            showError(data.error || 'Registration failed');
        }
    } catch (error) {
        showError('Network error. Please try again.');
    }
}

// Handle user login
async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('jwtToken', data.token);
            window.location.href = '/calendar';
        } else {
            showError(data.error || 'Invalid credentials');
        }
    } catch (error) {
        showError('Network error. Please try again.');
    }
}

// Check authentication status
function checkAuthStatus() {
    const token = localStorage.getItem('jwtToken');
    const currentPath = window.location.pathname;

    if (token && (currentPath === '/login' || currentPath === '/register')) {
        window.location.href = '/calendar';
    } else if (!token && currentPath !== '/login' && currentPath !== '/register') {
        window.location.href = '/login';
    }
}

// Display error messages
function showError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = message;

    const authForm = document.querySelector('.auth-form');
    authForm.prepend(errorElement);

    setTimeout(() => errorElement.remove(), 5000);
}

// Logout functionality (add to other pages later)
function logout() {
    localStorage.removeItem('jwtToken');
    window.location.href = '/login';
}