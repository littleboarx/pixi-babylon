// @ts-check
const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended')
const globals = require('globals')
const tsEslint = require('typescript-eslint')

const compat = new FlatCompat({
    baseDirectory: __dirname,
})

module.exports = tsEslint.config(
    js.configs.recommended,
    ...compat.config({
        plugins: ['import-x'],
        rules: {
            'import-x/order': [
                'error',
                {
                    'groups': [
                        'builtin',
                        'external',
                        'internal',
                        'parent',
                        'sibling',
                        'index',
                        'object',
                    ],
                    'pathGroups': [{ pattern: '@/**', group: 'internal' }],
                    'pathGroupsExcludedImportTypes': ['builtin'],
                    'newlines-between': 'always',
                    'alphabetize': { order: 'asc' },
                },
            ],
            'import-x/no-duplicates': 'error',
        },
    }),
    {
        // 配置不检查的文件
        ignores: [
            'node_modules',
            'coverage',
            '.nyc_output',
            'dist-*',
            'dist',
            'static',
            '**/onelink-smart-script.js',
            '**/cannon.js',
        ],
    },
    {
        languageOptions: {
            globals: {
                ...globals.nodeBuiltin,
            },
        },
    },
    ...tsEslint.configs.recommended,

    eslintPluginPrettierRecommended,
    {
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            '@typescript-eslint/no-require-imports': 'off',
            'no-undef': 'off',
        },
    }
)
