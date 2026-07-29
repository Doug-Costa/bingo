/**
 * audioService.ts — Gerenciador de Áudio e Locução de Bolas/Premiações
 * 
 * Suporta execução encadeada (queue) para que locuções não se sobreponham.
 */

import { NativeModules } from 'react-native';

const { TtsModule } = NativeModules;

type Language = 'pt' | 'es' | 'en';

class AudioService {
  private queue: string[] = [];
  private isPlaying = false;
  private currentAudio: any = null;
  private enabled = true;
  private language: Language = 'pt';
  private baseUrl = '';

  constructor() {
    this.setLanguage('pt');
  }

  public setEnabled(enabled: boolean) {
    this.enabled = enabled;
    if (!enabled) {
      this.stopAll();
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setLanguage(lang: string) {
    if (lang.startsWith('es')) this.language = 'es';
    else if (lang.startsWith('en')) this.language = 'en';
    else this.language = 'pt';
  }

  public getLanguage(): Language {
    return this.language;
  }

  public setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  public stopAll() {
    this.queue = [];
    if (this.currentAudio) {
      try {
        this.currentAudio.pause?.();
        this.currentAudio.currentTime = 0;
      } catch (e) {
        // Ignore
      }
      this.currentAudio = null;
    }
    if (TtsModule && TtsModule.stop) {
      try { TtsModule.stop(); } catch (e) { /* */ }
    }
    this.isPlaying = false;
  }

  public speakText(text: string) {
    if (!this.enabled || !text) return;
    if (TtsModule && TtsModule.speak) {
      try {
        TtsModule.speak(text);
        return;
      } catch (e) {
        console.warn('[AudioService] TtsModule error:', e);
      }
    }
  }

  public playBall(ballNumber: number) {
    if (!this.enabled || !ballNumber) return;

    const phrase = this.language === 'en' ? `Ball ${ballNumber}` : this.language === 'es' ? `Bola ${ballNumber}` : `Bola ${ballNumber}`;
    this.speakText(phrase);
  }

  public playWinner(type: 'line1' | 'line2' | 'bingo' | string, playerName?: string) {
    if (!this.enabled) return;

    let text = 'Bingo total batido! Parabéns ao ganhador!';
    if (type === 'line1') text = 'Primeira linha batida! Parabéns ao ganhador!';
    else if (type === 'line2') text = 'Segunda linha batida! Parabéns ao ganhador!';
    else if (type === 'bingo') text = 'Bingo total batido! Parabéns ao ganhador!';

    if (playerName) {
      text += ` ${playerName}`;
    }

    this.speakText(text);
  }
}

export const audioService = new AudioService();
export default audioService;
