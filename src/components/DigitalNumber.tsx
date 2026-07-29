/**
 * DigitalNumber.tsx — Dígito estilo display LCD/digital para React Native
 * Equivalente ao DigitalNumber do Next
 */
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ThemeTokens } from '../theme/themes';

interface DigitalNumberProps {
  value: string;
  theme: ThemeTokens;
  size?: number;
}

const DigitalNumber: React.FC<DigitalNumberProps> = ({ value, theme, size = 64 }) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: size * 0.75,
          height: size,
          borderRadius: size * 0.18,
          backgroundColor: theme.countdownBg,
          borderColor: theme.borderPrimary,
          shadowColor: theme.primaryGlow,
        },
      ]}
    >
      <Text style={[styles.digit, { fontSize: size * 0.75, color: theme.countdownText }]}>
        {value}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 4,
  },
  digit: {
    fontFamily: 'monospace',
    fontWeight: '900',
    includeFontPadding: false,
    textAlignVertical: 'center',
    lineHeight: undefined,
  },
});

export default DigitalNumber;
