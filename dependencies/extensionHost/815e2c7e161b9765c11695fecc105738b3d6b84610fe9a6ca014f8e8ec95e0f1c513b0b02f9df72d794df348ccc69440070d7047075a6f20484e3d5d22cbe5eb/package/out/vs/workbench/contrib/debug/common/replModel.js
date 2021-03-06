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
define(["require", "exports", "vs/nls", "vs/base/common/severity", "vs/workbench/contrib/debug/common/debugModel", "vs/base/common/types", "vs/base/common/resources", "vs/base/common/strings", "vs/base/common/uuid", "vs/base/common/event"], function (require, exports, nls, severity_1, debugModel_1, types_1, resources_1, strings_1, uuid_1, event_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const MAX_REPL_LENGTH = 10000;
    let topReplElementCounter = 0;
    class SimpleReplElement {
        constructor(session, id, value, severity, sourceData) {
            this.session = session;
            this.id = id;
            this.value = value;
            this.severity = severity;
            this.sourceData = sourceData;
        }
        toString() {
            return this.value;
        }
        getId() {
            return this.id;
        }
    }
    exports.SimpleReplElement = SimpleReplElement;
    class RawObjectReplElement {
        constructor(id, name, valueObj, sourceData, annotation) {
            this.id = id;
            this.name = name;
            this.valueObj = valueObj;
            this.sourceData = sourceData;
            this.annotation = annotation;
        }
        getId() {
            return this.id;
        }
        get value() {
            if (this.valueObj === null) {
                return 'null';
            }
            else if (Array.isArray(this.valueObj)) {
                return `Array[${this.valueObj.length}]`;
            }
            else if (types_1.isObject(this.valueObj)) {
                return 'Object';
            }
            else if (types_1.isString(this.valueObj)) {
                return `"${this.valueObj}"`;
            }
            return String(this.valueObj) || '';
        }
        get hasChildren() {
            return (Array.isArray(this.valueObj) && this.valueObj.length > 0) || (types_1.isObject(this.valueObj) && Object.getOwnPropertyNames(this.valueObj).length > 0);
        }
        getChildren() {
            let result = [];
            if (Array.isArray(this.valueObj)) {
                result = this.valueObj.slice(0, RawObjectReplElement.MAX_CHILDREN)
                    .map((v, index) => new RawObjectReplElement(`${this.id}:${index}`, String(index), v));
            }
            else if (types_1.isObject(this.valueObj)) {
                result = Object.getOwnPropertyNames(this.valueObj).slice(0, RawObjectReplElement.MAX_CHILDREN)
                    .map((key, index) => new RawObjectReplElement(`${this.id}:${index}`, key, this.valueObj[key]));
            }
            return Promise.resolve(result);
        }
        toString() {
            return `${this.name}\n${this.value}`;
        }
    }
    exports.RawObjectReplElement = RawObjectReplElement;
    RawObjectReplElement.MAX_CHILDREN = 1000; // upper bound of children per value
    class ReplEvaluationInput {
        constructor(value) {
            this.value = value;
            this.id = uuid_1.generateUuid();
        }
        toString() {
            return this.value;
        }
        getId() {
            return this.id;
        }
    }
    exports.ReplEvaluationInput = ReplEvaluationInput;
    class ReplEvaluationResult extends debugModel_1.ExpressionContainer {
        constructor() {
            super(undefined, undefined, 0, uuid_1.generateUuid());
        }
        toString() {
            return `${this.value}`;
        }
    }
    exports.ReplEvaluationResult = ReplEvaluationResult;
    class ReplModel {
        constructor() {
            this.replElements = [];
            this._onDidChangeElements = new event_1.Emitter();
            this.onDidChangeElements = this._onDidChangeElements.event;
        }
        getReplElements() {
            return this.replElements;
        }
        addReplExpression(session, stackFrame, name) {
            return __awaiter(this, void 0, void 0, function* () {
                this.addReplElement(new ReplEvaluationInput(name));
                const result = new ReplEvaluationResult();
                yield result.evaluateExpression(name, session, stackFrame, 'repl');
                this.addReplElement(result);
            });
        }
        appendToRepl(session, data, sev, source) {
            const clearAnsiSequence = '\u001b[2J';
            if (typeof data === 'string' && data.indexOf(clearAnsiSequence) >= 0) {
                // [2J is the ansi escape sequence for clearing the display http://ascii-table.com/ansi-escape-sequences.php
                this.removeReplExpressions();
                this.appendToRepl(session, nls.localize('consoleCleared', "Console was cleared"), severity_1.default.Ignore);
                data = data.substr(data.lastIndexOf(clearAnsiSequence) + clearAnsiSequence.length);
            }
            if (typeof data === 'string') {
                const previousElement = this.replElements.length ? this.replElements[this.replElements.length - 1] : undefined;
                if (previousElement instanceof SimpleReplElement && previousElement.severity === sev && !strings_1.endsWith(previousElement.value, '\n') && !strings_1.endsWith(previousElement.value, '\r\n')) {
                    previousElement.value += data;
                }
                else {
                    const element = new SimpleReplElement(session, `topReplElement:${topReplElementCounter++}`, data, sev, source);
                    this.addReplElement(element);
                }
            }
            else {
                // TODO@Isidor hack, we should introduce a new type which is an output that can fetch children like an expression
                data.severity = sev;
                data.sourceData = source;
                this.addReplElement(data);
            }
        }
        addReplElement(newElement) {
            this.replElements.push(newElement);
            if (this.replElements.length > MAX_REPL_LENGTH) {
                this.replElements.splice(0, this.replElements.length - MAX_REPL_LENGTH);
            }
            this._onDidChangeElements.fire();
        }
        logToRepl(session, sev, args, frame) {
            let source;
            if (frame) {
                source = {
                    column: frame.column,
                    lineNumber: frame.line,
                    source: session.getSource({
                        name: resources_1.basenameOrAuthority(frame.uri),
                        path: frame.uri.fsPath
                    })
                };
            }
            // add output for each argument logged
            let simpleVals = [];
            for (let i = 0; i < args.length; i++) {
                let a = args[i];
                // undefined gets printed as 'undefined'
                if (typeof a === 'undefined') {
                    simpleVals.push('undefined');
                }
                // null gets printed as 'null'
                else if (a === null) {
                    simpleVals.push('null');
                }
                // objects & arrays are special because we want to inspect them in the REPL
                else if (types_1.isObject(a) || Array.isArray(a)) {
                    // flush any existing simple values logged
                    if (simpleVals.length) {
                        this.appendToRepl(session, simpleVals.join(' '), sev, source);
                        simpleVals = [];
                    }
                    // show object
                    this.appendToRepl(session, new RawObjectReplElement(`topReplElement:${topReplElementCounter++}`, a.prototype, a, undefined, nls.localize('snapshotObj', "Only primitive values are shown for this object.")), sev, source);
                }
                // string: watch out for % replacement directive
                // string substitution and formatting @ https://developer.chrome.com/devtools/docs/console
                else if (typeof a === 'string') {
                    let buf = '';
                    for (let j = 0, len = a.length; j < len; j++) {
                        if (a[j] === '%' && (a[j + 1] === 's' || a[j + 1] === 'i' || a[j + 1] === 'd' || a[j + 1] === 'O')) {
                            i++; // read over substitution
                            buf += !types_1.isUndefinedOrNull(args[i]) ? args[i] : ''; // replace
                            j++; // read over directive
                        }
                        else {
                            buf += a[j];
                        }
                    }
                    simpleVals.push(buf);
                }
                // number or boolean is joined together
                else {
                    simpleVals.push(a);
                }
            }
            // flush simple values
            // always append a new line for output coming from an extension such that separate logs go to separate lines #23695
            if (simpleVals.length) {
                this.appendToRepl(session, simpleVals.join(' ') + '\n', sev, source);
            }
        }
        removeReplExpressions() {
            if (this.replElements.length > 0) {
                this.replElements = [];
                this._onDidChangeElements.fire();
            }
        }
    }
    exports.ReplModel = ReplModel;
});
//# sourceMappingURL=replModel.js.map