var fs   = require('fs-extra');
var path = require('path');

var tmpDir = path.resolve(__dirname, '../.tmp');

var clearSync = module.exports.clearSync = function(cb) {
  if(!fs.existsSync(tmpDir)) return;
  fs.rmdirSync(tmpDir);
};

var initSync = module.exports.initSync = function(cb) {
  if(fs.existsSync(tmpDir)) {
    clearSync();
  }
  fs.mkdirSync(tmpDir);
};
