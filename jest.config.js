module.exports = {
  preset: 'jest-expo',
  // @testing-library/react-native v13 ships its matchers built in, so the old
  // extend-expect setup entry no longer exists.
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|react-native-worklets)',
  ],
};
