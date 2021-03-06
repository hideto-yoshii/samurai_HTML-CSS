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
define(["require", "exports", "vs/base/common/event", "vs/base/common/uri", "vs/base/common/uuid", "vs/workbench/api/common/extHostTypeConverters", "vs/workbench/api/common/shared/webview", "./extHost.protocol", "./extHostTypes"], function (require, exports, event_1, uri_1, uuid_1, typeConverters, webview_1, extHost_protocol_1, extHostTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class ExtHostWebview {
        constructor(_handle, _proxy, _options, _initData, _workspace, _extension) {
            this._handle = _handle;
            this._proxy = _proxy;
            this._options = _options;
            this._initData = _initData;
            this._workspace = _workspace;
            this._extension = _extension;
            this._html = '';
            this._isDisposed = false;
            this._hasCalledAsWebviewUri = false;
            this._onMessageEmitter = new event_1.Emitter();
            this.onDidReceiveMessage = this._onMessageEmitter.event;
        }
        dispose() {
            this._onMessageEmitter.dispose();
        }
        asWebviewUri(resource) {
            this._hasCalledAsWebviewUri = true;
            return webview_1.asWebviewUri(this._initData, this._handle, resource);
        }
        get cspSource() {
            return this._initData.webviewCspSource
                .replace('{{uuid}}', this._handle);
        }
        get html() {
            this.assertNotDisposed();
            return this._html;
        }
        set html(value) {
            this.assertNotDisposed();
            if (this._html !== value) {
                this._html = value;
                if (this._initData.isExtensionDevelopmentDebug && !this._hasCalledAsWebviewUri) {
                    if (/(["'])vscode-resource:([^\s'"]+?)(["'])/i.test(value)) {
                        this._hasCalledAsWebviewUri = true;
                        console.warn(`${this._extension.identifier.value} created a webview that appears to use the vscode-resource scheme directly. Please migrate to use the 'webview.asWebviewUri' api instead: https://aka.ms/vscode-webview-use-aswebviewuri`);
                    }
                }
                this._proxy.$setHtml(this._handle, value);
            }
        }
        get options() {
            this.assertNotDisposed();
            return this._options;
        }
        set options(newOptions) {
            this.assertNotDisposed();
            this._proxy.$setOptions(this._handle, convertWebviewOptions(this._extension, this._workspace, newOptions));
            this._options = newOptions;
        }
        postMessage(message) {
            this.assertNotDisposed();
            return this._proxy.$postMessage(this._handle, message);
        }
        assertNotDisposed() {
            if (this._isDisposed) {
                throw new Error('Webview is disposed');
            }
        }
    }
    exports.ExtHostWebview = ExtHostWebview;
    class ExtHostWebviewEditor {
        constructor(handle, proxy, viewType, title, viewColumn, editorOptions, webview) {
            this._visible = true;
            this._active = true;
            this._isDisposed = false;
            this._onDisposeEmitter = new event_1.Emitter();
            this.onDidDispose = this._onDisposeEmitter.event;
            this._onDidChangeViewStateEmitter = new event_1.Emitter();
            this.onDidChangeViewState = this._onDidChangeViewStateEmitter.event;
            this._onWillSave = new event_1.Emitter();
            this.onWillSave = this._onWillSave.event;
            this._handle = handle;
            this._proxy = proxy;
            this._viewType = viewType;
            this._options = editorOptions;
            this._viewColumn = viewColumn;
            this._title = title;
            this._webview = webview;
        }
        dispose() {
            if (this._isDisposed) {
                return;
            }
            this._isDisposed = true;
            this._onDisposeEmitter.fire();
            this._proxy.$disposeWebview(this._handle);
            this._webview.dispose();
            this._onDisposeEmitter.dispose();
            this._onDidChangeViewStateEmitter.dispose();
        }
        get webview() {
            this.assertNotDisposed();
            return this._webview;
        }
        get viewType() {
            this.assertNotDisposed();
            return this._viewType;
        }
        get title() {
            this.assertNotDisposed();
            return this._title;
        }
        set title(value) {
            this.assertNotDisposed();
            if (this._title !== value) {
                this._title = value;
                this._proxy.$setTitle(this._handle, value);
            }
        }
        get iconPath() {
            this.assertNotDisposed();
            return this._iconPath;
        }
        set iconPath(value) {
            this.assertNotDisposed();
            if (this._iconPath !== value) {
                this._iconPath = value;
                this._proxy.$setIconPath(this._handle, uri_1.URI.isUri(value) ? { light: value, dark: value } : value);
            }
        }
        get options() {
            return this._options;
        }
        get viewColumn() {
            this.assertNotDisposed();
            if (typeof this._viewColumn === 'number' && this._viewColumn < 0) {
                // We are using a symbolic view column
                // Return undefined instead to indicate that the real view column is currently unknown but will be resolved.
                return undefined;
            }
            return this._viewColumn;
        }
        _setViewColumn(value) {
            this.assertNotDisposed();
            this._viewColumn = value;
        }
        get active() {
            this.assertNotDisposed();
            return this._active;
        }
        _setActive(value) {
            this.assertNotDisposed();
            this._active = value;
        }
        get visible() {
            this.assertNotDisposed();
            return this._visible;
        }
        _setVisible(value) {
            this.assertNotDisposed();
            this._visible = value;
        }
        _save() {
            return __awaiter(this, void 0, void 0, function* () {
                const waitingOn = [];
                this._onWillSave.fire({
                    waitUntil: (thenable) => { waitingOn.push(thenable); },
                });
                const result = yield Promise.all(waitingOn);
                return result.every(x => x);
            });
        }
        postMessage(message) {
            this.assertNotDisposed();
            return this._proxy.$postMessage(this._handle, message);
        }
        reveal(viewColumn, preserveFocus) {
            this.assertNotDisposed();
            this._proxy.$reveal(this._handle, {
                viewColumn: viewColumn ? typeConverters.ViewColumn.from(viewColumn) : undefined,
                preserveFocus: !!preserveFocus
            });
        }
        assertNotDisposed() {
            if (this._isDisposed) {
                throw new Error('Webview is disposed');
            }
        }
    }
    exports.ExtHostWebviewEditor = ExtHostWebviewEditor;
    class ExtHostWebviews {
        constructor(mainContext, initData, workspace) {
            this.initData = initData;
            this.workspace = workspace;
            this._webviewPanels = new Map();
            this._serializers = new Map();
            this._editorProviders = new Map();
            this._proxy = mainContext.getProxy(extHost_protocol_1.MainContext.MainThreadWebviews);
        }
        static newHandle() {
            return uuid_1.generateUuid();
        }
        createWebviewPanel(extension, viewType, title, showOptions, options = {}) {
            const viewColumn = typeof showOptions === 'object' ? showOptions.viewColumn : showOptions;
            const webviewShowOptions = {
                viewColumn: typeConverters.ViewColumn.from(viewColumn),
                preserveFocus: typeof showOptions === 'object' && !!showOptions.preserveFocus
            };
            const handle = ExtHostWebviews.newHandle();
            this._proxy.$createWebviewPanel({ id: extension.identifier, location: extension.extensionLocation }, handle, viewType, title, webviewShowOptions, convertWebviewOptions(extension, this.workspace, options));
            const webview = new ExtHostWebview(handle, this._proxy, options, this.initData, this.workspace, extension);
            const panel = new ExtHostWebviewEditor(handle, this._proxy, viewType, title, viewColumn, options, webview);
            this._webviewPanels.set(handle, panel);
            return panel;
        }
        registerWebviewPanelSerializer(extension, viewType, serializer) {
            if (this._serializers.has(viewType)) {
                throw new Error(`Serializer for '${viewType}' already registered`);
            }
            this._serializers.set(viewType, { serializer, extension });
            this._proxy.$registerSerializer(viewType);
            return new extHostTypes_1.Disposable(() => {
                this._serializers.delete(viewType);
                this._proxy.$unregisterSerializer(viewType);
            });
        }
        registerWebviewEditorProvider(extension, viewType, provider, options) {
            if (this._editorProviders.has(viewType)) {
                throw new Error(`Editor provider for '${viewType}' already registered`);
            }
            this._editorProviders.set(viewType, { extension, provider, });
            this._proxy.$registerEditorProvider({ id: extension.identifier, location: extension.extensionLocation }, viewType, options || {});
            return new extHostTypes_1.Disposable(() => {
                this._editorProviders.delete(viewType);
                this._proxy.$unregisterEditorProvider(viewType);
            });
        }
        $onMessage(handle, message) {
            const panel = this.getWebviewPanel(handle);
            if (panel) {
                panel.webview._onMessageEmitter.fire(message);
            }
        }
        $onMissingCsp(_handle, extensionId) {
            console.warn(`${extensionId} created a webview without a content security policy: https://aka.ms/vscode-webview-missing-csp`);
        }
        $onDidChangeWebviewPanelViewStates(newStates) {
            const handles = Object.keys(newStates);
            // Notify webviews of state changes in the following order:
            // - Non-visible
            // - Visible
            // - Active
            handles.sort((a, b) => {
                const stateA = newStates[a];
                const stateB = newStates[b];
                if (stateA.active) {
                    return 1;
                }
                if (stateB.active) {
                    return -1;
                }
                return (+stateA.visible) - (+stateB.visible);
            });
            for (const handle of handles) {
                const panel = this.getWebviewPanel(handle);
                if (!panel || panel._isDisposed) {
                    continue;
                }
                const newState = newStates[handle];
                const viewColumn = typeConverters.ViewColumn.to(newState.position);
                if (panel.active !== newState.active || panel.visible !== newState.visible || panel.viewColumn !== viewColumn) {
                    panel._setActive(newState.active);
                    panel._setVisible(newState.visible);
                    panel._setViewColumn(viewColumn);
                    panel._onDidChangeViewStateEmitter.fire({ webviewPanel: panel });
                }
            }
        }
        $onDidDisposeWebviewPanel(handle) {
            const panel = this.getWebviewPanel(handle);
            if (panel) {
                panel.dispose();
                this._webviewPanels.delete(handle);
            }
            return Promise.resolve(undefined);
        }
        $deserializeWebviewPanel(webviewHandle, viewType, title, state, position, options) {
            const entry = this._serializers.get(viewType);
            if (!entry) {
                return Promise.reject(new Error(`No serializer found for '${viewType}'`));
            }
            const { serializer, extension } = entry;
            const webview = new ExtHostWebview(webviewHandle, this._proxy, options, this.initData, this.workspace, extension);
            const revivedPanel = new ExtHostWebviewEditor(webviewHandle, this._proxy, viewType, title, typeof position === 'number' && position >= 0 ? typeConverters.ViewColumn.to(position) : undefined, options, webview);
            this._webviewPanels.set(webviewHandle, revivedPanel);
            return Promise.resolve(serializer.deserializeWebviewPanel(revivedPanel, state));
        }
        getWebviewPanel(handle) {
            return this._webviewPanels.get(handle);
        }
        $resolveWebviewEditor(resource, handle, viewType, title, position, options) {
            return __awaiter(this, void 0, void 0, function* () {
                const entry = this._editorProviders.get(viewType);
                if (!entry) {
                    return Promise.reject(new Error(`No provider found for '${viewType}'`));
                }
                const { provider, extension } = entry;
                const webview = new ExtHostWebview(handle, this._proxy, options, this.initData, this.workspace, extension);
                const revivedPanel = new ExtHostWebviewEditor(handle, this._proxy, viewType, title, typeof position === 'number' && position >= 0 ? typeConverters.ViewColumn.to(position) : undefined, options, webview);
                this._webviewPanels.set(handle, revivedPanel);
                return Promise.resolve(provider.resolveWebviewEditor(uri_1.URI.revive(resource), revivedPanel));
            });
        }
        $save(handle) {
            return __awaiter(this, void 0, void 0, function* () {
                const panel = this.getWebviewPanel(handle);
                if (panel) {
                    return panel._save();
                }
                return false;
            });
        }
    }
    exports.ExtHostWebviews = ExtHostWebviews;
    function convertWebviewOptions(extension, workspace, options) {
        return Object.assign(Object.assign({}, options), { localResourceRoots: options.localResourceRoots || getDefaultLocalResourceRoots(extension, workspace) });
    }
    function getDefaultLocalResourceRoots(extension, workspace) {
        return [
            ...(workspace && workspace.getWorkspaceFolders() || []).map(x => x.uri),
            extension.extensionLocation,
        ];
    }
});
//# sourceMappingURL=extHostWebview.js.map