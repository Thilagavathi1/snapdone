/**
 * SnapDone Design Tokens
 * Extracted directly from the SnapDone Style Guide (Screen 3)
 */

export const colors = {
  // Primary (Lavender / Purple accent)
  primary: '#7C6CFF',
  primaryDark: '#5643CC',
  primaryDeep: '#1E1035',
  primaryLight: '#9F92FF',
  primarySoft: '#C4B5FD',
  primaryMuted: 'rgba(124, 108, 255, 0.16)',
  primaryMutedBorder: 'rgba(124, 108, 255, 0.32)',
  primaryButtonText: '#FFFFFF',
  primaryContainer: '#D7CEFF',
  onPrimaryContainer: '#2A1B6B',

  // Secondary (Mint / Emerald Green - On-device AI, Success, Offline)
  secondary: '#34D399',
  secondaryDark: '#059669',
  secondaryDeep: '#064E3B',
  secondaryLight: '#6EE7B7',
  secondaryMuted: 'rgba(52, 211, 153, 0.14)',
  secondaryMutedBorder: 'rgba(52, 211, 153, 0.28)',

  // Tertiary (Amber / Warm Yellow - Needs Review, Conflicts, Alerts)
  tertiary: '#FBBF24',
  tertiaryDark: '#D97706',
  tertiaryDeep: '#78350F',
  tertiaryLight: '#FDE68A',
  tertiaryMuted: 'rgba(251, 191, 36, 0.14)',
  tertiaryMutedBorder: 'rgba(251, 191, 36, 0.32)',

  // Neutral (Dark Slate / Charcoal Navy)
  neutralBackground: '#101318',
  neutralSurface: '#171B23',
  neutralSurfaceElevated: '#1D222E',
  neutralSurfaceActive: '#232938',
  neutralSurfaceInput: '#12151D',
  
  // Borders
  borderSubtle: '#1F2432',
  borderDefault: '#262D3D',
  borderBright: '#374154',

  // Typography
  textPrimary: '#FFFFFF',
  textSecondary: '#A3AAB8',
  textMuted: '#64748B',
  textDark: '#0F172A',

  // Accent / Alerts
  danger: '#F87171',
  dangerMuted: 'rgba(248, 113, 113, 0.14)',
  info: '#60A5FA',
  infoMuted: 'rgba(96, 165, 250, 0.14)',
};

export const layout = {
  screenPadding: 16,
  cardGap: 12,
  cardRadius: 20,
  minTouchTarget: 44,
};

// Inter, loaded in src/app/_layout.tsx. Use these instead of fontWeight so
// Android picks the right weight file.
export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  bold: 'Inter_700Bold',
  extrabold: 'Inter_800ExtraBold',
};
