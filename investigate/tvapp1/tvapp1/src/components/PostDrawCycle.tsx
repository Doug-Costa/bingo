/**
 * PostDrawCycle.tsx — Ciclo automático de slides pós-sorteio
 *
 * Slides (15s cada):
 *  0 → Vencedores finais
 *  1 → Próximos sorteios (next_draws + hot_draws com badges)
 *  2 → Jackpot progressivo (se activeToday=true)
 *  3 → Propaganda com QR Code convite
 *  → Retorna ao lobby (cronômetro)
 *
 * 30 segundos antes do próximo sorteio o ciclo para e vai para o lobby.
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { DrawSSE, JackpotInfo, Promotion, WinnerEvent } from '../contexts/SSEContext';
import { ThemeTokens } from '../theme/themes';
import { Image } from 'react-native';

const SLIDE_DURATION_MS = 15_000;

interface PostDrawCycleProps {
  theme: ThemeTokens;
  winners: WinnerEvent[];
  drawnNumbers: number[];
  nextDraws: DrawSSE[];
  hotDraws: DrawSSE[];
  jackpotInfo: JackpotInfo | null;
  promotions?: Promotion[];
  onDone: () => void;   // chamado quando o ciclo termina → volta ao lobby
  promoUrl?: string;    // URL da propaganda/afiliado
}

// ─── Slide: Promoções ────────────────────────────────────────────────────────
function PromotionsSlide({ promotions, theme }: { promotions: Promotion[]; theme: ThemeTokens }) {
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    if (promotions.length <= 1) return;
    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % promotions.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [promotions.length]);

  const activePromo = promotions[activeIdx] || promotions[0];
  if (!activePromo) return null;

  return (
    <View style={[styles.slideContent, styles.centerContent]}>
      <Text style={[styles.slideTitle, { color: theme.primary }]}>🔥 PROMOÇÃO</Text>

      {activePromo.urlimg ? (
        <View style={[styles.promoImgWrapper, { borderColor: theme.borderPrimary }]}>
          <Image
            source={{ uri: activePromo.urlimg }}
            style={styles.promoImg}
            resizeMode="cover"
          />
        </View>
      ) : null}

      <Text style={[styles.slideSubtitle, { color: theme.textPrimary, marginTop: 12 }]}>
        {activePromo.title || 'Confira nossas promoções especiais!'}
      </Text>
    </View>
  );
}

// ─── Slide 0: Vencedores ──────────────────────────────────────────────────────
function WinnersSlide({
  winners,
  drawnNumbers,
  theme,
}: {
  winners: WinnerEvent[];
  drawnNumbers: number[];
  theme: ThemeTokens;
}) {
  const trophyAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(trophyAnim, { toValue: -10, duration: 700, useNativeDriver: true }),
        Animated.timing(trophyAnim, { toValue: 0, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, [trophyAnim]);

  const types = ['line1', 'line2', 'bingo'] as const;
  const typeLabel = (t: string) =>
    t === 'line1' ? '1ª LINHA' : t === 'line2' ? '2ª LINHA' : 'BINGO TOTAL';

  return (
    <ScrollView contentContainerStyle={styles.slideContent}>
      <Animated.Text style={[styles.trophyIcon, { transform: [{ translateY: trophyAnim }] }]}>
        🏆
      </Animated.Text>
      <Text style={[styles.slideTitle, { color: theme.primary }]}>PREMIAÇÃO FINAL</Text>
      <Text style={[styles.slideSubtitle, { color: theme.textMuted }]}>
        A SORTE SORRIU PARA ELES!
      </Text>

      <View style={styles.winnersRow}>
        {types.map(type => {
          const win = winners.find(w => w.type === type);
          return (
            <View
              key={type}
              style={[
                styles.winnerCard,
                {
                  borderColor: win ? theme.primary : theme.borderMuted,
                  backgroundColor: win ? `${theme.primary}0D` : theme.glassBg,
                  opacity: win ? 1 : 0.25,
                },
              ]}
            >
              <View style={[styles.winnerTypeBadge, { borderColor: `${theme.primary}66`, backgroundColor: `${theme.primary}22` }]}>
                <Text style={[styles.winnerTypeBadgeText, { color: theme.primary }]}>{typeLabel(type)}</Text>
              </View>
              <Text style={[styles.winnerName, { color: theme.textPrimary }]} numberOfLines={2}>
                {win?.playerName ?? '---'}
              </Text>
              {win?.affiliateName ? (
                <Text style={[styles.winnerAffiliate, { color: theme.textMuted }]}>
                  LOJA: {win.affiliateName}
                </Text>
              ) : null}

              {/* Mini cartela */}
              {win?.numbers && (
                <View style={styles.miniGrid}>
                  {win.numbers.flat().map((n, i) => {
                    const isHit = drawnNumbers.includes(n);
                    return (
                      <View
                        key={i}
                        style={[styles.miniCell, {
                          backgroundColor: isHit ? theme.gridDrawn : theme.gridEmpty,
                          borderColor: isHit ? `${theme.success}88` : theme.borderMuted,
                        }]}
                      >
                        <Text style={[styles.miniCellText, { color: isHit ? '#fff' : 'rgba(255,255,255,0.15)' }]}>
                          {n}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}

              <View style={[styles.prizeBox, { backgroundColor: theme.success }]}>
                <Text style={styles.prizeBoxLabel}>PRÊMIO PAGO</Text>
                <Text style={styles.prizeBoxValue}>
                  R$ {win?.prizeAmount?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) ?? '0,00'}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

// ─── Slide 1: Próximos Sorteios ───────────────────────────────────────────────
function NextDrawsSlide({
  nextDraws,
  hotDraws,
  theme,
}: {
  nextDraws: DrawSSE[];
  hotDraws: DrawSSE[];
  theme: ThemeTokens;
}) {
  const hotIds = new Set(hotDraws.map(d => d.id));
  const allDraws = [...nextDraws].slice(0, 8);

  return (
    <View style={styles.slideContent}>
      <Text style={[styles.slideTitle, { color: theme.primary }]}>🕐 PRÓXIMOS SORTEIOS</Text>

      <View style={styles.drawsGrid}>
        {allDraws.length > 0 ? allDraws.map(d => {
          const isHot = hotIds.has(d.id) || d.hotdraw;
          const time = d.scheduledAt
            ? new Date(d.scheduledAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            : '--:--';
          return (
            <View
              key={d.id}
              style={[
                styles.drawCard,
                {
                  borderColor: isHot ? '#ff6b00' : theme.borderSecondary,
                  backgroundColor: isHot ? 'rgba(255,107,0,0.1)' : theme.glassBg,
                },
              ]}
            >
              {isHot && (
                <LinearGradient
                  colors={['#ff6b00', '#ff0000']}
                  style={styles.hotBadge}
                  start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.hotBadgeText}>🔥 SUPER PRÊMIO</Text>
                </LinearGradient>
              )}
              <View style={styles.drawCardRow}>
                <Text style={[styles.drawCardId, { color: theme.primary }]}>#{d.incrementalId}</Text>
                <Text style={[styles.drawCardTime, { color: theme.textPrimary }]}>{time}</Text>
              </View>
              {d.ticketPrice !== undefined && (
                <Text style={[styles.drawCardPrice, { color: theme.textMuted }]}>
                  Cartela: R$ {Number(d.ticketPrice).toFixed(2)}
                </Text>
              )}
              <View style={styles.drawCardPrizes}>
                {[
                  { emoji: '🥇', val: d.prizeLine1 },
                  { emoji: '🥈', val: d.prizeLine2 },
                  { emoji: '👑', val: d.prizeLine3 },
                ].map((p, i) => p.val !== undefined && (
                  <View key={i} style={styles.prizeChip}>
                    <Text style={styles.prizeChipEmoji}>{p.emoji}</Text>
                    <Text style={[styles.prizeChipValue, { color: theme.success }]}>
                      R$ {Number(p.val).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          );
        }) : (
          <Text style={[styles.emptyText, { color: theme.textMuted }]}>
            Nenhum sorteio agendado
          </Text>
        )}
      </View>
    </View>
  );
}

// ─── Slide 2: Jackpot Progressivo ─────────────────────────────────────────────
function JackpotSlide({ jackpotInfo, theme }: { jackpotInfo: JackpotInfo; theme: ThemeTokens }) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1.0, duration: 700, useNativeDriver: true }),
      ]),
    ).start();
  }, [pulseAnim]);

  return (
    <View style={[styles.slideContent, styles.centerContent]}>
      <Text style={[styles.slideTitle, { color: theme.primary }]}>💎 JACKPOT PROGRESSIVO</Text>
      <Text style={[styles.slideSubtitle, { color: theme.textMuted }]}>PRÊMIO ACUMULADO DO DIA</Text>

      <Animated.View
        style={[
          styles.jackpotGlowBox,
          { borderColor: theme.primary, transform: [{ scale: pulseAnim }] },
        ]}
      >
        <LinearGradient
          colors={[`${theme.primary}33`, `${theme.primary}11`]}
          style={styles.jackpotGlowInner}
        >
          <Text style={[styles.jackpotBigAmount, { color: theme.jackpotText }]}>
            R$ {Number(jackpotInfo.totalAmount ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </Text>
          <Text style={[styles.jackpotSubline, { color: theme.textMuted }]}>
            Base: R$ {Number(jackpotInfo.baseAmount ?? 0).toFixed(2)} + Acumulado: R$ {Number(jackpotInfo.currentAmount ?? 0).toFixed(2)}
          </Text>
          {jackpotInfo.triggerBallLimit ? (
            <View style={styles.triggerRow}>
              <View style={[styles.triggerStar, { backgroundColor: '#dc2626' }]}>
                <Text style={styles.triggerStarText}>⭐ {jackpotInfo.triggerBallLimit}</Text>
              </View>
              <Text style={[styles.triggerLabel, { color: theme.textMuted }]}></Text>
            </View>
          ) : null}
        </LinearGradient>
      </Animated.View>

      {jackpotInfo.lastWonAt && (
        <Text style={[styles.lastWonText, { color: theme.textMuted }]}>
          Último sorteado: {new Date(jackpotInfo.lastWonAt).toLocaleDateString('pt-BR')}
        </Text>
      )}
    </View>
  );
}

// ─── Slide 3: Propaganda / QR Code ────────────────────────────────────────────
function PromoSlide({ promoUrl, theme }: { promoUrl?: string; theme: ThemeTokens }) {
  const url = promoUrl || 'www.meusite.com.br';
  const floatAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, { toValue: -8, duration: 1200, useNativeDriver: true }),
        Animated.timing(floatAnim, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ]),
    ).start();
  }, [floatAnim]);

  return (
    <View style={[styles.slideContent, styles.centerContent]}>
      <Text style={[styles.slideTitle, { color: theme.primary }]}>🎮 JOGUE AGORA!</Text>
      <Text style={[styles.slideSubtitle, { color: theme.textMuted }]}>
        COMPRE SUA CARTELA E CONCORRA AOS PRÊMIOS
      </Text>

      <Animated.View style={{ transform: [{ translateY: floatAnim }] }}>
        <LinearGradient
          colors={[theme.primary, theme.accent ?? theme.primary]}
          style={styles.promoQrBox}
          start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        >
          {/* QR code simulado com padrão visual */}
          <View style={styles.qrPlaceholder}>
            <View style={styles.qrGrid}>
              {Array.from({ length: 49 }, (_, i) => (
                <View
                  key={i}
                  style={[
                    styles.qrCell,
                    {
                      backgroundColor:
                        // Cantos e bordas do QR
                        (Math.floor(i / 7) < 2 && i % 7 < 2) ||
                          (Math.floor(i / 7) < 2 && i % 7 > 4) ||
                          (Math.floor(i / 7) > 4 && i % 7 < 2) ||
                          // Padrão interno aleatório determinístico
                          ((i * 37 + 13) % 3 === 0)
                          ? '#000'
                          : '#fff',
                    },
                  ]}
                />
              ))}
            </View>
          </View>
        </LinearGradient>
      </Animated.View>

      <Text style={[styles.promoUrl, { color: theme.textPrimary }]}>{url}</Text>
      <Text style={[styles.promoCaption, { color: theme.textMuted }]}>
        Escaneie o QR Code e comece a jogar!
      </Text>
    </View>
  );
}

// ─── Progress Bar ─────────────────────────────────────────────────────────────
function SlideProgressBar({
  slideIndex,
  totalSlides,
  duration,
  theme,
}: {
  slideIndex: number;
  totalSlides: number;
  duration: number;
  theme: ThemeTokens;
}) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration,
      useNativeDriver: false,
    }).start();
  }, [slideIndex, duration, anim]);

  return (
    <View style={styles.progressContainer}>
      {/* Dots */}
      <View style={styles.dotsRow}>
        {Array.from({ length: totalSlides }, (_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === slideIndex ? theme.primary : theme.borderMuted,
                width: i === slideIndex ? 20 : 6,
              },
            ]}
          />
        ))}
      </View>
      {/* Bar */}
      <View style={[styles.progressBar, { backgroundColor: theme.borderMuted }]}>
        <Animated.View
          style={[
            styles.progressFill,
            {
              backgroundColor: theme.primary,
              width: anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
            },
          ]}
        />
      </View>
    </View>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
const PostDrawCycle: React.FC<PostDrawCycleProps> = ({
  theme,
  winners,
  drawnNumbers,
  nextDraws,
  hotDraws,
  jackpotInfo,
  promotions,
  onDone,
  promoUrl,
}) => {
  const { width, height } = useWindowDimensions();

  // Montar lista de slides dinâmica
  const slides = [
    'winners',
    'next_draws',
    ...(jackpotInfo?.activeToday ? ['jackpot'] : []),
    ...(promotions && promotions.length > 0 ? ['promotions'] : []),
    'promo',
  ] as const;

  const [slideIndex, setSlideIndex] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const advanceSlide = useCallback(() => {
    // Fade out
    Animated.timing(fadeAnim, { toValue: 0, duration: 400, useNativeDriver: true }).start(() => {
      setSlideIndex(prev => {
        const next = prev + 1;
        if (next >= slides.length) {
          // Ciclo completo → volta ao lobby
          onDone();
          return prev;
        }
        return next;
      });
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    });
  }, [fadeAnim, slides.length, onDone]);

  // Auto-avançar após duração do slide
  useEffect(() => {
    if (timerRef.current) { clearTimeout(timerRef.current); }
    timerRef.current = setTimeout(advanceSlide, SLIDE_DURATION_MS);
    return () => { if (timerRef.current) { clearTimeout(timerRef.current); } };
  }, [slideIndex, advanceSlide]);

  const currentSlide = slides[slideIndex] ?? 'winners';

  return (
    <View style={[styles.container, { backgroundColor: theme.bgColor }]}>
      {/* Slide content */}
      <Animated.View style={[styles.slideWrapper, { opacity: fadeAnim }]}>
        {currentSlide === 'winners' && (
          <WinnersSlide winners={winners} drawnNumbers={drawnNumbers} theme={theme} />
        )}
        {currentSlide === 'next_draws' && (
          <NextDrawsSlide nextDraws={nextDraws} hotDraws={hotDraws} theme={theme} />
        )}
        {currentSlide === 'jackpot' && jackpotInfo && (
          <JackpotSlide jackpotInfo={jackpotInfo} theme={theme} />
        )}
        {currentSlide === 'promotions' && promotions && promotions.length > 0 && (
          <PromotionsSlide promotions={promotions} theme={theme} />
        )}
        {currentSlide === 'promo' && (
          <PromoSlide promoUrl={promoUrl} theme={theme} />
        )}
      </Animated.View>

      {/* Progress */}
      <SlideProgressBar
        slideIndex={slideIndex}
        totalSlides={slides.length}
        duration={SLIDE_DURATION_MS}
        theme={theme}
      />
    </View>
  );
};

export default PostDrawCycle;

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1 },
  slideWrapper: { flex: 1 },
  slideContent: { flexGrow: 1, padding: 16, alignItems: 'center', gap: 12 },
  centerContent: { justifyContent: 'center' },

  slideTitle: { fontSize: 28, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, textAlign: 'center' },
  slideSubtitle: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 3, textAlign: 'center' },
  trophyIcon: { fontSize: 72, textAlign: 'center' },
  emptyText: { fontSize: 14, fontWeight: '700', textAlign: 'center', marginTop: 32 },

  // Winners
  winnersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', width: '100%' },
  winnerCard: {
    flex: 1, minWidth: 180, maxWidth: 280,
    borderRadius: 24, borderWidth: 2,
    padding: 16, alignItems: 'center', gap: 8,
  },
  winnerTypeBadge: { paddingHorizontal: 16, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  winnerTypeBadgeText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  winnerName: { fontSize: 18, fontWeight: '900', textTransform: 'uppercase', textAlign: 'center' },
  winnerAffiliate: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, opacity: 0.6 },
  miniGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 2, justifyContent: 'center', maxWidth: 200 },
  miniCell: { width: 24, height: 24, borderRadius: 4, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  miniCellText: { fontSize: 8, fontWeight: '900' },
  prizeBox: { paddingVertical: 10, paddingHorizontal: 20, borderRadius: 14, alignItems: 'center', width: '100%' },
  prizeBoxLabel: { fontSize: 9, fontWeight: '900', color: '#000', textTransform: 'uppercase', letterSpacing: 2, opacity: 0.7 },
  prizeBoxValue: { fontSize: 22, fontWeight: '900', color: '#000' },

  // nextDraws
  drawsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', width: '100%' },
  drawCard: {
    minWidth: 160, maxWidth: 220,
    borderRadius: 18, borderWidth: 1.5,
    padding: 14, gap: 6, position: 'relative', overflow: 'hidden',
  },
  hotBadge: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingVertical: 4, alignItems: 'center',
  },
  hotBadgeText: { fontSize: 9, fontWeight: '900', color: '#fff', textTransform: 'uppercase', letterSpacing: 1 },
  drawCardRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  drawCardId: { fontSize: 14, fontWeight: '900', fontFamily: 'monospace' },
  drawCardTime: { fontSize: 18, fontWeight: '900' },
  drawCardPrice: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  drawCardPrizes: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  prizeChip: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  prizeChipEmoji: { fontSize: 12 },
  prizeChipValue: { fontSize: 12, fontWeight: '900' },

  // Jackpot
  jackpotGlowBox: {
    borderRadius: 30, borderWidth: 2,
    overflow: 'hidden', marginVertical: 16,
    width: '90%', maxWidth: 500,
  },
  jackpotGlowInner: { padding: 32, alignItems: 'center', gap: 10 },
  jackpotBigAmount: { fontSize: 48, fontWeight: '900', textAlign: 'center' },
  jackpotSubline: { fontSize: 12, fontWeight: '700', textAlign: 'center' },
  triggerRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  triggerStar: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  triggerStarText: { fontSize: 14, fontWeight: '900', color: '#fff' },
  triggerLabel: { fontSize: 11, fontWeight: '700' },
  lastWonText: { fontSize: 11, fontWeight: '700' },

  // Promo
  promoImgWrapper: {
    width: '85%', maxWidth: 460, height: 220,
    borderRadius: 20, borderWidth: 2,
    overflow: 'hidden', marginVertical: 12,
  },
  promoImg: {
    width: '100%', height: '100%',
  },
  promoQrBox: {
    padding: 16,
    borderRadius: 24,
    alignItems: 'center',
    marginVertical: 16,
  },
  qrPlaceholder: {
    width: 140, height: 140,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrGrid: { flexDirection: 'row', flexWrap: 'wrap', width: 120, height: 120 },
  qrCell: { width: 120 / 7, height: 120 / 7 },
  promoUrl: { fontSize: 20, fontWeight: '900', textAlign: 'center', letterSpacing: 1 },
  promoCaption: { fontSize: 12, fontWeight: '700', textAlign: 'center' },

  // Progress
  progressContainer: { paddingHorizontal: 20, paddingBottom: 12, gap: 8 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 6 },
  dot: { height: 6, borderRadius: 3 },
  progressBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
});
