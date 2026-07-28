/**
 * SSEContext.tsx — React Native SSE via XMLHttpRequest
 *
 * MOTIVO: fetch() + response.body.getReader() NÃO funciona no React Native
 * (Hermes/OkHttp) para SSE — o fetch() bloqueia esperando a resposta completa.
 *
 * SOLUÇÃO: XMLHttpRequest com onreadystatechange progressivo (readyState=3).
 * O XHR dispara onreadystatechange a cada nova porção de dados, permitindo
 * processar eventos SSE em tempo real.
 *
 * Reconexão: exponential back-off 1s → 30s.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';

// ─── Config ────────────────────────────────────────────────────────────────────
const DEFAULT_SSE_PATH = '/bingo/realtime-sse/stream';
const TAG = '[SSE]';

// ─── Types ─────────────────────────────────────────────────────────────────────
export interface Top10Player {
  ticketId: string;
  playerId?: string;
  playerName?: string;
  loginId?: string;
  affiliateName?: string;
  linesCompleted: number;
  minNumbersLeft: number;
  minLeftLine1?: number;
  minLeftLine2?: number;
  minLeftBingo?: number;
  almostWinningLine?: number[];
  missing?: number[];
  missingNumbers?: number[];
  fullTicket?: number[][];
  closestLine?: { lineIdx: number; numbers: number[]; missing: number[] };
}

export interface WinnerEvent {
  ticketId: string;
  playerId?: string;
  playerName?: string;
  affiliateName?: string;
  type: 'line1' | 'line2' | 'bingo' | 'jackpot';
  line?: number;
  prizeAmount?: number;
  share?: number;
  prize?: number;
  numbers?: number[][];
  jackpotWon?: boolean;
}

export interface DrawSSE {
  id: string;
  incrementalId?: number | string;
  scheduledAt?: string | null;
  ticketPrice?: number;
  prizeLine1?: number;
  prizeLine2?: number;
  prizeLine3?: number;
  status?: string;
  hotdraw?: boolean;
  nextBallTimer?: number;
  triggerBallLimit?: number;
  jackpotAmount?: number;
  room?: { name?: string };
}

export interface JackpotInfo {
  id?: string;
  name?: string;
  roomId?: string;
  jackpotId?: string;
  type?: string;
  baseAmount?: number;
  currentAmount?: number;
  totalAmount?: number;
  triggerBallLimit?: number;
  triggerBallChoice?: number;
  triggerBallLimitForce?: number;
  triggerBallLimitMin?: number;
  triggerBallLimitMax?: number;
  lastWonAt?: string;
  activeToday: boolean;
}

export interface Promotion {
  id: string;
  urlimg?: string;
  title?: string;
  linkurl?: string;
  video?: string;
  order?: number;
}

export interface MyTicket {
  id: string;
  drawId: string;
  roomId: string;
  playerId: string;
  numbers: number[][];
  createdAt?: string;
}

interface SSEContextValue {
  connected: boolean;
  drawnNumbers: number[];
  currentBall: number | null;
  topPlayers: Top10Player[];
  topStage: 'line1' | 'line2' | 'bingo' | 'finished';
  jackpotAmount: number | null;
  triggerBallLimit: number | null;
  lastDrawEvent: 'draw_finished' | 'draw_started' | null;
  winners: WinnerEvent[];
  myTickets: MyTicket[];
  promotions: Promotion[];
  drawActive: boolean;
  nextDraws: DrawSSE[];
  hotDraws: DrawSSE[];
  jackpotInfo: JackpotInfo | null;
  hadDrawInSession: boolean;
  // Diagnóstico
  debugUrl: string;
  debugLastEvent: string;
  debugEventCount: number;
}

const SSEContext = createContext<SSEContextValue>({
  connected: false,
  drawnNumbers: [],
  currentBall: null,
  topPlayers: [],
  topStage: 'finished',
  jackpotAmount: null,
  triggerBallLimit: null,
  lastDrawEvent: null,
  winners: [],
  myTickets: [],
  promotions: [],
  drawActive: false,
  nextDraws: [],
  hotDraws: [],
  jackpotInfo: null,
  hadDrawInSession: false,
  debugUrl: '',
  debugLastEvent: '',
  debugEventCount: 0,
});

// ─── Provider ──────────────────────────────────────────────────────────────────
export function GameSocketProvider({
  baseUrl,
  roomId,
  pin,
  token,
  children,
  onRestartEvent,
}: {
  baseUrl: string;
  roomId: string;
  pin?: string;
  token?: string;
  children: React.ReactNode;
  onRestartEvent?: () => void;
}) {
  const [connected, setConnected]               = useState(false);
  const [drawnNumbers, setDrawnNumbers]         = useState<number[]>([]);
  const [currentBall, setCurrentBall]           = useState<number | null>(null);
  const [topPlayers, setTopPlayers]             = useState<Top10Player[]>([]);
  const [topStage, setTopStage]                 = useState<'line1' | 'line2' | 'bingo' | 'finished'>('finished');
  const [jackpotAmount, setJackpotAmount]       = useState<number | null>(null);
  const [triggerBallLimit, setTriggerBallLimit] = useState<number | null>(null);
  const [lastDrawEvent, setLastDrawEvent]       = useState<'draw_finished' | 'draw_started' | null>(null);
  const [winners, setWinners]                   = useState<WinnerEvent[]>([]);
  const [myTickets, setMyTickets]               = useState<MyTicket[]>([]);
  const [promotions, setPromotions]             = useState<Promotion[]>([]);
  const [drawActive, setDrawActive]             = useState(false);
  const [nextDraws, setNextDraws]               = useState<DrawSSE[]>([]);
  const [hotDraws, setHotDraws]                 = useState<DrawSSE[]>([]);
  const [jackpotInfo, setJackpotInfo]           = useState<JackpotInfo | null>(null);
  const [hadDrawInSession, setHadDrawInSession] = useState(false);
  const [debugUrl, setDebugUrl]                 = useState('');
  const [debugLastEvent, setDebugLastEvent]     = useState('');
  const [debugEventCount, setDebugEventCount]   = useState(0);

  const xhrRef        = useRef<XMLHttpRequest | null>(null);
  const retryRef      = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryDelay    = useRef(1000);
  const unmountedRef  = useRef(false);
  const eventCountRef = useRef(0);
  // Cursor de qual parte do responseText já foi processada
  const processedRef  = useRef(0);
  // Buffer SSE parcial
  const bufferRef     = useRef('');
  const evtTypeRef    = useRef('message');
  const evtDataRef    = useRef('');

  // ── buildUrl ────────────────────────────────────────────────────────────────
  const buildUrl = useCallback((): string => {
    const parts: string[] = [];
    if (pin && pin.trim()) {
      parts.push(`pin=${encodeURIComponent(pin.trim())}`);
    }
    if (token && token.trim()) {
      parts.push(`token=${encodeURIComponent(token.trim())}`);
    }
    if (roomId && roomId.trim()) {
      parts.push(`roomId=${encodeURIComponent(roomId.trim())}`);
    }
    parts.push(`_t=${String(Date.now())}`);
    const url = `${baseUrl}${DEFAULT_SSE_PATH}?${parts.join('&')}`;
    console.log(`${TAG} 🔧 URL → "${url}"`);
    return url;
  }, [baseUrl, roomId, pin, token]);

  // ── dispatch ────────────────────────────────────────────────────────────────
  const dispatch = useCallback((eventType: string, rawData: string) => {
    if (unmountedRef.current) { return; }

    eventCountRef.current += 1;
    setDebugEventCount(eventCountRef.current);
    setDebugLastEvent(`${eventType} #${eventCountRef.current}`);

    console.log(`${TAG} 📨 [${eventType}] #${eventCountRef.current} → "${rawData.substring(0, 100)}"`);

    try {
      const parsed = JSON.parse(rawData);
      const payload = parsed?.data ?? parsed;

      switch (eventType) {

        // ── snapshot ───────────────────────────────────────────────────
        case 'snapshot': {
          console.log(`${TAG} 📸 SNAPSHOT state=`, JSON.stringify(payload?.state)?.substring(0, 200));

          if (payload?.state === null || payload?.state === undefined) {
            console.log(`${TAG} 📸 state null — sem sorteio ativo`);
            setCurrentBall(null); setDrawnNumbers([]); setTopPlayers([]); setWinners([]);
            setLastDrawEvent(null); setTopStage('finished'); setDrawActive(false);
            if (Array.isArray(payload?.nextDraws))  { setNextDraws(payload.nextDraws); }
            if (Array.isArray(payload?.hotDraws))   { setHotDraws(payload.hotDraws); }
            if (payload?.jackpotInfo)               { setJackpotInfo(payload.jackpotInfo); }
            break;
          }

          const s = payload?.state ?? payload;
          console.log(`${TAG} 📸 status="${s?.status}" balls=${s?.balls?.length ?? 0} jackpotAmount=${s?.jackpotAmount}`);

          const balls = s?.balls ?? s?.drawnNumbers;
          if (Array.isArray(balls)) {
            setDrawnNumbers(balls);
            if (balls.length > 0) { setCurrentBall(balls[balls.length - 1]); }
          }

          let jAmt = s?.jackpotAmount;
          if (jAmt === undefined && s?.jackpot?.currentAmount !== undefined) {
            jAmt = (Number(s.jackpot.baseAmount || 0)) + (Number(s.jackpot.currentAmount || 0));
          }
          if (jAmt !== undefined && jAmt !== null) {
            setJackpotAmount(Number(jAmt));
          }

          const trigger = s?.triggerBallLimit ?? s?.jackpot?.triggerBallLimit;
          if (trigger !== undefined) {
            setTriggerBallLimit(Number(trigger) || null);
          }

          const topW = s?.topWinners ?? s?.topPlayers;
          if (Array.isArray(topW)) {
            setTopPlayers(topW.map((tp: any) => ({
              ...tp,
              missingNumbers: tp.missing ?? tp.missingNumbers,
            })));
          }
          if (s?.topWinnersStage || s?.topStage) {
            setTopStage(s.topWinnersStage ?? s.topStage);
          }
          if (Array.isArray(s?.winners) && s.winners.length > 0) { setWinners(s.winners); }
          if (Array.isArray(s?.lineWinners) && s.lineWinners.length > 0) {
            const norm = s.lineWinners.map((w: any) => {
              const typeStr = w.type ? w.type : w.line === 1 ? 'line1' : w.line === 2 ? 'line2' : w.line === 3 ? 'bingo' : 'line1';
              return { ...w, type: typeStr, prizeAmount: w.prizeAmount ?? w.share ?? w.prize };
            });
            setWinners(norm);
          }

          const isStarted = s?.status === 'started';
          setDrawActive(isStarted);
          if (isStarted) {
            setLastDrawEvent('draw_started');
            setHadDrawInSession(true);
            console.log(`${TAG} 📸 ✅ DRAW ATIVO (snapshot)`);
          } else {
            setLastDrawEvent(null);
          }
          if (Array.isArray(s?.nextDraws))  { setNextDraws(s.nextDraws); }
          if (Array.isArray(s?.hotDraws))   { setHotDraws(s.hotDraws); }
          if (s?.jackpotInfo) {
            setJackpotInfo(s.jackpotInfo);
            if (s.jackpotInfo.activeToday && (s.jackpotInfo.totalAmount !== undefined || s.jackpotInfo.currentAmount !== undefined)) {
              setJackpotAmount(Number(s.jackpotInfo.totalAmount ?? s.jackpotInfo.currentAmount));
            }
          }
          break;
        }

        case 'my_tickets': {
          const tix = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.tickets) ? payload.tickets : [];
          console.log(`${TAG} 🎫 my_tickets: ${tix.length}`);
          setMyTickets(tix);
          break;
        }

        case 'promotions_list': {
          const promos = Array.isArray(payload)
            ? payload
            : Array.isArray(payload?.promotions) ? payload.promotions : [];
          console.log(`${TAG} 📣 promotions_list: ${promos.length}`);
          setPromotions(promos);
          break;
        }

        case 'draw_start': {
          const dData = payload?.data ?? payload;
          console.log(`${TAG} 🚀 DRAW_START! jackpot=${dData?.jackpotAmount} trigger=${dData?.triggerBallLimit}`);
          setCurrentBall(null); setDrawnNumbers([]); setTopPlayers([]);
          setTopStage('line1'); setWinners([]);
          setLastDrawEvent('draw_started'); setDrawActive(true); setHadDrawInSession(true);
          if (dData?.jackpotAmount !== undefined) { setJackpotAmount(Number(dData.jackpotAmount)); }
          if (dData?.triggerBallLimit !== undefined) { setTriggerBallLimit(Number(dData.triggerBallLimit) || null); }
          break;
        }

        case 'new_ball': {
          const ball = payload?.number ?? payload?.ball ?? payload?.value;
          console.log(`${TAG} 🔵 NEW_BALL: ${ball}`);
          if (ball !== undefined) {
            setCurrentBall(ball);
            setDrawnNumbers(prev => prev.includes(ball) ? prev : [...prev, ball]);
          }
          if (payload?.topPlayers) { setTopPlayers(payload.topPlayers); }
          if (payload?.topStage)   { setTopStage(payload.topStage); }
          if (payload?.jackpotAmount !== undefined) { setJackpotAmount(Number(payload.jackpotAmount)); }
          setLastDrawEvent(null);
          break;
        }

        case 'top_winners': {
          const twData = payload?.data ?? payload;
          if (twData?.stage) {
            const st = twData.stage === 1 ? 'line1' : twData.stage === 2 ? 'line2' : twData.stage === 3 ? 'bingo' : twData.stage;
            setTopStage(st);
          }
          const items = twData?.items ?? twData?.topWinners;
          if (Array.isArray(items)) {
            setTopPlayers(items.map((tp: any) => ({
              ...tp,
              missingNumbers: tp.missing ?? tp.missingNumbers,
            })));
          }
          break;
        }

        case 'line_winner': {
          const lwData = payload?.data ?? payload;
          const lineNum = lwData?.line;
          const typeStr = lwData?.type
            ? lwData.type
            : lineNum === 1 ? 'line1' : lineNum === 2 ? 'line2' : lineNum === 3 ? 'bingo' : 'line1';

          if (typeStr === 'line1' || lineNum === 1) { setTopStage('line2'); }
          if (typeStr === 'line2' || lineNum === 2) { setTopStage('bingo'); }
          if (typeStr === 'bingo' || lineNum === 3) { setTopStage('finished'); }

          const winnerList: WinnerEvent[] = [];
          if (Array.isArray(lwData?.winners)) {
            lwData.winners.forEach((w: any) => {
              winnerList.push({
                ticketId: w.ticketId,
                playerName: w.playerName,
                affiliateName: w.affiliateName,
                type: typeStr as any,
                prizeAmount: Number(w.share ?? w.prizeAmount ?? w.prize ?? 0),
                numbers: w.numbers ?? lwData.numbers,
              });
            });
          } else if (lwData?.ticketId) {
            winnerList.push({
              ticketId: lwData.ticketId,
              playerName: lwData.playerName,
              affiliateName: lwData.affiliateName,
              type: typeStr as any,
              prizeAmount: Number(lwData.prizeAmount ?? lwData.share ?? lwData.prize ?? 0),
              numbers: lwData.numbers,
            });
          }

          if (winnerList.length > 0) {
            setWinners(prev => {
              const next = [...prev];
              for (const nw of winnerList) {
                if (!next.some(w => w.ticketId === nw.ticketId && w.type === nw.type)) {
                  next.push(nw);
                }
              }
              return next;
            });
          }
          break;
        }

        case 'jackpot_trigger_update': {
          const jtuData = payload?.data ?? payload;
          if (jtuData?.triggerBallLimit !== undefined) { setTriggerBallLimit(Number(jtuData.triggerBallLimit) || null); }
          if (jtuData?.jackpotAmount !== undefined)    { setJackpotAmount(Number(jtuData.jackpotAmount)); }
          break;
        }

        case 'jackpot_paid':
        case 'jackpot_won': {
          const jwData = payload?.data ?? payload;
          console.log(`${TAG} 💎 JACKPOT PAID/WON! amt=${jwData?.jackpotAmount ?? jwData?.totalJackpot}`);
          const amt = jwData?.jackpotAmount ?? jwData?.totalJackpot;
          if (amt !== undefined) { setJackpotAmount(Number(amt)); }
          if (jwData?.triggerBallLimit !== undefined) { setTriggerBallLimit(Number(jwData.triggerBallLimit)); }

          const jWinners: WinnerEvent[] = [];
          if (Array.isArray(jwData?.winners)) {
            jwData.winners.forEach((w: any) => {
              jWinners.push({
                ticketId: w.ticketId,
                playerId: w.playerId,
                playerName: w.playerName ?? 'Ganhador Jackpot',
                affiliateName: w.affiliateId,
                type: 'jackpot',
                prizeAmount: Number(w.share ?? amt ?? 0),
              });
            });
          } else if (jwData?.ticketId) {
            jWinners.push({
              ticketId: jwData.ticketId,
              playerName: jwData.playerName ?? 'Ganhador Jackpot',
              type: 'jackpot',
              prizeAmount: Number(jwData.jackpotShare ?? jwData.totalJackpot ?? amt ?? 0),
            });
          }

          if (jWinners.length > 0) {
            setWinners(prev => [...prev, ...jWinners]);
          }
          break;
        }

        case 'jackpot_delayed': {
          const jdData = payload?.data ?? payload;
          if (jdData?.jackpotAmount !== undefined)  { setJackpotAmount(Number(jdData.jackpotAmount)); }
          if (jdData?.newTriggerLimit !== undefined) { setTriggerBallLimit(Number(jdData.newTriggerLimit)); }
          if (jdData?.triggerBallLimit !== undefined) { setTriggerBallLimit(Number(jdData.triggerBallLimit)); }
          break;
        }

        case 'winners':
        case 'final_winners': {
          const wData = payload?.data ?? payload;
          const arr = Array.isArray(wData) ? wData : Array.isArray(wData?.winners) ? wData.winners : [wData];
          const list: WinnerEvent[] = [];

          arr.forEach((item: any) => {
            if (!item) return;
            const lineNum = item.line;
            const t: any = item.type
              ? item.type
              : lineNum === 1 ? 'line1' : lineNum === 2 ? 'line2' : lineNum === 3 ? 'bingo' : lineNum === 'jackpot' ? 'jackpot' : 'line1';

            if (Array.isArray(item.winners)) {
              item.winners.forEach((w: any) => {
                list.push({
                  ticketId: w.ticketId,
                  playerId: w.playerId,
                  playerName: w.playerName,
                  affiliateName: w.affiliateId || w.affiliateName,
                  type: t,
                  prizeAmount: Number(w.share ?? w.prize ?? item.prize ?? 0),
                });
              });
            } else if (item.ticketId) {
              list.push({
                ticketId: item.ticketId,
                playerName: item.playerName,
                type: t,
                prizeAmount: Number(item.prizeAmount ?? item.prize ?? item.share ?? 0),
              });
            }
          });

          if (list.length > 0) {
            setWinners(prev => {
              const next = [...prev];
              for (const nw of list) {
                if (!next.some(w => w.ticketId === nw.ticketId && w.type === nw.type)) {
                  next.push(nw);
                }
              }
              return next.slice(0, 30);
            });
          }
          break;
        }

        case 'draw_end': {
          const deData = payload?.data ?? payload;
          console.log(`${TAG} 🏁 DRAW_END drawId=${deData?.drawId}`);
          setCurrentBall(null); setLastDrawEvent('draw_finished');
          setTopStage('finished'); setDrawActive(false);
          if (deData?.jackpotAmount !== undefined) { setJackpotAmount(Number(deData.jackpotAmount)); }
          break;
        }

        case 'draw_cancel': {
          const dcData = payload?.data ?? payload;
          console.log(`${TAG} ⚠️ DRAW_CANCEL drawId=${dcData?.drawId}`);
          setCurrentBall(null); setDrawnNumbers([]); setTopPlayers([]);
          setTopStage('finished'); setWinners([]); setLastDrawEvent('draw_finished');
          setDrawActive(false);
          break;
        }

        case 'next_draws': {
          const ndData = payload?.data ?? payload;
          console.log(`${TAG} 📅 next_draws: ${ndData?.draws?.length ?? 0}`);
          if (Array.isArray(ndData?.draws)) { setNextDraws(ndData.draws); }
          break;
        }

        case 'hot_draws': {
          const hdData = payload?.data ?? payload;
          if (Array.isArray(hdData?.draws)) { setHotDraws(hdData.draws); }
          break;
        }

        case 'jackpot_info': {
          const jiData = payload?.data ?? payload;
          console.log(`${TAG} 💎 jackpot_info: activeToday=${jiData?.activeToday} total=${jiData?.totalAmount ?? jiData?.currentAmount}`);
          setJackpotInfo(jiData ?? null);
          const total = jiData?.totalAmount ?? (jiData?.currentAmount !== undefined && jiData?.baseAmount !== undefined ? jiData.baseAmount + jiData.currentAmount : jiData?.currentAmount);
          if (total !== undefined && jiData?.activeToday) {
            setJackpotAmount(Number(total));
          }
          if (jiData?.triggerBallLimit !== undefined) {
            setTriggerBallLimit(Number(jiData.triggerBallLimit) || null);
          }
          break;
        }

        case 'tv_restart':
        case 'restart':
          console.log(`${TAG} 🔁 restart`);
          if (onRestartEvent) { onRestartEvent(); }
          break;

        default: {
          const inner: string = parsed?.event || parsed?.type || '';
          console.log(`${TAG} ❓ não mapeado: "${eventType}" inner="${inner}"`);
          if (inner && inner !== eventType) { dispatch(inner, rawData); }
        }
      }
    } catch (e) {
      console.error(`${TAG} ❌ parse erro evento="${eventType}":`, e, 'raw=', rawData.substring(0, 100));
    }
  }, [onRestartEvent]);

  // ── processChunk — parseia linhas SSE incrementais ────────────────────────
  // Chamado com o NOVO texto recebido desde o último processamento
  const processChunk = useCallback((chunk: string) => {
    bufferRef.current += chunk;
    const lines = bufferRef.current.split(/\r?\n/);
    bufferRef.current = lines.pop() ?? ''; // guarda incompleto

    for (const line of lines) {
      if (line.startsWith('event:')) {
        evtTypeRef.current = line.slice(6).trim();
      } else if (line.startsWith('data:')) {
        evtDataRef.current = line.slice(5).trim();
      } else if (line === '') {
        if (evtDataRef.current) {
          dispatch(evtTypeRef.current, evtDataRef.current);
        }
        evtTypeRef.current = 'message';
        evtDataRef.current = '';
      } else if (line.startsWith(':')) {
        console.log(`${TAG} 💓 heartbeat`);
      }
    }
  }, [dispatch]);

  // ── connect via XHR ───────────────────────────────────────────────────────
  const connect = useCallback(() => {
    if (unmountedRef.current) { return; }

    // Limpar XHR anterior
    if (xhrRef.current) {
      xhrRef.current.abort();
      xhrRef.current = null;
    }

    // Reset cursores
    processedRef.current  = 0;
    bufferRef.current     = '';
    evtTypeRef.current    = 'message';
    evtDataRef.current    = '';

    const url = buildUrl();
    setDebugUrl(url);

    console.log(`${TAG} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`${TAG} 🔌 XHR CONECTANDO → "${url}"`);
    console.log(`${TAG} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open('GET', url, true); // async=true
    xhr.setRequestHeader('Accept', 'text/event-stream');
    xhr.setRequestHeader('Cache-Control', 'no-cache');
    // Sem timeout para manter a conexão aberta
    xhr.timeout = 0;

    // Disparado progressivamente a cada novo chunk
    xhr.onreadystatechange = () => {
      if (unmountedRef.current) { return; }

      if (xhr.readyState === 2) {
        // HEADERS_RECEIVED
        console.log(`${TAG} ✅ HTTP ${xhr.status} — conectado`);
        if (xhr.status === 200) {
          setConnected(true);
          retryDelay.current = 1000;
        } else {
          console.error(`${TAG} ❌ Status inesperado: ${xhr.status}`);
        }
      }

      if (xhr.readyState === 3 || xhr.readyState === 4) {
        const fullText = xhr.responseText ?? '';
        const newChunk = fullText.substring(processedRef.current);
        processedRef.current = fullText.length;

        if (newChunk.length > 0) {
          processChunk(newChunk);
        }

        if (xhr.readyState === 4) {
          console.log(`${TAG} 🔚 XHR encerrado — status=${xhr.status} total=${fullText.length}B events=${eventCountRef.current}`);
          if (!unmountedRef.current) {
            setConnected(false);
            scheduleRetry();
          }
        }
      }
    };

    xhr.onerror = () => {
      console.error(`${TAG} ❌ XHR onerror — verifique a URL e conectividade de rede`);
      if (!unmountedRef.current) {
        setConnected(false);
        scheduleRetry();
      }
    };

    xhr.ontimeout = () => {
      console.warn(`${TAG} ⏱ XHR timeout`);
      if (!unmountedRef.current) {
        setConnected(false);
        scheduleRetry();
      }
    };

    xhr.onabort = () => {
      console.log(`${TAG} 🛑 XHR abortado`);
    };

    console.log(`${TAG} ▶️ xhr.send()`);
    xhr.send();
  }, [buildUrl, processChunk]);

  // ── scheduleRetry ──────────────────────────────────────────────────────────
  const scheduleRetry = useCallback(() => {
    const delay = retryDelay.current;
    console.log(`${TAG} 🔄 Retry em ${delay}ms...`);
    retryRef.current = setTimeout(() => {
      if (!unmountedRef.current) { connect(); }
    }, delay);
    retryDelay.current = Math.min(retryDelay.current * 2, 30_000);
  }, [connect]);

  // ── lifecycle ──────────────────────────────────────────────────────────────
  useEffect(() => {
    console.log(`${TAG} 🟢 Provider montado — baseUrl="${baseUrl}" roomId="${roomId}"`);
    if (!roomId || !baseUrl) {
      console.error(`${TAG} ❌ baseUrl ou roomId VAZIO`);
      return;
    }
    unmountedRef.current = false;
    connect();

    return () => {
      console.log(`${TAG} 🔴 Provider desmontando`);
      unmountedRef.current = true;
      if (retryRef.current) { clearTimeout(retryRef.current); }
      if (xhrRef.current)   { xhrRef.current.abort(); xhrRef.current = null; }
      setConnected(false);
    };
  }, [roomId, baseUrl, connect]);

  // Log de estado para diagnóstico
  useEffect(() => {
    console.log(`${TAG} STATE → conn=${connected} draw=${drawActive} balls=${drawnNumbers.length} jackpot=${jackpotAmount} trigger=${triggerBallLimit}`);
  }, [connected, drawActive, drawnNumbers.length, jackpotAmount, triggerBallLimit]);

  useEffect(() => {
    console.log(`${TAG} nextDraws → ${nextDraws.length} | jackpotInfo → active=${jackpotInfo?.activeToday} total=${jackpotInfo?.totalAmount}`);
  }, [nextDraws.length, jackpotInfo]);

  return (
    <SSEContext.Provider value={{
      connected, drawnNumbers, currentBall, topPlayers, topStage,
      jackpotAmount, triggerBallLimit, lastDrawEvent, winners, myTickets, promotions,
      drawActive, nextDraws, hotDraws, jackpotInfo, hadDrawInSession,
      debugUrl, debugLastEvent, debugEventCount,
    }}>
      {children}
    </SSEContext.Provider>
  );
}

export const useGameSocket = () => useContext(SSEContext);
