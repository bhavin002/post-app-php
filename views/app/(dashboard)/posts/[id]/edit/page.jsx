"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import PostForm from "@/components/posts/PostForm";
import { getPostById } from "@/src/services/postService";

export default function EditPostPage() {
  const params = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await getPostById(params.id);

        setPost(response.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Edit Post
      </h1>

      <PostForm post={post} />
    </div>
  );
}
