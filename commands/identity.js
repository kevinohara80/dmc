var user       = require('../lib/user');
var logger     = require('../lib/logger');
var cliUtil    = require('../lib/cli-util');
var sfClient   = require('../lib/sf-client');
var resolveOrg = require('../lib/resolve-org');
var _          = require('lodash');

function flatten(obj, fields, pre) {
  _.forIn(obj, function(v, k) {
    if(pre) k = pre + '.' + k;
    if(_.isObject(v)) {
      flatten(v, fields, k);
    } else if(!fields || !fields.length || fields.indexOf(k) !== -1) {
      logger.list(k + ': ' + v);
    }
  });
}

var run = module.exports.run = function(opts, cb) {
  var oauth = opts.oauth;

  sfClient.getIdentity({ oauth: opts.oauth }).then(function(res) {
    flatten(res, opts.fields);
    cb();
  }).catch(function(err) {
    cb(err);
  });
};

module.exports.cli = function(program) {
  program.command('identity')
    .description('show the identity for the specified org')
    .option('-o, --org <org>', 'The Salesforce organization to use')
    .option('-f, --fields <fields>', 'Comma-separated fields to show. Use dot notation')
    .action(function(opts) {
      resolveOrg(opts.org).then(function(oauth){
        opts.oauth = oauth;
        run(opts, cliUtil.callback);
      }).catch(cliUtil.callback);
    });
};
