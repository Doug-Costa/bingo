import { StyleSheet } from 'react-native';

export const Typography = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.1,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodyBold: {
    fontSize: 14,
    fontWeight: '700',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  },
  captionBold: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  number: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  numberLarge: {
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: -1,
  },
});

export default Typography;
