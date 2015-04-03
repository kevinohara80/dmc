var config   = require('../lib/config');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var _        = require('lodash');

var run = module.exports.run = function(items, opts, cb) {

  if(!items || items.length === 0) {
    cb(new Error('You must supply config items to set'));
  }

  var cfg;

  if(opts.global) {
    logger.log('setting global config values');
    cfg = config.global();
  } else {
    logger.log('setting local config values');
    cfg = config.local();
  }

  cfg.load().then(function(){

    if(!cfg.exists()) {
      if(!opts.global) {
        logger.log('no local configuration found.');
        logger.log('try running ' + logger.highlight('dmc init') +
          ' to initialize a local config');
      }
      return cb(new Error('config not found'));
    }

    var parsed = config.parse(items);

    _.map(parsed, function(v, k) {
      logger.list(k + ': ' + cfg.get(k) + ' => ' + v);
    });

    return cfg.save(parsed);
  }).then(function(){
    logger.log('configuration saved');
  }).catch(function(err) {
    cb(err);
  });

};


module.exports.cli = function(program) {
  program.command('config-unset [items...]')
    .description('unset configuration variables')
    .option('-g, --global', 'Unset the global config variable. Otherwise, local variable unset')
    .action(function(items, opts) {
      run(items, opts, cliUtil.callback);
    });
};
