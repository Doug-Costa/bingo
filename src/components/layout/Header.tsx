import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useBingoStore } from '../../store/useBingoStore';
import { Tv, Clock } from 'lucide-react-native';

interface HeaderProps {
  onLogoClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLogoClick }) => {
  const { ballsDrawn, isDemoMode } = useBingoStore();
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.header}>
      {/* Left: Logo */}
      <TouchableOpacity
        onPress={onLogoClick}
        activeOpacity={0.8}
        style={styles.logoContainer}
      >
        <View style={styles.iconBox}>
          <Tv size={22} color="#00FF7F" />
          {isDemoMode && <View style={styles.demoDot} />}
        </View>
        <View style={styles.logoTextContainer}>
          <Text style={styles.logoMainText}>
            BINGO <Text style={styles.logoHighlightText}>LUZ</Text>
          </Text>
          <Text style={styles.logoSubText}>Sistema de TV</Text>
        </View>
      </TouchableOpacity>

      {/* Center: Round Details */}
      <View style={styles.roundCard}>
        <Text style={styles.roundText}>
          RODADA 05 <Text style={styles.bullet}>•</Text> CARTELA CHEIA
        </Text>
      </View>

      {/* Right: Clock & Ball Count */}
      <View style={styles.rightSection}>
        {/* Clock */}
        <View style={styles.clockContainer}>
          <Clock size={15} color="#00FF7F" style={styles.clockIcon} />
          <Text style={styles.clockText}>{time}</Text>
        </View>

        {/* Counter */}
        <View style={styles.counterContainer}>
          <Text style={styles.counterLabel}>Bolas:</Text>
          <View style={styles.counterDisplay}>
            <Text style={styles.counterCurrent}>
              {ballsDrawn.length.toString().padStart(2, '0')}
            </Text>
            <Text style={styles.counterSeparator}>/</Text>
            <Text style={styles.counterMax}>75</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: '#151518',
    borderBottomWidth: 1,
    borderBottomColor: '#2e303a',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 255, 127, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 127, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  demoDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    borderWidth: 1,
    borderColor: '#151518',
  },
  logoTextContainer: {
    marginLeft: 10,
  },
  logoMainText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  logoHighlightText: {
    color: '#00FF7F',
  },
  logoSubText: {
    fontSize: 8,
    color: '#71717a',
    textTransform: 'uppercase',
    letterSpacing: 2,
    fontWeight: '600',
    marginTop: 1,
  },
  roundCard: {
    backgroundColor: '#09090b',
    borderColor: '#27272a',
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  roundText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#e4e4e7',
    letterSpacing: 1.5,
  },
  bullet: {
    color: '#FFD700',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090b',
    borderColor: '#18181b',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 15,
  },
  clockIcon: {
    marginRight: 6,
  },
  clockText: {
    fontSize: 12,
    color: '#d4d4d8',
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  counterLabel: {
    fontSize: 10,
    color: '#a1a1aa',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginRight: 8,
  },
  counterDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#09090b',
    borderColor: 'rgba(0, 255, 127, 0.15)',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  counterCurrent: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#00FF7F',
  },
  counterSeparator: {
    fontSize: 10,
    color: '#52525b',
    marginHorizontal: 2,
  },
  counterMax: {
    fontSize: 11,
    fontWeight: '600',
    color: '#a1a1aa',
  },
});
