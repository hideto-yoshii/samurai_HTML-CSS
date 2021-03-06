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
define(["require", "exports", "vs/base/common/platform", "vs/base/node/pfs", "vs/base/common/path", "vs/base/common/types"], function (require, exports, platform_1, pfs_1, path, types_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let mainProcessParentEnv;
    function getMainProcessParentEnv() {
        return __awaiter(this, void 0, void 0, function* () {
            if (mainProcessParentEnv) {
                return mainProcessParentEnv;
            }
            // For Linux use /proc/<pid>/status to get the parent of the main process and then fetch its
            // env using /proc/<pid>/environ.
            if (platform_1.isLinux) {
                const mainProcessId = process.ppid;
                const codeProcessName = path.basename(process.argv[0]);
                let pid = 0;
                let ppid = mainProcessId;
                let name = codeProcessName;
                do {
                    pid = ppid;
                    const status = yield pfs_1.readFile(`/proc/${pid}/status`, 'utf8');
                    const splitByLine = status.split('\n');
                    splitByLine.forEach(line => {
                        if (line.indexOf('Name:') === 0) {
                            name = line.replace(/^Name:\s+/, '');
                        }
                        if (line.indexOf('PPid:') === 0) {
                            ppid = parseInt(line.replace(/^PPid:\s+/, ''));
                        }
                    });
                } while (name === codeProcessName);
                const rawEnv = yield pfs_1.readFile(`/proc/${pid}/environ`, 'utf8');
                const env = {};
                rawEnv.split('\0').forEach(e => {
                    const i = e.indexOf('=');
                    env[e.substr(0, i)] = e.substr(i + 1);
                });
                mainProcessParentEnv = env;
            }
            // For macOS we want the "root" environment as shells by default run as login shells. It
            // doesn't appear to be possible to get the "root" environment as `ps eww -o command` for
            // PID 1 (the parent of the main process when launched from the dock/finder) returns no
            // environment, because of this we will fill in the root environment using a whitelist of
            // environment variables that we have.
            if (platform_1.isMacintosh) {
                mainProcessParentEnv = {};
                // This list was generated by diffing launching a terminal with {} and the system
                // terminal launched from finder.
                const rootEnvVars = [
                    'SHELL',
                    'SSH_AUTH_SOCK',
                    'Apple_PubSub_Socket_Render',
                    'XPC_FLAGS',
                    'XPC_SERVICE_NAME',
                    'HOME',
                    'LOGNAME',
                    'TMPDIR'
                ];
                rootEnvVars.forEach(k => {
                    if (process.env[k]) {
                        mainProcessParentEnv[k] = process.env[k];
                    }
                });
            }
            // TODO: Windows should return a fresh environment block, might need native code?
            if (platform_1.isWindows) {
                mainProcessParentEnv = process.env;
            }
            return mainProcessParentEnv;
        });
    }
    exports.getMainProcessParentEnv = getMainProcessParentEnv;
    function findExecutable(command, cwd, paths) {
        return __awaiter(this, void 0, void 0, function* () {
            // If we have an absolute path then we take it.
            if (path.isAbsolute(command)) {
                return (yield pfs_1.exists(command)) ? command : undefined;
            }
            if (cwd === undefined) {
                cwd = process.cwd();
            }
            const dir = path.dirname(command);
            if (dir !== '.') {
                // We have a directory and the directory is relative (see above). Make the path absolute
                // to the current working directory.
                const fullPath = path.join(cwd, command);
                return (yield pfs_1.exists(fullPath)) ? fullPath : undefined;
            }
            if (paths === undefined && types_1.isString(process.env.PATH)) {
                paths = process.env.PATH.split(path.delimiter);
            }
            // No PATH environment. Make path absolute to the cwd.
            if (paths === undefined || paths.length === 0) {
                const fullPath = path.join(cwd, command);
                return (yield pfs_1.exists(fullPath)) ? fullPath : undefined;
            }
            // We have a simple file name. We get the path variable from the env
            // and try to find the executable on the path.
            for (let pathEntry of paths) {
                // The path entry is absolute.
                let fullPath;
                if (path.isAbsolute(pathEntry)) {
                    fullPath = path.join(pathEntry, command);
                }
                else {
                    fullPath = path.join(cwd, pathEntry, command);
                }
                if (yield pfs_1.exists(fullPath)) {
                    return fullPath;
                }
                if (platform_1.isWindows) {
                    let withExtension = fullPath + '.com';
                    if (yield pfs_1.exists(withExtension)) {
                        return withExtension;
                    }
                    withExtension = fullPath + '.exe';
                    if (yield pfs_1.exists(withExtension)) {
                        return withExtension;
                    }
                }
            }
            const fullPath = path.join(cwd, command);
            return (yield pfs_1.exists(fullPath)) ? fullPath : undefined;
        });
    }
    exports.findExecutable = findExecutable;
});
//# sourceMappingURL=terminalEnvironment.js.map