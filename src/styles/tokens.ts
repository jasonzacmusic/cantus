export const colors = {
  paper: '#F6F1E7',
  paperD: '#EDE5D0',
  ink: '#1F1E2E',
  ink2: '#524768',
  teal: '#2D5E6B',
  spice: '#C64B3B',
  spiceBg: 'rgba(198, 75, 59, 0.08)',
  gold: '#B88A2E',
  goldBg: 'rgba(184, 138, 46, 0.10)',
  muted: '#8D846F',
  line: 'rgba(31, 30, 46, 0.12)',
} as const;

export const fontDisplay = '"Fraunces", "Playfair Display", Georgia, serif';
export const fontUI = '"Geist", "Inter Tight", system-ui, sans-serif';
export const fontMono = '"JetBrains Mono", "IBM Plex Mono", ui-monospace, monospace';

export type Colors = typeof colors;
