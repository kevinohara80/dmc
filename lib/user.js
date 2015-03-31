var fs       = require('../lib/fs');
var Promise  = require('bluebird');
var _        = require('lodash');
var paths    = require('../lib/paths');

var cfg;

var baseConfig = {
  colorize: true
};

function getHomeDir() {
  return paths.dir.home;
}

console.log(paths.dir.home);

function bootstrap() {
  return fs.ensureDirAsync(paths.dir.home).then(function(){
    return fs.ensureDirAsync(paths.dir.auth);
  }).then(function(){
    return fs.ensureDirAsync(paths.dir.index);
  }).then(function(){
    return fs.exists(paths.file.globalConfig);
  }).then(function(configExists) {
    if(!configExists) {
      return fs.outputJsonAsync(paths.file.globalConfig, baseConfig);
    }
  }).catch(function(err) {
    // handle errors here
  })
}

/* config management */

function saveConfig() {
  return new Promise(function(resolve, reject) {

    if(_.isUndefined(cfg)) {
      return reject(new Error('no configuration to save'));
    }

    fs.outputJsonAsync(paths.file.globalConfig, cfg).then(function(newCfg){
      cfg = newCfg;
      resolve(cfg);
    }).catch(function(err) {
      reject(err);
    });

  });
}

function getConfig() {
  return new Promise(function(resolve, reject) {
    if(cfg) return resolve(cfg);

    fs.readJsonAsync(paths.file.globalConfig).then(function(newCfg) {
      cfg = newCfg;
      resolve(cfg);
    }).catch(function(err) {
      reject(err);
    });

  });
}

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

function hasCredential(org) {
  return fs.existsAsync(paths.dir.auth + '/' + org + '.json')
}

function getCredential(org) {
  return fs.readJsonAsync(paths.dir.auth + '/' + org + '.json');
}

function saveCredential(org, data) {
  data.name = org;
  return fs.outputJsonAsync(paths.dir.auth + '/' + org + '.json', data);
}

function deleteCredential(org) {
  return hasCredential(org).then(function(doesExist) {
    if(doesExist) {
      return fs.unlinkAsync(paths.dir.auth + '/' + org + '.json');
    }
  })
}

function listCredentials() {
  return fs.readdirAsync(paths.dir.auth).then(function(orgs) {

    var promises = _(orgs)
      .map(function(orgFileName) {
        if(/\.json/.test(orgFileName)) {
          return fs.readJsonAsync(paths.dir.auth + '/' + orgFileName).then(function(org) {
            if(!org.name) {
              org.name = orgFileName.replace('.json', '');
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
