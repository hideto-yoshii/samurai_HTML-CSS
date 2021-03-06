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
define(["require", "exports", "vs/nls", "vs/platform/workspace/common/workspace", "vs/workbench/services/configuration/common/jsonEditing", "vs/platform/workspaces/common/workspaces", "vs/platform/configuration/common/configurationRegistry", "vs/platform/registry/common/platform", "vs/platform/commands/common/commands", "vs/base/common/arrays", "vs/base/common/resources", "vs/platform/notification/common/notification", "vs/platform/files/common/files", "vs/workbench/services/environment/common/environmentService", "vs/platform/dialogs/common/dialogs", "vs/base/common/labels", "vs/platform/configuration/common/configuration", "vs/workbench/services/textfile/common/textfiles", "vs/workbench/services/host/browser/host"], function (require, exports, nls, workspace_1, jsonEditing_1, workspaces_1, configurationRegistry_1, platform_1, commands_1, arrays_1, resources_1, notification_1, files_1, environmentService_1, dialogs_1, labels_1, configuration_1, textfiles_1, host_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let AbstractWorkspaceEditingService = class AbstractWorkspaceEditingService {
        constructor(jsonEditingService, contextService, configurationService, notificationService, commandService, fileService, textFileService, workspacesService, environmentService, fileDialogService, dialogService, hostService) {
            this.jsonEditingService = jsonEditingService;
            this.contextService = contextService;
            this.configurationService = configurationService;
            this.notificationService = notificationService;
            this.commandService = commandService;
            this.fileService = fileService;
            this.textFileService = textFileService;
            this.workspacesService = workspacesService;
            this.environmentService = environmentService;
            this.fileDialogService = fileDialogService;
            this.dialogService = dialogService;
            this.hostService = hostService;
        }
        pickNewWorkspacePath() {
            return __awaiter(this, void 0, void 0, function* () {
                let workspacePath = yield this.fileDialogService.showSaveDialog({
                    saveLabel: labels_1.mnemonicButtonLabel(nls.localize('save', "Save")),
                    title: nls.localize('saveWorkspace', "Save Workspace"),
                    filters: workspaces_1.WORKSPACE_FILTER,
                    defaultUri: this.fileDialogService.defaultWorkspacePath()
                });
                if (!workspacePath) {
                    return; // canceled
                }
                if (!workspaces_1.hasWorkspaceFileExtension(workspacePath)) {
                    // Always ensure we have workspace file extension
                    // (see https://github.com/microsoft/vscode/issues/84818)
                    workspacePath = workspacePath.with({ path: `${workspacePath.path}.${workspaces_1.WORKSPACE_EXTENSION}` });
                }
                return workspacePath;
            });
        }
        updateFolders(index, deleteCount, foldersToAdd, donotNotifyError) {
            const folders = this.contextService.getWorkspace().folders;
            let foldersToDelete = [];
            if (typeof deleteCount === 'number') {
                foldersToDelete = folders.slice(index, index + deleteCount).map(f => f.uri);
            }
            const wantsToDelete = foldersToDelete.length > 0;
            const wantsToAdd = Array.isArray(foldersToAdd) && foldersToAdd.length > 0;
            if (!wantsToAdd && !wantsToDelete) {
                return Promise.resolve(); // return early if there is nothing to do
            }
            // Add Folders
            if (wantsToAdd && !wantsToDelete && Array.isArray(foldersToAdd)) {
                return this.doAddFolders(foldersToAdd, index, donotNotifyError);
            }
            // Delete Folders
            if (wantsToDelete && !wantsToAdd) {
                return this.removeFolders(foldersToDelete);
            }
            // Add & Delete Folders
            else {
                // if we are in single-folder state and the folder is replaced with
                // other folders, we handle this specially and just enter workspace
                // mode with the folders that are being added.
                if (this.includesSingleFolderWorkspace(foldersToDelete)) {
                    return this.createAndEnterWorkspace(foldersToAdd);
                }
                // if we are not in workspace-state, we just add the folders
                if (this.contextService.getWorkbenchState() !== 3 /* WORKSPACE */) {
                    return this.doAddFolders(foldersToAdd, index, donotNotifyError);
                }
                // finally, update folders within the workspace
                return this.doUpdateFolders(foldersToAdd, foldersToDelete, index, donotNotifyError);
            }
        }
        doUpdateFolders(foldersToAdd, foldersToDelete, index, donotNotifyError = false) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield this.contextService.updateFolders(foldersToAdd, foldersToDelete, index);
                }
                catch (error) {
                    if (donotNotifyError) {
                        throw error;
                    }
                    this.handleWorkspaceConfigurationEditingError(error);
                }
            });
        }
        addFolders(foldersToAdd, donotNotifyError = false) {
            return this.doAddFolders(foldersToAdd, undefined, donotNotifyError);
        }
        doAddFolders(foldersToAdd, index, donotNotifyError = false) {
            return __awaiter(this, void 0, void 0, function* () {
                const state = this.contextService.getWorkbenchState();
                if (this.environmentService.configuration.remoteAuthority) {
                    // Do not allow workspace folders with scheme different than the current remote scheme
                    const schemas = this.contextService.getWorkspace().folders.map(f => f.uri.scheme);
                    if (schemas.length && foldersToAdd.some(f => schemas.indexOf(f.uri.scheme) === -1)) {
                        throw new Error(nls.localize('differentSchemeRoots', "Workspace folders from different providers are not allowed in the same workspace."));
                    }
                }
                // If we are in no-workspace or single-folder workspace, adding folders has to
                // enter a workspace.
                if (state !== 3 /* WORKSPACE */) {
                    let newWorkspaceFolders = this.contextService.getWorkspace().folders.map(folder => ({ uri: folder.uri }));
                    newWorkspaceFolders.splice(typeof index === 'number' ? index : newWorkspaceFolders.length, 0, ...foldersToAdd);
                    newWorkspaceFolders = arrays_1.distinct(newWorkspaceFolders, folder => resources_1.getComparisonKey(folder.uri));
                    if (state === 1 /* EMPTY */ && newWorkspaceFolders.length === 0 || state === 2 /* FOLDER */ && newWorkspaceFolders.length === 1) {
                        return; // return if the operation is a no-op for the current state
                    }
                    return this.createAndEnterWorkspace(newWorkspaceFolders);
                }
                // Delegate addition of folders to workspace service otherwise
                try {
                    yield this.contextService.addFolders(foldersToAdd, index);
                }
                catch (error) {
                    if (donotNotifyError) {
                        throw error;
                    }
                    this.handleWorkspaceConfigurationEditingError(error);
                }
            });
        }
        removeFolders(foldersToRemove, donotNotifyError = false) {
            return __awaiter(this, void 0, void 0, function* () {
                // If we are in single-folder state and the opened folder is to be removed,
                // we create an empty workspace and enter it.
                if (this.includesSingleFolderWorkspace(foldersToRemove)) {
                    return this.createAndEnterWorkspace([]);
                }
                // Delegate removal of folders to workspace service otherwise
                try {
                    yield this.contextService.removeFolders(foldersToRemove);
                }
                catch (error) {
                    if (donotNotifyError) {
                        throw error;
                    }
                    this.handleWorkspaceConfigurationEditingError(error);
                }
            });
        }
        includesSingleFolderWorkspace(folders) {
            if (this.contextService.getWorkbenchState() === 2 /* FOLDER */) {
                const workspaceFolder = this.contextService.getWorkspace().folders[0];
                return (folders.some(folder => resources_1.isEqual(folder, workspaceFolder.uri)));
            }
            return false;
        }
        createAndEnterWorkspace(folders, path) {
            return __awaiter(this, void 0, void 0, function* () {
                if (path && !(yield this.isValidTargetWorkspacePath(path))) {
                    return;
                }
                const remoteAuthority = this.environmentService.configuration.remoteAuthority;
                const untitledWorkspace = yield this.workspacesService.createUntitledWorkspace(folders, remoteAuthority);
                if (path) {
                    yield this.saveWorkspaceAs(untitledWorkspace, path);
                }
                else {
                    path = untitledWorkspace.configPath;
                }
                return this.enterWorkspace(path);
            });
        }
        saveAndEnterWorkspace(path) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!(yield this.isValidTargetWorkspacePath(path))) {
                    return;
                }
                const workspaceIdentifier = this.getCurrentWorkspaceIdentifier();
                if (!workspaceIdentifier) {
                    return;
                }
                yield this.saveWorkspaceAs(workspaceIdentifier, path);
                return this.enterWorkspace(path);
            });
        }
        isValidTargetWorkspacePath(path) {
            return __awaiter(this, void 0, void 0, function* () {
                return true; // OK
            });
        }
        saveWorkspaceAs(workspace, targetConfigPathURI) {
            return __awaiter(this, void 0, void 0, function* () {
                const configPathURI = workspace.configPath;
                // Return early if target is same as source
                if (resources_1.isEqual(configPathURI, targetConfigPathURI)) {
                    return;
                }
                // Read the contents of the workspace file, update it to new location and save it.
                const raw = yield this.fileService.readFile(configPathURI);
                const newRawWorkspaceContents = workspaces_1.rewriteWorkspaceFileForNewLocation(raw.value.toString(), configPathURI, targetConfigPathURI);
                yield this.textFileService.create(targetConfigPathURI, newRawWorkspaceContents, { overwrite: true });
            });
        }
        handleWorkspaceConfigurationEditingError(error) {
            switch (error.code) {
                case 1 /* ERROR_INVALID_FILE */:
                    this.onInvalidWorkspaceConfigurationFileError();
                    break;
                case 0 /* ERROR_FILE_DIRTY */:
                    this.onWorkspaceConfigurationFileDirtyError();
                    break;
                default:
                    this.notificationService.error(error.message);
            }
        }
        onInvalidWorkspaceConfigurationFileError() {
            const message = nls.localize('errorInvalidTaskConfiguration', "Unable to write into workspace configuration file. Please open the file to correct errors/warnings in it and try again.");
            this.askToOpenWorkspaceConfigurationFile(message);
        }
        onWorkspaceConfigurationFileDirtyError() {
            const message = nls.localize('errorWorkspaceConfigurationFileDirty', "Unable to write into workspace configuration file because the file is dirty. Please save it and try again.");
            this.askToOpenWorkspaceConfigurationFile(message);
        }
        askToOpenWorkspaceConfigurationFile(message) {
            this.notificationService.prompt(notification_1.Severity.Error, message, [{
                    label: nls.localize('openWorkspaceConfigurationFile', "Open Workspace Configuration"),
                    run: () => this.commandService.executeCommand('workbench.action.openWorkspaceConfigFile')
                }]);
        }
        doEnterWorkspace(path) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!!this.environmentService.extensionTestsLocationURI) {
                    throw new Error('Entering a new workspace is not possible in tests.');
                }
                const workspace = yield this.workspacesService.getWorkspaceIdentifier(path);
                // Settings migration (only if we come from a folder workspace)
                if (this.contextService.getWorkbenchState() === 2 /* FOLDER */) {
                    yield this.migrateWorkspaceSettings(workspace);
                }
                const workspaceImpl = this.contextService;
                yield workspaceImpl.initialize(workspace);
                return this.workspacesService.enterWorkspace(path);
            });
        }
        migrateWorkspaceSettings(toWorkspace) {
            return this.doCopyWorkspaceSettings(toWorkspace, setting => setting.scope === 3 /* WINDOW */);
        }
        copyWorkspaceSettings(toWorkspace) {
            return this.doCopyWorkspaceSettings(toWorkspace);
        }
        doCopyWorkspaceSettings(toWorkspace, filter) {
            const configurationProperties = platform_1.Registry.as(configurationRegistry_1.Extensions.Configuration).getConfigurationProperties();
            const targetWorkspaceConfiguration = {};
            for (const key of this.configurationService.keys().workspace) {
                if (configurationProperties[key]) {
                    if (filter && !filter(configurationProperties[key])) {
                        continue;
                    }
                    targetWorkspaceConfiguration[key] = this.configurationService.inspect(key).workspace;
                }
            }
            return this.jsonEditingService.write(toWorkspace.configPath, [{ key: 'settings', value: targetWorkspaceConfiguration }], true);
        }
        getCurrentWorkspaceIdentifier() {
            var _a;
            const workspace = this.contextService.getWorkspace();
            if ((_a = workspace) === null || _a === void 0 ? void 0 : _a.configuration) {
                return { id: workspace.id, configPath: workspace.configuration };
            }
            return undefined;
        }
    };
    AbstractWorkspaceEditingService = __decorate([
        __param(0, jsonEditing_1.IJSONEditingService),
        __param(1, workspace_1.IWorkspaceContextService),
        __param(2, configuration_1.IConfigurationService),
        __param(3, notification_1.INotificationService),
        __param(4, commands_1.ICommandService),
        __param(5, files_1.IFileService),
        __param(6, textfiles_1.ITextFileService),
        __param(7, workspaces_1.IWorkspacesService),
        __param(8, environmentService_1.IWorkbenchEnvironmentService),
        __param(9, dialogs_1.IFileDialogService),
        __param(10, dialogs_1.IDialogService),
        __param(11, host_1.IHostService)
    ], AbstractWorkspaceEditingService);
    exports.AbstractWorkspaceEditingService = AbstractWorkspaceEditingService;
});
//# sourceMappingURL=abstractWorkspaceEditingService.js.map