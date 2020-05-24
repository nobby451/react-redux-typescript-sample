module.exports = function override(config, env) {
  //do stuff with the webpack config...
  console.debug("config-overrides.js was passed.");
  return config;
}
