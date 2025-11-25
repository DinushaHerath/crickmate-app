/**
 * CrickMate Color Palette - Coffee Shop Inspired
 * Warm orange tones with green accents
 */

import { Platform } from 'react-native';

const primaryOrange = '#E65100';
const sportOrange = '#FF9800';
const softOrange = '#FFE0B2';
const accentGreen = '#1B5E20';
const white = '#FFFFFF';

export const Colors = {
  // Main Colors
  primary: primaryOrange,
  secondary: sportOrange,
  tertiary: softOrange,
  accent: accentGreen,
  white: white,
  
  // Additional UI Colors
  background: '#FFFFFF',
  cardBackground: '#FFF3E0',
  textPrimary: '#212121',
  textSecondary: '#757575',
  textLight: '#BDBDBD',
  border: '#E0E0E0',
  error: '#D32F2F',
  success: accentGreen,
  warning: sportOrange,
  
  light: {
    text: '#212121',
    background: '#FFFFFF',
    card: '#FFF3E0',
    tint: primaryOrange,
    icon: '#757575',
    tabIconDefault: '#BDBDBD',
    tabIconSelected: primaryOrange,
  },
  dark: {
    text: '#FFFFFF',
    background: '#1A1A1A',
    secondary: '#2A2A2A',
    card: '#2A2A2A',
    tint: sportOrange,
    icon: '#BDBDBD',
    tabIconDefault: '#757575',
    tabIconSelected: sportOrange,
    accent: accentGreen,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
