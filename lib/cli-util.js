var user    = require('./user');
var logger  = require('./logger');
var Promise = require('bluebird');

// var checkForOrg = module.exports.checkForOrg = function(org) {
//   if(!user.hasCredential(org)) {
//     fail('credentials not found for org: ' + org);
//   }
// };

var checkForOrg = module.exports.checkForOrg = function(org) {
  // return new Promise(function(resolve, reject) {
  //   user.hasCredential(org).then(function(hasCred) {
  //     if(!hasCred) {
  //       fail('credentials not found for org: ' + org);
  //       reject();
  //     } else {
  //       resolve();
  //     }
  //   });
  // });

  if(!org) fail('no org specified');

  return user.hasCredential(org).then(function(hasCred) {
    if(!hasCred) return new Error('no credential found: ' + org);
    return user.getCredential(org);
  });
};

var fail = module.exports.fail = function(msg) {
  if(msg) logger.error(msg);
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
