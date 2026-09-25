export interface AppConfig {
  readonly appName: string;
  readonly appVersion: string;
  readonly defaultPrompt: string;
  readonly defaultShellPackage: string;
  readonly docsUrl: string;
  readonly orgUrl: string;
}

export const APP_CONFIG: AppConfig = {
  appName: 'SHELLGROUND',
  appVersion: '0.1.0-alpha.0',
  defaultPrompt: 'student@shellground:~$ ',
  defaultShellPackage: 'wasmer/bash@1.0.25',
  docsUrl: 'https://github.com/LINUX-PROJECTS-BENSOY/shellground-docs',
  orgUrl: 'https://github.com/LINUX-PROJECTS-BENSOY',
};
