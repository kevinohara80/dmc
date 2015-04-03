var path = require('path');

var homeDir;
var localDir;

if(!process.isTestMode) {
  homeDir = process.env[(process.platform === 'win32') ?
    'USERPROFILE' :
    'HOME'] + '/.dmc';

  localDir = process.cwd();
} else {
  homeDir = path.resolve(__dirname, '../test/.tmp/user_home');
  localDir = path.resolve(__dirname, '../test/.tmp/project');
}

module.exports = {
  dir: {
    home: homeDir,
    auth: homeDir + '/auth',
    index: homeDir + '/index',
    local: localDir
  },

  file: {
    globalConfig: homeDir + '/dmc_config.json',
    localConfig: localDir + '/dmc_config.json'
  }
};
