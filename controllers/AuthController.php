<?php

class AuthController
{
    private User $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function register()
    {
        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        $name = $data['name'] ?? '';
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        if (!$name || !$email || !$password) {

            http_response_code(400);

            echo json_encode([
                'message' => 'All fields are required'
            ]);

            return;
        }

        $existingUser = $this->user->findByEmail($email);

        if ($existingUser) {

            http_response_code(409);

            echo json_encode([
                'message' => 'Email already exists'
            ]);

            return;
        }

        $hashedPassword = password_hash(
            $password,
            PASSWORD_DEFAULT
        );

        $userId = $this->user->create(
            $name,
            $email,
            $hashedPassword
        );

        http_response_code(201);

        echo json_encode([
            'message' => 'User registered successfully',
            'user_id' => $userId
        ]);
    }

    public function login()
    {
        // Get JSON data from request body
        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        // Validate input
        if (!$email || !$password) {

            http_response_code(400);

            echo json_encode([
                'message' => 'Email and password are required'
            ]);

            return;
        }

        // Find user by email
        $user = $this->user->findByEmail($email);

        // User not found
        if (!$user) {

            http_response_code(401);

            echo json_encode([
                'message' => 'Invalid email or password'
            ]);

            return;
        }

        // Verify password
        $validPassword = password_verify(
            $password,
            $user['password']
        );

        // Password is incorrect
        if (!$validPassword) {

            http_response_code(401);

            echo json_encode([
                'message' => 'Invalid email or password'
            ]);

            return;
        }

        // Generate authentication token
        $token = bin2hex(random_bytes(32));

        // Token will expire after 7 days
        $expiresAt = date(
            'Y-m-d H:i:s',
            strtotime('+7 days')
        );

        // Store token in database
        $this->user->saveToken(
            $user['id'],
            $token,
            $expiresAt
        );

        // Return response
        echo json_encode([
            'message' => 'Login successful',

            'token' => $token,

            'expires_at' => $expiresAt,

            'user' => [
                'id' => $user['id'],
                'name' => $user['name'],
                'email' => $user['email']
            ]
        ]);
    }
}
