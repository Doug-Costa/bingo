import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { useBingoStore } from '../../store/useBingoStore';

export const NumberGrid: React.FC = () => {
  const { ballsDrawn, currentBall } = useBingoStore();

  // Animation for pulsing current ball
  const pulseAnim = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (currentBall !== null) {
      animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: false, // Color/border animations do not support native driver in RN
          }),
          Animated.timing(pulseAnim, {
            toValue: 0.4,
            duration: 800,
            useNativeDriver: false,
          }),
        ])
      );
      animation.start();
    } else {
      pulseAnim.setValue(0.4);
    }

    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [currentBall, pulseAnim]);

  const rows = [
    { letter: 'B', range: [1, 15], color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.2)' },
    { letter: 'I', range: [16, 30], color: '#ec4899', borderColor: 'rgba(236, 72, 153, 0.2)' },
    { letter: 'N', range: [31, 45], color: '#a855f7', borderColor: 'rgba(168, 85, 247, 0.2)' },
    { letter: 'G', range: [46, 60], color: '#00FF7F', borderColor: 'rgba(0, 255, 127, 0.2)' },
    { letter: 'O', range: [61, 75], color: '#FFD700', borderColor: 'rgba(255, 215, 0, 0.2)' },
  ];

  return (
    <View style={styles.container}>
      {rows.map((row) => {
        const numbers = [];
        for (let i = row.range[0]; i <= row.range[1]; i++) {
          numbers.push(i);
        }

        return (
          <View key={row.letter} style={styles.row}>
            {/* Letter Indicator */}
            <View style={[styles.letterBox, { borderColor: row.borderColor }]}>
              <Text style={[styles.letterText, { color: row.color }]}>
                {row.letter}
              </Text>
            </View>

            {/* Numbers Row */}
            <View style={styles.numbersContainer}>
              {numbers.map((num) => {
                const isDrawn = ballsDrawn.includes(num);
                const isCurrent = currentBall === num;

                if (isCurrent) {
                  return (
                    <Animated.View
                      key={num}
                      style={[
                        styles.cell,
                        styles.currentCell,
                        {
                          borderColor: pulseAnim.interpolate({
                            inputRange: [0.4, 1],
                            outputRange: ['rgba(255, 215, 0, 0.3)', 'rgba(255, 215, 0, 1)'],
                          }),
                          backgroundColor: pulseAnim.interpolate({
                            inputRange: [0.4, 1],
                            outputRange: ['rgba(255, 215, 0, 0.05)', 'rgba(255, 215, 0, 0.25)'],
                          }),
                        },
                      ]}
                    >
                      <Text style={[styles.cellText, styles.currentCellText]}>
                        {num.toString().padStart(2, '0')}
                      </Text>
                    </Animated.View>
                  );
                }

                return (
                  <View
                    key={num}
                    style={[
                      styles.cell,
                      isDrawn ? styles.drawnCell : styles.undrawnCell,
                    ]}
                  >
                    <Text
                      style={[
                        styles.cellText,
                        isDrawn ? styles.drawnCellText : styles.undrawnCellText,
                      ]}
                    >
                      {num.toString().padStart(2, '0')}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(9, 9, 11, 0.4)',
    borderColor: 'rgba(24, 24, 27, 0.5)',
    borderWidth: 1,
    padding: 10,
    borderRadius: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    width: '100%',
  },
  letterBox: {
    width: 44,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#09090b',
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 3,
    elevation: 2,
  },
  letterText: {
    fontSize: 18,
    fontWeight: '900',
  },
  numbersContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cell: {
    flex: 1,
    height: 38,
    marginHorizontal: 2.5,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  cellText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  undrawnCell: {
    backgroundColor: 'rgba(24, 24, 27, 0.2)',
    borderColor: '#18181b',
  },
  undrawnCellText: {
    color: '#3f3f46',
    opacity: 0.5,
  },
  drawnCell: {
    backgroundColor: 'rgba(0, 255, 127, 0.04)',
    borderColor: 'rgba(0, 255, 127, 0.5)',
  },
  drawnCellText: {
    color: '#00FF7F',
    textShadowColor: 'rgba(0, 255, 127, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  currentCell: {
    borderWidth: 1.5,
  },
  currentCellText: {
    color: '#FFD700',
    fontWeight: '900',
    textShadowColor: 'rgba(255, 215, 0, 0.4)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 8,
  },
});
