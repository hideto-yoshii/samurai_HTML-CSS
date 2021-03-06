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
define(["require", "exports", "vs/base/common/event", "vs/base/common/lifecycle", "vs/base/common/map", "vs/base/common/uri", "vs/base/common/uuid", "vs/platform/registry/common/platform", "vs/workbench/api/common/extHostCustomers", "vs/workbench/browser/panel", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/contrib/comments/browser/commentsPanel", "vs/workbench/services/panel/common/panelService", "../common/extHost.protocol", "vs/workbench/contrib/comments/browser/commentsTreeViewer"], function (require, exports, event_1, lifecycle_1, map_1, uri_1, uuid_1, platform_1, extHostCustomers_1, panel_1, commentService_1, commentsPanel_1, panelService_1, extHost_protocol_1, commentsTreeViewer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class MainThreadCommentThread {
        constructor(commentThreadHandle, controllerHandle, extensionId, threadId, resource, _range) {
            this.commentThreadHandle = commentThreadHandle;
            this.controllerHandle = controllerHandle;
            this.extensionId = extensionId;
            this.threadId = threadId;
            this.resource = resource;
            this._range = _range;
            this._onDidChangeInput = new event_1.Emitter();
            this._onDidChangeLabel = new event_1.Emitter();
            this.onDidChangeLabel = this._onDidChangeLabel.event;
            this._onDidChangeComments = new event_1.Emitter();
            this._onDidChangeRange = new event_1.Emitter();
            this.onDidChangeRange = this._onDidChangeRange.event;
            this._onDidChangeCollasibleState = new event_1.Emitter();
            this.onDidChangeCollasibleState = this._onDidChangeCollasibleState.event;
            this._isDisposed = false;
        }
        get input() {
            return this._input;
        }
        set input(value) {
            this._input = value;
            this._onDidChangeInput.fire(value);
        }
        get onDidChangeInput() { return this._onDidChangeInput.event; }
        get label() {
            return this._label;
        }
        set label(label) {
            this._label = label;
            this._onDidChangeLabel.fire(this._label);
        }
        get contextValue() {
            return this._contextValue;
        }
        set contextValue(context) {
            this._contextValue = context;
        }
        get comments() {
            return this._comments;
        }
        set comments(newComments) {
            this._comments = newComments;
            this._onDidChangeComments.fire(this._comments);
        }
        get onDidChangeComments() { return this._onDidChangeComments.event; }
        set range(range) {
            this._range = range;
            this._onDidChangeRange.fire(this._range);
        }
        get range() {
            return this._range;
        }
        get collapsibleState() {
            return this._collapsibleState;
        }
        set collapsibleState(newState) {
            this._collapsibleState = newState;
            this._onDidChangeCollasibleState.fire(this._collapsibleState);
        }
        get isDisposed() {
            return this._isDisposed;
        }
        batchUpdate(changes) {
            const modified = (value) => Object.prototype.hasOwnProperty.call(changes, value);
            if (modified('range')) {
                this._range = changes.range;
            }
            if (modified('label')) {
                this._label = changes.label;
            }
            if (modified('contextValue')) {
                this._contextValue = changes.contextValue;
            }
            if (modified('comments')) {
                this._comments = changes.comments;
            }
            if (modified('collapseState')) {
                this._collapsibleState = changes.collapseState;
            }
        }
        dispose() {
            this._isDisposed = true;
            this._onDidChangeCollasibleState.dispose();
            this._onDidChangeComments.dispose();
            this._onDidChangeInput.dispose();
            this._onDidChangeLabel.dispose();
            this._onDidChangeRange.dispose();
        }
        toJSON() {
            return {
                $mid: 7,
                commentControlHandle: this.controllerHandle,
                commentThreadHandle: this.commentThreadHandle,
            };
        }
    }
    exports.MainThreadCommentThread = MainThreadCommentThread;
    class MainThreadCommentController {
        constructor(_proxy, _commentService, _handle, _uniqueId, _id, _label, _features) {
            this._proxy = _proxy;
            this._commentService = _commentService;
            this._handle = _handle;
            this._uniqueId = _uniqueId;
            this._id = _id;
            this._label = _label;
            this._features = _features;
            this._threads = new Map();
        }
        get handle() {
            return this._handle;
        }
        get id() {
            return this._id;
        }
        get contextValue() {
            return this._id;
        }
        get proxy() {
            return this._proxy;
        }
        get label() {
            return this._label;
        }
        get reactions() {
            return this._reactions;
        }
        set reactions(reactions) {
            this._reactions = reactions;
        }
        get features() {
            return this._features;
        }
        updateFeatures(features) {
            this._features = features;
        }
        createCommentThread(extensionId, commentThreadHandle, threadId, resource, range) {
            let thread = new MainThreadCommentThread(commentThreadHandle, this.handle, extensionId, threadId, uri_1.URI.revive(resource).toString(), range);
            this._threads.set(commentThreadHandle, thread);
            this._commentService.updateComments(this._uniqueId, {
                added: [thread],
                removed: [],
                changed: []
            });
            return thread;
        }
        updateCommentThread(commentThreadHandle, threadId, resource, changes) {
            let thread = this.getKnownThread(commentThreadHandle);
            thread.batchUpdate(changes);
            this._commentService.updateComments(this._uniqueId, {
                added: [],
                removed: [],
                changed: [thread]
            });
        }
        deleteCommentThread(commentThreadHandle) {
            let thread = this.getKnownThread(commentThreadHandle);
            this._threads.delete(commentThreadHandle);
            this._commentService.updateComments(this._uniqueId, {
                added: [],
                removed: [thread],
                changed: []
            });
            thread.dispose();
        }
        deleteCommentThreadMain(commentThreadId) {
            this._threads.forEach(thread => {
                if (thread.threadId === commentThreadId) {
                    this._proxy.$deleteCommentThread(this._handle, thread.commentThreadHandle);
                }
            });
        }
        updateInput(input) {
            let thread = this.activeCommentThread;
            if (thread && thread.input) {
                let commentInput = thread.input;
                commentInput.value = input;
                thread.input = commentInput;
            }
        }
        getKnownThread(commentThreadHandle) {
            const thread = this._threads.get(commentThreadHandle);
            if (!thread) {
                throw new Error('unknown thread');
            }
            return thread;
        }
        getDocumentComments(resource, token) {
            return __awaiter(this, void 0, void 0, function* () {
                let ret = [];
                for (let thread of map_1.keys(this._threads)) {
                    const commentThread = this._threads.get(thread);
                    if (commentThread.resource === resource.toString()) {
                        ret.push(commentThread);
                    }
                }
                let commentingRanges = yield this._proxy.$provideCommentingRanges(this.handle, resource, token);
                return {
                    owner: this._uniqueId,
                    label: this.label,
                    threads: ret,
                    commentingRanges: {
                        resource: resource,
                        ranges: commentingRanges || []
                    }
                };
            });
        }
        getCommentingRanges(resource, token) {
            return __awaiter(this, void 0, void 0, function* () {
                let commentingRanges = yield this._proxy.$provideCommentingRanges(this.handle, resource, token);
                return commentingRanges || [];
            });
        }
        toggleReaction(uri, thread, comment, reaction, token) {
            return __awaiter(this, void 0, void 0, function* () {
                return this._proxy.$toggleReaction(this._handle, thread.commentThreadHandle, uri, comment, reaction);
            });
        }
        getAllComments() {
            let ret = [];
            for (let thread of map_1.keys(this._threads)) {
                ret.push(this._threads.get(thread));
            }
            return ret;
        }
        createCommentThreadTemplate(resource, range) {
            this._proxy.$createCommentThreadTemplate(this.handle, resource, range);
        }
        updateCommentThreadTemplate(threadHandle, range) {
            return __awaiter(this, void 0, void 0, function* () {
                yield this._proxy.$updateCommentThreadTemplate(this.handle, threadHandle, range);
            });
        }
        toJSON() {
            return {
                $mid: 6,
                handle: this.handle
            };
        }
    }
    exports.MainThreadCommentController = MainThreadCommentController;
    let MainThreadComments = class MainThreadComments extends lifecycle_1.Disposable {
        constructor(extHostContext, _commentService, _panelService) {
            super();
            this._commentService = _commentService;
            this._panelService = _panelService;
            this._documentProviders = new Map();
            this._workspaceProviders = new Map();
            this._handlers = new Map();
            this._commentControllers = new Map();
            this._activeCommentThreadDisposables = this._register(new lifecycle_1.DisposableStore());
            this._openPanelListener = null;
            this._proxy = extHostContext.getProxy(extHost_protocol_1.ExtHostContext.ExtHostComments);
            this._register(this._commentService.onDidChangeActiveCommentThread((thread) => __awaiter(this, void 0, void 0, function* () {
                let handle = thread.controllerHandle;
                let controller = this._commentControllers.get(handle);
                if (!controller) {
                    return;
                }
                this._activeCommentThreadDisposables.clear();
                this._activeCommentThread = thread;
                controller.activeCommentThread = this._activeCommentThread;
            })));
        }
        $registerCommentController(handle, id, label) {
            const providerId = uuid_1.generateUuid();
            this._handlers.set(handle, providerId);
            const provider = new MainThreadCommentController(this._proxy, this._commentService, handle, providerId, id, label, {});
            this._commentService.registerCommentController(providerId, provider);
            this._commentControllers.set(handle, provider);
            const commentsPanelAlreadyConstructed = this._panelService.getPanels().some(panel => panel.id === commentsTreeViewer_1.COMMENTS_PANEL_ID);
            if (!commentsPanelAlreadyConstructed) {
                this.registerPanel(commentsPanelAlreadyConstructed);
                this.registerOpenPanelListener(commentsPanelAlreadyConstructed);
            }
            this._commentService.setWorkspaceComments(String(handle), []);
        }
        $unregisterCommentController(handle) {
            const providerId = this._handlers.get(handle);
            if (typeof providerId !== 'string') {
                throw new Error('unknown handler');
            }
            this._commentService.unregisterCommentController(providerId);
            this._handlers.delete(handle);
            this._commentControllers.delete(handle);
        }
        $updateCommentControllerFeatures(handle, features) {
            let provider = this._commentControllers.get(handle);
            if (!provider) {
                return undefined;
            }
            provider.updateFeatures(features);
        }
        $createCommentThread(handle, commentThreadHandle, threadId, resource, range, extensionId) {
            let provider = this._commentControllers.get(handle);
            if (!provider) {
                return undefined;
            }
            return provider.createCommentThread(extensionId.value, commentThreadHandle, threadId, resource, range);
        }
        $updateCommentThread(handle, commentThreadHandle, threadId, resource, changes) {
            let provider = this._commentControllers.get(handle);
            if (!provider) {
                return undefined;
            }
            return provider.updateCommentThread(commentThreadHandle, threadId, resource, changes);
        }
        $deleteCommentThread(handle, commentThreadHandle) {
            let provider = this._commentControllers.get(handle);
            if (!provider) {
                return;
            }
            return provider.deleteCommentThread(commentThreadHandle);
        }
        registerPanel(commentsPanelAlreadyConstructed) {
            if (!commentsPanelAlreadyConstructed) {
                platform_1.Registry.as(panel_1.Extensions.Panels).registerPanel(new panel_1.PanelDescriptor(commentsPanel_1.CommentsPanel, commentsTreeViewer_1.COMMENTS_PANEL_ID, commentsTreeViewer_1.COMMENTS_PANEL_TITLE, 'commentsPanel', 10));
            }
        }
        /**
         * If the comments panel has never been opened, the constructor for it has not yet run so it has
         * no listeners for comment threads being set or updated. Listen for the panel opening for the
         * first time and send it comments then.
         */
        registerOpenPanelListener(commentsPanelAlreadyConstructed) {
            if (!commentsPanelAlreadyConstructed && !this._openPanelListener) {
                this._openPanelListener = this._panelService.onDidPanelOpen(e => {
                    if (e.panel.getId() === commentsTreeViewer_1.COMMENTS_PANEL_ID) {
                        map_1.keys(this._commentControllers).forEach(handle => {
                            let threads = this._commentControllers.get(handle).getAllComments();
                            if (threads.length) {
                                const providerId = this.getHandler(handle);
                                this._commentService.setWorkspaceComments(providerId, threads);
                            }
                        });
                        if (this._openPanelListener) {
                            this._openPanelListener.dispose();
                            this._openPanelListener = null;
                        }
                    }
                });
            }
        }
        getHandler(handle) {
            if (!this._handlers.has(handle)) {
                throw new Error('Unknown handler');
            }
            return this._handlers.get(handle);
        }
        $onDidCommentThreadsChange(handle, event) {
            // notify comment service
            const providerId = this.getHandler(handle);
            this._commentService.updateComments(providerId, event);
        }
        dispose() {
            super.dispose();
            this._workspaceProviders.forEach(value => lifecycle_1.dispose(value));
            this._workspaceProviders.clear();
            this._documentProviders.forEach(value => lifecycle_1.dispose(value));
            this._documentProviders.clear();
        }
    };
    MainThreadComments = __decorate([
        extHostCustomers_1.extHostNamedCustomer(extHost_protocol_1.MainContext.MainThreadComments),
        __param(1, commentService_1.ICommentService),
        __param(2, panelService_1.IPanelService)
    ], MainThreadComments);
    exports.MainThreadComments = MainThreadComments;
});
//# sourceMappingURL=mainThreadComments.js.map