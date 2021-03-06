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
define(["require", "exports", "vs/workbench/workbench.web.api", "vs/base/common/uuid", "vs/base/common/cancellation", "vs/base/common/buffer", "vs/base/common/lifecycle", "vs/base/parts/request/browser/request", "vs/platform/windows/common/windows", "vs/base/common/resources", "vs/base/browser/browser"], function (require, exports, workbench_web_api_1, uuid_1, cancellation_1, buffer_1, lifecycle_1, request_1, windows_1, resources_1, browser_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class LocalStorageCredentialsProvider {
        get credentials() {
            if (!this._credentials) {
                try {
                    const serializedCredentials = window.localStorage.getItem(LocalStorageCredentialsProvider.CREDENTIALS_OPENED_KEY);
                    if (serializedCredentials) {
                        this._credentials = JSON.parse(serializedCredentials);
                    }
                }
                catch (error) {
                    // ignore
                }
                if (!Array.isArray(this._credentials)) {
                    this._credentials = [];
                }
            }
            return this._credentials;
        }
        save() {
            window.localStorage.setItem(LocalStorageCredentialsProvider.CREDENTIALS_OPENED_KEY, JSON.stringify(this.credentials));
        }
        getPassword(service, account) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.doGetPassword(service, account);
            });
        }
        doGetPassword(service, account) {
            return __awaiter(this, void 0, void 0, function* () {
                for (const credential of this.credentials) {
                    if (credential.service === service) {
                        if (typeof account !== 'string' || account === credential.account) {
                            return credential.password;
                        }
                    }
                }
                return null;
            });
        }
        setPassword(service, account, password) {
            return __awaiter(this, void 0, void 0, function* () {
                this.deletePassword(service, account);
                this.credentials.push({ service, account, password });
                this.save();
            });
        }
        deletePassword(service, account) {
            return __awaiter(this, void 0, void 0, function* () {
                let found = false;
                this._credentials = this.credentials.filter(credential => {
                    if (credential.service === service && credential.account === account) {
                        found = true;
                        return false;
                    }
                    return true;
                });
                if (found) {
                    this.save();
                }
                return found;
            });
        }
        findPassword(service) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.doGetPassword(service);
            });
        }
        findCredentials(service) {
            return __awaiter(this, void 0, void 0, function* () {
                return this.credentials
                    .filter(credential => credential.service === service)
                    .map(({ account, password }) => ({ account, password }));
            });
        }
    }
    LocalStorageCredentialsProvider.CREDENTIALS_OPENED_KEY = 'credentials.provider';
    class PollingURLCallbackProvider extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onCallback = this._register(new workbench_web_api_1.Emitter());
            this.onCallback = this._onCallback.event;
        }
        create(options) {
            const queryValues = new Map();
            const requestId = uuid_1.generateUuid();
            queryValues.set(PollingURLCallbackProvider.QUERY_KEYS.REQUEST_ID, requestId);
            const { scheme, authority, path, query, fragment } = options ? options : { scheme: undefined, authority: undefined, path: undefined, query: undefined, fragment: undefined };
            if (scheme) {
                queryValues.set(PollingURLCallbackProvider.QUERY_KEYS.SCHEME, scheme);
            }
            if (authority) {
                queryValues.set(PollingURLCallbackProvider.QUERY_KEYS.AUTHORITY, authority);
            }
            if (path) {
                queryValues.set(PollingURLCallbackProvider.QUERY_KEYS.PATH, path);
            }
            if (query) {
                queryValues.set(PollingURLCallbackProvider.QUERY_KEYS.QUERY, query);
            }
            if (fragment) {
                queryValues.set(PollingURLCallbackProvider.QUERY_KEYS.FRAGMENT, fragment);
            }
            // Start to poll on the callback being fired
            this.periodicFetchCallback(requestId, Date.now());
            return this.doCreateUri('/callback', queryValues);
        }
        periodicFetchCallback(requestId, startTime) {
            return __awaiter(this, void 0, void 0, function* () {
                // Ask server for callback results
                const queryValues = new Map();
                queryValues.set(PollingURLCallbackProvider.QUERY_KEYS.REQUEST_ID, requestId);
                const result = yield request_1.request({
                    url: this.doCreateUri('/fetch-callback', queryValues).toString(true)
                }, cancellation_1.CancellationToken.None);
                // Check for callback results
                const content = yield buffer_1.streamToBuffer(result.stream);
                if (content.byteLength > 0) {
                    try {
                        this._onCallback.fire(workbench_web_api_1.URI.revive(JSON.parse(content.toString())));
                    }
                    catch (error) {
                        console.error(error);
                    }
                    return; // done
                }
                // Continue fetching unless we hit the timeout
                if (Date.now() - startTime < PollingURLCallbackProvider.FETCH_TIMEOUT) {
                    setTimeout(() => this.periodicFetchCallback(requestId, startTime), PollingURLCallbackProvider.FETCH_INTERVAL);
                }
            });
        }
        doCreateUri(path, queryValues) {
            let query = undefined;
            if (queryValues) {
                let index = 0;
                queryValues.forEach((value, key) => {
                    if (!query) {
                        query = '';
                    }
                    const prefix = (index++ === 0) ? '' : '&';
                    query += `${prefix}${key}=${encodeURIComponent(value)}`;
                });
            }
            return workbench_web_api_1.URI.parse(window.location.href).with({ path, query });
        }
    }
    PollingURLCallbackProvider.FETCH_INTERVAL = 500; // fetch every 500ms
    PollingURLCallbackProvider.FETCH_TIMEOUT = 5 * 60 * 1000; // ...but stop after 5min
    PollingURLCallbackProvider.QUERY_KEYS = {
        REQUEST_ID: 'vscode-requestId',
        SCHEME: 'vscode-scheme',
        AUTHORITY: 'vscode-authority',
        PATH: 'vscode-path',
        QUERY: 'vscode-query',
        FRAGMENT: 'vscode-fragment'
    };
    class WorkspaceProvider {
        constructor(workspace, payload) {
            this.workspace = workspace;
            this.payload = payload;
        }
        open(workspace, options) {
            var _a, _b;
            return __awaiter(this, void 0, void 0, function* () {
                if (((_a = options) === null || _a === void 0 ? void 0 : _a.reuse) && !options.payload && this.isSame(this.workspace, workspace)) {
                    return; // return early if workspace and environment is not changing and we are reusing window
                }
                const targetHref = this.createTargetUrl(workspace, options);
                if (targetHref) {
                    if ((_b = options) === null || _b === void 0 ? void 0 : _b.reuse) {
                        window.location.href = targetHref;
                    }
                    else {
                        if (browser_1.isStandalone) {
                            window.open(targetHref, '_blank', 'toolbar=no'); // ensures to open another 'standalone' window!
                        }
                        else {
                            window.open(targetHref);
                        }
                    }
                }
            });
        }
        createTargetUrl(workspace, options) {
            var _a;
            // Empty
            let targetHref = undefined;
            if (!workspace) {
                targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.QUERY_PARAM_EMPTY_WINDOW}=true`;
            }
            // Folder
            else if (windows_1.isFolderToOpen(workspace)) {
                targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.QUERY_PARAM_FOLDER}=${encodeURIComponent(workspace.folderUri.toString())}`;
            }
            // Workspace
            else if (windows_1.isWorkspaceToOpen(workspace)) {
                targetHref = `${document.location.origin}${document.location.pathname}?${WorkspaceProvider.QUERY_PARAM_WORKSPACE}=${encodeURIComponent(workspace.workspaceUri.toString())}`;
            }
            // Append payload if any
            if ((_a = options) === null || _a === void 0 ? void 0 : _a.payload) {
                targetHref += `&${WorkspaceProvider.QUERY_PARAM_PAYLOAD}=${encodeURIComponent(JSON.stringify(options.payload))}`;
            }
            return targetHref;
        }
        isSame(workspaceA, workspaceB) {
            if (!workspaceA || !workspaceB) {
                return workspaceA === workspaceB; // both empty
            }
            if (windows_1.isFolderToOpen(workspaceA) && windows_1.isFolderToOpen(workspaceB)) {
                return resources_1.isEqual(workspaceA.folderUri, workspaceB.folderUri); // same workspace
            }
            if (windows_1.isWorkspaceToOpen(workspaceA) && windows_1.isWorkspaceToOpen(workspaceB)) {
                return resources_1.isEqual(workspaceA.workspaceUri, workspaceB.workspaceUri); // same workspace
            }
            return false;
        }
    }
    WorkspaceProvider.QUERY_PARAM_EMPTY_WINDOW = 'ew';
    WorkspaceProvider.QUERY_PARAM_FOLDER = 'folder';
    WorkspaceProvider.QUERY_PARAM_WORKSPACE = 'workspace';
    WorkspaceProvider.QUERY_PARAM_PAYLOAD = 'payload';
    (function () {
        // Find config element in DOM
        const configElement = document.getElementById('vscode-workbench-web-configuration');
        const configElementAttribute = configElement ? configElement.getAttribute('data-settings') : undefined;
        if (!configElement || !configElementAttribute) {
            throw new Error('Missing web configuration element');
        }
        // Find workspace to open and payload
        let foundWorkspace = false;
        let workspace;
        let payload = Object.create(null);
        const query = new URL(document.location.href).searchParams;
        query.forEach((value, key) => {
            switch (key) {
                // Folder
                case WorkspaceProvider.QUERY_PARAM_FOLDER:
                    workspace = { folderUri: workbench_web_api_1.URI.parse(value) };
                    foundWorkspace = true;
                    break;
                // Workspace
                case WorkspaceProvider.QUERY_PARAM_WORKSPACE:
                    workspace = { workspaceUri: workbench_web_api_1.URI.parse(value) };
                    foundWorkspace = true;
                    break;
                // Empty
                case WorkspaceProvider.QUERY_PARAM_EMPTY_WINDOW:
                    workspace = undefined;
                    foundWorkspace = true;
                    break;
                // Payload
                case WorkspaceProvider.QUERY_PARAM_PAYLOAD:
                    payload = JSON.parse(value);
                    break;
            }
        });
        // If no workspace is provided through the URL, check for config attribute from server
        const options = JSON.parse(configElementAttribute);
        if (!foundWorkspace) {
            if (options.folderUri) {
                workspace = { folderUri: workbench_web_api_1.URI.revive(options.folderUri) };
            }
            else if (options.workspaceUri) {
                workspace = { workspaceUri: workbench_web_api_1.URI.revive(options.workspaceUri) };
            }
            else {
                workspace = undefined;
            }
        }
        options.workspaceProvider = new WorkspaceProvider(workspace, payload);
        options.urlCallbackProvider = new PollingURLCallbackProvider();
        options.credentialsProvider = new LocalStorageCredentialsProvider();
        if (Array.isArray(options.staticExtensions)) {
            options.staticExtensions.forEach(extension => {
                extension.extensionLocation = workbench_web_api_1.URI.revive(extension.extensionLocation);
            });
        }
        // Finally create workbench
        workbench_web_api_1.create(document.body, options);
    })();
});
//# sourceMappingURL=workbench.js.map