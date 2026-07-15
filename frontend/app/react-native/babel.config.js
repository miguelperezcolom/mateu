module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // reanimated 4 (SDK 54): the worklets plugin replaces react-native-reanimated/plugin
    plugins: ['react-native-worklets/plugin'],
  };
};
