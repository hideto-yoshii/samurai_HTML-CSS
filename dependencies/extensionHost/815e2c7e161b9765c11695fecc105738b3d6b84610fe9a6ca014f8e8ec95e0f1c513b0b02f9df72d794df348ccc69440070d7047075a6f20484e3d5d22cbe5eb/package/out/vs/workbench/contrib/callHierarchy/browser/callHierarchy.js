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
define(["require", "exports", "vs/editor/common/modes/languageFeatureRegistry", "vs/base/common/arrays", "vs/base/common/errors"], function (require, exports, languageFeatureRegistry_1, arrays_1, errors_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var CallHierarchyDirection;
    (function (CallHierarchyDirection) {
        CallHierarchyDirection[CallHierarchyDirection["CallsTo"] = 1] = "CallsTo";
        CallHierarchyDirection[CallHierarchyDirection["CallsFrom"] = 2] = "CallsFrom";
    })(CallHierarchyDirection = exports.CallHierarchyDirection || (exports.CallHierarchyDirection = {}));
    exports.CallHierarchyProviderRegistry = new languageFeatureRegistry_1.LanguageFeatureRegistry();
    class RefCountedDisposabled {
        constructor(_disposable, _counter = 1) {
            this._disposable = _disposable;
            this._counter = _counter;
        }
        acquire() {
            this._counter++;
            return this;
        }
        release() {
            if (--this._counter === 0) {
                this._disposable.dispose();
            }
            return this;
        }
    }
    class CallHierarchyModel {
        constructor(provider, root, ref) {
            this.provider = provider;
            this.root = root;
            this.ref = ref;
        }
        static create(model, position, token) {
            return __awaiter(this, void 0, void 0, function* () {
                const [provider] = exports.CallHierarchyProviderRegistry.ordered(model);
                if (!provider) {
                    return undefined;
                }
                const session = yield provider.prepareCallHierarchy(model, position, token);
                if (!session) {
                    return undefined;
                }
                return new CallHierarchyModel(provider, session.root, new RefCountedDisposabled(session));
            });
        }
        dispose() {
            this.ref.release();
        }
        fork(item) {
            const that = this;
            return new class extends CallHierarchyModel {
                constructor() {
                    super(that.provider, item, that.ref.acquire());
                }
            };
        }
        resolveIncomingCalls(item, token) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const result = yield this.provider.provideIncomingCalls(item, token);
                    if (arrays_1.isNonEmptyArray(result)) {
                        return result;
                    }
                }
                catch (e) {
                    errors_1.onUnexpectedExternalError(e);
                }
                return [];
            });
        }
        resolveOutgoingCalls(item, token) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const result = yield this.provider.provideOutgoingCalls(item, token);
                    if (arrays_1.isNonEmptyArray(result)) {
                        return result;
                    }
                }
                catch (e) {
                    errors_1.onUnexpectedExternalError(e);
                }
                return [];
            });
        }
    }
    exports.CallHierarchyModel = CallHierarchyModel;
});
//# sourceMappingURL=callHierarchy.js.map