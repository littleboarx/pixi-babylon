import { resolve } from 'path'

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.ts'),
            name: 'PixiBabylon',
            formats: ['es', 'umd'],
            fileName: format => {
                if (format === 'es') {
                    return 'index.esm.js'
                }
                if (format === 'umd') {
                    return 'index.umd.js'
                }
                return `index.${format}.js`
            },
        },
        rollupOptions: {
            external: ['pixi.js', /@babylonjs\/core/],
            output: {
                globals: name => {
                    if (name === 'pixi.js') {
                        return 'PIXI'
                    }
                    if (/@babylonjs\/core/.test(name)) {
                        return 'BABYLON'
                    }
                },
                assetFileNames: assetInfo => {
                    if (assetInfo.name === 'style.css') {
                        return 'index.css'
                    }
                    return assetInfo.name || 'asset'
                },
            },
        },
        sourcemap: true,
        emptyOutDir: true,
    },
    plugins: [
        dts({
            tsconfigPath: './tsconfig.build.json',
            rollupTypes: true,
            outDir: 'dist',
            include: ['src/**/*.ts'],
            exclude: ['src/**/*.spec.ts', 'src/**/*.test.ts'],
        }),
    ],
})
