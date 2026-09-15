import { request } from './http.js';

export function getPosts() {
    return request('/posts');
}

export function getPost(id) {
    return request(`/posts/${id}`);
}

export function createPost(title, content) {
    return request('/posts', {
        method: 'POST',

        body: JSON.stringify({
            title,
            content,
        }),
    });
}

export function updatePost(id, title, content) {
    return request(`/posts/${id}`, {
        method: 'PUT',

        body: JSON.stringify({
            title,
            content,
        }),
    });
}

export function deletePost(id) {
    return request(`/posts/${id}`, {
        method: 'DELETE',
    });
}