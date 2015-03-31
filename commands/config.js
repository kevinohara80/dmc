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

    if(opts.resolve) {
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
        if(!_.isUndefined(l.get(k)) && (opts.resolve || !opts.global)) {
          logger.list(k + ': ' + l.get(k) + ' (local)');
        } else {
          logger.list(k + ': ' + g.get(k) + ' (global)');
        }
      })
      .value();

  }).catch(function(err) {
    cb(err)
  });
};


module.exports.cli = function(program) {
  program.command('config')
    .description('show a dmc global or local configuration')
    .option('-g, --global', 'Show the global config. If not specified, the project config will be shown')
    .option('--resolve', 'Show the resolution of local to global configuration values')
    .action(function(opts) {
      run(opts, cliUtil.callback);
    });
};
