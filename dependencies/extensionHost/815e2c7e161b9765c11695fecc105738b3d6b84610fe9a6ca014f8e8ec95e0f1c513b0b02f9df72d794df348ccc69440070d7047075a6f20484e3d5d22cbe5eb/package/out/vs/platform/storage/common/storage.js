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
define(["require", "exports", "vs/platform/instantiation/common/instantiation", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/types"], function (require, exports, instantiation_1, event_1, lifecycle_1, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.IStorageService = instantiation_1.createDecorator('storageService');
    var WillSaveStateReason;
    (function (WillSaveStateReason) {
        WillSaveStateReason[WillSaveStateReason["NONE"] = 0] = "NONE";
        WillSaveStateReason[WillSaveStateReason["SHUTDOWN"] = 1] = "SHUTDOWN";
    })(WillSaveStateReason = exports.WillSaveStateReason || (exports.WillSaveStateReason = {}));
    var StorageScope;
    (function (StorageScope) {
        /**
         * The stored data will be scoped to all workspaces.
         */
        StorageScope[StorageScope["GLOBAL"] = 0] = "GLOBAL";
        /**
         * The stored data will be scoped to the current workspace.
         */
        StorageScope[StorageScope["WORKSPACE"] = 1] = "WORKSPACE";
    })(StorageScope = exports.StorageScope || (exports.StorageScope = {}));
    class InMemoryStorageService extends lifecycle_1.Disposable {
        constructor() {
            super(...arguments);
            this._onDidChangeStorage = this._register(new event_1.Emitter());
            this.onDidChangeStorage = this._onDidChangeStorage.event;
            this.onWillSaveState = event_1.Event.None;
            this.globalCache = new Map();
            this.workspaceCache = new Map();
        }
        getCache(scope) {
            return scope === 0 /* GLOBAL */ ? this.globalCache : this.workspaceCache;
        }
        get(key, scope, fallbackValue) {
            const value = this.getCache(scope).get(key);
            if (types_1.isUndefinedOrNull(value)) {
                return fallbackValue;
            }
            return value;
        }
        getBoolean(key, scope, fallbackValue) {
            const value = this.getCache(scope).get(key);
            if (types_1.isUndefinedOrNull(value)) {
                return fallbackValue;
            }
            return value === 'true';
        }
        getNumber(key, scope, fallbackValue) {
            const value = this.getCache(scope).get(key);
            if (types_1.isUndefinedOrNull(value)) {
                return fallbackValue;
            }
            return parseInt(value, 10);
        }
        store(key, value, scope) {
            // We remove the key for undefined/null values
            if (types_1.isUndefinedOrNull(value)) {
                return this.remove(key, scope);
            }
            // Otherwise, convert to String and store
            const valueStr = String(value);
            // Return early if value already set
            const currentValue = this.getCache(scope).get(key);
            if (currentValue === valueStr) {
                return Promise.resolve();
            }
            // Update in cache
            this.getCache(scope).set(key, valueStr);
            // Events
            this._onDidChangeStorage.fire({ scope, key });
            return Promise.resolve();
        }
        remove(key, scope) {
            const wasDeleted = this.getCache(scope).delete(key);
            if (!wasDeleted) {
                return Promise.resolve(); // Return early if value already deleted
            }
            // Events
            this._onDidChangeStorage.fire({ scope, key });
            return Promise.resolve();
        }
        logStorage() {
            logStorage(this.globalCache, this.workspaceCache, 'inMemory', 'inMemory');
        }
        migrate(toWorkspace) {
            return __awaiter(this, void 0, void 0, function* () {
                // not supported
            });
        }
    }
    exports.InMemoryStorageService = InMemoryStorageService;
    function logStorage(global, workspace, globalPath, workspacePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const safeParse = (value) => {
                try {
                    return JSON.parse(value);
                }
                catch (error) {
                    return value;
                }
            };
            const globalItems = new Map();
            const globalItemsParsed = new Map();
            global.forEach((value, key) => {
                globalItems.set(key, value);
                globalItemsParsed.set(key, safeParse(value));
            });
            const workspaceItems = new Map();
            const workspaceItemsParsed = new Map();
            workspace.forEach((value, key) => {
                workspaceItems.set(key, value);
                workspaceItemsParsed.set(key, safeParse(value));
            });
            console.group(`Storage: Global (path: ${globalPath})`);
            let globalValues = [];
            globalItems.forEach((value, key) => {
                globalValues.push({ key, value });
            });
            console.table(globalValues);
            console.groupEnd();
            console.log(globalItemsParsed);
            console.group(`Storage: Workspace (path: ${workspacePath})`);
            let workspaceValues = [];
            workspaceItems.forEach((value, key) => {
                workspaceValues.push({ key, value });
            });
            console.table(workspaceValues);
            console.groupEnd();
            console.log(workspaceItemsParsed);
        });
    }
    exports.logStorage = logStorage;
});
//# sourceMappingURL=storage.js.map