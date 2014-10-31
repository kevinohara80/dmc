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
    cfg = fs.readJsonSync(configFile);
  }
  return cfg;
}

function hasCredentials(org) {
  return fs.existsSync(authDir + '/' + org + '.json');
}

function getCredentials(org) {
  return fs.readJsonSync(authDir + '/' + org + '.json');
}

function saveCredentials(org, data) {
  fs.outputJsonSync(authDir + '/' + org + '.json', data);
}

function deleteCredentials(org) {
  if(!hasCredentials(org)) {
    return false;
  }
  fs.unlinkSync(authDir + '/' + org + '.json');
  return true;
}


function config(prop, val) {
  if(prop && val) {
    getConfig()[prop] = val;
  } else if(prop) {
    return getConfig()[prop];
  }
}

// exports
module.exports.hasCredentials    = hasCredentials;
module.exports.getCredentials    = getCredentials;
module.exports.saveCredentials   = saveCredentials;
module.exports.deleteCredentials = deleteCredentials;
module.exports.bootstrap         = bootstrap;
module.exports.config            = config;
