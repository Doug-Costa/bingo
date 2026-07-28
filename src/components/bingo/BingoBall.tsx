import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export function getBingoLetter(num: number): string {
  if (num >= 1 && num <= 15) return 'B';
  if (num >= 16 && num <= 30) return 'I';
  if (num >= 31 && num <= 45) return 'N';
  if (num >= 46 && num <= 60) return 'G';
  if (num >= 61 && num <= 75) return 'O';
  return '';
}

export function getBallGradients(letter: string): readonly [string, string, ...string[]] {
  switch (letter) {
    case 'B':
      return ['#5ebcff', '#0059b3', '#002d80'];
    case 'I':
      return ['#ff7dc3', '#b30059', '#660033'];
    case 'N':
      return ['#c084fc', '#7e22ce', '#4c1d95'];
    case 'G':
      return ['#2eff94', '#00994d', '#004d26'];
    case 'O':
      return ['#fff176', '#d4af37', '#8c6d0d'];
    default:
      return ['#2a2a35', '#15151a', '#0a0a0c'];
  }
}

export function getBallTextColor(letter: string): string {
  if (letter === 'G' || letter === 'O') {
    return '#121214'; // Dark text for bright balls
  }
  return '#ffffff'; // White text for darker balls
}

interface BingoBallProps {
  number: number;
  size?: number;
}

export const BingoBall: React.FC<BingoBallProps> = ({ number, size = 60 }) => {
  const letter = getBingoLetter(number);
  const gradients = getBallGradients(letter);
  const textColor = getBallTextColor(letter);

  // Scale internal metrics with size
  const letterSize = size * 0.15;
  const numberSize = size * 0.43;
  const paddingOffset = size * 0.02;

  return (
    <View style={[styles.outerContainer, { width: size, height: size }]}>
      <LinearGradient
        colors={gradients}
        start={{ x: 0.3, y: 0.2 }}
        end={{ x: 0.9, y: 0.9 }}
        style={[styles.ball, { borderRadius: size / 2 }]}
      >
        {/* Top-left Gloss Highlight (gives the 3D sphere illusion) */}
        <View
          style={[
            styles.glossHighlight,
            {
              top: size * 0.08,
              left: size * 0.12,
              width: size * 0.45,
              height: size * 0.2,
              borderRadius: size * 0.1,
            },
          ]}
        />

        {/* Bottom-right Inner Shadow Overlay */}
        <View
          style={[
            styles.shadowOverlay,
            {
              bottom: size * 0.05,
              right: size * 0.05,
              width: size * 0.6,
              height: size * 0.6,
              borderRadius: size * 0.3,
            },
          ]}
        />

        {/* Content */}
        <View style={[styles.content, { paddingBottom: paddingOffset }]}>
          <Text style={[styles.letter, { fontSize: letterSize, color: textColor }]}>
            {letter}
          </Text>
          <Text style={[styles.number, { fontSize: numberSize, color: textColor }]}>
            {number.toString().padStart(2, '0')}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  ball: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  glossHighlight: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 255, 255, 0.28)',
    transform: [{ rotate: '-15deg' }],
  },
  shadowOverlay: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  letter: {
    fontWeight: '900',
    letterSpacing: 1,
    opacity: 0.85,
    textTransform: 'uppercase',
  },
  number: {
    fontWeight: '900',
  },
});
