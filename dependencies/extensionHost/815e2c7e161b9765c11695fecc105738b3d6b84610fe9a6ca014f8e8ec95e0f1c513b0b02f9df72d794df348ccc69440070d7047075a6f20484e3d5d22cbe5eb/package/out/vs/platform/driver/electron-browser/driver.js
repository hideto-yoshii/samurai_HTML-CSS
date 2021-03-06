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
define(["require", "exports", "vs/base/common/lifecycle", "vs/platform/driver/node/driver", "vs/platform/instantiation/common/instantiation", "vs/platform/ipc/electron-browser/mainProcessService", "electron", "vs/base/common/async", "vs/platform/driver/browser/baseDriver", "vs/platform/electron/node/electron"], function (require, exports, lifecycle_1, driver_1, instantiation_1, mainProcessService_1, electron, async_1, baseDriver_1, electron_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let WindowDriver = class WindowDriver extends baseDriver_1.BaseWindowDriver {
        constructor(electronService) {
            super();
            this.electronService = electronService;
        }
        click(selector, xoffset, yoffset) {
            const offset = typeof xoffset === 'number' && typeof yoffset === 'number' ? { x: xoffset, y: yoffset } : undefined;
            return this._click(selector, 1, offset);
        }
        doubleClick(selector) {
            return this._click(selector, 2);
        }
        _click(selector, clickCount, offset) {
            return __awaiter(this, void 0, void 0, function* () {
                const { x, y } = yield this._getElementXY(selector, offset);
                const webContents = electron.remote.getCurrentWebContents();
                webContents.sendInputEvent({ type: 'mouseDown', x, y, button: 'left', clickCount });
                yield async_1.timeout(10);
                webContents.sendInputEvent({ type: 'mouseUp', x, y, button: 'left', clickCount });
                yield async_1.timeout(100);
            });
        }
        openDevTools() {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.electronService.openDevTools({ mode: 'detach' });
            });
        }
    };
    WindowDriver = __decorate([
        __param(0, electron_1.IElectronService)
    ], WindowDriver);
    function registerWindowDriver(accessor, windowId) {
        return __awaiter(this, void 0, void 0, function* () {
            const instantiationService = accessor.get(instantiation_1.IInstantiationService);
            const mainProcessService = accessor.get(mainProcessService_1.IMainProcessService);
            const windowDriver = instantiationService.createInstance(WindowDriver);
            const windowDriverChannel = new driver_1.WindowDriverChannel(windowDriver);
            mainProcessService.registerChannel('windowDriver', windowDriverChannel);
            const windowDriverRegistryChannel = mainProcessService.getChannel('windowDriverRegistry');
            const windowDriverRegistry = new driver_1.WindowDriverRegistryChannelClient(windowDriverRegistryChannel);
            yield windowDriverRegistry.registerWindowDriver(windowId);
            // const options = await windowDriverRegistry.registerWindowDriver(windowId);
            // if (options.verbose) {
            // 	windowDriver.openDevTools();
            // }
            return lifecycle_1.toDisposable(() => windowDriverRegistry.reloadWindowDriver(windowId));
        });
    }
    exports.registerWindowDriver = registerWindowDriver;
});
//# sourceMappingURL=driver.js.map