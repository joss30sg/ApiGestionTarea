/* Mock del API client para testing */

const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  defaults: {
    headers: {
      'X-API-KEY': 'test-key',
      'Content-Type': 'application/json',
    },
    baseURL: 'http://localhost:5000/api',
    timeout: 30000,
  },
  interceptors: {
    request: {
      use: jest.fn(),
      eject: jest.fn(),
    },
    response: {
      use: jest.fn(),
      eject: jest.fn(),
    },
  },
};

module.exports = {
  apiClient: mockApiClient,
};
