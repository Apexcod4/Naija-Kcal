module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // @testing-library/react-native v13 ships its matchers built in, so the old
  // extend-expect setup entry no longer exists.
  //
  // Reanimated 4 delegates to react-native-worklets, whose .native entrypoints
  // require a real native module. This resolver ships with the package and
  // strips those extensions so the JS implementation is used under jest.
  resolver: 'react-native-worklets/jest/resolver.js',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-native-reanimated|react-native-worklets)',
  ],
};
