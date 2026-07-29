import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View, useWindowDimensions, Image } from 'react-native';
import { ThemeTokens, alphaColor } from '../theme/themes';
import Ball from './Ball';
import Icon from './Icon';

const imgClover = require('../assets/new_theme1/4-leaf-removebg-preview.png');

interface AnimatedActiveBallProps {
  currentBall: number | null;
  drawnNumbers: number[];
  theme: ThemeTokens;
  themeName?: string;
  triggerBallLimit?: number | null;
}

const AnimatedActiveBall: React.FC<AnimatedActiveBallProps> = ({
  currentBall,
  drawnNumbers,
  theme,
  themeName = 'tema01',
  triggerBallLimit = null,
}) => {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const isTema04 = themeName === 'tema04';
  const sequenceCount = drawnNumbers.length;
  const isJackpotActive = triggerBallLimit === null || triggerBallLimit === undefined || triggerBallLimit === 0
    ? true
    : sequenceCount <= triggerBallLimit;

  // Pegar as últimas 4 bolas sorteadas (excluindo a bola atual se for a última da lista)
  const last4Balls = React.useMemo(() => {
    if (!drawnNumbers || drawnNumbers.length === 0) return [];
    const arrayNoCurrent = currentBall && drawnNumbers[drawnNumbers.length - 1] === currentBall
      ? drawnNumbers.slice(0, -1)
      : drawnNumbers;
    return arrayNoCurrent.slice(-4).reverse();
  }, [drawnNumbers, currentBall]);

  const ballScale = useRef(new Animated.Value(0)).current;
  const pulseGlow = useRef(new Animated.Value(1)).current;
  const flashAnim = useRef(new Animated.Value(0.3)).current;
  const prevBall  = useRef<number | null>(null);

  useEffect(() => {
    if (currentBall !== null && currentBall !== prevBall.current) {
      prevBall.current = currentBall;
      ballScale.setValue(0.3);
      Animated.spring(ballScale, {
        toValue: 1,
        tension: 140,
        friction: 7,
        useNativeDriver: true,
      }).start();
    }
  }, [currentBall, ballScale]);

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseGlow, { toValue: 1.25, duration: 800, useNativeDriver: true }),
        Animated.timing(pulseGlow, { toValue: 1.0, duration: 800, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulseGlow]);

  useEffect(() => {
    if (isTema04) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(flashAnim, { toValue: 1.0, duration: 400, useNativeDriver: true }),
          Animated.timing(flashAnim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [isTema04, flashAnim]);

  const mainBallSize = isLandscape
    ? Math.min(width * 0.16, height * 0.38, 180)
    : Math.min(width * 0.42, 170);

  return (
    <View style={styles.container}>
      {/* ─── PAINEL CENTRAL: BOLA ATUAL EM EVIDÊNCIA ─── */}
      <View style={styles.mainSection}>
        <View style={styles.headerTitleRow}>
          {isTema04 ? (
            <Image source={imgClover} style={{ width: 18, height: 18, resizeMode: 'contain' }} />
          ) : (
            <Icon name="dice" size={16} color={theme.primary} />
          )}
          <Text style={[styles.sectionTitle, { color: theme.primary }]}>BOLA EM SORTEIO</Text>
        </View>

        <View style={styles.ballWrapper}>
          {currentBall ? (
            <Animated.View style={[styles.animatedBallBox, { transform: [{ scale: ballScale }] }]}>
              {/* Efeito Glow pulsante de iluminação */}
              <Animated.View
                style={[
                  styles.glowRing,
                  {
                    width: mainBallSize + 50,
                    height: mainBallSize + 50,
                    borderRadius: (mainBallSize + 50) / 2,
                    backgroundColor: theme.primaryGlow,
                    transform: [{ scale: pulseGlow }],
                  },
                ]}
              />

              {/* Moldura circular azul neon piscante para o tema04 */}
              {isTema04 && (
                <Animated.View
                  style={{
                    position: 'absolute',
                    width: mainBallSize + 16,
                    height: mainBallSize + 16,
                    borderRadius: (mainBallSize + 16) / 2,
                    borderWidth: 4,
                    borderColor: '#00d4ff',
                    shadowColor: '#00d4ff',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1,
                    shadowRadius: 10,
                    elevation: 12,
                    opacity: flashAnim,
                  }}
                />
              )}

              {/* Bola Ativa Grande */}
              <Ball number={currentBall} size="xl" active animate />

              {/* Contador de SEQUÊNCIA abaixo da bola principal */}
              <View style={[styles.ballCounterBadge, { borderColor: theme.borderPrimary, backgroundColor: theme.bgColor }]}>
                <Icon name="sparkle" size={14} color={theme.primary} />
                <Text style={[styles.ballCounterLabel, { color: theme.textMuted }]}>
                  SEQUÊNCIA:{' '}
                  <Text style={[styles.ballCounterNum, { color: theme.primary }]}>
                    {String(sequenceCount).padStart(2, '0')}
                  </Text>
                </Text>
                {triggerBallLimit !== null && triggerBallLimit > 0 && (
                  <View style={[styles.limitChip, { backgroundColor: isJackpotActive ? alphaColor(theme.success, '22') : alphaColor(theme.error, '22'), borderColor: isJackpotActive ? theme.success : theme.error }]}>
                    <Text style={[styles.limitChipText, { color: isJackpotActive ? theme.success : theme.error }]}>
                      {isJackpotActive ? `LIMITE ${triggerBallLimit}` : `EXCEDEU ${triggerBallLimit}`}
                    </Text>
                  </View>
                )}
              </View>
            </Animated.View>
          ) : (
            <View style={[styles.waitingCircle, { width: mainBallSize, height: mainBallSize, borderRadius: mainBallSize / 2, borderColor: theme.borderPrimary }]}>
              <Text style={[styles.waitingText, { color: theme.textMuted }]}>...</Text>
              <Text style={[styles.waitingSub, { color: theme.textMuted }]}>Aguardando</Text>
            </View>
          )}
        </View>
      </View>

      {/* ─── PAINEL DAS ÚLTIMAS 4 BOLAS ─── */}
      <View style={[styles.lastBallsSection, { backgroundColor: theme.panelBg, borderColor: theme.borderSecondary }]}>
        <Text style={[styles.lastBallsTitle, { color: theme.textMuted }]}>ÚLTIMAS 4 BOLAS</Text>
        <View style={styles.lastBallsGrid}>
          {last4Balls.length > 0 ? (
            last4Balls.map((num, i) => (
              <View key={`last4-${num}-${i}`} style={[styles.lastBallItem, { opacity: 1 - i * 0.18 }]}>
                <View style={[styles.lastBallBubble, { borderColor: theme.secondary, backgroundColor: theme.gridDrawn }]}>
                  <Text style={styles.lastBallText}>{num}</Text>
                </View>
                <Text style={[styles.lastBallOrder, { color: theme.textMuted }]}>
                  {i === 0 ? 'ANTERIOR' : `-${i + 1}`}
                </Text>
              </View>
            ))
          ) : (
            <Text style={[styles.noBallsText, { color: theme.textMuted }]}>Iniciando...</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    gap: 12,
  },
  mainSection: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  ballWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    minHeight: 180,
  },
  animatedBallBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowRing: {
    position: 'absolute',
    opacity: 0.3,
  },
  ballCounterBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1.5,
    marginTop: 12,
  },
  ballCounterLabel: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  ballCounterNum: {
    fontSize: 16,
    fontWeight: '900',
  },
  limitChip: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  limitChipText: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  waitingCircle: {
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.4,
  },
  waitingText: {
    fontSize: 32,
    fontWeight: '900',
  },
  waitingSub: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  lastBallsSection: {
    width: 110,
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 18,
    borderWidth: 1.5,
    alignItems: 'center',
    gap: 8,
  },
  lastBallsTitle: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
  },
  lastBallsGrid: {
    width: '100%',
    alignItems: 'center',
    gap: 6,
  },
  lastBallItem: {
    alignItems: 'center',
    width: '100%',
  },
  lastBallBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
  },
  lastBallText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
  },
  lastBallOrder: {
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  noBallsText: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginTop: 20,
  },
});

export default AnimatedActiveBall;
