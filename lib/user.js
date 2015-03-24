var fs       = require('fs-extra');
var Promise  = require('bluebird');
var _        = require('lodash');

var homeDir  = process.env[(process.platform == 'win32') ?
  'USERPROFILE' :
  'HOME'] + '/.dmc';
var authDir    = homeDir + '/auth';
var indexDir   = homeDir + '/index';
var configFile = homeDir + '/config.json';

// wrap promises
var ensureDir  = Promise.promisify(fs.ensureDir);
var outputJson = Promise.promisify(fs.outputJson);
var readJson   = Promise.promisify(fs.readJson);
var unlink     = Promise.promisify(fs.unlink);
var readdir    = Promise.promisify(fs.readdir);

var exists = function(file) {
  return new Promise(function(resolve, reject) {
    fs.exists(file, function(ex) {
      resolve(ex);
    });
  });
}

var cfg;

var baseConfig = {
  colorize: true
};

function getHomeDir() {
  return homeDir;
}

// function bootstrap(cb) {
//   fs.ensureDirSync(homeDir);
//   fs.ensureDirSync(authDir);
//   fs.ensureDirSync(indexDir);
//   if(!fs.existsSync(configFile)) {
//     cfg = fs.outputJsonSync(configFile, baseConfig);
//   }
// }

function bootstrap() {
  return ensureDir(homeDir).then(function(){
    return ensureDir(authDir);
  }).then(function(){
    return ensureDir(indexDir);
  }).then(function(){
    return exists(configFile);
  }).then(function(configExists) {
    if(!configExists) {
      return outputJson(configFile, baseConfig);
    }
  }).catch(function(err) {
    // handle errors here
  })
}

/* config management */

// function saveConfig() {
//   if(typeof cfg !== 'undefined') {
//     cfg = fs.outputJsonSync(configFile, cfg);
//   }
// }

function saveConfig() {
  return new Promise(function(resolve, reject) {

    if(_.isUndefined(cfg)) {
      return reject(new Error('no configuration to save'));
    }

    outputJson(configFile, cfg).then(function(newCfg){
      cfg = newCfg;
      resolve(cfg);
    }).catch(function(err) {
      reject(err);
    });

  });
}

// function getConfig() {
//   if(!cfg) {
//     cfg = fs.readJsonSync(configFile);
//   }
//   return cfg;
// }

function getConfig() {
  return new Promise(function(resolve, reject) {
    if(cfg) return resolve(cfg);

    readJson(configFile).then(function(newCfg) {
      cfg = newCfg;
      resolve(cfg);
    }).catch(function(err) {
      reject(err);
    });

  });
}

// function config(prop, val) {
//   if(prop && val) {
//     getConfig()[prop] = val;
//   } else if(prop) {
//     return getConfig()[prop];
//   }
// }

function config(prop, val) {
  return new Promise(function(resolve, reject) {

    getConfig().then(function(c) {
      if(prop && val) {
        c[prop] = val;
        resolve();
      } else if(prop) {
        resolve(c[prop]);
      }
    }).catch(function(err) {
      reject(err);
    });

  });
}

/* credential management */

// function hasCredential(org) {
//   return fs.existsSync(authDir + '/' + org + '.json');
// }

function hasCredential(org) {
  return exists(authDir + '/' + org + '.json')
}

// function getCredential(org) {
//   return fs.readJsonSync(authDir + '/' + org + '.json');
// }

function getCredential(org) {
  return readJson(authDir + '/' + org + '.json');
}

// function saveCredential(org, data) {
//   data.nick = org;
//   fs.outputJsonSync(authDir + '/' + org + '.json', data);
// }

function saveCredential(org, data) {
  data.name = org;
  return outputJson(authDir + '/' + org + '.json', data);
}

// function deleteCredential(org) {
//   if(!hasCredential(org)) {
//     return false;
//   }
//   fs.unlinkSync(authDir + '/' + org + '.json');
//   return true;
// }

function deleteCredential(org) {
  return hasCredential(org).then(function(doesExist) {
    if(doesExist) {
      return unlink(authDir + '/' + org + '.json');
    }
  })
}

// function listCredentials() {
//   var creds = fs.readdirSync(authDir).map(function(c){
//     if(/\.json/.test(c)) {
//       var name = c.replace('.json', '');
//       var json = fs.readJsonSync(authDir + '/' + c);
//       json.name = name;
//       return json;
//     }
//   });
//   return creds;
// }

function listCredentials() {
  return fs.readdir(authDir).then(function(orgs) {

    var promises = _(orgs)
      .map(function(o) {
        if(/\.json/.test(c)) {
          return readJson(authDir + '/' + c).then(function(org) {
            if(!org.name) {
              org.name = c.replace('.json', '');
            }
            return org;
          });
        }
      })
      .compact()
      .value();

    return Promise.all(promises);
  });
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
