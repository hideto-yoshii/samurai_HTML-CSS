define(["require", "exports", "assert", "vs/base/common/uri", "vs/base/common/platform"], function (require, exports, assert, uri_1, platform_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    suite('URI', () => {
        test('file#toString', () => {
            assert.equal(uri_1.URI.file('c:/win/path').toString(), 'file:///c%3A/win/path');
            assert.equal(uri_1.URI.file('C:/win/path').toString(), 'file:///c%3A/win/path');
            assert.equal(uri_1.URI.file('c:/win/path/').toString(), 'file:///c%3A/win/path/');
            assert.equal(uri_1.URI.file('/c:/win/path').toString(), 'file:///c%3A/win/path');
        });
        test('URI.file (win-special)', () => {
            if (platform_1.isWindows) {
                assert.equal(uri_1.URI.file('c:\\win\\path').toString(), 'file:///c%3A/win/path');
                assert.equal(uri_1.URI.file('c:\\win/path').toString(), 'file:///c%3A/win/path');
            }
            else {
                assert.equal(uri_1.URI.file('c:\\win\\path').toString(), 'file:///c%3A%5Cwin%5Cpath');
                assert.equal(uri_1.URI.file('c:\\win/path').toString(), 'file:///c%3A%5Cwin/path');
            }
        });
        test('file#fsPath (win-special)', () => {
            if (platform_1.isWindows) {
                assert.equal(uri_1.URI.file('c:\\win\\path').fsPath, 'c:\\win\\path');
                assert.equal(uri_1.URI.file('c:\\win/path').fsPath, 'c:\\win\\path');
                assert.equal(uri_1.URI.file('c:/win/path').fsPath, 'c:\\win\\path');
                assert.equal(uri_1.URI.file('c:/win/path/').fsPath, 'c:\\win\\path\\');
                assert.equal(uri_1.URI.file('C:/win/path').fsPath, 'c:\\win\\path');
                assert.equal(uri_1.URI.file('/c:/win/path').fsPath, 'c:\\win\\path');
                assert.equal(uri_1.URI.file('./c/win/path').fsPath, '\\.\\c\\win\\path');
            }
            else {
                assert.equal(uri_1.URI.file('c:/win/path').fsPath, 'c:/win/path');
                assert.equal(uri_1.URI.file('c:/win/path/').fsPath, 'c:/win/path/');
                assert.equal(uri_1.URI.file('C:/win/path').fsPath, 'c:/win/path');
                assert.equal(uri_1.URI.file('/c:/win/path').fsPath, 'c:/win/path');
                assert.equal(uri_1.URI.file('./c/win/path').fsPath, '/./c/win/path');
            }
        });
        test('URI#fsPath - no `fsPath` when no `path`', () => {
            const value = uri_1.URI.parse('file://%2Fhome%2Fticino%2Fdesktop%2Fcpluscplus%2Ftest.cpp');
            assert.equal(value.authority, '/home/ticino/desktop/cpluscplus/test.cpp');
            assert.equal(value.path, '/');
            if (platform_1.isWindows) {
                assert.equal(value.fsPath, '\\');
            }
            else {
                assert.equal(value.fsPath, '/');
            }
        });
        test('http#toString', () => {
            assert.equal(uri_1.URI.from({ scheme: 'http', authority: 'www.msft.com', path: '/my/path' }).toString(), 'http://www.msft.com/my/path');
            assert.equal(uri_1.URI.from({ scheme: 'http', authority: 'www.msft.com', path: '/my/path' }).toString(), 'http://www.msft.com/my/path');
            assert.equal(uri_1.URI.from({ scheme: 'http', authority: 'www.MSFT.com', path: '/my/path' }).toString(), 'http://www.msft.com/my/path');
            assert.equal(uri_1.URI.from({ scheme: 'http', authority: '', path: 'my/path' }).toString(), 'http:/my/path');
            assert.equal(uri_1.URI.from({ scheme: 'http', authority: '', path: '/my/path' }).toString(), 'http:/my/path');
            //http://a-test-site.com/#test=true
            assert.equal(uri_1.URI.from({ scheme: 'http', authority: 'a-test-site.com', path: '/', query: 'test=true' }).toString(), 'http://a-test-site.com/?test%3Dtrue');
            assert.equal(uri_1.URI.from({ scheme: 'http', authority: 'a-test-site.com', path: '/', query: '', fragment: 'test=true' }).toString(), 'http://a-test-site.com/#test%3Dtrue');
        });
        test('http#toString, encode=FALSE', () => {
            assert.equal(uri_1.URI.from({ scheme: 'http', authority: 'a-test-site.com', path: '/', query: 'test=true' }).toString(true), 'http://a-test-site.com/?test=true');
            assert.equal(uri_1.URI.from({ scheme: 'http', authority: 'a-test-site.com', path: '/', query: '', fragment: 'test=true' }).toString(true), 'http://a-test-site.com/#test=true');
            assert.equal(uri_1.URI.from({ scheme: 'http', path: '/api/files/test.me', query: 't=1234' }).toString(true), 'http:/api/files/test.me?t=1234');
            const value = uri_1.URI.parse('file://shares/pr??jects/c%23/#l12');
            assert.equal(value.authority, 'shares');
            assert.equal(value.path, '/pr??jects/c#/');
            assert.equal(value.fragment, 'l12');
            assert.equal(value.toString(), 'file://shares/pr%C3%B6jects/c%23/#l12');
            assert.equal(value.toString(true), 'file://shares/pr??jects/c%23/#l12');
            const uri2 = uri_1.URI.parse(value.toString(true));
            const uri3 = uri_1.URI.parse(value.toString());
            assert.equal(uri2.authority, uri3.authority);
            assert.equal(uri2.path, uri3.path);
            assert.equal(uri2.query, uri3.query);
            assert.equal(uri2.fragment, uri3.fragment);
        });
        test('with, identity', () => {
            let uri = uri_1.URI.parse('foo:bar/path');
            let uri2 = uri.with(null);
            assert.ok(uri === uri2);
            uri2 = uri.with(undefined);
            assert.ok(uri === uri2);
            uri2 = uri.with({});
            assert.ok(uri === uri2);
            uri2 = uri.with({ scheme: 'foo', path: 'bar/path' });
            assert.ok(uri === uri2);
        });
        test('with, changes', () => {
            assert.equal(uri_1.URI.parse('before:some/file/path').with({ scheme: 'after' }).toString(), 'after:some/file/path');
            assert.equal(uri_1.URI.from({ scheme: 's' }).with({ scheme: 'http', path: '/api/files/test.me', query: 't=1234' }).toString(), 'http:/api/files/test.me?t%3D1234');
            assert.equal(uri_1.URI.from({ scheme: 's' }).with({ scheme: 'http', authority: '', path: '/api/files/test.me', query: 't=1234', fragment: '' }).toString(), 'http:/api/files/test.me?t%3D1234');
            assert.equal(uri_1.URI.from({ scheme: 's' }).with({ scheme: 'https', authority: '', path: '/api/files/test.me', query: 't=1234', fragment: '' }).toString(), 'https:/api/files/test.me?t%3D1234');
            assert.equal(uri_1.URI.from({ scheme: 's' }).with({ scheme: 'HTTP', authority: '', path: '/api/files/test.me', query: 't=1234', fragment: '' }).toString(), 'HTTP:/api/files/test.me?t%3D1234');
            assert.equal(uri_1.URI.from({ scheme: 's' }).with({ scheme: 'HTTPS', authority: '', path: '/api/files/test.me', query: 't=1234', fragment: '' }).toString(), 'HTTPS:/api/files/test.me?t%3D1234');
            assert.equal(uri_1.URI.from({ scheme: 's' }).with({ scheme: 'boo', authority: '', path: '/api/files/test.me', query: 't=1234', fragment: '' }).toString(), 'boo:/api/files/test.me?t%3D1234');
        });
        test('with, remove components #8465', () => {
            assert.equal(uri_1.URI.parse('scheme://authority/path').with({ authority: '' }).toString(), 'scheme:/path');
            assert.equal(uri_1.URI.parse('scheme:/path').with({ authority: 'authority' }).with({ authority: '' }).toString(), 'scheme:/path');
            assert.equal(uri_1.URI.parse('scheme:/path').with({ authority: 'authority' }).with({ authority: null }).toString(), 'scheme:/path');
            assert.equal(uri_1.URI.parse('scheme:/path').with({ authority: 'authority' }).with({ path: '' }).toString(), 'scheme://authority');
            assert.equal(uri_1.URI.parse('scheme:/path').with({ authority: 'authority' }).with({ path: null }).toString(), 'scheme://authority');
            assert.equal(uri_1.URI.parse('scheme:/path').with({ authority: '' }).toString(), 'scheme:/path');
            assert.equal(uri_1.URI.parse('scheme:/path').with({ authority: null }).toString(), 'scheme:/path');
        });
        test('with, validation', () => {
            let uri = uri_1.URI.parse('foo:bar/path');
            assert.throws(() => uri.with({ scheme: 'fai:l' }));
            assert.throws(() => uri.with({ scheme: 'f??il' }));
            assert.throws(() => uri.with({ authority: 'fail' }));
            assert.throws(() => uri.with({ path: '//fail' }));
        });
        test('parse', () => {
            let value = uri_1.URI.parse('http:/api/files/test.me?t=1234');
            assert.equal(value.scheme, 'http');
            assert.equal(value.authority, '');
            assert.equal(value.path, '/api/files/test.me');
            assert.equal(value.query, 't=1234');
            assert.equal(value.fragment, '');
            value = uri_1.URI.parse('http://api/files/test.me?t=1234');
            assert.equal(value.scheme, 'http');
            assert.equal(value.authority, 'api');
            assert.equal(value.path, '/files/test.me');
            assert.equal(value.query, 't=1234');
            assert.equal(value.fragment, '');
            value = uri_1.URI.parse('file:///c:/test/me');
            assert.equal(value.scheme, 'file');
            assert.equal(value.authority, '');
            assert.equal(value.path, '/c:/test/me');
            assert.equal(value.fragment, '');
            assert.equal(value.query, '');
            assert.equal(value.fsPath, platform_1.isWindows ? 'c:\\test\\me' : 'c:/test/me');
            value = uri_1.URI.parse('file://shares/files/c%23/p.cs');
            assert.equal(value.scheme, 'file');
            assert.equal(value.authority, 'shares');
            assert.equal(value.path, '/files/c#/p.cs');
            assert.equal(value.fragment, '');
            assert.equal(value.query, '');
            assert.equal(value.fsPath, platform_1.isWindows ? '\\\\shares\\files\\c#\\p.cs' : '//shares/files/c#/p.cs');
            value = uri_1.URI.parse('file:///c:/Source/Z%C3%BCrich%20or%20Zurich%20(%CB%88zj%CA%8A%C9%99r%C9%AAk,/Code/resources/app/plugins/c%23/plugin.json');
            assert.equal(value.scheme, 'file');
            assert.equal(value.authority, '');
            assert.equal(value.path, '/c:/Source/Z??rich or Zurich (??zj????r??k,/Code/resources/app/plugins/c#/plugin.json');
            assert.equal(value.fragment, '');
            assert.equal(value.query, '');
            value = uri_1.URI.parse('file:///c:/test %25/path');
            assert.equal(value.scheme, 'file');
            assert.equal(value.authority, '');
            assert.equal(value.path, '/c:/test %/path');
            assert.equal(value.fragment, '');
            assert.equal(value.query, '');
            value = uri_1.URI.parse('inmemory:');
            assert.equal(value.scheme, 'inmemory');
            assert.equal(value.authority, '');
            assert.equal(value.path, '');
            assert.equal(value.query, '');
            assert.equal(value.fragment, '');
            value = uri_1.URI.parse('foo:api/files/test');
            assert.equal(value.scheme, 'foo');
            assert.equal(value.authority, '');
            assert.equal(value.path, 'api/files/test');
            assert.equal(value.query, '');
            assert.equal(value.fragment, '');
            value = uri_1.URI.parse('file:?q');
            assert.equal(value.scheme, 'file');
            assert.equal(value.authority, '');
            assert.equal(value.path, '/');
            assert.equal(value.query, 'q');
            assert.equal(value.fragment, '');
            value = uri_1.URI.parse('file:#d');
            assert.equal(value.scheme, 'file');
            assert.equal(value.authority, '');
            assert.equal(value.path, '/');
            assert.equal(value.query, '');
            assert.equal(value.fragment, 'd');
            value = uri_1.URI.parse('f3ile:#d');
            assert.equal(value.scheme, 'f3ile');
            assert.equal(value.authority, '');
            assert.equal(value.path, '');
            assert.equal(value.query, '');
            assert.equal(value.fragment, 'd');
            value = uri_1.URI.parse('foo+bar:path');
            assert.equal(value.scheme, 'foo+bar');
            assert.equal(value.authority, '');
            assert.equal(value.path, 'path');
            assert.equal(value.query, '');
            assert.equal(value.fragment, '');
            value = uri_1.URI.parse('foo-bar:path');
            assert.equal(value.scheme, 'foo-bar');
            assert.equal(value.authority, '');
            assert.equal(value.path, 'path');
            assert.equal(value.query, '');
            assert.equal(value.fragment, '');
            value = uri_1.URI.parse('foo.bar:path');
            assert.equal(value.scheme, 'foo.bar');
            assert.equal(value.authority, '');
            assert.equal(value.path, 'path');
            assert.equal(value.query, '');
            assert.equal(value.fragment, '');
        });
        test('parse, disallow //path when no authority', () => {
            assert.throws(() => uri_1.URI.parse('file:////shares/files/p.cs'));
        });
        test('URI#file, win-speciale', () => {
            if (platform_1.isWindows) {
                let value = uri_1.URI.file('c:\\test\\drive');
                assert.equal(value.path, '/c:/test/drive');
                assert.equal(value.toString(), 'file:///c%3A/test/drive');
                value = uri_1.URI.file('\\\\sh??res\\path\\c#\\plugin.json');
                assert.equal(value.scheme, 'file');
                assert.equal(value.authority, 'sh??res');
                assert.equal(value.path, '/path/c#/plugin.json');
                assert.equal(value.fragment, '');
                assert.equal(value.query, '');
                assert.equal(value.toString(), 'file://sh%C3%A4res/path/c%23/plugin.json');
                value = uri_1.URI.file('\\\\localhost\\c$\\GitDevelopment\\express');
                assert.equal(value.scheme, 'file');
                assert.equal(value.path, '/c$/GitDevelopment/express');
                assert.equal(value.fsPath, '\\\\localhost\\c$\\GitDevelopment\\express');
                assert.equal(value.query, '');
                assert.equal(value.fragment, '');
                assert.equal(value.toString(), 'file://localhost/c%24/GitDevelopment/express');
                value = uri_1.URI.file('c:\\test with %\\path');
                assert.equal(value.path, '/c:/test with %/path');
                assert.equal(value.toString(), 'file:///c%3A/test%20with%20%25/path');
                value = uri_1.URI.file('c:\\test with %25\\path');
                assert.equal(value.path, '/c:/test with %25/path');
                assert.equal(value.toString(), 'file:///c%3A/test%20with%20%2525/path');
                value = uri_1.URI.file('c:\\test with %25\\c#code');
                assert.equal(value.path, '/c:/test with %25/c#code');
                assert.equal(value.toString(), 'file:///c%3A/test%20with%20%2525/c%23code');
                value = uri_1.URI.file('\\\\shares');
                assert.equal(value.scheme, 'file');
                assert.equal(value.authority, 'shares');
                assert.equal(value.path, '/'); // slash is always there
                value = uri_1.URI.file('\\\\shares\\');
                assert.equal(value.scheme, 'file');
                assert.equal(value.authority, 'shares');
                assert.equal(value.path, '/');
            }
        });
        test('VSCode URI module\'s driveLetterPath regex is incorrect, #32961', function () {
            let uri = uri_1.URI.parse('file:///_:/path');
            assert.equal(uri.fsPath, platform_1.isWindows ? '\\_:\\path' : '/_:/path');
        });
        test('URI#file, no path-is-uri check', () => {
            // we don't complain here
            let value = uri_1.URI.file('file://path/to/file');
            assert.equal(value.scheme, 'file');
            assert.equal(value.authority, '');
            assert.equal(value.path, '/file://path/to/file');
        });
        test('URI#file, always slash', () => {
            let value = uri_1.URI.file('a.file');
            assert.equal(value.scheme, 'file');
            assert.equal(value.authority, '');
            assert.equal(value.path, '/a.file');
            assert.equal(value.toString(), 'file:///a.file');
            value = uri_1.URI.parse(value.toString());
            assert.equal(value.scheme, 'file');
            assert.equal(value.authority, '');
            assert.equal(value.path, '/a.file');
            assert.equal(value.toString(), 'file:///a.file');
        });
        test('URI.toString, only scheme and query', () => {
            const value = uri_1.URI.parse('stuff:?q??ery');
            assert.equal(value.toString(), 'stuff:?q%C3%BCery');
        });
        test('URI#toString, upper-case percent espaces', () => {
            const value = uri_1.URI.parse('file://sh%c3%a4res/path');
            assert.equal(value.toString(), 'file://sh%C3%A4res/path');
        });
        test('URI#toString, lower-case windows drive letter', () => {
            assert.equal(uri_1.URI.parse('untitled:c:/Users/jrieken/Code/abc.txt').toString(), 'untitled:c%3A/Users/jrieken/Code/abc.txt');
            assert.equal(uri_1.URI.parse('untitled:C:/Users/jrieken/Code/abc.txt').toString(), 'untitled:c%3A/Users/jrieken/Code/abc.txt');
        });
        test('URI#toString, escape all the bits', () => {
            const value = uri_1.URI.file('/Users/jrieken/Code/_samples/18500/M??del + Other Th??ng??/model.js');
            assert.equal(value.toString(), 'file:///Users/jrieken/Code/_samples/18500/M%C3%B6del%20%2B%20Other%20Th%C3%AEng%C3%9F/model.js');
        });
        test('URI#toString, don\'t encode port', () => {
            let value = uri_1.URI.parse('http://localhost:8080/far');
            assert.equal(value.toString(), 'http://localhost:8080/far');
            value = uri_1.URI.from({ scheme: 'http', authority: 'l??calhost:8080', path: '/far', query: undefined, fragment: undefined });
            assert.equal(value.toString(), 'http://l%C3%B6calhost:8080/far');
        });
        test('URI#toString, user information in authority', () => {
            let value = uri_1.URI.parse('http://foo:bar@localhost/far');
            assert.equal(value.toString(), 'http://foo:bar@localhost/far');
            value = uri_1.URI.parse('http://foo@localhost/far');
            assert.equal(value.toString(), 'http://foo@localhost/far');
            value = uri_1.URI.parse('http://foo:bAr@localhost:8080/far');
            assert.equal(value.toString(), 'http://foo:bAr@localhost:8080/far');
            value = uri_1.URI.parse('http://foo@localhost:8080/far');
            assert.equal(value.toString(), 'http://foo@localhost:8080/far');
            value = uri_1.URI.from({ scheme: 'http', authority: 'f????:b??r@l??calhost:8080', path: '/far', query: undefined, fragment: undefined });
            assert.equal(value.toString(), 'http://f%C3%B6%C3%B6:b%C3%B6r@l%C3%B6calhost:8080/far');
        });
        test('correctFileUriToFilePath2', () => {
            const test = (input, expected) => {
                const value = uri_1.URI.parse(input);
                assert.equal(value.fsPath, expected, 'Result for ' + input);
                const value2 = uri_1.URI.file(value.fsPath);
                assert.equal(value2.fsPath, expected, 'Result for ' + input);
                assert.equal(value.toString(), value2.toString());
            };
            test('file:///c:/alex.txt', platform_1.isWindows ? 'c:\\alex.txt' : 'c:/alex.txt');
            test('file:///c:/Source/Z%C3%BCrich%20or%20Zurich%20(%CB%88zj%CA%8A%C9%99r%C9%AAk,/Code/resources/app/plugins', platform_1.isWindows ? 'c:\\Source\\Z??rich or Zurich (??zj????r??k,\\Code\\resources\\app\\plugins' : 'c:/Source/Z??rich or Zurich (??zj????r??k,/Code/resources/app/plugins');
            test('file://monacotools/folder/isi.txt', platform_1.isWindows ? '\\\\monacotools\\folder\\isi.txt' : '//monacotools/folder/isi.txt');
            test('file://monacotools1/certificates/SSL/', platform_1.isWindows ? '\\\\monacotools1\\certificates\\SSL\\' : '//monacotools1/certificates/SSL/');
        });
        test('URI - http, query & toString', function () {
            let uri = uri_1.URI.parse('https://go.microsoft.com/fwlink/?LinkId=518008');
            assert.equal(uri.query, 'LinkId=518008');
            assert.equal(uri.toString(true), 'https://go.microsoft.com/fwlink/?LinkId=518008');
            assert.equal(uri.toString(), 'https://go.microsoft.com/fwlink/?LinkId%3D518008');
            let uri2 = uri_1.URI.parse(uri.toString());
            assert.equal(uri2.query, 'LinkId=518008');
            assert.equal(uri2.query, uri.query);
            uri = uri_1.URI.parse('https://go.microsoft.com/fwlink/?LinkId=518008&fo??&k????=????');
            assert.equal(uri.query, 'LinkId=518008&fo??&k????=????');
            assert.equal(uri.toString(true), 'https://go.microsoft.com/fwlink/?LinkId=518008&fo??&k????=????');
            assert.equal(uri.toString(), 'https://go.microsoft.com/fwlink/?LinkId%3D518008%26fo%C3%B6%26k%C3%A9%C2%A5%3D%C3%BC%C3%BC');
            uri2 = uri_1.URI.parse(uri.toString());
            assert.equal(uri2.query, 'LinkId=518008&fo??&k????=????');
            assert.equal(uri2.query, uri.query);
            // #24849
            uri = uri_1.URI.parse('https://twitter.com/search?src=typd&q=%23tag');
            assert.equal(uri.toString(true), 'https://twitter.com/search?src=typd&q=%23tag');
        });
        test('class URI cannot represent relative file paths #34449', function () {
            let path = '/foo/bar';
            assert.equal(uri_1.URI.file(path).path, path);
            path = 'foo/bar';
            assert.equal(uri_1.URI.file(path).path, '/foo/bar');
            path = './foo/bar';
            assert.equal(uri_1.URI.file(path).path, '/./foo/bar'); // todo@joh missing normalization
            const fileUri1 = uri_1.URI.parse(`file:foo/bar`);
            assert.equal(fileUri1.path, '/foo/bar');
            assert.equal(fileUri1.authority, '');
            const uri = fileUri1.toString();
            assert.equal(uri, 'file:///foo/bar');
            const fileUri2 = uri_1.URI.parse(uri);
            assert.equal(fileUri2.path, '/foo/bar');
            assert.equal(fileUri2.authority, '');
        });
        test('Ctrl click to follow hash query param url gets urlencoded #49628', function () {
            let input = 'http://localhost:3000/#/foo?bar=baz';
            let uri = uri_1.URI.parse(input);
            assert.equal(uri.toString(true), input);
            input = 'http://localhost:3000/foo?bar=baz';
            uri = uri_1.URI.parse(input);
            assert.equal(uri.toString(true), input);
        });
        test('Unable to open \'%A0.txt\': URI malformed #76506', function () {
            let uri = uri_1.URI.file('/foo/%A0.txt');
            let uri2 = uri_1.URI.parse(uri.toString());
            assert.equal(uri.scheme, uri2.scheme);
            assert.equal(uri.path, uri2.path);
            uri = uri_1.URI.file('/foo/%2e.txt');
            uri2 = uri_1.URI.parse(uri.toString());
            assert.equal(uri.scheme, uri2.scheme);
            assert.equal(uri.path, uri2.path);
        });
        test('Links in markdown are broken if url contains encoded parameters #79474', function () {
            this.skip();
            let strIn = 'https://myhost.com/Redirect?url=http%3A%2F%2Fwww.bing.com%3Fsearch%3Dtom';
            let uri1 = uri_1.URI.parse(strIn);
            let strOut = uri1.toString();
            let uri2 = uri_1.URI.parse(strOut);
            assert.equal(uri1.scheme, uri2.scheme);
            assert.equal(uri1.authority, uri2.authority);
            assert.equal(uri1.path, uri2.path);
            assert.equal(uri1.query, uri2.query);
            assert.equal(uri1.fragment, uri2.fragment);
            assert.equal(strIn, strOut); // fails here!!
        });
        test('Uri#parse can break path-component #45515', function () {
            this.skip();
            let strIn = 'https://firebasestorage.googleapis.com/v0/b/brewlangerie.appspot.com/o/products%2FzVNZkudXJyq8bPGTXUxx%2FBetterave-Sesame.jpg?alt=media&token=0b2310c4-3ea6-4207-bbde-9c3710ba0437';
            let uri1 = uri_1.URI.parse(strIn);
            let strOut = uri1.toString();
            let uri2 = uri_1.URI.parse(strOut);
            assert.equal(uri1.scheme, uri2.scheme);
            assert.equal(uri1.authority, uri2.authority);
            assert.equal(uri1.path, uri2.path);
            assert.equal(uri1.query, uri2.query);
            assert.equal(uri1.fragment, uri2.fragment);
            assert.equal(strIn, strOut); // fails here!!
        });
        test('URI - (de)serialize', function () {
            const values = [
                uri_1.URI.parse('http://localhost:8080/far'),
                uri_1.URI.file('c:\\test with %25\\c#code'),
                uri_1.URI.file('\\\\sh??res\\path\\c#\\plugin.json'),
                uri_1.URI.parse('http://api/files/test.me?t=1234'),
                uri_1.URI.parse('http://api/files/test.me?t=1234#fff'),
                uri_1.URI.parse('http://api/files/test.me#fff'),
            ];
            // console.profile();
            // let c = 100000;
            // while (c-- > 0) {
            for (let value of values) {
                let data = value.toJSON();
                let clone = uri_1.URI.revive(data);
                assert.equal(clone.scheme, value.scheme);
                assert.equal(clone.authority, value.authority);
                assert.equal(clone.path, value.path);
                assert.equal(clone.query, value.query);
                assert.equal(clone.fragment, value.fragment);
                assert.equal(clone.fsPath, value.fsPath);
                assert.equal(clone.toString(), value.toString());
            }
            // }
            // console.profileEnd();
        });
    });
});
//# sourceMappingURL=uri.test.js.map