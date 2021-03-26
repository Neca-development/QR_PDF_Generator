module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/essential',
    '@vue/airbnb', 'prettier'
  ],
  parserOptions: {
    parser: 'babel-eslint',
  },
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": ["error"]
  },
};
