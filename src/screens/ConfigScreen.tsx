/**
 * ConfigScreen.tsx — Tela de configuração: IP, Porta, PIN + botão Conectar
 * Salva dados via AsyncStorage para persistência entre reinicializações
 */
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { StackNavigationProp } from '@react-navigation/stack';
import { resolvePin } from '../services/api';
import {
  buildBaseUrl,
  getSavedCredentials,
  getDefaultIp,
  getDefaultPort,
  saveCredentials,
} from '../services/storage';

type Props = {
  navigation: StackNavigationProp<any>;
};

const ConfigScreen: React.FC<Props> = ({ navigation }) => {
  const [ip, setIp]       = useState(getDefaultIp());
  const [port, setPort]   = useState(getDefaultPort());
  const [pin, setPin]     = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingInit, setLoadingInit] = useState(true);
  const [error, setError] = useState('');

  // Carrega dados salvos
  useEffect(() => {
    getSavedCredentials().then(creds => {
      if (creds) {
        setIp(creds.ip);
        setPort(creds.port);
        setPin(creds.pin);
      }
      setLoadingInit(false);
    });
  }, []);

  const handleConnect = async () => {
    setError('');
    const cleanIp   = ip.trim();
    const cleanPort = port.trim();
    const cleanPin  = pin.trim();

    if (!cleanIp || !cleanPort || !cleanPin) {
      setError('Preencha todos os campos.');
      return;
    }

    const baseUrl = buildBaseUrl(cleanIp, cleanPort);
    setLoading(true);
    try {
      const data = await resolvePin(baseUrl, cleanPin);
      await saveCredentials(cleanIp, cleanPort, cleanPin, data.roomId, data.roomName || '', data.theme || {});

      navigation.replace('TvMain', {
        baseUrl,
        roomId: data.roomId,
        pin: cleanPin,
        theme: data.theme || {},
      });
    } catch (e: any) {
      setError(e.message || 'Falha ao conectar. Verifique os dados e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingInit) {
    return (
      <LinearGradient colors={['#0a0e1a', '#131929']} style={styles.center}>
        <ActivityIndicator size="large" color="#7B3FE4" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#0a0e1a', '#131929', '#0a0e1a']} style={styles.grad}>
      <SafeAreaView style={styles.safe}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav}>
          <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

            {/* Botão voltar */}
            {navigation.canGoBack() && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
              >
                <Text style={styles.backBtnText}>← Cancelar</Text>
              </TouchableOpacity>
            )}

            {/* Header */}
            <View style={styles.header}>
              <LinearGradient colors={['#7B3FE4', '#2D1B69']} style={styles.headerIcon}>
                <Text style={styles.headerIconText}>⚙️</Text>
              </LinearGradient>
              <Text style={styles.headerTitle}>Configuração</Text>
              <Text style={styles.headerSubtitle}>CONEXÃO DO TELÃO</Text>
            </View>

            {/* Card de campos */}
            <View style={styles.card}>

              {/* IP */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>🌐  IP / HOST DO SERVIDOR</Text>
                <TextInput
                  style={styles.input}
                  value={ip}
                  onChangeText={setIp}
                  placeholder="Ex: 192.168.0.1"
                  placeholderTextColor="#475569"
                  keyboardType="default"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Porta */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>🔌  PORTA</Text>
                <TextInput
                  style={styles.input}
                  value={port}
                  onChangeText={setPort}
                  placeholder="Ex: 3002"
                  placeholderTextColor="#475569"
                  keyboardType="numeric"
                />
              </View>

              {/* PIN */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>🔑  PIN DO TELÃO</Text>
                <TextInput
                  style={styles.input}
                  value={pin}
                  onChangeText={setPin}
                  placeholder="PIN fornecido pelo sistema"
                  placeholderTextColor="#475569"
                  autoCapitalize="none"
                  autoCorrect={false}
                  secureTextEntry={false}
                />
              </View>

              {/* Preview da URL */}
              <View style={styles.previewBox}>
                <Text style={styles.previewLabel}>URL GERADA:</Text>
                <Text style={styles.previewUrl} numberOfLines={1}>
                  {buildBaseUrl(ip || '...', port || '...')}
                </Text>
              </View>

              {/* Erro */}
              {!!error && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>⚠️  {error}</Text>
                </View>
              )}

              {/* Botão Conectar */}
              <TouchableOpacity style={styles.connectBtn} onPress={handleConnect} disabled={loading} activeOpacity={0.85}>
                <LinearGradient
                  colors={loading ? ['#2D1B69', '#2D1B69'] : ['#7B3FE4', '#4B2FA0']}
                  style={styles.connectBtnGrad}
                >
                  {loading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <Text style={styles.connectBtnText}>CONECTAR</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <Text style={styles.footnote}>
                Os dados são salvos automaticamente para reconexão após reinicialização.
              </Text>
            </View>

            {/* Info fallback */}
            <Text style={styles.footer}>
              Sem dados? Fallback: {getDefaultIp()}:{getDefaultPort()}
            </Text>

          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  grad: { flex: 1 },
  safe: { flex: 1 },
  kav: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 24, paddingBottom: 48 },

  header: { alignItems: 'center', marginBottom: 28 },
  headerIcon: {
    width: 72, height: 72, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#7B3FE4', shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5, shadowRadius: 20, elevation: 10,
  },
  headerIconText: { fontSize: 32 },
  headerTitle: { fontSize: 28, fontWeight: '900', color: '#F1F5F9', letterSpacing: 2 },
  headerSubtitle: { fontSize: 10, fontWeight: '900', color: '#475569', letterSpacing: 3, textTransform: 'uppercase', marginTop: 4 },

  card: {
    backgroundColor: 'rgba(19,25,41,0.95)',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(123,63,228,0.25)',
    padding: 24,
    shadowColor: '#7B3FE4', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2, shadowRadius: 30, elevation: 12,
  },

  fieldGroup: { marginBottom: 18 },
  label: {
    fontSize: 11,
    fontWeight: '900',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderWidth: 2,
    borderColor: 'rgba(123,63,228,0.2)',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    fontWeight: '700',
    color: '#F1F5F9',
  },

  previewBox: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 18,
  },
  previewLabel: { fontSize: 9, fontWeight: '900', color: '#475569', letterSpacing: 2, marginBottom: 4 },
  previewUrl: { fontSize: 13, fontWeight: '700', color: '#7B3FE4', fontFamily: 'monospace' },

  errorBox: {
    backgroundColor: 'rgba(239,68,68,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239,68,68,0.4)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: { fontSize: 13, fontWeight: '700', color: '#ef4444' },

  connectBtn: { borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  connectBtnGrad: { paddingVertical: 18, alignItems: 'center' },
  connectBtnText: { fontSize: 16, fontWeight: '900', color: '#ffffff', letterSpacing: 3, textTransform: 'uppercase' },

  footnote: { fontSize: 11, color: '#475569', textAlign: 'center', fontStyle: 'italic' },
  footer: { textAlign: 'center', fontSize: 11, color: '#334155', marginTop: 20, fontStyle: 'italic' },
  backBtn: {
    alignSelf: 'flex-start',
    marginBottom: 16,
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

export default ConfigScreen;
