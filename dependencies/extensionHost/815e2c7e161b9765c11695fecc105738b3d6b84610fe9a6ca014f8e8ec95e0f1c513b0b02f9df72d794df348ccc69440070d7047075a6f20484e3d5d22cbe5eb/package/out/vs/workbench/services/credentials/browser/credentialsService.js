/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "vs/platform/credentials/common/credentials", "vs/platform/instantiation/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/base/common/arrays"], function (require, exports, credentials_1, extensions_1, environmentService_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let BrowserCredentialsService = class BrowserCredentialsService {
        constructor(environmentService) {
            if (environmentService.options && environmentService.options.credentialsProvider) {
                this.credentialsProvider = environmentService.options.credentialsProvider;
            }
            else {
                this.credentialsProvider = new InMemoryCredentialsProvider();
            }
        }
        getPassword(service, account) {
            return this.credentialsProvider.getPassword(service, account);
        }
        setPassword(service, account, password) {
            return this.credentialsProvider.setPassword(service, account, password);
        }
        deletePassword(service, account) {
            return this.credentialsProvider.deletePassword(service, account);
        }
        findPassword(service) {
            return this.credentialsProvider.findPassword(service);
        }
        findCredentials(service) {
            return this.credentialsProvider.findCredentials(service);
        }
    };
    BrowserCredentialsService = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService)
    ], BrowserCredentialsService);
    exports.BrowserCredentialsService = BrowserCredentialsService;
    class InMemoryCredentialsProvider {
        constructor() {
            this.credentials = [];
        }
        getPassword(service, account) {
            return __awaiter(this, void 0, void 0, function* () {
                const credential = this.doFindPassword(service, account);
                return credential ? credential.password : null;
            });
        }
        setPassword(service, account, password) {
            return __awaiter(this, void 0, void 0, function* () {
                this.deletePassword(service, account);
                this.credentials.push({ service, account, password });
            });
        }
        deletePassword(service, account) {
            return __awaiter(this, void 0, void 0, function* () {
                const credential = this.doFindPassword(service, account);
                if (credential) {
                    this.credentials = this.credentials.splice(this.credentials.indexOf(credential), 1);
                }
                return !!credential;
            });
        }
        findPassword(service) {
            return __awaiter(this, void 0, void 0, function* () {
                const credential = this.doFindPassword(service);
                return credential ? credential.password : null;
            });
        }
        doFindPassword(service, account) {
            return arrays_1.find(this.credentials, credential => credential.service === service && (typeof account !== 'string' || credential.account === account));
        }
        findCredentials(service) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.credentials
                    .filter(credential => credential.service === service)
                    .map(({ account, password }) => ({ account, password }));
            });
        }
    }
    extensions_1.registerSingleton(credentials_1.ICredentialsService, BrowserCredentialsService, true);
});
//# sourceMappingURL=credentialsService.js.map