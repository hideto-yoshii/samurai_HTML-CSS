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
define(["require", "exports", "vs/workbench/contrib/callHierarchy/browser/callHierarchy", "vs/base/common/cancellation", "vs/base/common/filters", "vs/base/browser/ui/iconLabel/iconLabel", "vs/editor/common/modes", "vs/base/browser/dom", "vs/base/common/strings", "vs/editor/common/core/range"], function (require, exports, callHierarchy_1, cancellation_1, filters_1, iconLabel_1, modes_1, dom, strings_1, range_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Call {
        constructor(item, locations, model, parent) {
            this.item = item;
            this.locations = locations;
            this.model = model;
            this.parent = parent;
        }
        static compare(a, b) {
            let res = strings_1.compare(a.item.uri.toString(), b.item.uri.toString());
            if (res === 0) {
                res = range_1.Range.compareRangesUsingStarts(a.item.range, b.item.range);
            }
            return res;
        }
    }
    exports.Call = Call;
    class DataSource {
        constructor(getDirection) {
            this.getDirection = getDirection;
        }
        hasChildren() {
            return true;
        }
        getChildren(element) {
            return __awaiter(this, void 0, void 0, function* () {
                if (element instanceof callHierarchy_1.CallHierarchyModel) {
                    return [new Call(element.root, [], element, undefined)];
                }
                const { model, item } = element;
                if (this.getDirection() === 2 /* CallsFrom */) {
                    return (yield model.resolveOutgoingCalls(item, cancellation_1.CancellationToken.None)).map(call => {
                        return new Call(call.to, call.fromRanges.map(range => ({ range, uri: item.uri })), model, element);
                    });
                }
                else {
                    return (yield model.resolveIncomingCalls(item, cancellation_1.CancellationToken.None)).map(call => {
                        return new Call(call.from, call.fromRanges.map(range => ({ range, uri: call.from.uri })), model, element);
                    });
                }
            });
        }
    }
    exports.DataSource = DataSource;
    class Sorter {
        compare(element, otherElement) {
            return Call.compare(element, otherElement);
        }
    }
    exports.Sorter = Sorter;
    class IdentityProvider {
        constructor(getDirection) {
            this.getDirection = getDirection;
        }
        getId(element) {
            let res = this.getDirection() + JSON.stringify(element.item.uri) + JSON.stringify(element.item.range);
            if (element.parent) {
                res += this.getId(element.parent);
            }
            return res;
        }
    }
    exports.IdentityProvider = IdentityProvider;
    class CallRenderingTemplate {
        constructor(icon, label) {
            this.icon = icon;
            this.label = label;
        }
    }
    class CallRenderer {
        constructor() {
            this.templateId = CallRenderer.id;
        }
        renderTemplate(container) {
            dom.addClass(container, 'callhierarchy-element');
            let icon = document.createElement('div');
            container.appendChild(icon);
            const label = new iconLabel_1.IconLabel(container, { supportHighlights: true });
            return new CallRenderingTemplate(icon, label);
        }
        renderElement(node, _index, template) {
            const { element, filterData } = node;
            template.icon.className = modes_1.SymbolKinds.toCssClassName(element.item.kind, true);
            template.label.setLabel(element.item.name, element.item.detail, { labelEscapeNewLines: true, matches: filters_1.createMatches(filterData) });
        }
        disposeTemplate(template) {
            template.label.dispose();
        }
    }
    exports.CallRenderer = CallRenderer;
    CallRenderer.id = 'CallRenderer';
    class VirtualDelegate {
        getHeight(_element) {
            return 22;
        }
        getTemplateId(_element) {
            return CallRenderer.id;
        }
    }
    exports.VirtualDelegate = VirtualDelegate;
});
//# sourceMappingURL=callHierarchyTree.js.map