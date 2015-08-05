dmc
===

`dmc` is a cross-platform, developer tool for Salesforce.com.

**BETTER DOCS COMING SOON**

NOTE: `dmc` is currently in beta. Use at your own risk.

## Installation

`$ npm install -g dmc`

## Usage

```
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
