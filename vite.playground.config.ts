import { resolve } from 'path'

import { defineConfig } from 'vite'

export default defineConfig({
    root: 'playground',
    base: './',
    build: {
        // lib: {
        //     formats: ['iife'],
        // },
        minify: true,
        outDir: '../docs',
        emptyOutDir: true,
        // rollupOptions: {
        //     input: './playground/index.ts', // 用 JS 入口代替 HTML
        //     output: {
        //         format: 'iife', // 强制 IIFE
        //         name: 'MyApp', // 全局变量名
        //     },
        // },
    },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
        },
    },
})
