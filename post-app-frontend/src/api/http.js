import { config } from '../config/config.js';
import { getToken, clearAuth } from '../utils/storage.js';

export async function request(endpoint, options = {}) {
    const token = getToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
        `${config.apiBaseUrl}${endpoint}`,
        {
            ...options,
            headers,
        }
    );

    let data = null;

    try {
        data = await response.json();
    } catch {
        data = null;
    }

    if (!response.ok) {

        // Only expired/invalid session should log out.
        // Login with wrong credentials also returns 401 and must show error.
        if (response.status === 401 && token) {
            clearAuth();

            window.location.href = '/login.html';
        }

        throw new Error(
            data?.message || 'Something went wrong'
        );
    }

    return data;
}