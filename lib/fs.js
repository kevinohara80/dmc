var fs      = require('fs');
var Promise = require('bluebird');
var fse     = Promise.promisifyAll(require('fs-extra'));

// implement fs.exists to always resolve with boolean
fse.exists = function(file) {
  return new Promise(function(resolve, reject) {
    fs.exists(file, function(ex) {
      resolve(ex);
    });
  });
};

module.exports = fse;
