import { defineConfig } from 'vite';
import { resolve } from 'node:path';

export default defineConfig({
    server: {
        port: 5173,

        proxy: {
            '/api': {
                target: 'http://localhost/post-app/public',
                changeOrigin: true,
            },
        },
    },

    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                login: resolve(__dirname, 'login.html'),
                register: resolve(__dirname, 'register.html'),
                posts: resolve(__dirname, 'posts.html'),
            },
        },
    },
});
