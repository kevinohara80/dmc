var Promise = require('bluebird');
var fs      = require('./fs');
var _       = require('lodash');

module.exports.load = function() {
  var filePath = process.cwd() + '/.dmcignore';
  console.log('checking for file: ' + filePath);
  return fs.existsAsync(filePath)
    .then(function(exists) {
      if(!exists) {
        console.log('doesnt exist');
        return null;
      }
      return fs.readFileAsync(filePath, { encoding: 'utf8' });
    }).then(function(file) {
      if(!file) return null;

      return _(file.split('\n'))
        .map(function(l) {
          return l.replace(/(\#.*)/i, '').trim();
        })
        .filter(function(l) {
          return (l.length > 0);
        })
        .value();
    });
};
