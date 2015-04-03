var should = require('should');
var tmp    = require('./util/tmp');
var fs     = require('fs');

describe('test environment', function() {

  beforeEach(function(){
    tmp.initSync();
  });

  it('should set the environment variable TEST_MODE to true', function(){
    process.isTestMode.should.equal(true);
  });

  it('should have a tmp directory for testing', function(done){

    var localTmp = __dirname + '/.tmp';

    fs.exists(localTmp, function(exists) {
      if(!exists) done(new Error('.tmp directory does not exits'));
      else done();
    });

  });

  after(function(){
    tmp.clearSync();
  });

});
