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

`$ npm install -g dmc`

## Authentication

`dmc` uses a global authentication system. This means that org credentials
aren't stored on a project-by-project basis. Rather, `dmc` stores centrally
stores credentials that can be used whereever and whenever you need to. This
also comes in handy when you're working in a project but need to deploy it 
to multiple targets.

## Configuration

`dmc` has a configuration system that allow a developer to set global 
configuration options as well as override those at a project level. 
Setting up project-level confiuration is completely optional.
