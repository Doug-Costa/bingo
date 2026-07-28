/**
 * themes.ts — Mapeamento dos temas da TV para React Native
 *
 * Tema01: Dourado/Ouro — "Bingo do Tio Patinhas" (clássico)
 * Tema02: Âmbar/Neon Bar — "Bar Premium Neon"
 * Tema03: Azul Marinho/Amarelo — "Bingo PUB & Bar"
 */
import { StyleSheet } from 'react-native';

// ─── Token types ───────────────────────────────────────────────────────────────
export interface ThemeTokens {
  // Backgrounds
  bgColor: string;
  panelBg: string;
  headerBg: string;
  glassBg: string;

  // Colors
  primary: string;
  primaryGlow: string;
  secondary: string;
  accent: string;
  jackpotText: string;

  // Balls
  ballBg: string;
  ballText: string;

  // Countdown
  countdownBg: string;
  countdownText: string;

  // Borders
  borderPrimary: string;
  borderSecondary: string;
  borderMuted: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;

  // Status
  success: string;
  error: string;

  // Grid
  gridDrawn: string;
  gridCurrent: string;
  gridEmpty: string;
}

// ─── Tema 01 — Ouro / Bingo Clássico ─────────────────────────────────────────
export const tema01: ThemeTokens = {
  bgColor:         '#1a0f00',
  panelBg:         'rgba(0,0,0,0.5)',
  headerBg:        'rgba(0,0,0,0.4)',
  glassBg:         'rgba(0,0,0,0.35)',

  primary:         '#eab308',
  primaryGlow:     'rgba(234,179,8,0.8)',
  secondary:       '#10b981',
  accent:          '#fde047',
  jackpotText:     '#34d399',

  ballBg:          '#facc15',
  ballText:        '#000000',

  countdownBg:     'rgba(0,0,0,0.7)',
  countdownText:   '#facc15',

  borderPrimary:   '#ca8a04',
  borderSecondary: 'rgba(255,255,255,0.1)',
  borderMuted:     'rgba(255,255,255,0.05)',

  textPrimary:     '#ffffff',
  textSecondary:   '#94a3b8',
  textMuted:       '#475569',

  success:         '#10b981',
  error:           '#ef4444',

  gridDrawn:       '#10b981',
  gridCurrent:     '#facc15',
  gridEmpty:       'rgba(0,0,0,0.4)',
};

// ─── Tema 02 — Âmbar / Bar Premium Neon ──────────────────────────────────────
export const tema02: ThemeTokens = {
  bgColor:         '#09090b',
  panelBg:         'rgba(0,0,0,0.5)',
  headerBg:        'rgba(0,0,0,0.3)',
  glassBg:         'rgba(0,0,0,0.3)',

  primary:         '#fbbf24',
  primaryGlow:     'rgba(251,191,36,0.6)',
  secondary:       '#10b981',
  accent:          '#f97316',
  jackpotText:     '#34d399',

  ballBg:          '#fbbf24',
  ballText:        '#000000',

  countdownBg:     '#0a0f4f',
  countdownText:   '#fbbf24',

  borderPrimary:   '#fbbf24',
  borderSecondary: 'rgba(255,255,255,0.1)',
  borderMuted:     'rgba(255,255,255,0.05)',

  textPrimary:     '#ffffff',
  textSecondary:   '#a1a1aa',
  textMuted:       '#71717a',

  success:         '#10b981',
  error:           '#ef4444',

  gridDrawn:       '#10b981',
  gridCurrent:     '#fbbf24',
  gridEmpty:       'rgba(0,0,0,0.5)',
};

// ─── Tema 03 — Azul/Amarelo Neon (Bingo PUB & Bar) ───────────────────────────
export const tema03: ThemeTokens = {
  bgColor:         '#040826',
  panelBg:         '#0b1575',
  headerBg:        '#0a1140',
  glassBg:         'rgba(11,21,117,0.9)',

  primary:         '#ffde38',
  primaryGlow:     'rgba(255,222,56,0.6)',
  secondary:       '#00d54f',
  accent:          '#7ea0ff',
  jackpotText:     '#00d54f',

  ballBg:          '#ffdf38',
  ballText:        '#040826',

  countdownBg:     '#0a0f4f',
  countdownText:   '#ffef49',

  borderPrimary:   '#ffde38',
  borderSecondary: '#4868ff',
  borderMuted:     'rgba(72,104,255,0.4)',

  textPrimary:     '#ffffff',
  textSecondary:   '#95afff',
  textMuted:       '#4868ff',

  success:         '#00d54f',
  error:           '#ff1f1f',

  gridDrawn:       '#00d54f',
  gridCurrent:     '#ffde38',
  gridEmpty:       'rgba(10,15,79,0.8)',
};

// ─── Resolver chave do tema ────────────────────────────────────────────────────
export function getThemeKey(themeInput?: any): 'tema01' | 'tema02' | 'tema03' {
  if (!themeInput) return 'tema03';
  let str = '';
  if (typeof themeInput === 'string') {
    str = themeInput;
  } else if (typeof themeInput === 'object') {
    str = themeInput.name || themeInput.type || themeInput.id || themeInput.theme || '';
  }
  str = String(str).toLowerCase().replace(/[^a-z0-9]/g, '');

  if (
    str.includes('01') ||
    str.includes('tema01') ||
    str.includes('gold') ||
    str.includes('ouro')
  ) {
    return 'tema01';
  }
  if (
    str.includes('02') ||
    str.includes('tema02') ||
    str.includes('neon') ||
    str.includes('bar') ||
    str.includes('amber')
  ) {
    return 'tema02';
  }
  return 'tema03';
}

// ─── Resolver tema pelo nome ou objeto ─────────────────────────────────────────
export function resolveTheme(themeInput?: any): ThemeTokens {
  const key = getThemeKey(themeInput);
  switch (key) {
    case 'tema01': return tema01;
    case 'tema02': return tema02;
    case 'tema03':
    default:       return tema03;
  }
}

// ─── Gradient helpers ──────────────────────────────────────────────────────────
export const TEMA_GRADIENTS = {
  tema01: {
    bg:      ['#1a0f00', '#0d0800'],
    ball:    ['#fef08a', '#facc15', '#ca8a04'],
    prize1:  ['#ca8a04', '#854d0e'],
    prize2:  ['#b45309', '#78350f'],
    prize3:  ['#92400e', '#451a03'],
    header:  ['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.2)'],
  },
  tema02: {
    bg:      ['#09090b', '#0f0f11'],
    ball:    ['#fde047', '#fbbf24', '#d97706'],
    prize1:  ['#fbbf24', '#ea580c'],
    prize2:  ['#f97316', '#dc2626'],
    prize3:  ['#dc2626', '#991b1b'],
    header:  ['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.1)'],
  },
  tema03: {
    bg:      ['#040826', '#0b1140'],
    ball:    ['#ffef49', '#ffde38', '#d38908'],
    prize1:  ['#1333f0', '#001bcb'],
    prize2:  ['#0b1575', '#0a0f4f'],
    prize3:  ['#0a0f4f', '#040826'],
    header:  ['#0a1140', '#08145c'],
  },
} as const;

// ─── Alpha Color Helper ────────────────────────────────────────────────────────
export function alphaColor(color: string | undefined | null, alphaHex: string = 'ff'): string {
  if (!color) return '#ffffff';
  let c = String(color).trim();
  if (c.startsWith('#')) {
    if (c.length === 4) {
      const r = c[1], g = c[2], b = c[3];
      c = `#${r}${r}${g}${g}${b}${b}`;
    }
    if (c.length === 7) {
      return `${c}${alphaHex}`;
    }
  }
  return c;
}

