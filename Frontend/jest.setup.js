// Polyfills para testing
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    ok: true,
    status: 200,
    headers: { get: jest.fn() },
  })
);

// Silenciar logs específicos de react-native en tests
const originalWarn = console.warn;
console.warn = function(...args) {
  if (typeof args[0] === 'string' && (
    args[0].includes('Animated:') ||
    args[0].includes('Non-serializable') ||
    args[0].includes('NativeEventEmitter')
  )) {
    return;
  }
  originalWarn.apply(console, args);
};