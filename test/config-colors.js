var should       = require('should');
var configColors = require('../lib/config-colors');
var config = require('../lib/config');
var colors = require('colors');

describe('lib/config-colors', function() {
  it('should define logging colors', function() {
    configColors(config);
    should.exist(colors.list);
    should.exist(colors.create);
    should.exist(colors.update);
    should.exist(colors.destroy);
    should.exist(colors.unchanged);
    should.exist(colors.good);
    should.exist(colors.bad);
    should.exist(colors.log);
    should.exist(colors.highlight);
  });
  describe('when colorize is enabled', function() {
    beforeEach(function() {
      config.global().set('colorize', true);
    });

    describe('when background is dark', function() {
      beforeEach(function() {
        config.global().set('background', 'dark');
        configColors(config);
      });
      it('should color log messages grey', function() {
        'test'.log.should.equal('test'.grey);
      });
    });

    describe('when background is light', function() {
      beforeEach(function() {
        config.global().set('background', 'light');
        configColors(config);
      });
      it('should color log messages blue', function() {
        'test'.log.should.equal('test'.blue);
      });
    });
  });

  describe('when colorize is disabled', function() {
    beforeEach(function() {
      config.global().set('colorize', false);
      configColors(config);
    });
    it('should not colorize strings', function() {
      'test'.log.should.equal('test');
    });
  });
});
