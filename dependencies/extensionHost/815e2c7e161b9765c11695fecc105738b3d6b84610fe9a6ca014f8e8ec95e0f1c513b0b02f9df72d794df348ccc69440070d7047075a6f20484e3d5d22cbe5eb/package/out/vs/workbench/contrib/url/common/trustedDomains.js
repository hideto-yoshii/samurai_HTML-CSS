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
define(["require", "exports", "vs/base/common/uri", "vs/nls", "vs/workbench/services/editor/common/editorService"], function (require, exports, uri_1, nls_1, editorService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    const TRUSTED_DOMAINS_URI = uri_1.URI.parse('trustedDomains:/Trusted Domains');
    exports.manageTrustedDomainSettingsCommand = {
        id: 'workbench.action.manageTrustedDomain',
        description: {
            description: nls_1.localize('trustedDomain.manageTrustedDomain', 'Manage Trusted Domains'),
            args: []
        },
        handler: (accessor) => __awaiter(void 0, void 0, void 0, function* () {
            const editorService = accessor.get(editorService_1.IEditorService);
            editorService.openEditor({ resource: TRUSTED_DOMAINS_URI, mode: 'jsonc' });
            return;
        })
    };
    function configureOpenerTrustedDomainsHandler(trustedDomains, domainToConfigure, quickInputService, storageService, editorService) {
        return __awaiter(this, void 0, void 0, function* () {
            const parsedDomainToConfigure = uri_1.URI.parse(domainToConfigure);
            const toplevelDomainSegements = parsedDomainToConfigure.authority.split('.');
            const domainEnd = toplevelDomainSegements.slice(toplevelDomainSegements.length - 2).join('.');
            const topLevelDomain = '*.' + domainEnd;
            const trustDomainAndOpenLinkItem = {
                type: 'item',
                label: nls_1.localize('trustedDomain.trustDomain', 'Trust {0}', domainToConfigure),
                id: domainToConfigure,
                picked: true
            };
            const trustSubDomainAndOpenLinkItem = {
                type: 'item',
                label: nls_1.localize('trustedDomain.trustSubDomain', 'Trust {0} and all its subdomains', domainEnd),
                id: topLevelDomain
            };
            const openAllLinksItem = {
                type: 'item',
                label: nls_1.localize('trustedDomain.trustAllDomains', 'Trust all domains (disables link protection)'),
                id: '*'
            };
            const manageTrustedDomainItem = {
                type: 'item',
                label: nls_1.localize('trustedDomain.manageTrustedDomains', 'Manage Trusted Domains'),
                id: 'manage'
            };
            const pickedResult = yield quickInputService.pick([trustDomainAndOpenLinkItem, trustSubDomainAndOpenLinkItem, openAllLinksItem, manageTrustedDomainItem], {
                activeItem: trustDomainAndOpenLinkItem
            });
            if (pickedResult) {
                if (pickedResult.id === 'manage') {
                    editorService.openEditor({
                        resource: TRUSTED_DOMAINS_URI,
                        mode: 'jsonc'
                    });
                    return trustedDomains;
                }
                if (pickedResult.id && trustedDomains.indexOf(pickedResult.id) === -1) {
                    storageService.remove('http.linkProtectionTrustedDomainsContent', 0 /* GLOBAL */);
                    storageService.store('http.linkProtectionTrustedDomains', JSON.stringify([...trustedDomains, pickedResult.id]), 0 /* GLOBAL */);
                    return [...trustedDomains, pickedResult.id];
                }
            }
            return [];
        });
    }
    exports.configureOpenerTrustedDomainsHandler = configureOpenerTrustedDomainsHandler;
    function readTrustedDomains(storageService, productService) {
        const defaultTrustedDomains = productService.linkProtectionTrustedDomains
            ? [...productService.linkProtectionTrustedDomains]
            : [];
        let trustedDomains = [];
        try {
            const trustedDomainsSrc = storageService.get('http.linkProtectionTrustedDomains', 0 /* GLOBAL */);
            if (trustedDomainsSrc) {
                trustedDomains = JSON.parse(trustedDomainsSrc);
            }
        }
        catch (err) { }
        return {
            defaultTrustedDomains,
            trustedDomains
        };
    }
    exports.readTrustedDomains = readTrustedDomains;
});
//# sourceMappingURL=trustedDomains.js.map