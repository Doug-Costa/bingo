import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

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

function getBallColors(n: number) {
  if (n <= 15) {
    return {
      colors: ['#a0e6ff', '#0091ea', '#003666'],
      borderColor: '#00f3ff',
      glowColor: 'rgba(0, 243, 255, 0.8)',
    };
  }
  if (n <= 30) {
    return {
      colors: ['#ff8a8a', '#d50000', '#5a0000'],
      borderColor: '#ff4d4d',
      glowColor: 'rgba(213, 0, 0, 0.8)',
    };
  }
  if (n <= 45) {
    return {
      colors: ['#b2ffb2', '#00c853', '#005a10'],
      borderColor: '#00e676',
      glowColor: 'rgba(0, 200, 83, 0.8)',
    };
  }
  if (n <= 60) {
    return {
      colors: ['#fffd8d', '#ffd600', '#8c6d00'],
      borderColor: '#ffea00',
      glowColor: 'rgba(255, 214, 0, 0.8)',
    };
  }
  if (n <= 75) {
    return {
      colors: ['#f7c0ff', '#aa00ff', '#4a0072'],
      borderColor: '#e040fb',
      glowColor: 'rgba(170, 0, 255, 0.8)',
    };
  }
  return {
    colors: ['#ffe082', '#ffab00', '#8c4400'],
    borderColor: '#ffb300',
    glowColor: 'rgba(255, 143, 0, 0.8)',
  };
}

export const Ball: React.FC<BallProps> = ({ number, size = 'lg', active = false, animate = true }) => {
  const sz = SIZES[size];
  const ballConfig = getBallColors(number);
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
      styles.ballContainer,
      {
        width: sz.diameter,
        height: sz.diameter,
        shadowColor: active ? '#00f3ff' : ballConfig.glowColor,
        shadowRadius: active ? 16 : 8,
        shadowOpacity: 0.8,
        elevation: active ? 12 : 8,
        transform: [{ scale: scaleAnim }, { rotate: spin }],
      },
    ]}>
      <LinearGradient
        colors={active ? ['#ff5252', '#ff1744', '#b71c1c'] : ballConfig.colors}
        start={{ x: 0.25, y: 0.25 }}
        end={{ x: 0.85, y: 0.85 }}
        style={[
          styles.ballGradient,
          {
            width: sz.diameter,
            height: sz.diameter,
            borderRadius: sz.diameter / 2,
            borderColor: active ? '#00f3ff' : ballConfig.borderColor,
            borderWidth: size === 'xl' || size === 'lg' ? 4 : 1.5,
          }
        ]}
      >
        {/* Specular inner highlight gloss */}
        <View style={[styles.glint, { width: sz.diameter * 0.32, height: sz.diameter * 0.22 }]} />
        {/* Number */}
        <Text style={[styles.number, { fontSize: sz.fontSize, color: '#ffffff' }]}>
          {number}
        </Text>
      </LinearGradient>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  ballContainer: {
    shadowOffset: { width: 0, height: 4 },
  },
  ballGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  glint: {
    position: 'absolute',
    top: '8%',
    left: '12%',
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 100,
    transform: [{ rotate: '-35deg' }],
  },
  number: {
    fontWeight: '900',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
});

export default Ball;
