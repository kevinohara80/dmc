var user   = require('./user');
var logger = require('./logger');

var checkForOrg = module.exports.checkForOrg = function(org) {
  if(!user.hasCredential(org)) {
    fail('credentials not found for org: ' + org);
  }
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
