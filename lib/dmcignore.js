var Promise = require('bluebird');
var fs      = require('./fs');
var _       = require('lodash');
var logger  = require('./logger');

var COMMENT_REGEX = /^\s*\#.*/i;

module.exports.load = function() {
  var filePath = process.cwd() + '/.dmcignore';
  return fs.existsAsync(filePath)
    .then(function(exists) {
      if(!exists) {
        return null;
      }
      logger.log('loaded .dmcignore');
      return fs.readFileAsync(filePath, { encoding: 'utf8' });
    }).then(function(file) {
      if(!file) return null;

      return _(file.split('\n'))
        .map(function(line) {
          // trim lines to remove whitespace
          return line.trim();
        })
        .filter(function(line) {
          // remove comment and regex lines
          return (!COMMENT_REGEX.test(line) && line.length > 0);
        })
        .map(function(line) {
          // process lines that start with /
          return (line[0] === '/') ? line.substring(1) : '**/' + line;
        })
        .reduce(function(result, line) {
          // split the line into two regexes
          result.push(line);
          result.push(line + '/**');
          return result;
        }, []);

    });
};
