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
define(["require", "exports", "vs/platform/dialogs/common/dialogs", "vs/platform/instantiation/common/extensions", "vs/workbench/services/dialogs/browser/abstractFileDialogService", "vs/base/common/network"], function (require, exports, dialogs_1, extensions_1, abstractFileDialogService_1, network_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class FileDialogService extends abstractFileDialogService_1.AbstractFileDialogService {
        pickFileFolderAndOpen(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const schema = this.getFileSystemSchema(options);
                if (!options.defaultUri) {
                    options.defaultUri = this.defaultFilePath(schema);
                }
                return this.pickFileFolderAndOpenSimplified(schema, options, false);
            });
        }
        pickFileAndOpen(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const schema = this.getFileSystemSchema(options);
                if (!options.defaultUri) {
                    options.defaultUri = this.defaultFilePath(schema);
                }
                return this.pickFileAndOpenSimplified(schema, options, false);
            });
        }
        pickFolderAndOpen(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const schema = this.getFileSystemSchema(options);
                if (!options.defaultUri) {
                    options.defaultUri = this.defaultFolderPath(schema);
                }
                return this.pickFolderAndOpenSimplified(schema, options);
            });
        }
        pickWorkspaceAndOpen(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const schema = this.getFileSystemSchema(options);
                if (!options.defaultUri) {
                    options.defaultUri = this.defaultWorkspacePath(schema);
                }
                return this.pickWorkspaceAndOpenSimplified(schema, options);
            });
        }
        pickFileToSave(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const schema = this.getFileSystemSchema(options);
                return this.pickFileToSaveSimplified(schema, options);
            });
        }
        showSaveDialog(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const schema = this.getFileSystemSchema(options);
                return this.showSaveDialogSimplified(schema, options);
            });
        }
        showOpenDialog(options) {
            return __awaiter(this, void 0, void 0, function* () {
                const schema = this.getFileSystemSchema(options);
                return this.showOpenDialogSimplified(schema, options);
            });
        }
        addFileSchemaIfNeeded(schema) {
            return schema === network_1.Schemas.untitled ? [network_1.Schemas.file] : [schema];
        }
    }
    exports.FileDialogService = FileDialogService;
    extensions_1.registerSingleton(dialogs_1.IFileDialogService, FileDialogService, true);
});
//# sourceMappingURL=fileDialogService.js.map