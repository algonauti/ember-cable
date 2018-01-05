module.exports = {
  env: {
    node: true
  },
  rules: {
    "node/no-unpublished-require": ["error", {
      "allowModules": ["glob", "morgan", "http-proxy"]
    }]
  },
};
