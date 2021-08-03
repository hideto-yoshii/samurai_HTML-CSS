/**
 * Lambda Helpers
 *
 * Generic functions for helping with lambda related tasks
 **/

var path = require("path");
var supportedRuntimeExtensions = {
    "nodejs6.10": "js",
    "nodejs8.10": "js",
    "nodejs10.x": "js",
    "nodejs12.x": "js",
    "python2.7": "py",
    "python3.6": "py",
    "python3.7": "py",
    "python3.8": "py",
};

var generalSupportedEnvironmentExtensions = {
    node: "js",
    python: "py",
};

function getSupportedExtensions() {
    var supportedRuntimes = getSupportedRuntimes();
    var supportedExtensions = [];
    supportedRuntimes.forEach(function(runtime) {
        var supportedExtension = getExtensionForRuntime(runtime);
        if (supportedExtensions.indexOf(supportedExtension) < 0) {
            supportedExtensions.push(supportedExtension);
        }
    });
    return supportedExtensions;
}

function getSupportedRuntimes() {
    return Object.keys(supportedRuntimeExtensions);
}

function getExtensionForRuntime(runtime) {
    var extension = supportedRuntimeExtensions[runtime];
    if (extension) return extension;

    // Falling back to general, non version specific runtimes.
    var generalSupportedRuntimes = Object.keys(generalSupportedEnvironmentExtensions);
    for (var index in generalSupportedRuntimes) {
        var generalRuntime = generalSupportedRuntimes[index];
        if (runtime.indexOf(generalRuntime) === 0) {
            return generalSupportedEnvironmentExtensions[generalRuntime];
        }
    }

    return extension;
}

/**
 * Takes an array of serverless applications, discovers the matching physicalId
 * for the logicalId passed in.
 */
function getFunctionPhysicalId(samApps, samFilePath, logicalId) {
    // look through apps to see which samFilePath matches, then in that app, look for the function
    for (var i = 0; i < samApps.length; i++) {
        if (!samApps[i].functions && samApps[i].name === logicalId) {
            return samApps[i].physicalId;
        }
        if (samApps[i].path === samFilePath && samApps[i].functions) {
            var localFunctions = samApps[i].functions;
            for (var j = 0; j < localFunctions.length; j++) {
                var localFunction = localFunctions[j];
                if (localFunction.logicalId === logicalId) {
                    return localFunction.physicalId;
                }
            }
        }
    }
}

function convertHandlerToFileName(handler, runtime) {
    if (!handler || !runtime) return "index.js";

    var extension = getExtensionForRuntime(runtime);
    var fileName = handler.replace(/.[^.]+?$/, "." + extension);
    return fileName;
}

function normalizeCodeUri(codeUri) {
    if (typeof codeUri !== "string" || codeUri.startsWith("s3") || codeUri === ".debug/") {
        return "./";
    }

    return codeUri;
}

function convertHandlerToFilePath(handler, codeUri, runtime) {
    var extension = getExtensionForRuntime(runtime);
    var handlerFileName = handler.substr(0, handler.lastIndexOf(".")) + "." + extension;
    var handlerFilePath = path.join(normalizeCodeUri(codeUri), handlerFileName);
    return handlerFilePath;
}

function convertFileNameToHandler(filename) {
    var extension = path.extname(filename);
    var handler = filename.replace(extension, ".handler");
    return handler;
}

function getFolderName(filePath) {
    var folder = path
        .dirname(filePath)
        .split("/")
        .pop();
    if (folder === "") folder = "environment";

    return folder;
}

function removeAllChildren(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild);
    }
}

function hasHandlerWithPath(localFunction, applicationRoot, filePath) {
    var relativeHandlerPath = convertHandlerToFilePath(
        localFunction.handler,
        localFunction.codeUri,
        localFunction.runtime
    );
    var functionHandlerPath = path.join(applicationRoot, relativeHandlerPath);
    return functionHandlerPath === filePath;
}

function isFileInApplication(samApplication, filePath) {
    var samAppFunctions = samApplication.functions || [samApplication];
    for (var i = 0; i < samAppFunctions.length; i++) {
        var samAppFunction = samAppFunctions[i];
        var relativeHandlerPath = convertHandlerToFilePath(
            samAppFunction.handler,
            samAppFunction.codeUri,
            samAppFunction.runtime
        );
        var applicationRoot = path.dirname(samApplication.path);
        var functionHandlerPath = path.join(applicationRoot, relativeHandlerPath);
        if (functionHandlerPath === filePath) {
            return true;
        }
    }
    return false;
}

function getSamAppForHandlerFile(localFunctions, handlerFilePath) {
    for (var i = 0; i < localFunctions.length; i++) {
        var application = localFunctions[i];
        if (isFileInApplication(application, handlerFilePath)) {
            return application;
        }
    }
    return false;
}

function getSamAppForSamFile(localFunctions, samFilePath) {
    for (var i = 0; i < localFunctions.length; i++) {
        var application = localFunctions[i];
        // Normalize SAM files as yaml in case functions monitor doesn't agree
        var appPath = application.path.replace(/\.yml$/, ".yaml");
        var filePath = samFilePath && samFilePath.replace(/\.yml$/, ".yaml");
        if (appPath === filePath) {
            return application;
        }
    }
    return false;
}

function getApplicationNameFromSAMFilePath(samFilePath) {
    return getFolderName(samFilePath);
}

function stripNonAlphaNumericCharacters(str) {
    return String(str).replace(/[^0-9a-zA-Z]/gi, "");
}

function convertPhysicalIdToLogicalId(physicalFunctionId, stackName) {
    if (!stackName) return stripNonAlphaNumericCharacters(physicalFunctionId);

    var letter = 0;

    // Remove the stack name from the beginning of the physical ID
    while (
        physicalFunctionId.charAt(letter) === stackName.charAt(letter) &&
        totalDashesRemaining(physicalFunctionId.slice(letter)) >= 2
    ) {
        letter++;
    }

    // If there is a dash remaining at the beginning (from between stack and function name), remove it
    var logicalFunctionId = physicalFunctionId.slice(letter).replace(/^-/, "");

    // Remove the CloudFormation random character string that it puts at the end of every resource in stack
    logicalFunctionId = logicalFunctionId.replace(/-[A-Z0-9]{12,13}$/, "");

    return stripNonAlphaNumericCharacters(logicalFunctionId);
}

function totalDashesRemaining(word) {
    return (word.match(/-/g) || []).length;
}

function brieflyChangeSaveCaption(save, message) {
    save.setCaption(message);
    setTimeout(function() {
        if (save.getCaption() === message) {
            save.hideCaption();
        }
    }, 2000);
}

/**
 * Finds details for a Lambda function in a serverless application
 * @param {object} samApp - full serverless application object from local functions monitor
 * @param {string} logicalOrPhysicalId - logical or physical id of the Lambda function
 * @returns {object} Lambda function (codeuri, handler, runtime, etc.)
 */
function getFunctionDetails(samApp, logicalOrPhysicalId) {
    var lambdaFunctions = samApp.functions || [samApp];
    let functionDetails = lambdaFunctions.find(function(func) {
        return func.physicalId === logicalOrPhysicalId;
    });

    if (!functionDetails) {
        functionDetails = lambdaFunctions.find(function(func) {
            return func.logicalId === logicalOrPhysicalId;
        });
    }

    return functionDetails;
}

exports.lambdaHelpers = {
    getSupportedExtensions: getSupportedExtensions,
    getSupportedRuntimes: getSupportedRuntimes,
    getExtensionForRuntime: getExtensionForRuntime,
    getFunctionDetails: getFunctionDetails,
    getFunctionPhysicalId: getFunctionPhysicalId,
    convertHandlerToFileName: convertHandlerToFileName,
    convertHandlerToFilePath: convertHandlerToFilePath,
    convertFileNameToHandler: convertFileNameToHandler,
    getFolderName: getFolderName,
    removeAllChildren: removeAllChildren,
    hasHandlerWithPath: hasHandlerWithPath,
    isFileInApplication: isFileInApplication,
    getSamAppForHandlerFile: getSamAppForHandlerFile,
    getSamAppForSamFile: getSamAppForSamFile,
    getApplicationNameFromSAMFilePath: getApplicationNameFromSAMFilePath,
    convertPhysicalIdToLogicalId: convertPhysicalIdToLogicalId,
    brieflyChangeSaveCaption: brieflyChangeSaveCaption,
    normalizeCodeUri: normalizeCodeUri,
};
