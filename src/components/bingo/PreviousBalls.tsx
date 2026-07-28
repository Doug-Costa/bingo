import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useBingoStore } from '../../store/useBingoStore';
import { BingoBall } from './BingoBall';

export const PreviousBalls: React.FC = () => {
  const { ballsDrawn } = useBingoStore();

  // Get up to 5 balls drawn BEFORE the current ball (most recent first)
  const previousList = ballsDrawn.slice(0, -1).slice(-5).reverse();

  // Make sure we always show 5 placeholders if we don't have enough balls
  const displaySlots = [...previousList];
  while (displaySlots.length < 5) {
    displaySlots.push(-1); // placeholder value
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Histórico Recente</Text>
      <View style={styles.list}>
        {displaySlots.map((num, index) => {
          if (num === -1) {
            // Placeholder empty slot
            return (
              <View key={`empty-${index}`} style={styles.placeholderCell}>
                <Text style={styles.placeholderText}>-</Text>
              </View>
            );
          }

          return <BingoBall key={`prev-${num}`} number={num} size={48} />;
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(5, 5, 5, 0.6)',
    borderColor: 'rgba(46, 48, 58, 0.4)',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 9,
    color: '#6b7280',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2.5,
    marginBottom: 8,
  },
  list: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  placeholderCell: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#27272a',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27272a',
  },
});
