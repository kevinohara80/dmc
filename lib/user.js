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

function hasCredential(org) {
  return fs.existsSync(authDir + '/' + org + '.json');
}

function getCredential(org) {
  return fs.readJsonSync(authDir + '/' + org + '.json');
}

function saveCredential(org, data) {
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


function config(prop, val) {
  if(prop && val) {
    getConfig()[prop] = val;
  } else if(prop) {
    return getConfig()[prop];
  }
}

// exports
module.exports.hasCredential    = hasCredential;
module.exports.getCredential    = getCredential;
module.exports.saveCredential   = saveCredential;
module.exports.deleteCredential = deleteCredential;
module.exports.listCredentials  = listCredentials;
module.exports.bootstrap        = bootstrap;
module.exports.config           = config;
