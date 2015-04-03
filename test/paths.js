var should = require('should');
var path   = require('path');
var paths  = require('../lib/paths');

describe('lib/paths', function(){

  it('home dir should be test/fixture', function(){

    var fixturePath = path.resolve(__dirname, './fixture');

    paths.dir.local.should.equal(fixturePath);

  });

});
