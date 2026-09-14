"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";

import { z } from "zod";

import {
  createPost,
  updatePost,
} from "@/src/services/postService";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const postSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters"),

  content: z
    .string()
    .min(10, "Content must be at least 10 characters"),
});

export default function PostForm({
  post,
}) {
  const router = useRouter();

  const [serverError, setServerError] = useState("");

  const isEdit = !!post;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(postSchema),

    defaultValues: {
      title: post?.title || "",
      content: post?.content || "",
    },
  });

  const onSubmit = async (data) => {
    try {
      setServerError("");

      if (isEdit) {
        await updatePost(post._id, data);
      } else {
        await createPost(data);
      }

      router.push("/posts");
      router.refresh();
    } catch (error) {
      setServerError(
        error.response?.data?.message ||
          "Something went wrong"
      );
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-2xl space-y-6"
    >
      <div className="space-y-2">
        <Label>Title</Label>

        <Input
          placeholder="Post title"
          {...register("title")}
        />

        {errors.title && (
          <p className="text-sm text-red-500">
            {errors.title.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label>Content</Label>

        <Textarea
          placeholder="Write your post..."
          rows={8}
          {...register("content")}
        />

        {errors.content && (
          <p className="text-sm text-red-500">
            {errors.content.message}
          </p>
        )}
      </div>

      {serverError && (
        <p className="text-sm text-red-500">
          {serverError}
        </p>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Saving..."
          : isEdit
          ? "Update Post"
          : "Create Post"}
      </Button>
    </form>
  );
}
