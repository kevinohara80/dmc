var fs    = require('fs-extra');

var homeDir    = process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/.dmc';
var authDir    = homeDir + '/auth';
var indexDir   = homeDir + '/index';
var configFile = homeDir + '/config.json';

var cfg;

var baseConfig = {
  colorize: true
};

function getHomeDir() {
  return homeDir;
}

function bootstrap(cb) {
  fs.ensureDirSync(homeDir);
  fs.ensureDirSync(authDir);
  fs.ensureDirSync(indexDir);
  if(!fs.existsSync(configFile)) {
    cfg = fs.outputJsonSync(configFile, baseConfig);
  }
}

/* config management */

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

function config(prop, val) {
  if(prop && val) {
    getConfig()[prop] = val;
  } else if(prop) {
    return getConfig()[prop];
  }
}

/* credential management */

function hasCredential(org) {
  return fs.existsSync(authDir + '/' + org + '.json');
}

function getCredential(org) {
  return fs.readJsonSync(authDir + '/' + org + '.json');
}

function saveCredential(org, data) {
  data.nick = org;
  fs.outputJsonSync(authDir + '/' + org + '.json', data);
}

function deleteCredential(org) {
  if(!hasCredential(org)) {
    return false;
  }
  fs.unlinkSync(authDir + '/' + org + '.json');
  return true;
}

function listCredentials() {
  var creds = fs.readdirSync(authDir).map(function(c){
    if(/\.json/.test(c)) {
      var name = c.replace('.json', '');
      var json = fs.readJsonSync(authDir + '/' + c);
      json.name = name;
      return json;
    }
  });
  return creds;
}

/* exports */

module.exports.getHomeDir       = getHomeDir;
module.exports.bootstrap        = bootstrap;
module.exports.config           = config;
module.exports.hasCredential    = hasCredential;
module.exports.getCredential    = getCredential;
module.exports.saveCredential   = saveCredential;
module.exports.deleteCredential = deleteCredential;
module.exports.listCredentials  = listCredentials;
