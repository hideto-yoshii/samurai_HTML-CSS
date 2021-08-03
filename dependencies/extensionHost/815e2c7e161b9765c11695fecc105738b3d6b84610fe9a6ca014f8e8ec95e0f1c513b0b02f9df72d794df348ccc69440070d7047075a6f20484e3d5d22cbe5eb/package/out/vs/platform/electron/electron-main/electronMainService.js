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
define(["require", "exports", "vs/base/common/event", "vs/platform/windows/electron-main/windows", "electron", "vs/platform/lifecycle/electron-main/lifecycleMainService", "vs/base/common/platform", "vs/platform/environment/common/environment", "vs/platform/dialogs/electron-main/dialogs", "vs/base/node/pfs", "vs/base/common/uri", "vs/platform/telemetry/common/telemetry", "vs/platform/instantiation/common/instantiation"], function (require, exports, event_1, windows_1, electron_1, lifecycleMainService_1, platform_1, environment_1, dialogs_1, pfs_1, uri_1, telemetry_1, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IElectronMainService = instantiation_1.createDecorator('electronMainService');
    let ElectronMainService = class ElectronMainService {
        constructor(windowsMainService, dialogMainService, lifecycleMainService, environmentService, telemetryService) {
            this.windowsMainService = windowsMainService;
            this.dialogMainService = dialogMainService;
            this.lifecycleMainService = lifecycleMainService;
            this.environmentService = environmentService;
            this.telemetryService = telemetryService;
            //#region Events
            this.onWindowOpen = event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-created', (_, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId));
            this.onWindowMaximize = event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-maximize', (_, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId));
            this.onWindowUnmaximize = event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-unmaximize', (_, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId));
            this.onWindowBlur = event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-blur', (_, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId));
            this.onWindowFocus = event_1.Event.any(event_1.Event.map(event_1.Event.filter(event_1.Event.map(this.windowsMainService.onWindowsCountChanged, () => this.windowsMainService.getLastActiveWindow()), window => !!window), window => window.id), event_1.Event.filter(event_1.Event.fromNodeEventEmitter(electron_1.app, 'browser-window-focus', (_, window) => window.id), windowId => !!this.windowsMainService.getWindowById(windowId)));
        }
        //#endregion
        //#region Window
        getWindows() {
            return __awaiter(this, void 0, void 0, function* () {
                const windows = this.windowsMainService.getWindows();
                return windows.map(window => ({
                    id: window.id,
                    workspace: window.openedWorkspace,
                    folderUri: window.openedFolderUri,
                    title: window.win.getTitle(),
                    filename: window.getRepresentedFilename()
                }));
            });
        }
        getWindowCount(windowId) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.windowsMainService.getWindowCount();
            });
        }
        getActiveWindowId(windowId) {
            return __awaiter(this, void 0, void 0, function* () {
                const activeWindow = electron_1.BrowserWindow.getFocusedWindow() || this.windowsMainService.getLastActiveWindow();
                if (activeWindow) {
                    return activeWindow.id;
                }
                return undefined;
            });
        }
        openWindow(windowId, arg1, arg2) {
            if (Array.isArray(arg1)) {
                return this.doOpenWindow(windowId, arg1, arg2);
            }
            return this.doOpenEmptyWindow(windowId, arg1);
        }
        doOpenWindow(windowId, toOpen, options = Object.create(null)) {
            return __awaiter(this, void 0, void 0, function* () {
                if (toOpen.length > 0) {
                    this.windowsMainService.open({
                        context: 5 /* API */,
                        contextWindowId: windowId,
                        urisToOpen: toOpen,
                        cli: this.environmentService.args,
                        forceNewWindow: options.forceNewWindow,
                        forceReuseWindow: options.forceReuseWindow,
                        diffMode: options.diffMode,
                        addMode: options.addMode,
                        gotoLineMode: options.gotoLineMode,
                        noRecentEntry: options.noRecentEntry,
                        waitMarkerFileURI: options.waitMarkerFileURI
                    });
                }
            });
        }
        doOpenEmptyWindow(windowId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                this.windowsMainService.openEmptyWindow(5 /* API */, options);
            });
        }
        toggleFullScreen(windowId) {
            return __awaiter(this, void 0, void 0, function* () {
                const window = this.windowById(windowId);
                if (window) {
                    window.toggleFullScreen();
                }
            });
        }
        handleTitleDoubleClick(windowId) {
            return __awaiter(this, void 0, void 0, function* () {
                const window = this.windowById(windowId);
                if (window) {
                    window.handleTitleDoubleClick();
                }
            });
        }
        isMaximized(windowId) {
            return __awaiter(this, void 0, void 0, function* () {
                const window = this.windowById(windowId);
                if (window) {
                    return window.win.isMaximized();
                }
                return false;
            });
        }
        maximizeWindow(windowId) {
            return __awaiter(this, void 0, void 0, function* () {
                const window = this.windowById(windowId);
                if (window) {
                    window.win.maximize();
                }
            });
        }
        unmaximizeWindow(windowId) {
            return __awaiter(this, void 0, void 0, function* () {
                const window = this.windowById(windowId);
                if (window) {
                    window.win.unmaximize();
                }
            });
        }
        minimizeWindow(windowId) {
            return __awaiter(this, void 0, void 0, function* () {
                const window = this.windowById(windowId);
                if (window) {
                    window.win.minimize();
                }
            });
        }
        isWindowFocused(windowId) {
            return __awaiter(this, void 0, void 0, function* () {
                const window = this.windowById(windowId);
                if (window) {
                    return window.win.isFocused();
                }
                return false;
            });
        }
        focusWindow(windowId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                if (options && typeof options.windowId === 'number') {
                    windowId = options.windowId;
                }
                const window = this.windowById(windowId);
                if (window) {
                    if (platform_1.isMacintosh) {
                        window.win.show();
                    }
                    else {
                        window.win.focus();
                    }
                }
            });
        }
        //#endregion
        //#region Dialog
        showMessageBox(windowId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.dialogMainService.showMessageBox(options, this.toBrowserWindow(windowId));
            });
        }
        showSaveDialog(windowId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.dialogMainService.showSaveDialog(options, this.toBrowserWindow(windowId));
            });
        }
        showOpenDialog(windowId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.dialogMainService.showOpenDialog(options, this.toBrowserWindow(windowId));
            });
        }
        toBrowserWindow(windowId) {
            const window = this.windowById(windowId);
            if (window) {
                return window.win;
            }
            return undefined;
        }
        pickFileFolderAndOpen(windowId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const paths = yield this.dialogMainService.pickFileFolder(options);
                if (paths) {
                    this.sendPickerTelemetry(paths, options.telemetryEventName || 'openFileFolder', options.telemetryExtraData);
                    this.doOpenPicked(yield Promise.all(paths.map((path) => __awaiter(this, void 0, void 0, function* () { return (yield pfs_1.dirExists(path)) ? { folderUri: uri_1.URI.file(path) } : { fileUri: uri_1.URI.file(path) }; }))), options, windowId);
                }
            });
        }
        pickFolderAndOpen(windowId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const paths = yield this.dialogMainService.pickFolder(options);
                if (paths) {
                    this.sendPickerTelemetry(paths, options.telemetryEventName || 'openFolder', options.telemetryExtraData);
                    this.doOpenPicked(paths.map(path => ({ folderUri: uri_1.URI.file(path) })), options, windowId);
                }
            });
        }
        pickFileAndOpen(windowId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const paths = yield this.dialogMainService.pickFile(options);
                if (paths) {
                    this.sendPickerTelemetry(paths, options.telemetryEventName || 'openFile', options.telemetryExtraData);
                    this.doOpenPicked(paths.map(path => ({ fileUri: uri_1.URI.file(path) })), options, windowId);
                }
            });
        }
        pickWorkspaceAndOpen(windowId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const paths = yield this.dialogMainService.pickWorkspace(options);
                if (paths) {
                    this.sendPickerTelemetry(paths, options.telemetryEventName || 'openWorkspace', options.telemetryExtraData);
                    this.doOpenPicked(paths.map(path => ({ workspaceUri: uri_1.URI.file(path) })), options, windowId);
                }
            });
        }
        doOpenPicked(openable, options, windowId) {
            this.windowsMainService.open({
                context: 3 /* DIALOG */,
                contextWindowId: windowId,
                cli: this.environmentService.args,
                urisToOpen: openable,
                forceNewWindow: options.forceNewWindow
            });
        }
        sendPickerTelemetry(paths, telemetryEventName, telemetryExtraData) {
            const numberOfPaths = paths ? paths.length : 0;
            // Telemetry
            // __GDPR__TODO__ Dynamic event names and dynamic properties. Can not be registered statically.
            this.telemetryService.publicLog(telemetryEventName, Object.assign(Object.assign({}, telemetryExtraData), { outcome: numberOfPaths ? 'success' : 'canceled', numberOfPaths }));
        }
        //#endregion
        //#region OS
        showItemInFolder(windowId, path) {
            return __awaiter(this, void 0, void 0, function* () {
                electron_1.shell.showItemInFolder(path);
            });
        }
        setRepresentedFilename(windowId, path) {
            return __awaiter(this, void 0, void 0, function* () {
                const window = this.windowById(windowId);
                if (window) {
                    window.setRepresentedFilename(path);
                }
            });
        }
        setDocumentEdited(windowId, edited) {
            return __awaiter(this, void 0, void 0, function* () {
                const window = this.windowById(windowId);
                if (window) {
                    window.win.setDocumentEdited(edited);
                }
            });
        }
        openExternal(windowId, url) {
            return __awaiter(this, void 0, void 0, function* () {
                electron_1.shell.openExternal(url);
                return true;
            });
        }
        updateTouchBar(windowId, items) {
            return __awaiter(this, void 0, void 0, function* () {
                const window = this.windowById(windowId);
                if (window) {
                    window.updateTouchBar(items);
                }
            });
        }
        //#endregion
        //#region macOS Touchbar
        newWindowTab() {
            return __awaiter(this, void 0, void 0, function* () {
                this.windowsMainService.open({ context: 5 /* API */, cli: this.environmentService.args, forceNewTabbedWindow: true, forceEmpty: true });
            });
        }
        showPreviousWindowTab() {
            return __awaiter(this, void 0, void 0, function* () {
                electron_1.Menu.sendActionToFirstResponder('selectPreviousTab:');
            });
        }
        showNextWindowTab() {
            return __awaiter(this, void 0, void 0, function* () {
                electron_1.Menu.sendActionToFirstResponder('selectNextTab:');
            });
        }
        moveWindowTabToNewWindow() {
            return __awaiter(this, void 0, void 0, function* () {
                electron_1.Menu.sendActionToFirstResponder('moveTabToNewWindow:');
            });
        }
        mergeAllWindowTabs() {
            return __awaiter(this, void 0, void 0, function* () {
                electron_1.Menu.sendActionToFirstResponder('mergeAllWindows:');
            });
        }
        toggleWindowTabsBar() {
            return __awaiter(this, void 0, void 0, function* () {
                electron_1.Menu.sendActionToFirstResponder('toggleTabBar:');
            });
        }
        //#endregion
        //#region Lifecycle
        relaunch(windowId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.lifecycleMainService.relaunch(options);
            });
        }
        reload(windowId, options) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                const window = this.windowById(windowId);
                if (window) {
                    return this.lifecycleMainService.reload(window, ((_a = options) === null || _a === void 0 ? void 0 : _a.disableExtensions) ? { _: [], 'disable-extensions': true } : undefined);
                }
            });
        }
        closeWindow(windowId) {
            return __awaiter(this, void 0, void 0, function* () {
                const window = this.windowById(windowId);
                if (window) {
                    return window.win.close();
                }
            });
        }
        quit(windowId) {
            var _a;
            return __awaiter(this, void 0, void 0, function* () {
                // If the user selected to exit from an extension development host window, do not quit, but just
                // close the window unless this is the last window that is opened.
                const window = this.windowsMainService.getLastActiveWindow();
                if (((_a = window) === null || _a === void 0 ? void 0 : _a.isExtensionDevelopmentHost) && this.windowsMainService.getWindowCount() > 1) {
                    window.win.close();
                }
                // Otherwise: normal quit
                else {
                    setTimeout(() => {
                        this.lifecycleMainService.quit();
                    }, 10 /* delay to unwind callback stack (IPC) */);
                }
            });
        }
        //#endregion
        //#region Connectivity
        resolveProxy(windowId, url) {
            return __awaiter(this, void 0, void 0, function* () {
                return new Promise(resolve => {
                    var _a, _b, _c;
                    const window = this.windowById(windowId);
                    const session = (_c = (_b = (_a = window) === null || _a === void 0 ? void 0 : _a.win) === null || _b === void 0 ? void 0 : _b.webContents) === null || _c === void 0 ? void 0 : _c.session;
                    if (session) {
                        session.resolveProxy(url, proxy => resolve(proxy));
                    }
                    else {
                        resolve();
                    }
                });
            });
        }
        //#endregion
        //#region Development
        openDevTools(windowId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const window = this.windowById(windowId);
                if (window) {
                    window.win.webContents.openDevTools(options);
                }
            });
        }
        toggleDevTools(windowId) {
            return __awaiter(this, void 0, void 0, function* () {
                const window = this.windowById(windowId);
                if (window) {
                    const contents = window.win.webContents;
                    if (platform_1.isMacintosh && window.hasHiddenTitleBarStyle && !window.isFullScreen && !contents.isDevToolsOpened()) {
                        contents.openDevTools({ mode: 'undocked' }); // due to https://github.com/electron/electron/issues/3647
                    }
                    else {
                        contents.toggleDevTools();
                    }
                }
            });
        }
        startCrashReporter(windowId, options) {
            return __awaiter(this, void 0, void 0, function* () {
                electron_1.crashReporter.start(options);
            });
        }
        //#endregion
        windowById(windowId) {
            if (typeof windowId !== 'number') {
                return undefined;
            }
            return this.windowsMainService.getWindowById(windowId);
        }
    };
    ElectronMainService = __decorate([
        __param(0, windows_1.IWindowsMainService),
        __param(1, dialogs_1.IDialogMainService),
        __param(2, lifecycleMainService_1.ILifecycleMainService),
        __param(3, environment_1.IEnvironmentService),
        __param(4, telemetry_1.ITelemetryService)
    ], ElectronMainService);
    exports.ElectronMainService = ElectronMainService;
});
//# sourceMappingURL=electronMainService.js.map