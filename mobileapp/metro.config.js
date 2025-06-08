// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path"); // Make sure 'path' is required

module.exports = (async () => {
  // 1) Start from Expo’s default Metro config, based on your project root:
  const config = await getDefaultConfig(__dirname);
  config.resolver.sourceExts.push("env");

config.resolver.extraNodeModules = {
    ...(config.resolver.extraNodeModules || {}), // Preserve existing extraNodeModules
    stream: require.resolve("stream-browserify"),
    events: require.resolve("events/"),
    crypto: require.resolve("crypto-browserify"),
    http: require.resolve("stream-http"),
    https: require.resolve("stream-http"),
    net: path.resolve(__dirname, "shim.js"),
    tls: path.resolve(__dirname, "shim.js"),
    url: require.resolve("url/"),
    zlib: require.resolve("browserify-zlib"),
    util: require.resolve("util/"),
    assert: require.resolve("assert/"), // <--- Add this line for 'assert'
};
const { assetExts, sourceExts } = config.resolver;

config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

config.resolver.assetExts = assetExts.filter((ext) => ext !== "svg");
config.resolver.sourceExts = [...sourceExts, "svg"];

return config;
})();

