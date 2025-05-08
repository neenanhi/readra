// metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path"); // Make sure 'path' is required

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver, // Preserve existing resolver settings
  extraNodeModules: {
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
  },
};

module.exports = config;
