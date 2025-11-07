/** @type {import("next").NextConfig} */
const nextConfig = {
  webpack: (config) => {
    const path = require("path");
    // Alias "@/" aponta para a raiz do projeto
    config.resolve.alias["@" ] = path.resolve(__dirname);
    return config;
  },
};

module.exports = nextConfig;
