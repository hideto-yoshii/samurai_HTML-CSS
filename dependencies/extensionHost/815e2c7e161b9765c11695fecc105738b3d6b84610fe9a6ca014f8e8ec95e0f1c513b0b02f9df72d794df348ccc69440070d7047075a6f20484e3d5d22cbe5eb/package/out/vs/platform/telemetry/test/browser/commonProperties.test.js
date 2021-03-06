var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "assert", "vs/platform/telemetry/browser/workbenchCommonProperties", "vs/platform/storage/common/storage"], function (require, exports, assert, workbenchCommonProperties_1, storage_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('Browser Telemetry - common properties', function () {
        const commit = (undefined);
        const version = (undefined);
        let testStorageService;
        setup(() => {
            testStorageService = new storage_1.InMemoryStorageService();
        });
        test('mixes in additional properties', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const resolveCommonTelemetryProperties = () => {
                    return {
                        'userId': '1'
                    };
                };
                const props = yield workbenchCommonProperties_1.resolveWorkbenchCommonProperties(testStorageService, commit, version, undefined, resolveCommonTelemetryProperties);
                assert.ok('commitHash' in props);
                assert.ok('sessionID' in props);
                assert.ok('timestamp' in props);
                assert.ok('common.platform' in props);
                assert.ok('common.timesincesessionstart' in props);
                assert.ok('common.sequence' in props);
                assert.ok('version' in props);
                assert.ok('common.firstSessionDate' in props, 'firstSessionDate');
                assert.ok('common.lastSessionDate' in props, 'lastSessionDate');
                assert.ok('common.isNewSession' in props, 'isNewSession');
                assert.ok('common.machineId' in props, 'machineId');
                assert.equal(props['userId'], '1');
            });
        });
        test('mixes in additional dyanmic properties', function () {
            return __awaiter(this, void 0, void 0, function* () {
                let i = 1;
                const resolveCommonTelemetryProperties = () => {
                    return Object.defineProperties({}, {
                        'userId': {
                            get: () => {
                                return i++;
                            },
                            enumerable: true
                        }
                    });
                };
                const props = yield workbenchCommonProperties_1.resolveWorkbenchCommonProperties(testStorageService, commit, version, undefined, resolveCommonTelemetryProperties);
                assert.equal(props['userId'], '1');
                const props2 = yield workbenchCommonProperties_1.resolveWorkbenchCommonProperties(testStorageService, commit, version, undefined, resolveCommonTelemetryProperties);
                assert.equal(props2['userId'], '2');
            });
        });
    });
});
//# sourceMappingURL=commonProperties.test.js.map