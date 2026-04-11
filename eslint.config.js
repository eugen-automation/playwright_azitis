import typescriptEslint from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
    {
        files: ['**/*.{js,ts}'],
        languageOptions: {
            parser: typescriptParser,
            ecmaVersion: 'latest',
            sourceType: 'module',
            globals: {
                console: 'readonly',
                process: 'readonly',
                NodeJS: 'readonly'
            }
        },
        plugins: {
            '@typescript-eslint': typescriptEslint
        },
        rules: {
            // TypeScript specific
            '@typescript-eslint/no-unused-vars': ['warn', { 
                argsIgnorePattern: '^_',
                varsIgnorePattern: '^_'
            }],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/prefer-optional-chain': 'off', // Requires type information
            '@typescript-eslint/prefer-nullish-coalescing': 'off', // Requires type information
      
            // Code style rules
            'indent': ['warn', 4],
            'semi': ['warn', 'always'],
            'comma-dangle': ['warn', {
                arrays: 'never',
                objects: 'never',
                imports: 'never',
                exports: 'never',
                functions: 'never'
            }],
            'quotes': ['error', 'single'],
            'yoda': 'off',
      
            // General best practices
            'no-console': 'off', // Allowed in tests
            'no-debugger': 'production' === process.env.NODE_ENV ? 'warn' : 'off',
            'no-prototype-builtins': 'off',
            'no-undef': 'off',
            'eqeqeq': ['error', 'always'],
            'no-var': 'error',
            'prefer-const': 'warn',
            'prefer-arrow-callback': 'warn',
            'prefer-template': 'warn',
      
            // Test-specific
            'max-len': ['warn', { code: 150, ignoreStrings: true, ignoreTemplateLiterals: true }]
        }
    },
    {
        ignores: [
            'node_modules/',
            'dist/',
            'test-results/',
            'playwright-report/',
            'allure-results/',
            'allure-report/',
            'playwright/.auth/'
        ]
    }
];