const AWS = require("aws-sdk");

function LambdaClient(settings) {
    settings = settings || {};
    this.region = settings.region || "us-east-1";
    this.lambda = new AWS.Lambda({region: this.region, apiVersion: "2015-03-31"});

    this.getFunctionNameFromFunctionArn = function(functionArn) {
        let splitArn = functionArn.split(":");
        return splitArn[6];
    };

    this.getAccountIdFromFunctionArn = function(functionArn) {
        let splitArn = functionArn.split(":");
        return splitArn[4];
    };

    this.generateApiGatewayArn = function(accountId, apiId, resourcePathPart) {
        return (
            "arn:aws:execute-api:" +
            this.region +
            ":" +
            accountId +
            ":" +
            apiId +
            "/*/*/" +
            resourcePathPart
        );
    };
}

module.exports = LambdaClient;
