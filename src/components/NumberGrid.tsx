/**
 * NumberGrid.tsx — Contagem das 90 pedras (bolas) do bingo
 *
 * Pedras não sorteadas: meia apagadas (translúcidas/escuras)
 * Pedras sorteadas: pintadas de amarelo vibrante com número em destaque
 */
import React from 'react';
import { FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { ThemeTokens } from '../theme/themes';
import Icon from './Icon';

interface NumberGridProps {
  drawnNumbers: number[];
  currentBall: number | null;
  theme: ThemeTokens;
}

const NUMBERS = Array.from({ length: 90 }, (_, i) => i + 1);
const COLUMNS = 18;

const NumberGrid: React.FC<NumberGridProps> = ({ drawnNumbers, currentBall, theme }) => {
  const { width } = useWindowDimensions();

  // Calcular tamanho responsivo da célula
  const cellSize = Math.max(14, Math.min(26, Math.floor((width * 0.65 - 32) / COLUMNS)));

  const renderItem = ({ item: n }: { item: number }) => {
    const isDrawn   = drawnNumbers.includes(n);
    const isCurrent = currentBall === n;

    // Cores: Amarelo para sorteadas / Meia apagadas para não sorteadas
    const yellowBg = isCurrent ? '#ffde38' : '#facc15';
    const yellowBorder = isCurrent ? '#ffffff' : '#eab308';

    return (
      <View
        style={[
          styles.cell,
          {
            width: cellSize,
            height: cellSize,
            borderRadius: cellSize / 2,
            backgroundColor: isDrawn ? yellowBg : 'rgba(255, 255, 255, 0.05)',
            borderColor: isDrawn ? yellowBorder : 'rgba(255, 255, 255, 0.08)',
            opacity: isDrawn ? 1 : 0.35,
            shadowColor: isCurrent ? '#facc15' : 'transparent',
            shadowOpacity: isCurrent ? 1 : 0,
            shadowRadius: isCurrent ? 8 : 0,
            elevation: isCurrent ? 6 : 0,
          },
        ]}
      >
        <Text
          style={[
            styles.cellText,
            {
              fontSize: Math.max(8, cellSize * 0.44),
              color: isDrawn ? '#000000' : 'rgba(255, 255, 255, 0.5)',
              fontWeight: isDrawn ? '900' : '600',
            },
          ]}
        >
          {n}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Icon name="grid" size={14} color={theme.textMuted} />
        <Text style={[styles.gridTitle, { color: theme.textMuted }]}>
          CONTAGEM DAS 90 PEDRAS ({drawnNumbers.length}/90)
        </Text>
      </View>

      <FlatList
        data={NUMBERS}
        renderItem={renderItem}
        keyExtractor={item => String(item)}
        numColumns={COLUMNS}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.gridContainer}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 6,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 6,
  },
  gridTitle: {
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  gridContainer: {
    alignItems: 'center',
  },
  row: {
    marginBottom: 3,
    gap: 2,
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  cellText: {
    textAlign: 'center',
  },
});

export default NumberGrid;
