/* jshint expr: true */

var should       = require('should');
var configSchema = require('../lib/config-schema');

describe('lib/config-schema', function() {

  describe('#isValidProperty', function() {

    it('should return true for default_org', function(){
      should(configSchema.isValidProperty('default_org')).ok;
    });

    it('should return true for API_VERSION in caps', function(){
      should(configSchema.isValidProperty('API_VERSION')).ok;
    });

    it('should return false for foobar', function(){
      should(configSchema.isValidProperty('foobar')).not.ok;
    });

  });

  describe('#normalizeInput', function() {

    it('should accept normalize for default org', function() {
      var input = configSchema.normalizeInput('default_org', 'foobar');
      should.exist(input.name);
      should.exist(input.value);
      input.name.should.equal('default_org');
      input.value.should.equal('foobar');
    });

    it('should normalize numbers into strings for string props', function(){
      var input = configSchema.normalizeInput('default_org', 1000);
      should.exist(input.name);
      should.exist(input.value);
      input.name.should.equal('default_org');
      input.value.should.equal('1000');
    });

    it('should booleans numbers into strings for string props', function(){
      var input = configSchema.normalizeInput('default_org', true);
      should.exist(input.name);
      should.exist(input.value);
      input.name.should.equal('default_org');
      input.value.should.equal('true');
    });

    it('should convert floats to ints for int props', function(){
      var input = configSchema.normalizeInput('api_version', 32.03);
      should.exist(input.name);
      should.exist(input.value);
      input.name.should.equal('api_version');
      input.value.should.equal(32);
    });

    it('should convert strings to ints for int props', function(){
      var input = configSchema.normalizeInput('api_version', '32.03');
      should.exist(input.name);
      should.exist(input.value);
      input.name.should.equal('api_version');
      input.value.should.equal(32);
    });

  });

  describe('#getDefaultValue', function() {

    it('should return the default for api_version', function(){
      configSchema.getDefaultValue('api_version').should.be.within(1, 100);
    });

    it('should return the default for log_level', function(){
      configSchema.getDefaultValue('log_level').should.equal('info');
    });

    it('should return the default for colorize', function(){
      configSchema.getDefaultValue('colorize').should.equal(true);
    });

    it('should return the default for background', function(){
      configSchema.getDefaultValue('background').should.equal('light');
    });

  });

  describe('#getDefaultConfig', function() {

    it('should return the default properties', function(){
      var cfg = configSchema.getDefaultConfig();
      cfg.should.have.property('default_org', null);
      cfg.should.have.property('api_version', 32);
      cfg.should.have.property('colorize', true);
      cfg.should.have.property('log_level', 'info');
      cfg.should.have.property('background', 'light');
    });

  });

});
