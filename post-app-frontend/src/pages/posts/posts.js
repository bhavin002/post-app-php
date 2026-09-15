import '../../main.js';

import {
    getPosts,
    createPost,
    updatePost,
    deletePost
} from '../../api/posts.api.js';

import {
    getUser,
    clearAuth
} from '../../utils/storage.js';

import { requireAuth } from '../../auth/auth.guard.js';

import {
    showSuccess,
    showError
} from '../../utils/alert.js';

requireAuth();

const postsContainer =
    document.getElementById('posts-container');

const userName =
    document.getElementById('user-name');

const logoutButton =
    document.getElementById('logout-button');

const postForm =
    document.getElementById('post-form');

let posts = [];

init();

async function init() {

    const user = getUser();

    if (user) {
        userName.textContent = user.name;
    }

    await loadPosts();
}

async function loadPosts() {

    postsContainer.innerHTML = `
        <div class="col-12 text-center">
            Loading posts...
        </div>
    `;

    try {

        const response = await getPosts();

        posts = response.data || [];

        renderPosts();

    } catch (error) {

        showError(error.message);

    }
}

function renderPosts() {

    if (posts.length === 0) {

        postsContainer.innerHTML = `
            <div class="col-12">
                <div class="alert alert-info">
                    You don't have any posts yet.
                </div>
            </div>
        `;

        return;
    }

    postsContainer.innerHTML =
        posts.map(post => `
            <div class="col-md-6 col-lg-4">

                <div class="card h-100 shadow-sm">

                    <div class="card-body">

                        <h5 class="card-title">
                            ${escapeHtml(post.title)}
                        </h5>

                        <p class="card-text">
                            ${escapeHtml(post.content)}
                        </p>

                    </div>

                    <div class="card-footer bg-white">

                        <small class="text-muted">
                            ${post.created_at}
                        </small>

                        <div class="mt-3">

                            <button
                                class="btn btn-sm btn-outline-primary"
                                onclick="editPost(${post.id})"
                            >
                                Edit
                            </button>

                            <button
                                class="btn btn-sm btn-outline-danger"
                                onclick="removePost(${post.id})"
                            >
                                Delete
                            </button>

                        </div>

                    </div>

                </div>

            </div>
        `).join('');
}

window.editPost = function (id) {

    const post = posts.find(
        post => post.id === id
    );

    if (!post) {
        return;
    }

    document.getElementById('post-id').value =
        post.id;

    document.getElementById('post-title').value =
        post.title;

    document.getElementById('post-content').value =
        post.content;

    document.getElementById('modal-title').textContent =
        'Edit Post';

    const modal =
        bootstrap.Modal.getOrCreateInstance(
            document.getElementById('postModal')
        );

    modal.show();
};

window.removePost = async function (id) {

    const confirmed =
        confirm('Are you sure you want to delete this post?');

    if (!confirmed) {
        return;
    }

    try {

        await deletePost(id);

        await loadPosts();

        showSuccess('Post deleted successfully.');

    } catch (error) {

        showError(error.message);

    }
};

postForm.addEventListener('submit', async (event) => {

    event.preventDefault();

    const id =
        document.getElementById('post-id').value;

    const title =
        document.getElementById('post-title')
            .value
            .trim();

    const content =
        document.getElementById('post-content')
            .value
            .trim();

    try {

        if (id) {

            await updatePost(
                id,
                title,
                content
            );

            showSuccess(
                'Post updated successfully.'
            );

        } else {

            await createPost(
                title,
                content
            );

            showSuccess(
                'Post created successfully.'
            );
        }

        postForm.reset();

        document.getElementById('post-id').value = '';

        await loadPosts();

        const modal =
            bootstrap.Modal.getInstance(
                document.getElementById('postModal')
            );

        modal.hide();

    } catch (error) {

        showError(error.message);

    }

});

logoutButton.addEventListener('click', () => {

    clearAuth();

    window.location.href = '/login.html';

});

function escapeHtml(value) {

    const div = document.createElement('div');

    div.textContent = value;

    return div.innerHTML;
}