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
define(["require", "exports", "vs/base/common/network", "vs/base/common/severity", "vs/base/common/strings", "vs/base/common/uri", "vs/nls", "vs/platform/dialogs/common/dialogs", "vs/platform/opener/common/opener", "vs/platform/product/common/productService", "vs/platform/quickinput/common/quickInput", "vs/platform/storage/common/storage", "vs/workbench/contrib/url/common/trustedDomains", "vs/workbench/services/editor/common/editorService"], function (require, exports, network_1, severity_1, strings_1, uri_1, nls_1, dialogs_1, opener_1, productService_1, quickInput_1, storage_1, trustedDomains_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let OpenerValidatorContributions = class OpenerValidatorContributions {
        constructor(_openerService, _storageService, _dialogService, _productService, _quickInputService, _editorService) {
            this._openerService = _openerService;
            this._storageService = _storageService;
            this._dialogService = _dialogService;
            this._productService = _productService;
            this._quickInputService = _quickInputService;
            this._editorService = _editorService;
            this._openerService.registerValidator({ shouldOpen: r => this.validateLink(r) });
        }
        validateLink(resource) {
            return __awaiter(this, void 0, void 0, function* () {
                const { scheme, authority } = resource;
                if (!strings_1.equalsIgnoreCase(scheme, network_1.Schemas.http) && !strings_1.equalsIgnoreCase(scheme, network_1.Schemas.https)) {
                    return true;
                }
                const domainToOpen = `${scheme}://${authority}`;
                const { defaultTrustedDomains, trustedDomains } = trustedDomains_1.readTrustedDomains(this._storageService, this._productService);
                const allTrustedDomains = [...defaultTrustedDomains, ...trustedDomains];
                if (isURLDomainTrusted(resource, allTrustedDomains)) {
                    return true;
                }
                else {
                    const { choice } = yield this._dialogService.show(severity_1.default.Info, nls_1.localize('openExternalLinkAt', 'Do you want {0} to open the external website?\n{1}', this._productService.nameShort, resource.toString(true)), [
                        nls_1.localize('openLink', 'Open Link'),
                        nls_1.localize('cancel', 'Cancel'),
                        nls_1.localize('configureTrustedDomains', 'Configure Trusted Domains')
                    ], {
                        cancelId: 1
                    });
                    // Open Link
                    if (choice === 0) {
                        return true;
                    }
                    // Configure Trusted Domains
                    else if (choice === 2) {
                        const pickedDomains = yield trustedDomains_1.configureOpenerTrustedDomainsHandler(trustedDomains, domainToOpen, this._quickInputService, this._storageService, this._editorService);
                        // Trust all domains
                        if (pickedDomains.indexOf('*') !== -1) {
                            return true;
                        }
                        // Trust current domain
                        if (isURLDomainTrusted(resource, pickedDomains)) {
                            return true;
                        }
                        return false;
                    }
                    return false;
                }
            });
        }
    };
    OpenerValidatorContributions = __decorate([
        __param(0, opener_1.IOpenerService),
        __param(1, storage_1.IStorageService),
        __param(2, dialogs_1.IDialogService),
        __param(3, productService_1.IProductService),
        __param(4, quickInput_1.IQuickInputService),
        __param(5, editorService_1.IEditorService)
    ], OpenerValidatorContributions);
    exports.OpenerValidatorContributions = OpenerValidatorContributions;
    const rLocalhost = /^localhost(:\d+)?$/i;
    const r127 = /^127.0.0.1(:\d+)?$/;
    function isLocalhostAuthority(authority) {
        return rLocalhost.test(authority) || r127.test(authority);
    }
    /**
     * Check whether a domain like https://www.microsoft.com matches
     * the list of trusted domains.
     *
     * - Schemes must match
     * - There's no subdomain matching. For example https://microsoft.com doesn't match https://www.microsoft.com
     * - Star matches all subdomains. For example https://*.microsoft.com matches https://www.microsoft.com and https://foo.bar.microsoft.com
     */
    function isURLDomainTrusted(url, trustedDomains) {
        if (isLocalhostAuthority(url.authority)) {
            return true;
        }
        const domain = `${url.scheme}://${url.authority}`;
        for (let i = 0; i < trustedDomains.length; i++) {
            if (trustedDomains[i] === '*') {
                return true;
            }
            if (trustedDomains[i] === domain) {
                return true;
            }
            let parsedTrustedDomain;
            if (/^https?:\/\//.test(trustedDomains[i])) {
                parsedTrustedDomain = uri_1.URI.parse(trustedDomains[i]);
                if (url.scheme !== parsedTrustedDomain.scheme) {
                    continue;
                }
            }
            else {
                parsedTrustedDomain = uri_1.URI.parse('https://' + trustedDomains[i]);
            }
            if (url.authority === parsedTrustedDomain.authority) {
                return true;
            }
            if (trustedDomains[i].indexOf('*') !== -1) {
                let reversedAuthoritySegments = url.authority.split('.').reverse();
                const reversedTrustedDomainAuthoritySegments = parsedTrustedDomain.authority.split('.').reverse();
                if (reversedTrustedDomainAuthoritySegments.length < reversedAuthoritySegments.length &&
                    reversedTrustedDomainAuthoritySegments[reversedTrustedDomainAuthoritySegments.length - 1] === '*') {
                    reversedAuthoritySegments = reversedAuthoritySegments.slice(0, reversedTrustedDomainAuthoritySegments.length);
                }
                if (reversedAuthoritySegments.every((val, i) => {
                    return reversedTrustedDomainAuthoritySegments[i] === '*' || val === reversedTrustedDomainAuthoritySegments[i];
                })) {
                    return true;
                }
            }
        }
        return false;
    }
    exports.isURLDomainTrusted = isURLDomainTrusted;
});
//# sourceMappingURL=trustedDomainsValidator.js.map