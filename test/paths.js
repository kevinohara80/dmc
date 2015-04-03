var should = require('should');
var path   = require('path');
var paths  = require('../lib/paths');

var tmpDirPath   = path.resolve(__dirname, './.tmp');

// directories
var homeDirPath  = tmpDirPath + '/user_home';
var localDirPath = tmpDirPath + '/project';
var authDirPath  = homeDirPath + '/auth';
var indexDirPath = homeDirPath + '/index';

// files
var globalConfigPath = homeDirPath + '/dmc_config.json';
var localConfigPath  = localDirPath + '/dmc_config.json';

describe('lib/paths', function() {

  it('should have the proper home dir path', function(){
    paths.dir.home.should.equal(homeDirPath);
  });

  it('should have the proper local dir path', function(){
    paths.dir.local.should.equal(localDirPath);
  });

  it('should have the proper auth dir path', function(){
    paths.dir.auth.should.equal(authDirPath);
  });

  it('should have the proper index dir path', function(){
    paths.dir.index.should.equal(indexDirPath);
  });

  it('should have the proper global dmc config file path', function(){
    paths.file.globalConfig.should.equal(globalConfigPath);
  });

  it('should have the proper local dmc config file path', function(){
    paths.file.localConfig.should.equal(localConfigPath);
  });

});
