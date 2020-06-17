#!/usr/bin/env node

/*jslint
    node
*/

"use strict";

var nopt = require("nopt");
var glob = require("glob");
var watch = require("glob-watcher");
var when = require("when");
var R = require("ramda");
var debounce = require("lodash.debounce");
var report = require("../lib/reporter");
var jslinter = require("../lib");
var helpers = require("../lib/helpers");
var packageData = require("../package.json");
var commandOptions = {
    color: Boolean,
    terse: Boolean,
    version: Boolean,
    quiet: Boolean,
    update: Boolean,
    watch: Boolean,
    fudge: Boolean,
    devel: Boolean
};

function preprocessScript(script) {
    // Fix UTF8 with BOM
    if (script.charCodeAt(0) === 0xFEFF) {
        script = script.slice(1);
    }

    return script;
}

function watchFiles(jslint, files) {
    console.log("Watching files...");
    var watcher = watch(files);
    watcher.on("change", jslint);
    watcher.on("add", jslint);
}

var jslintFiles = R.curry(function (jslint, files) {
    return R.pipe(
        R.map(R.nAry(1, glob.sync)),
        R.flatten,
        R.map(jslint)
    )(files);
});

function jslintFile(jslint, options, path) {
    return helpers.readFile(path).then(function (program) {
        var result = jslint(preprocessScript(program), options.jslint);
        report(path, result, options);
        return result;
    });
}

function runMain(options) {
    options = nopt(commandOptions, {}, options || process.argv);
    options.jslint = {
        fudge: options.fudge !== false,
        devel: options.devel
    };
    if (options.update) {
        console.log("Downloading JSLint from github...");
    }
    jslinter(options.update).then(function (jslinter) {
        var lintFile = R.partial(jslintFile, [jslinter.jslint, options]);
        if (options.version) {
            console.log(
                "JSLint: " + jslinter.edition,
                "jslint-watch: " + packageData.version
            );
            return;
        }
        if (!options.argv.remain.length && !options.update) {
            console.log("No files specified.");
            console.log(
                "Usage: " + process.argv[1] +
                " [--" + Object.keys(commandOptions).sort().join("] [--") +
                "] [--] <scriptfile>..."
            );
            process.exit(1);
        }
        if (!options.argv.remain.length && options.update) {
            return console.log("JSLint: " + jslinter.edition);
        }
        if (options.watch) {
            watchFiles(debounce(lintFile, 200), options.argv.remain);
        } else {
            when.settle(jslintFiles(lintFile, options.argv.remain)).then(
                R.pipe(
                    R.reject(R.path(["value", "ok"])),
                    R.length,
                    process.exit.bind(process)
                )
            );
        }
    }).catch(console.log.bind(console));
}

runMain();
