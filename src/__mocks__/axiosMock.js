// __mocks__/axios.js

const axios = {
    create: jest.fn(() => axios),
    interceptors: {
      request: {
        use: jest.fn(),
      },
      response: {
        use: jest.fn(),
      },
    },
    get: jest.fn(),
    post: jest.fn(),
    // Puedes añadir otros métodos como 'put', 'delete', etc., si los necesitas en los tests
  };
  
  export default axios;
  