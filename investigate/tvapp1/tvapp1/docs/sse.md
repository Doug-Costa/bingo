# Documentação de Eventos em Tempo Real (SSE) - Bingo

O backend do Bingo disponibiliza um endpoint de **Server-Sent Events (SSE)** para comunicação unidirecional em tempo real. Esta interface é crítica para os painéis de TV de Bingo (Android/Web), terminais POS e clientes jogadores, fornecendo atualizações instantâneas sobre os sorteios, bolas sorteadas, vencedores, jackpots, promoções e proximidade de ganho.

---

## 1. Conexão e Autenticação

O canal SSE é exposto no seguinte endpoint:

```http
GET /bingo/realtime-sse/stream
```

### Parâmetros de Query String

| Parâmetro | Tipo | Descrição |
| :--- | :--- | :--- |
| `pin` | `string` | **Obrigatório para TVs e terminais POS.** Código PIN de 6 dígitos que identifica o terminal de exibição. |
| `token` | `string` | **Obrigatório para Clientes Jogadores.** JWT gerado após o login do player. |
| `roomId` | `string` | *Opcional.* ID da sala de Bingo desejada (caso o PIN/Token possua acesso a múltiplas salas). |

> [!NOTE]
> **Tratamento Defensivo de URL:**
> O servidor trata automaticamente conexões com parâmetros mal formatados originados de alguns clientes Android de TV (ex: `?pin=123456?token=eyJ...`), extraindo o PIN e o Token de forma transparente.

---

## 2. Eventos Iniciais de Conexão (Snapshot)

Assim que a conexão SSE é estabelecida com sucesso, o servidor envia imediatamente três eventos para carregar o estado inicial do terminal:

### A. Evento `snapshot`
Fornece o estado atual da sala de bingo ativa na Redis Cache. Se houver um sorteio em andamento, ele conterá as bolas sorteadas, acumuladores e lista de vencedores parciais.

#### Exemplo de Payload:
```json
{
  "type": "snapshot",
  "state": {
    "drawId": "d3b07384-d113-4a1e-a5f1-3be22956cfcd",
    "status": "started",
    "balls": [12, 45, 87, 3, 22],
    "winners": [],
    "topWinners": [
      {
        "ticketId": "t-10023",
        "playerId": "p-501",
        "linesCompleted": 2,
        "minNumbersLeft": 1,
        "missing": [55]
      }
    ],
    "lineWinners": [],
    "jackpot": {
      "id": "j-fixed-102",
      "name": "Jackpot Fixo da Sorte",
      "type": "FIXO",
      "baseAmount": 5000.00,
      "currentAmount": 1250.50,
      "triggerBallLimit": 42
    },
    "triggerBallLimit": 42,
    "jackpotAmount": 6250.50
  }
}
```

### B. Evento `my_tickets`
Retorna a lista de cartelas ativas compradas pelo jogador autenticado para a rodada atual.

#### Exemplo de Payload:
```json
{
  "type": "my_tickets",
  "tickets": [
    {
      "id": "tick_983742",
      "roomId": "room-001",
      "drawId": "d3b07384-d113-4a1e-a5f1-3be22956cfcd",
      "numbers": [
        {
          "numbers": [
            [5, 12, 28, 47, 82],
            [9, 19, 33, 56, 74],
            [1, 15, 41, 62, 90]
          ],
          "value": 2.00,
          "status": "pending"
        }
      ]
    }
  ]
}
```

### C. Evento `promotions_list`
Envia a lista de promoções ativas cadastradas na sala para exibição em banners rotativos nos aplicativos de TV.

#### Exemplo de Payload:
```json
{
  "type": "promotions_list",
  "promotions": [
    {
      "id": "promo-01",
      "urlimg": "https://cdn.seusite.com/promos/domingo_feliz.jpg",
      "title": "Domingo com Rodada Dobrada!",
      "linkurl": "https://seusite.com/promo1",
      "video": "https://cdn.seusite.com/promos/videos/domingo.mp4",
      "order": 1
    }
  ]
}
```

---

## 3. Eventos em Tempo Real (Pub/Sub)

Durante o ciclo de vida dos sorteios, o servidor publica os seguintes eventos dinamicamente através do canal Redis Pub/Sub:

### `draw_start`
Disparado quando a rodada de sorteio de bolas é iniciada na sala.

```json
{
  "type": "draw_start",
  "data": {
    "drawId": "d3b07384-d113-4a1e-a5f1-3be22956cfcd",
    "roomId": "room-001",
    "scheduledAt": "2026-07-27T18:00:00.000Z",
    "prizeLine1": 100.00,
    "prizeLine2": 250.00,
    "prizeLine3": 1000.00,
    "jackpotAmount": 6250.50,
    "triggerBallLimit": 42
  }
}
```

---

### `new_ball`
Enviado a cada X segundos informando o número sorteado pelo soprador eletrônico/matemático.

```json
{
  "type": "new_ball",
  "data": {
    "number": 45
  }
}
```

---

### `top_winners`
Fornece informações em tempo real de proximidade de vitória de linha ou bingo (cartelas mais próximas de ganhar com 1 ou 2 números restantes).

```json
{
  "type": "top_winners",
  "data": {
    "stage": "bingo",
    "items": [
      {
        "ticketId": "t-10023",
        "playerId": "p-501",
        "playerName": "Marcos Silva",
        "linesCompleted": 2,
        "minNumbersLeft": 1,
        "missing": [55]
      }
    ]
  }
}
```

---

### `line_winner`
Anuncia um ou mais ganhadores de uma linha específica (Linha 1, Linha 2 ou Bingo/Linha 3).

```json
{
  "type": "line_winner",
  "data": {
    "line": 1,
    "winners": [
      {
        "ticketId": "t-10023",
        "playerName": "Marcos Silva",
        "share": 100.00
      }
    ],
    "jackpotWon": false
  }
}
```

---

### `jackpot_trigger_update`
Informa que o limite de bola de ativação do jackpot foi ajustado dinamicamente para o sorteio atual.

```json
{
  "type": "jackpot_trigger_update",
  "data": {
    "drawId": "d3b07384-d113-4a1e-a5f1-3be22956cfcd",
    "jackpotId": "j-fixed-102",
    "triggerBallLimit": 43,
    "jackpotAmount": 6250.50,
    "paid": false
  }
}
```

---

### `jackpot_delayed`
Enviado quando o jackpot acumula para o próximo sorteio, incrementando o limite de ativação.

```json
{
  "type": "jackpot_delayed",
  "data": {
    "drawId": "d3b07384-d113-4a1e-a5f1-3be22956cfcd",
    "jackpotId": "j-fixed-102",
    "newTriggerLimit": 44,
    "jackpotAmount": 6300.00
  }
}
```

---

### `jackpot_paid`
Anuncia que o prêmio de Jackpot foi ganho e pago aos jogadores.

```json
{
  "type": "jackpot_paid",
  "data": {
    "drawId": "d3b07384-d113-4a1e-a5f1-3be22956cfcd",
    "jackpotId": "j-fixed-102",
    "triggerBallLimit": 44,
    "jackpotAmount": 6300.00,
    "winners": [
      {
        "ticketId": "t-10023",
        "playerId": "p-501",
        "affiliateId": "aff-09",
        "share": 6300.00
      }
    ]
  }
}
```

---

### `winners`
Lista final contendo o sumário completo de todos os ganhadores oficiais do sorteio.

```json
{
  "type": "winners",
  "data": [
    {
      "line": 1,
      "ticketId": "t-10023",
      "playerName": "Marcos Silva",
      "prize": 100.00
    },
    {
      "line": 3,
      "ticketId": "t-10023",
      "playerName": "Marcos Silva",
      "prize": 1000.00
    }
  ]
}
```

---

### `draw_end`
Indica que o sorteio atual terminou com sucesso e o estado da sala está limpo para a próxima rodada.

```json
{
  "type": "draw_end",
  "data": {
    "drawId": "d3b07384-d113-4a1e-a5f1-3be22956cfcd"
  }
}
```

---

### `draw_cancel`
Informa o cancelamento prematuro do sorteio atual por intervenção administrativa.

```json
{
  "type": "draw_cancel",
  "data": {
    "drawId": "d3b07384-d113-4a1e-a5f1-3be22956cfcd"
  }
}
```

---

### `next_draws`
Atualiza a lista de sorteios agendados a serem exibidos em modo de espera/espera de tela.

```json
{
  "type": "next_draws",
  "data": {
    "draws": [
      {
        "id": "next-draw-99",
        "scheduledAt": "2026-07-27T18:15:00.000Z",
        "prizeLine1": 100.00,
        "prizeLine2": 200.00,
        "prizeLine3": 800.00,
        "room": {
          "name": "Sala Ouro 1"
        }
      }
    ]
  }
}
```

---

### `jackpot_info`
Atualiza os acumuladores em tempo real para exibição nas telas de TV.

```json
{
  "type": "jackpot_info",
  "data": {
    "activeToday": true,
    "id": "j-fixed-102",
    "name": "Jackpot Fixo da Sorte",
    "type": "FIXO",
    "currentAmount": 1250.50,
    "baseAmount": 5000.00,
    "triggerBallLimit": 44,
    "triggerBallChoice": 40,
    "triggerBallLimitForce": 50,
    "triggerBallLimitMin": 30
  }
}
```

---

### `hot_draws`
Lista de sorteios especiais de alta atratividade configurados para promoção nas telas de espera.

```json
{
  "type": "hot_draws",
  "data": {
    "draws": [
      {
        "id": "special-draw-10",
        "scheduledAt": "2026-07-27T20:00:00.000Z",
        "prizeLine1": 500.00,
        "prizeLine2": 1000.00,
        "prizeLine3": 5000.00
      }
    ]
  }
}
```
