/**
 * TvScreen.tsx — Tela principal do telão de bingo React Native
 *
 * Estados: LOADING → LOBBY → EM JOGO → POST-DRAW CYCLE → LOBBY
 * Conecta via SSE (GameSocketProvider).
 * nextDraws/hotDraws chegam via SSE (fonte primária) + fallback API.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import type { RouteProp } from '@react-navigation/native';

import {
  GameSocketProvider,
  useGameSocket,
  Top10Player,
  WinnerEvent,
  DrawSSE,
} from '../contexts/SSEContext';
import { clearCredentials, ThemeConfig } from '../services/storage';
import { resolveTheme, getThemeKey, ThemeTokens, alphaColor } from '../theme/themes';
import audioService from '../services/audioService';

import AnimatedActiveBall from '../components/AnimatedActiveBall';
import NumberGrid from '../components/NumberGrid';
import DigitalNumber from '../components/DigitalNumber';
import TopPlayers from '../components/TopPlayers';
import WinnerModal from '../components/WinnerModal';
import MyTicketsPanel from '../components/MyTicketsPanel';
import PostDrawCycle from '../components/PostDrawCycle';
import Icon from '../components/Icon';

// ─── Types ─────────────────────────────────────────────────────────────────────
interface NavParams {
  baseUrl: string;
  roomId: string;
  pin: string;
  theme: ThemeConfig;
}

type Props = {
  navigation: StackNavigationProp<any>;
  route: RouteProp<any>;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtCurrency(val: number | undefined | null): string {
  return `R$ ${Number(val || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;
}
function fmtTime(iso: string | null | undefined): string {
  if (!iso) { return '--:--'; }
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ─── TriggerBallStar — estrelinha vermelha pulsante ─────────────────────────
function TriggerBallStar({ limit, theme }: { limit: number; theme: ThemeTokens }) {
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.15, duration: 500, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 500, useNativeDriver: true }),
        Animated.delay(1500),
      ]),
    ).start();
  }, [pulse]);

  return (
    <Animated.View style={[styles.triggerStarBadge, { transform: [{ scale: pulse }] }]}>
      <LinearGradient colors={['#ff3333', '#cc0000']} style={styles.triggerStarInner}>
        <Icon name="star" size={12} color="#ffffff" />
        <Text style={styles.triggerStarNum}>{limit}</Text>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── JackpotTag — etiqueta dourada animada ────────────────────────────────────
function JackpotTag({ amount, theme }: { amount: number; theme: ThemeTokens }) {
  return (
    <View style={[styles.jackpotTag, { borderColor: theme.primary }]}>
      <LinearGradient
        colors={[`${theme.primary}22`, `${theme.primary}44`, `${theme.primary}22`]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
        style={styles.jackpotTagGrad}
      >
        <Icon name="jackpot" size={24} color={theme.primary} />
        <View>
          <Text style={[styles.jackpotTagLabel, { color: theme.primary }]}>COFRE ACUMULADO</Text>
          <Text style={[styles.jackpotTagAmount, { color: theme.jackpotText }]}>
            {fmtCurrency(amount)}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}

// ─── Lobby — Countdown + prizes + próximas rodadas ─────────────────────────────
function LobbyView({
  theme,
  nextDraw,
  countdown,
  upcomingDraws,
  jackpotAmount,
  jackpotInfo,
  triggerBallLimit,
}: {
  theme: ThemeTokens;
  nextDraw: DrawSSE | null;
  countdown: number;
  upcomingDraws: DrawSSE[];
  jackpotAmount: number | null;
  jackpotInfo: any;
  triggerBallLimit: number | null;
}) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const mins = Math.floor(countdown / 60).toString().padStart(2, '0');
  const secs = (countdown % 60).toString().padStart(2, '0');
  const d = nextDraw as any ?? {};

  const effectiveJackpot = jackpotAmount ?? jackpotInfo?.totalAmount ?? null;
  const showJackpot = jackpotInfo?.activeToday === true && (effectiveJackpot ?? 0) > 0;
  const effectiveTrigger = triggerBallLimit ?? jackpotInfo?.triggerBallLimit ?? null;

  const CountdownContent = () => (
    <>
      {/* Header do Painel Aberto */}
      <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)', paddingBottom: 12, marginBottom: 12 }}>
        <View>
          <Text style={{ fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, color: theme.textSecondary }}>Painel Aberto</Text>
          <Text style={{ fontSize: 24, fontWeight: '900', textTransform: 'uppercase', color: theme.textPrimary, marginTop: 2 }}>Aguarde o Sorteio</Text>
        </View>
        <View style={{ backgroundColor: theme.primary, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 14 }}>
          <Text style={{ fontSize: 11, fontWeight: '900', textTransform: 'uppercase', color: '#0b1466', letterSpacing: 1 }}>SORTEIO AO VIVO</Text>
        </View>
      </View>

      {/* Jackpot se houver */}
      {showJackpot && effectiveJackpot !== null && (
        <JackpotTag amount={effectiveJackpot} theme={theme} />
      )}

      {/* Rótulo Começa Em */}
      <Text style={[styles.nextLabel, { color: theme.textSecondary, letterSpacing: 3, marginTop: 8 }]}>
        O SORTEIO COMEÇA EM
      </Text>

      {/* Relógio digital */}
      <View style={styles.clockRow}>
        <DigitalNumber value={mins[0]} theme={theme} size={isLandscape ? 64 : 52} />
        <DigitalNumber value={mins[1]} theme={theme} size={isLandscape ? 64 : 52} />
        <Text style={[styles.colonSep, { color: theme.primary, fontSize: isLandscape ? 48 : 40 }]}>:</Text>
        <DigitalNumber value={secs[0]} theme={theme} size={isLandscape ? 64 : 52} />
        <DigitalNumber value={secs[1]} theme={theme} size={isLandscape ? 64 : 52} />
      </View>

      {/* Trigger ball */}
      {effectiveTrigger !== null && effectiveTrigger > 0 && (
        <View style={styles.triggerRow}>
          <TriggerBallStar limit={effectiveTrigger} theme={theme} />
          <Text style={[styles.triggerLobbyLabel, { color: theme.textMuted }]}>

          </Text>
        </View>
      )}

      {/* Info: Rodada Nº, Valor Cartela, Abertura */}
      <View style={[styles.infoCard, { borderColor: theme.borderSecondary, marginTop: 12 }]}>
        <View style={styles.infoCardRow}>
          <View style={styles.infoCardItem}>
            <Text style={[styles.infoCaption, { color: theme.textMuted }]}>Rodada Nº</Text>
            <Text style={[styles.infoValue, { color: theme.primary }]}>
              #{d.incrementalId || '---'}
            </Text>
          </View>
          <View style={[styles.infoCardDivider, { backgroundColor: theme.borderSecondary }]} />
          <View style={styles.infoCardItem}>
            <Text style={[styles.infoCaption, { color: theme.textMuted }]}>Valor Cartela</Text>
            <Text style={[styles.infoValue, { color: theme.success }]}>
              {fmtCurrency(d.ticketPrice)}
            </Text>
          </View>
          <View style={[styles.infoCardDivider, { backgroundColor: theme.borderSecondary }]} />
          <View style={styles.infoCardItem}>
            <Text style={[styles.infoCaption, { color: theme.textMuted }]}>Horário</Text>
            <Text style={[styles.infoValue, { color: theme.textPrimary }]}>
              {fmtTime(d.scheduledAt)}
            </Text>
          </View>
        </View>
      </View>

      {/* Prizes */}
      <View style={[styles.prizesRow, { marginTop: 12 }]}>
        {[
          { label: '1ª LINHA', value: d.prizeLine1, emoji: '🥇' },
          { label: '2ª LINHA', value: d.prizeLine2, emoji: '🥈' },
          { label: 'BINGO', value: d.prizeLine3, emoji: '👑' },
        ].map((p, idx) => (
          <View key={idx} style={[styles.prizeChip, { borderColor: theme.borderSecondary, backgroundColor: 'rgba(255,255,255,0.04)' }]}>
            <Text style={styles.prizeEmoji}>{p.emoji}</Text>
            <Text style={[styles.prizeChipLabel, { color: theme.textMuted }]}>{p.label}</Text>
            <Text style={[styles.prizeChipValue, { color: theme.primary }]}>
              {fmtCurrency(p.value)}
            </Text>
          </View>
        ))}
      </View>
    </>
  );

  if (isLandscape) {
    return (
      <View style={styles.lobbyLandscapeWrapper}>
        <View style={[styles.lobbyCountdownLandscape, { borderColor: theme.borderPrimary, backgroundColor: theme.glassBg }]}>
          <ScrollView
            contentContainerStyle={styles.lobbyScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <CountdownContent />
          </ScrollView>
        </View>

        <View style={[styles.lobbyDrawListLandscape, { borderColor: theme.borderSecondary, backgroundColor: theme.glassBg }]}>
          <Text style={[styles.upcomingTitle, { color: theme.textPrimary }]}>🕐 PRÓXIMAS RODADAS</Text>
          <ScrollView showsVerticalScrollIndicator={false} style={styles.upcomingScroll}>
            {upcomingDraws.length > 0 ? upcomingDraws.map((d: any) => {
              const isHot = d.hotdraw === true;
              return (
                <View
                  key={d.id}
                  style={[styles.upcomingItem, {
                    borderColor: isHot ? '#ff6b00' : theme.borderMuted,
                    backgroundColor: isHot ? 'rgba(255,107,0,0.08)' : 'transparent',
                  }]}
                >
                  <View style={styles.upcomingTopRow}>
                    {isHot && <View style={styles.hotBadgeSmall}><Text style={styles.hotBadgeSmallText}>🔥 HOT</Text></View>}
                    <View style={styles.upcomingIdTimeRow}>
                      <Text style={[styles.upcomingId, { color: theme.primary }]}>#{d.incrementalId}</Text>
                      <Text style={[styles.upcomingTime, { color: theme.textSecondary }]}>{fmtTime(d.scheduledAt)}</Text>
                    </View>
                  </View>
                  <View style={styles.upcomingPrizes}>
                    {d.prizeLine1 !== undefined && <Text style={[styles.upcomingPrizeText, { color: theme.success }]} numberOfLines={1}>🥇 {fmtCurrency(d.prizeLine1)}</Text>}
                    {d.prizeLine2 !== undefined && <Text style={[styles.upcomingPrizeText, { color: theme.textSecondary }]} numberOfLines={1}>🥈 {fmtCurrency(d.prizeLine2)}</Text>}
                    {d.prizeLine3 !== undefined && <Text style={[styles.upcomingPrizeText, { color: theme.primary }]} numberOfLines={1}>👑 {fmtCurrency(d.prizeLine3)}</Text>}
                  </View>
                </View>
              );
            }) : <Text style={[styles.upcomingEmpty, { color: theme.textMuted }]}>Nenhum sorteio agendado</Text>}
          </ScrollView>
        </View>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.lobbyPortraitScroll}
      contentContainerStyle={[styles.lobbyPortraitContent, { paddingBottom: 16 }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={[styles.lobbyCountdownPortrait, { borderColor: theme.borderPrimary, backgroundColor: theme.glassBg }]}>
        <CountdownContent />
      </View>

      <View style={[styles.lobbyDrawListPortrait, { borderColor: theme.borderSecondary, backgroundColor: theme.glassBg }]}>
        <Text style={[styles.upcomingTitle, { color: theme.textPrimary }]}>🕐 PRÓXIMAS RODADAS</Text>
        {upcomingDraws.slice(0, 8).map((d: any) => {
          const isHot = d.hotdraw === true;
          return (
            <View
              key={d.id}
              style={[styles.upcomingItem, {
                borderColor: isHot ? '#ff6b00' : theme.borderMuted,
                backgroundColor: isHot ? 'rgba(255,107,0,0.08)' : 'transparent',
              }]}
            >
              <View style={styles.upcomingTopRow}>
                {isHot && <View style={styles.hotBadgeSmall}><Text style={styles.hotBadgeSmallText}>🔥 HOT</Text></View>}
                <View style={styles.upcomingIdTimeRow}>
                  <Text style={[styles.upcomingId, { color: theme.primary }]}>#{d.incrementalId}</Text>
                  <Text style={[styles.upcomingTime, { color: theme.textSecondary }]}>{fmtTime(d.scheduledAt)}</Text>
                </View>
              </View>
              <View style={styles.upcomingPrizes}>
                {d.prizeLine1 !== undefined && <Text style={[styles.upcomingPrizeText, { color: theme.success }]} numberOfLines={1}>🥇 {fmtCurrency(d.prizeLine1)}</Text>}
                {d.prizeLine2 !== undefined && <Text style={[styles.upcomingPrizeText, { color: theme.textSecondary }]} numberOfLines={1}>🥈 {fmtCurrency(d.prizeLine2)}</Text>}
                {d.prizeLine3 !== undefined && <Text style={[styles.upcomingPrizeText, { color: theme.primary }]} numberOfLines={1}>👑 {fmtCurrency(d.prizeLine3)}</Text>}
              </View>
            </View>
          );
        })}
        {upcomingDraws.length === 0 && <Text style={[styles.upcomingEmpty, { color: theme.textMuted }]}>Nenhum sorteio agendado</Text>}
      </View>
    </ScrollView>
  );
}

// ─── InGame — 3 Seções Principais + Coluna Vertical (Top Winner + Top My Card) ─
function InGameView({
  theme,
  themeName,
  drawnNumbers,
  currentBall,
  topPlayers,
  jackpotAmount,
  triggerBallLimit,
  displayDraw,
  topStage,
  winners,
  myTickets,
}: {
  theme: ThemeTokens;
  themeName: string;
  drawnNumbers: number[];
  currentBall: number | null;
  topPlayers: Top10Player[];
  jackpotAmount: number | null;
  triggerBallLimit: number | null;
  displayDraw: any;
  topStage: string;
  winners: WinnerEvent[];
  myTickets: any[];
}) {
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const sequenceCount = drawnNumbers.length;
  const isJackpotActive = triggerBallLimit === null || triggerBallLimit === undefined || triggerBallLimit === 0
    ? true
    : sequenceCount <= triggerBallLimit;

  const prizes = [
    { id: 'line1', label: '1ª LINHA', value: Number(displayDraw.prizeLine1 || 0), emoji: '🥇' },
    { id: 'line2', label: '2ª LINHA', value: Number(displayDraw.prizeLine2 || 0), emoji: '🥈' },
    { id: 'bingo', label: 'BINGO', value: Number(displayDraw.prizeLine3 || 0), emoji: '👑' },
  ];

  return (
    <View style={isLandscape ? styles.inGameLandscapeWrapper : styles.inGamePortraitWrapper}>
      {/* ── COLUNA PRINCIPAL / ESQUERDA: 3 SEÇÕES VERTICAIS ── */}
      <View style={styles.inGameMainColumn}>

        {/* 1️⃣ PARTE 1: EXIBIÇÃO DAS BOLAS DE SORTEIO (Bola Atual + Sequência + Últimas 4) */}
        <View style={[styles.sectionBallPanel, { borderColor: theme.borderPrimary, backgroundColor: theme.glassBg }]}>
          <AnimatedActiveBall
            currentBall={currentBall}
            drawnNumbers={drawnNumbers}
            theme={theme}
            themeName={themeName}
            triggerBallLimit={triggerBallLimit}
          />
        </View>

        {/* 2️⃣ PARTE 2: PREMIAÇÃO (Prêmios 1, 2, 3) AO LADO DO JACKPOT */}
        <View style={[styles.sectionPrizesJackpotRow, { borderColor: theme.borderSecondary, backgroundColor: theme.glassBg }]}>
          {/* Prêmios 1, 2, 3 */}
          <View style={styles.prizesSubRow}>
            {prizes.map(p => {
              const isWon = winners.some(w => w.type === p.id);
              const isActive = topStage === p.id && !isWon;
              return (
                <View
                  key={p.id}
                  style={[
                    styles.prizeCardItem,
                    {
                      borderColor: isActive ? theme.success : isWon ? theme.borderMuted : theme.borderSecondary,
                      backgroundColor: isActive ? alphaColor(theme.success, '22') : isWon ? 'rgba(0,180,0,0.1)' : 'rgba(255,255,255,0.03)',
                    },
                  ]}
                >
                  <Text style={styles.prizeEmojiText}>{p.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.prizeLabelText, { color: isActive ? theme.success : theme.textMuted }]}>
                      {p.label}{isWon ? ' ✓' : ''}
                    </Text>
                    <Text style={[styles.prizeValueText, { color: theme.textPrimary }]}>
                      {fmtCurrency(p.value)}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Ao Lado: Jackpot (Cofre Acumulado - Apaga quando sequência excede o limite) */}
          <View
            style={[
              styles.jackpotCardItem,
              {
                borderColor: isJackpotActive ? theme.primary : theme.borderMuted,
                backgroundColor: isJackpotActive ? alphaColor(theme.primary, '18') : 'rgba(0,0,0,0.4)',
                opacity: isJackpotActive ? 1 : 0.35,
              },
            ]}
          >
            <Icon name="jackpot" size={24} color={isJackpotActive ? theme.primary : theme.textMuted} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.jackpotLabelText, { color: isJackpotActive ? theme.primary : theme.textMuted }]}>
                {isJackpotActive ? 'COFRE ACUMULADO' : `COFRE EXPIRADO (> ${triggerBallLimit})`}
              </Text>
              <Text style={[styles.jackpotValueText, { color: isJackpotActive ? theme.jackpotText : theme.textMuted, textDecorationLine: isJackpotActive ? 'none' : 'line-through' }]}>
                {isJackpotActive ? fmtCurrency(jackpotAmount) : 'INATIVO'}
              </Text>
            </View>
            {triggerBallLimit !== null && triggerBallLimit > 0 && isJackpotActive && (
              <View style={styles.triggerBadgeInline}>
                <TriggerBallStar limit={triggerBallLimit} theme={theme} />
              </View>
            )}
          </View>
        </View>

        {/* 3️⃣ PARTE 3: CONTAGEM DAS 90 PEDRAS */}
        <View style={[styles.sectionGridPanel, { borderColor: theme.borderSecondary, backgroundColor: theme.glassBg }]}>
          <NumberGrid drawnNumbers={drawnNumbers} currentBall={currentBall} theme={theme} />
        </View>

      </View>

      {/* ── COLUNA VERTICAL DA DIREITA: TOP WINNER + TOP MY CARD ── */}
      <View style={styles.inGameVerticalRightColumn}>
        {/* Top Winner */}
        <View style={[styles.topWinnerBox, { borderColor: theme.borderSecondary, backgroundColor: theme.glassBg }]}>
          <View style={styles.sidebarHeaderRow}>
            <Icon name="trophy" size={14} color={theme.primary} />
            <Text style={[styles.sidebarTitle, { color: theme.textPrimary }]}>TOP WINNER</Text>
            <View style={[styles.liveChip, { backgroundColor: alphaColor(theme.success, '22'), borderColor: alphaColor(theme.success, '66') }]}>
              <Text style={[styles.liveText, { color: theme.success }]}>AO VIVO</Text>
            </View>
          </View>
          <TopPlayers players={topPlayers} theme={theme} />
        </View>

        {/* Top My Card */}
        <View style={[styles.topMyCardBox, { borderColor: theme.borderSecondary, backgroundColor: theme.glassBg }]}>
          <MyTicketsPanel
            tickets={myTickets}
            drawnNumbers={drawnNumbers}
            currentBall={currentBall}
            topPlayers={topPlayers}
            theme={theme}
            layout="vertical"
          />
        </View>
      </View>
    </View>
  );
}

// ─── Loading ───────────────────────────────────────────────────────────────────
function LoadingView({ theme }: { theme: ThemeTokens }) {
  return (
    <View style={[styles.loadingContainer, { backgroundColor: theme.bgColor }]}>
      <ActivityIndicator size="large" color={theme.primary} />
      <Text style={[styles.loadingText, { color: theme.primary }]}>SINCRONIZANDO SISTEMA...</Text>
    </View>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────
function TvHeader({
  theme,
  t,
  connected,
  displayDraw,
  jackpotAmount,
  triggerBallLimit,
  drawnNumbers,
  isInProgress,
  onLogout,
  soundOn,
  onToggleSound,
  lang,
  onSelectLang,
}: {
  theme: ThemeTokens;
  t: ThemeConfig;
  connected: boolean;
  displayDraw: any;
  jackpotAmount: number | null;
  triggerBallLimit: number | null;
  drawnNumbers: number[];
  isInProgress: boolean;
  onLogout: () => void;
  soundOn?: boolean;
  onToggleSound?: () => void;
  lang?: 'pt' | 'es' | 'en';
  onSelectLang?: (l: 'pt' | 'es' | 'en') => void;
}) {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR');

  // Indicador pulsante para conexao
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (!connected) {
      const anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulse, { toValue: 0.3, duration: 600, useNativeDriver: true }),
          Animated.timing(pulse, { toValue: 1.0, duration: 600, useNativeDriver: true }),
        ]),
      );
      anim.start();
      return () => anim.stop();
    } else {
      pulse.setValue(1);
    }
  }, [connected, pulse]);

  return (
    <View style={[styles.header, { backgroundColor: theme.headerBg, borderColor: theme.borderSecondary }]}>
      {/* Esquerda: Logo + Status Conexao */}
      <View style={styles.headerLeft}>
        <LinearGradient colors={[theme.primary, theme.accent ?? theme.primary]} style={styles.logoBox}>
          <Icon name="trophy" size={22} color="#000" />
        </LinearGradient>
        <View>
          <Text style={[styles.headerTitle, { color: theme.primary }]} numberOfLines={1}>
            {t.text || 'BINGO SHOW'}
          </Text>
          <View style={styles.connRow}>
            <Animated.View style={[styles.connDot, {
              backgroundColor: connected ? theme.success : '#f59e0b',
              opacity: connected ? 1 : pulse,
            }]} />
            <Text style={[styles.connText, { color: connected ? theme.success : '#f59e0b' }]}>
              {connected ? '● AO VIVO' : '○ CONECTANDO...'}
            </Text>
          </View>
        </View>
      </View>

      {/* Centro: Numero do Sorteio, Data e Hora */}
      <View style={styles.headerCenter}>
        <View style={[styles.headerBadge, { borderColor: theme.borderSecondary, backgroundColor: 'rgba(255,255,255,0.05)' }]}>
          <Icon name="dice" size={15} color={theme.primary} />
          <Text style={[styles.headerBadgeLabel, { color: theme.textMuted }]}>SORTEIO:</Text>
          <Text style={[styles.headerBadgeValue, { color: theme.primary }]}>
            #{displayDraw?.incrementalId || '---'}
          </Text>
        </View>

        <View style={[styles.headerBadge, { borderColor: theme.borderSecondary, backgroundColor: 'rgba(255,255,255,0.05)' }]}>
          <Icon name="calendar" size={14} color={theme.textSecondary} />
          <Text style={[styles.headerBadgeValue, { color: theme.textPrimary }]}>
            {dateStr}
          </Text>
        </View>

        <View style={[styles.headerBadge, { borderColor: theme.borderSecondary, backgroundColor: 'rgba(255,255,255,0.05)' }]}>
          <Icon name="clock" size={14} color={theme.textSecondary} />
          <Text style={[styles.headerBadgeValue, { color: theme.textPrimary }]}>
            {timeStr}
          </Text>
        </View>
      </View>

      {/* Direita: Som, Idioma, Logout */}
      <View style={styles.headerRight}>
        {onToggleSound && (
          <TouchableOpacity
            style={[styles.audioBtn, { borderColor: soundOn ? theme.success : theme.borderMuted }]}
            onPress={onToggleSound}
          >
            <Icon name={soundOn ? 'volume-on' : 'volume-off'} size={16} color={soundOn ? theme.success : theme.textMuted} />
          </TouchableOpacity>
        )}

        {onSelectLang && (
          <View style={styles.langContainer}>
            {(['pt', 'es', 'en'] as const).map(l => (
              <TouchableOpacity
                key={l}
                onPress={() => onSelectLang(l)}
                style={[
                  styles.langChip,
                  { backgroundColor: lang === l ? theme.primary : 'transparent' },
                ]}
              >
                <Text style={[styles.langText, { color: lang === l ? '#000' : theme.textMuted }]}>
                  {l.toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <TouchableOpacity style={[styles.logoutBtn, { borderColor: theme.borderSecondary }]} onPress={onLogout}>
          <Icon name="logout" size={16} color={theme.textMuted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Inner component (consumes SSE context) ────────────────────────────────────
function TvScreenInner({
  baseUrl,
  roomId,
  pin,
  theme: themeConfig,
  navigation,
}: {
  baseUrl: string;
  roomId: string;
  pin: string;
  theme: ThemeConfig;
  navigation: StackNavigationProp<any>;
}) {
  const {
    connected, drawnNumbers, currentBall, jackpotAmount,
    triggerBallLimit, lastDrawEvent, topPlayers, topStage,
    winners, drawActive, nextDraws, hotDraws, jackpotInfo, myTickets, promotions,
    hadDrawInSession,
  } = useGameSocket();

  const themeKey = useMemo(() => getThemeKey(themeConfig), [themeConfig]);
  const theme = useMemo(() => resolveTheme(themeKey), [themeKey]);
  const themeName = themeKey;

  // Enrich top players with local calculation
  const enrichedTopPlayers = useMemo(() => {
    return topPlayers.map(p => {
      if (!p.fullTicket || p.fullTicket.length === 0) { return p; }
      const linesMissing = p.fullTicket.map(line => line.filter(n => !drawnNumbers.includes(n)));
      const missingCounts = linesMissing.map(m => m.length);
      let missing: number[] = [];
      let left = p.minNumbersLeft;
      if (topStage === 'line1') {
        const idx = missingCounts.indexOf(Math.min(...missingCounts));
        missing = linesMissing[idx]; left = missing.length;
      } else if (topStage === 'line2') {
        const si = [0, 1, 2].sort((a, b) => missingCounts[a] - missingCounts[b]);
        missing = [...linesMissing[si[0]], ...(linesMissing[si[1]] || [])]; left = missing.length;
      } else if (topStage === 'bingo') {
        missing = linesMissing.flat(); left = missing.length;
      }
      return { ...p, missingNumbers: missing.length > 0 ? missing : p.missingNumbers, minNumbersLeft: left };
    });
  }, [topPlayers, drawnNumbers, topStage]);

  const [postDrawCycle, setPostDrawCycle] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [nextDrawObj, setNextDrawObj] = useState<DrawSSE | null>(null);

  useEffect(() => {
    const t = setInterval(() => {
      const now = Date.now();
      let bestDraw = nextDraws[0] || null;
      for (const d of nextDraws) {
        if (d.scheduledAt && new Date(d.scheduledAt).getTime() > now - 5000) {
          bestDraw = d;
          break;
        }
      }
      setNextDrawObj(bestDraw);

      if (!bestDraw?.scheduledAt) {
        setCountdown(0);
        return;
      }
      const diff = Math.floor((new Date(bestDraw.scheduledAt).getTime() - now) / 1000);
      setCountdown(diff > 0 ? diff : 0);
    }, 1000);
    return () => clearInterval(t);
  }, [nextDraws]);

  const nextDraw = nextDrawObj || nextDraws[0] || null;
  const upcomingDraws = nextDraws.filter(d => d.id !== nextDraw?.id);

  useEffect(() => {
    if (lastDrawEvent === 'draw_finished' && hadDrawInSession) {
      setPostDrawCycle(true);
    }
  }, [lastDrawEvent, hadDrawInSession]);

  useEffect(() => {
    if (drawActive) {
      setPostDrawCycle(false);
    }
  }, [drawActive]);

  useEffect(() => {
    if (postDrawCycle && countdown > 0 && countdown <= 30) {
      setPostDrawCycle(false);
    }
  }, [postDrawCycle, countdown]);

  const displayDraw = useMemo(() => nextDraw
    ? { ...(nextDraw as any), prizeLine1: (nextDraw as any).prizeLine1 || 0, prizeLine2: (nextDraw as any).prizeLine2 || 0, prizeLine3: (nextDraw as any).prizeLine3 || 0, ticketPrice: (nextDraw as any).ticketPrice || 0, incrementalId: (nextDraw as any).incrementalId || '---' }
    : { id: '---', incrementalId: '---', scheduledAt: null, prizeLine1: 0, prizeLine2: 0, prizeLine3: 0, ticketPrice: 0 }
    , [nextDraw]);

  const [soundOn, setSoundOn] = useState(true);
  const [lang, setLang] = useState<'pt' | 'es' | 'en'>('pt');

  useEffect(() => {
    audioService.setEnabled(soundOn);
  }, [soundOn]);

  useEffect(() => {
    audioService.setLanguage(lang);
  }, [lang]);

  useEffect(() => {
    if (currentBall && drawActive) {
      audioService.playBall(currentBall);
    }
  }, [currentBall, drawActive]);

  const [announcingWinner, setAnnouncingWinner] = useState<WinnerEvent | null>(null);
  const announcedRef = useRef<string | null>(null);
  useEffect(() => {
    if (winners.length > 0) {
      const last = winners[winners.length - 1];
      const winId = `${last.ticketId}-${last.type}`;
      if (winId !== announcedRef.current) {
        announcedRef.current = winId;
        setAnnouncingWinner(last);
        audioService.playWinner(last.type as any);
        setTimeout(() => setAnnouncingWinner(null), 8000);
      }
    }
  }, [winners]);

  const handleLogout = useCallback(async () => {
    await clearCredentials();
    navigation.replace('Lock');
  }, [navigation]);

  const loadingScreen = !drawActive && !postDrawCycle && !connected && nextDraws.length === 0;

  return (
    <LinearGradient colors={[theme.bgColor, theme.bgColor]} style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={theme.bgColor} />
      <SafeAreaView style={styles.safeArea}>

        {/* Header */}
        <TvHeader
          theme={theme}
          t={themeConfig}
          connected={connected}
          displayDraw={displayDraw}
          jackpotAmount={jackpotAmount}
          triggerBallLimit={triggerBallLimit}
          drawnNumbers={drawnNumbers}
          isInProgress={drawActive}
          onLogout={handleLogout}
          soundOn={soundOn}
          onToggleSound={() => setSoundOn(!soundOn)}
          lang={lang}
          onSelectLang={(l) => setLang(l)}
        />

        {/* Main content — drawActive tem prioridade absoluta */}
        {drawActive ? (
          <InGameView
            theme={theme}
            themeName={themeName}
            drawnNumbers={drawnNumbers}
            currentBall={currentBall}
            topPlayers={enrichedTopPlayers}
            jackpotAmount={jackpotAmount}
            triggerBallLimit={triggerBallLimit}
            displayDraw={displayDraw}
            topStage={topStage}
            winners={winners}
            myTickets={myTickets}
          />
        ) : loadingScreen ? (
          <LoadingView theme={theme} />
        ) : postDrawCycle ? (
          <PostDrawCycle
            theme={theme}
            winners={winners}
            drawnNumbers={drawnNumbers}
            nextDraws={nextDraws}
            hotDraws={hotDraws}
            jackpotInfo={jackpotInfo}
            promotions={promotions}
            onDone={() => setPostDrawCycle(false)}
          />
        ) : (
          <LobbyView
            theme={theme}
            nextDraw={nextDraw}
            countdown={countdown}
            upcomingDraws={upcomingDraws}
            jackpotAmount={jackpotAmount}
            jackpotInfo={jackpotInfo}
            triggerBallLimit={triggerBallLimit}
          />
        )}

        {/* Winner modal */}
        <WinnerModal winner={announcingWinner} drawnNumbers={drawnNumbers} theme={theme} />

      </SafeAreaView>
    </LinearGradient>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────
const TvScreen: React.FC<Props> = ({ navigation, route }) => {
  const params = (route?.params || {}) as Partial<NavParams>;
  const [credentials, setCredentials] = useState<NavParams | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (params.baseUrl && params.roomId) {
      setCredentials(params as NavParams);
    } else {
      const { getSavedCredentials, buildBaseUrl } = require('../services/storage');
      getSavedCredentials().then((creds: any) => {
        if (creds && creds.ip && creds.roomId) {
          setCredentials({
            baseUrl: buildBaseUrl(creds.ip, creds.port),
            roomId: creds.roomId,
            pin: creds.pin,
            theme: creds.theme,
          });
        } else {
          navigation.replace('Config');
        }
      }).catch(() => {
        navigation.replace('Config');
      });
    }
  }, [params.baseUrl, params.roomId, params.pin, params.theme, navigation]);

  const handleRestart = useCallback(() => {
    setKey(k => k + 1);
  }, []);

  if (!credentials) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0e1a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#7B3FE4" />
      </View>
    );
  }

  return (
    <GameSocketProvider key={key} baseUrl={credentials.baseUrl} roomId={credentials.roomId} pin={credentials.pin} onRestartEvent={handleRestart}>
      <TvScreenInner baseUrl={credentials.baseUrl} roomId={credentials.roomId} pin={credentials.pin} theme={credentials.theme} navigation={navigation} />
    </GameSocketProvider>
  );
};

export default TvScreen;

// ─── StyleSheet ───────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  safeArea: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 8,
    borderBottomWidth: 1, marginBottom: 4,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logoBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 15, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  connRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 1 },
  connDot: { width: 8, height: 8, borderRadius: 4 },
  connText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },

  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 10, borderWidth: 1, gap: 6,
  },
  headerBadgeLabel: { fontSize: 9, fontWeight: '900', letterSpacing: 1 },
  headerBadgeValue: { fontSize: 12, fontWeight: '900', fontFamily: 'monospace' },

  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  audioBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  langContainer: { flexDirection: 'row', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', padding: 2, gap: 2 },
  langChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  langText: { fontSize: 10, fontWeight: '900' },
  logoutBtn: { padding: 8, borderRadius: 10, borderWidth: 1 },

  // Loading
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 },
  loadingText: { fontSize: 16, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },

  // TriggerBallStar
  triggerStarBadge: { alignItems: 'center', justifyContent: 'center' },
  triggerStarInner: {
    borderRadius: 12, paddingHorizontal: 8, paddingVertical: 6,
    alignItems: 'center', justifyContent: 'center', gap: 2,
    minWidth: 44,
  },
  triggerStarNum: { fontSize: 14, fontWeight: '900', color: '#fff' },

  // JackpotTag (lobby)
  jackpotTag: { borderRadius: 18, borderWidth: 2, overflow: 'hidden', width: '100%' },
  jackpotTagGrad: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, gap: 8 },
  jackpotTagLabel: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  jackpotTagAmount: { fontSize: 22, fontWeight: '900' },

  // Lobby
  lobbyLandscapeWrapper: { flex: 1, flexDirection: 'row', padding: 10, gap: 10 },
  lobbyCountdownLandscape: { flex: 1, borderRadius: 22, borderWidth: 1.5, overflow: 'hidden' },
  lobbyScrollContent: { padding: 16, alignItems: 'center', gap: 12 },
  lobbyDrawListLandscape: { width: 300, borderRadius: 20, borderWidth: 1, padding: 14 },
  lobbyPortraitScroll: { flex: 1 },
  lobbyPortraitContent: { padding: 10, gap: 10 },
  lobbyCountdownPortrait: { borderRadius: 20, borderWidth: 1.5, padding: 16, alignItems: 'center', gap: 12 },
  lobbyDrawListPortrait: { borderRadius: 20, borderWidth: 1, padding: 14 },

  nextLabel: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  clockRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  colonSep: { fontSize: 44, fontWeight: '900', opacity: 0.5, marginHorizontal: 2 },
  triggerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  triggerLobbyLabel: { fontSize: 10, fontWeight: '700' },

  infoCard: { width: '100%', maxWidth: 400, borderRadius: 16, borderWidth: 1.5, overflow: 'hidden' },
  infoCardRow: { flexDirection: 'row', alignItems: 'stretch' },
  infoCardItem: { flex: 1, alignItems: 'center', padding: 12 },
  infoCaption: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  infoValue: { fontSize: 20, fontWeight: '900' },
  infoCardDivider: { width: 1 },
  prizesRow: { flexDirection: 'row', gap: 8, width: '100%' },
  prizeChip: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 10, alignItems: 'center', gap: 4 },
  prizeEmoji: { fontSize: 20 },
  prizeChipLabel: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  prizeChipValue: { fontSize: 13, fontWeight: '900' },

  upcomingTitle: { fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  upcomingScroll: { flex: 1 },
  upcomingItem: { borderRadius: 12, borderWidth: 1, marginBottom: 7, paddingVertical: 7, paddingHorizontal: 9 },
  upcomingTopRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  upcomingIdTimeRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flex: 1 },
  upcomingId: { fontSize: 11, fontWeight: '900', fontFamily: 'monospace' },
  upcomingTime: { fontSize: 14, fontWeight: '900' },
  upcomingPrizes: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  upcomingPrizeText: { fontSize: 10, fontWeight: '900' },
  upcomingEmpty: { textAlign: 'center', fontSize: 11, fontWeight: '700', marginTop: 16 },
  hotBadgeSmall: { backgroundColor: '#ff6b00', borderRadius: 5, paddingHorizontal: 5, paddingVertical: 1, alignSelf: 'flex-start' },
  hotBadgeSmallText: { fontSize: 7, fontWeight: '900', color: '#fff', textTransform: 'uppercase' },

  // ── InGame Layout (3 Seções + Coluna Vertical) ────────────────────────────
  inGameLandscapeWrapper: {
    flex: 1, flexDirection: 'row', padding: 8, gap: 8,
  },
  inGamePortraitWrapper: {
    flex: 1, flexDirection: 'column', padding: 8, gap: 8,
  },
  inGameMainColumn: {
    flex: 1, gap: 8,
  },
  inGameVerticalRightColumn: {
    width: 270, gap: 8,
  },

  // 1️⃣ Seção 1: Bola Atual + Últimas 4 bolas
  sectionBallPanel: {
    borderRadius: 18, borderWidth: 1.5, overflow: 'hidden', minHeight: 175,
  },

  // 2️⃣ Seção 2: Prêmios + Jackpot
  sectionPrizesJackpotRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, borderWidth: 1, padding: 8, gap: 8,
  },
  prizesSubRow: {
    flex: 2, flexDirection: 'row', gap: 6,
  },
  prizeCardItem: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, borderWidth: 1.5,
    paddingHorizontal: 8, paddingVertical: 8, gap: 6,
  },
  prizeEmojiText: { fontSize: 18 },
  prizeLabelText: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  prizeValueText: { fontSize: 13, fontWeight: '900' },

  jackpotCardItem: {
    flex: 1.2, flexDirection: 'row', alignItems: 'center',
    borderRadius: 12, borderWidth: 1.5,
    paddingHorizontal: 10, paddingVertical: 8, gap: 8,
  },
  jackpotLabelText: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  jackpotValueText: { fontSize: 15, fontWeight: '900' },
  triggerBadgeInline: { alignItems: 'center', justifyContent: 'center' },

  // 3️⃣ Seção 3: Grade 90 Pedras
  sectionGridPanel: {
    flex: 1, borderRadius: 18, borderWidth: 1, padding: 4, justifyContent: 'center',
  },

  // Coluna Vertical da Direita: Top Winner + Top My Card
  topWinnerBox: {
    flex: 1.3, borderRadius: 18, borderWidth: 1, padding: 10,
  },
  topMyCardBox: {
    flex: 1, borderRadius: 18, borderWidth: 1, padding: 4,
  },
  sidebarHeaderRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8,
  },
  sidebarTitle: {
    fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.5, flex: 1, marginLeft: 6,
  },
  liveChip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  liveText: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
});
