/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
define(["require", "exports", "assert", "vs/workbench/api/common/extHostTypeConverters", "vs/base/common/types", "vs/base/common/collections", "vs/workbench/api/common/extHostTypes", "vs/platform/log/common/log", "vs/base/common/uri"], function (require, exports, assert, extHostTypeConverters_1, types_1, collections_1, types, log_1, uri_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('ExtHostTypeConverter', function () {
        test('MarkdownConvert - uris', function () {
            let data = extHostTypeConverters_1.MarkdownString.from('Hello');
            assert.equal(types_1.isEmptyObject(data.uris), true);
            assert.equal(data.value, 'Hello');
            data = extHostTypeConverters_1.MarkdownString.from('Hello [link](foo)');
            assert.equal(data.value, 'Hello [link](foo)');
            assert.equal(types_1.isEmptyObject(data.uris), true); // no scheme, no uri
            data = extHostTypeConverters_1.MarkdownString.from('Hello [link](www.noscheme.bad)');
            assert.equal(data.value, 'Hello [link](www.noscheme.bad)');
            assert.equal(types_1.isEmptyObject(data.uris), true); // no scheme, no uri
            data = extHostTypeConverters_1.MarkdownString.from('Hello [link](foo:path)');
            assert.equal(data.value, 'Hello [link](foo:path)');
            assert.equal(collections_1.size(data.uris), 1);
            assert.ok(!!data.uris['foo:path']);
            data = extHostTypeConverters_1.MarkdownString.from('hello@foo.bar');
            assert.equal(data.value, 'hello@foo.bar');
            assert.equal(collections_1.size(data.uris), 1);
            assert.ok(!!data.uris['mailto:hello@foo.bar']);
            data = extHostTypeConverters_1.MarkdownString.from('*hello* [click](command:me)');
            assert.equal(data.value, '*hello* [click](command:me)');
            assert.equal(collections_1.size(data.uris), 1);
            assert.ok(!!data.uris['command:me']);
            data = extHostTypeConverters_1.MarkdownString.from('*hello* [click](file:///somepath/here). [click](file:///somepath/here)');
            assert.equal(data.value, '*hello* [click](file:///somepath/here). [click](file:///somepath/here)');
            assert.equal(collections_1.size(data.uris), 1);
            assert.ok(!!data.uris['file:///somepath/here']);
            data = extHostTypeConverters_1.MarkdownString.from('*hello* [click](file:///somepath/here). [click](file:///somepath/here)');
            assert.equal(data.value, '*hello* [click](file:///somepath/here). [click](file:///somepath/here)');
            assert.equal(collections_1.size(data.uris), 1);
            assert.ok(!!data.uris['file:///somepath/here']);
            data = extHostTypeConverters_1.MarkdownString.from('*hello* [click](file:///somepath/here). [click](file:///somepath/here2)');
            assert.equal(data.value, '*hello* [click](file:///somepath/here). [click](file:///somepath/here2)');
            assert.equal(collections_1.size(data.uris), 2);
            assert.ok(!!data.uris['file:///somepath/here']);
            assert.ok(!!data.uris['file:///somepath/here2']);
        });
        test('NPM script explorer running a script from the hover does not work #65561', function () {
            let data = extHostTypeConverters_1.MarkdownString.from('*hello* [click](command:npm.runScriptFromHover?%7B%22documentUri%22%3A%7B%22%24mid%22%3A1%2C%22external%22%3A%22file%3A%2F%2F%2Fc%253A%2Ffoo%2Fbaz.ex%22%2C%22path%22%3A%22%2Fc%3A%2Ffoo%2Fbaz.ex%22%2C%22scheme%22%3A%22file%22%7D%2C%22script%22%3A%22dev%22%7D)');
            // assert that both uri get extracted but that the latter is only decoded once...
            assert.equal(collections_1.size(data.uris), 2);
            collections_1.forEach(data.uris, entry => {
                if (entry.value.scheme === 'file') {
                    assert.ok(uri_1.URI.revive(entry.value).toString().indexOf('file:///c%3A') === 0);
                }
                else {
                    assert.equal(entry.value.scheme, 'command');
                }
            });
        });
        test('LogLevel', () => {
            assert.equal(extHostTypeConverters_1.LogLevel.from(types.LogLevel.Error), log_1.LogLevel.Error);
            assert.equal(extHostTypeConverters_1.LogLevel.from(types.LogLevel.Info), log_1.LogLevel.Info);
            assert.equal(extHostTypeConverters_1.LogLevel.from(types.LogLevel.Off), log_1.LogLevel.Off);
            assert.equal(extHostTypeConverters_1.LogLevel.to(log_1.LogLevel.Error), types.LogLevel.Error);
            assert.equal(extHostTypeConverters_1.LogLevel.to(log_1.LogLevel.Info), types.LogLevel.Info);
            assert.equal(extHostTypeConverters_1.LogLevel.to(log_1.LogLevel.Off), types.LogLevel.Off);
        });
    });
});
//# sourceMappingURL=extHostTypeConverter.test.js.map