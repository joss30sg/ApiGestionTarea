/* Mock de react-native para testing en entorno Node.js */

module.exports = {
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  FlatList: 'FlatList',
  SafeAreaView: 'SafeAreaView',
  ActivityIndicator: 'ActivityIndicator',
  TouchableOpacity: 'TouchableOpacity',
  StyleSheet: {
    create: (styles) => styles,
  },
  Platform: {
    OS: 'ios',
    Version: 13,
    isPad: () => false,
    isTV: () => false,
  },
  useWindowDimensions: () => ({
    width: 375,
    height: 667,
    scale: 2,
    fontScale: 1,
  }),
  Alert: {
    alert: jest.fn(),
  },
  Linking: {
    canOpenURL: jest.fn(() => Promise.resolve(true)),
    openURL: jest.fn(() => Promise.resolve()),
  },
  NativeModules: {
    ReactNativeART: {},
  },
};
