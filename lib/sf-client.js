var nforce  = require('nforce');
var tooling = require('nforce-tooling')(nforce);

var conn = nforce.createConnection({
  clientId: '3MVG9rFJvQRVOvk5nd6A4swCycqQ0Hogb20LB7z3ndy1lwwrBb99R3GSl09cTKHNcJhIEAY5ttEAczOfCxPJ5',
  clientSecret: 'NOSECRETSHERE',
  redirectUri: 'http://localhost:3000/oauth/_callback',
  apiVersion: 'v30.0',
  environment: 'production',
  mode: 'multi',
  plugins: ['tooling'],
  autoRefresh: true
});

module.exports = conn;
