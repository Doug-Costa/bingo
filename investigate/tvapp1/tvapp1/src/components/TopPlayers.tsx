/**
 * TopPlayers.tsx — Ranking TOP WINNER (Top 10 jogadores mais próximos)
 */
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Top10Player } from '../contexts/SSEContext';
import { ThemeTokens, alphaColor } from '../theme/themes';
import Icon from './Icon';

interface TopPlayersProps {
  players: Top10Player[];
  theme: ThemeTokens;
}

const TopPlayers: React.FC<TopPlayersProps> = ({ players, theme }) => {
  if (players.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="trophy" size={24} color={theme.textMuted} />
        <Text style={[styles.emptyText, { color: theme.textMuted }]}>AGUARDANDO SORTEIO...</Text>
      </View>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={styles.scroll}>
      {players.map((p, i) => {
        const isAlmostThere = p.minNumbersLeft <= 3;
        const isTop = i === 0;

        return (
          <View
            key={p.ticketId}
            style={[
              styles.card,
              {
                backgroundColor: isTop ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.025)',
                borderColor: isAlmostThere ? theme.success : theme.borderMuted,
              },
            ]}
          >
            {/* Row: Rank + Nome + Badge */}
            <View style={styles.row}>
              <View
                style={[
                  styles.rankBadge,
                  {
                    backgroundColor: isTop ? theme.primary : 'rgba(0,0,0,0.5)',
                    borderColor: isTop ? theme.accent : theme.borderMuted,
                  },
                ]}
              >
                {isTop ? (
                  <Icon name="crown" size={14} color={theme.ballText} />
                ) : (
                  <Text style={[styles.rankText, { color: theme.textPrimary }]}>
                    {i + 1}
                  </Text>
                )}
              </View>

              <View style={styles.playerInfo}>
                <Text style={[styles.playerName, { color: theme.textPrimary }]} numberOfLines={1}>
                  {p.playerName || 'COMPRADOR'}
                </Text>
                <Text style={[styles.playerId, { color: theme.textMuted }]}>
                  ID: {p.ticketId.substring(0, 6)}
                </Text>
              </View>

              {isAlmostThere && (
                <View style={[styles.almostBadge, { backgroundColor: alphaColor(theme.success, '22'), borderColor: alphaColor(theme.success, '88') }]}>
                  <Icon name="fire" size={10} color={theme.success} />
                  <Text style={[styles.almostText, { color: theme.success }]}>
                    FALTAM {p.minNumbersLeft}
                  </Text>
                </View>
              )}
            </View>

            {/* Pedras faltantes */}
            {p.missingNumbers && p.missingNumbers.length > 0 ? (
              <View style={styles.missingContainer}>
                <View style={styles.missingNumbersRow}>
                  {p.missingNumbers.map((mn, idx) => (
                    <View
                      key={idx}
                      style={[
                        styles.missingNumBubble,
                        {
                          backgroundColor: p.minNumbersLeft <= 2 ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.4)',
                          borderColor: p.minNumbersLeft <= 2 ? theme.success : theme.borderMuted,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.missingNumText,
                          { color: p.minNumbersLeft <= 2 ? theme.success : theme.textPrimary },
                        ]}
                      >
                        {mn}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : null}
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scroll: { flex: 1 },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', opacity: 0.4, gap: 8, paddingVertical: 20 },
  emptyText: { fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    marginBottom: 6,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: { fontSize: 11, fontWeight: '900' },
  playerInfo: { flex: 1, minWidth: 0 },
  playerName: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  playerId: { fontSize: 8, fontWeight: '900', fontFamily: 'monospace' },
  almostBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
  },
  almostText: { fontSize: 8, fontWeight: '900', textTransform: 'uppercase' },
  missingContainer: { borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: 5, marginTop: 5 },
  missingNumbersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 3 },
  missingNumBubble: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missingNumText: { fontSize: 9, fontWeight: '900' },
});

export default TopPlayers;
