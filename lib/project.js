var fs         = require('fs-extra');
var user       = require('./user');
var configFile = process.cwd() + '/dmc.json';
var logger     = require('../lib/logger');

var cfg;

var baseConfig = {
  colorize: true,
  srcDir: 'src',
  defaultOrg: ''
};

function bootstrap(cb) {
  if(fs.existsSync(configFile)) {
    logger.log('removing existing dmc.json');
    fs.removeSync(configFile);
  }
  logger.log('creating dmc.json');
  logger.log(configFile);
  fs.outputJsonSync(configFile, baseConfig);
}

function saveConfig() {
   if(typeof cfg !== 'undefined') {
    cfg = fs.outputJsonSync(configFile, cfg);
  }
}

function getConfig() {
  if(!cfg) {
    cfg = require(configFile);
  }
  return cfg;
}

function config(prop, val) {
  if(prop && val) {
    getConfig()[prop] = val;
  } else if(prop) {
    return getConfig()[prop];
  }
}

module.exports.bootstrap = bootstrap;
module.exports.config    = config;
