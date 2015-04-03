var should = require('should');
var tmp    = require('./util/tmp');
var fs     = require('fs');

var localTmp = __dirname + '/.tmp';

describe('test environment', function() {

  before(function(){
    tmp.initSync();
  });

  it('should set the environment variable TEST_MODE to true', function(){
    process.isTestMode.should.equal(true);
  });

  it('should have a tmp directory for testing', function(done){
    fs.exists(localTmp, function(exists) {
      if(!exists) done(new Error('.tmp directory does not exits'));
      else done();
    });
  });

  it('should have a user_home directory', function(done) {
    fs.exists(localTmp + '/user_home', function(exists) {
      if(!exists) done(new Error('local_home directory does not exits'));
      else done();
    });
  });

  it('should have a project directory', function(done) {
    fs.exists(localTmp + '/project', function(exists) {
      if(!exists) done(new Error('project directory does not exits'));
      else done();
    });
  });

  after(function(){
    tmp.clearSync();
  });

});
