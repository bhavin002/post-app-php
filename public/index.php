<?php

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