/*jslint
    node
*/

"use strict";

var R = require("ramda");

var defaultLogger = {
    log: console.log.bind(console)
};

var color = R.curry(
    (code, string) => "\u001b[" + code + "m" + string + "\u001b[0m"
);

var chalk = {
    bold: color(1),
    red: color(31),
    green: color(32),
    yellow: color(33),
    blue: color(34),
    grey: color(90)
};

function pad(length, s) {
    while (s.length < length) {
        s = s + " ";
    }
    return s;
}

module.exports = function report(file, lint, options) {
    var logger = options.logger || defaultLogger;
    var terse = options.terse;
    var fudge = (lint.option && lint.option.fudge) || 0;

    var c = (format, str) => (
        (options.color === undefined || options.color)
        ? chalk[format](str)
        : str
    );

    var fileMessage = "\n" + c("bold", file);

    if (!lint.ok) {
        if (terse) {
            lint.warnings.forEach(function (e) {
                var data = [
                    file,
                    e.line + fudge,
                    e.column + fudge,
                    e.message
                ];
                logger.log(data.join(":"));
            });
        } else {
            logger.log(fileMessage);
            lint.warnings.forEach(function (e, i) {
                var line = " // Line " + (e.line + fudge);
                line = line + ", Pos " + (e.column + fudge);

                logger.log(
                    pad(3, "#" + String(i + 1)) + " " + c("yellow", e.message)
                );
                logger.log("    " + lint.lines[e.line] + c("grey", line));
            });
        }
    } else {
        if (!options.quiet) {
            if (terse) {
                logger.log(".");
            } else {
                logger.log(fileMessage + " is " + c("green", "OK") + ".");
            }
        }
    }
};
