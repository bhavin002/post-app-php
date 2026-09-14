<?php

class User
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    public function create(
        string $name,
        string $email,
        string $password
    ) {
        $sql = "
            INSERT INTO users
            (name, email, password)
            VALUES
            (:name, :email, :password)
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':name' => $name,
            ':email' => $email,
            ':password' => $password
        ]);

        return $this->db->lastInsertId();
    }

    public function saveToken(
        int $userId,
        string $token,
        string $expiresAt
    ) {
        $sql = "
        INSERT INTO user_tokens
        (user_id, token, expires_at)
        VALUES
        (:user_id, :token, :expires_at)
    ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':user_id' => $userId,
            ':token' => $token,
            ':expires_at' => $expiresAt
        ]);
    }

    public function findByEmail(string $email)
    {
        $sql = "
            SELECT *
            FROM users
            WHERE email = :email
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':email' => $email
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function findById(int $id)
    {
        $sql = "
            SELECT id, name, email
            FROM users
            WHERE id = :id
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':id' => $id
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}