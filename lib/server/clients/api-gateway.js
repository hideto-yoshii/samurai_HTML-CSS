/**
 * API Gateway client
 *
 * Provides functions to easily use the API-Gateway API
 */

const AWS = require("aws-sdk");
const HttpError = require("http-error");

function APIGatewayClient(settings) {
    settings = settings || {};
    let region = settings.region || "us-east-1";

    const apigateway = new AWS.APIGateway({region: region, apiVersion: "2015-07-09"});

    this.getRestApiIdByName = function(apiName, callback) {
        this.listRestApis(function(err, restApis) {
            if (err) return callback(err);

            for (let i = 0; i < restApis.length; i++) {
                let restApi = restApis[i];
                if (restApi.name == apiName) {
                    return callback(null, restApi.id);
                }
            }

            callback(new HttpError.NotFound("Could not find rest api of name " + apiName));
        });
    };

    this.doesMethodExist = function(apiId, resourceId, httpMethod, callback) {
        apigateway.getMethod(
            {
                restApiId: apiId,
                resourceId: resourceId,
                httpMethod: httpMethod,
            },
            (err, details) => {
                if (err && err.statusCode == 404) return callback(null, false);

                callback(err, !!details);
            }
        );
    };

    this.doesMethodIntegrationExist = function(apiId, resourceId, httpMethod, callback) {
        apigateway.getIntegration(
            {
                restApiId: apiId,
                resourceId: resourceId,
                httpMethod: httpMethod,
            },
            (err, details) => {
                if (err && err.statusCode == 404) return callback(null, false);

                callback(err, !!details);
            }
        );
    };

    this.doesMethodResponseExist = function(apiId, resourceId, httpMethod, statusCode, callback) {
        apigateway.getMethodResponse(
            {
                restApiId: apiId,
                resourceId: resourceId,
                httpMethod: httpMethod,
                statusCode: statusCode,
            },
            (err, details) => {
                if (err && err.statusCode == 404) return callback(null, false);

                callback(err, !!details);
            }
        );
    };

    this.listRestApis = function(callback) {
        apigateway.getRestApis(
            {
                limit: 50,
            },
            (err, details) => {
                if (err) return callback(err);
                return callback(null, details.items);
            }
        );
    };

    this.getRestApi = function(restApiId, callback) {
        apigateway.getRestApi(
            {
                restApiId: restApiId,
            },
            (err, details) => {
                callback(err, details);
            }
        );
    };
}

module.exports = APIGatewayClient;
