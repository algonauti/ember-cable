module.exports = {
  env: {
    node: true
  },
  rules: {
    "no-console":0,
    "node/no-unpublished-require": ["error", {
      "allowModules": ["glob", "morgan", "http-proxy"]
    }]
  },
};
