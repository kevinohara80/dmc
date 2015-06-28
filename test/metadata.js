/* jshint expr: true */

var should = require('should');
var _      = require('lodash');
var meta   = require('../lib/metadata');

describe('lib/metadata', function(){

  // testing getting type from name
  describe('#getTypeFromName', function() {

    it('should return objects', function() {
      meta.getTypeFromName('CustomObject').should.be.an.Object;
    });

    it('should return triggers', function(){
      meta.getTypeFromName('ApexTrigger').should.be.an.Object;
    });

    it('should handle lower case arguments', function(){
      meta.getTypeFromName('apexclass').should.be.an.Object;
    });

  });

  //testing getting type from extension
  describe('#getTypeFromExtension', function() {

    it('should return component', function() {
      meta.getTypeFromExtension('component').should.be.an.Object;
    });

    it('should return static resources', function() {
      meta.getTypeFromExtension('resource').should.be.an.Object;
    });

    it('should handle upper case arguments', function() {
      meta.getTypeFromExtension('CLS').should.be.an.Object;
    });

    it('should handle periods', function() {
      meta.getTypeFromExtension('.cls').should.be.an.Object;
    });

    it('should handle periods and upper case arguments', function() {
      meta.getTypeFromExtension('.CLS').should.be.an.Object;
    });

  });

  // testing getting type from folder
  describe('#getTypeFromFolder', function(){

    it('should return objects', function() {
      meta.getTypeFromFolder('objects').should.be.an.Object;
    });

    it('should return triggers', function() {
      meta.getTypeFromFolder('triggers').should.be.an.Object;
    });

    it('should handle upper case arguments', function() {
      meta.getTypeFromFolder('TRIGGERS').should.be.an.Object;
    });
  });

  describe('#getTypesFromGlob', function(){

    it('should match classes globs with no wildcard', function(){
      var types = meta.getTypesFromGlobs('src/classes/Test.cls');
      types.should.be.an.Array;
      types.length.should.equal(1);
      should(types[0].name).equal('ApexClass');
    });

    it('should match classes globs with wildcard', function(){
      var types = meta.getTypesFromGlobs('src/classes/*');
      types.should.be.an.Array;
      types.length.should.equal(1);
      should(types[0].name).equal('ApexClass');
    });

    it('should match classes globs with wildcard on folder', function(){
      var types = meta.getTypesFromGlobs('src/class*');
      types.should.be.an.Array;
      types.length.should.equal(1);
      should(types[0].name).equal('ApexClass');
    });

    it('should match classes on globstar for folder', function() {
      var types = meta.getTypesFromGlobs('src/**/*');
      types.should.be.an.Array;
      types.length.should.be.above(1);
      _.pluck(types, 'name').should.containEql('ApexClass');
    });

    it('should match classes on star glob on folder', function() {
      var types = meta.getTypesFromGlobs('src/*');
      types.should.be.an.Array;
      types.length.should.be.above(1);
      _.pluck(types, 'name').should.containEql('ApexClass');
    });

    it('should match on globstar all', function(){
      var types = meta.getTypesFromGlobs('**/*');
      types.should.be.an.Array;
      types.length.should.be.above(1);
      _.pluck(types, 'name').should.containEql('ApexClass');
    });

    it('should match on globstar all', function(){
      var types = meta.getTypesFromGlobs('**/*');
      types.should.be.an.Array;
      types.length.should.be.above(1);
      _.pluck(types, 'name').should.containEql('ApexClass');
    });

    it('should not match classes on pages glob', function(){
      var types = meta.getTypesFromGlobs('src/pages/*');
      types.should.be.an.Array;
      types.length.should.equal(1);
      _.pluck(types, 'name').should.not.containEql('ApexClass');
    });

    it('should support glob arrays and match classes with globstar', function() {
      var types = meta.getTypesFromGlobs(['src/**/*', 'src/pages/*']);
      types.should.be.an.Array;
      types.length.should.be.above(1);
      _.pluck(types, 'name').should.containEql('ApexClass');
    });

    it('should support glob arrays and match classes with class glob', function() {
      var types = meta.getTypesFromGlobs(['src/stat*', 'src/pages/*', 'src/cla*']);
      types.should.be.an.Array;
      types.length.should.be.above(1);
      _.pluck(types, 'name').should.containEql('ApexClass');
    });

  });

});
