/*jslint
    node
*/

"use strict";

var fs = require("fs");
var https = require("https");
var when = require("when");
var R = require("ramda");

function fetch(params) {
    return when.promise(function (resolve, reject) {
        https.get(
            params,
            function (response) {
                var data = "";
                response.on("data", function (chunk) {
                    data += chunk;
                });
                response.on("end", function () {
                    resolve(data);
                });
                response.on("error", function (error) {
                    reject(error);
                });
            }
        );
    });
}

function writeFile(filename, data) {
    return when.promise(function (resolve, reject) {
        fs.writeFile(filename, data, "utf8", function (err) {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
}

function readFile(path) {
    return when.promise(function (resolve, reject) {
        fs.readFile(path, "utf8", function (err, data) {
            if (err) {
                return reject(err);
            }
            resolve(data);
        });
    });
}

function download(request, filePath) {
    return fetch(request).then(R.partial(writeFile, [filePath]));
}

module.exports = {
    readFile,
    writeFile,
    fetch,
    download
};
