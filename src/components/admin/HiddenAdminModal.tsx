import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Switch,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useBingoStore } from '../../store/useBingoStore';
import { X, Play, Pause, RefreshCw, Plus, DollarSign, Settings } from 'lucide-react-native';
import { generateRandomBall } from '../../utils/generateRandomBall';

interface HiddenAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HiddenAdminModal: React.FC<HiddenAdminModalProps> = ({ isOpen, onClose }) => {
  const {
    isDemoMode,
    ballsDrawn,
    prizes,
    demoInterval,
    setDemoMode,
    resetGame,
    setDemoInterval,
    updatePrizes,
    addBall,
  } = useBingoStore();

  const [manualBall, setManualBall] = useState<string>('');
  const [linePrize, setLinePrize] = useState<string>(prizes.line.toString());
  const [fullPrize, setFullPrize] = useState<string>(prizes.full.toString());
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleManualDraw = () => {
    setErrorMsg('');
    const num = parseInt(manualBall, 10);

    if (isNaN(num) || num < 1 || num > 75) {
      setErrorMsg('Digite um número válido de 1 a 75.');
      return;
    }

    if (ballsDrawn.includes(num)) {
      setErrorMsg(`A bola ${num} já foi sorteada!`);
      return;
    }

    addBall(num);
    setManualBall('');
  };

  const handleDrawRandom = () => {
    setErrorMsg('');
    const nextBall = generateRandomBall(ballsDrawn);
    if (nextBall === null) {
      setErrorMsg('Todas as 75 bolas já foram chamadas!');
      return;
    }
    addBall(nextBall);
  };

  const handleSavePrizes = () => {
    const line = parseFloat(linePrize);
    const full = parseFloat(fullPrize);
    if (!isNaN(line) && !isNaN(full)) {
      updatePrizes({ line, full });
      Alert.alert('Sucesso', 'Valores de premiação atualizados.');
    } else {
      setErrorMsg('Valores de premiação inválidos.');
    }
  };

  const handleClearGame = () => {
    Alert.alert(
      'Limpar Jogo',
      'Deseja resetar o jogo atual e limpar todas as bolas sorteadas?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar',
          style: 'destructive',
          onPress: () => {
            resetGame();
            setErrorMsg('');
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={isOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardContainer}
        >
          <View style={styles.modalCard}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitleBox}>
                <Settings size={16} color="#00FF7F" style={styles.settingsIcon} />
                <Text style={styles.headerText}>PAINEL DO ADMINISTRADOR</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <X size={16} color="#a1a1aa" />
              </TouchableOpacity>
            </View>

            {/* Scrollable Content */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Error Message */}
              {errorMsg !== '' && (
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>{errorMsg}</Text>
                </View>
              )}

              {/* Mode Selection */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Simulação & Sorteio</Text>
                <View style={styles.rowCard}>
                  <View style={styles.rowCardInfo}>
                    <Text style={styles.rowCardTitle}>Modo Demo</Text>
                    <Text style={styles.rowCardSub}>Sorteio automático no app</Text>
                  </View>
                  <Switch
                    value={isDemoMode}
                    onValueChange={setDemoMode}
                    trackColor={{ false: '#27272a', true: '#00FF7F' }}
                    thumbColor={isDemoMode ? '#ffffff' : '#a1a1aa'}
                  />
                </View>
              </View>

              {/* Demo Settings */}
              {isDemoMode && (
                <View style={styles.section}>
                  <Text style={styles.inputLabel}>Intervalo do Sorteio (segundos)</Text>
                  <TextInput
                    keyboardType="numeric"
                    value={demoInterval.toString()}
                    onChangeText={(val) => {
                      const sec = parseInt(val, 10);
                      setDemoInterval(isNaN(sec) ? 5 : Math.max(2, sec));
                    }}
                    style={styles.textInput}
                    placeholderTextColor="#52525b"
                  />
                </View>
              )}

              {/* Quick Actions */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Ações Rápidas</Text>
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    onPress={handleDrawRandom}
                    disabled={isDemoMode}
                    style={[styles.actionBtn, isDemoMode && styles.disabledBtn]}
                  >
                    <Plus size={14} color="#e2e8f0" style={styles.btnIcon} />
                    <Text style={styles.actionBtnText}>Sortear Bola</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleClearGame}
                    style={[styles.actionBtn, styles.clearBtn]}
                  >
                    <RefreshCw size={12} color="#f87171" style={styles.btnIcon} />
                    <Text style={[styles.actionBtnText, styles.clearBtnText]}>Limpar Jogo</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Inject Number */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Injetar Bola Específica</Text>
                <View style={styles.injectRow}>
                  <TextInput
                    keyboardType="numeric"
                    placeholder="Número (1-75)"
                    placeholderTextColor="#52525b"
                    value={manualBall}
                    onChangeText={setManualBall}
                    editable={!isDemoMode}
                    style={[styles.textInput, styles.injectInput, isDemoMode && styles.disabledInput]}
                  />
                  <TouchableOpacity
                    onPress={handleManualDraw}
                    disabled={isDemoMode}
                    style={[styles.injectBtn, isDemoMode && styles.disabledBtn]}
                  >
                    <Text style={styles.injectBtnText}>Injetar</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Prize config */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Configurar Prêmios (R$)</Text>
                <View style={styles.prizeInputRow}>
                  <View style={styles.prizeInputBlock}>
                    <Text style={styles.prizeLabel}>Linha</Text>
                    <View style={styles.currencyWrapper}>
                      <Text style={styles.currencyPrefix}>R$</Text>
                      <TextInput
                        keyboardType="numeric"
                        value={linePrize}
                        onChangeText={setLinePrize}
                        style={styles.currencyInput}
                      />
                    </View>
                  </View>

                  <View style={styles.prizeInputBlock}>
                    <Text style={styles.prizeLabel}>Bingo Cheio</Text>
                    <View style={styles.currencyWrapper}>
                      <Text style={styles.currencyPrefix}>R$</Text>
                      <TextInput
                        keyboardType="numeric"
                        value={fullPrize}
                        onChangeText={setFullPrize}
                        style={styles.currencyInput}
                      />
                    </View>
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSavePrizes}
                  style={styles.savePrizeBtn}
                >
                  <DollarSign size={12} color="#FFD700" style={styles.btnIcon} />
                  <Text style={styles.savePrizeBtnText}>Salvar Prêmios</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  keyboardContainer: {
    width: '100%',
    maxWidth: 400,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#18181b',
    borderColor: '#27272a',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#09090b',
    borderBottomWidth: 1,
    borderBottomColor: '#27272a',
  },
  headerTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsIcon: {
    marginRight: 8,
  },
  headerText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#e2e8f0',
    letterSpacing: 1,
  },
  closeButton: {
    padding: 4,
    borderRadius: 6,
  },
  scrollContent: {
    padding: 16,
  },
  errorBox: {
    backgroundColor: 'rgba(127, 29, 29, 0.4)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 11,
    color: '#fca5a5',
    fontWeight: '500',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    color: '#71717a',
    marginBottom: 6,
  },
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#09090b',
    borderColor: '#27272a',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
  },
  rowCardInfo: {
    flexDirection: 'column',
  },
  rowCardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  rowCardSub: {
    fontSize: 9,
    color: '#71717a',
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#d4d4d8',
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: '#09090b',
    borderColor: '#27272a',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    color: '#ffffff',
    fontSize: 12,
  },
  disabledInput: {
    opacity: 0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#09090b',
    borderColor: '#27272a',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    marginRight: 6,
  },
  clearBtn: {
    marginRight: 0,
    marginLeft: 6,
    backgroundColor: 'rgba(127, 29, 29, 0.1)',
    borderColor: 'rgba(127, 29, 29, 0.2)',
  },
  disabledBtn: {
    opacity: 0.5,
  },
  btnIcon: {
    marginRight: 6,
  },
  actionBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#e2e8f0',
  },
  clearBtnText: {
    color: '#f87171',
  },
  injectRow: {
    flexDirection: 'row',
  },
  injectInput: {
    flex: 1,
    marginRight: 10,
  },
  injectBtn: {
    backgroundColor: 'rgba(0, 255, 127, 0.1)',
    borderColor: 'rgba(0, 255, 127, 0.25)',
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  injectBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#00FF7F',
  },
  prizeInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  prizeInputBlock: {
    flex: 1,
    marginHorizontal: 4,
  },
  prizeLabel: {
    fontSize: 8,
    color: '#a1a1aa',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  currencyWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#09090b',
    borderColor: '#27272a',
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
  },
  currencyPrefix: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#52525b',
  },
  currencyInput: {
    flex: 1,
    paddingHorizontal: 8,
    paddingVertical: 5,
    color: '#ffffff',
    fontSize: 11,
  },
  savePrizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1b1b1f',
    borderColor: '#2e303a',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 8,
    marginTop: 6,
  },
  savePrizeBtnText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#d4d4d8',
  },
});
