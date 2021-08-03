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
define(["require", "exports", "assert", "xterm", "vs/workbench/contrib/terminal/browser/addons/commandTrackerAddon", "vs/base/common/platform"], function (require, exports, assert, xterm_1, commandTrackerAddon_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function writePromise(term, data) {
        return new Promise(r => term.write(data, r));
    }
    const ROWS = 10;
    const COLS = 10;
    suite('Workbench - TerminalCommandTracker', () => {
        let xterm;
        let commandTracker;
        setup(() => __awaiter(void 0, void 0, void 0, function* () {
            xterm = new xterm_1.Terminal({
                cols: COLS,
                rows: ROWS
            });
            // Fill initial viewport
            for (let i = 0; i < ROWS - 1; i++) {
                yield writePromise(xterm, `${i}\n`);
            }
            commandTracker = new commandTrackerAddon_1.CommandTrackerAddon();
            xterm.loadAddon(commandTracker);
        }));
        suite('Command tracking', () => {
            test('should track commands when the prompt is of sufficient size', () => __awaiter(void 0, void 0, void 0, function* () {
                assert.equal(xterm.markers.length, 0);
                yield writePromise(xterm, '\x1b[3G'); // Move cursor to column 3
                xterm._core._onKey.fire({ key: '\x0d' });
                assert.equal(xterm.markers.length, 1);
            }));
            test('should not track commands when the prompt is too small', () => __awaiter(void 0, void 0, void 0, function* () {
                assert.equal(xterm.markers.length, 0);
                yield writePromise(xterm, '\x1b[2G'); // Move cursor to column 2
                xterm._core._onKey.fire({ key: '\x0d' });
                assert.equal(xterm.markers.length, 0);
            }));
        });
        suite('Commands', () => {
            test('should scroll to the next and previous commands', () => __awaiter(void 0, void 0, void 0, function* () {
                yield writePromise(xterm, '\x1b[3G'); // Move cursor to column 3
                xterm._core._onKey.fire({ key: '\x0d' }); // Mark line #10
                assert.equal(xterm.markers[0].line, 9);
                for (let i = 0; i < 20; i++) {
                    yield writePromise(xterm, `\r\n`);
                }
                assert.equal(xterm.buffer.baseY, 20);
                assert.equal(xterm.buffer.viewportY, 20);
                // Scroll to marker
                commandTracker.scrollToPreviousCommand();
                assert.equal(xterm.buffer.viewportY, 9);
                // Scroll to top boundary
                commandTracker.scrollToPreviousCommand();
                assert.equal(xterm.buffer.viewportY, 0);
                // Scroll to marker
                commandTracker.scrollToNextCommand();
                assert.equal(xterm.buffer.viewportY, 9);
                // Scroll to bottom boundary
                commandTracker.scrollToNextCommand();
                assert.equal(xterm.buffer.viewportY, 20);
            }));
            test('should select to the next and previous commands', () => __awaiter(void 0, void 0, void 0, function* () {
                window.matchMedia = () => {
                    return { addListener: () => { } };
                };
                const e = document.createElement('div');
                document.body.appendChild(e);
                xterm.open(e);
                yield writePromise(xterm, '\r0');
                yield writePromise(xterm, '\n\r1');
                yield writePromise(xterm, '\x1b[3G'); // Move cursor to column 3
                xterm._core._onKey.fire({ key: '\x0d' }); // Mark line
                assert.equal(xterm.markers[0].line, 10);
                yield writePromise(xterm, '\n\r2');
                yield writePromise(xterm, '\x1b[3G'); // Move cursor to column 3
                xterm._core._onKey.fire({ key: '\x0d' }); // Mark line
                assert.equal(xterm.markers[1].line, 11);
                yield writePromise(xterm, '\n\r3');
                assert.equal(xterm.buffer.baseY, 3);
                assert.equal(xterm.buffer.viewportY, 3);
                assert.equal(xterm.getSelection(), '');
                commandTracker.selectToPreviousCommand();
                assert.equal(xterm.getSelection(), '2');
                commandTracker.selectToPreviousCommand();
                assert.equal(xterm.getSelection(), platform_1.isWindows ? '1\r\n2' : '1\n2');
                commandTracker.selectToNextCommand();
                assert.equal(xterm.getSelection(), '2');
                commandTracker.selectToNextCommand();
                assert.equal(xterm.getSelection(), platform_1.isWindows ? '\r\n' : '\n');
                document.body.removeChild(e);
            }));
            test('should select to the next and previous lines & commands', () => __awaiter(void 0, void 0, void 0, function* () {
                window.matchMedia = () => {
                    return { addListener: () => { } };
                };
                const e = document.createElement('div');
                document.body.appendChild(e);
                xterm.open(e);
                yield writePromise(xterm, '\r0');
                yield writePromise(xterm, '\n\r1');
                yield writePromise(xterm, '\x1b[3G'); // Move cursor to column 3
                xterm._core._onKey.fire({ key: '\x0d' }); // Mark line
                assert.equal(xterm.markers[0].line, 10);
                yield writePromise(xterm, '\n\r2');
                yield writePromise(xterm, '\x1b[3G'); // Move cursor to column 3
                xterm._core._onKey.fire({ key: '\x0d' }); // Mark line
                assert.equal(xterm.markers[1].line, 11);
                yield writePromise(xterm, '\n\r3');
                assert.equal(xterm.buffer.baseY, 3);
                assert.equal(xterm.buffer.viewportY, 3);
                assert.equal(xterm.getSelection(), '');
                commandTracker.selectToPreviousLine();
                assert.equal(xterm.getSelection(), '2');
                commandTracker.selectToNextLine();
                commandTracker.selectToNextLine();
                assert.equal(xterm.getSelection(), '3');
                commandTracker.selectToPreviousCommand();
                commandTracker.selectToPreviousCommand();
                commandTracker.selectToNextLine();
                assert.equal(xterm.getSelection(), '2');
                commandTracker.selectToPreviousCommand();
                assert.equal(xterm.getSelection(), platform_1.isWindows ? '1\r\n2' : '1\n2');
                commandTracker.selectToPreviousLine();
                assert.equal(xterm.getSelection(), platform_1.isWindows ? '0\r\n1\r\n2' : '0\n1\n2');
                document.body.removeChild(e);
            }));
        });
    });
});
//# sourceMappingURL=terminalCommandTracker.test.js.map