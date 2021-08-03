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
define(["require", "exports", "vs/platform/instantiation/common/instantiation"], function (require, exports, instantiation_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ISharedProcessMainService = instantiation_1.createDecorator('sharedProcessMainService');
    class SharedProcessMainService {
        constructor(sharedProcess) {
            this.sharedProcess = sharedProcess;
        }
        whenSharedProcessReady() {
            return this.sharedProcess.whenReady();
        }
        toggleSharedProcessWindow() {
            return __awaiter(this, void 0, void 0, function* () {
                return this.sharedProcess.toggle();
            });
        }
    }
    exports.SharedProcessMainService = SharedProcessMainService;
});
//# sourceMappingURL=sharedProcessMainService.js.map