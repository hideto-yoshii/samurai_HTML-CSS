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
define(["require", "exports", "assert", "vs/base/browser/ui/tree/asyncDataTree", "vs/base/browser/dom", "vs/base/common/async"], function (require, exports, assert, asyncDataTree_1, dom_1, async_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    function find(elements, id) {
        while (elements) {
            for (const element of elements) {
                if (element.id === id) {
                    return element;
                }
            }
        }
        throw new Error('element not found');
    }
    class Renderer {
        constructor() {
            this.templateId = 'default';
        }
        renderTemplate(container) {
            return container;
        }
        renderElement(element, index, templateData) {
            templateData.textContent = element.element.id;
        }
        disposeTemplate(templateData) {
            // noop
        }
    }
    class IdentityProvider {
        getId(element) {
            return element.id;
        }
    }
    class VirtualDelegate {
        getHeight() { return 20; }
        getTemplateId(element) { return 'default'; }
    }
    class DataSource {
        hasChildren(element) {
            return !!element.children && element.children.length > 0;
        }
        getChildren(element) {
            return Promise.resolve(element.children || []);
        }
    }
    class Model {
        constructor(root) {
            this.root = root;
        }
        get(id) {
            return find(this.root.children, id);
        }
    }
    suite('AsyncDataTree', function () {
        test('Collapse state should be preserved across refresh calls', () => __awaiter(this, void 0, void 0, function* () {
            const container = document.createElement('div');
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a'
                    }]
            });
            const tree = new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], new DataSource(), { identityProvider: new IdentityProvider() });
            tree.layout(200);
            assert.equal(container.querySelectorAll('.monaco-list-row').length, 0);
            yield tree.setInput(model.root);
            assert.equal(container.querySelectorAll('.monaco-list-row').length, 1);
            let twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(!dom_1.hasClass(twistie, 'collapsible'));
            assert(!dom_1.hasClass(twistie, 'collapsed'));
            model.get('a').children = [
                { id: 'aa' },
                { id: 'ab' },
                { id: 'ac' }
            ];
            yield tree.updateChildren(model.root);
            assert.equal(container.querySelectorAll('.monaco-list-row').length, 1);
            yield tree.expand(model.get('a'));
            assert.equal(container.querySelectorAll('.monaco-list-row').length, 4);
            model.get('a').children = [];
            yield tree.updateChildren(model.root);
            assert.equal(container.querySelectorAll('.monaco-list-row').length, 1);
        }));
        test('issue #68648', () => __awaiter(this, void 0, void 0, function* () {
            const container = document.createElement('div');
            const getChildrenCalls = [];
            const dataSource = new class {
                hasChildren(element) {
                    return !!element.children && element.children.length > 0;
                }
                getChildren(element) {
                    getChildrenCalls.push(element.id);
                    return Promise.resolve(element.children || []);
                }
            };
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a'
                    }]
            });
            const tree = new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], dataSource, { identityProvider: new IdentityProvider() });
            tree.layout(200);
            yield tree.setInput(model.root);
            assert.deepStrictEqual(getChildrenCalls, ['root']);
            let twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(!dom_1.hasClass(twistie, 'collapsible'));
            assert(!dom_1.hasClass(twistie, 'collapsed'));
            assert(tree.getNode().children[0].collapsed);
            model.get('a').children = [{ id: 'aa' }, { id: 'ab' }, { id: 'ac' }];
            yield tree.updateChildren(model.root);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'root']);
            twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(dom_1.hasClass(twistie, 'collapsible'));
            assert(dom_1.hasClass(twistie, 'collapsed'));
            assert(tree.getNode().children[0].collapsed);
            model.get('a').children = [];
            yield tree.updateChildren(model.root);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'root', 'root']);
            twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(!dom_1.hasClass(twistie, 'collapsible'));
            assert(!dom_1.hasClass(twistie, 'collapsed'));
            assert(tree.getNode().children[0].collapsed);
            model.get('a').children = [{ id: 'aa' }, { id: 'ab' }, { id: 'ac' }];
            yield tree.updateChildren(model.root);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'root', 'root', 'root']);
            twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(dom_1.hasClass(twistie, 'collapsible'));
            assert(dom_1.hasClass(twistie, 'collapsed'));
            assert(tree.getNode().children[0].collapsed);
        }));
        test('issue #67722 - once resolved, refreshed collapsed nodes should only get children when expanded', () => __awaiter(this, void 0, void 0, function* () {
            const container = document.createElement('div');
            const getChildrenCalls = [];
            const dataSource = new class {
                hasChildren(element) {
                    return !!element.children && element.children.length > 0;
                }
                getChildren(element) {
                    getChildrenCalls.push(element.id);
                    return Promise.resolve(element.children || []);
                }
            };
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{ id: 'aa' }, { id: 'ab' }, { id: 'ac' }]
                    }]
            });
            const tree = new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], dataSource, { identityProvider: new IdentityProvider() });
            tree.layout(200);
            yield tree.setInput(model.root);
            assert(tree.getNode(model.get('a')).collapsed);
            assert.deepStrictEqual(getChildrenCalls, ['root']);
            yield tree.expand(model.get('a'));
            assert(!tree.getNode(model.get('a')).collapsed);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'a']);
            tree.collapse(model.get('a'));
            assert(tree.getNode(model.get('a')).collapsed);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'a']);
            yield tree.updateChildren();
            assert(tree.getNode(model.get('a')).collapsed);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'a', 'root'], 'a should not be refreshed, since it\' collapsed');
        }));
        test('resolved collapsed nodes which lose children should lose twistie as well', () => __awaiter(this, void 0, void 0, function* () {
            const container = document.createElement('div');
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{ id: 'aa' }, { id: 'ab' }, { id: 'ac' }]
                    }]
            });
            const tree = new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], new DataSource(), { identityProvider: new IdentityProvider() });
            tree.layout(200);
            yield tree.setInput(model.root);
            yield tree.expand(model.get('a'));
            let twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(dom_1.hasClass(twistie, 'collapsible'));
            assert(!dom_1.hasClass(twistie, 'collapsed'));
            assert(!tree.getNode(model.get('a')).collapsed);
            tree.collapse(model.get('a'));
            model.get('a').children = [];
            yield tree.updateChildren(model.root);
            twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(!dom_1.hasClass(twistie, 'collapsible'));
            assert(!dom_1.hasClass(twistie, 'collapsed'));
            assert(tree.getNode(model.get('a')).collapsed);
        }));
        test('support default collapse state per element', () => __awaiter(this, void 0, void 0, function* () {
            const container = document.createElement('div');
            const getChildrenCalls = [];
            const dataSource = new class {
                hasChildren(element) {
                    return !!element.children && element.children.length > 0;
                }
                getChildren(element) {
                    getChildrenCalls.push(element.id);
                    return Promise.resolve(element.children || []);
                }
            };
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{ id: 'aa' }, { id: 'ab' }, { id: 'ac' }]
                    }]
            });
            const tree = new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], dataSource, {
                collapseByDefault: el => el.id !== 'a'
            });
            tree.layout(200);
            yield tree.setInput(model.root);
            assert(!tree.getNode(model.get('a')).collapsed);
            assert.deepStrictEqual(getChildrenCalls, ['root', 'a']);
        }));
        test('issue #80098 - concurrent refresh and expand', () => __awaiter(this, void 0, void 0, function* () {
            const container = document.createElement('div');
            const calls = [];
            const dataSource = new class {
                hasChildren(element) {
                    return !!element.children && element.children.length > 0;
                }
                getChildren(element) {
                    return new Promise(c => calls.push(() => c(element.children)));
                }
            };
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{
                                id: 'aa'
                            }]
                    }]
            });
            const tree = new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], dataSource, { identityProvider: new IdentityProvider() });
            tree.layout(200);
            const pSetInput = tree.setInput(model.root);
            calls.pop()(); // resolve getChildren(root)
            yield pSetInput;
            const pUpdateChildrenA = tree.updateChildren(model.get('a'));
            const pExpandA = tree.expand(model.get('a'));
            assert.equal(calls.length, 1, 'expand(a) still hasn\'t called getChildren(a)');
            calls.pop()();
            assert.equal(calls.length, 0, 'no pending getChildren calls');
            yield pUpdateChildrenA;
            assert.equal(calls.length, 0, 'expand(a) should not have forced a second refresh');
            const result = yield pExpandA;
            assert.equal(result, true, 'expand(a) should be done');
        }));
        test('issue #80098 - first expand should call getChildren', () => __awaiter(this, void 0, void 0, function* () {
            const container = document.createElement('div');
            const calls = [];
            const dataSource = new class {
                hasChildren(element) {
                    return !!element.children && element.children.length > 0;
                }
                getChildren(element) {
                    return new Promise(c => calls.push(() => c(element.children)));
                }
            };
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a', children: [{
                                id: 'aa'
                            }]
                    }]
            });
            const tree = new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], dataSource, { identityProvider: new IdentityProvider() });
            tree.layout(200);
            const pSetInput = tree.setInput(model.root);
            calls.pop()(); // resolve getChildren(root)
            yield pSetInput;
            const pExpandA = tree.expand(model.get('a'));
            assert.equal(calls.length, 1, 'expand(a) should\'ve called getChildren(a)');
            let race = yield Promise.race([pExpandA.then(() => 'expand'), async_1.timeout(1).then(() => 'timeout')]);
            assert.equal(race, 'timeout', 'expand(a) should not be yet done');
            calls.pop()();
            assert.equal(calls.length, 0, 'no pending getChildren calls');
            race = yield Promise.race([pExpandA.then(() => 'expand'), async_1.timeout(1).then(() => 'timeout')]);
            assert.equal(race, 'expand', 'expand(a) should now be done');
        }));
        test('issue #78388 - tree should react to hasChildren toggles', () => __awaiter(this, void 0, void 0, function* () {
            const container = document.createElement('div');
            const model = new Model({
                id: 'root',
                children: [{
                        id: 'a'
                    }]
            });
            const tree = new asyncDataTree_1.AsyncDataTree('test', container, new VirtualDelegate(), [new Renderer()], new DataSource(), { identityProvider: new IdentityProvider() });
            tree.layout(200);
            yield tree.setInput(model.root);
            assert.equal(container.querySelectorAll('.monaco-list-row').length, 1);
            let twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(!dom_1.hasClass(twistie, 'collapsible'));
            assert(!dom_1.hasClass(twistie, 'collapsed'));
            model.get('a').children = [{ id: 'aa' }];
            yield tree.updateChildren(model.get('a'), false);
            assert.equal(container.querySelectorAll('.monaco-list-row').length, 1);
            twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(dom_1.hasClass(twistie, 'collapsible'));
            assert(dom_1.hasClass(twistie, 'collapsed'));
            model.get('a').children = [];
            yield tree.updateChildren(model.get('a'), false);
            assert.equal(container.querySelectorAll('.monaco-list-row').length, 1);
            twistie = container.querySelector('.monaco-list-row:first-child .monaco-tl-twistie');
            assert(!dom_1.hasClass(twistie, 'collapsible'));
            assert(!dom_1.hasClass(twistie, 'collapsed'));
        }));
    });
});
//# sourceMappingURL=asyncDataTree.test.js.map