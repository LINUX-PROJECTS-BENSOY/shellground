/**
 * Terminal Subsystem Type Definitions
 * Specified in Section 18-20 of FULL_ARCHITECTURE.md
 */

export interface TerminalTheme {
  readonly background: string;
  readonly foreground: string;
  readonly cursor: string;
  readonly cursorAccent?: string;
  readonly selectionBackground: string;
  readonly selectionForeground?: string;
  readonly black: string;
  readonly red: string;
  readonly green: string;
  readonly yellow: string;
  readonly blue: string;
  readonly magenta: string;
  readonly cyan: string;
  readonly white: string;
  readonly brightBlack: string;
  readonly brightRed: string;
  readonly brightGreen: string;
  readonly brightYellow: string;
  readonly brightBlue: string;
  readonly brightMagenta: string;
  readonly brightCyan: string;
  readonly brightWhite: string;
}

export const SHELLGROUND_DARK_THEME: TerminalTheme = {
  background: '#090d13',
  foreground: '#e6edf3',
  cursor: '#58a6ff',
  cursorAccent: '#090d13',
  selectionBackground: 'rgba(56, 139, 253, 0.35)',
  selectionForeground: '#ffffff',
  black: '#484f58',
  red: '#ff7b72',
  green: '#3fb950',
  yellow: '#d29922',
  blue: '#58a6ff',
  magenta: '#bc8cff',
  cyan: '#39c5cf',
  white: '#b1bac4',
  brightBlack: '#6e7681',
  brightRed: '#ffa198',
  brightGreen: '#56d364',
  brightYellow: '#e3b341',
  brightBlue: '#79c0ff',
  brightMagenta: '#d2a8ff',
  brightCyan: '#56d4dd',
  brightWhite: '#f0f6fc',
};

export interface TerminalDimensions {
  readonly cols: number;
  readonly rows: number;
}

export interface TerminalProcessPort {
  writeInput(data: string): void;
  onOutput(callback: (data: string) => void): () => void;
  onError?(callback: (error: string) => void): () => void;
  resize?(cols: number, rows: number): void;
}

export interface TerminalControllerOptions {
  readonly theme?: Partial<TerminalTheme>;
  readonly fontSize?: number;
  readonly fontFamily?: string;
  readonly lineHeight?: number;
  readonly cursorBlink?: boolean;
  readonly cursorStyle?: 'block' | 'underline' | 'bar';
  readonly scrollback?: number;
  readonly disableStdin?: boolean;
  readonly enableWebgl?: boolean;
  readonly onInterrupt?: () => void;
  readonly onClear?: () => void;
}

export interface ITerminalController {
  readonly isMounted: boolean;
  readonly dimensions: TerminalDimensions;
  mount(element: HTMLElement): void;
  write(data: string | Uint8Array): void;
  writeln(data: string): void;
  clear(): void;
  focus(): void;
  blur(): void;
  fit(): void;
  resize(cols: number, rows: number): void;
  onData(callback: (data: string) => void): () => void;
  onResize(callback: (dims: TerminalDimensions) => void): () => void;
  connect(processPort: TerminalProcessPort): () => void;
  dispose(): void;
}
