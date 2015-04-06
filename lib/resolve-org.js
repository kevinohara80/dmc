var Promise = require('bluebird');
var config  = require('./config');
var user    = require('./user');

module.exports = function(org) {

  return config.loadAll().then(function(){
    if(!org) org = config.get('defaultOrg');

    if(!org) {
      throw new Error('no org specified and no defined default org');
    }

    return user.getCredential(org);
  });

};
