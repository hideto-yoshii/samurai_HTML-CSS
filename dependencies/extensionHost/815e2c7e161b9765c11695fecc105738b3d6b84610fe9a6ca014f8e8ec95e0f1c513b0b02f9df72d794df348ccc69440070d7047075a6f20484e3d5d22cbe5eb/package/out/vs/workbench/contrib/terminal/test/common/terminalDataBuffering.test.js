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
define(["require", "exports", "assert", "vs/base/common/event", "vs/workbench/contrib/terminal/common/terminalDataBuffering"], function (require, exports, assert, event_1, terminalDataBuffering_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    suite('Workbench - TerminalDataBufferer', () => {
        let bufferer;
        setup(() => __awaiter(void 0, void 0, void 0, function* () {
            bufferer = new terminalDataBuffering_1.TerminalDataBufferer();
        }));
        test('start', () => __awaiter(void 0, void 0, void 0, function* () {
            let terminalOnData = new event_1.Emitter();
            let counter = 0;
            let data;
            bufferer.startBuffering(1, terminalOnData.event, (id, e) => {
                counter++;
                data = e;
            }, 0);
            terminalOnData.fire('1');
            terminalOnData.fire('2');
            terminalOnData.fire('3');
            yield wait(0);
            terminalOnData.fire('4');
            assert.equal(counter, 1);
            assert.equal(data, '123');
            yield wait(0);
            assert.equal(counter, 2);
            assert.equal(data, '4');
        }));
        test('start 2', () => __awaiter(void 0, void 0, void 0, function* () {
            let terminal1OnData = new event_1.Emitter();
            let terminal1Counter = 0;
            let terminal1Data;
            bufferer.startBuffering(1, terminal1OnData.event, (id, e) => {
                terminal1Counter++;
                terminal1Data = e;
            }, 0);
            let terminal2OnData = new event_1.Emitter();
            let terminal2Counter = 0;
            let terminal2Data;
            bufferer.startBuffering(2, terminal2OnData.event, (id, e) => {
                terminal2Counter++;
                terminal2Data = e;
            }, 0);
            terminal1OnData.fire('1');
            terminal2OnData.fire('4');
            terminal1OnData.fire('2');
            terminal2OnData.fire('5');
            terminal1OnData.fire('3');
            terminal2OnData.fire('6');
            terminal2OnData.fire('7');
            assert.equal(terminal1Counter, 0);
            assert.equal(terminal1Data, undefined);
            assert.equal(terminal2Counter, 0);
            assert.equal(terminal2Data, undefined);
            yield wait(0);
            assert.equal(terminal1Counter, 1);
            assert.equal(terminal1Data, '123');
            assert.equal(terminal2Counter, 1);
            assert.equal(terminal2Data, '4567');
        }));
        test('stop', () => __awaiter(void 0, void 0, void 0, function* () {
            let terminalOnData = new event_1.Emitter();
            let counter = 0;
            let data;
            bufferer.startBuffering(1, terminalOnData.event, (id, e) => {
                counter++;
                data = e;
            }, 0);
            terminalOnData.fire('1');
            terminalOnData.fire('2');
            terminalOnData.fire('3');
            bufferer.stopBuffering(1);
            yield wait(0);
            assert.equal(counter, 0);
            assert.equal(data, undefined);
        }));
        test('start 2 stop 1', () => __awaiter(void 0, void 0, void 0, function* () {
            let terminal1OnData = new event_1.Emitter();
            let terminal1Counter = 0;
            let terminal1Data;
            bufferer.startBuffering(1, terminal1OnData.event, (id, e) => {
                terminal1Counter++;
                terminal1Data = e;
            }, 0);
            let terminal2OnData = new event_1.Emitter();
            let terminal2Counter = 0;
            let terminal2Data;
            bufferer.startBuffering(2, terminal2OnData.event, (id, e) => {
                terminal2Counter++;
                terminal2Data = e;
            }, 0);
            terminal1OnData.fire('1');
            terminal2OnData.fire('4');
            terminal1OnData.fire('2');
            terminal2OnData.fire('5');
            terminal1OnData.fire('3');
            terminal2OnData.fire('6');
            terminal2OnData.fire('7');
            assert.equal(terminal1Counter, 0);
            assert.equal(terminal1Data, undefined);
            assert.equal(terminal2Counter, 0);
            assert.equal(terminal2Data, undefined);
            bufferer.stopBuffering(1);
            yield wait(0);
            assert.equal(terminal1Counter, 0);
            assert.equal(terminal1Data, undefined);
            assert.equal(terminal2Counter, 1);
            assert.equal(terminal2Data, '4567');
        }));
        test('dispose', () => __awaiter(void 0, void 0, void 0, function* () {
            let terminal1OnData = new event_1.Emitter();
            let terminal1Counter = 0;
            let terminal1Data;
            bufferer.startBuffering(1, terminal1OnData.event, (id, e) => {
                terminal1Counter++;
                terminal1Data = e;
            }, 0);
            let terminal2OnData = new event_1.Emitter();
            let terminal2Counter = 0;
            let terminal2Data;
            bufferer.startBuffering(2, terminal2OnData.event, (id, e) => {
                terminal2Counter++;
                terminal2Data = e;
            }, 0);
            terminal1OnData.fire('1');
            terminal2OnData.fire('4');
            terminal1OnData.fire('2');
            terminal2OnData.fire('5');
            terminal1OnData.fire('3');
            terminal2OnData.fire('6');
            terminal2OnData.fire('7');
            assert.equal(terminal1Counter, 0);
            assert.equal(terminal1Data, undefined);
            assert.equal(terminal2Counter, 0);
            assert.equal(terminal2Data, undefined);
            bufferer.dispose();
            yield wait(0);
            assert.equal(terminal1Counter, 0);
            assert.equal(terminal1Data, undefined);
            assert.equal(terminal2Counter, 0);
            assert.equal(terminal2Data, undefined);
        }));
    });
});
//# sourceMappingURL=terminalDataBuffering.test.js.map