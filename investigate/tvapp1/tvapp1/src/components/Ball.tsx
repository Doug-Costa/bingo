/**
 * Ball.tsx — Bola de bingo animada para React Native
 * Equivalente ao Ball do Next (motion.div) — usa Animated + react-native-svg
 */
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

type BallSize = 'sm' | 'md' | 'lg' | 'xl';

interface BallProps {
  number: number;
  size?: BallSize;
  active?: boolean;
  animate?: boolean;
}

const SIZES = {
  sm:  { diameter: 32,  fontSize: 11  },
  md:  { diameter: 52,  fontSize: 18  },
  lg:  { diameter: 176, fontSize: 72  },
  xl:  { diameter: 220, fontSize: 110 },
};

function getBallColors(n: number): [string, string, string] {
  if (n <= 18) { return ['#fef08a', '#facc15', '#ca8a04']; }   // amarelo
  if (n <= 36) { return ['#6ee7b7', '#10b981', '#064e3b']; }   // verde
  if (n <= 54) { return ['#fca5a5', '#ef4444', '#7f1d1d']; }   // vermelho
  if (n <= 72) { return ['#93c5fd', '#3b82f6', '#1e3a5f']; }   // azul
  return              ['#d8b4fe', '#a855f7', '#4c1d95'];        // roxo
}

export const Ball: React.FC<BallProps> = ({ number, size = 'lg', active = false, animate = true }) => {
  const sz = SIZES[size];
  const [light, mid, dark] = getBallColors(number);
  const scaleAnim = useRef(new Animated.Value(animate ? 0 : 1)).current;
  const rotateAnim = useRef(new Animated.Value(animate ? -180 : 0)).current;

  useEffect(() => {
    if (!animate) { return; }
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, tension: 150, friction: 10, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: 0, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [animate, scaleAnim, rotateAnim]);

  const spin = rotateAnim.interpolate({ inputRange: [-180, 0], outputRange: ['-180deg', '0deg'] });

  return (
    <Animated.View style={[
      styles.ball,
      {
        width: sz.diameter, height: sz.diameter, borderRadius: sz.diameter / 2,
        backgroundColor: active ? '#facc15' : mid,
        shadowColor: active ? '#facc15' : dark,
        transform: [{ scale: scaleAnim }, { rotate: spin }],
      },
    ]}>
      {/* Brilho superior */}
      <View style={[styles.glint, { width: sz.diameter * 0.32, height: sz.diameter * 0.22 }]} />
      {/* Número */}
      <Text style={[styles.number, { fontSize: sz.fontSize, color: active ? '#000000' : '#ffffff' }]}>
        {number}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  ball: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  glint: {
    position: 'absolute',
    top: '8%',
    left: '12%',
    backgroundColor: 'rgba(255,255,255,0.5)',
    borderRadius: 100,
    transform: [{ rotate: '-35deg' }],
  },
  number: {
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default Ball;
