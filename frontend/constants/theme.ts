/**
 * CrickMate Color Palette
 * Dark theme with sport green and neon accents
 */

import { Platform } from 'react-native';

const tintColorLight = '#2E7D32';
const tintColorDark = '#00E676';

export const Colors = {
  // Main Colors
  darkBackground: '#121212',
  darkSecondary: '#1F1F1F',
  sportGreen: '#2E7D32',
  neonGreen: '#00E676',
  neonYellow: '#FFEA00',
  white: '#FFFFFF',
  
  // Additional UI Colors
  textPrimary: '#FFFFFF',
  textSecondary: '#B0B0B0',
  error: '#FF5252',
  success: '#00E676',
  warning: '#FFEA00',
  
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#121212',
    secondary: '#1F1F1F',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    sportGreen: '#2E7D32',
    neonGreen: '#00E676',
    accent: '#FFEA00',
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
