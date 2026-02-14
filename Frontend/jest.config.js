module.exports = {
  testMatch: ['**/__tests__/**/*.test.ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        jsx: 'react',
        strict: false,
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  moduleNameMapper: {
    '^react-native$': '<rootDir>/__mocks__/react-native.js',
    '^@react-native-community/': '<rootDir>/__mocks__/react-native.js',
    '^@react-navigation/native$': '<rootDir>/__mocks__/react-navigation.js',
    '^@react-navigation/native-stack$': '<rootDir>/__mocks__/react-navigation.js',
    '^./api/client$': '<rootDir>/__mocks__/@axios.js',
    '^../api/client$': '<rootDir>/__mocks__/@axios.js',
    '^../../api/client$': '<rootDir>/__mocks__/@axios.js',
    '^./constants/colors$': '<rootDir>/__mocks__/colors.js',
    '^../constants/colors$': '<rootDir>/__mocks__/colors.js',
    '^../../constants/colors$': '<rootDir>/__mocks__/colors.js',
    '^./components/': '<rootDir>/__mocks__/components.js',
    '^../components/': '<rootDir>/__mocks__/components.js',
    '^../../components/': '<rootDir>/__mocks__/components.js',
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-navigation)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/index.ts',
    '!src/types/**',
    '!src/**/__tests__/**',
  ],
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
};
