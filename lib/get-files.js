var Promise   = require('bluebird');
var glob      = require('glob');
var async     = require('async');
var _         = require('lodash');

// var globOpts = {
//   matchBase: true,
//   nodir: false,
//   noglobstar: false,
//   nomount: true
// };

module.exports = function(opts, cb) {

  opts = _.defaults(opts || {}, {
    globs: [],
    ignores: [],
    // not implemented yet
    includeMetaXML: false
  });

  return new Promise(function(resolve, reject) {

    var iterator = function(g, cb) {
      glob(g, {
        matchBase: true,
        nodir: true,
        noglobstar: false,
        nomount: true,
        ignore: opts.ignores
      }, cb);
    };

    async.concat(opts.globs, iterator, function(err, files) {
      if(err) return cb(err);

      if(!files || files.length < 1) {
        return reject(new Error('no files found'));
      }

      files = _(files)
        .uniq()
        // remove meta xml files
        .filter(function(f) {
          return (/\-meta\.xml$/.test(f) === false);
        })
        // remove base meta directories
        .filter(function(f) {
          return f.split('/').length > 2;
        })
        .value();

      resolve(files);
    });

  });
};
