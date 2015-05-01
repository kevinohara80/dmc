var Promise = require('bluebird');
var glob    = require('glob');
var async   = require('async');
var _       = require('lodash');

module.exports = function(opts, cb) {

  opts = _.defaults(opts || {}, {
    globs: [],
    // not implemented yet
    includeMetaXML: false
  });

  return new Promise(function(resolve, reject) {

    var iterator = function(g, cb) {
      glob(g, {}, cb);
    };

    async.concat(opts.globs, iterator, function(err, files) {
      if(err) return cb(err);
      if(!files || files.length < 1) {
        return reject(new Error('no files found'));
      }
      files = _(files)
        .uniq()
        .value();
      resolve(files);
    });

  });
};
