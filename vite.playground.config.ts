import { resolve } from 'path'

import { defineConfig } from 'vite'

export default defineConfig({
    root: 'playground',
    base: '/pixi-babylon/',
    build: {
        outDir: '../dist-demo',
        emptyOutDir: true,
        sourcemap: true,
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
})
