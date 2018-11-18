<a name="___top"></a>
[![NPM](https://nodei.co/npm/cmake_check.png)](https://nodei.co/npm/cmake_check/)

[![Build status](https://travis-ci.org/DaelDe/cmake_check.svg?branch=master)](https://travis-ci.org/DaelDe/cmake_check)
[![Known Vulnerabilities](https://snyk.io/test/github/DaelDe/cmake_check/badge.svg?targetFile=package.json)](https://snyk.io/test/github/DaelDe/cmake_check?targetFile=package.json)

# cmake_check
Cmake_check is a linter for the [CMake language](https://cmake.org). It takes a set of user-defined 
rules and reports violations for CMakeLists.txt files and CMake modules.

*   [Quick Start](#Quick_Start)
*   [Overview](#Overview)
*   [Download](https://github.com/DaelDe/cmake_check/releases/latest)
    *   [Binaries](#binaries)
    *   [Npm](#npm)
*   [Versioning](#Versioning)
*   [Basic Usage](#basic_usage)
    *   [Configuration](#config)
*   [How it Works](#How_it_works)
*   [Limitations](#Limitations)
*   [Features Currently in Development](#in_progress)

<a name="Quick_Start"></a>  
# [Quick Start &#9650;](#___top "click to go to top of document")

Step 1:  Download cmake_check (several methods, see below).

Step 2:  Open a terminal (`cmd.exe` on Windows).

Step 3:  Invoke cmake_check to check your CMake files or directories.
The executable name differs depending on whether you use the
development source version (`cmake_check`), a Windows executable
(`cmake_check.exe`) or , a Linux executable
(`cmake_check`).  On this page, `cmake_check` is the generic term
used to refer to any of these.

**a file**
<pre>
prompt> cmake_check -i CMakeLists.txt -v
info: Checking CMakeLists.txt
CMakeLists(10).txt (66) : warning Whitelist: calls to some_custom_function are not allowed by whitelist
info: Checked 1 files
info: 0 files are clean
info: 1 files have 2 warnings
info: 0 files are ignored
info: took {"durationMs":28}
</pre>

**a directory**
<pre>
prompt> cmake_check -i project_folder -v
info: Checking files in project_folder
project_folder/libFoo/CMakeLists.txt (66) : warning Whitelist: calls to some_custom_function are not allowed by whitelist
project_folder/libBar/CMakeLists.txt (50) : warning Whitelist: calls to some_other_custom_function are not allowed by whitelist
...
info: Checked 769 files
info: 186 files are clean
info: 583 files have 1566 warnings
info: 0 files are ignored
info: took {"durationMs":2270}
</pre>

<a name="Overview"></a>
# [Overview &#9650;](#___top "click to go to top of document")

Cmake_check is a linter for the [CMake language](https://cmake.org). It takes a set of user-defined 
rules and reports violations for CMakeLists.txt files and CMake modules.
CMake_check is a command line application suitable for continuous integration checks. This is 
especially useful for large source trees with hundreds of CMake files.
Cmake_check can be used to enforce a certain coding style or project/company guidelines. It is
written in TypeScript and runs on every platform where node.js is available.

Features are:
- recursive check of all CMake files in a given directory
- allows combination of checks to form custom rules
- a rule may consist of any number of [checks](doc/Checks.md)
- provides warning output (msbuild format) that can be used by the 
  [jenkins warnings plugin](https://wiki.jenkins.io/display/JENKINS/Warnings+Plugin)

Available checks:
- require commands to exist (or not exist)
- allow white-listed commands only (to limit the use of custom functions)

Planned checks:
- require a specific command order
- constraints on specific command arguments
- constraints on paths (e.g. no ..)
- comment checks
- maximum line length
- indentation checks

<a name="binaries"></a>
## [Binaries &#9650;](#___top "click to go to top of document")
Each [release](https://github.com/DaelDe/cmake_check/releases) comes with a set 
of Linux and Windows binaries.

<a name="npm"></a>
## [NPM &#9650;](#___top "click to go to top of document")
Install [NodeJS](https://nodejs.org/) (version > 8.11).
```sh
npm install -g cmake_check
```

<a name="Versioning"></a>
# [Versioning &#9650;](#___top "click to go to top of document")
Cmake_check uses [semantic versioning](https://semver.org/).

<a name="basic_usage"></a>
# [Basic Usage &#9650;](#___top "click to go to top of document")
The basic use is:
```sh
cmake_check -i <input folder or file>
```
or with custom configuration:
```sh
cmake_check -c <config file> -i <input folder or file>
```

All CMake files in the given input folders are analyzed with the given configuration.
All warnings are written to stdout.

For more information and further available options call `cmake_check -h`.

<a name="config"></a>
## [Configuration &#9650;](#___top "click to go to top of document")
The documentation for the cmake_check configuration is available on 
a [separate page](doc/Configuration.adoc).

<a name="How_it_works"></a>
# [How It Works &#9650;](#___top "click to go to top of document")

Cmake_check uses a [parser-generator](https://github.com/pegjs/pegjs)
and a [grammar](https://github.com/DaelDe/cmake_check/blob/readme/res/cmake.pegjs) 
to create a parser of the [CMake language](https://cmake.org/cmake/help/latest/manual/cmake-language.7.html).
All CMakeLists.txt files from input are parsed to a structured object. 
All configured checks are executed on that object. Failed checks are 
printed as warnings.

<a name="Limitations"></a>
# [Limitations](#___top "click to go to top of document")
- the language parser will fail on CMakeLists.txt files that do not conform to the CMake language
  - these errors are reported by CMake itself, a successful run of CMake on the input files is a precondition for cmake_check

<a name="in_progress"></a>
# [Features under development &#9650;](#___top "click to go to top of document")
See the [development board](https://github.com/DaelDe/cmake_check/projects/2) for issues that are in work.

