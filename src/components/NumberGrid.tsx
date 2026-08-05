/**
 * NumberGrid.tsx — Contagem das 90 pedras (bolas) do bingo
 *
 * Pedras não sorteadas: meia apagadas (translúcidas/escuras)
 * Pedras sorteadas: pintadas de amarelo vibrante com número em destaque
 */
import React from 'react';
import { FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
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

  const getBallColors = (n: number, isCurrent: boolean) => {
    if (isCurrent) {
      return {
        colors: ['#ff5252', '#ff1744', '#b71c1c'],
        textColor: '#ffffff',
        borderColor: '#00f3ff',
        glowColor: '#ff1744',
      };
    }
    if (n <= 15) {
      return {
        colors: ['#a0e6ff', '#0091ea', '#0060a3'],
        textColor: '#ffffff',
        borderColor: '#00f3ff',
        glowColor: '#00f3ff',
      };
    }
    if (n <= 30) {
      return {
        colors: ['#ff8a8a', '#d50000', '#900000'],
        textColor: '#ffffff',
        borderColor: '#ff4d4d',
        glowColor: '#d50000',
      };
    }
    if (n <= 45) {
      return {
        colors: ['#b2ffb2', '#00c853', '#008f30'],
        textColor: '#ffffff',
        borderColor: '#00e676',
        glowColor: '#00c853',
      };
    }
    if (n <= 60) {
      return {
        colors: ['#fffd8d', '#ffd600', '#c6a000'],
        textColor: '#ffffff',
        borderColor: '#ffea00',
        glowColor: '#ffd600',
      };
    }
    if (n <= 75) {
      return {
        colors: ['#f7c0ff', '#aa00ff', '#7600b3'],
        textColor: '#ffffff',
        borderColor: '#e040fb',
        glowColor: '#aa00ff',
      };
    }
    return {
      colors: ['#ffe082', '#ffab00', '#c66900'],
      textColor: '#ffffff',
      borderColor: '#ffb300',
      glowColor: '#ffab00',
    };
  };

  const renderItem = ({ item: n }: { item: number }) => {
    const isDrawn   = drawnNumbers.includes(n);
    const isCurrent = currentBall === n;

    const ballConfig = isDrawn
      ? getBallColors(n, isCurrent)
      : {
          colors: ['#ffffff', '#f4f8fc', '#dce7f5', '#b2cbe8'],
          textColor: '#002d6b',
          borderColor: 'rgba(0, 243, 255, 0.4)',
          glowColor: 'rgba(0, 243, 255, 0.35)',
        };

    return (
      <View
        style={[
          styles.cellContainer,
          {
            width: cellSize,
            height: cellSize,
            shadowColor: ballConfig.glowColor,
            shadowOpacity: isDrawn ? 0.8 : 0.45,
            shadowRadius: isDrawn ? 5 : 2.5,
            shadowOffset: { width: 0, height: 0 },
            elevation: isDrawn ? 4 : 1,
          }
        ]}
      >
        <LinearGradient
          colors={ballConfig.colors}
          start={{ x: 0.25, y: 0.25 }}
          end={{ x: 0.85, y: 0.85 }}
          style={[
            styles.cellGradient,
            {
              width: cellSize,
              height: cellSize,
              borderRadius: cellSize / 2,
              borderColor: ballConfig.borderColor,
              borderWidth: 1,
            },
          ]}
        >
          <Text
            style={[
              styles.cellText,
              {
                fontSize: Math.max(8, cellSize * 0.44),
                color: ballConfig.textColor,
                fontWeight: '900',
              },
            ]}
          >
            {n}
          </Text>
        </LinearGradient>
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
  cellContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellGradient: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: {
    textAlign: 'center',
  },
});

export default NumberGrid;
