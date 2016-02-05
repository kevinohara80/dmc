var minimatch = require('minimatch');
var _ = require('lodash');
var matchOpts = { matchBase: true };

module.exports.filterOnGlobs = function(paths, globs, ignores) {
  return _(paths)
    .filter(function(p) {
      var match = false;
      var ignored = false;

      // support a hash with filePath prop or string
      var path = p.filePath || p;

      // first process ignores from .gitignore
      if(ignores && ignores.length) {
        _.each(ignores, function(i) {
          if(minimatch(path, i, matchOpts)) {
            ignored = true;
            return false;
          }
        });
      }

      if(ignored === true) return false;

      // next process glob matches
      _.each(globs, function(g) {
        if(minimatch(path, g, matchOpts)) {
          match = true;
          return false;
        }
      });

      return match;
    })
    .value();
};