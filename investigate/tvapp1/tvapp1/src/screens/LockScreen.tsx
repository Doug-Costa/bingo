/**
 * LockScreen.tsx — Tela de senha local (102030) para acessar configurações
 * Visual premium com gradiente escuro e animações suaves
 */
import React, { useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';

const SECRET_PASSWORD = '102030';

type Props = {
  navigation: StackNavigationProp<any>;
  route?: any;
};

const LockScreen: React.FC<Props> = ({ navigation, route }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const { width } = useWindowDimensions();

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  };

  const handleSubmit = () => {
    if (code === SECRET_PASSWORD) {
      setError(false);
      navigation.navigate('Config');
    } else {
      setError(true);
      shake();
      setTimeout(() => { setCode(''); setError(false); }, 1500);
    }
  };

  // Keyboard: dots
  const dots = [1, 2, 3, 4, 5, 6];

  return (
    <LinearGradient colors={['#0a0e1a', '#131929', '#0a0e1a']} style={styles.grad}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>

          {/* Background glow */}
          <View style={styles.glowTopLeft} />
          <View style={styles.glowBottomRight} />

          {/* Botão voltar — canNavigateBack */}
          {navigation.canGoBack() && (
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.8}
            >
              <Text style={styles.backBtnText}>← Voltar</Text>
            </TouchableOpacity>
          )}

          <Animated.View style={[styles.card, { transform: [{ translateX: shakeAnim }] }]}>
            {/* Icon */}
            <LinearGradient
              colors={['#7B3FE4', '#2D1B69']}
              style={styles.iconContainer}
            >
              <Text style={styles.iconText}>📺</Text>
            </LinearGradient>

            <Text style={styles.title}>TVAPP1</Text>
            <Text style={styles.subtitle}>PAINEL DE CONFIGURAÇÃO</Text>

            {/* Dots display */}
            <View style={styles.dotsRow}>
              {dots.map((_, i) => (
                <View
                  key={i}
                  style={[
                    styles.dot,
                    i < code.length
                      ? { backgroundColor: error ? '#ef4444' : '#7B3FE4', borderColor: error ? '#ef4444' : '#A855F7' }
                      : styles.dotEmpty,
                  ]}
                />
              ))}
            </View>

            {error && (
              <Text style={styles.errorText}>Senha incorreta</Text>
            )}

            {/* Hidden numeric input */}
            <TextInput
              style={styles.hiddenInput}
              value={code}
              onChangeText={v => { setCode(v.slice(0, 6)); setError(false); }}
              keyboardType="number-pad"
              maxLength={6}
              autoFocus
              onSubmitEditing={handleSubmit}
              secureTextEntry
            />

            {/* Confirm button */}
            <TouchableOpacity style={styles.btn} onPress={handleSubmit} activeOpacity={0.8}>
              <LinearGradient colors={['#7B3FE4', '#4B2FA0']} style={styles.btnGrad}>
                <Text style={styles.btnText}>CONFIRMAR</Text>
              </LinearGradient>
            </TouchableOpacity>

            <Text style={styles.hint}>Digite a senha de acesso</Text>
          </Animated.View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  grad: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },

  glowTopLeft: {
    position: 'absolute', top: -100, left: -100,
    width: 400, height: 400, borderRadius: 200,
    backgroundColor: 'rgba(123,63,228,0.08)',
  },
  glowBottomRight: {
    position: 'absolute', bottom: -100, right: -100,
    width: 350, height: 350, borderRadius: 175,
    backgroundColor: 'rgba(75,47,160,0.06)',
  },

  card: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: 'rgba(19,25,41,0.95)',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(123,63,228,0.3)',
    padding: 32,
    alignItems: 'center',
    shadowColor: '#7B3FE4',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 40,
    elevation: 20,
  },

  iconContainer: {
    width: 80, height: 80, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#7B3FE4',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  iconText: { fontSize: 36 },

  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#F1F5F9',
    letterSpacing: 4,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#475569',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 32,
  },

  dotsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dot: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2,
    borderColor: '#7B3FE4',
    backgroundColor: '#7B3FE4',
  },
  dotEmpty: {
    backgroundColor: 'transparent',
    borderColor: 'rgba(123,63,228,0.3)',
  },

  errorText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#ef4444',
    marginBottom: 8,
    letterSpacing: 1,
  },

  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    width: 1,
    height: 1,
  },

  btn: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 24,
    marginBottom: 12,
  },
  btnGrad: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  btnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },

  hint: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '700',
    letterSpacing: 1,
  },
  backBtn: {
    position: 'absolute',
    top: 20,
    left: 24,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(123,63,228,0.3)',
    backgroundColor: 'rgba(123,63,228,0.1)',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A855F7',
    letterSpacing: 0.5,
  },
});

export default LockScreen;
