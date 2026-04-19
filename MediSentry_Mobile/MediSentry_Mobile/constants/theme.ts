import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const Colors = {
  primary: '#560777', // Brand Purple
  primaryLight: '#996CAC',
  primaryDark: '#14001D',
  accent: '#28005C',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#1A1A1A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  white: '#FFFFFF',
  placeholder: '#94A3B8',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

export const Sizes = {
  radius: 12,
  radiusMd: 16,
  radiusFull: 30, // For "Oval" / Capsule shapes
  buttonHeight: 54,
  inputHeight: 54,
  width,
  height,
};

export const Shadow = {
  light: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  heavy: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 12,
  },
};
