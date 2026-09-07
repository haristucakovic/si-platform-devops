module.exports = {
  root: true,
  env: {
    es2022: true,
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: ['eslint:recommended', 'prettier'],
  overrides: [
    {
      files: ['frontend/**/*.{js,jsx}'],
      env: {
        browser: true,
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      plugins: ['react-hooks', 'react-refresh'],
      rules: {
        'react-refresh/only-export-components': 'warn',
      },
    },
    {
      files: ['backend/**/*.js'],
      env: {
        node: true,
      },
    },
  ],
};
