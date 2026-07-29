/**
 * api.ts — Funções de API para tvapp1
 * baseUrl é dinâmico (configurado pelo usuário via ConfigScreen)
 */

// ─── HTTP helper ──────────────────────────────────────────────────────────────
async function request<T>(
  baseUrl: string,
  method: string,
  path: string,
  body?: unknown,
  token?: string | null,
): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) { headers['Authorization'] = `Bearer ${token}`; }

  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

const get  = <T>(baseUrl: string, path: string, token?: string | null) => request<T>(baseUrl, 'GET',  path, undefined, token);

const post = <T>(baseUrl: string, path: string, body: unknown, token?: string | null) => request<T>(baseUrl, 'POST', path, body, token);

// ─── TV App APIs ───────────────────────────────────────────────────────────────

export interface ResolveResponse {
  roomId: string;
  roomName: string;
  resellerId?: string;
  theme?: {
    name?: string;
    type?: string;
    logoUrl?: string;
    text?: string;
    defaultLanguage?: string;
    sound?: string;
    enableSound?: boolean;
    css?: Record<string, string>;
  };
}

/**
 * Resolve um PIN de TV e retorna roomId + theme
 * GET /tvapp/resolve?pin=...&type=bingo
 */
export async function resolvePin(baseUrl: string, pin: string): Promise<ResolveResponse> {
  const res = await fetch(
    `${baseUrl}/bingo/tvapp/resolve?pin=${encodeURIComponent(pin)}&type=bingo`,
    { method: 'GET', headers: { 'Content-Type': 'application/json' } },
  );
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.message || `PIN inválido (${res.status})`);
  }
  const data = await res.json();
  const finalRoomId = data.roomId || data.tv_roomId || data.RoomId;
  if (!finalRoomId) { throw new Error('RoomId não encontrado na resposta'); }
  return { ...data, roomId: finalRoomId };
}

// ─── Draw types ────────────────────────────────────────────────────────────────
export interface Draw {
  id: string;
  incrementalId: string | number;
  scheduledAt: string | null;
  prizeLine1?: number;
  prizeLine2?: number;
  prizeLine3?: number;
  ticketPrice?: number;
  status?: string;
  hotdraw?: boolean;
  nextBallTimer?: number;
}

/**
 * Busca os próximos sorteios da sala
 * POST /tvapp/next-draws { roomId, pin }
 */
export async function fetchNextDraws(
  baseUrl: string,
  roomId: string,
  pin: string,
): Promise<Draw[]> {
  const cleanRoomId = roomId.replace('tv_', '');
  const res = await fetch(`${baseUrl}/bingo/tvapp/next-draws`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ROOMID: cleanRoomId, roomId: cleanRoomId, pin }),
  });
  if (!res.ok) { return []; }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
