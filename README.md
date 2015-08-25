dmc
===

[![Build Status](https://travis-ci.org/kevinohara80/dmc.svg?branch=master)](https://travis-ci.org/kevinohara80/dmc)

*NOTE: `dmc` is currently in beta. Use at your own risk.*

`dmc` is a cross-platform, CLI developer tool for Salesforce.com. `dmc` aims
to provide a CLI interface to salesforce.com development that abstracts the
complexities of dealing with API's and metadata into a simple tool that
**_makes everything feel like local and remote file system operations_**. Basically,
the goal is to create a tool that is as intuitive to use as normal file system
tools like `cp` and `rsync`.

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
λ: dmc

  Usage: dmc [options] [command]


  Commands:

    init                             initialize a project for dmc
    config [options]                 show the resolved dmc configuration
    config:set [options] [items...]  set configuration variables
    logins                           list your salesforce logins
    login [options] <org>            login to a Salesforce organization
    logout [org]                     logout of a Salesforce organization
    use [options] <org>              quickly set your default org in your configruation
    index [options] [org]            indexes metadata for a target org
    open [org]                       open the target org in a browser window
    identity [options]               show the identity for the specified org
    deploy [options] [globs...]      deploy metadata to target org
    retrieve [options] [globs...]    retrieve metadata from target org
    watch [options] [globs...]       watch files and deploy metadata to target org
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

## Core Concepts

### Authentication

`dmc` uses a global authentication system. This means that org credentials
aren't stored on a project-by-project basis. Rather, `dmc` stores centrally
stores credentials that can be used wherever and whenever you need to. This
also comes in handy when you're working in a project but need to deploy it
to multiple targets.

### Globbing Patterns

One of the most powerful features of `dmc` is the ability to perform operations 
on metadata like `deploy` and `retrieve` using filesystem globbing patterns. 
The same globbing patterns you use for deploying will work for retrieving, 
and vice versa. The best way to understand this is to look at some examples:

```bash
$ dmc deploy src/classes/*            # deploy all classes
$ dmc retrieve src/{classes,pages}/*  # retrieve all classes and pages
$ dmc deploy src/**/*                 # deploy everything in src dir
$ dmc retrieve src/**/*               # retrieve all metadata (there will be a lot)
```

Globbing patterns are powerful. Here's some advanced examples.

```
$ dmc deploy src/{classes,pages}/Foo*  # would match FooClass.cls FooPage.page
```

`dmc` also supports multiple globs for deploys/retrieves.

```bash
$ dmc deploy src/classes/*_test.cls src/classes/MyClass* src/pages/MyPage*
```

More info on globbing pattens can be found [here](http://tldp.org/LDP/GNU-Linux-Tools-Summary/html/x11655.htm).

#### Important Note on Globbing and Shells

On \*nix system shells, globbing patterns are automatically processed by your
shell before the executable is called. This is fine for deploys but retrieves
require a bit of additional thought.

For example, let's say that you want to retrieve all classes but several of
those classes don't yet exist in your local `src/classes` directory. Running
this command would not really work...

```bash
$ dmc retrieve src/classes/*
```

This isn't reliable because the glob pattern will actually be processed by your
shell before the patterns are sent to `dmc`. Therefore, the only files that
would be retrieved would be the files that currently reside on your local
filesystem.

The good news is that this is easily fixed by wrapping the glob pattern(s) in
quotes.

```bash
$ dmc retrieve 'src/classes/*'  # this will get all remote classes
```

### Watching Files

`dmc` has a `watch` command that let's you listen to file changes and deploy
when files change. This gives you compile-on-save functionality while using
any editor or IDE that you like. It's easy...

```bash
$ dmc watch src/**/*  # watch files and deploy to your default org
```

```bash
$ dmc watch src/**/* --org myorg  # deploy to a specific org
```

### Configuration

`dmc` has a configuration system that allow a developer to set global
configuration options as well as override those at a project level.
Setting up project-level confiuration is completely optional.

## Contributing

**CURRENTLY SEEKING WINDOWS TESTERS/CONTRIBUTORS**

You're welcome and encouraged to contribute to `dmc`. Please just keep in
mind the following guidelines before submitting a PR.

* **API Additions**: Undoubtedly, the API will be expanding over time adding
new commands and functionality. This needs to be done carefully though. It's
easy for a tool like this to become a grab bag of commands. It's highly advised
that if you want to contribute and API addition/change, that you first submit
a proposal in the form of an issue to this repo. That way, we as a community
can determine whether or not it should be a part of the project before you
spend a bunch of your free time on building it.
* **PR Format**: When submitting a PR, please make sure of the following:
  * Include only a single commit. You can squash multiple commits with a rebase
  prior to submitting the PR.
  * Ensure your commit is rebased from the target branch.
  * Reference any issue numbers that the PR resolves
* **Tests**: Whenever possible, include unit tests with your PR.
* **Clean Builds**: There is a very simple gulp build included with this project
that runs jshint and unit tests. You are encouraged to run this before
submitting

## Roadmap

* Implementation of `.dmcignore`
* Execute anonymous
* Test Execution
* Lots of other stuff
