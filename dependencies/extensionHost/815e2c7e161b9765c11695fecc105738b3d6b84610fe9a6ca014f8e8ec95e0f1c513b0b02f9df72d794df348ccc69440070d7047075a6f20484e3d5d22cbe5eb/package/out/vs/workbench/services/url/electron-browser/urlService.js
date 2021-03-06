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
define(["require", "exports", "vs/platform/url/common/url", "vs/platform/ipc/electron-browser/mainProcessService", "vs/platform/url/common/urlIpc", "vs/platform/url/node/urlService", "vs/platform/opener/common/opener", "vs/platform/product/common/product", "vs/platform/instantiation/common/extensions", "vs/workbench/services/electron/electron-browser/electronEnvironmentService", "vs/base/parts/ipc/node/ipc", "vs/platform/electron/node/electron"], function (require, exports, url_1, mainProcessService_1, urlIpc_1, urlService_1, opener_1, product_1, extensions_1, electronEnvironmentService_1, ipc_1, electron_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let RelayURLService = class RelayURLService extends urlService_1.URLService {
        constructor(mainProcessService, openerService, electronEnvironmentService, electronService) {
            super();
            this.electronEnvironmentService = electronEnvironmentService;
            this.electronService = electronService;
            this.urlService = ipc_1.createChannelSender(mainProcessService.getChannel('url'));
            mainProcessService.registerChannel('urlHandler', new urlIpc_1.URLHandlerChannel(this));
            openerService.registerOpener(this);
        }
        create(options) {
            const uri = super.create(options);
            let query = uri.query;
            if (!query) {
                query = `windowId=${encodeURIComponent(this.electronEnvironmentService.windowId)}`;
            }
            else {
                query += `&windowId=${encodeURIComponent(this.electronEnvironmentService.windowId)}`;
            }
            return uri.with({ query });
        }
        open(resource, options) {
            return __awaiter(this, void 0, void 0, function* () {
                if (resource.scheme !== product_1.default.urlProtocol) {
                    return false;
                }
                return yield this.urlService.open(resource, options);
            });
        }
        handleURL(uri, options) {
            const _super = Object.create(null, {
                open: { get: () => super.open }
            });
            return __awaiter(this, void 0, void 0, function* () {
                const result = yield _super.open.call(this, uri, options);
                if (result) {
                    yield this.electronService.focusWindow();
                }
                return result;
            });
        }
    };
    RelayURLService = __decorate([
        __param(0, mainProcessService_1.IMainProcessService),
        __param(1, opener_1.IOpenerService),
        __param(2, electronEnvironmentService_1.IElectronEnvironmentService),
        __param(3, electron_1.IElectronService)
    ], RelayURLService);
    exports.RelayURLService = RelayURLService;
    extensions_1.registerSingleton(url_1.IURLService, RelayURLService);
});
//# sourceMappingURL=urlService.js.map