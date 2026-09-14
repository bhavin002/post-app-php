<?php

$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Remove project path
$requestUri = str_replace('/post-app/public', '', $requestUri);

$requestUri = rtrim($requestUri, '/');

if ($requestUri === '') {
    $requestUri = '/';
}

$authController = new AuthController($user);
$postController = new PostController($post);
$authMiddleware = new AuthMiddleware($pdo);

// Register user
if ($requestMethod === 'POST' && $requestUri === '/api/register') {
    $authController->register();
    exit;
}

// Login user
if ($requestMethod === 'POST' && $requestUri === '/api/login') {
    $authController->login();
    exit;
}

// Get logged-in user's posts
if ($requestMethod === 'GET' && $requestUri === '/api/posts') {
    $userId = $authMiddleware->authenticate();
    $postController->index($userId);
    exit;
}

// Create post for logged-in user
if ($requestMethod === 'POST' && $requestUri === '/api/posts') {
    $userId = $authMiddleware->authenticate();
    $postController->create($userId);
    exit;
}

// Get logged-in user's single post
if (
    $requestMethod === 'GET' &&
    preg_match('#^/api/posts/([0-9]+)$#', $requestUri, $matches)
) {
    $postId = (int) $matches[1];
    $userId = $authMiddleware->authenticate();
    $postController->show($postId, $userId);
    exit;
}

// Update logged-in user's post
if (
    $requestMethod === 'PUT' &&
    preg_match('#^/api/posts/([0-9]+)$#', $requestUri, $matches)
) {
    $postId = (int) $matches[1];
    $userId = $authMiddleware->authenticate();
    $postController->update($postId, $userId);
    exit;
}

// Delete logged-in user's post
if (
    $requestMethod === 'DELETE' &&
    preg_match('#^/api/posts/([0-9]+)$#', $requestUri, $matches)
) {
    $postId = (int) $matches[1];
    $userId = $authMiddleware->authenticate();
    $postController->delete($postId, $userId);
    exit;
}

// Route not found
http_response_code(404);

echo json_encode([
    'message' => 'API endpoint not found'
]);
