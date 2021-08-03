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
define(["require", "exports", "vs/base/common/event", "vs/platform/update/common/update", "vs/platform/instantiation/common/extensions", "vs/workbench/services/environment/common/environmentService", "vs/workbench/services/host/browser/host", "vs/base/common/lifecycle"], function (require, exports, event_1, update_1, extensions_1, environmentService_1, host_1, lifecycle_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let BrowserUpdateService = class BrowserUpdateService extends lifecycle_1.Disposable {
        constructor(environmentService, hostService) {
            super();
            this.environmentService = environmentService;
            this.hostService = hostService;
            this._onStateChange = this._register(new event_1.Emitter());
            this.onStateChange = this._onStateChange.event;
            this._state = update_1.State.Uninitialized;
            this.checkForUpdates();
        }
        get state() { return this._state; }
        set state(state) {
            this._state = state;
            this._onStateChange.fire(state);
        }
        isLatestVersion() {
            return __awaiter(this, void 0, void 0, function* () {
                const update = yield this.doCheckForUpdates();
                return !!update;
            });
        }
        checkForUpdates() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.doCheckForUpdates();
            });
        }
        doCheckForUpdates() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.environmentService.options && this.environmentService.options.updateProvider) {
                    const updateProvider = this.environmentService.options.updateProvider;
                    // State -> Checking for Updates
                    this.state = update_1.State.CheckingForUpdates(null);
                    const update = yield updateProvider.checkForUpdate();
                    if (update) {
                        // State -> Downloaded
                        this.state = update_1.State.Ready({ version: update.version, productVersion: update.version });
                    }
                    else {
                        // State -> Idle
                        this.state = update_1.State.Idle(1 /* Archive */);
                    }
                    return update;
                }
                return null; // no update provider to ask
            });
        }
        downloadUpdate() {
            return __awaiter(this, void 0, void 0, function* () {
                // no-op
            });
        }
        applyUpdate() {
            return __awaiter(this, void 0, void 0, function* () {
                this.hostService.reload();
            });
        }
        quitAndInstall() {
            return __awaiter(this, void 0, void 0, function* () {
                this.hostService.reload();
            });
        }
    };
    BrowserUpdateService = __decorate([
        __param(0, environmentService_1.IWorkbenchEnvironmentService),
        __param(1, host_1.IHostService)
    ], BrowserUpdateService);
    exports.BrowserUpdateService = BrowserUpdateService;
    extensions_1.registerSingleton(update_1.IUpdateService, BrowserUpdateService);
});
//# sourceMappingURL=updateService.js.map