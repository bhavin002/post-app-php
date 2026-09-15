import { isAuthenticated } from '../utils/storage.js';

export function requireAuth() {

    if (!isAuthenticated()) {
        window.location.href = '/login.html';
    }

}