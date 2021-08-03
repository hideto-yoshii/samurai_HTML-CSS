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
define(["require", "exports", "vs/base/common/marked/marked", "vs/editor/common/modes/textToHtmlTokenizer", "vs/editor/common/modes"], function (require, exports, marked, textToHtmlTokenizer_1, modes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    /**
     * Renders a string of markdown as a document.
     *
     * Uses VS Code's syntax highlighting code blocks.
     */
    function renderMarkdownDocument(text, extensionService, modeService) {
        return __awaiter(this, void 0, void 0, function* () {
            const renderer = yield getRenderer(text, extensionService, modeService);
            return marked(text, { renderer });
        });
    }
    exports.renderMarkdownDocument = renderMarkdownDocument;
    function getRenderer(text, extensionService, modeService) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = [];
            const renderer = new marked.Renderer();
            renderer.code = (_code, lang) => {
                const modeId = modeService.getModeIdForLanguageName(lang);
                if (modeId) {
                    result.push(extensionService.whenInstalledExtensionsRegistered().then(() => {
                        modeService.triggerMode(modeId);
                        return modes_1.TokenizationRegistry.getPromise(modeId);
                    }));
                }
                return '';
            };
            marked(text, { renderer });
            yield Promise.all(result);
            renderer.code = (code, lang) => {
                const modeId = modeService.getModeIdForLanguageName(lang);
                return `<code>${textToHtmlTokenizer_1.tokenizeToString(code, modeId ? modes_1.TokenizationRegistry.get(modeId) : undefined)}</code>`;
            };
            return renderer;
        });
    }
});
//# sourceMappingURL=markdownDocumentRenderer.js.map