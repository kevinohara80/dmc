#!/usr/bin/env node
var colors  = require('colors');
var program = require('commander');
var logger  = require('../lib/logger');
var version = require('../package.json').version;
var user    = require('../lib/user');
var config  = require('../lib/config');

// set initial log level
logger.setLogLevel(1);

// create the program
program
  .version(version)
  .option('--verbose', 'use verbose logging', function(){
    logger.setLogLevel(2);
  })
  .option('--silent', 'skip logging', function(){
    logger.setLogLevel(0);
  });

// helper function to load a command
function loadCommand(cmd) {
  require('../commands/' + cmd).cli(program);
}

// load up the individual commands
loadCommand('init');
loadCommand('config');
loadCommand('config-set');
loadCommand('logins');
loadCommand('login');
loadCommand('logout');
loadCommand('use');
loadCommand('index');
loadCommand('open');
loadCommand('identity');
// loadCommand('create');
loadCommand('deploy');
loadCommand('retrieve');
loadCommand('watch');
// loadCommand('destroy');
loadCommand('anon');
loadCommand('resources');
loadCommand('get');

// bootstraps any necessary config items
user.bootstrap()
.then(config.loadAll)
.then(config.configColors)
.then(function(){
  // starts the program
  program.parse(process.argv);

  if (process.argv.length < 3) {
    // show help by default
    program.parse([process.argv[0], process.argv[1], '-h']);
    logger.error('incorrect number of arguments');
    process.exit(0);
  } else {
    //warn aboud invalid commands
    var c = process.argv[2];

    var validCommands = program.commands.map(function(cmd){
      return cmd._name;
    });

    if(validCommands.indexOf(c) === -1) {
      logger.error('Invalid command: \'' + c + '\'');
      program.help();
      process.exit(1);
    }
  }
}).catch(function(err) {
  console.error(err.stack);
  logger.error('Unable to bootstrap necessary directories');
  logger.error(err.message);
  process.exit(1);
});
