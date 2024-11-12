module.exports = {
  // Resto de la configuración
  transform: {
    "^.+\\.[tj]sx?$": "babel-jest",
  },
  transformIgnorePatterns: [
    "node_modules/(?!(axios)/)",
  ],
  moduleFileExtensions: ["js", "jsx", "json", "node"], // Agrega esta línea
};
