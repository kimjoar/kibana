module.exports = {
  extends: '../../.eslintrc',
  overrides: [
    {
      files: ['**/__tests__/**/*.js'],
      plugins: [
        'jest',
      ],

      env: {
        'jest/globals': true,
      },

      rules: {
        'jest/no-disabled-tests': 'error',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
      },
    }
  ]
};