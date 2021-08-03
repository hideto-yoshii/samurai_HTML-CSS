var chai = require("lib/chai/chai");
var assert = require("assert");
var expect = chai.expect;

expect.setupArchitectTest([
    "@aws/cloud9/plugins/c9.ide.lambda/server/helpers",
    {
        consumes: ["lambda.helpers"],
        provides: [],
        setup: main,
    },
]);

function main(options, imports, register) {
    var helpers = imports["lambda.helpers"];

    describe("getExtensionForRuntime", function() {
        it("Should return 'js' for 'nodejs6.10", function() {
            var runtime = "nodejs6.10";
            assert.equal(helpers.getExtensionForRuntime(runtime), "js");
        });

        it("Should return 'js' for 'nodejs12.x", function() {
            var runtime = "nodejs12.x";
            assert.equal(helpers.getExtensionForRuntime(runtime), "js");
        });
    });

    describe("getFunctionPhysicalId", function() {
        it("Should return a physicalId given a logical id", function() {
            var logicalId = "thisisitmichael";
            var samFilePath = "/thisisitmichael/thisisitmichael.yaml";
            var samApps = [
                {
                    name: "atest",
                    handler: "index.handler",
                    runtime: "nodejs12.x",
                    path: "/atest/atest.yaml",
                },
                {
                    name: "thisisitmichael",
                    functions: [
                        {
                            name: "thisisitmichael",
                            handler: "index.handler",
                            runtime: "nodejs6.10",
                            physicalId: "cloud9-thisisitmichael-thisisitmichael-JBJMYNG3QPWO",
                        },
                    ],
                    path: "/thisisitmichael/thisisitmichael.yaml",
                },
            ];
            var physicalId = "cloud9-thisisitmichael-thisisitmichael-JBJMYNG3QPWO";
            assert.equal(
                helpers.getFunctionPhysicalId(samApps, samFilePath, logicalId),
                physicalId
            );
        });

        it("Should work for single lambda functions", function() {
            var logicalId = "sosingle";
            var samFilePath = "/sosingle/sosingle.yaml";
            var samApps = [
                {
                    handler: "index.handler",
                    name: "sosingle",
                    path: samFilePath,
                    physicalId: "sosingle",
                },
            ];
            var physicalId = helpers.getFunctionPhysicalId(samApps, samFilePath, logicalId);
            assert.equal(physicalId, logicalId);
        });
    });

    describe("convertHandlerToFileName", function() {
        it("Should return index.js for index.handler and nodejs", function() {
            var handler = "index.handler";
            var runtime = "nodejs6.10";
            assert.equal(helpers.convertHandlerToFileName(handler, runtime), "index.js");
        });

        it("Should return custom.py for custom.funcand python", function() {
            var handler = "custom.func";
            var runtime = "python3.8";
            assert.equal(helpers.convertHandlerToFileName(handler, runtime), "custom.py");
        });

        it("Should return my.strange.file.js for my.strange.file.func nodejs", function() {
            var handler = "my.strange.file.func";
            var runtime = "nodejs12.x";
            assert.equal(helpers.convertHandlerToFileName(handler, runtime), "my.strange.file.js");
        });
    });

    describe("convertHandlerToFilePath", function() {
        it("Should return handler path for nodejs handler", function() {
            var handler = "myfunction/index.handler";
            var runtime = "nodejs6.10";
            var codeUri = "./";
            assert.equal(
                helpers.convertHandlerToFilePath(handler, codeUri, runtime),
                "myfunction/index.js"
            );
        });

        it("Should return handler path for any nodejs version handler", function() {
            var handler = "myfunction/index.handler";
            var runtime = "nodejs10.10";
            var codeUri = "./";
            assert.equal(
                helpers.convertHandlerToFilePath(handler, codeUri, runtime),
                "myfunction/index.js"
            );
        });

        it("Should return handler path for python handler", function() {
            var handler = "myfunction/custom.func";
            var runtime = "python3.8";
            var codeUri = "./";
            assert.equal(
                helpers.convertHandlerToFilePath(handler, codeUri, runtime),
                "myfunction/custom.py"
            );
        });

        it("Should return handler path for python3.7 handler", function() {
            var handler = "myfunction/custom.func";
            var runtime = "python3.7";
            var codeUri = "./";
            assert.equal(
                helpers.convertHandlerToFilePath(handler, codeUri, runtime),
                "myfunction/custom.py"
            );
        });

        it("Should return handler path for any python handler", function() {
            var handler = "myfunction/custom.func";
            var runtime = "python3.9";
            var codeUri = "./";
            assert.equal(
                helpers.convertHandlerToFilePath(handler, codeUri, runtime),
                "myfunction/custom.py"
            );
        });

        it("Should return handler path for nodejs handler with several dots in it", function() {
            var handler = "myfunction/my.strange.file.func";
            var runtime = "nodejs12.x";
            var codeUri = "./";
            assert.equal(
                helpers.convertHandlerToFilePath(handler, codeUri, runtime),
                "myfunction/my.strange.file.js"
            );
        });

        it("Should return the right handler path when handler is in app root directory", function() {
            var handler = "myfile.func";
            var runtime = "nodejs12.x";
            var codeUri = "./";
            assert.equal(helpers.convertHandlerToFilePath(handler, codeUri, runtime), "myfile.js");
        });

        it("Should return the right handler path when no codeUri is specified", function() {
            var handler = "myfunction/index.handler";
            var runtime = "nodejs6.10";
            var codeUri;
            assert.equal(
                helpers.convertHandlerToFilePath(handler, codeUri, runtime),
                "myfunction/index.js"
            );
        });

        it("Should return the right handler path when a string codeUri is specified", function() {
            var handler = "index.handler";
            var runtime = "nodejs6.10";
            var codeUri = "myfunction/";
            assert.equal(
                helpers.convertHandlerToFilePath(handler, codeUri, runtime),
                "myfunction/index.js"
            );
        });

        it("Should return the right handler path when an s3 codeUri is specified", function() {
            var handler = "myfunction/index.handler";
            var runtime = "nodejs6.10";
            var codeUri = "s3://blah-dee-blah";
            assert.equal(
                helpers.convertHandlerToFilePath(handler, codeUri, runtime),
                "myfunction/index.js"
            );
        });

        it("Should return the right handler path when an s3 object codeUri is specified", function() {
            var handler = "myfunction/index.handler";
            var runtime = "nodejs6.10";
            var codeUri = {
                Bucket: "mybucket-name",
                Key: "code.zip",
                Version: "121212",
            };
            assert.equal(
                helpers.convertHandlerToFilePath(handler, codeUri, runtime),
                "myfunction/index.js"
            );
        });

        it("Should return the right handler path when the codeUri is '.debug/'", function() {
            var handler = "aPyFunc/lambda_function.lambda_handler";
            var runtime = "python3.8";
            var codeUri = ".debug/";
            assert.equal(
                helpers.convertHandlerToFilePath(handler, codeUri, runtime),
                "aPyFunc/lambda_function.py"
            );
        });
    });

    describe("convertFileNameToHandler", function() {
        it("Should return index.handler for index.py", function() {
            var file = "index.py";
            assert.equal(helpers.convertFileNameToHandler(file), "index.handler");
        });

        it("Should return filename.handler for filename.js", function() {
            var file = "filename.js";
            assert.equal(helpers.convertFileNameToHandler(file), "filename.handler");
        });
    });

    describe("getFolderName", function() {
        it("Should return 'environment' when the file is in the root dir", function() {
            assert.equal(helpers.getFolderName("/file.yaml"), "environment");
        });

        it("Should get the folder correctly", function() {
            assert.equal(helpers.getFolderName("/one/file.yaml"), "one");
            assert.equal(helpers.getFolderName("/one/.hiddenyaml"), "one");
            assert.equal(helpers.getFolderName("/one/two/file.yaml"), "two");
        });
    });

    describe("hasHandlerWithPath", function() {
        it("Should return true if the app contains a handler with given path", function() {
            var localFunction = {
                handler: "index.handler",
                runtime: "nodejs12.x",
            };
            var appRoot = "/myapp";
            assert(helpers.hasHandlerWithPath(localFunction, appRoot, "/myapp/index.js"));
            assert(!helpers.hasHandlerWithPath(localFunction, appRoot, "/myapp/index2.js"));
        });

        it("Should return true if the app contains a handler within a subdirectory", function() {
            var localFunction = {
                handler: "myfunction/index.handler",
                runtime: "nodejs12.x",
            };
            var appRoot = "/myapp";
            assert(
                helpers.hasHandlerWithPath(localFunction, appRoot, "/myapp/myfunction/index.js")
            );
        });

        it("Should return true even if the app root is within another directory", function() {
            var localFunction = {
                handler: "index.handler",
                runtime: "nodejs12.x",
            };
            var appRoot = "/appParentDir/myapp";
            assert(
                helpers.hasHandlerWithPath(localFunction, appRoot, "/appParentDir/myapp/index.js")
            );
        });
    });

    describe("isFileInApplication", function() {
        it("Should tell if handler resides in app directory", function() {
            var localApplication = {
                functions: [
                    {
                        handler: "index.handler",
                        runtime: "nodejs12.x",
                    },
                    {
                        handler: "index2.handler",
                        runtime: "nodejs12.x",
                    },
                ],
                path: "/mydir/app.yaml",
            };
            assert.equal(helpers.isFileInApplication(localApplication, "/mydir/index2.js"), true);
            assert.equal(
                helpers.isFileInApplication(localApplication, "/yourdir/index2.js"),
                false
            );
        });

        it("Should work for single functions", function() {
            var localApplication = {
                path: "/mydir/app.yaml",
                handler: "index.handler",
                runtime: "nodejs12.x",
            };
            assert.equal(helpers.isFileInApplication(localApplication, "/mydir/index.js"), true);
            assert.equal(
                helpers.isFileInApplication(localApplication, "/mydir/notafunc.js"),
                false
            );
        });

        it("Should work for handlers that are deeper inside an app", function() {
            var localApplication = {
                functions: [
                    {
                        handler: "subdir/index.handler",
                        runtime: "nodejs12.x",
                    },
                ],
                path: "/mydir/app.yaml",
            };
            assert.equal(
                helpers.isFileInApplication(localApplication, "/mydir/subdir/index.js"),
                true
            );
            assert.equal(
                helpers.isFileInApplication(localApplication, "/mydir/subdir/notafunc.js"),
                false
            );
        });

        it("Should work for an app in the root directory", function() {
            var localApplication = {
                functions: [
                    {
                        handler: "subdir/index.handler",
                        runtime: "nodejs12.x",
                    },
                ],
                path: "/app.yaml",
            };
            assert.equal(helpers.isFileInApplication(localApplication, "/subdir/index.js"), true);
            assert.equal(
                helpers.isFileInApplication(localApplication, "/anotherdir/index.js"),
                false
            );
            assert.equal(helpers.isFileInApplication(localApplication, "/index.js"), false);
        });

        it("Should not return true if there is another app that starts with the same characters", function() {
            var localApplication = {
                name: "a",
                path: "/a/a.yaml",
                functions: [
                    {
                        name: "a",
                        handler: "index.handler",
                        runtime: "nodejs6.10",
                    },
                ],
            };
            var filePath = "/asdf/subfunc.js";
            assert.equal(helpers.isFileInApplication(localApplication, filePath), false);
        });
    });

    describe("getSamAppForHandlerFile", function() {
        it("Should tell if handler resides in app directory", function() {
            var samApp1 = {
                functions: [
                    {
                        handler: "index.handler",
                        runtime: "nodejs12.x",
                    },
                    {
                        handler: "index2.handler",
                        runtime: "nodejs12.x",
                    },
                ],
                path: "/yourdir/app.yaml",
            };
            var samApp2 = {
                functions: [
                    {
                        handler: "index.handler",
                        runtime: "nodejs12.x",
                    },
                    {
                        handler: "index2.handler",
                        runtime: "nodejs12.x",
                    },
                ],
                path: "/mydir/app.yaml",
            };
            var samApps = [samApp1, samApp2];
            assert.equal(helpers.getSamAppForHandlerFile(samApps, "/mydir/index2.js"), samApp2);
            assert(!helpers.getSamAppForHandlerFile(samApps, "/theirdir/index2.js"));
        });
    });

    describe("getSamAppForSamFile", function() {
        it("Should get the application a SAM file belongs to", function() {
            var samApp1 = {
                functions: [
                    {
                        handler: "index.handler",
                        runtime: "nodejs12.x",
                    },
                    {
                        handler: "index2.handler",
                        runtime: "nodejs12.x",
                    },
                ],
                path: "/yourdir/app.yaml",
            };
            var samApps = [samApp1];
            assert.equal(helpers.getSamAppForSamFile(samApps, "/yourdir/app.yaml"), samApp1);
            assert(!helpers.getSamAppForSamFile(samApps, "/theirdir/app.yaml"));
        });

        it("Should accept yaml and yml files", function() {
            var samApp1 = {
                functions: [
                    {
                        handler: "index.handler",
                        runtime: "nodejs12.x",
                    },
                    {
                        handler: "index2.handler",
                        runtime: "nodejs12.x",
                    },
                ],
                path: "/yourdir/app.yaml",
            };
            var samApp2 = {
                functions: [
                    {
                        handler: "index.handler",
                        runtime: "nodejs12.x",
                    },
                    {
                        handler: "index2.handler",
                        runtime: "nodejs12.x",
                    },
                ],
                path: "/mydir/app.yml",
            };
            var samApps = [samApp1, samApp2];
            assert.equal(helpers.getSamAppForSamFile(samApps, "/yourdir/app.yaml"), samApp1);
            assert.equal(helpers.getSamAppForSamFile(samApps, "/yourdir/app.yml"), samApp1);

            assert.equal(helpers.getSamAppForSamFile(samApps, "/mydir/app.yaml"), samApp2);
            assert.equal(helpers.getSamAppForSamFile(samApps, "/mydir/app.yml"), samApp2);
        });
    });

    describe("convertPhysicalIdToLogicalId", function() {
        it("Should do nothing for existing logical id's without a stack name", function() {
            var physicalFunctionId = "myfunction";
            var stackName = undefined;
            var expectedLogicalFunctionId = "myfunction";
            assert.equal(
                helpers.convertPhysicalIdToLogicalId(physicalFunctionId, stackName),
                expectedLogicalFunctionId
            );
        });

        it("Should only remove the stack name from the beginning of the function", function() {
            var physicalFunctionId = "cloud9-best-myfunc-cloud9-best-ABCDEF123456";
            var stackName = "cloud9-best";
            var expectedLogicalFunctionId = "myfunc-cloud9-best";
            assert.equal(
                helpers.convertPhysicalIdToLogicalId(physicalFunctionId, stackName),
                expectedLogicalFunctionId
            );
        });

        it("Should work for this serverless application repository function", function() {
            var physicalFunctionId =
                "aws-serverless-repository-reddit-HeadlineFunction-1G5Q76RS7N5H";
            var stackName = "aws-serverless-repository-reddit-headline-sms";
            var expectedLogicalFunctionId = "HeadlineFunction";
            assert.equal(
                helpers.convertPhysicalIdToLogicalId(physicalFunctionId, stackName),
                expectedLogicalFunctionId
            );
        });

        it("Should work for this test sam application with a long app name", function() {
            var physicalFunctionId =
                "cloud9-thissamapplicationhasareallylongname-myfunc-1GB4BO2XCV8K8";
            var stackName = "cloud9-thissamapplicationhasareallylongnametoseewhereitiscut";
            var expectedLogicalFunctionId = "myfunc";
            assert.equal(
                helpers.convertPhysicalIdToLogicalId(physicalFunctionId, stackName),
                expectedLogicalFunctionId
            );
        });

        it("Should work for this test sam application with a long app name and a function with a long name", function() {
            var physicalFunctionId =
                "cloud9-thissamapplicationhasareal-funcnameislonger-1EUBRS6PU1YBO";
            var stackName = "cloud9-thissamapplicationhasareallylongname2";
            var expectedLogicalFunctionId = "funcnameislonger";
            assert.equal(
                helpers.convertPhysicalIdToLogicalId(physicalFunctionId, stackName),
                expectedLogicalFunctionId
            );
        });

        it("Should work for this test sam application where the app name also contains the function name at the end", function() {
            var physicalFunctionId =
                "cloud9-thisstacknameflowsintothenameo-functionname-RF03CYLGJSQR";
            var stackName = "cloud9-thisstacknameflowsintothenameo-functionname";
            var expectedLogicalFunctionId = "functionname";
            assert.equal(
                helpers.convertPhysicalIdToLogicalId(physicalFunctionId, stackName),
                expectedLogicalFunctionId
            );
        });
    });

    describe("getFunctionDetails", function() {
        var samApp;
        beforeEach(function() {
            samApp = {
                functions: [
                    {
                        name: "myfunc",
                        runtime: "python5.9",
                    },
                    {
                        name: "anotherfunc",
                        runtime: "nodejs11",
                    },
                ],
            };
        });

        it("Should return function details if the function of the name exists", function() {
            var myFuncDetails = helpers.getFunctionDetails(samApp, "myfunc");
            assert.equal(myFuncDetails.runtime, "python5.9");
            var anotherFuncDetails = helpers.getFunctionDetails(samApp, "anotherfunc");
            assert.equal(anotherFuncDetails.runtime, "nodejs11");
        });

        it("Should return nothing if the function of that name does not exist", function() {
            var missingFuncDetails = helpers.getFunctionDetails(samApp, "missingFunc");
            assert(!missingFuncDetails);
        });
    });

    register();
}
