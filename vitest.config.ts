import {defineConfig} from 'vitest/config';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';

const srcPath = fileURLToPath(new URL('./src', import.meta.url));

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': srcPath,
        },
    },
    css: {
        postcss: {
            plugins: [],
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
        setupFiles: ['./src/__tests__/setup.ts'],
        alias: {
            '@': srcPath,
        },
    },
});
