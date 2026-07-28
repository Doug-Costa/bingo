/**
 * MyTicketsPanel.tsx — Top My Card (Cartelas do jogador em destaque)
 *
 * Exibe as cartelas do jogador com contagem de pedras faltantes e sinalização da mais próxima.
 */
import React, { useEffect, useRef, useMemo } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MyTicket, Top10Player } from '../contexts/SSEContext';
import { ThemeTokens, alphaColor } from '../theme/themes';
import Icon from './Icon';

interface MyTicketsPanelProps {
  tickets: MyTicket[];
  drawnNumbers: number[];
  currentBall: number | null;
  topPlayers: Top10Player[];
  theme: ThemeTokens;
  layout?: 'vertical' | 'horizontal';
}

function useShakeAnim(active: boolean) {
  const anim = useRef(new Animated.Value(0)).current;
  const loop = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (active) {
      loop.current = Animated.loop(
        Animated.sequence([
          Animated.timing(anim, { toValue: -4, duration: 60, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 4, duration: 60, useNativeDriver: true }),
          Animated.timing(anim, { toValue: -3, duration: 60, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 3, duration: 60, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 60, useNativeDriver: true }),
          Animated.delay(1800),
        ]),
      );
      loop.current.start();
    } else {
      loop.current?.stop();
      anim.setValue(0);
    }
    return () => { loop.current?.stop(); };
  }, [active, anim]);

  return anim;
}

function TicketCard({
  ticket,
  drawnNumbers,
  currentBall,
  isClosest,
  theme,
}: {
  ticket: MyTicket;
  drawnNumbers: number[];
  currentBall: number | null;
  isClosest: boolean;
  theme: ThemeTokens;
}) {
  const shakeAnim = useShakeAnim(isClosest);

  // Normalização ultra-segura de ticket.numbers (trata 1D array, 2D array, strings)
  const formattedLines = useMemo<number[][]>(() => {
    if (!ticket || !ticket.numbers) return [];
    let raw = ticket.numbers as any;
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch { return []; }
    }
    if (!Array.isArray(raw) || raw.length === 0) return [];

    // Se for 1D array (ex: [1, 2, 3, ... 15])
    if (typeof raw[0] === 'number') {
      const nums = raw as number[];
      const lines: number[][] = [];
      const chunkSize = Math.ceil(nums.length / 3) || 5;
      for (let i = 0; i < nums.length; i += chunkSize) {
        lines.push(nums.slice(i, i + chunkSize));
      }
      return lines;
    }

    // Se for 2D array
    return raw
      .map((line: any) => {
        if (Array.isArray(line)) return line.map(n => Number(n)).filter(n => !isNaN(n));
        if (typeof line === 'number') return [line];
        return [];
      })
      .filter((line: number[]) => line.length > 0);
  }, [ticket]);

  // Calcular quantos números faltam para a melhor linha
  const missingCounts = useMemo(() => {
    if (formattedLines.length === 0) return [15];
    return formattedLines.map(
      line => line.filter(n => !drawnNumbers.includes(n)).length,
    );
  }, [formattedLines, drawnNumbers]);

  const bestMissing = missingCounts.length > 0 ? Math.min(...missingCounts) : 15;

  const borderColor = isClosest
    ? theme.success
    : bestMissing <= 2
      ? alphaColor(theme.primary, 'aa')
      : theme.borderMuted;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          borderColor,
          backgroundColor: isClosest ? alphaColor(theme.success, '15') : 'rgba(0,0,0,0.35)',
          transform: [{ translateX: shakeAnim }],
        },
      ]}
    >
      {/* Badge "QUASE!" */}
      {isClosest && (
        <View style={[styles.closestBadge, { backgroundColor: theme.success }]}>
          <Icon name="fire" size={10} color="#000" />
          <Text style={styles.closestBadgeText}>QUASE!</Text>
        </View>
      )}

      {/* Identificador da cartela */}
      <View style={styles.cardHeader}>
        <Text style={[styles.cardIdText, { color: theme.textMuted }]}>
          #{(ticket.id || '').substring(0, 6)}
        </Text>
      </View>

      {/* Grade de números da cartela */}
      {formattedLines.map((line, lineIdx) => (
        <View key={lineIdx} style={styles.ticketLine}>
          {line.map((num, numIdx) => {
            const isDrawn = drawnNumbers.includes(num);
            const isCurrent = num === currentBall;

            return (
              <View
                key={numIdx}
                style={[
                  styles.numCell,
                  {
                    backgroundColor: isCurrent
                      ? theme.primary
                      : isDrawn
                        ? theme.gridDrawn
                        : theme.gridEmpty,
                    borderColor: isCurrent
                      ? theme.primary
                      : isDrawn
                        ? alphaColor(theme.success, '99')
                        : 'rgba(255,255,255,0.06)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.numText,
                    {
                      color: isCurrent
                        ? '#000000'
                        : isDrawn
                          ? '#ffffff'
                          : 'rgba(255,255,255,0.25)',
                      fontWeight: isCurrent || isDrawn ? '900' : '700',
                    },
                  ]}
                >
                  {num}
                </Text>
              </View>
            );
          })}
        </View>
      ))}

      {/* Faltam X pedras */}
      <View style={styles.missingRow}>
        <Text style={[styles.missingLabel, { color: theme.textMuted }]}>
          Faltam:{' '}
          <Text style={{ color: bestMissing <= 2 ? theme.success : theme.primary, fontWeight: '900' }}>
            {bestMissing} pedras
          </Text>
        </Text>
      </View>
    </Animated.View>
  );
}

const MyTicketsPanel: React.FC<MyTicketsPanelProps> = ({
  tickets,
  drawnNumbers,
  currentBall,
  topPlayers,
  theme,
  layout = 'vertical',
}) => {
  const displayTickets = useMemo(() => {
    if (!Array.isArray(tickets)) return [];
    return tickets.slice(0, 3);
  }, [tickets]);

  const closestTicketId = useMemo(() => {
    if (displayTickets.length === 0 || !Array.isArray(topPlayers)) return null;
    const myIds = new Set(displayTickets.map(t => t.id));
    const found = topPlayers.find(p => p && p.ticketId && myIds.has(p.ticketId));
    return found?.ticketId ?? null;
  }, [topPlayers, displayTickets]);

  if (displayTickets.length === 0) {
    return (
      <View style={[styles.emptyContainer, { borderColor: theme.borderMuted }]}>
        <Icon name="cards" size={18} color={theme.textMuted} />
        <Text style={[styles.emptyTitle, { color: theme.textMuted }]}>TOP MY CARD</Text>
        <Text style={[styles.emptySub, { color: theme.textMuted }]}>Sem cartelas nesta rodada</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { borderColor: theme.borderSecondary, backgroundColor: theme.glassBg }]}>
      <View style={styles.headerTitleRow}>
        <Icon name="cards" size={14} color={theme.primary} />
        <Text style={[styles.title, { color: theme.primary }]}>TOP MY CARD</Text>
      </View>

      <ScrollView
        horizontal={layout === 'horizontal'}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {displayTickets.map(ticket => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            drawnNumbers={drawnNumbers}
            currentBall={currentBall}
            isClosest={ticket.id === closestTicketId}
            theme={theme}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
    maxHeight: 260,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
  },
  title: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  scrollContent: {
    gap: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 6,
    position: 'relative',
  },
  cardHeader: {
    alignItems: 'flex-end',
    marginBottom: 2,
  },
  cardIdText: {
    fontSize: 8,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  closestBadge: {
    position: 'absolute',
    top: -8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 10,
  },
  closestBadgeText: {
    fontSize: 8,
    fontWeight: '900',
    color: '#000000',
    textTransform: 'uppercase',
  },
  ticketLine: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 3,
  },
  numCell: {
    flex: 1,
    height: 22,
    borderRadius: 4,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    fontSize: 9,
  },
  missingRow: {
    marginTop: 2,
    alignItems: 'center',
  },
  missingLabel: {
    fontSize: 8,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyContainer: {
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  emptySub: {
    fontSize: 9,
  },
});

export default MyTicketsPanel;
