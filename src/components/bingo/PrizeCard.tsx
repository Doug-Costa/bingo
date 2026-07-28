import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useBingoStore } from '../../store/useBingoStore';
import { Trophy, Coins, Star } from 'lucide-react-native';
import { formatCurrency } from '../../utils/formatCurrency';

export const PrizeCard: React.FC = () => {
  const { prizes } = useBingoStore();

  return (
    <View style={styles.container}>
      {/* Decorative background glow circle */}
      <View style={styles.bgGlow} />

      <View style={styles.leftSection}>
        {/* Large Trophy Icon Container */}
        <View style={styles.trophyBox}>
          <Trophy size={26} color="#FFD700" />
        </View>

        {/* Prize titles */}
        <View style={styles.titleContainer}>
          <View style={styles.subTitleRow}>
            <Star size={10} color="#FFD700" style={styles.starIcon} />
            <Text style={styles.subTitleText}>Premiação da Rodada</Text>
          </View>
          <Text style={styles.mainTitleText}>Prêmios Especiais</Text>
        </View>
      </View>

      {/* Prize Values */}
      <View style={styles.rightSection}>
        {/* Prize: Linha */}
        <View style={styles.prizeBlock}>
          <Text style={styles.prizeLabel}>Prêmio Linha</Text>
          <Text style={styles.prizeValue}>{formatCurrency(prizes.line)}</Text>
        </View>

        {/* Vertical Separator */}
        <View style={styles.separator} />

        {/* Prize: Cartela Cheia / Bingo */}
        <View style={styles.prizeBlock}>
          <View style={styles.bingoLabelRow}>
            <Coins size={10} color="#FFD700" style={styles.coinsIcon} />
            <Text style={styles.bingoLabelText}>Bingo Cheio</Text>
          </View>
          <Text style={styles.bingoValue}>{formatCurrency(prizes.full)}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 68,
    backgroundColor: '#0c0c0e',
    borderColor: 'rgba(255, 215, 0, 0.25)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  bgGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 215, 0, 0.04)',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trophyBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 215, 0, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    marginLeft: 10,
  },
  subTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starIcon: {
    marginRight: 4,
  },
  subTitleText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FFD700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  mainTitleText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#f4f4f5',
    marginTop: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  prizeBlock: {
    alignItems: 'flex-end',
  },
  prizeLabel: {
    fontSize: 8,
    color: '#a1a1aa',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  prizeValue: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    marginTop: 1,
  },
  separator: {
    width: 1,
    height: 28,
    backgroundColor: '#27272a',
    marginHorizontal: 15,
  },
  bingoLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  coinsIcon: {
    marginRight: 4,
  },
  bingoLabelText: {
    fontSize: 8,
    color: '#FFD700',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  bingoValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFD700',
    marginTop: 1,
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
});
