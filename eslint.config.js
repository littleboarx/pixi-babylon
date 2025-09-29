// @ts-check
const { FlatCompat } = require('@eslint/eslintrc')
const js = require('@eslint/js')
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended')
const pluginVue = require('eslint-plugin-vue')
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
            '**/cannon.js'
        ],
    },
    // 配置检查文件后缀
    {
        languageOptions: {
            globals: {
                ...globals.nodeBuiltin,
            },
        },
    },
    ...tsEslint.configs.recommended,
    // vue 必须放在后面，因为vue需要覆盖掉languageOptions.parser
    ...pluginVue.configs['flat/recommended'],
    {
        languageOptions: {
            parserOptions: {
                parser: '@typescript-eslint/parser',
                ecmaFeatures: {
                    jsx: true,
                },
            },
        },
    },
    eslintPluginPrettierRecommended,
    {
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-explicit-any': 'off',
            'no-undef': 'off',
        },
    }
)
