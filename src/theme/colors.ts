/** Shared across both themes. */
const brand = {
  primary: '#2F6BFF',
  primaryDark: '#1E54E6',
  hero1: '#1F5BFF',
  hero2: '#4C8DFF',
  success: '#22C55E',
  streak: '#FF8A00',
  danger: '#FF3B30',
  ai: '#8B5CF6',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorTokens = {
  [K in
    | keyof typeof brand
    | 'background'
    | 'screen'
    | 'surface'
    | 'tile'
    | 'border'
    | 'primarySoft'
    | 'primaryLine'
    | 'text'
    | 'textBody'
    | 'textMuted'
    | 'iconLine'
    | 'iconMuted'
    | 'streakSoft'
    | 'streakLine'
    | 'successSoft'
    | 'successLine'
    | 'overlay']: string;
};

export type ColorToken = keyof ColorTokens;

export const lightColors: ColorTokens = {
  ...brand,
  background: '#F2F2F4',
  screen: '#FAFAFB',
  surface: '#FFFFFF',
  tile: '#F5F6F8',
  border: '#ECEDF0',
  primarySoft: '#EAF1FF',
  primaryLine: '#C7DAFF',
  text: '#1C1C1E',
  textBody: '#3A3A3C',
  textMuted: '#8E8E93',
  iconLine: '#7C7C82',
  iconMuted: '#A1A1A6',
  streakSoft: '#FFF3E5',
  streakLine: '#FFD9AD',
  successSoft: '#EAFBF0',
  successLine: '#BDEFCF',
  overlay: 'rgba(10,12,20,0.28)',
};

export const darkColors: ColorTokens = {
  ...brand,
  background: '#0B0C0F',
  screen: '#0F1114',
  surface: '#16181C',
  tile: '#1C1F24',
  border: '#25282E',
  primarySoft: '#16234A',
  primaryLine: '#2A3F7A',
  text: '#F5F5F7',
  textBody: '#D1D1D6',
  textMuted: '#8E8E93',
  iconLine: '#A1A1A6',
  iconMuted: '#6E6E73',
  streakSoft: '#3A2408',
  streakLine: '#6B4310',
  successSoft: '#0D2A18',
  successLine: '#1D5A33',
  overlay: 'rgba(0,0,0,0.5)',
};
