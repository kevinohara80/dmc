var user    = require('./user');
var logger  = require('./logger');
var Promise = require('bluebird');
var config  = require('./config');
var _       = require('lodash');

var fail = module.exports.fail = function(err) {
  if(err) logger.error(err.message || err);
  logger.done(false);
  process.exit(1);
};

var success = module.exports.success = function(msg) {
  if(msg) logger.log(msg);
  logger.done(true);
  process.exit(0);
};

var callback = module.exports.callback = function(err) {
  if(err) {
    fail(err.message);
  } else {
    success();
  }
};

var executeRun = module.exports.executeRun = function(cmd) {

  return function() {

    var opts = _.last(Array.prototype.slice.call(arguments));

    var hasOrgArg;

    if(opts || opts.options) {
      hasOrgArg = _.find(opts.options, function(o) {
        return (o.long && o.long === '--org');
      });
    }

    config.loadAll().then(function(){
      if(!hasOrgArg) return;

      var usingDefault = false;

      if(!opts.org) {
        usingDefault = true;
        opts.org = config.get('defaultOrg');
      }

      if(!opts.org) {
        throw new Error('no org specified and no defined default org');
      } else {
        var defaultMsg = (usingDefault) ?
          (' ' + logger.highlight('(default)')) :
          '';
        logger.log('using org: ' + opts.org + defaultMsg);
      }

      return user.getCredential(opts.org);
    }).then(function(oauth) {
      if(oauth) opts.oauth = oauth;
    }).then(function() {
      return Promise.promisify(cmd)(opts);
    }).then(success).catch(fail);

  };

};
