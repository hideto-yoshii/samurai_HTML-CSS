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
define(["require", "exports", "vs/nls", "vs/platform/dialogs/common/dialogs", "vs/platform/layout/browser/layoutService", "vs/platform/log/common/log", "vs/base/common/severity", "vs/base/browser/ui/dialog/dialog", "vs/platform/theme/common/themeService", "vs/platform/theme/common/styler", "vs/base/common/lifecycle", "vs/base/browser/dom", "vs/platform/keybinding/common/keybinding", "vs/platform/product/common/productService", "vs/platform/clipboard/common/clipboardService", "vs/platform/instantiation/common/extensions"], function (require, exports, nls, dialogs_1, layoutService_1, log_1, severity_1, dialog_1, themeService_1, styler_1, lifecycle_1, dom_1, keybinding_1, productService_1, clipboardService_1, extensions_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let DialogService = class DialogService {
        constructor(logService, layoutService, themeService, keybindingService, productService, clipboardService) {
            this.logService = logService;
            this.layoutService = layoutService;
            this.themeService = themeService;
            this.keybindingService = keybindingService;
            this.productService = productService;
            this.clipboardService = clipboardService;
            this.allowableCommands = ['copy', 'cut'];
        }
        confirm(confirmation) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logService.trace('DialogService#confirm', confirmation.message);
                const buttons = [];
                if (confirmation.primaryButton) {
                    buttons.push(confirmation.primaryButton);
                }
                else {
                    buttons.push(nls.localize({ key: 'yesButton', comment: ['&& denotes a mnemonic'] }, "&&Yes"));
                }
                if (confirmation.secondaryButton) {
                    buttons.push(confirmation.secondaryButton);
                }
                else if (typeof confirmation.secondaryButton === 'undefined') {
                    buttons.push(nls.localize('cancelButton', "Cancel"));
                }
                const dialogDisposables = new lifecycle_1.DisposableStore();
                const dialog = new dialog_1.Dialog(this.layoutService.container, confirmation.message, buttons, {
                    detail: confirmation.detail,
                    cancelId: 1,
                    type: confirmation.type,
                    keyEventProcessor: (event) => {
                        const resolved = this.keybindingService.softDispatch(event, this.layoutService.container);
                        if (resolved && resolved.commandId) {
                            if (this.allowableCommands.indexOf(resolved.commandId) === -1) {
                                dom_1.EventHelper.stop(event, true);
                            }
                        }
                    },
                    checkboxChecked: confirmation.checkbox ? confirmation.checkbox.checked : undefined,
                    checkboxLabel: confirmation.checkbox ? confirmation.checkbox.label : undefined
                });
                dialogDisposables.add(dialog);
                dialogDisposables.add(styler_1.attachDialogStyler(dialog, this.themeService));
                const result = yield dialog.show();
                dialogDisposables.dispose();
                return { confirmed: result.button === 0, checkboxChecked: result.checkboxChecked };
            });
        }
        getDialogType(severity) {
            return (severity === severity_1.default.Info) ? 'question' : (severity === severity_1.default.Error) ? 'error' : (severity === severity_1.default.Warning) ? 'warning' : 'none';
        }
        show(severity, message, buttons, options) {
            return __awaiter(this, void 0, void 0, function* () {
                this.logService.trace('DialogService#show', message);
                const dialogDisposables = new lifecycle_1.DisposableStore();
                const dialog = new dialog_1.Dialog(this.layoutService.container, message, buttons, {
                    detail: options ? options.detail : undefined,
                    cancelId: options ? options.cancelId : undefined,
                    type: this.getDialogType(severity),
                    keyEventProcessor: (event) => {
                        const resolved = this.keybindingService.softDispatch(event, this.layoutService.container);
                        if (resolved && resolved.commandId) {
                            if (this.allowableCommands.indexOf(resolved.commandId) === -1) {
                                dom_1.EventHelper.stop(event, true);
                            }
                        }
                    },
                    checkboxLabel: options && options.checkbox ? options.checkbox.label : undefined,
                    checkboxChecked: options && options.checkbox ? options.checkbox.checked : undefined
                });
                dialogDisposables.add(dialog);
                dialogDisposables.add(styler_1.attachDialogStyler(dialog, this.themeService));
                const result = yield dialog.show();
                dialogDisposables.dispose();
                return {
                    choice: result.button,
                    checkboxChecked: result.checkboxChecked
                };
            });
        }
        about() {
            return __awaiter(this, void 0, void 0, function* () {
                const detail = nls.localize('aboutDetail', "Version: {0}\nCommit: {1}\nDate: {2}\nBrowser: {3}", this.productService.version || 'Unknown', this.productService.commit || 'Unknown', this.productService.date || 'Unknown', navigator.userAgent);
                const { choice } = yield this.show(severity_1.default.Info, this.productService.nameLong, [nls.localize('copy', "Copy"), nls.localize('ok', "OK")], { detail, cancelId: 1 });
                if (choice === 0) {
                    this.clipboardService.writeText(detail);
                }
            });
        }
    };
    DialogService = __decorate([
        __param(0, log_1.ILogService),
        __param(1, layoutService_1.ILayoutService),
        __param(2, themeService_1.IThemeService),
        __param(3, keybinding_1.IKeybindingService),
        __param(4, productService_1.IProductService),
        __param(5, clipboardService_1.IClipboardService)
    ], DialogService);
    exports.DialogService = DialogService;
    extensions_1.registerSingleton(dialogs_1.IDialogService, DialogService, true);
});
//# sourceMappingURL=dialogService.js.map