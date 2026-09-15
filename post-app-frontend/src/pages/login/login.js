import '../../main.js';

import { login } from '../../api/auth.api.js';
import { saveAuth } from '../../utils/storage.js';

const form = document.getElementById('login-form');
const button = document.getElementById('login-button');

form.addEventListener('submit', async (event) => {

    event.preventDefault();

    const email = document
        .getElementById('email')
        .value
        .trim();

    const password = document
        .getElementById('password')
        .value;

    button.disabled = true;
    button.textContent = 'Logging in...';

    try {

        const response = await login(
            email,
            password
        );

        saveAuth(response);

        window.location.href = '/posts.html';

    } catch (error) {

        showError(error.message);

    } finally {

        button.disabled = false;
        button.textContent = 'Login';

    }
});

function showError(message) {

    document.getElementById(
        'alert-container'
    ).innerHTML = `
        <div class="alert alert-danger">
            ${message}
        </div>
    `;
}