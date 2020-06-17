/*jslint
    node
*/

"use strict";

var helpers = require("./helpers");
var vm = require("vm");
var path = require("path");

var jslintFilePath = path.resolve(__dirname, "jslint.js");
var requestObject = {
    host: "raw.githubusercontent.com",
    path: "/douglascrockford/JSLint/master/jslint.js"
};

function compileJSLint(jsLintProgram) {
    var vmInstance = new vm.Script(
        jsLintProgram + ";result = jslint(program, options, globals);",
        {timeout: 1000}
    );
    return function jslint(program, options, globals) {
        var sandbox = {
            program,
            options,
            globals
        };
        vmInstance.runInNewContext(sandbox, {timeout: 1000});
        return sandbox.result;
    };
}

function jslinter(update) {
    var jslintProgram = (
        update
        ? helpers.download(requestObject, jslintFilePath)
        : helpers.readFile(jslintFilePath).catch(function () {
            console.log(
                "failed opening local jslint.js trying to download..."
            );
            return helpers.download(requestObject, jslintFilePath);
        })
    );

    return jslintProgram.then(function (jsLintProgram) {
        var jslint = compileJSLint(
            jsLintProgram.replace(
                "export default Object.freeze(function jslint(",
                "const jslint = Object.freeze(function jslint("
            )
        );
        var result = jslint(jsLintProgram);
        if (!result.ok) {
            throw new Error(
                "JSLint did not approve itself! This should not happen!"
            );
        }
        return {
            jslint,
            edition: result.edition
        };
    });
}

module.exports = jslinter;
