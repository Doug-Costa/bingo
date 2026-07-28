import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useBingoStore } from '../../store/useBingoStore';
import { BingoBall, getBingoLetter } from './BingoBall';

export const GiantBall: React.FC = () => {
  const { currentBall } = useBingoStore();

  const letter = currentBall ? getBingoLetter(currentBall) : '';

  // Get glow colors based on ball letter
  const getGlowColor = (letter: string) => {
    switch (letter) {
      case 'G':
        return '#00FF7F'; // Neon green
      case 'O':
        return '#FFD700'; // Neon gold
      case 'B':
        return '#3b82f6'; // Blue
      case 'I':
        return '#ec4899'; // Pink
      case 'N':
        return '#a855f7'; // Purple
      default:
        return '#4b5563'; // Grey
    }
  };

  const glowColor = currentBall ? getGlowColor(letter) : '#2e303a';

  return (
    <View style={styles.container}>
      <View style={styles.ballWrapper}>
        {/* Glow backdrop ring */}
        <View
          style={[
            styles.glowRing,
            {
              shadowColor: glowColor,
              shadowOpacity: currentBall ? 0.7 : 0.2,
              shadowRadius: currentBall ? 40 : 15,
              borderColor: currentBall ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
              backgroundColor: currentBall ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.4)',
            },
          ]}
        >
          {currentBall ? (
            <BingoBall number={currentBall} size={270} />
          ) : (
            <View style={styles.placeholder}>
              {/* Gloss Highlight for the placeholder ball */}
              <View style={styles.placeholderGloss} />
              <Text style={styles.placeholderTitle}>Aguardando</Text>
              <Text style={styles.placeholderQuestion}>?</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  ballWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    width: 300,
    height: 300,
  },
  glowRing: {
    width: 280,
    height: 280,
    borderRadius: 140,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    // iOS shadow
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  },
  placeholder: {
    width: 270,
    height: 270,
    borderRadius: 135,
    backgroundColor: '#1b1b1f',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2e303a',
    overflow: 'hidden',
    position: 'relative',
  },
  placeholderGloss: {
    position: 'absolute',
    top: 20,
    left: 30,
    width: 120,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    transform: [{ rotate: '-15deg' }],
  },
  placeholderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#6b7280',
  },
  placeholderQuestion: {
    fontSize: 85,
    fontWeight: '900',
    color: '#374151',
    marginTop: -8,
  },
});
