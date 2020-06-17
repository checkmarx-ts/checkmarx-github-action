## jslint-node

[![Known Vulnerabilities](https://snyk.io/test/github/nikoskalogridis/jslint-node/badge.svg?targetFile=package.json)](https://snyk.io/test/github/nikoskalogridis/jslint-node?targetFile=package.json)

Easily use [JSLint](http://jslint.com/) through the command line or node modules.

## Disclaimer

[JSLint](http://jslint.com/) is a program written by [Douglas Crockford](http://www.crockford.com/) that helps javascript developers write better code.

This module is just a node wrapper for this program. It is not written, supported or endorsed by the author of JSLint.

## Features

* Automatically fetches the latest version of JSLint from its [github repository](https://github.com/douglascrockford/JSLint)

* Supports glob file patterns

* Use JSLint in your node modules

* Supports watching files and lint them on change

## Install

Use npm to install it either globally or project based

```
npm install -g jslint-node
```

## Use

### Terminal

```
jslint [options] file_patterns...
```

Where options can be:

```
CLI tool options:
    -u, --update  - Update jslint.js file from 
                    https://raw.githubusercontent.com/douglascrockford/JSLint/master/jslint.js
    -v, --version - print the version of this module and also the current edition of JSLint and exit
    -w, --watch   - watch for file changes and run jslint only on changed files. Script never ends
    -q, --quiet   - produce output only on errors
    -t, --terse   - produce terse output
    -c, --color   - use ansi colors on terminal output (default is true), to disable enter -c=false, 
                    --color=false, --no-color or -no-c

JSLint options:
    -f, --fudge   - report lines/columns starting from 1 instead of 0 (default is true), to disable
                    use --no-fudge, --fudge=false, -f=false or --no-f
    -d, --devel   - assume development mode
```

If no local copy of the jslint.js file is found the program will attempt to download it from the github repository even without the `--update` flag

**Notice** that the only command line options passed to jslint are the fudge and devel options. The rest should be placed inside your source files that you want to jslint. It is the right place for these.

Also note that it is your responsibility to call this script with an update flag regulary to benefit from the latest version of JSLint. As a rule of thumb always update/jslint *before* commiting your code changes.

### Through your node code

```javascript

var linter = require("jslint-node");
// Executing the jslinter function takes a boolean flag for refreshing the local jslint.js file
// from the github repository or not and returns a promise. If no local jslint.js file is found the
// program will attempt to fetch the jslint.js file from the internet anyway
linter(true)
    .then(function (jslinter) {
        // which when it resolves it returns an object with the following properties:
        //   jslint:Function - the jslint function
        //   edition:string - the edition of the jslint program
        // you can now use the jslint function with the following signature:
        //   jslint(program:string, options:object, globals:[string])
        // and get the result object as described in JSLint program
        var result = jslinter.jslint("");
    });

```

## Security concerns

Since this module executes code fetched from the internet it sandboxes that code inside a plain V8 javascript engine with no access to the native node modules. So even if your internet connection, github gets hacked or in the unlikely event that D. Crockford turns to the dark side of the force your secrets won't be revealed.

But then again you are executing code fetched from NPM with your account priviledges. But that is a different story...

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for detailed change history

## License

See [LICENSE](LICENSE) file.
