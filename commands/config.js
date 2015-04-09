var user     = require('../lib/user');
var logger   = require('../lib/logger');
var cliUtil  = require('../lib/cli-util');
var config   = require('../lib/config');
var _        = require('lodash');

var run = module.exports.run = function(opts, cb) {

  config.loadAll().then(function() {

    var l = config.local();
    var g = config.global();

    var keys = [];

    if(!opts.global && !opts.local) {
      logger.log('resolving config variables');
      keys = _.keys(l.getData()).concat(_.keys(g.getData()));
    } else if(opts.global) {
      logger.log('showing global variables');
      keys = _.keys(g.getData());
    } else {
      logger.log('showing local variables');
      keys = _.keys(l.getData());
    }

    _(keys)
      .uniq()
      .sort()
      .each(function(k) {
        if(!_.isUndefined(l.get(k)) && !_.isNull(l.get(k)) && (!opts.global)) {
          logger.list(k + ': ' + l.get(k) + ' (local)');
        } else {
          logger.list(k + ': ' + g.get(k) + ' (global)');
        }
      })
      .value();

  }).catch(function(err) {
    cb(err);
  });
};


module.exports.cli = function(program) {
  program.command('config')
    .description('show the resolved dmc configuration')
    .option('-g, --global', 'Show the global config')
    .option('-l, --local', 'Show the local config')
    .action(function(opts) {
      run(opts, cliUtil.callback);
    });
};
