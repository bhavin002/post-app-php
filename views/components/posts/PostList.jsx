"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { getPosts } from "@/src/services/postService";

import { Button } from "@/components/ui/button";

import PostCard from "./PostCard";

export default function PostList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchPosts = async () => {
    try {
      setLoading(true);

      const response = await getPosts();

      setPosts(response.data);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Failed to load posts"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return <div>Loading posts...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            Posts
          </h1>

          <p className="text-muted-foreground">
            Manage your posts
          </p>
        </div>

        <Button asChild>
          <Link href="/posts/create">
            Create Post
          </Link>
        </Button>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          No posts found.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              onDelete={fetchPosts}
            />
          ))}
        </div>
      )}
    </div>
  );
}
