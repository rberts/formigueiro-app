module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: ['next/core-web-vitals', 'eslint:recommended'],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module'
  },
  rules: {
    'no-console': 'warn'
  }
};
