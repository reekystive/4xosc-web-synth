import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({
  // import.meta.dirname is available after Node.js v20.11.0
  baseDirectory: import.meta.dirname,
});

/**
 * @type {import('eslint').Linter.Config[]}
 */
/** @type {any} */
const eslintConfig = [
  js.configs.recommended,
  .../** @type {any} */ (
    compat.config({
      extends: ['next', 'next/core-web-vitals', 'prettier'],
    })
  ),
  {
    files: ['**/*.{js,jsx,ts,tsx,mjs}'],
    rules: {
      'no-unused-vars': 'warn',
      'no-console': 'warn',
    },
  },
];

export default eslintConfig;
