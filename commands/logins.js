var logger = require('../lib/logger');
var user   = require('../lib/user');


var run = module.exports.run = function(opts) {
  var creds = user.listCredentials();

  if(!creds || creds.length === 0) {
    logger.log('no logins found!');
    return logger.done();
  }

  logger.log('listing all logins:');

  creds.forEach(function(c) {
    logger.log('=> ' + c.name + ' - ' + c.instance_url);
  });

  logger.done();
};

var cli = module.exports.cli = function(program) {
  program.command('logins')
    .description('list your salesforce logins')
    .action(function(opts) {
      run(opts);
    });
};
