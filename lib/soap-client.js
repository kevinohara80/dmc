var soap = require('soap');
var path = require('path');

var mdWsdl = path.resolve(__dirname, './wsdl/metadata.wsdl');

module.exports.createClient = function(oauth, cb) {
  soap.createClient(mdWsdl, function(err, client) {
    if(err) return cb(err);
    //client.setSecurity(new soap.BearerSecurity(oauth.access_token));

    var header = {
      'SessionHeader': {
        'sessionId': oauth.access_token
      }
    };
    var name = '';
    var xmlns = 'http://soap.sforce.com/2006/04/metadata';
    var ns = 'urn';
    //
    client.addSoapHeader(header, name, ns, xmlns);

    // var header = [
    //   '<SessionHeader>',
    //   '<sessionId>' + oauth.access_token + '</sessionId>',
    //   '</SessionHeader>'
    // ].join('');

    //var header = 'X-SFDC-Session: ' + oauth.access_token;

    //console.log(header);
    //client.addSoapHeader(null, '', null, xmlns);
    //client.addSoapHeader(header);
    return cb(null, client);
  });
};
