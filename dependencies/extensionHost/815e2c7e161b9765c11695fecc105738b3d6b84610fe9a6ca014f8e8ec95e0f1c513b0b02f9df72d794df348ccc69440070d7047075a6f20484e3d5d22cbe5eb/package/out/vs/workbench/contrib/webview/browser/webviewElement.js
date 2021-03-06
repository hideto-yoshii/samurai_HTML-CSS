/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "vs/base/browser/dom", "vs/base/common/platform", "vs/base/common/uri", "vs/platform/configuration/common/configuration", "vs/platform/files/common/files", "vs/platform/remote/common/tunnel", "vs/workbench/contrib/webview/common/portMapping", "vs/workbench/contrib/webview/common/resourceLoader", "vs/workbench/services/environment/common/environmentService", "vs/workbench/contrib/webview/browser/baseWebviewElement", "vs/platform/telemetry/common/telemetry", "vs/platform/environment/common/environment"], function (require, exports, dom_1, platform_1, uri_1, configuration_1, files_1, tunnel_1, portMapping_1, resourceLoader_1, environmentService_1, baseWebviewElement_1, telemetry_1, environment_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let IFrameWebview = class IFrameWebview extends baseWebviewElement_1.BaseWebview {
        constructor(id, options, contentOptions, webviewThemeDataProvider, tunnelService, fileService, _configurationService, telemetryService, environementService, workbenchEnvironmentService) {
            super(id, options, contentOptions, webviewThemeDataProvider, telemetryService, environementService, workbenchEnvironmentService);
            this.fileService = fileService;
            this._configurationService = _configurationService;
            if (!this.useExternalEndpoint && (!workbenchEnvironmentService.options || typeof workbenchEnvironmentService.webviewExternalEndpoint !== 'string')) {
                throw new Error('To use iframe based webviews, you must configure `environmentService.webviewExternalEndpoint`');
            }
            this._portMappingManager = this._register(new portMapping_1.WebviewPortMappingManager(() => this.extension ? this.extension.location : undefined, () => this.content.options.portMapping || [], tunnelService));
            this._register(this.on("load-resource" /* loadResource */, (entry) => {
                const rawPath = entry.path;
                const normalizedPath = decodeURIComponent(rawPath);
                const uri = uri_1.URI.parse(normalizedPath.replace(/^\/(\w+)\/(.+)$/, (_, scheme, path) => scheme + ':/' + path));
                this.loadResource(rawPath, uri);
            }));
            this._register(this.on("load-localhost" /* loadLocalhost */, (entry) => {
                this.localLocalhost(entry.origin);
            }));
        }
        createElement(options) {
            const element = document.createElement('iframe');
            element.className = `webview ${options.customClasses || ''}`;
            element.sandbox.add('allow-scripts', 'allow-same-origin');
            element.setAttribute('src', `${this.externalEndpoint}/index.html?id=${this.id}`);
            element.style.border = 'none';
            element.style.width = '100%';
            element.style.height = '100%';
            return element;
        }
        get externalEndpoint() {
            const endpoint = this.workbenchEnvironmentService.webviewExternalEndpoint.replace('{{uuid}}', this.id);
            if (endpoint[endpoint.length - 1] === '/') {
                return endpoint.slice(0, endpoint.length - 1);
            }
            return endpoint;
        }
        get useExternalEndpoint() {
            return platform_1.isWeb || this._configurationService.getValue('webview.experimental.useExternalEndpoint');
        }
        mountTo(parent) {
            if (this.element) {
                parent.appendChild(this.element);
            }
        }
        set html(value) {
            super.html = this.preprocessHtml(value);
        }
        preprocessHtml(value) {
            return value
                .replace(/(["'])vscode-resource:(\/\/([^\s\/'"]+?)(?=\/))?([^\s'"]+?)(["'])/gi, (match, startQuote, _1, scheme, path, endQuote) => {
                if (scheme) {
                    return `${startQuote}${this.externalEndpoint}/vscode-resource/${scheme}${path}${endQuote}`;
                }
                return `${startQuote}${this.externalEndpoint}/vscode-resource/file${path}${endQuote}`;
            });
        }
        get extraContentOptions() {
            return {
                endpoint: this.externalEndpoint,
            };
        }
        focus() {
            if (this.element) {
                this._send('focus');
            }
        }
        showFind() {
            throw new Error('Method not implemented.');
        }
        hideFind() {
            throw new Error('Method not implemented.');
        }
        runFindAction(previous) {
            throw new Error('Method not implemented.');
        }
        loadResource(requestPath, uri) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const result = yield resourceLoader_1.loadLocalResource(uri, this.fileService, this.extension ? this.extension.location : undefined, () => (this.content.options.localResourceRoots || []));
                    if (result.type === 'success') {
                        return this._send('did-load-resource', {
                            status: 200,
                            path: requestPath,
                            mime: result.mimeType,
                            data: result.data.buffer
                        });
                    }
                }
                catch (_a) {
                    // noop
                }
                return this._send('did-load-resource', {
                    status: 404,
                    path: requestPath
                });
            });
        }
        localLocalhost(origin) {
            return __awaiter(this, void 0, void 0, function* () {
                const redirect = yield this._portMappingManager.getRedirect(origin);
                return this._send('did-load-localhost', {
                    origin,
                    location: redirect
                });
            });
        }
        postMessage(channel, data) {
            if (this.element) {
                this.element.contentWindow.postMessage({ channel, args: data }, '*');
            }
        }
        on(channel, handler) {
            return dom_1.addDisposableListener(window, 'message', e => {
                if (!e || !e.data || e.data.target !== this.id) {
                    return;
                }
                if (e.data.channel === channel) {
                    handler(e.data.data);
                }
            });
        }
    };
    IFrameWebview = __decorate([
        __param(4, tunnel_1.ITunnelService),
        __param(5, files_1.IFileService),
        __param(6, configuration_1.IConfigurationService),
        __param(7, telemetry_1.ITelemetryService),
        __param(8, environment_1.IEnvironmentService),
        __param(9, environmentService_1.IWorkbenchEnvironmentService)
    ], IFrameWebview);
    exports.IFrameWebview = IFrameWebview;
});
//# sourceMappingURL=webviewElement.js.map