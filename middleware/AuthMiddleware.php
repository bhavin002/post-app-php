<?php

class AuthMiddleware
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function authenticate()
    {
        $headers = getallheaders();

        $authHeader = $headers['authorization'] ?? '';

        if (!$authHeader) {

            http_response_code(401);

            echo json_encode([
                'message' => 'Authorization token required'
            ]);

            exit;
        }

        // Expected:
        // Authorization: Bearer abc123

        $parts = explode(' ', $authHeader);

        if (
            count($parts) !== 2 ||
            $parts[0] !== 'Bearer'
        ) {

            http_response_code(401);

            echo json_encode([
                'message' => 'Invalid authorization header'
            ]);

            exit;
        }

        $token = $parts[1];

        $sql = "
            SELECT user_id
            FROM user_tokens
            WHERE token = :token
            AND expires_at > NOW()
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':token' => $token
        ]);

        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$result) {

            http_response_code(401);

            echo json_encode([
                'message' => 'Invalid or expired token'
            ]);

            exit;
        }

        // Return logged-in user ID
        return (int) $result['user_id'];
    }
}