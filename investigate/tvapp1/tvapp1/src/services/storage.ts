/**
 * storage.ts — AsyncStorage helpers para tvapp1
 * Persiste: credenciais do telão (IP, porta, PIN, roomId, theme)
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Keys ─────────────────────────────────────────────────────────────────────
const KEY_IP = 'tv_ip';
const KEY_PORT = 'tv_port';
const KEY_PIN = 'tv_pin';
const KEY_ROOM_ID = 'tv_roomId';
const KEY_ROOM_NAME = 'tv_roomName';
const KEY_THEME = 'tv_theme';

// Fallback do .env / processo
const DEFAULT_IP = '31.97.9.178';
const DEFAULT_PORT = '3010';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ThemeConfig {
  name?: string;         // 'tema01' | 'tema02' | 'tema03'
  type?: string;
  logoUrl?: string;
  text?: string;
  defaultLanguage?: string;
  sound?: string;
  enableSound?: boolean;
  css?: Record<string, string>;
}

export interface SavedCredentials {
  ip: string;
  port: string;
  pin: string;
  roomId: string;
  roomName: string;
  theme: ThemeConfig;
}

// ─── Getters ──────────────────────────────────────────────────────────────────
export async function getSavedCredentials(): Promise<SavedCredentials | null> {
  try {
    const [ip, port, pin, roomId, roomName, themeRaw] = await AsyncStorage.multiGet([
      KEY_IP, KEY_PORT, KEY_PIN, KEY_ROOM_ID, KEY_ROOM_NAME, KEY_THEME,
    ]);

    const ipVal = ip[1];
    const portVal = port[1];
    const pinVal = pin[1];
    const roomIdVal = roomId[1];

    // Só considera salvo se tiver IP, PIN e roomId
    if (!ipVal || !pinVal || !roomIdVal) return null;

    let theme: ThemeConfig = {};
    try { theme = JSON.parse(themeRaw[1] || '{}'); } catch { /* */ }

    return {
      ip: ipVal,
      port: portVal || DEFAULT_PORT,
      pin: pinVal,
      roomId: roomIdVal,
      roomName: roomName[1] || '',
      theme,
    };
  } catch (e) {
    console.error('[Storage] getSavedCredentials error:', e);
    return null;
  }
}

export async function saveCredentials(
  ip: string,
  port: string,
  pin: string,
  roomId: string,
  roomName: string,
  theme: ThemeConfig,
): Promise<void> {
  await AsyncStorage.multiSet([
    [KEY_IP, ip],
    [KEY_PORT, port],
    [KEY_PIN, pin],
    [KEY_ROOM_ID, roomId],
    [KEY_ROOM_NAME, roomName],
    [KEY_THEME, JSON.stringify(theme)],
  ]);
}

export async function clearCredentials(): Promise<void> {
  await AsyncStorage.multiRemove([KEY_IP, KEY_PORT, KEY_PIN, KEY_ROOM_ID, KEY_ROOM_NAME, KEY_THEME]);
}

// ─── Helpers individuais ──────────────────────────────────────────────────────
export async function getPin(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_PIN);
}

export async function getRoomId(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_ROOM_ID);
}

export function getDefaultIp(): string {
  return DEFAULT_IP;
}

export function getDefaultPort(): string {
  return DEFAULT_PORT;
}

export function buildBaseUrl(ip: string, port: string): string {
  return `http://${ip}:${port}`;
}
