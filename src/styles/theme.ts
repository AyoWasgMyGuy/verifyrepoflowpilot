export const theme = {
  colors: {
    bg: '#102222',
    surface: '#1C2E2E',
    surfaceAlt: '#253636',
    text: '#E7F5F5',
    textMuted: '#9DB9B9',
    border: '#2E4A4A',
    primary: '#13ECEC',
    accent: '#8B5CF6',
    success: '#3CCB8E',
    warning: '#F6C356',
    danger: '#E06A6A',
    info: '#5CA9FF',
  },
  spacing: {
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 32,
  },
  radius: {
    sm: 8,
    md: 12,
    lg: 20,
    pill: 999,
  },
  text: {
    title: 28,
    headline: 22,
    body: 16,
    small: 13,
  },
  fonts: {
    display: 'Inter_600SemiBold',
    body: 'Inter_400Regular',
  },
};

export type Theme = typeof theme;
