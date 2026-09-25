/**
 * ShellGround Terminal Dark Theme Configuration
 * Aligned with tokens in src/styles/tokens.css
 */

import { SHELLGROUND_DARK_THEME, type TerminalTheme } from '../terminal.types';

export const terminalDarkTheme: TerminalTheme = SHELLGROUND_DARK_THEME;

export const TERMINAL_FONT_FAMILY =
  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace';

export const DEFAULT_TERMINAL_CONFIG = {
  fontSize: 14,
  fontFamily: TERMINAL_FONT_FAMILY,
  lineHeight: 1.25,
  cursorBlink: true,
  cursorStyle: 'block' as const,
  scrollback: 5000,
  theme: terminalDarkTheme,
};
