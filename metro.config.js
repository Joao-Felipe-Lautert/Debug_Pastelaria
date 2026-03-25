const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  "@": path.resolve(__dirname),
};

// Garantir que extensões web sejam resolvidas corretamente
config.resolver.platforms = ["ios", "android", "native", "web"];

module.exports = config;