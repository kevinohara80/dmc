#!/usr/bin/env node
var fs      = require('fs');
var colors  = require('colors');
var path    = require('path');
var program = require('commander');
var logger  = require('../lib/logger');
var version = require('../package.json').version;
var user    = require('../lib/user');

program.version(version);

// helper function to load a command
function loadCommand(cmd) {
  require('../commands/' + cmd).cli(program);
}

// load up the individual commands
loadCommand('init');
loadCommand('logins');
loadCommand('login');
loadCommand('logout');
loadCommand('open');
loadCommand('identity');
loadCommand('index');
loadCommand('create');
loadCommand('deploy');
loadCommand('retrieve');
loadCommand('anon');
loadCommand('resources');
loadCommand('get');

// bootstraps any necessary config items
user.bootstrap();

// starts the program
program.parse(process.argv);

if (!program.args.length) {
  // show help by default
  program.parse([process.argv[0], process.argv[1], '-h']);
  process.exit(0);
} else if(process.argv.length >= 3) {
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
