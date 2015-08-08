dmc
===

*NOTE: `dmc` is currently in beta. Use at your own risk.*

`dmc` is a cross-platform, CLI developer tool for Salesforce.com. `dmc` aims
to provide a CLI interface to salesforce.com development that abstracts the 
complexities of dealing with API's and metadata into a simple tool that 
makes everything feel like local and remote file system operations.

`dmc` was built to be used on the command line but it's modules are exposed
in a way that make it able to be used as a regular node modules in your
programs. This means it can be integrated into build tools like grunt and
gulp, or even into more complex systems like CI.

## Installation

`npm install -g dmc`

## Getting Started

Entering `dmc` on the command line with no command argument will print
usage information.

```
$ dmc

  Usage: dmc [options] [command]


  Commands:

    init                             initialize a project for dmc
    config [options]                 show the resolved dmc configuration
    config:set [options] [items...]  set configuration variables
    logins                           list your salesforce logins
    login [options] <org>            login to a Salesforce organization
    logout [org]                     logout of a Salesforce organization
    index [options] [org]            indexes metadata for a target org
    open [org]                       open the target org in a browser window
    identity [options]               show the identity for the specified org
    deploy [options] [globs...]      deploy metadata to target org
    retrieve [options] [globs...]    retrieve metadata from target org
    resources [options]              list all of the available api resources

  Options:

    -h, --help     output usage information
    -V, --version  output the version number
    --verbose      use verbose logging
    --silent       skip logging
```

To view the usage info on any particular command, enter the dmc 
command and add the `--help` or `-h` flag. Example:

```
$ dmc config:set --help

  Usage: config:set [options] [items...]

  set configuration variables

  Options:

    -h, --help    output usage information
    -g, --global  Set the global config variable. Otherwise, local variable set
```

## Authentication

`dmc` uses a global authentication system. This means that org credentials
aren't stored on a project-by-project basis. Rather, `dmc` stores centrally
stores credentials that can be used wherever and whenever you need to. This
also comes in handy when you're working in a project but need to deploy it 
to multiple targets.

## Configuration

`dmc` has a configuration system that allow a developer to set global 
configuration options as well as override those at a project level. 
Setting up project-level confiuration is completely optional.
