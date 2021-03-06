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
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/files/common/files", "vs/workbench/services/extensionResourceLoader/common/extensionResourceLoader", "vs/base/browser/dom", "vs/base/common/network"], function (require, exports, extensions_1, files_1, extensionResourceLoader_1, dom, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let ExtensionResourceLoaderService = class ExtensionResourceLoaderService {
        constructor(_fileService) {
            this._fileService = _fileService;
        }
        readExtensionResource(uri) {
            return __awaiter(this, void 0, void 0, function* () {
                uri = dom.asDomUri(uri);
                if (uri.scheme !== network_1.Schemas.http && uri.scheme !== network_1.Schemas.https) {
                    const result = yield this._fileService.readFile(uri);
                    return result.value.toString();
                }
                const response = yield fetch(uri.toString(true));
                if (response.status !== 200) {
                    throw new Error(response.statusText);
                }
                return response.text();
            });
        }
    };
    ExtensionResourceLoaderService = __decorate([
        __param(0, files_1.IFileService)
    ], ExtensionResourceLoaderService);
    extensions_1.registerSingleton(extensionResourceLoader_1.IExtensionResourceLoaderService, ExtensionResourceLoaderService);
});
//# sourceMappingURL=extensionResourceLoaderService.js.map