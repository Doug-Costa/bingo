/**
 * WinnerModal.tsx — Modal de vencedor animado para React Native
 * Equivalente ao popup de vencedor do Next
 */
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { ThemeTokens } from '../theme/themes';
import { WinnerEvent } from '../contexts/SSEContext';

interface WinnerModalProps {
  winner: WinnerEvent | null;
  drawnNumbers: number[];
  theme: ThemeTokens;
}

function typeLabel(type: string): string {
  if (type === 'line1') { return '1ª LINHA BATIDA!'; }
  if (type === 'line2') { return '2ª LINHA BATIDA!'; }
  return 'BINGO TOTAL!';
}

const WinnerModal: React.FC<WinnerModalProps> = ({ winner, drawnNumbers, theme }) => {
  const { width } = useWindowDimensions();
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const trophyAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (winner) {
      scaleAnim.setValue(0.5);
      opacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, tension: 100, friction: 8, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
      // trophy bounce
      Animated.loop(
        Animated.sequence([
          Animated.timing(trophyAnim, { toValue: -10, duration: 600, useNativeDriver: true }),
          Animated.timing(trophyAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
        ]),
      ).start();
    }
  }, [winner, scaleAnim, opacityAnim, trophyAnim]);

  if (!winner) { return null; }

  const numbers = winner.numbers?.flat() ?? [];

  return (
    <Modal transparent animationType="none" visible={!!winner}>
      <Animated.View style={[styles.overlay, { opacity: opacityAnim }]}>
        <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }], borderColor: theme.primary }]}>
          {/* Top accent line */}
          <LinearGradient
            colors={['transparent', theme.primary, 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={styles.topLine}
          />

          {/* Trophy */}
          <Animated.Text style={[styles.trophy, { transform: [{ translateY: trophyAnim }], color: theme.primary }]}>
            🏆
          </Animated.Text>

          {/* Type */}
          <Text style={[styles.typeLabel, { color: theme.primary }]}>
            {typeLabel(winner.type)}
          </Text>

          {/* Headline */}
          <Text style={[styles.headline, { color: theme.textPrimary }]}>
            TEMOS <Text style={{ color: theme.primary }}>GANHADOR</Text>
          </Text>

          {/* Player / cartela */}
          <View style={styles.infoRow}>
            {/* Player box */}
            <View style={[styles.infoBox, { borderColor: theme.borderSecondary, backgroundColor: 'rgba(255,255,255,0.05)' }]}>
              <Text style={[styles.playerName, { color: theme.textPrimary }]}>
                {winner.playerName || 'GANHADOR'}
              </Text>
              <Text style={[styles.shopName, { color: theme.primary }]}>
                {winner.affiliateName ? `LOJA: ${winner.affiliateName}` : 'VENDA DIRETA'}
              </Text>
            </View>

            {/* Cartela */}
            {numbers.length > 0 && (
              <View style={[styles.infoBox, { borderColor: theme.borderSecondary, backgroundColor: 'rgba(0,0,0,0.4)' }]}>
                <Text style={[styles.conferenceLabel, { color: theme.textMuted }]}>CONFERÊNCIA DE CARTELA</Text>
                <View style={styles.numbersGrid}>
                  {numbers.map((n, idx) => {
                    const isHit = drawnNumbers.includes(n);
                    return (
                      <View
                        key={idx}
                        style={[styles.numCell, {
                          backgroundColor: isHit ? theme.success : 'rgba(0,0,0,0.4)',
                          borderColor: isHit ? theme.secondary : 'rgba(255,255,255,0.1)',
                        }]}
                      >
                        <Text style={[styles.numText, { color: isHit ? '#ffffff' : 'rgba(255,255,255,0.15)' }]}>
                          {n}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}
          </View>

          {/* Prize */}
          <View style={[styles.prizeBox, { backgroundColor: theme.success }]}>
            <Text style={styles.prizeCaption}>PRÊMIO TOTAL RECEBIDO</Text>
            <Text style={styles.prizeAmount}>
              R$ {winner.prizeAmount?.toLocaleString('pt-BR') ?? '0,00'}
            </Text>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 700,
    borderRadius: 40,
    borderWidth: 7,
    backgroundColor: '#0b1575',
    padding: 32,
    alignItems: 'center',
    overflow: 'hidden',
  },
  topLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  trophy: {
    fontSize: 80,
    marginBottom: 12,
  },
  typeLabel: {
    fontSize: 20,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginBottom: 8,
  },
  headline: {
    fontSize: 36,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: -1,
    marginBottom: 24,
    textAlign: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 20,
  },
  infoBox: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 2,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerName: {
    fontSize: 24,
    fontWeight: '900',
    textTransform: 'uppercase',
    textAlign: 'center',
    marginBottom: 6,
  },
  shopName: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.7,
  },
  conferenceLabel: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 10,
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center',
  },
  numCell: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    fontSize: 11,
    fontWeight: '900',
  },
  prizeBox: {
    width: '80%',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 24,
    alignItems: 'center',
  },
  prizeCaption: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#000000',
    opacity: 0.7,
    marginBottom: 4,
  },
  prizeAmount: {
    fontSize: 48,
    fontWeight: '900',
    color: '#000000',
    fontFamily: 'serif',
  },
});

export default WinnerModal;
