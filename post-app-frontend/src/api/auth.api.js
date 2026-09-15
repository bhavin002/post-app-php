import { request } from './http.js';

export function login(email, password) {
    return request('/login', {
        method: 'POST',

        body: JSON.stringify({
            email,
            password,
        }),
    });
}

export function register(name, email, password) {
    return request('/register', {
        method: 'POST',

        body: JSON.stringify({
            name,
            email,
            password,
        }),
    });
}