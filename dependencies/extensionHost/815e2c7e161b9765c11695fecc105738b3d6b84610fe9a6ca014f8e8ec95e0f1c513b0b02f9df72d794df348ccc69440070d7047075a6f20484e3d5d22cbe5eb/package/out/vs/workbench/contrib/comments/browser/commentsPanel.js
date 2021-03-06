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
define(["require", "exports", "vs/nls", "vs/base/browser/dom", "vs/base/common/actions", "vs/base/browser/ui/tree/treeDefaults", "vs/editor/browser/editorBrowser", "vs/platform/instantiation/common/instantiation", "vs/platform/list/browser/listService", "vs/platform/telemetry/common/telemetry", "vs/platform/theme/common/themeService", "vs/workbench/browser/panel", "vs/workbench/contrib/comments/common/commentModel", "vs/workbench/contrib/comments/browser/commentsEditorContribution", "vs/workbench/contrib/comments/browser/commentService", "vs/workbench/services/editor/common/editorService", "vs/platform/commands/common/commands", "vs/platform/theme/common/colorRegistry", "vs/platform/storage/common/storage", "vs/workbench/browser/labels", "vs/workbench/services/panel/common/panelService", "vs/workbench/contrib/comments/browser/commentsTreeViewer", "vs/css!./media/panel"], function (require, exports, nls, dom, actions_1, treeDefaults_1, editorBrowser_1, instantiation_1, listService_1, telemetry_1, themeService_1, panel_1, commentModel_1, commentsEditorContribution_1, commentService_1, editorService_1, commands_1, colorRegistry_1, storage_1, labels_1, panelService_1, commentsTreeViewer_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let CommentsPanel = class CommentsPanel extends panel_1.Panel {
        constructor(instantiationService, commentService, editorService, telemetryService, themeService, storageService) {
            super(commentsTreeViewer_1.COMMENTS_PANEL_ID, telemetryService, themeService, storageService);
            this.instantiationService = instantiationService;
            this.commentService = commentService;
            this.editorService = editorService;
        }
        create(parent) {
            super.create(parent);
            dom.addClass(parent, 'comments-panel');
            let container = dom.append(parent, dom.$('.comments-panel-container'));
            this.treeContainer = dom.append(container, dom.$('.tree-container'));
            this.commentsModel = new commentModel_1.CommentsModel();
            this.createTree();
            this.createMessageBox(container);
            this._register(this.commentService.onDidSetAllCommentThreads(this.onAllCommentsChanged, this));
            this._register(this.commentService.onDidUpdateCommentThreads(this.onCommentsUpdated, this));
            const styleElement = dom.createStyleSheet(parent);
            this.applyStyles(styleElement);
            this._register(this.themeService.onThemeChange(_ => this.applyStyles(styleElement)));
            this._register(this.onDidChangeVisibility(visible => {
                if (visible) {
                    this.refresh();
                }
            }));
            this.render();
        }
        applyStyles(styleElement) {
            const content = [];
            const theme = this.themeService.getTheme();
            const linkColor = theme.getColor(colorRegistry_1.textLinkForeground);
            if (linkColor) {
                content.push(`.comments-panel .comments-panel-container a { color: ${linkColor}; }`);
            }
            const linkActiveColor = theme.getColor(colorRegistry_1.textLinkActiveForeground);
            if (linkActiveColor) {
                content.push(`.comments-panel .comments-panel-container a:hover, a:active { color: ${linkActiveColor}; }`);
            }
            const focusColor = theme.getColor(colorRegistry_1.focusBorder);
            if (focusColor) {
                content.push(`.comments-panel .commenst-panel-container a:focus { outline-color: ${focusColor}; }`);
            }
            const codeTextForegroundColor = theme.getColor(colorRegistry_1.textPreformatForeground);
            if (codeTextForegroundColor) {
                content.push(`.comments-panel .comments-panel-container .text code { color: ${codeTextForegroundColor}; }`);
            }
            styleElement.innerHTML = content.join('\n');
        }
        render() {
            return __awaiter(this, void 0, void 0, function* () {
                dom.toggleClass(this.treeContainer, 'hidden', !this.commentsModel.hasCommentThreads());
                yield this.tree.setInput(this.commentsModel);
                this.renderMessage();
            });
        }
        getActions() {
            if (!this.collapseAllAction) {
                this.collapseAllAction = new actions_1.Action('vs.tree.collapse', nls.localize('collapseAll', "Collapse All"), 'monaco-tree-action collapse-all', true, () => this.tree ? new treeDefaults_1.CollapseAllAction(this.tree, true).run() : Promise.resolve());
                this._register(this.collapseAllAction);
            }
            return [this.collapseAllAction];
        }
        layout(dimensions) {
            this.tree.layout(dimensions.height, dimensions.width);
        }
        getTitle() {
            return commentsTreeViewer_1.COMMENTS_PANEL_TITLE;
        }
        createMessageBox(parent) {
            this.messageBoxContainer = dom.append(parent, dom.$('.message-box-container'));
            this.messageBox = dom.append(this.messageBoxContainer, dom.$('span'));
            this.messageBox.setAttribute('tabindex', '0');
        }
        renderMessage() {
            this.messageBox.textContent = this.commentsModel.getMessage();
            dom.toggleClass(this.messageBoxContainer, 'hidden', this.commentsModel.hasCommentThreads());
        }
        createTree() {
            this.treeLabels = this._register(this.instantiationService.createInstance(labels_1.ResourceLabels, this));
            this.tree = this._register(this.instantiationService.createInstance(commentsTreeViewer_1.CommentsList, this.treeLabels, this.treeContainer));
            const commentsNavigator = this._register(new listService_1.TreeResourceNavigator2(this.tree, { openOnFocus: true }));
            this._register(commentsNavigator.onDidOpenResource(e => {
                this.openFile(e.element, e.editorOptions.pinned, e.editorOptions.preserveFocus, e.sideBySide);
            }));
        }
        openFile(element, pinned, preserveFocus, sideBySide) {
            if (!element) {
                return false;
            }
            if (!(element instanceof commentModel_1.ResourceWithCommentThreads || element instanceof commentModel_1.CommentNode)) {
                return false;
            }
            const range = element instanceof commentModel_1.ResourceWithCommentThreads ? element.commentThreads[0].range : element.range;
            const activeEditor = this.editorService.activeEditor;
            let currentActiveResource = activeEditor ? activeEditor.getResource() : undefined;
            if (currentActiveResource && currentActiveResource.toString() === element.resource.toString()) {
                const threadToReveal = element instanceof commentModel_1.ResourceWithCommentThreads ? element.commentThreads[0].threadId : element.threadId;
                const commentToReveal = element instanceof commentModel_1.ResourceWithCommentThreads ? element.commentThreads[0].comment.uniqueIdInThread : element.comment.uniqueIdInThread;
                const control = this.editorService.activeTextEditorWidget;
                if (threadToReveal && editorBrowser_1.isCodeEditor(control)) {
                    const controller = commentsEditorContribution_1.CommentController.get(control);
                    controller.revealCommentThread(threadToReveal, commentToReveal, false);
                }
                return true;
            }
            const threadToReveal = element instanceof commentModel_1.ResourceWithCommentThreads ? element.commentThreads[0].threadId : element.threadId;
            const commentToReveal = element instanceof commentModel_1.ResourceWithCommentThreads ? element.commentThreads[0].comment : element.comment;
            this.editorService.openEditor({
                resource: element.resource,
                options: {
                    pinned: pinned,
                    preserveFocus: preserveFocus,
                    selection: range
                }
            }, sideBySide ? editorService_1.SIDE_GROUP : editorService_1.ACTIVE_GROUP).then(editor => {
                if (editor) {
                    const control = editor.getControl();
                    if (threadToReveal && editorBrowser_1.isCodeEditor(control)) {
                        const controller = commentsEditorContribution_1.CommentController.get(control);
                        controller.revealCommentThread(threadToReveal, commentToReveal.uniqueIdInThread, true);
                    }
                }
            });
            return true;
        }
        refresh() {
            if (this.isVisible()) {
                if (this.collapseAllAction) {
                    this.collapseAllAction.enabled = this.commentsModel.hasCommentThreads();
                }
                dom.toggleClass(this.treeContainer, 'hidden', !this.commentsModel.hasCommentThreads());
                this.tree.updateChildren().then(() => {
                    this.renderMessage();
                }, (e) => {
                    console.log(e);
                });
            }
        }
        onAllCommentsChanged(e) {
            this.commentsModel.setCommentThreads(e.ownerId, e.commentThreads);
            this.refresh();
        }
        onCommentsUpdated(e) {
            const didUpdate = this.commentsModel.updateCommentThreads(e);
            if (didUpdate) {
                this.refresh();
            }
        }
    };
    CommentsPanel = __decorate([
        __param(0, instantiation_1.IInstantiationService),
        __param(1, commentService_1.ICommentService),
        __param(2, editorService_1.IEditorService),
        __param(3, telemetry_1.ITelemetryService),
        __param(4, themeService_1.IThemeService),
        __param(5, storage_1.IStorageService)
    ], CommentsPanel);
    exports.CommentsPanel = CommentsPanel;
    commands_1.CommandsRegistry.registerCommand({
        id: 'workbench.action.focusCommentsPanel',
        handler: (accessor) => {
            const panelService = accessor.get(panelService_1.IPanelService);
            const panels = panelService.getPanels();
            if (panels.some(panelIdentifier => panelIdentifier.id === commentsTreeViewer_1.COMMENTS_PANEL_ID)) {
                panelService.openPanel(commentsTreeViewer_1.COMMENTS_PANEL_ID, true);
            }
        }
    });
});
//# sourceMappingURL=commentsPanel.js.map