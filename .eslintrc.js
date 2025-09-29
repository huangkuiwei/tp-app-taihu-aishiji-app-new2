module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ['plugin:vue/essential', 'eslint:recommended', '@vue/prettier'],
  ignorePatterns: ['node_modules/', 'dist/', 'build/', 'src/uni_modules', 'src/wxcomponents'],
  parserOptions: {
    parser: 'babel-eslint',
  },
  globals: {
    uni: true,
    getApp: true,
    WeixinJSBridge: true,
    ap: true,
    wx: true,
    plus: true,
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-empty': 'off',
  },
};
