var config   = require('../lib/config');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var user     = require('../lib/user');
var _        = require('lodash');

var run = module.exports.run = function(opts, cb) {

  var cfg;

  if(opts.global) {
    logger.log('setting global default org');
    cfg = config.global();
  } else {
    logger.log('setting local default org');
    cfg = config.local();
  }

  user.hasCredential(opts.org)

    // check that the org has a login
    .then(function(exists) {
      if(!exists) {
        throw new Error('login for org not found: ' + opts.org);
      }
      return cfg.load();
    })

    // determine the proper configuration to update and
    // save it
    .then(function(){
      if(!cfg.exists()) {
        if(!opts.global) {
          logger.log('no local configuration found.');
          logger.log('try running ' + logger.highlight('dmc init') +
            ' to initialize a local config');
        }
        throw new Error('config not found');
      }

      logger.log('setting default org: ' + opts.org);
      cfg.set('default_org', opts.org);

      logger.log('saving configuration');
      return cfg.save();
    })

    // finsh with a log
    .then(function(){
      logger.success('configuration saved');
      cb();
    })

    .catch(function(err) {
      cb(err);
    });
};


module.exports.cli = function(program) {
  program.command('use <org>')
    .description('quickly set your default org in your configruation')
    .option('-g, --global', 'Set your default org in your global configuration')
    .action(function(org, opts) {
      opts.org = org;
      return cliUtil.executeRun(run)(opts);
    });
};
