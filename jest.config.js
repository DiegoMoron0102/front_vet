module.exports = {
  moduleNameMapper: {
    "^axios$": require.resolve("./src/__mocks__/axiosMock.js"), // Redirige axios a un mock
  },
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(axios)/)",
  ],
  moduleFileExtensions: ["js", "jsx", "json", "node"], // Agrega esta línea
};
