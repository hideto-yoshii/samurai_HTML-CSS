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
define(["require", "exports", "vs/platform/product/common/product", "os", "vs/base/common/uri", "vs/base/common/platform", "vs/workbench/contrib/terminal/common/terminalEnvironment", "vs/workbench/api/common/extHostConfiguration", "vs/platform/log/common/log", "vs/workbench/api/common/extHostWorkspace", "vs/workbench/contrib/terminal/node/terminal", "vs/workbench/contrib/terminal/node/terminalEnvironment", "vs/workbench/api/common/extHostTerminalService", "vs/workbench/api/common/extHostRpcService"], function (require, exports, product_1, os, uri_1, platform, terminalEnvironment, extHostConfiguration_1, log_1, extHostWorkspace_1, terminal_1, terminalEnvironment_1, extHostTerminalService_1, extHostRpcService_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    let ExtHostTerminalService = class ExtHostTerminalService extends extHostTerminalService_1.BaseExtHostTerminalService {
        constructor(extHostRpc, _extHostConfiguration, _extHostWorkspace, 
        // C9 change
        // @IExtHostDocumentsAndEditors private _extHostDocumentsAndEditors: ExtHostDocumentsAndEditors,
        _logService) {
            super(extHostRpc);
            this._extHostConfiguration = _extHostConfiguration;
            this._extHostWorkspace = _extHostWorkspace;
            this._logService = _logService;
            // TODO: Pull this from main side
            this._isWorkspaceShellAllowed = false;
            // C9 changes start
            // this._updateLastActiveWorkspace();
            // this._updateVariableResolver();
            // this._registerListeners();
            // C9 changes end
        }
        createTerminal(name, shellPath, shellArgs) {
            const terminal = new extHostTerminalService_1.ExtHostTerminal(this._proxy, name);
            terminal.create(shellPath, shellArgs);
            this._terminals.push(terminal);
            return terminal;
        }
        createTerminalFromOptions(options) {
            const terminal = new extHostTerminalService_1.ExtHostTerminal(this._proxy, options.name);
            terminal.create(options.shellPath, options.shellArgs, options.cwd, options.env, /*options.waitOnExit*/ undefined, options.strictEnv, options.hideFromUser);
            this._terminals.push(terminal);
            return terminal;
        }
        getDefaultShell(useAutomationShell, configProvider) {
            const fetchSetting = (key) => {
                const setting = configProvider
                    .getConfiguration(key.substr(0, key.lastIndexOf('.')))
                    .inspect(key.substr(key.lastIndexOf('.') + 1));
                return this._apiInspectConfigToPlain(setting);
            };
            return terminalEnvironment.getDefaultShell(fetchSetting, this._isWorkspaceShellAllowed, terminal_1.getSystemShell(platform.platform), process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432'), process.env.windir, this._lastActiveWorkspace, this._variableResolver, this._logService, useAutomationShell);
        }
        _getDefaultShellArgs(useAutomationShell, configProvider) {
            const fetchSetting = (key) => {
                const setting = configProvider
                    .getConfiguration(key.substr(0, key.lastIndexOf('.')))
                    .inspect(key.substr(key.lastIndexOf('.') + 1));
                return this._apiInspectConfigToPlain(setting);
            };
            return terminalEnvironment.getDefaultShellArgs(fetchSetting, this._isWorkspaceShellAllowed, useAutomationShell, this._lastActiveWorkspace, this._variableResolver, this._logService);
        }
        _apiInspectConfigToPlain(config) {
            return {
                user: config ? config.globalValue : undefined,
                value: config ? config.workspaceValue : undefined,
                default: config ? config.defaultValue : undefined,
            };
        }
        _getNonInheritedEnv() {
            return __awaiter(this, void 0, void 0, function* () {
                const env = yield terminalEnvironment_1.getMainProcessParentEnv();
                env.VSCODE_IPC_HOOK_CLI = process.env['VSCODE_IPC_HOOK_CLI'];
                return env;
            });
        }
        // C9 changes start
        // private _registerListeners(): void {
        // 	this._extHostDocumentsAndEditors.onDidChangeActiveTextEditor(() => this._updateLastActiveWorkspace());
        // 	this._extHostWorkspace.onDidChangeWorkspace(() => this._updateVariableResolver());
        // }
        // private _updateLastActiveWorkspace(): void {
        // 	const activeEditor = this._extHostDocumentsAndEditors.activeEditor();
        // 	if (activeEditor) {
        // 		this._lastActiveWorkspace = this._extHostWorkspace.getWorkspaceFolder(activeEditor.document.uri) as IWorkspaceFolder;
        // 	}
        // }
        // private async _updateVariableResolver(): Promise<void> {
        // 	const configProvider = await this._extHostConfiguration.getConfigProvider();
        // 	const workspaceFolders = await this._extHostWorkspace.getWorkspaceFolders2();
        // 	this._variableResolver = new ExtHostVariableResolverService(workspaceFolders || [], this._extHostDocumentsAndEditors, configProvider);
        // }
        // C9 changes end
        $spawnExtHostProcess(id, shellLaunchConfigDto, activeWorkspaceRootUriComponents, cols, rows, isWorkspaceShellAllowed) {
            return __awaiter(this, void 0, void 0, function* () {
                const shellLaunchConfig = {
                    name: shellLaunchConfigDto.name,
                    executable: shellLaunchConfigDto.executable,
                    args: shellLaunchConfigDto.args,
                    cwd: typeof shellLaunchConfigDto.cwd === 'string' ? shellLaunchConfigDto.cwd : uri_1.URI.revive(shellLaunchConfigDto.cwd),
                    env: shellLaunchConfigDto.env
                };
                // Merge in shell and args from settings
                const platformKey = platform.isWindows ? 'windows' : (platform.isMacintosh ? 'osx' : 'linux');
                const configProvider = yield this._extHostConfiguration.getConfigProvider();
                if (!shellLaunchConfig.executable) {
                    shellLaunchConfig.executable = this.getDefaultShell(false, configProvider);
                    shellLaunchConfig.args = this._getDefaultShellArgs(false, configProvider);
                }
                else {
                    if (this._variableResolver) {
                        shellLaunchConfig.executable = this._variableResolver.resolve(this._lastActiveWorkspace, shellLaunchConfig.executable);
                        if (shellLaunchConfig.args) {
                            if (Array.isArray(shellLaunchConfig.args)) {
                                const resolvedArgs = [];
                                for (const arg of shellLaunchConfig.args) {
                                    resolvedArgs.push(this._variableResolver.resolve(this._lastActiveWorkspace, arg));
                                }
                                shellLaunchConfig.args = resolvedArgs;
                            }
                            else {
                                shellLaunchConfig.args = this._variableResolver.resolve(this._lastActiveWorkspace, shellLaunchConfig.args);
                            }
                        }
                    }
                }
                const activeWorkspaceRootUri = uri_1.URI.revive(activeWorkspaceRootUriComponents);
                let lastActiveWorkspace = null;
                if (activeWorkspaceRootUriComponents && activeWorkspaceRootUri) {
                    // Get the environment
                    const apiLastActiveWorkspace = yield this._extHostWorkspace.getWorkspaceFolder(activeWorkspaceRootUri);
                    if (apiLastActiveWorkspace) {
                        lastActiveWorkspace = {
                            uri: apiLastActiveWorkspace.uri,
                            name: apiLastActiveWorkspace.name,
                            index: apiLastActiveWorkspace.index,
                            toResource: () => {
                                throw new Error('Not implemented');
                            }
                        };
                    }
                }
                // Get the initial cwd
                const terminalConfig = configProvider.getConfiguration('terminal.integrated');
                const initialCwd = terminalEnvironment.getCwd(shellLaunchConfig, os.homedir(), lastActiveWorkspace ? lastActiveWorkspace : undefined, this._variableResolver, activeWorkspaceRootUri, terminalConfig.cwd, this._logService);
                shellLaunchConfig.cwd = initialCwd;
                const envFromConfig = this._apiInspectConfigToPlain(configProvider.getConfiguration('terminal.integrated').inspect(`env.${platformKey}`));
                const baseEnv = terminalConfig.get('inheritEnv', true) ? process.env : yield this._getNonInheritedEnv();
                const env = terminalEnvironment.createTerminalEnvironment(shellLaunchConfig, lastActiveWorkspace, envFromConfig, this._variableResolver, isWorkspaceShellAllowed, product_1.default.version, terminalConfig.get('detectLocale', 'auto'), baseEnv);
                this._proxy.$sendResolvedLaunchConfig(id, shellLaunchConfig);
                // Fork the process and listen for messages
                this._logService.debug(`Terminal process launching on ext host`, shellLaunchConfig, initialCwd, cols, rows, env);
                // TODO: Support conpty on remote, it doesn't seem to work for some reason?
                // TODO: When conpty is enabled, only enable it when accessibilityMode is off
                // C9 changes start
                // const enableConpty = false; //terminalConfig.get('windowsEnableConpty') as boolean;
                // this._setupExtHostProcessListeners(id, new TerminalProcess(shellLaunchConfig, initialCwd, cols, rows, env, enableConpty, this._logService));
                // C9 changes end
            });
        }
        $requestAvailableShells() {
            return terminal_1.detectAvailableShells();
        }
        $requestDefaultShellAndArgs(useAutomationShell) {
            return __awaiter(this, void 0, void 0, function* () {
                const configProvider = yield this._extHostConfiguration.getConfigProvider();
                return Promise.resolve({
                    shell: this.getDefaultShell(useAutomationShell, configProvider),
                    args: this._getDefaultShellArgs(useAutomationShell, configProvider)
                });
            });
        }
        $acceptWorkspacePermissionsChanged(isAllowed) {
            this._isWorkspaceShellAllowed = isAllowed;
        }
    };
    ExtHostTerminalService = __decorate([
        __param(0, extHostRpcService_1.IExtHostRpcService),
        __param(1, extHostConfiguration_1.IExtHostConfiguration),
        __param(2, extHostWorkspace_1.IExtHostWorkspace),
        __param(3, log_1.ILogService)
    ], ExtHostTerminalService);
    exports.ExtHostTerminalService = ExtHostTerminalService;
});
//# sourceMappingURL=extHostTerminalService.js.map