module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native|@react-navigation|react-native-safe-area-context|react-native-screens|react-native-svg|react-native-reanimated|react-native-gesture-handler|expo(nent)?|@expo|expo-font|expo-linear-gradient|expo-blur|@expo-google-fonts|@expo/vector-icons)' 
  ],
  testPathIgnorePatterns: ['/node_modules/', '/reference/', '/src/_legacy/'],
};
