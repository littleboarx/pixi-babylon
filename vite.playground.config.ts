import { resolve } from 'path'

import { defineConfig } from 'vite'

export default defineConfig({
    root: 'playground',
    base: './',
    build: {
        outDir: '../docs',
        emptyOutDir: true,
        sourcemap: true,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
})
