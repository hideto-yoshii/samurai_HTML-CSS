#!/bin/sh
//bin/false || exec "$(command -v nodejs || command -v node)" "$0" "$@"

"use strict";

require("amd-loader");

const cp = require("child_process");
const os = require("os");
const mkdirp = require("mkdirp");
const path = require("path");
const FUNCTION_NOT_FOUND = 255;

const AWS = require("aws-sdk");
const credentials = new AWS.SharedIniFileCredentials({profile: "default"});
if (areCredentialsValid(credentials)) {
    AWS.config.credentials = credentials;
}

let awsRegion = "us-east-1";
let lambda;

function areCredentialsValid(credentials) {
    return credentials && credentials.accessKeyId && credentials.sessionToken;
}

function setRegion(region) {
    awsRegion = region;
    lambda = new AWS.Lambda({region: region, apiVersion: "2015-03-31"});
}

function updateFunctionCode(functionName, functionDir, callback) {
    createZipDirectoryBuffer(functionDir, (err, zipBuffer) => {
        if (err) {
            return callback(new Error("Function not zipped properly"));
        }
        let params = {
            FunctionName: functionName,
            ZipFile: zipBuffer,
        };

        lambda.updateFunctionCode(params, (err, data) => {
            if (err && err.code === FUNCTION_NOT_FOUND) {
                return callback(
                    new Error("Function name from config file not found in AWS account")
                );
            }

            if (err) {
                return callback(
                    new Error("Unknown error when attempting to update your function: " + err.stack)
                );
            }
            return callback(null, data);
        });
    });
}

function createZipDirectoryBuffer(functionDir, callback) {
    cp.execFile(
        "zip",
        ["-r", "-", "."],
        {
            cwd: functionDir,
            maxBuffer: Number.MAX_VALUE,
            encoding: "buffer",
        },
        function(err, buffer) {
            callback(err, buffer);
        }
    );
}

function importFunction(functionName, functionDir, callback) {
    let params = {
        FunctionName: functionName,
    };
    lambda.getFunction(params, (err, config) => {
        if (err) return callback(err);

        let codeUrl = config.Code.Location;
        config.Configuration.Region = awsRegion;

        getFunctionCode(codeUrl, (err, zipPath) => {
            if (err) return callback(err);

            extractZipFile(functionDir, zipPath, (err, dir) => {
                if (err) return callback(err);

                cp.execFile("rm", ["-rf", zipPath], (err, result) => {
                    if (err) {
                        return callback(err);
                    }
                    callback(err, JSON.stringify(config));
                });
            });
        });
    });
}

function getFunctionCode(codeUrl, callback) {
    let filename = path.join(os.tmpdir(), Date.now() + "_" + (Math.random() * 10e16).toString(36));

    cp.execFile("curl", [codeUrl, "-o", filename], (err) => {
        callback(err, filename);
    });
}

function extractZipFile(destinationDir, zipPath, callback) {
    mkdirp(destinationDir, (err) => {
        if (err) {
            return callback(err);
        }
        cp.execFile("unzip", ["-o", zipPath, "-d", destinationDir], () => {
            return callback(null, destinationDir);
        });
    });
}

function sendResponse(err, result) {
    if (err) return console.error(err.message);

    // console.log adds a newline so write strings directly to stdout
    if (typeof result === "string") return process.stdout.write(result);

    console.log(result || "OK");
}

const program = require("commander");

program
    .version("0.0.1")
    .option("-w, --function-dir <path>", "Function dir")
    .option("-p, --payload <json>", "Function payload")
    .option("-rp, --resource-path <json>", "Path of API resource")
    .option("-ai, --api-id <string>", "ID of API Gateway REST API")
    .option("-sfp, --sam-file-path <string>", "Path to SAM file")
    .option("-r, --region <string>", "Function region")
    .arguments("<cmd> [name]")
    .action(function(cmd, name) {
        const functionDir = path.resolve(program.functionDir || "");

        let region = program.region;
        setRegion(region || awsRegion);

        switch (cmd) {
            case "update":
                updateFunctionCode(name, functionDir, sendResponse);
                return;
            case "import-function":
                importFunction(name, functionDir, sendResponse);
                return;
            default:
                sendResponse(new Error("Invalid command: " + cmd));
                return;
        }
    });

if (!module.parent) {
    // Only run this if the file hasn't been require'd
    program.parse(process.argv);
}

/* Exported for testing only, this file should be invoked, not require'd */
module.exports = {
    updateFunctionCode: updateFunctionCode,
    createZipDirectoryBuffer: createZipDirectoryBuffer,
    importFunction: importFunction,
    extractZipFile: extractZipFile,
    setRegion: setRegion,
};
