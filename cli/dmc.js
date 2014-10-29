#!/usr/bin/env node
var fs      = require('fs');
var path    = require('path');
var program = require('commander');
var version = require('../package.json').version;
var user    = require('../lib/user');

program.version(version)

// helper function to load a command
function loadCommand(cmd) {
  require('./commands/' + cmd)(program);
}

// load up the individual commands
loadCommand('init');
loadCommand('deploy');

// bootstraps any necessary config items
user.bootstrap();

// starts the program
program.parse(process.argv);
if (!program.args.length) program.help();
