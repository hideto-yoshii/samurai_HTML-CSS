var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
define(["require", "exports", "assert", "vs/base/common/event", "vs/platform/telemetry/common/telemetryService", "vs/platform/telemetry/browser/errorTelemetry", "vs/platform/telemetry/common/telemetryUtils", "vs/base/common/errors", "sinon", "vs/platform/configuration/common/configuration"], function (require, exports, assert, event_1, telemetryService_1, errorTelemetry_1, telemetryUtils_1, Errors, sinon, configuration_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    class TestTelemetryAppender {
        constructor() {
            this.events = [];
            this.isDisposed = false;
        }
        log(eventName, data) {
            this.events.push({ eventName, data });
        }
        getEventsCount() {
            return this.events.length;
        }
        flush() {
            this.isDisposed = true;
            return Promise.resolve(null);
        }
    }
    class ErrorTestingSettings {
        constructor() {
            this.randomUserFile = 'a/path/that/doe_snt/con-tain/code/names.js';
            this.anonymizedRandomUserFile = '<REDACTED: user-file-path>';
            this.nodeModulePathToRetain = 'node_modules/path/that/shouldbe/retained/names.js:14:15854';
            this.nodeModuleAsarPathToRetain = 'node_modules.asar/path/that/shouldbe/retained/names.js:14:12354';
            this.personalInfo = 'DANGEROUS/PATH';
            this.importantInfo = 'important/information';
            this.filePrefix = 'file:///';
            this.dangerousPathWithImportantInfo = this.filePrefix + this.personalInfo + '/resources/app/' + this.importantInfo;
            this.dangerousPathWithoutImportantInfo = this.filePrefix + this.personalInfo;
            this.missingModelPrefix = 'Received model events for missing model ';
            this.missingModelMessage = this.missingModelPrefix + ' ' + this.dangerousPathWithoutImportantInfo;
            this.noSuchFilePrefix = 'ENOENT: no such file or directory';
            this.noSuchFileMessage = this.noSuchFilePrefix + ' \'' + this.personalInfo + '\'';
            this.stack = [`at e._modelEvents (${this.randomUserFile}:11:7309)`,
                `    at t.AllWorkers (${this.randomUserFile}:6:8844)`,
                `    at e.(anonymous function) [as _modelEvents] (${this.randomUserFile}:5:29552)`,
                `    at Function.<anonymous> (${this.randomUserFile}:6:8272)`,
                `    at e.dispatch (${this.randomUserFile}:5:26931)`,
                `    at e.request (/${this.nodeModuleAsarPathToRetain})`,
                `    at t._handleMessage (${this.nodeModuleAsarPathToRetain})`,
                `    at t._onmessage (/${this.nodeModulePathToRetain})`,
                `    at t.onmessage (${this.nodeModulePathToRetain})`,
                `    at DedicatedWorkerGlobalScope.self.onmessage`,
                this.dangerousPathWithImportantInfo,
                this.dangerousPathWithoutImportantInfo,
                this.missingModelMessage,
                this.noSuchFileMessage];
        }
    }
    suite('TelemetryService', () => {
        test('Disposing', sinon.test(function () {
            let testAppender = new TestTelemetryAppender();
            let service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
            return service.publicLog('testPrivateEvent').then(() => {
                assert.equal(testAppender.getEventsCount(), 1);
                service.dispose();
                assert.equal(!testAppender.isDisposed, true);
            });
        }));
        // event reporting
        test('Simple event', sinon.test(function () {
            let testAppender = new TestTelemetryAppender();
            let service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
            return service.publicLog('testEvent').then(_ => {
                assert.equal(testAppender.getEventsCount(), 1);
                assert.equal(testAppender.events[0].eventName, 'testEvent');
                assert.notEqual(testAppender.events[0].data, null);
                service.dispose();
            });
        }));
        test('Event with data', sinon.test(function () {
            let testAppender = new TestTelemetryAppender();
            let service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
            return service.publicLog('testEvent', {
                'stringProp': 'property',
                'numberProp': 1,
                'booleanProp': true,
                'complexProp': {
                    'value': 0
                }
            }).then(() => {
                assert.equal(testAppender.getEventsCount(), 1);
                assert.equal(testAppender.events[0].eventName, 'testEvent');
                assert.notEqual(testAppender.events[0].data, null);
                assert.equal(testAppender.events[0].data['stringProp'], 'property');
                assert.equal(testAppender.events[0].data['numberProp'], 1);
                assert.equal(testAppender.events[0].data['booleanProp'], true);
                assert.equal(testAppender.events[0].data['complexProp'].value, 0);
                service.dispose();
            });
        }));
        test('common properties added to *all* events, simple event', function () {
            let testAppender = new TestTelemetryAppender();
            let service = new telemetryService_1.TelemetryService({
                appender: testAppender,
                commonProperties: Promise.resolve({ foo: 'JA!', get bar() { return Math.random(); } })
            }, undefined);
            return service.publicLog('testEvent').then(_ => {
                let [first] = testAppender.events;
                assert.equal(Object.keys(first.data).length, 2);
                assert.equal(typeof first.data['foo'], 'string');
                assert.equal(typeof first.data['bar'], 'number');
                service.dispose();
            });
        });
        test('common properties added to *all* events, event with data', function () {
            let testAppender = new TestTelemetryAppender();
            let service = new telemetryService_1.TelemetryService({
                appender: testAppender,
                commonProperties: Promise.resolve({ foo: 'JA!', get bar() { return Math.random(); } })
            }, undefined);
            return service.publicLog('testEvent', { hightower: 'xl', price: 8000 }).then(_ => {
                let [first] = testAppender.events;
                assert.equal(Object.keys(first.data).length, 4);
                assert.equal(typeof first.data['foo'], 'string');
                assert.equal(typeof first.data['bar'], 'number');
                assert.equal(typeof first.data['hightower'], 'string');
                assert.equal(typeof first.data['price'], 'number');
                service.dispose();
            });
        });
        test('TelemetryInfo comes from properties', function () {
            let service = new telemetryService_1.TelemetryService({
                appender: telemetryUtils_1.NullAppender,
                commonProperties: Promise.resolve({
                    sessionID: 'one',
                    ['common.instanceId']: 'two',
                    ['common.machineId']: 'three',
                })
            }, undefined);
            return service.getTelemetryInfo().then(info => {
                assert.equal(info.sessionId, 'one');
                assert.equal(info.instanceId, 'two');
                assert.equal(info.machineId, 'three');
                service.dispose();
            });
        });
        test('enableTelemetry on by default', sinon.test(function () {
            let testAppender = new TestTelemetryAppender();
            let service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
            return service.publicLog('testEvent').then(() => {
                assert.equal(testAppender.getEventsCount(), 1);
                assert.equal(testAppender.events[0].eventName, 'testEvent');
                service.dispose();
            });
        }));
        class JoinableTelemetryService extends telemetryService_1.TelemetryService {
            constructor() {
                super(...arguments);
                this.promises = [];
            }
            join() {
                return Promise.all(this.promises);
            }
            publicLog(eventName, data, anonymizeFilePaths) {
                let p = super.publicLog(eventName, data, anonymizeFilePaths);
                this.promises.push(p);
                return p;
            }
        }
        test('Error events', sinon.test(function () {
            return __awaiter(this, void 0, void 0, function* () {
                let origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
                Errors.setUnexpectedErrorHandler(() => { });
                try {
                    let testAppender = new TestTelemetryAppender();
                    let service = new JoinableTelemetryService({ appender: testAppender }, undefined);
                    const errorTelemetry = new errorTelemetry_1.default(service);
                    let e = new Error('This is a test.');
                    // for Phantom
                    if (!e.stack) {
                        e.stack = 'blah';
                    }
                    Errors.onUnexpectedError(e);
                    this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                    yield service.join();
                    assert.equal(testAppender.getEventsCount(), 1);
                    assert.equal(testAppender.events[0].eventName, 'UnhandledError');
                    assert.equal(testAppender.events[0].data.msg, 'This is a test.');
                    errorTelemetry.dispose();
                    service.dispose();
                }
                finally {
                    Errors.setUnexpectedErrorHandler(origErrorHandler);
                }
            });
        }));
        // 	test('Unhandled Promise Error events', sinon.test(function() {
        //
        // 		let origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
        // 		Errors.setUnexpectedErrorHandler(() => {});
        //
        // 		try {
        // 			let service = new MainTelemetryService();
        // 			let testAppender = new TestTelemetryAppender();
        // 			service.addTelemetryAppender(testAppender);
        //
        // 			winjs.Promise.wrapError(new Error('This should not get logged'));
        // 			winjs.TPromise.as(true).then(() => {
        // 				throw new Error('This should get logged');
        // 			});
        // 			// prevent console output from failing the test
        // 			this.stub(console, 'log');
        // 			// allow for the promise to finish
        // 			this.clock.tick(MainErrorTelemetry.ERROR_FLUSH_TIMEOUT);
        //
        // 			assert.equal(testAppender.getEventsCount(), 1);
        // 			assert.equal(testAppender.events[0].eventName, 'UnhandledError');
        // 			assert.equal(testAppender.events[0].data.msg,  'This should get logged');
        //
        // 			service.dispose();
        // 		} finally {
        // 			Errors.setUnexpectedErrorHandler(origErrorHandler);
        // 		}
        // 	}));
        test('Handle global errors', sinon.test(function () {
            return __awaiter(this, void 0, void 0, function* () {
                let errorStub = sinon.stub();
                window.onerror = errorStub;
                let testAppender = new TestTelemetryAppender();
                let service = new JoinableTelemetryService({ appender: testAppender }, undefined);
                const errorTelemetry = new errorTelemetry_1.default(service);
                let testError = new Error('test');
                window.onerror('Error Message', 'file.js', 2, 42, testError);
                this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                yield service.join();
                assert.equal(errorStub.alwaysCalledWithExactly('Error Message', 'file.js', 2, 42, testError), true);
                assert.equal(errorStub.callCount, 1);
                assert.equal(testAppender.getEventsCount(), 1);
                assert.equal(testAppender.events[0].eventName, 'UnhandledError');
                assert.equal(testAppender.events[0].data.msg, 'Error Message');
                assert.equal(testAppender.events[0].data.file, 'file.js');
                assert.equal(testAppender.events[0].data.line, 2);
                assert.equal(testAppender.events[0].data.column, 42);
                assert.equal(testAppender.events[0].data.uncaught_error_msg, 'test');
                errorTelemetry.dispose();
                service.dispose();
            });
        }));
        test('Error Telemetry removes PII from filename with spaces', sinon.test(function () {
            return __awaiter(this, void 0, void 0, function* () {
                let errorStub = sinon.stub();
                window.onerror = errorStub;
                let settings = new ErrorTestingSettings();
                let testAppender = new TestTelemetryAppender();
                let service = new JoinableTelemetryService({ appender: testAppender }, undefined);
                const errorTelemetry = new errorTelemetry_1.default(service);
                let personInfoWithSpaces = settings.personalInfo.slice(0, 2) + ' ' + settings.personalInfo.slice(2);
                let dangerousFilenameError = new Error('dangerousFilename');
                dangerousFilenameError.stack = settings.stack;
                window.onerror('dangerousFilename', settings.dangerousPathWithImportantInfo.replace(settings.personalInfo, personInfoWithSpaces) + '/test.js', 2, 42, dangerousFilenameError);
                this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                yield service.join();
                assert.equal(errorStub.callCount, 1);
                assert.equal(testAppender.events[0].data.file.indexOf(settings.dangerousPathWithImportantInfo.replace(settings.personalInfo, personInfoWithSpaces)), -1);
                assert.equal(testAppender.events[0].data.file, settings.importantInfo + '/test.js');
                errorTelemetry.dispose();
                service.dispose();
            });
        }));
        test('Uncaught Error Telemetry removes PII from filename', sinon.test(function () {
            let clock = this.clock;
            let errorStub = sinon.stub();
            window.onerror = errorStub;
            let settings = new ErrorTestingSettings();
            let testAppender = new TestTelemetryAppender();
            let service = new JoinableTelemetryService({ appender: testAppender }, undefined);
            const errorTelemetry = new errorTelemetry_1.default(service);
            let dangerousFilenameError = new Error('dangerousFilename');
            dangerousFilenameError.stack = settings.stack;
            window.onerror('dangerousFilename', settings.dangerousPathWithImportantInfo + '/test.js', 2, 42, dangerousFilenameError);
            clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
            return service.join().then(() => {
                assert.equal(errorStub.callCount, 1);
                assert.equal(testAppender.events[0].data.file.indexOf(settings.dangerousPathWithImportantInfo), -1);
                dangerousFilenameError = new Error('dangerousFilename');
                dangerousFilenameError.stack = settings.stack;
                window.onerror('dangerousFilename', settings.dangerousPathWithImportantInfo + '/test.js', 2, 42, dangerousFilenameError);
                clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                return service.join();
            }).then(() => {
                assert.equal(errorStub.callCount, 2);
                assert.equal(testAppender.events[0].data.file.indexOf(settings.dangerousPathWithImportantInfo), -1);
                assert.equal(testAppender.events[0].data.file, settings.importantInfo + '/test.js');
                errorTelemetry.dispose();
                service.dispose();
            });
        }));
        test('Unexpected Error Telemetry removes PII', sinon.test(function () {
            return __awaiter(this, void 0, void 0, function* () {
                let origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
                Errors.setUnexpectedErrorHandler(() => { });
                try {
                    let settings = new ErrorTestingSettings();
                    let testAppender = new TestTelemetryAppender();
                    let service = new JoinableTelemetryService({ appender: testAppender }, undefined);
                    const errorTelemetry = new errorTelemetry_1.default(service);
                    let dangerousPathWithoutImportantInfoError = new Error(settings.dangerousPathWithoutImportantInfo);
                    dangerousPathWithoutImportantInfoError.stack = settings.stack;
                    Errors.onUnexpectedError(dangerousPathWithoutImportantInfoError);
                    this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                    yield service.join();
                    assert.equal(testAppender.events[0].data.msg.indexOf(settings.personalInfo), -1);
                    assert.equal(testAppender.events[0].data.msg.indexOf(settings.filePrefix), -1);
                    assert.equal(testAppender.events[0].data.callstack.indexOf(settings.personalInfo), -1);
                    assert.equal(testAppender.events[0].data.callstack.indexOf(settings.filePrefix), -1);
                    assert.notEqual(testAppender.events[0].data.callstack.indexOf(settings.stack[4].replace(settings.randomUserFile, settings.anonymizedRandomUserFile)), -1);
                    assert.equal(testAppender.events[0].data.callstack.split('\n').length, settings.stack.length);
                    errorTelemetry.dispose();
                    service.dispose();
                }
                finally {
                    Errors.setUnexpectedErrorHandler(origErrorHandler);
                }
            });
        }));
        test('Uncaught Error Telemetry removes PII', sinon.test(function () {
            return __awaiter(this, void 0, void 0, function* () {
                let errorStub = sinon.stub();
                window.onerror = errorStub;
                let settings = new ErrorTestingSettings();
                let testAppender = new TestTelemetryAppender();
                let service = new JoinableTelemetryService({ appender: testAppender }, undefined);
                const errorTelemetry = new errorTelemetry_1.default(service);
                let dangerousPathWithoutImportantInfoError = new Error('dangerousPathWithoutImportantInfo');
                dangerousPathWithoutImportantInfoError.stack = settings.stack;
                window.onerror(settings.dangerousPathWithoutImportantInfo, 'test.js', 2, 42, dangerousPathWithoutImportantInfoError);
                this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                yield service.join();
                assert.equal(errorStub.callCount, 1);
                // Test that no file information remains, esp. personal info
                assert.equal(testAppender.events[0].data.msg.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.msg.indexOf(settings.filePrefix), -1);
                assert.equal(testAppender.events[0].data.callstack.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.callstack.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.callstack.indexOf(settings.stack[4].replace(settings.randomUserFile, settings.anonymizedRandomUserFile)), -1);
                assert.equal(testAppender.events[0].data.callstack.split('\n').length, settings.stack.length);
                errorTelemetry.dispose();
                service.dispose();
            });
        }));
        test('Unexpected Error Telemetry removes PII but preserves Code file path', sinon.test(function () {
            return __awaiter(this, void 0, void 0, function* () {
                let origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
                Errors.setUnexpectedErrorHandler(() => { });
                try {
                    let settings = new ErrorTestingSettings();
                    let testAppender = new TestTelemetryAppender();
                    let service = new JoinableTelemetryService({ appender: testAppender }, undefined);
                    const errorTelemetry = new errorTelemetry_1.default(service);
                    let dangerousPathWithImportantInfoError = new Error(settings.dangerousPathWithImportantInfo);
                    dangerousPathWithImportantInfoError.stack = settings.stack;
                    // Test that important information remains but personal info does not
                    Errors.onUnexpectedError(dangerousPathWithImportantInfoError);
                    this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                    yield service.join();
                    assert.notEqual(testAppender.events[0].data.msg.indexOf(settings.importantInfo), -1);
                    assert.equal(testAppender.events[0].data.msg.indexOf(settings.personalInfo), -1);
                    assert.equal(testAppender.events[0].data.msg.indexOf(settings.filePrefix), -1);
                    assert.notEqual(testAppender.events[0].data.callstack.indexOf(settings.importantInfo), -1);
                    assert.equal(testAppender.events[0].data.callstack.indexOf(settings.personalInfo), -1);
                    assert.equal(testAppender.events[0].data.callstack.indexOf(settings.filePrefix), -1);
                    assert.notEqual(testAppender.events[0].data.callstack.indexOf(settings.stack[4].replace(settings.randomUserFile, settings.anonymizedRandomUserFile)), -1);
                    assert.equal(testAppender.events[0].data.callstack.split('\n').length, settings.stack.length);
                    errorTelemetry.dispose();
                    service.dispose();
                }
                finally {
                    Errors.setUnexpectedErrorHandler(origErrorHandler);
                }
            });
        }));
        test('Uncaught Error Telemetry removes PII but preserves Code file path', sinon.test(function () {
            return __awaiter(this, void 0, void 0, function* () {
                let errorStub = sinon.stub();
                window.onerror = errorStub;
                let settings = new ErrorTestingSettings();
                let testAppender = new TestTelemetryAppender();
                let service = new JoinableTelemetryService({ appender: testAppender }, undefined);
                const errorTelemetry = new errorTelemetry_1.default(service);
                let dangerousPathWithImportantInfoError = new Error('dangerousPathWithImportantInfo');
                dangerousPathWithImportantInfoError.stack = settings.stack;
                window.onerror(settings.dangerousPathWithImportantInfo, 'test.js', 2, 42, dangerousPathWithImportantInfoError);
                this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                yield service.join();
                assert.equal(errorStub.callCount, 1);
                // Test that important information remains but personal info does not
                assert.notEqual(testAppender.events[0].data.msg.indexOf(settings.importantInfo), -1);
                assert.equal(testAppender.events[0].data.msg.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.msg.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.callstack.indexOf(settings.importantInfo), -1);
                assert.equal(testAppender.events[0].data.callstack.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.callstack.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.callstack.indexOf(settings.stack[4].replace(settings.randomUserFile, settings.anonymizedRandomUserFile)), -1);
                assert.equal(testAppender.events[0].data.callstack.split('\n').length, settings.stack.length);
                errorTelemetry.dispose();
                service.dispose();
            });
        }));
        test('Unexpected Error Telemetry removes PII but preserves Code file path with node modules', sinon.test(function () {
            return __awaiter(this, void 0, void 0, function* () {
                let origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
                Errors.setUnexpectedErrorHandler(() => { });
                try {
                    let settings = new ErrorTestingSettings();
                    let testAppender = new TestTelemetryAppender();
                    let service = new JoinableTelemetryService({ appender: testAppender }, undefined);
                    const errorTelemetry = new errorTelemetry_1.default(service);
                    let dangerousPathWithImportantInfoError = new Error(settings.dangerousPathWithImportantInfo);
                    dangerousPathWithImportantInfoError.stack = settings.stack;
                    Errors.onUnexpectedError(dangerousPathWithImportantInfoError);
                    this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                    yield service.join();
                    assert.notEqual(testAppender.events[0].data.callstack.indexOf('(' + settings.nodeModuleAsarPathToRetain), -1);
                    assert.notEqual(testAppender.events[0].data.callstack.indexOf('(' + settings.nodeModulePathToRetain), -1);
                    assert.notEqual(testAppender.events[0].data.callstack.indexOf('(/' + settings.nodeModuleAsarPathToRetain), -1);
                    assert.notEqual(testAppender.events[0].data.callstack.indexOf('(/' + settings.nodeModulePathToRetain), -1);
                    errorTelemetry.dispose();
                    service.dispose();
                }
                finally {
                    Errors.setUnexpectedErrorHandler(origErrorHandler);
                }
            });
        }));
        test('Uncaught Error Telemetry removes PII but preserves Code file path', sinon.test(function () {
            return __awaiter(this, void 0, void 0, function* () {
                let errorStub = sinon.stub();
                window.onerror = errorStub;
                let settings = new ErrorTestingSettings();
                let testAppender = new TestTelemetryAppender();
                let service = new JoinableTelemetryService({ appender: testAppender }, undefined);
                const errorTelemetry = new errorTelemetry_1.default(service);
                let dangerousPathWithImportantInfoError = new Error('dangerousPathWithImportantInfo');
                dangerousPathWithImportantInfoError.stack = settings.stack;
                window.onerror(settings.dangerousPathWithImportantInfo, 'test.js', 2, 42, dangerousPathWithImportantInfoError);
                this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                yield service.join();
                assert.equal(errorStub.callCount, 1);
                assert.notEqual(testAppender.events[0].data.callstack.indexOf('(' + settings.nodeModuleAsarPathToRetain), -1);
                assert.notEqual(testAppender.events[0].data.callstack.indexOf('(' + settings.nodeModulePathToRetain), -1);
                assert.notEqual(testAppender.events[0].data.callstack.indexOf('(/' + settings.nodeModuleAsarPathToRetain), -1);
                assert.notEqual(testAppender.events[0].data.callstack.indexOf('(/' + settings.nodeModulePathToRetain), -1);
                errorTelemetry.dispose();
                service.dispose();
            });
        }));
        test('Unexpected Error Telemetry removes PII but preserves Code file path when PIIPath is configured', sinon.test(function () {
            return __awaiter(this, void 0, void 0, function* () {
                let origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
                Errors.setUnexpectedErrorHandler(() => { });
                try {
                    let settings = new ErrorTestingSettings();
                    let testAppender = new TestTelemetryAppender();
                    let service = new JoinableTelemetryService({ appender: testAppender, piiPaths: [settings.personalInfo + '/resources/app/'] }, undefined);
                    const errorTelemetry = new errorTelemetry_1.default(service);
                    let dangerousPathWithImportantInfoError = new Error(settings.dangerousPathWithImportantInfo);
                    dangerousPathWithImportantInfoError.stack = settings.stack;
                    // Test that important information remains but personal info does not
                    Errors.onUnexpectedError(dangerousPathWithImportantInfoError);
                    this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                    yield service.join();
                    assert.notEqual(testAppender.events[0].data.msg.indexOf(settings.importantInfo), -1);
                    assert.equal(testAppender.events[0].data.msg.indexOf(settings.personalInfo), -1);
                    assert.equal(testAppender.events[0].data.msg.indexOf(settings.filePrefix), -1);
                    assert.notEqual(testAppender.events[0].data.callstack.indexOf(settings.importantInfo), -1);
                    assert.equal(testAppender.events[0].data.callstack.indexOf(settings.personalInfo), -1);
                    assert.equal(testAppender.events[0].data.callstack.indexOf(settings.filePrefix), -1);
                    assert.notEqual(testAppender.events[0].data.callstack.indexOf(settings.stack[4].replace(settings.randomUserFile, settings.anonymizedRandomUserFile)), -1);
                    assert.equal(testAppender.events[0].data.callstack.split('\n').length, settings.stack.length);
                    errorTelemetry.dispose();
                    service.dispose();
                }
                finally {
                    Errors.setUnexpectedErrorHandler(origErrorHandler);
                }
            });
        }));
        test('Uncaught Error Telemetry removes PII but preserves Code file path when PIIPath is configured', sinon.test(function () {
            return __awaiter(this, void 0, void 0, function* () {
                let errorStub = sinon.stub();
                window.onerror = errorStub;
                let settings = new ErrorTestingSettings();
                let testAppender = new TestTelemetryAppender();
                let service = new JoinableTelemetryService({ appender: testAppender, piiPaths: [settings.personalInfo + '/resources/app/'] }, undefined);
                const errorTelemetry = new errorTelemetry_1.default(service);
                let dangerousPathWithImportantInfoError = new Error('dangerousPathWithImportantInfo');
                dangerousPathWithImportantInfoError.stack = settings.stack;
                window.onerror(settings.dangerousPathWithImportantInfo, 'test.js', 2, 42, dangerousPathWithImportantInfoError);
                this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                yield service.join();
                assert.equal(errorStub.callCount, 1);
                // Test that important information remains but personal info does not
                assert.notEqual(testAppender.events[0].data.msg.indexOf(settings.importantInfo), -1);
                assert.equal(testAppender.events[0].data.msg.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.msg.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.callstack.indexOf(settings.importantInfo), -1);
                assert.equal(testAppender.events[0].data.callstack.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.callstack.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.callstack.indexOf(settings.stack[4].replace(settings.randomUserFile, settings.anonymizedRandomUserFile)), -1);
                assert.equal(testAppender.events[0].data.callstack.split('\n').length, settings.stack.length);
                errorTelemetry.dispose();
                service.dispose();
            });
        }));
        test('Unexpected Error Telemetry removes PII but preserves Missing Model error message', sinon.test(function () {
            return __awaiter(this, void 0, void 0, function* () {
                let origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
                Errors.setUnexpectedErrorHandler(() => { });
                try {
                    let settings = new ErrorTestingSettings();
                    let testAppender = new TestTelemetryAppender();
                    let service = new JoinableTelemetryService({ appender: testAppender }, undefined);
                    const errorTelemetry = new errorTelemetry_1.default(service);
                    let missingModelError = new Error(settings.missingModelMessage);
                    missingModelError.stack = settings.stack;
                    // Test that no file information remains, but this particular
                    // error message does (Received model events for missing model)
                    Errors.onUnexpectedError(missingModelError);
                    this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                    yield service.join();
                    assert.notEqual(testAppender.events[0].data.msg.indexOf(settings.missingModelPrefix), -1);
                    assert.equal(testAppender.events[0].data.msg.indexOf(settings.personalInfo), -1);
                    assert.equal(testAppender.events[0].data.msg.indexOf(settings.filePrefix), -1);
                    assert.notEqual(testAppender.events[0].data.callstack.indexOf(settings.missingModelPrefix), -1);
                    assert.equal(testAppender.events[0].data.callstack.indexOf(settings.personalInfo), -1);
                    assert.equal(testAppender.events[0].data.callstack.indexOf(settings.filePrefix), -1);
                    assert.notEqual(testAppender.events[0].data.callstack.indexOf(settings.stack[4].replace(settings.randomUserFile, settings.anonymizedRandomUserFile)), -1);
                    assert.equal(testAppender.events[0].data.callstack.split('\n').length, settings.stack.length);
                    errorTelemetry.dispose();
                    service.dispose();
                }
                finally {
                    Errors.setUnexpectedErrorHandler(origErrorHandler);
                }
            });
        }));
        test('Uncaught Error Telemetry removes PII but preserves Missing Model error message', sinon.test(function () {
            return __awaiter(this, void 0, void 0, function* () {
                let errorStub = sinon.stub();
                window.onerror = errorStub;
                let settings = new ErrorTestingSettings();
                let testAppender = new TestTelemetryAppender();
                let service = new JoinableTelemetryService({ appender: testAppender }, undefined);
                const errorTelemetry = new errorTelemetry_1.default(service);
                let missingModelError = new Error('missingModelMessage');
                missingModelError.stack = settings.stack;
                window.onerror(settings.missingModelMessage, 'test.js', 2, 42, missingModelError);
                this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                yield service.join();
                assert.equal(errorStub.callCount, 1);
                // Test that no file information remains, but this particular
                // error message does (Received model events for missing model)
                assert.notEqual(testAppender.events[0].data.msg.indexOf(settings.missingModelPrefix), -1);
                assert.equal(testAppender.events[0].data.msg.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.msg.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.callstack.indexOf(settings.missingModelPrefix), -1);
                assert.equal(testAppender.events[0].data.callstack.indexOf(settings.personalInfo), -1);
                assert.equal(testAppender.events[0].data.callstack.indexOf(settings.filePrefix), -1);
                assert.notEqual(testAppender.events[0].data.callstack.indexOf(settings.stack[4].replace(settings.randomUserFile, settings.anonymizedRandomUserFile)), -1);
                assert.equal(testAppender.events[0].data.callstack.split('\n').length, settings.stack.length);
                errorTelemetry.dispose();
                service.dispose();
            });
        }));
        test('Unexpected Error Telemetry removes PII but preserves No Such File error message', sinon.test(function () {
            return __awaiter(this, void 0, void 0, function* () {
                let origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
                Errors.setUnexpectedErrorHandler(() => { });
                try {
                    let settings = new ErrorTestingSettings();
                    let testAppender = new TestTelemetryAppender();
                    let service = new JoinableTelemetryService({ appender: testAppender }, undefined);
                    const errorTelemetry = new errorTelemetry_1.default(service);
                    let noSuchFileError = new Error(settings.noSuchFileMessage);
                    noSuchFileError.stack = settings.stack;
                    // Test that no file information remains, but this particular
                    // error message does (ENOENT: no such file or directory)
                    Errors.onUnexpectedError(noSuchFileError);
                    this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                    yield service.join();
                    assert.notEqual(testAppender.events[0].data.msg.indexOf(settings.noSuchFilePrefix), -1);
                    assert.equal(testAppender.events[0].data.msg.indexOf(settings.personalInfo), -1);
                    assert.equal(testAppender.events[0].data.msg.indexOf(settings.filePrefix), -1);
                    assert.notEqual(testAppender.events[0].data.callstack.indexOf(settings.noSuchFilePrefix), -1);
                    assert.equal(testAppender.events[0].data.callstack.indexOf(settings.personalInfo), -1);
                    assert.equal(testAppender.events[0].data.callstack.indexOf(settings.filePrefix), -1);
                    assert.notEqual(testAppender.events[0].data.callstack.indexOf(settings.stack[4].replace(settings.randomUserFile, settings.anonymizedRandomUserFile)), -1);
                    assert.equal(testAppender.events[0].data.callstack.split('\n').length, settings.stack.length);
                    errorTelemetry.dispose();
                    service.dispose();
                }
                finally {
                    Errors.setUnexpectedErrorHandler(origErrorHandler);
                }
            });
        }));
        test('Uncaught Error Telemetry removes PII but preserves No Such File error message', sinon.test(function () {
            return __awaiter(this, void 0, void 0, function* () {
                let origErrorHandler = Errors.errorHandler.getUnexpectedErrorHandler();
                Errors.setUnexpectedErrorHandler(() => { });
                try {
                    let errorStub = sinon.stub();
                    window.onerror = errorStub;
                    let settings = new ErrorTestingSettings();
                    let testAppender = new TestTelemetryAppender();
                    let service = new JoinableTelemetryService({ appender: testAppender }, undefined);
                    const errorTelemetry = new errorTelemetry_1.default(service);
                    let noSuchFileError = new Error('noSuchFileMessage');
                    noSuchFileError.stack = settings.stack;
                    window.onerror(settings.noSuchFileMessage, 'test.js', 2, 42, noSuchFileError);
                    this.clock.tick(errorTelemetry_1.default.ERROR_FLUSH_TIMEOUT);
                    yield service.join();
                    assert.equal(errorStub.callCount, 1);
                    // Test that no file information remains, but this particular
                    // error message does (ENOENT: no such file or directory)
                    Errors.onUnexpectedError(noSuchFileError);
                    assert.notEqual(testAppender.events[0].data.msg.indexOf(settings.noSuchFilePrefix), -1);
                    assert.equal(testAppender.events[0].data.msg.indexOf(settings.personalInfo), -1);
                    assert.equal(testAppender.events[0].data.msg.indexOf(settings.filePrefix), -1);
                    assert.notEqual(testAppender.events[0].data.callstack.indexOf(settings.noSuchFilePrefix), -1);
                    assert.equal(testAppender.events[0].data.callstack.indexOf(settings.personalInfo), -1);
                    assert.equal(testAppender.events[0].data.callstack.indexOf(settings.filePrefix), -1);
                    assert.notEqual(testAppender.events[0].data.callstack.indexOf(settings.stack[4].replace(settings.randomUserFile, settings.anonymizedRandomUserFile)), -1);
                    assert.equal(testAppender.events[0].data.callstack.split('\n').length, settings.stack.length);
                    errorTelemetry.dispose();
                    service.dispose();
                }
                finally {
                    Errors.setUnexpectedErrorHandler(origErrorHandler);
                }
            });
        }));
        test('Telemetry Service sends events when enableTelemetry is on', sinon.test(function () {
            let testAppender = new TestTelemetryAppender();
            let service = new telemetryService_1.TelemetryService({ appender: testAppender }, undefined);
            return service.publicLog('testEvent').then(() => {
                assert.equal(testAppender.getEventsCount(), 1);
                service.dispose();
            });
        }));
        test('Telemetry Service checks with config service', function () {
            let enableTelemetry = false;
            let emitter = new event_1.Emitter();
            let testAppender = new TestTelemetryAppender();
            let service = new telemetryService_1.TelemetryService({
                appender: testAppender
            }, {
                _serviceBrand: undefined,
                getValue() {
                    return {
                        enableTelemetry: enableTelemetry
                    };
                },
                updateValue() {
                    return null;
                },
                inspect(key) {
                    return {
                        value: configuration_1.getConfigurationValue(this.getValue(), key),
                        default: configuration_1.getConfigurationValue(this.getValue(), key),
                        user: configuration_1.getConfigurationValue(this.getValue(), key),
                        workspace: null,
                        workspaceFolder: null
                    };
                },
                keys() { return { default: [], user: [], workspace: [], workspaceFolder: [] }; },
                onDidChangeConfiguration: emitter.event,
                reloadConfiguration() { return null; },
                getConfigurationData() { return null; }
            });
            assert.equal(service.isOptedIn, false);
            enableTelemetry = true;
            emitter.fire({});
            assert.equal(service.isOptedIn, true);
            enableTelemetry = false;
            emitter.fire({});
            assert.equal(service.isOptedIn, false);
            service.dispose();
        });
    });
});
//# sourceMappingURL=telemetryService.test.js.map