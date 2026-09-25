export type Market = {
  code: string;
  name: string;
  halted: boolean;
  flowUSD: number; // in millions
  leverageUsers: number;
  maxLeverage: number; // config-flag: highest Velocity Ladder rung allowed here
};

export type LogEntry = {
  id: string;
  time: string;
  text: string;
  kind: "system" | "order" | "killswitch" | "config" | "rejected";
};

export type Order = {
  id: string;
  marketCode: string;
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
      { code: "IN", name: "India", halted: false, flowUSD: 182, leverageUsers: 41200, maxLeverage: 10 },
      { code: "ID", name: "Indonesia", halted: false, flowUSD: 96, leverageUsers: 18400, maxLeverage: 20 },
      { code: "BR", name: "Brazil", halted: false, flowUSD: 74, leverageUsers: 12100, maxLeverage: 10 },
      { code: "PH", name: "Philippines", halted: true, flowUSD: 61, leverageUsers: 9800, maxLeverage: 5 },
      { code: "AE", name: "UAE", halted: false, flowUSD: 33, leverageUsers: 4100, maxLeverage: 20 },
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

function pushLog(state: StoreState, entry: Omit<LogEntry, "id" | "time">) {
  state.log.unshift({ id: crypto.randomUUID(), time: new Date().toISOString(), ...entry });
  state.log = state.log.slice(0, 40);
}

export function getStore(): StoreState {
  if (!globalForStore.__mochatradeStore) {
    globalForStore.__mochatradeStore = seedState();
  }
  return globalForStore.__mochatradeStore;
}

export function resetStore(): StoreState {
  globalForStore.__mochatradeStore = seedState();
  return globalForStore.__mochatradeStore;
}

export function toggleKillSwitch(code: string): StoreState {
  const state = getStore();
  const market = state.markets.find((m) => m.code === code);
  if (!market) return state;

  market.halted = !market.halted;
  pushLog(state, {
    text: `Leverage ${market.halted ? "halted" : "resumed"} in ${market.name} (${code}) — propagated in 29ms.`,
    kind: "killswitch",
  });
  recordSnapshot(state);
  return state;
}

export function setMaxLeverage(code: string, maxLeverage: number): StoreState {
  const state = getStore();
  const market = state.markets.find((m) => m.code === code);
  if (!market) return state;

  const previous = market.maxLeverage;
  market.maxLeverage = maxLeverage;
  pushLog(state, {
    text: `Max leverage in ${market.name} (${code}) changed ${previous}x → ${maxLeverage}x via config-flag.`,
    kind: "config",
  });
  return state;
}

export type AddOrderResult =
  | { ok: true; state: StoreState }
  | { ok: false; error: string; state: StoreState };

export function addOrder(input: {
  marketCode: string;
  amount: number;
  rungLevel: number;
  rungLabel: string;
  lossRate: number;
}): AddOrderResult {
  const state = getStore();
  const market = state.markets.find((m) => m.code === input.marketCode);

  if (!market) {
    return { ok: false, error: "Unknown market.", state };
  }
  if (market.halted) {
    pushLog(state, {
      text: `Order rejected: leverage is currently halted in ${market.name} (${market.code}).`,
      kind: "rejected",
    });
    return { ok: false, error: `Leverage is halted in ${market.name} right now.`, state };
  }
  if (input.rungLevel > market.maxLeverage) {
    pushLog(state, {
      text: `Order rejected: ${input.rungLabel} exceeds ${market.name}'s ${market.maxLeverage}x config-flag limit.`,
      kind: "rejected",
    });
    return {
      ok: false,
      error: `${market.name} caps leverage at ${market.maxLeverage}x right now.`,
      state,
    };
  }

  const exposure = input.amount * input.rungLevel;
  const order: Order = {
    id: crypto.randomUUID(),
    marketCode: market.code,
    amount: input.amount,
    rungLevel: input.rungLevel,
    rungLabel: input.rungLabel,
    lossRate: input.lossRate,
    exposure,
    time: new Date().toISOString(),
  };
  state.orders.unshift(order);
  state.orders = state.orders.slice(0, 50);

  market.flowUSD = Math.round((market.flowUSD + input.amount / 1_000_000) * 100) / 100;
  market.leverageUsers += 1;

  pushLog(state, {
    text: `Order confirmed in ${market.name}: $${input.amount.toLocaleString()} at ${input.rungLabel} (${input.lossRate}% 365d loss-rate) — logged to Supervisory Telemetry.`,
    kind: "order",
  });
  recordSnapshot(state);
  return { ok: true, state };
}
