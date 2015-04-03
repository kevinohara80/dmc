var fs   = require('fs-extra');
var path = require('path');

var tmpDir = path.resolve(__dirname, '../.tmp');

var existsSync = module.exports.existsSync = function() {
  return fs.existsSync(tmpDir);
};

var clearSync = module.exports.clearSync = function() {
  if(!existsSync(tmpDir)) return;
  fs.rmdirSync(tmpDir);
};

var initSync = module.exports.initSync = function() {
  if(fs.existsSync(tmpDir)) {
    clearSync();
  }
  fs.mkdirSync(tmpDir);
};
