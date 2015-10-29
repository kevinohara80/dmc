var _        = require('lodash');
var user     = require('../lib/user');
var index    = require('../lib/index');
var logger   = require('../lib/logger');
var paths    = require('../lib/paths');
var cliUtil  = require('../lib/cli-util');
var sfClient = require('../lib/sf-client');
var fs       = require('../lib/fs');
var resolve  = require('../lib/resolve');

var run = module.exports.run = function(opts, cb) {

  return resolve(cb, function() {

    var idx;

    return Promise.resolve()

    .then(function() {
      logger.log('indexing org: ' + opts.org);
      idx = index.init(opts.org, opts.oauth);
      return idx.fetch();
    })

    .then(function() {
      logger.log('indexing complete');
      logger.log('saving index');
      return idx.save();
    });

  });

};

module.exports.cli = function(program) {
  program.command('index [org]')
    .description('indexes metadata for a target org')
    .option('-a, --all', 'index all current orgs')
    .action(function(org, opts) {
      opts.org = org;
      opts._loadOrg = true;
      return cliUtil.executeRun(run)(opts);
    });
};
