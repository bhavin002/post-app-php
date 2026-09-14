<?php

class PostController
{
    private Post $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }


    // GET /api/posts
    // Get only logged-in user's posts
    public function index(int $userId)
    {
        $posts = $this->post->getByUserId($userId);

        echo json_encode([
            'data' => $posts
        ]);
    }
    

    // POST /api/posts
    // Create post for logged-in user
    public function create(int $userId)
    {
        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        $title = trim($data['title'] ?? '');
        $content = trim($data['content'] ?? '');

        if (!$title || !$content) {

            http_response_code(400);

            echo json_encode([
                'message' => 'Title and content are required'
            ]);

            return;
        }

        $postId = $this->post->create(
            $title,
            $content,
            $userId
        );

        http_response_code(201);

        echo json_encode([
            'message' => 'Post created successfully',
            'post_id' => $postId
        ]);
    }


    // GET /api/posts/{id}
    // Get one of logged-in user's posts
    public function show(
        int $postId,
        int $userId
    ) {
        $post = $this->post->findByIdAndUserId(
            $postId,
            $userId
        );

        if (!$post) {

            http_response_code(404);

            echo json_encode([
                'message' => 'Post not found'
            ]);

            return;
        }

        echo json_encode([
            'data' => $post
        ]);
    }


    // PUT /api/posts/{id}
    // Update logged-in user's own post
    public function update(
        int $postId,
        int $userId
    ) {
        $data = json_decode(
            file_get_contents("php://input"),
            true
        );

        $title = trim($data['title'] ?? '');
        $content = trim($data['content'] ?? '');

        if (!$title || !$content) {

            http_response_code(400);

            echo json_encode([
                'message' => 'Title and content are required'
            ]);

            return;
        }

        // Check ownership
        $post = $this->post->findByIdAndUserId(
            $postId,
            $userId
        );

        if (!$post) {

            http_response_code(404);

            echo json_encode([
                'message' => 'Post not found'
            ]);

            return;
        }

        $this->post->update(
            $postId,
            $userId,
            $title,
            $content
        );

        echo json_encode([
            'message' => 'Post updated successfully'
        ]);
    }


    // DELETE /api/posts/{id}
    // Delete logged-in user's own post
    public function delete(
        int $postId,
        int $userId
    ) {
        // Check ownership
        $post = $this->post->findByIdAndUserId(
            $postId,
            $userId
        );

        if (!$post) {

            http_response_code(404);

            echo json_encode([
                'message' => 'Post not found'
            ]);

            return;
        }

        $this->post->delete(
            $postId,
            $userId
        );

        echo json_encode([
            'message' => 'Post deleted successfully'
        ]);
    }
}