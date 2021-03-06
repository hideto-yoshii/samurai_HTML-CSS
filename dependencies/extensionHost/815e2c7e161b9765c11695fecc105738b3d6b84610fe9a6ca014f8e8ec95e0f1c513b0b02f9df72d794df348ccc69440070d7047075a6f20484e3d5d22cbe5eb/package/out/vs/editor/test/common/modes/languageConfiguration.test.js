/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/editor/common/modes/languageConfiguration"], function (require, exports, assert, languageConfiguration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('StandardAutoClosingPairConditional', () => {
        test('Missing notIn', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}' });
            assert.equal(v.isOK(0 /* Other */), true);
            assert.equal(v.isOK(1 /* Comment */), true);
            assert.equal(v.isOK(2 /* String */), true);
            assert.equal(v.isOK(4 /* RegEx */), true);
        });
        test('Empty notIn', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}', notIn: [] });
            assert.equal(v.isOK(0 /* Other */), true);
            assert.equal(v.isOK(1 /* Comment */), true);
            assert.equal(v.isOK(2 /* String */), true);
            assert.equal(v.isOK(4 /* RegEx */), true);
        });
        test('Invalid notIn', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}', notIn: ['bla'] });
            assert.equal(v.isOK(0 /* Other */), true);
            assert.equal(v.isOK(1 /* Comment */), true);
            assert.equal(v.isOK(2 /* String */), true);
            assert.equal(v.isOK(4 /* RegEx */), true);
        });
        test('notIn in strings', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}', notIn: ['string'] });
            assert.equal(v.isOK(0 /* Other */), true);
            assert.equal(v.isOK(1 /* Comment */), true);
            assert.equal(v.isOK(2 /* String */), false);
            assert.equal(v.isOK(4 /* RegEx */), true);
        });
        test('notIn in comments', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}', notIn: ['comment'] });
            assert.equal(v.isOK(0 /* Other */), true);
            assert.equal(v.isOK(1 /* Comment */), false);
            assert.equal(v.isOK(2 /* String */), true);
            assert.equal(v.isOK(4 /* RegEx */), true);
        });
        test('notIn in regex', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}', notIn: ['regex'] });
            assert.equal(v.isOK(0 /* Other */), true);
            assert.equal(v.isOK(1 /* Comment */), true);
            assert.equal(v.isOK(2 /* String */), true);
            assert.equal(v.isOK(4 /* RegEx */), false);
        });
        test('notIn in strings nor comments', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}', notIn: ['string', 'comment'] });
            assert.equal(v.isOK(0 /* Other */), true);
            assert.equal(v.isOK(1 /* Comment */), false);
            assert.equal(v.isOK(2 /* String */), false);
            assert.equal(v.isOK(4 /* RegEx */), true);
        });
        test('notIn in strings nor regex', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}', notIn: ['string', 'regex'] });
            assert.equal(v.isOK(0 /* Other */), true);
            assert.equal(v.isOK(1 /* Comment */), true);
            assert.equal(v.isOK(2 /* String */), false);
            assert.equal(v.isOK(4 /* RegEx */), false);
        });
        test('notIn in comments nor regex', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}', notIn: ['comment', 'regex'] });
            assert.equal(v.isOK(0 /* Other */), true);
            assert.equal(v.isOK(1 /* Comment */), false);
            assert.equal(v.isOK(2 /* String */), true);
            assert.equal(v.isOK(4 /* RegEx */), false);
        });
        test('notIn in strings, comments nor regex', () => {
            let v = new languageConfiguration_1.StandardAutoClosingPairConditional({ open: '{', close: '}', notIn: ['string', 'comment', 'regex'] });
            assert.equal(v.isOK(0 /* Other */), true);
            assert.equal(v.isOK(1 /* Comment */), false);
            assert.equal(v.isOK(2 /* String */), false);
            assert.equal(v.isOK(4 /* RegEx */), false);
        });
    });
});
//# sourceMappingURL=languageConfiguration.test.js.map