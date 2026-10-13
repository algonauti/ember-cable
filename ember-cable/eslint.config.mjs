import ember from '@ijlee2-frontend-configs/eslint-config-ember/v2-addon';

export default [
  ...ember,
  {
    // Keep imports sorted, but without blank lines between groups
    rules: {
      'simple-import-sort/imports': [
        'error',
        { groups: [['^\\u0000', '^node:', '^@?\\w', '^', '^\\.']] },
      ],
    },
  },
];
