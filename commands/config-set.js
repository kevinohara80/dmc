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
  program.command('config-set [items...]')
    .description('show a dmc global or local configuration')
    .option('-g, --global', 'Show the global config. If not specified, the project config will be shown')
    .action(function(items, opts) {
      run(items, opts, cliUtil.callback);
    });
};
