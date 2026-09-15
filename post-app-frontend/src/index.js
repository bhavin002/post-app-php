import { isAuthenticated } from './utils/storage.js';

window.location.replace(
    isAuthenticated() ? '/posts.html' : '/login.html'
);
