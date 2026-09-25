export type Market = {
  code: string;
  name: string;
  halted: boolean;
  flowUSD: number; // in millions
  leverageUsers: number;
};

export type LogEntry = {
  id: string;
  time: string;
  text: string;
  kind: "system" | "order" | "killswitch";
};

export type Order = {
  id: string;
  amount: number;
  rungLevel: number;
  rungLabel: string;
  lossRate: number;
  exposure: number;
  time: string;
};

export type Snapshot = { t: number; totalFlow: number };

export type StoreState = {
  markets: Market[];
  log: LogEntry[];
  orders: Order[];
  history: Snapshot[];
};

// Kept on `globalThis` so it survives Next.js dev-mode hot reloads.
// Note: on Vercel's serverless runtime each cold-started instance gets its
// own memory, so state can reset or diverge across instances under real
// traffic. Fine for a live hackathon demo; swap in Vercel KV/Upstash Redis
// for production persistence.
const globalForStore = globalThis as unknown as { __mochatradeStore?: StoreState };

function seedState(): StoreState {
  const state: StoreState = {
    markets: [
      { code: "IN", name: "India", halted: false, flowUSD: 182, leverageUsers: 41200 },
      { code: "ID", name: "Indonesia", halted: false, flowUSD: 96, leverageUsers: 18400 },
      { code: "BR", name: "Brazil", halted: false, flowUSD: 74, leverageUsers: 12100 },
      { code: "PH", name: "Philippines", halted: true, flowUSD: 61, leverageUsers: 9800 },
      { code: "AE", name: "UAE", halted: false, flowUSD: 33, leverageUsers: 4100 },
    ],
    log: [
      {
        id: "seed",
        time: new Date().toISOString(),
        text: "Console initialized from config-flag registry.",
        kind: "system",
      },
    ],
    orders: [],
    history: [],
  };
  recordSnapshot(state);
  return state;
}

function recordSnapshot(state: StoreState) {
  const totalFlow = Math.round(state.markets.reduce((sum, m) => sum + m.flowUSD, 0) * 10) / 10;
  state.history.push({ t: Date.now(), totalFlow });
  if (state.history.length > 40) state.history.shift();
}

export function getStore(): StoreState {
  if (!globalForStore.__mochatradeStore) {
    globalForStore.__mochatradeStore = seedState();
  }
  return globalForStore.__mochatradeStore;
}

export function toggleKillSwitch(code: string): StoreState {
  const state = getStore();
  const market = state.markets.find((m) => m.code === code);
  if (!market) return state;

  market.halted = !market.halted;
  state.log.unshift({
    id: crypto.randomUUID(),
    time: new Date().toISOString(),
    text: `Leverage ${market.halted ? "halted" : "resumed"} in ${market.name} (${code}) — propagated in 29ms.`,
    kind: "killswitch",
  });
  state.log = state.log.slice(0, 30);
  recordSnapshot(state);
  return state;
}

export function addOrder(input: {
  amount: number;
  rungLevel: number;
  rungLabel: string;
  lossRate: number;
}): StoreState {
  const state = getStore();
  const exposure = input.amount * input.rungLevel;

  const order: Order = {
    id: crypto.randomUUID(),
    amount: input.amount,
    rungLevel: input.rungLevel,
    rungLabel: input.rungLabel,
    lossRate: input.lossRate,
    exposure,
    time: new Date().toISOString(),
  };
  state.orders.unshift(order);
  state.orders = state.orders.slice(0, 50);

  // Simulate the order's remittance flowing into a live (non-halted) market.
  const openMarkets = state.markets.filter((m) => !m.halted);
  const pool = openMarkets.length > 0 ? openMarkets : state.markets;
  const market = pool[Math.floor(Math.random() * pool.length)];
  market.flowUSD = Math.round((market.flowUSD + input.amount / 1_000_000) * 100) / 100;
  market.leverageUsers += 1;

  state.log.unshift({
    id: crypto.randomUUID(),
    time: new Date().toISOString(),
    text: `Order confirmed: $${input.amount.toLocaleString()} at ${input.rungLabel} (${input.lossRate}% 365d loss-rate) — logged to Supervisory Telemetry.`,
    kind: "order",
  });
  state.log = state.log.slice(0, 30);
  recordSnapshot(state);
  return state;
}
