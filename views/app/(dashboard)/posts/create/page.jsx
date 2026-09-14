import PostForm from "@/components/posts/PostForm";

export default function CreatePostPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Create Post
      </h1>

      <PostForm />
    </div>
  );
}
