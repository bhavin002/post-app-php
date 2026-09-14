<?php

class Post
{
    private PDO $db;

    public function __construct(PDO $db)
    {
        $this->db = $db;
    }

    // Create post
    public function create(
        string $title,
        string $content,
        int $userId
    ) {
        $sql = "
            INSERT INTO posts
            (title, content, user_id)
            VALUES
            (:title, :content, :user_id)
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':title' => $title,
            ':content' => $content,
            ':user_id' => $userId
        ]);

        return $this->db->lastInsertId();
    }


    // Get only logged-in user's posts
    public function getByUserId(int $userId)
    {
        $sql = "
        SELECT
            posts.id,
            posts.title,
            posts.content,
            posts.user_id,
            users.name AS user_name,
            posts.created_at,
            posts.updated_at
        FROM posts
        INNER JOIN users
            ON posts.user_id = users.id
        WHERE posts.user_id = :user_id
        ORDER BY posts.id DESC
    ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':user_id' => $userId
        ]);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }


    // Find a post belonging to a specific user
    public function findByIdAndUserId(
        int $postId,
        int $userId
    ) {
        $sql = "
            SELECT
                posts.*,
                users.name AS user_name
            FROM posts
            INNER JOIN users
                ON posts.user_id = users.id
            WHERE posts.id = :post_id
            AND posts.user_id = :user_id
            LIMIT 1
        ";

        $stmt = $this->db->prepare($sql);

        $stmt->execute([
            ':post_id' => $postId,
            ':user_id' => $userId
        ]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }


    // Update user's own post
    public function update(
        int $postId,
        int $userId,
        string $title,
        string $content
    ) {
        $sql = "
            UPDATE posts
            SET
                title = :title,
                content = :content
            WHERE id = :post_id
            AND user_id = :user_id
        ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':post_id' => $postId,
            ':user_id' => $userId,
            ':title' => $title,
            ':content' => $content
        ]);
    }


    // Delete user's own post
    public function delete(
        int $postId,
        int $userId
    ) {
        $sql = "
            DELETE FROM posts
            WHERE id = :post_id
            AND user_id = :user_id
        ";

        $stmt = $this->db->prepare($sql);

        return $stmt->execute([
            ':post_id' => $postId,
            ':user_id' => $userId
        ]);
    }
}
