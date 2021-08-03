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
define(["require", "exports", "vs/nls", "vs/base/common/async", "vs/base/common/network"], function (require, exports, nls, async_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    // Commands
    function revealResourcesInOS(resources, electronService, notificationService, workspaceContextService) {
        if (resources.length) {
            async_1.sequence(resources.map(r => () => __awaiter(this, void 0, void 0, function* () {
                if (r.scheme === network_1.Schemas.file) {
                    electronService.showItemInFolder(r.fsPath);
                }
            })));
        }
        else if (workspaceContextService.getWorkspace().folders.length) {
            const uri = workspaceContextService.getWorkspace().folders[0].uri;
            if (uri.scheme === network_1.Schemas.file) {
                electronService.showItemInFolder(uri.fsPath);
            }
        }
        else {
            notificationService.info(nls.localize('openFileToReveal', "Open a file first to reveal"));
        }
    }
    exports.revealResourcesInOS = revealResourcesInOS;
});
//# sourceMappingURL=fileCommands.js.map