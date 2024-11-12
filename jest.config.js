module.exports = {
    transform: {
      "^.+\\.[tj]sx?$": "babel-jest",
    },
    transformIgnorePatterns: [
      "node_modules/(?!(axios)/)" // Ignora node_modules excepto axios
    ],
    moduleNameMapper: {
        "\\.(css|less|scss|sass)$": "identity-obj-proxy",
      },
  };
  