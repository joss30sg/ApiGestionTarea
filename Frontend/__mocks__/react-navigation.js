/* Mock de @react-navigation para testing */

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  push: jest.fn(),
  replace: jest.fn(),
  dispatch: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  isFocused: jest.fn(() => true),
  getState: jest.fn(() => ({ routes: [], index: 0 })),
  dangerouslyGetState: jest.fn(() => ({ routes: [], index: 0 })),
  reset: jest.fn(),
};

const mockRoute = {
  key: 'test-key',
  name: 'TestScreen',
  params: {},
};

module.exports = {
  useFocusEffect: jest.fn((callback) => {
    // Ejecuta el callback inmediatamente en tests
    callback();
  }),
  useIsFocused: () => true,
  useNavigation: () => mockNavigation,
  useRoute: () => mockRoute,
  NavigationContainer: ({ children }) => children,
  createNativeStackNavigator: () => ({
    Screen: jest.fn(),
    Group: jest.fn(),
  }),
};
