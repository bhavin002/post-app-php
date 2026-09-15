<?php
$allowedOrigins = [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header('Vary: Origin');
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400');

// Preflight request: browser only needs the headers above, no body.
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

header('Content-Type: application/json');

require_once '../config/database.php';

require_once '../models/User.php';
require_once '../models/Post.php';

require_once '../controllers/AuthController.php';
require_once '../controllers/PostController.php';

require_once '../middleware/AuthMiddleware.php';

$user = new User($pdo);
$post = new Post($pdo);

require_once '../routes/api.php';