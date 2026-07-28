import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useBingoStore } from './store/useBingoStore';
import { useSecretTrigger } from './hooks/useSecretTrigger';
import { generateRandomBall } from './utils/generateRandomBall';

import { Header } from './components/layout/Header';
import { FooterTicker } from './components/layout/FooterTicker';
import { GiantBall } from './components/bingo/GiantBall';
import { PreviousBalls } from './components/bingo/PreviousBalls';
import { NumberGrid } from './components/bingo/NumberGrid';
import { PrizeCard } from './components/bingo/PrizeCard';
import { HiddenAdminModal } from './components/admin/HiddenAdminModal';

export default function App() {
  const {
    isDemoMode,
    ballsDrawn,
    demoInterval,
    addBall,
    setDemoMode,
  } = useBingoStore();

  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Initialize the Secret Trigger hook
  const { handleLogoClick } = useSecretTrigger({
    onTrigger: () => {
      setIsAdminOpen(true);
    },
  });

  // Demo Simulation loop
  useEffect(() => {
    if (!isDemoMode) return;

    const tick = () => {
      const nextBall = generateRandomBall(ballsDrawn);
      if (nextBall === null) {
        // All numbers drawn, turn off demo mode
        setDemoMode(false);
        return;
      }
      addBall(nextBall);
    };

    const intervalId = setInterval(tick, demoInterval * 1000);
    return () => clearInterval(intervalId);
  }, [isDemoMode, ballsDrawn, demoInterval, addBall, setDemoMode]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" />

      {/* 1. Header */}
      <Header onLogoClick={handleLogoClick} />

      {/* 2. Main Area */}
      <View style={styles.main}>
        {/* Left Column (40% width) - Giant Ball & History */}
        <View style={styles.leftColumn}>
          <GiantBall />
          <PreviousBalls />
        </View>

        {/* Right Column (60% width) - Number Board & Prize Details */}
        <View style={styles.rightColumn}>
          <NumberGrid />
          <PrizeCard />
        </View>
      </View>

      {/* 3. Footer Ticker */}
      <FooterTicker />

      {/* 4. Hidden Admin Control Modal */}
      <HiddenAdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  main: {
    flex: 1,
    flexDirection: 'row',
  },
  leftColumn: {
    flex: 4,
    borderRightWidth: 1,
    borderRightColor: 'rgba(46, 48, 58, 0.15)',
    backgroundColor: 'rgba(20, 20, 22, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rightColumn: {
    flex: 6,
    backgroundColor: 'rgba(19, 19, 21, 0.4)',
    padding: 12,
    justifyContent: 'space-between',
  },
});
