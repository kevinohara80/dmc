var fs    = require('fs-extra');

var cfg;

var homeDir    = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/.dmc';
var authDir    = homeDir + '/auth';
var configFile = homeDir + '/config.json';

var baseConfig = {
  colorize: true
};

function bootstrap(cb) {
  fs.ensureDirSync(homeDir);
  fs.ensureDirSync(authDir);
  if(!fs.existsSync(configFile)) {
    cfg = fs.outputJsonSync(configFile, baseConfig);
  }
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
