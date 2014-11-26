var user       = require('../lib/user');
var logger     = require('../lib/logger');
var cliUtil    = require('../lib/cli-util');
var sfClient   = require('../lib/sf-client');
var soapClient = require('../lib/soap-client');
var _          = require('lodash');

var run = module.exports.run = function(org, opts, cb) {
  var oauth = user.getCredential(org);
  soapClient.createClient(oauth, function(err, client) {
    if(err) return cb(err);

    var data = {
      'ListMetadataQuery': [
        { type: 'CustomObject' },
        { type: 'ApexClass' },
      ]
    };

    client.MetadataService.Metadata.listMetadata(data, function(err, res) {
      if(err) {
        return cb(err);
      }
      console.log(client.lastRequest);
      console.log('++++++++++++++++++++');
      _.each(res.result, function(r) {
        console.log(r.type + ': ' + r.fullName + ' (' + r.fileName + ')');
      });
      cb();
    })

  }, { headers: { 'X-SFDC-Session': oauth.access_token }});
}

module.exports.cli = function(program) {
  program.command('mdtest <org>')
  .description('list all of the available api resources')
  .action(function(org, opts) {
    cliUtil.checkForOrg(org);
    run(org, opts, cliUtil.callback);
  });
};
