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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/async", "vs/platform/electron/node/electron"], function (require, exports, event_1, lifecycle_1, async_1, electron_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let ActiveWindowManager = class ActiveWindowManager extends lifecycle_1.Disposable {
        constructor(electronService) {
            super();
            this.disposables = this._register(new lifecycle_1.DisposableStore());
            // remember last active window id upon events
            const onActiveWindowChange = event_1.Event.latch(event_1.Event.any(electronService.onWindowOpen, electronService.onWindowFocus));
            onActiveWindowChange(this.setActiveWindow, this, this.disposables);
            // resolve current active window
            this.firstActiveWindowIdPromise = async_1.createCancelablePromise(() => electronService.getActiveWindowId());
            (() => __awaiter(this, void 0, void 0, function* () {
                try {
                    const windowId = yield this.firstActiveWindowIdPromise;
                    this.activeWindowId = (typeof this.activeWindowId === 'number') ? this.activeWindowId : windowId;
                }
                finally {
                    this.firstActiveWindowIdPromise = undefined;
                }
            }))();
        }
        setActiveWindow(windowId) {
            if (this.firstActiveWindowIdPromise) {
                this.firstActiveWindowIdPromise.cancel();
                this.firstActiveWindowIdPromise = undefined;
            }
            this.activeWindowId = windowId;
        }
        getActiveClientId() {
            return __awaiter(this, void 0, void 0, function* () {
                const id = this.firstActiveWindowIdPromise ? (yield this.firstActiveWindowIdPromise) : this.activeWindowId;
                return `window:${id}`;
            });
        }
    };
    ActiveWindowManager = __decorate([
        __param(0, electron_1.IElectronService)
    ], ActiveWindowManager);
    exports.ActiveWindowManager = ActiveWindowManager;
});
//# sourceMappingURL=activeWindowTracker.js.map