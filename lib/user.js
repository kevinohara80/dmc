var fs    = require('fs-extra');
var async = require('async');

var config;

var homeDir    = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/.dmc';
var authDir    = homeDir + '/auth';
var configFile = homeDir + '/config.json';

var baseConfig = {
  colorize: true
};

function bootstrap(cb) {
  fs.ensureDirSync(homeDir);
  fs.ensureDirSync(authDir);
  saveConfig();
}

function saveConfig() {
  if(!fs.existsSync(configFile)) {
    config = fs.outputJsonSync(configFile, baseConfig);
  } else {
    config = fs.outputJsonSync(configFile, config);
  }
}

function getConfig() {
  if(!config) {
    config = require(configFile);
  }
  return config;
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
