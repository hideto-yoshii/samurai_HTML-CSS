/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "vs/nls", "vs/platform/instantiation/common/instantiation", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/base/common/buffer"], function (require, exports, nls_1, instantiation_1, configurationRegistry_1, platform_1, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IRequestService = instantiation_1.createDecorator('requestService');
    function isSuccess(context) {
        return (context.res.statusCode && context.res.statusCode >= 200 && context.res.statusCode < 300) || context.res.statusCode === 1223;
    }
    exports.isSuccess = isSuccess;
    function hasNoContent(context) {
        return context.res.statusCode === 204;
    }
    function asText(context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!isSuccess(context)) {
                throw new Error('Server returned ' + context.res.statusCode);
            }
            if (hasNoContent(context)) {
                return null;
            }
            const buffer = yield buffer_1.streamToBuffer(context.stream);
            return buffer.toString();
        });
    }
    exports.asText = asText;
    function asJson(context) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!isSuccess(context)) {
                throw new Error('Server returned ' + context.res.statusCode);
            }
            if (hasNoContent(context)) {
                return null;
            }
            const buffer = yield buffer_1.streamToBuffer(context.stream);
            return JSON.parse(buffer.toString());
        });
    }
    exports.asJson = asJson;
    platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration)
        .registerConfiguration({
        id: 'http',
        order: 15,
        title: nls_1.localize('httpConfigurationTitle', "HTTP"),
        type: 'object',
        properties: {
            'http.proxy': {
                type: 'string',
                pattern: '^https?://([^:]*(:[^@]*)?@)?([^:]+|\\[[:0-9a-fA-F]+\\])(:\\d+)?/?$|^$',
                markdownDescription: nls_1.localize('proxy', "The proxy setting to use. If not set, will be inherited from the `http_proxy` and `https_proxy` environment variables.")
            },
            'http.proxyStrictSSL': {
                type: 'boolean',
                default: true,
                description: nls_1.localize('strictSSL', "Controls whether the proxy server certificate should be verified against the list of supplied CAs.")
            },
            'http.proxyAuthorization': {
                type: ['null', 'string'],
                default: null,
                markdownDescription: nls_1.localize('proxyAuthorization', "The value to send as the `Proxy-Authorization` header for every network request.")
            },
            'http.proxySupport': {
                type: 'string',
                enum: ['off', 'on', 'override'],
                enumDescriptions: [
                    nls_1.localize('proxySupportOff', "Disable proxy support for extensions."),
                    nls_1.localize('proxySupportOn', "Enable proxy support for extensions."),
                    nls_1.localize('proxySupportOverride', "Enable proxy support for extensions, override request options."),
                ],
                default: 'override',
                description: nls_1.localize('proxySupport', "Use the proxy support for extensions.")
            },
            'http.systemCertificates': {
                type: 'boolean',
                default: true,
                description: nls_1.localize('systemCertificates', "Controls whether CA certificates should be loaded from the OS. (On Windows and macOS a reload of the window is required after turning this off.)")
            }
        }
    });
});
//# sourceMappingURL=request.js.map