var should = require('should');
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
  })

});
