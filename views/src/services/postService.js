import api from "@/lib/axios";

export const getPosts = async () => {
  const response = await api.get("/posts");

  return response.data;
};

export const getPostById = async (id) => {
  const response = await api.get(`/posts/${id}`);

  return response.data;
};

export const createPost = async (payload) => {
  const response = await api.post("/posts", payload);

  return response.data;
};

export const updatePost = async (id, payload) => {
  const response = await api.put(`/posts/${id}`, payload);

  return response.data;
};

export const deletePost = async (id) => {
  const response = await api.delete(`/posts/${id}`);

  return response.data;
};
