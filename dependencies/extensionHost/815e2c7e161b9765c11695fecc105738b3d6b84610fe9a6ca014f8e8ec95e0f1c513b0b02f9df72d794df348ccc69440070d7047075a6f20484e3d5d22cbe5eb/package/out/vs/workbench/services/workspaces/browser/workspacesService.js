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
define(["require", "exports", "vs/platform/instantiation/common/extensions", "vs/platform/workspaces/common/workspaces", "vs/base/common/event", "vs/platform/storage/common/storage", "vs/platform/workspace/common/workspace", "vs/platform/log/common/log", "vs/base/common/lifecycle", "vs/workbench/services/workspaces/browser/workspaces", "vs/platform/files/common/files", "vs/workbench/services/environment/common/environmentService", "vs/base/common/resources", "vs/base/common/buffer"], function (require, exports, extensions_1, workspaces_1, event_1, storage_1, workspace_1, log_1, lifecycle_1, workspaces_2, files_1, environmentService_1, resources_1, buffer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let BrowserWorkspacesService = class BrowserWorkspacesService extends lifecycle_1.Disposable {
        constructor(storageService, workspaceService, logService, fileService, environmentService) {
            super();
            this.storageService = storageService;
            this.workspaceService = workspaceService;
            this.logService = logService;
            this.fileService = fileService;
            this.environmentService = environmentService;
            this._onRecentlyOpenedChange = this._register(new event_1.Emitter());
            this.onRecentlyOpenedChange = this._onRecentlyOpenedChange.event;
            this.addWorkspaceToRecentlyOpened();
            this.registerListeners();
        }
        registerListeners() {
            this._register(this.storageService.onDidChangeStorage(event => {
                if (event.key === BrowserWorkspacesService.RECENTLY_OPENED_KEY && event.scope === 0 /* GLOBAL */) {
                    this._onRecentlyOpenedChange.fire();
                }
            }));
        }
        addWorkspaceToRecentlyOpened() {
            const workspace = this.workspaceService.getWorkspace();
            switch (this.workspaceService.getWorkbenchState()) {
                case 2 /* FOLDER */:
                    this.addRecentlyOpened([{ folderUri: workspace.folders[0].uri }]);
                    break;
                case 3 /* WORKSPACE */:
                    this.addRecentlyOpened([{ workspace: { id: workspace.id, configPath: workspace.configuration } }]);
                    break;
            }
        }
        //#region Workspaces History
        getRecentlyOpened() {
            return __awaiter(this, void 0, void 0, function* () {
                const recentlyOpenedRaw = this.storageService.get(BrowserWorkspacesService.RECENTLY_OPENED_KEY, 0 /* GLOBAL */);
                if (recentlyOpenedRaw) {
                    return workspaces_1.restoreRecentlyOpened(JSON.parse(recentlyOpenedRaw), this.logService);
                }
                return { workspaces: [], files: [] };
            });
        }
        addRecentlyOpened(recents) {
            return __awaiter(this, void 0, void 0, function* () {
                const recentlyOpened = yield this.getRecentlyOpened();
                recents.forEach(recent => {
                    if (workspaces_1.isRecentFile(recent)) {
                        this.doRemoveFromRecentlyOpened(recentlyOpened, [recent.fileUri]);
                        recentlyOpened.files.unshift(recent);
                    }
                    else if (workspaces_1.isRecentFolder(recent)) {
                        this.doRemoveFromRecentlyOpened(recentlyOpened, [recent.folderUri]);
                        recentlyOpened.workspaces.unshift(recent);
                    }
                    else {
                        this.doRemoveFromRecentlyOpened(recentlyOpened, [recent.workspace.configPath]);
                        recentlyOpened.workspaces.unshift(recent);
                    }
                });
                return this.saveRecentlyOpened(recentlyOpened);
            });
        }
        removeFromRecentlyOpened(paths) {
            return __awaiter(this, void 0, void 0, function* () {
                const recentlyOpened = yield this.getRecentlyOpened();
                this.doRemoveFromRecentlyOpened(recentlyOpened, paths);
                return this.saveRecentlyOpened(recentlyOpened);
            });
        }
        doRemoveFromRecentlyOpened(recentlyOpened, paths) {
            recentlyOpened.files = recentlyOpened.files.filter(file => {
                return !paths.some(path => path.toString() === file.fileUri.toString());
            });
            recentlyOpened.workspaces = recentlyOpened.workspaces.filter(workspace => {
                return !paths.some(path => path.toString() === (workspaces_1.isRecentFolder(workspace) ? workspace.folderUri.toString() : workspace.workspace.configPath.toString()));
            });
        }
        saveRecentlyOpened(data) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.storageService.store(BrowserWorkspacesService.RECENTLY_OPENED_KEY, JSON.stringify(workspaces_1.toStoreData(data)), 0 /* GLOBAL */);
            });
        }
        clearRecentlyOpened() {
            return __awaiter(this, void 0, void 0, function* () {
                this.storageService.remove(BrowserWorkspacesService.RECENTLY_OPENED_KEY, 0 /* GLOBAL */);
            });
        }
        //#endregion
        //#region Workspace Management
        enterWorkspace(path) {
            return __awaiter(this, void 0, void 0, function* () {
                return { workspace: yield this.getWorkspaceIdentifier(path) };
            });
        }
        createUntitledWorkspace(folders, remoteAuthority) {
            return __awaiter(this, void 0, void 0, function* () {
                const randomId = (Date.now() + Math.round(Math.random() * 1000)).toString();
                const newUntitledWorkspacePath = resources_1.joinPath(this.environmentService.untitledWorkspacesHome, `Untitled-${randomId}.${workspaces_1.WORKSPACE_EXTENSION}`);
                // Build array of workspace folders to store
                const storedWorkspaceFolder = [];
                if (folders) {
                    for (const folder of folders) {
                        storedWorkspaceFolder.push(workspaces_1.getStoredWorkspaceFolder(folder.uri, folder.name, this.environmentService.untitledWorkspacesHome));
                    }
                }
                // Store at untitled workspaces location
                const storedWorkspace = { folders: storedWorkspaceFolder, remoteAuthority };
                yield this.fileService.writeFile(newUntitledWorkspacePath, buffer_1.VSBuffer.fromString(JSON.stringify(storedWorkspace, null, '\t')));
                return this.getWorkspaceIdentifier(newUntitledWorkspacePath);
            });
        }
        deleteUntitledWorkspace(workspace) {
            return this.fileService.del(workspace.configPath);
        }
        getWorkspaceIdentifier(workspacePath) {
            return __awaiter(this, void 0, void 0, function* () {
                return workspaces_2.getWorkspaceIdentifier(workspacePath);
            });
        }
    };
    BrowserWorkspacesService.RECENTLY_OPENED_KEY = 'recently.opened';
    BrowserWorkspacesService = __decorate([
        __param(0, storage_1.IStorageService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, log_1.ILogService),
        __param(3, files_1.IFileService),
        __param(4, environmentService_1.IWorkbenchEnvironmentService)
    ], BrowserWorkspacesService);
    exports.BrowserWorkspacesService = BrowserWorkspacesService;
    extensions_1.registerSingleton(workspaces_1.IWorkspacesService, BrowserWorkspacesService, true);
});
//# sourceMappingURL=workspacesService.js.map