import js from '@eslint/js';
import globals from 'globals';

export default [
    {
        ignores: ['coverage/**', 'dist/**', 'node_modules/**', 'test/trace.mjs']
    },
    {
        files: ['**/*.js', '**/*.mjs'],
        languageOptions: {
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                ...globals.node
            }
        },
        rules: {
            ...js.configs.recommended.rules,
            eqeqeq: ['error', 'always'],
            'no-var': 'error',
            'prefer-const': 'error'
        }
    },
    {
        // The library is also distributed for browsers
        files: ['src/**/*.js'],
        languageOptions: {
            globals: {
                ...globals.browser
            }
        }
    },
    {
        files: ['index.js'],
        languageOptions: {
            sourceType: 'commonjs'
        }
    },
    {
        files: ['test/**/*.mjs'],
        languageOptions: {
            globals: {
                ...globals.mocha
            }
        },
        rules: {
            // Assertions are expression statements, e.g. `expect( x ).to.be.true`
            'no-unused-expressions': 'off'
        }
    }
];
