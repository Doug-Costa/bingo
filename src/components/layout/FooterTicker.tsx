import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Dimensions } from 'react-native';
import { useBingoStore } from '../../store/useBingoStore';
import { Trophy, Gift, Award } from 'lucide-react-native';
import { formatCurrency } from '../../utils/formatCurrency';

export const FooterTicker: React.FC = () => {
  const { winners } = useBingoStore();
  const [contentWidth, setContentWidth] = useState<number>(0);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Duplicate items 3 times for a continuous loop
  const tickerItems = [...winners, ...winners, ...winners];

  useEffect(() => {
    if (contentWidth === 0) return;

    // Reset scrollX
    scrollX.setValue(0);

    // We want to scroll exactly 1/3 of the total content width
    const travelDistance = contentWidth / 3;

    const marqueeAnimation = Animated.loop(
      Animated.timing(scrollX, {
        toValue: -travelDistance,
        duration: 20000, // 20 seconds loop duration
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    marqueeAnimation.start();

    return () => marqueeAnimation.stop();
  }, [contentWidth, scrollX]);

  return (
    <View style={styles.footer}>
      {/* Fixed Title Label */}
      <View style={styles.titleLabel}>
        <Award size={18} color="#FFD700" style={styles.bounceIcon} />
        <Text style={styles.titleText}>Últimos Ganhadores</Text>
      </View>

      {/* Scrolling Container */}
      <View style={styles.scrollerContainer}>
        {/* Animated Marquee View */}
        <Animated.View
          style={[
            styles.marqueeInner,
            {
              transform: [{ translateX: scrollX }],
            },
          ]}
          onLayout={(e) => {
            setContentWidth(e.nativeEvent.layout.width);
          }}
        >
          {tickerItems.map((winner, idx) => (
            <View
              key={`${winner.name}-${idx}`}
              style={styles.tickerCard}
            >
              <View style={styles.trophyIconBox}>
                <Trophy size={12} color="#00FF7F" />
              </View>
              <Text style={styles.winnerName}>{winner.name}</Text>
              <Text style={styles.winnerLoc}>({winner.location})</Text>
              <Text style={styles.actionText}>ganhou</Text>
              <Text style={styles.winnerAmount}>
                {formatCurrency(winner.amount)}
              </Text>
            </View>
          ))}

          {/* Custom Promo Text in the loop */}
          <View style={styles.tickerCard}>
            <Gift size={14} color="#00FF7F" style={styles.promoIcon} />
            <Text style={styles.promoText}>
              Bingo Luz: Diversão e Prêmios Garantidos! Boa sorte a todos!
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  footer: {
    height: 60,
    width: '100%',
    backgroundColor: '#0d0d0f',
    borderTopWidth: 1,
    borderTopColor: '#2e303a',
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  titleLabel: {
    height: '100%',
    paddingHorizontal: 16,
    backgroundColor: '#050507',
    borderRightWidth: 1,
    borderRightColor: '#2e303a',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 5,
  },
  bounceIcon: {
    marginRight: 8,
  },
  titleText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFD700',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  scrollerContainer: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  marqueeInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 20,
  },
  tickerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(24, 24, 27, 0.4)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(39, 39, 42, 0.3)',
    marginRight: 24,
  },
  trophyIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 255, 127, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 127, 0.2)',
    marginRight: 8,
  },
  winnerName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  winnerLoc: {
    fontSize: 10,
    color: '#71717a',
    marginLeft: 6,
    fontWeight: '500',
  },
  actionText: {
    fontSize: 10,
    color: '#a1a1aa',
    marginHorizontal: 6,
  },
  winnerAmount: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFD700',
    fontFamily: 'monospace',
    textShadowColor: 'rgba(255, 215, 0, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  promoIcon: {
    marginRight: 6,
  },
  promoText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#00FF7F',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});
