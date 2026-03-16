import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['**/*.scenario.ts', '**/*.{test,spec}.{ts,tsx}'],
        define: {
            'import.meta.env.VITE_GEMINI_API_KEY': 'undefined',
            'import.meta.env.VITE_UNIPILE_API_KEY': 'undefined',
        },
    },
})
