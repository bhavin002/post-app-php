"use client";

import Link from "next/link";

import { useAuth } from "@/src/context/AuthContext";
import { deletePost } from "@/src/services/postService";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PostCard({
  post,
  onDelete,
}) {
  const { user } = useAuth();

  const isOwner =
    post.user?._id === user?.id ||
    post.user === user?.id;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );

    if (!confirmed) return;

    try {
      await deletePost(post._id);

      onDelete();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete post"
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{post.title}</CardTitle>

        <p className="text-sm text-muted-foreground">
          By {post.user?.name}
        </p>
      </CardHeader>

      <CardContent>
        <p className="text-muted-foreground line-clamp-4">
          {post.content}
        </p>
      </CardContent>

      {isOwner && (
        <CardFooter className="gap-2">
          <Button
            variant="outline"
            asChild
          >
            <Link href={`/posts/${post._id}/edit`}>
              Edit
            </Link>
          </Button>

          <Button
            variant="destructive"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
