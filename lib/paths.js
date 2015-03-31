var homeDir = process.env[(process.platform == 'win32') ?
  'USERPROFILE' :
  'HOME'] + '/.dmc';

module.exports = {
  dir: {
    home: homeDir,
    auth: homeDir + '/auth',
    index: homeDir + '/index'
  },

  file: {
    globalConfig: homeDir + '/dmc_config.json'
  }
};
