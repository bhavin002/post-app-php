const TOKEN_KEY = 'post_app_token';
const USER_KEY = 'post_app_user';
const EXPIRY_KEY = 'post_app_token_expiry';

export function saveAuth(authData) {
    localStorage.setItem(TOKEN_KEY, authData.token);

    localStorage.setItem(
        USER_KEY,
        JSON.stringify(authData.user)
    );

    localStorage.setItem(
        EXPIRY_KEY,
        authData.expires_at
    );
}

export function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

export function getUser() {
    const user = localStorage.getItem(USER_KEY);

    return user ? JSON.parse(user) : null;
}

export function getExpiry() {
    return localStorage.getItem(EXPIRY_KEY);
}

export function clearAuth() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRY_KEY);
}

export function isAuthenticated() {
    return Boolean(getToken());
}