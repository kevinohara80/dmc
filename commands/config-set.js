var config   = require('../lib/config');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var _        = require('lodash');

var run = module.exports.run = function(opts, cb) {

  if(!opts.items || opts.items.length === 0) {
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

    // var parsed = config.parse(opts.items);
    //
    // _.map(parsed, function(v, k) {
    //   logger.list(k + ': ' + cfg.get(k) + ' => ' + v);
    // });

    var errors = 0;

    _.each(opts.items, function(item) {
      var parts = item.split('=');
      try {
        cfg.set(parts[0], parts[1]);
      } catch(err) {
        logger.error(err.message);
        errors++;
      }
    });

    if(errors > 0) {
      throw new Error('invalid config property inputs');
    }

    return cfg.save();
  }).then(function(){
    logger.log('configuration saved');
  }).catch(function(err) {
    cb(err);
  });

};


module.exports.cli = function(program) {
  program.command('config-set [items...]')
    .description('set configuration variables')
    .option('-g, --global', 'Set the global config variable. Otherwise, local variable set')
    .action(function(items, opts) {
      opts.items = items;
      return cliUtil.executeRun(run)(opts);
    });
};
