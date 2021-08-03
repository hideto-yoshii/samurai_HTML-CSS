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
define(["require", "exports", "vs/workbench/api/common/extHost.api.impl", "vs/workbench/api/common/extHostExtensionService", "vs/base/common/strings", "vs/workbench/api/common/extHostRequireInterceptor"], function (require, exports, extHost_api_impl_1, extHostExtensionService_1, strings_1, extHostRequireInterceptor_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class WorkerRequireInterceptor extends extHostRequireInterceptor_1.RequireInterceptor {
        _installInterceptor() { }
        getModule(request, parent) {
            for (let alternativeModuleName of this._alternatives) {
                let alternative = alternativeModuleName(request);
                if (alternative) {
                    request = alternative;
                    break;
                }
            }
            if (this._factories.has(request)) {
                return this._factories.get(request).load(request, parent, () => { throw new Error('CANNOT LOAD MODULE from here.'); });
            }
            return undefined;
        }
    }
    class ExtHostExtensionService extends extHostExtensionService_1.AbstractExtHostExtensionService {
        _beforeAlmostReadyToRunExtensions() {
            return __awaiter(this, void 0, void 0, function* () {
                // initialize API and register actors
                const apiFactory = this._instaService.invokeFunction(extHost_api_impl_1.createApiFactoryAndRegisterActors);
                this._fakeModules = this._instaService.createInstance(WorkerRequireInterceptor, apiFactory, this._registry);
                yield this._fakeModules.install();
            });
        }
        _loadCommonJSModule(module, activationTimesBuilder) {
            return __awaiter(this, void 0, void 0, function* () {
                module = module.with({ path: ensureSuffix(module.path, '.js') });
                const response = yield fetch(module.toString(true));
                if (response.status !== 200) {
                    throw new Error(response.statusText);
                }
                // fetch JS sources as text and create a new function around it
                const initFn = new Function('module', 'exports', 'require', 'window', yield response.text());
                // define commonjs globals: `module`, `exports`, and `require`
                const _exports = {};
                const _module = { exports: _exports };
                const _require = (request) => {
                    const result = this._fakeModules.getModule(request, module);
                    if (result === undefined) {
                        throw new Error(`Cannot load module '${request}'`);
                    }
                    return result;
                };
                try {
                    activationTimesBuilder.codeLoadingStart();
                    initFn(_module, _exports, _require, self);
                    return (_module.exports !== _exports ? _module.exports : _exports);
                }
                finally {
                    activationTimesBuilder.codeLoadingStop();
                }
            });
        }
        $setRemoteEnvironment(_env) {
            return __awaiter(this, void 0, void 0, function* () {
                throw new Error('Not supported');
            });
        }
    }
    exports.ExtHostExtensionService = ExtHostExtensionService;
    function ensureSuffix(path, suffix) {
        return strings_1.endsWith(path, suffix) ? path : path + suffix;
    }
});
//# sourceMappingURL=extHostExtensionService.js.map