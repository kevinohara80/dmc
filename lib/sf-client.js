var nforce   = require('nforce');
var user     = require('./user');
var logger   = require('./logger');
var Promise  = require('bluebird');
var config   = require('./config');
var _        = require('lodash');
var request  = require('request');
var tooling  = require('nforce-tooling')(nforce);
var metadata = require('nforce-metadata')(nforce);
var parseString = require('xml2js').parseString;

var DEFAULT_API = 'v33.0';

function onRefresh(newOauth, oldOauth, cb) {
  logger.log('sfdc token refresh');
  if(oldOauth.nick) {
    user.saveCredential(oldOauth.nick, newOauth).then(function(){
      cb();
    }).catch(function(err) {
      cb(err);
    });
  } else {
    cb();
  }
}

function getClient(oauth) {

  if(!oauth || !_.isObject(oauth)) {
    throw new Error('oauth must be supplied to getClient as an object');
  }

  return config.loadAll().then(function() {

    var apiVersion = config.get('apiVersion');

    var client =  nforce.createConnection({
      clientId: '3MVG9rFJvQRVOvk5nd6A4swCycqQ0Hogb20LB7z3ndy1lwwrBb99R3GSl09cTKHNcJhIEAY5ttEAczOfCxPJ5',
      redirectUri: 'http://localhost:3835/oauth/_callback',
      apiVersion: config.get('api_version') || DEFAULT_API,
      environment: oauth.environment || 'production',
      loginUri: oauth.loginUri || undefined,
      mode: 'single',
      oauth: oauth,
      plugins: ['tooling', 'meta'],
      metaOpts: {
        interval: 2000
      },
      autoRefresh: true,
      onRefresh: onRefresh
    });

    client.authenticateSOAP = function(opts, cb) {

      var self = this;

      return new Promise(function(resolve, reject) {

        if(!opts.username || !opts.password) {
          return reject(new Error('SOAP authentication requires user and pass'));
        }

        if(opts.securityToken) {
          opts.password += opts.securityToken;
        }

        var apiVersion = config.get('api_version') || DEFAULT_API;

        var body = [
          '<?xml version="1.0" encoding="utf-8" ?>',
          '<env:Envelope xmlns:xsd="http://www.w3.org/2001/XMLSchema"',
          '    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
          '    xmlns:env="http://schemas.xmlsoap.org/soap/envelope/">',
          '  <env:Body>',
          '   <n1:login xmlns:n1="urn:partner.soap.sforce.com">',
          '      <n1:username>' + opts.username + '</n1:username>',
          '     <n1:password>' + opts.password + '</n1:password>',
          '    </n1:login>',
          '</env:Body>',
          '</env:Envelope>'
        ].join('\n');

        var uri = 'https://login.salesforce.com/services/Soap/u/' + apiVersion + '.0';

        var headers = {
          'content-type': 'text/xml',
          'charset': 'utf-8',
          'SOAPAction': 'login'
        };

        request({ method: 'POST', uri: uri, body: body, headers: headers }, function(err, res, body) {
          if(err) return reject(err);
          
          parseString(body, function(err, parsed) {
            if(err) return reject(err);

            var pbody = parsed['soapenv:Envelope']['soapenv:Body'][0]['loginResponse'][0]['result'][0];

            var userId = pbody.userInfo[0].userId[0];
            var orgId = pbody.userInfo[0].organizationId[0];

            var oauth = {
              'access_token': pbody.sessionId[0],
              'instance_url': pbody.serverUrl[0].replace(/(\/services.*)$/, ''),
              'id': 'https://login.salesforce.com/id/' + orgId + '/' + userId,
              'token_type': 'SessionId'
            };

            if(self.mode === 'single') {
              self.oauth = oauth;
            }

            resolve(oauth);
          });

        });
      });
      
    };

    return client;
  });
}

// module.exports = conn;
module.exports.getClient = getClient;
