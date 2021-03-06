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
define(["require", "exports", "assert", "vs/workbench/api/browser/mainThreadCommands", "vs/platform/commands/common/commands", "./testRPCProtocol", "vs/workbench/test/electron-browser/api/mock"], function (require, exports, assert, mainThreadCommands_1, commands_1, testRPCProtocol_1, mock_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('MainThreadCommands', function () {
        test('dispose on unregister', function () {
            const commands = new mainThreadCommands_1.MainThreadCommands(testRPCProtocol_1.SingleProxyRPCProtocol(null), undefined, new class extends mock_1.mock() {
            });
            assert.equal(commands_1.CommandsRegistry.getCommand('foo'), undefined);
            // register
            commands.$registerCommand('foo');
            assert.ok(commands_1.CommandsRegistry.getCommand('foo'));
            // unregister
            commands.$unregisterCommand('foo');
            assert.equal(commands_1.CommandsRegistry.getCommand('foo'), undefined);
        });
        test('unregister all on dispose', function () {
            const commands = new mainThreadCommands_1.MainThreadCommands(testRPCProtocol_1.SingleProxyRPCProtocol(null), undefined, new class extends mock_1.mock() {
            });
            assert.equal(commands_1.CommandsRegistry.getCommand('foo'), undefined);
            commands.$registerCommand('foo');
            commands.$registerCommand('bar');
            assert.ok(commands_1.CommandsRegistry.getCommand('foo'));
            assert.ok(commands_1.CommandsRegistry.getCommand('bar'));
            commands.dispose();
            assert.equal(commands_1.CommandsRegistry.getCommand('foo'), undefined);
            assert.equal(commands_1.CommandsRegistry.getCommand('bar'), undefined);
        });
        test('activate and throw when needed', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const activations = [];
                const runs = [];
                const commands = new mainThreadCommands_1.MainThreadCommands(testRPCProtocol_1.SingleProxyRPCProtocol(null), new class extends mock_1.mock() {
                    executeCommand(id) {
                        runs.push(id);
                        return Promise.resolve(undefined);
                    }
                }, new class extends mock_1.mock() {
                    activateByEvent(id) {
                        activations.push(id);
                        return Promise.resolve();
                    }
                });
                // case 1: arguments and retry
                try {
                    activations.length = 0;
                    yield commands.$executeCommand('bazz', [1, 2, { n: 3 }], true);
                    assert.ok(false);
                }
                catch (e) {
                    assert.deepEqual(activations, ['onCommand:bazz']);
                    assert.equal(e.message, '$executeCommand:retry');
                }
                // case 2: no arguments and retry
                runs.length = 0;
                yield commands.$executeCommand('bazz', [], true);
                assert.deepEqual(runs, ['bazz']);
                // case 3: arguments and no retry
                runs.length = 0;
                yield commands.$executeCommand('bazz', [1, 2, true], false);
                assert.deepEqual(runs, ['bazz']);
            });
        });
    });
});
//# sourceMappingURL=mainThreadCommands.test.js.map