module.exports = function override(config, env) {
  //do stuff with the webpack config...
  config.module.rules.forEach(element => {
    console.debug(element);
  });
  return config;
}
