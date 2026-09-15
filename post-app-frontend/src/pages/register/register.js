import '../../main.js';

import { register } from '../../api/auth.api.js';

import {
    showSuccess,
    showError
} from '../../utils/alert.js';

const form = document.getElementById('register-form');

form.addEventListener('submit', async (event) => {

    event.preventDefault();

    const name = document
        .getElementById('name')
        .value
        .trim();

    const email = document
        .getElementById('email')
        .value
        .trim();

    const password = document
        .getElementById('password')
        .value;

    try {

        await register(
            name,
            email,
            password
        );

        showSuccess(
            'Registration successful. Redirecting to login...'
        );

        setTimeout(() => {
            window.location.href = '/login.html';
        }, 1500);

    } catch (error) {

        showError(error.message);

    }
});
