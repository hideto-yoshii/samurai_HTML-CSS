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
define(["require", "exports", "vs/platform/request/common/request", "vs/base/common/cancellation", "vs/platform/files/common/files", "vs/base/common/network"], function (require, exports, request_1, cancellation_1, files_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let DownloadService = class DownloadService {
        constructor(requestService, fileService) {
            this.requestService = requestService;
            this.fileService = fileService;
        }
        download(resource, target, cancellationToken = cancellation_1.CancellationToken.None) {
            return __awaiter(this, void 0, void 0, function* () {
                if (resource.scheme === network_1.Schemas.file || resource.scheme === network_1.Schemas.vscodeRemote) {
                    yield this.fileService.copy(resource, target);
                    return;
                }
                const options = { type: 'GET', url: resource.toString() };
                const context = yield this.requestService.request(options, cancellationToken);
                if (context.res.statusCode === 200) {
                    yield this.fileService.writeFile(target, context.stream);
                }
                else {
                    const message = yield request_1.asText(context);
                    throw new Error(`Expected 200, got back ${context.res.statusCode} instead.\n\n${message}`);
                }
            });
        }
    };
    DownloadService = __decorate([
        __param(0, request_1.IRequestService),
        __param(1, files_1.IFileService)
    ], DownloadService);
    exports.DownloadService = DownloadService;
});
//# sourceMappingURL=downloadService.js.map