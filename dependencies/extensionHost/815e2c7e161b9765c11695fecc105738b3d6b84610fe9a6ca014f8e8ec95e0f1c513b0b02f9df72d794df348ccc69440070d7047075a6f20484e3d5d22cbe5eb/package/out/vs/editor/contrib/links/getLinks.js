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
define(["require", "exports", "vs/base/common/cancellation", "vs/base/common/errors", "vs/base/common/uri", "vs/editor/common/core/range", "vs/editor/common/modes", "vs/editor/common/services/modelService", "vs/platform/commands/common/commands", "vs/base/common/lifecycle", "vs/base/common/arrays"], function (require, exports, cancellation_1, errors_1, uri_1, range_1, modes_1, modelService_1, commands_1, lifecycle_1, arrays_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class Link {
        constructor(link, provider) {
            this._link = link;
            this._provider = provider;
        }
        toJSON() {
            return {
                range: this.range,
                url: this.url,
                tooltip: this.tooltip
            };
        }
        get range() {
            return this._link.range;
        }
        get url() {
            return this._link.url;
        }
        get tooltip() {
            return this._link.tooltip;
        }
        resolve(token) {
            if (this._link.url) {
                try {
                    if (typeof this._link.url === 'string') {
                        return Promise.resolve(uri_1.URI.parse(this._link.url));
                    }
                    else {
                        return Promise.resolve(this._link.url);
                    }
                }
                catch (e) {
                    return Promise.reject(new Error('invalid'));
                }
            }
            if (typeof this._provider.resolveLink === 'function') {
                return Promise.resolve(this._provider.resolveLink(this._link, token)).then(value => {
                    this._link = value || this._link;
                    if (this._link.url) {
                        // recurse
                        return this.resolve(token);
                    }
                    return Promise.reject(new Error('missing'));
                });
            }
            return Promise.reject(new Error('missing'));
        }
    }
    exports.Link = Link;
    class LinksList extends lifecycle_1.Disposable {
        constructor(tuples) {
            super();
            let links = [];
            for (const [list, provider] of tuples) {
                // merge all links
                const newLinks = list.links.map(link => new Link(link, provider));
                links = LinksList._union(links, newLinks);
                // register disposables
                if (lifecycle_1.isDisposable(provider)) {
                    this._register(provider);
                }
            }
            this.links = links;
        }
        static _union(oldLinks, newLinks) {
            // reunite oldLinks with newLinks and remove duplicates
            let result = [];
            let oldIndex;
            let oldLen;
            let newIndex;
            let newLen;
            for (oldIndex = 0, newIndex = 0, oldLen = oldLinks.length, newLen = newLinks.length; oldIndex < oldLen && newIndex < newLen;) {
                const oldLink = oldLinks[oldIndex];
                const newLink = newLinks[newIndex];
                if (range_1.Range.areIntersectingOrTouching(oldLink.range, newLink.range)) {
                    // Remove the oldLink
                    oldIndex++;
                    continue;
                }
                const comparisonResult = range_1.Range.compareRangesUsingStarts(oldLink.range, newLink.range);
                if (comparisonResult < 0) {
                    // oldLink is before
                    result.push(oldLink);
                    oldIndex++;
                }
                else {
                    // newLink is before
                    result.push(newLink);
                    newIndex++;
                }
            }
            for (; oldIndex < oldLen; oldIndex++) {
                result.push(oldLinks[oldIndex]);
            }
            for (; newIndex < newLen; newIndex++) {
                result.push(newLinks[newIndex]);
            }
            return result;
        }
    }
    exports.LinksList = LinksList;
    function getLinks(model, token) {
        const lists = [];
        // ask all providers for links in parallel
        const promises = modes_1.LinkProviderRegistry.ordered(model).reverse().map((provider, i) => {
            return Promise.resolve(provider.provideLinks(model, token)).then(result => {
                if (result) {
                    lists[i] = [result, provider];
                }
            }, errors_1.onUnexpectedExternalError);
        });
        return Promise.all(promises).then(() => {
            const result = new LinksList(arrays_1.coalesce(lists));
            if (!token.isCancellationRequested) {
                return result;
            }
            result.dispose();
            return new LinksList([]);
        });
    }
    exports.getLinks = getLinks;
    commands_1.CommandsRegistry.registerCommand('_executeLinkProvider', (accessor, ...args) => __awaiter(void 0, void 0, void 0, function* () {
        const [uri] = args;
        if (!(uri instanceof uri_1.URI)) {
            return [];
        }
        const model = accessor.get(modelService_1.IModelService).getModel(uri);
        if (!model) {
            return [];
        }
        const list = yield getLinks(model, cancellation_1.CancellationToken.None);
        if (!list) {
            return [];
        }
        const result = list.links.slice(0);
        list.dispose();
        return result;
    }));
});
//# sourceMappingURL=getLinks.js.map