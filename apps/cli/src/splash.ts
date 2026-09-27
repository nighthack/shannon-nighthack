/**
 * Splash screen display — pure terminal output, no npm dependencies.
 * Color escapes are gated on terminal support; the Unicode art is always kept.
 */

import { supportsColor } from './tty.js';

/** Product wordmark rendered in every interactive terminal. */
const WORDMARK = ['shannon-nighthack'];

/**
 * Sunset palette for the product wordmark. Text uses the deeper edge shade;
 * the fill shade remains available if block glyphs are added later.
 * `xterm` is the 256-color approximation for terminals without 24-bit color.
 */
const SUNSET: ReadonlyArray<{ rgb: readonly [number, number, number]; xterm: number }> = [
  { rgb: [247, 203, 45], xterm: 220 },
  { rgb: [246, 182, 38], xterm: 220 },
  { rgb: [245, 160, 32], xterm: 214 },
  { rgb: [242, 141, 28], xterm: 214 },
  { rgb: [238, 121, 24], xterm: 208 },
  { rgb: [231, 100, 21], xterm: 208 },
  { rgb: [222, 82, 19], xterm: 202 },
];

export function displaySplash(version?: string): void {
  const color = supportsColor();
  const truecolor = color && /truecolor|24bit/i.test(process.env.COLORTERM ?? '');
  const RESET = color ? '\x1b[0m' : '';
  const WHITE = color ? '\x1b[1;97m' : '';
  const GRAY = color ? '\x1b[0;37m' : '';
  const DIM = color ? '\x1b[90m' : '';

  const ramp = SUNSET.map(({ rgb: [r, g, b], xterm }) => {
    if (!color) return '';
    return truecolor ? `\x1b[38;2;${r};${g};${b}m` : `\x1b[38;5;${xterm}m`;
  });

  /** Color one wordmark row, emitting an escape only where the run changes. Spaces stay unpainted. */
  const paint = (row: string, fill: string, edge: string): string => {
    if (!color) return row;
    let out = '';
    let open = '';
    for (const ch of row) {
      const want = ch === ' ' ? '' : ch === '█' ? fill : edge;
      if (want !== open) {
        if (open) out += RESET;
        out += want;
        open = want;
      }
      out += ch;
    }
    return open ? out + RESET : out;
  };

  const lines = [
    '',
    `  ${WHITE}Keygraph${RESET}${version ? `  ${DIM}v${version}${RESET}` : ''}`,
    '',
    ...WORDMARK.map((row, i) => `  ${paint(row, ramp[i] ?? '', ramp[i + 1] ?? '')}`),
    '',
    `  ${WHITE}AI Pentester for Web Apps and APIs${RESET}`,
    '',
    `  ${GRAY}-Authorized Security Testing Only-${RESET}`,
    '',
  ];

  console.log(lines.join('\n'));
}

/** Matches the divider width the CI wrappers and the scan renderer already use. */
const RULE_WIDTH = 60;

/**
 * Plain-text banner for non-terminal output (CI logs, pipes, redirects).
 * Drops the wordmark but keeps the authorized-use notice, which a reader of
 * someone else's pipeline log still needs to see.
 */
export function displayPlainBanner(version?: string): void {
  const rule = '─'.repeat(RULE_WIDTH);
  console.log(rule);
  console.log(version ? ` shannon-nighthack v${version}` : ' shannon-nighthack');
  console.log(' AI Pentester for Web Apps and APIs, by Keygraph');
  console.log(' Authorized security testing only.');
  console.log(rule);
}
