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
define(["require", "exports", "vs/platform/ipc/electron-browser/sharedProcessService", "vs/base/common/lifecycle", "vs/base/common/event", "vs/platform/instantiation/common/extensions", "vs/platform/auth/common/auth"], function (require, exports, sharedProcessService_1, lifecycle_1, event_1, extensions_1, auth_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let AuthTokenService = class AuthTokenService extends lifecycle_1.Disposable {
        constructor(sharedProcessService) {
            super();
            this._status = "Disabled" /* Disabled */;
            this._onDidChangeStatus = this._register(new event_1.Emitter());
            this.onDidChangeStatus = this._onDidChangeStatus.event;
            this.channel = sharedProcessService.getChannel('authToken');
            this.channel.call('_getInitialStatus').then(status => {
                this.updateStatus(status);
                this._register(this.channel.listen('onDidChangeStatus')(status => this.updateStatus(status)));
            });
        }
        get status() { return this._status; }
        getToken() {
            return this.channel.call('getToken');
        }
        updateToken(token) {
            return this.channel.call('updateToken', [token]);
        }
        refreshToken() {
            return this.channel.call('getToken');
        }
        deleteToken() {
            return this.channel.call('deleteToken');
        }
        updateStatus(status) {
            return __awaiter(this, void 0, void 0, function* () {
                this._status = status;
                this._onDidChangeStatus.fire(status);
            });
        }
    };
    AuthTokenService = __decorate([
        __param(0, sharedProcessService_1.ISharedProcessService)
    ], AuthTokenService);
    exports.AuthTokenService = AuthTokenService;
    extensions_1.registerSingleton(auth_1.IAuthTokenService, AuthTokenService);
});
//# sourceMappingURL=authTokenService.js.map