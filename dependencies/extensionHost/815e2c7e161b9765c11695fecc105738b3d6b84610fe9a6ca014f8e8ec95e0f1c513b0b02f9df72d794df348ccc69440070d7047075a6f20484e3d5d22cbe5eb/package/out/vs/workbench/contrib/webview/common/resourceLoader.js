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
define(["require", "exports", "vs/base/common/path", "vs/base/common/strings", "vs/base/common/uri", "vs/platform/remote/common/remoteHosts", "vs/workbench/contrib/webview/common/mimeTypes"], function (require, exports, path_1, strings_1, uri_1, remoteHosts_1, mimeTypes_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.WebviewResourceScheme = 'vscode-resource';
    class Success {
        constructor(data, mimeType) {
            this.data = data;
            this.mimeType = mimeType;
            this.type = 'success';
        }
    }
    const Failed = new class {
        constructor() {
            this.type = 'failed';
        }
    };
    const AccessDenied = new class {
        constructor() {
            this.type = 'access-denied';
        }
    };
    function resolveContent(fileService, resource, mime) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const contents = yield fileService.readFile(resource);
                return new Success(contents.value, mime);
            }
            catch (err) {
                console.log(err);
                return Failed;
            }
        });
    }
    function loadLocalResource(requestUri, fileService, extensionLocation, getRoots) {
        return __awaiter(this, void 0, void 0, function* () {
            const normalizedPath = normalizeRequestPath(requestUri);
            for (const root of getRoots()) {
                if (!containsResource(root, normalizedPath)) {
                    continue;
                }
                if (extensionLocation && extensionLocation.scheme === remoteHosts_1.REMOTE_HOST_SCHEME) {
                    const redirectedUri = uri_1.URI.from({
                        scheme: remoteHosts_1.REMOTE_HOST_SCHEME,
                        authority: extensionLocation.authority,
                        path: '/vscode-resource',
                        query: JSON.stringify({
                            requestResourcePath: normalizedPath.path
                        })
                    });
                    return resolveContent(fileService, redirectedUri, mimeTypes_1.getWebviewContentMimeType(requestUri));
                }
                else {
                    return resolveContent(fileService, normalizedPath, mimeTypes_1.getWebviewContentMimeType(normalizedPath));
                }
            }
            return AccessDenied;
        });
    }
    exports.loadLocalResource = loadLocalResource;
    function normalizeRequestPath(requestUri) {
        if (requestUri.scheme !== exports.WebviewResourceScheme) {
            return requestUri;
        }
        // Modern vscode-resources uris put the scheme of the requested resource as the authority
        if (requestUri.authority) {
            return uri_1.URI.parse(requestUri.authority + ':' + requestUri.path);
        }
        // Old style vscode-resource uris lose the scheme of the resource which means they are unable to
        // load a mix of local and remote content properly.
        return requestUri.with({ scheme: 'file' });
    }
    function containsResource(root, resource) {
        const rootPath = root.fsPath + (strings_1.endsWith(root.fsPath, path_1.sep) ? '' : path_1.sep);
        return strings_1.startsWith(resource.fsPath, rootPath);
    }
});
//# sourceMappingURL=resourceLoader.js.map