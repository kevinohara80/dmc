/* jshint expr: true */

var should = require('should');
var meta   = require('../lib/metadata');
var minimatch = require('minimatch');

var matchOpts = { matchBase: true };

describe('commands/retrieve', function(){

});

  // // testing getting type from name
  // describe('minimatch', function() {
  //
  //   it('should match directories on globstar', function() {
  //     var matcher = 'src/**/*';
  //
  //     should(
  //       minimatch('src/classes', matcher, matchOpts)
  //     ).be.true;
  //
  //     should(
  //       minimatch('src/pages/Test.page', matcher, matchOpts)
  //     ).be.true;
  //
  //     should(
  //       minimatch('src/documents/test/test.jpg', matcher, matchOpts)
  //     ).be.true;
  //
  //   });
  //
  //   it('should match base directories for test classes', function(){
  //
  //     var matcher = 'src/classes/Test*';
  //
  //     should(
  //       minimatch('src/classes/', matcher, matchOpts)
  //     ).be.true;
  //
  //
  //   });
  //
  // });

});
