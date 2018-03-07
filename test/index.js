/* jshint expr: true */

var should = require('should');
var tmp    = require('./util/tmp');
var fs     = require('fs-extra');
var path   = require('path');
var paths  = require('../lib/paths');
var index  = require('../lib/index');
var _      = require('lodash');

describe('lib/index.js', function() {

  before(function(){
    tmp.initSync();
    fs.copySync(
      path.resolve(__dirname, './fixture/test_index.json'),
      paths.dir.index + '/test_index.json'
    );
  });

  describe('#init', function() {

    it('should initialize in a not loaded state', function(){
      var idx = index.init('test', {});
      idx.isLoaded().should.be.false;
      idx.getOrg().should.equal('test');
    });

    it('should throw when accessing filters when not loaded', function(){
      var idx = index.init('test', {});
      (function(){
        idx.getTypeFromName('ApexClass');
      }).should.throw;
    });

  });

  /* index#getFilePath */

  describe('index#getFilePath', function() {
    it('should return the proper file path', function(){
      var idx = index.init('abc');
      idx.getFilePath().should.equal(paths.dir.index + '/abc.json');
    });
  });

  /* index#exists */

  describe('index#exists', function(){
    it('should confirm that the test index exists', function(done) {
      var idx = index.init('test_index', {});
      idx.exists().then(function(exists) {
        exists.should.be.true;
      }).then(function() {
        done();
      }).catch(function(err) {
        err.should.not.exist;
        done(err);
      });
    });

    it('should return false when index doesn\'t exist', function(done) {
      var idx = index.init('noexist', {});
      idx.exists().then(function(exists) {
        exists.should.be.false;
      }).then(function() {
        done();
      }).catch(function(err) {
        err.should.not.exist;
        done(err);
      });
    });
  });

  /* index#loadFromFile */

  describe('index#loadFromFile', function() {

    it('should load the test index from file', function(done) {
      var idx = index.init('test_index', {});
      idx.loadFromFile().then(function() {
        idx.isLoaded().should.be.true;
        idx._index.should.be.an.Object;
      }).then(function() {
        done();
      }).catch(function(err) {
        should.not.exist(err);
        done(err);
      });
    });

    it('should error when the file doesn\'t exist', function(done) {
      var idx = index.init('noexist', {});
      idx.loadFromFile().then(function() {
        throw new Error('should have errored');
      }).then(function() {
        done();
      }).catch(function(err) {
        should.exist(err);
        done();
      });
    });

  });

  /* index#save */

  describe('index#save', function(){

    it('should return a promise', function(done) {
      var idx = index.init('test_index', {});
      idx.loadFromFile().then(function() {
        var result = idx.save();
        result.should.be.an.Object;
        result.should.have.property('then').which.is.a.Function;
        done();
      });
    });

    it('should allow for saving an index', function(done) {
      var idx = index.init('test_index', {});

      idx.loadFromFile().then(function() {
        return idx.save();
      }).then(function(){
        done();
      }).catch(function(err) {
        done(err);
      });
    });

  });

  /* index#getTypeFromName */

  describe('index#getTypeFromName', function() {

    var idx;

    before(function(done) {
      idx = index.init('test_index');
      idx.loadFromFile().then(function(){
        done();
      });
    });

    it('should return objects', function() {
      idx.getTypeFromName('CustomObject').should.be.an.Object;
    });

    it('should return triggers', function(){
      idx.getTypeFromName('ApexTrigger').should.be.an.Object;
    });

    it('should handle lower case arguments', function(){
      idx.getTypeFromName('apexclass').should.be.an.Object;
    });

  });

  /* index#getTypeFromExtension */

  describe('index#getTypeFromExtension', function() {

    var idx;

    before(function(done) {
      idx = index.init('test_index');
      idx.loadFromFile().then(function(){
        done();
      });
    });

    it('should return component', function() {
      idx.getTypeFromExtension('component').should.be.an.Object;
    });

    it('should return static resources', function() {
      idx.getTypeFromExtension('resource').should.be.an.Object;
    });

    it('should handle upper case arguments', function() {
      idx.getTypeFromExtension('CLS').should.be.an.Object;
    });

    it('should handle periods', function() {
      idx.getTypeFromExtension('.cls').should.be.an.Object;
    });

    it('should handle periods and upper case arguments', function() {
      idx.getTypeFromExtension('.CLS').should.be.an.Object;
    });

  });

  /* index#getTypeFromFolder */

  describe('index#getTypeFromFolder', function() {

    var idx;

    before(function(done) {
      idx = index.init('test_index');
      idx.loadFromFile().then(function(){
        done();
      });
    });

    it('should return objects', function() {
      idx.getTypeFromFolder('objects').should.be.an.Object;
    });

    it('should return triggers', function() {
      idx.getTypeFromFolder('triggers').should.be.an.Object;
    });

    it('should fail on wrong case', function() {
      should.not.exist(idx.getTypeFromFolder('TRIGGERS'));
    });

  });

  /* index#getTypesFromGlobs */

  describe('index#getTypesFromGlob', function() {

    var idx;

    before(function(done) {
      idx = index.init('test_index');
      idx.loadFromFile().then(function(){
        done();
      });
    });

    it('should match classes globs with no wildcard', function(){
      var types = idx.getTypesFromGlobs('src/classes/Test.cls');
      types.should.be.an.Array;
      types.length.should.equal(1);
      should(types[0].name).equal('ApexClass');
    });

    it('should match classes globs with wildcard', function(){
      var types = idx.getTypesFromGlobs('src/classes/*');
      types.should.be.an.Array;
      types.length.should.equal(1);
      should(types[0].name).equal('ApexClass');
    });

    it('should match classes globs with wildcard on folder', function(){
      var types = idx.getTypesFromGlobs('src/class*');
      types.should.be.an.Array;
      types.length.should.equal(1);
      should(types[0].name).equal('ApexClass');
    });

    it('should match classes on globstar for folder', function() {
      var types = idx.getTypesFromGlobs('src/**/*');
      types.should.be.an.Array;
      types.length.should.be.above(1);
      _.pluck(types, 'name').should.containEql('ApexClass');
    });

    it('should match classes on star glob on folder', function() {
      var types = idx.getTypesFromGlobs('src/*');
      types.should.be.an.Array;
      types.length.should.be.above(1);
      _.pluck(types, 'name').should.containEql('ApexClass');
    });

    it('should match on globstar all', function(){
      var types = idx.getTypesFromGlobs('**/*');
      types.should.be.an.Array;
      types.length.should.be.above(1);
      _.pluck(types, 'name').should.containEql('ApexClass');
    });

    it('should match on globstar all', function(){
      var types = idx.getTypesFromGlobs('**/*');
      types.should.be.an.Array;
      types.length.should.be.above(1);
      _.pluck(types, 'name').should.containEql('ApexClass');
    });

    it('should not match classes on pages glob', function(){
      var types = idx.getTypesFromGlobs('src/pages/*');
      types.should.be.an.Array;
      types.length.should.equal(1);
      _.pluck(types, 'name').should.not.containEql('ApexClass');
    });

    it('should support glob arrays and match classes with globstar', function() {
      var types = idx.getTypesFromGlobs(['src/**/*', 'src/pages/*']);
      types.should.be.an.Array;
      types.length.should.be.above(1);
      _.pluck(types, 'name').should.containEql('ApexClass');
    });

    it('should support glob arrays and match classes with class glob', function() {
      var types = idx.getTypesFromGlobs(['src/stat*', 'src/pages/*', 'src/cla*']);
      types.should.be.an.Array;
      types.length.should.be.above(1);
      _.pluck(types, 'name').should.containEql('ApexClass');
    });

  });

  after(function(){
    tmp.clearSync();
  });

});
