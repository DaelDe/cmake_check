# cmake_check
Cmake_check is a linter for the [CMake language](https://cmake.org). It takes a set of user-defined 
rules and reports violations for CMakeLists.txt files and CMake modules.

CMake_check is a command line application suitable for continuous integration checks. This is 
especially useful for large source trees with hundreds of CMake files.

Cmake_check can be used to enforce a certain coding style or project/company guidelines. 

## Features
- recursive check of all CMake files in a given directory
- allows combination of checks to form custom rules
- a rule may consist of any number of [checks](doc/Checks.md)
- provides warning output that can be used by the 
  [jenkins warnings plugin](https://wiki.jenkins.io/display/JENKINS/Warnings+Plugin)

## Available checks
- require commands to exist
- only allow white-listed commands

### Planned checks
- require a specific command order
- constraints on specific command arguments
- comment checks
- maximum line length
- indentation checks

## Installation
Cmake_check uses [semantic versioning](https://semver.org/).

### Binaries
Each [release](https://github.com/DaelDe/cmake_check/releases) comes with a set 
of Linux and Windows binaries.

### NPM
Note: npm is not yet supported

`npm install -g cmake_check`

## Options

## Examples