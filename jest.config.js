module.exports = {
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(axios)/)", // Asegura que Jest no ignore `axios` en `node_modules`
  ],
};
