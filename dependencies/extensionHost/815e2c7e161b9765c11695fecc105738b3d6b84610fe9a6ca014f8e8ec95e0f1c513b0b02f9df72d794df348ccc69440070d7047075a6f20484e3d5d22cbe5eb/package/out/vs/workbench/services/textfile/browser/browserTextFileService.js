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
define(["require", "exports", "vs/workbench/services/textfile/browser/textFileService", "vs/workbench/services/textfile/common/textfiles", "vs/platform/instantiation/common/extensions", "vs/base/common/network"], function (require, exports, textFileService_1, textfiles_1, extensions_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class BrowserTextFileService extends textFileService_1.AbstractTextFileService {
        constructor() {
            super(...arguments);
            this.encoding = {
                getPreferredWriteEncoding() {
                    return { encoding: 'utf8', hasBOM: false };
                }
            };
        }
        onBeforeShutdown(reason) {
            // Web: we cannot perform long running in the shutdown phase
            // As such we need to check sync if there are any dirty files
            // that have not been backed up yet and then prevent the shutdown
            // if that is the case.
            return this.doBeforeShutdownSync();
        }
        doBeforeShutdownSync() {
            var _a;
            if (this.models.getAll().some(model => model.hasState(2 /* PENDING_SAVE */) || model.hasState(3 /* PENDING_AUTO_SAVE */))) {
                return true; // files are pending to be saved: veto
            }
            const dirtyResources = this.getDirty();
            if (!dirtyResources.length) {
                return false; // no dirty: no veto
            }
            if (!this.isHotExitEnabled) {
                return true; // dirty without backup: veto
            }
            for (const dirtyResource of dirtyResources) {
                let hasBackup = false;
                if (this.fileService.canHandleResource(dirtyResource)) {
                    const model = this.models.get(dirtyResource);
                    hasBackup = !!((_a = model) === null || _a === void 0 ? void 0 : _a.hasBackup());
                }
                else if (dirtyResource.scheme === network_1.Schemas.untitled) {
                    hasBackup = this.untitledEditorService.hasBackup(dirtyResource);
                }
                if (!hasBackup) {
                    console.warn('Unload prevented: pending backups');
                    return true; // dirty without backup: veto
                }
            }
            return false; // dirty with backups: no veto
        }
        getWindowCount() {
            return __awaiter(this, void 0, void 0, function* () {
                return 1; // Browser only ever is 1 window
            });
        }
    }
    exports.BrowserTextFileService = BrowserTextFileService;
    extensions_1.registerSingleton(textfiles_1.ITextFileService, BrowserTextFileService);
});
//# sourceMappingURL=browserTextFileService.js.map