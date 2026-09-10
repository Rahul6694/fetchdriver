const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');
const exclusionList = require('metro-config/src/defaults/exclusionList');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  resolver: {
    blockList: exclusionList([
      /android\/build\/.*/,
      /ios\/build\/.*/,
      /node_modules\/.*\/android\/build\/.*/,
    ]),
  },
  watcher: {
    unstable_lazySha1: true,
  },
};

module.exports = mergeConfig(defaultConfig, config);
