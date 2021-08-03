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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/uri", "vs/platform/opener/common/opener", "vs/workbench/api/common/extHostCustomers", "../common/extHost.protocol", "vs/workbench/services/host/browser/host"], function (require, exports, event_1, lifecycle_1, uri_1, opener_1, extHostCustomers_1, extHost_protocol_1, host_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let MainThreadWindow = class MainThreadWindow {
        constructor(extHostContext, hostService, openerService) {
            this.hostService = hostService;
            this.openerService = openerService;
            this.disposables = new lifecycle_1.DisposableStore();
            this.resolved = new Map();
            this.proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostWindow);
            event_1.Event.latch(hostService.onDidChangeFocus)(this.proxy.$onDidChangeWindowFocus, this.proxy, this.disposables);
        }
        dispose() {
            this.disposables.dispose();
            for (const value of this.resolved.values()) {
                value.dispose();
            }
            this.resolved.clear();
        }
        $getWindowVisibility() {
            return Promise.resolve(this.hostService.hasFocus);
        }
        $openUri(uriComponents, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const uri = uri_1.URI.from(uriComponents);
                return this.openerService.open(uri, { openExternal: true, allowTunneling: options.allowTunneling });
            });
        }
        $asExternalUri(uriComponents, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const uri = uri_1.URI.revive(uriComponents);
                const result = yield this.openerService.resolveExternalUri(uri, options);
                return result.resolved;
            });
        }
    };
    MainThreadWindow = __decorate([
        extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadWindow),
        __param(1, host_1.IHostService),
        __param(2, opener_1.IOpenerService)
    ], MainThreadWindow);
    exports.MainThreadWindow = MainThreadWindow;
});
//# sourceMappingURL=mainThreadWindow.js.map