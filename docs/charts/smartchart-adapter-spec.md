<!-- [AI] -->

# SmartChart Adapter Spec: derivatives-charts API → smartchart-champion Providers

Objective

- Introduce a thin adapter between the client app and smartchart-champion so the rest of the app can keep using the existing functions/data while the adapter transforms them into the formats champion expects, as per docs/charts/SmartChart.md.

This spec analyzes the existing codebase and defines the exact interfaces, mapping logic, and steps needed to implement the adapter.

Relevant current code

- Containers:
    - packages/trader/src/Modules/Trading/Containers/trade-chart.tsx
    - packages/trader/src/Modules/Contract/Containers/replay-chart.tsx
- Store/network:
    - packages/trader/src/Stores/Modules/Trading/trade-store.ts (wsSendRequest, wsSubscribe, wsForget, wsForgetStream, WS.\*)
- SmartChart wrapper:
    - packages/trader/src/Modules/SmartChart/index.js

Champion target providers (per SmartChart.md)

- getQuotes(params): Promise<TGetQuotesResult>
- subscribeQuotes(params, callback): () => void (returns unsubscribe function)
- unsubscribeQuotes?(request?): void (optional)
- chartData.activeSymbols (existing)
- chartData.tradingTimes (recommended map)

The adapter will produce these champion providers from the existing derivatives-charts-style infrastructure.

---

1. Adapter Interfaces (Target)

Types (local aliases mirroring champion expectations):

```ts
export type TGranularity = number; // 0 = ticks, >0 = candle seconds

export type TGetQuotesParams = {
    symbol: string;
    granularity: TGranularity;
    count: number;
    start?: number;
    end?: number;
    style?: 'ticks' | 'candles';
};

export type TGetQuotesResult =
    | { history: { prices: number[]; times: number[] } } // ticks (granularity===0)
    | { candles: Array<{ open: number; high: number; low: number; close: number; epoch: number }> }; // candles

export type TQuote = {
    Date: string; // epoch or ISO string
    Close: number;
    Open?: number;
    High?: number;
    Low?: number;
    Volume?: number;
    tick?: { epoch: number; quote: number; symbol: string; id?: string };
    ohlc?: {
        open: string;
        high: string;
        low: string;
        close: string;
        epoch: number;
        symbol?: string;
        pip_size?: number;
    };
    DT?: Date;
    prevClose?: number;
};

// Champion provider signatures:
export type TGetQuotes = (params: TGetQuotesParams) => Promise<TGetQuotesResult>;
export type TSubscribeQuotes = (
    params: { symbol: string; granularity: TGranularity },
    callback: (quote: TQuote) => void
) => () => void; // returns unsubscribe
export type TUnsubscribeQuotes = (request?: unknown) => void; // optional
```

Adapter output API:

```ts
export type TChampionAdapter = {
    getQuotes: TGetQuotes;
    subscribeQuotes: TSubscribeQuotes;
    unsubscribeQuotes?: TUnsubscribeQuotes;
    buildChartData: () => {
        activeSymbols: ActiveSymbols;
        tradingTimes?: Record<string, { isOpen: boolean; openTime: string; closeTime: string }>;
    };
};
```

---

2. Adapter Inputs (Existing App Contract)

The adapter will use existing store/network functions:

- One-shot, streaming, and unsubscribe:
    - wsSendRequest(req)
    - wsSubscribe(req, callback)
    - wsForget(req)
    - wsForgetStream(id)

    From: packages/trader/src/Stores/Modules/Trading/trade-store.ts

- Data sources:
    - active_symbols (ActiveSymbols)
    - Optionally trading times or anything that can derive open/close state:
        - active_symbols[].exchange_is_open (1/0)
        - If detailed trading_times exist in app (not clearly exported), we can map them to the simplified Record.

- Deriv WS helpers:
    - WS.getTicksHistory(req)
    - WS.subscribeTicksHistory(req, cb)
    - WS.forgetStream(id)

The adapter will not change the store; it wraps these inputs and produces champion-facing providers.

---

3. Mapping Rules

History (getQuotes)

- Input: TGetQuotesParams { symbol, granularity, count, start?, end? }
- Build Deriv ticks_history request:
    - ticks_history: symbol
    - end: end ? String(end) : 'latest'
    - adjust_start_time: 1
    - If granularity > 0: style='candles', granularity=granularity
    - Else: style='ticks'
    - If start: set start, else if count: set count
- Response transform:
    - If candles: map [{ open, high, low, close, epoch|open_time }] → { candles: [...] }
    - Else: map history.prices/times → numbers → { history: { prices, times } }

Streaming (subscribeQuotes)

- Input: { symbol, granularity }, callback(TQuote)
- Build req:
    - ticks_history: symbol
    - end: 'latest'
    - subscribe: 1
    - style: 'candles' + granularity if granularity>0; otherwise 'ticks'
- Response transform (per message):
    - If msg.ohlc:
        - Produce TQuote with Date=open_time, Open/High/Low/Close, and ohlc payload
    - If msg.tick:
        - Produce TQuote with Date=epoch, Close=quote, and tick payload
- Return unsubscribe() that uses stored subscription object’s .unsubscribe(), or falls back to wsForget(req) if needed.

Unsubscribe (optional manual)

- Provide unsubscribeQuotes(request?) if you want an explicit method, but rely primarily on the closure returned by subscribeQuotes.

chartData builder

- Provide:
    - activeSymbols: from store.active_symbols (already correct shape)
    - tradingTimes (optional but recommended): Derive using exchange_is_open:
        ```
        tradingTimes[symbol] = {
          isOpen: exchange_is_open === 1,
          openTime: '',   // if not available
          closeTime: '',  // if not available
        }
        ```

---

4. Proposed Adapter Implementation (Code Skeleton)

Create file: packages/trader/src/Modules/SmartChart/adapter/champion-adapter.ts

```ts
import type { ActiveSymbols } from '@deriv/api-types';
import { WS } from '@deriv/shared'; // used by trade-store today
import { toJS } from 'mobx';

type TGranularity = number;

type TGetQuotesParams = {
    symbol: string;
    granularity: TGranularity;
    count: number;
    start?: number;
    end?: number;
    style?: 'ticks' | 'candles';
};

type TGetQuotesResult =
    | { history: { prices: number[]; times: number[] } }
    | { candles: Array<{ open: number; high: number; low: number; close: number; epoch: number }> };

type TQuote = {
    Date: string;
    Close: number;
    Open?: number;
    High?: number;
    Low?: number;
    Volume?: number;
    tick?: { epoch: number; quote: number; symbol: string; id?: string };
    ohlc?: {
        open: string;
        high: string;
        low: string;
        close: string;
        epoch: number;
        symbol?: string;
        pip_size?: number;
    };
};

type TSubscribeQuotes = (
    params: { symbol: string; granularity: TGranularity },
    callback: (quote: TQuote) => void
) => () => void;

export const makeChampionAdapter = (opts: {
    // Existing store functions & data:
    getActiveSymbols: () => ActiveSymbols;
    wsGetTicksHistory?: (req: any) => Promise<any>; // optional override, defaults to WS.getTicksHistory
    // You can also inject trade-store.wsSubscribe/wsForget if preferred
}): {
    getQuotes: (p: TGetQuotesParams) => Promise<TGetQuotesResult>;
    subscribeQuotes: TSubscribeQuotes;
    unsubscribeQuotes?: (r?: unknown) => void;
    buildChartData: () => {
        activeSymbols: ActiveSymbols;
        tradingTimes?: Record<string, { isOpen: boolean; openTime: string; closeTime: string }>;
    };
} => {
    const wsGetTicksHistory = opts.wsGetTicksHistory ?? WS.getTicksHistory;

    const getQuotes = async ({
        symbol,
        granularity,
        count,
        start,
        end,
    }: TGetQuotesParams): Promise<TGetQuotesResult> => {
        const req: any = {
            ticks_history: symbol,
            end: end ? String(end) : 'latest',
            adjust_start_time: 1,
        };
        if (granularity && granularity > 0) {
            req.style = 'candles';
            req.granularity = granularity;
        } else {
            req.style = 'ticks';
        }
        if (start) req.start = String(start);
        else if (count) req.count = Number(count);

        const resp = await wsGetTicksHistory(req);

        if (req.style === 'candles' && Array.isArray((resp as any).candles)) {
            const candles = (resp as any).candles.map((c: any) => ({
                open: Number(c.open),
                high: Number(c.high),
                low: Number(c.low),
                close: Number(c.close),
                epoch: Number(c.epoch || c.open_time),
            }));
            return { candles };
        }
        const prices: number[] = (resp?.history?.prices || []).map(Number);
        const times: number[] = (resp?.history?.times || []).map(Number);
        return { history: { prices, times } };
    };

    const subscribeQuotes: TSubscribeQuotes = ({ symbol, granularity }, callback) => {
        const req: any = {
            ticks_history: symbol,
            end: 'latest',
            subscribe: 1,
        };
        if (granularity && granularity > 0) {
            req.style = 'candles';
            req.granularity = granularity;
        } else {
            req.style = 'ticks';
        }

        const subscriber = WS.subscribeTicksHistory(req, (msg: any) => {
            if (msg?.ohlc) {
                const { open, high, low, close, open_time, pip_size } = msg.ohlc;
                callback({
                    Date: String(open_time),
                    Open: Number(open),
                    High: Number(high),
                    Low: Number(low),
                    Close: Number(close),
                    ohlc: {
                        open: String(open),
                        high: String(high),
                        low: String(low),
                        close: String(close),
                        epoch: Number(open_time),
                        pip_size,
                    },
                });
                return;
            }
            if (msg?.tick) {
                const { epoch, quote } = msg.tick;
                callback({
                    Date: String(epoch),
                    Close: Number(quote),
                    tick: { epoch: Number(epoch), quote: Number(quote), symbol },
                });
            }
        });

        return () => {
            try {
                subscriber?.unsubscribe?.();
            } catch {
                // Fallback if needed: no-op or route to legacy wsForget(req)
            }
        };
    };

    const buildChartData = () => {
        const activeSymbols = toJS(opts.getActiveSymbols());
        const tradingTimes: Record<string, { isOpen: boolean; openTime: string; closeTime: string }> = {};
        // Derive minimal map using exchange_is_open
        activeSymbols.forEach((s: any) => {
            tradingTimes[s.symbol] = {
                isOpen: s.exchange_is_open === 1,
                openTime: '',
                closeTime: '',
            };
        });
        return { activeSymbols, tradingTimes };
    };

    return { getQuotes, subscribeQuotes, buildChartData };
};
```

Notes:

- This adapter uses WS.\* directly for simplicity. If you prefer to reuse trade-store.wsSubscribe/wsForget/wsSendRequest, inject them instead and adjust accordingly.
- Unsubscribe is closure-based, aligning with champion.

---

5. Integration Steps

A) Keep your existing store as-is

- No need to remove wsSendRequest/wsSubscribe/wsForget/wsForgetStream
- Continue maintaining active_symbols

B) Create the adapter module (champion-adapter.ts)

- Use the code skeleton above
- Export makeChampionAdapter and call it where needed (e.g., in a provider or container)

C) Wire containers to the adapter outputs

- In trade-chart.tsx and replay-chart.tsx:
    - Import makeChampionAdapter
    - Instantiate using store getters (e.g., getActiveSymbols: () => useTraderStore().active_symbols)
    - Pass adapter.getQuotes/subscribeQuotes + adapter.buildChartData() to SmartChart

Example (trade-chart.tsx key parts):

```tsx
const store = useTraderStore();
const adapter = React.useMemo(
  () =>
    makeChampionAdapter({
      getActiveSymbols: () => store.active_symbols,
      // wsGetTicksHistory: custom if desired; else defaults to WS.getTicksHistory
    }),
  [store.active_symbols]
);

const chartData = adapter.buildChartData();

<SmartChart
  ...
  getQuotes={adapter.getQuotes}
  subscribeQuotes={adapter.subscribeQuotes}
  // unsubscribeQuotes is optional; closure-based unsubscribe returned by subscribeQuotes is primary
  chartData={chartData}
  shouldFetchTradingTimes={false}
  ...
/>
```

D) Keep UI/props unaffected

- Widgets, barriers, contracts_array, markers, and replay/static props continue to work

---

6. Edge Cases and Behavior

- Market-closed one-shot
    - Current wsSubscribe in store converts subscribe to one-shot for closed markets
    - Adapter subscribeQuotes uses WS.subscribeTicksHistory directly; if your WS returns one-shot for closed markets, you’ll simply stop receiving updates. Champion typically calls getQuotes for history and then subscribeQuotes for live; no issue.

- Timezone/Data formatting
    - For TQuote.Date, prefer epoch string (String(epoch)) to let SmartChart parse consistently as UTC

- Trading times map (optional)
    - Enhance user experience by showing open/close status; the minimal derived map in buildChartData is sufficient
    - If detailed times exist, enrich openTime/closeTime

- Memory management
    - The closure returned by subscribeQuotes must be called on symbol/granularity change and on unmount
    - Champion SmartChart handles this; ensure container re-renders pass the returned unsubscribe back to the chart via prop changes

---

7. Minimal Change Plan (Checklist)

- [ ] Add adapter module: packages/trader/src/Modules/SmartChart/adapter/champion-adapter.ts
- [ ] Switch SmartChart wrapper bundle to @deriv-com/smartcharts-champion (Modules/SmartChart/index.js)
- [ ] In trade-chart.tsx:
    - [ ] Instantiate adapter with getActiveSymbols
    - [ ] Pass adapter.getQuotes and adapter.subscribeQuotes
    - [ ] Replace initialData/chartData with adapter.buildChartData()
    - [ ] Keep shouldFetchTradingTimes={false}
- [ ] In replay-chart.tsx: same as trade-chart.tsx
- [ ] Validate streaming (subscription/unsubscription) on symbol/granularity change and unmount
- [ ] Verify ticks (history) and candles (history) formatting
- [ ] Verify markers/barriers and widgets unaffected

---

8. Why an Adapter?

- Encapsulates all mapping logic in a single place
- Allows containers and store to remain mostly unchanged
- Enables gradual migration and controlled testing
- Provides a seam to add metrics/logging or extend types without leaking details across the app

---

9. Testing Strategy

- Unit test adapter mappings:
    - map candles response → { candles }
    - map tick history → { history }
    - map stream (ohlc/tick) → TQuote
- Integration:
    - TradeChart shows live series with proper updates
    - ReplayChart loads start/end ranges via getQuotes only
    - Unsubscribe behavior verified by switching symbols/timeframes
    - ActiveSymbols/tradingTimes visible to champion (optional features like open/close styling)

With this adapter in place, smartchart-champion can be adopted without invasive changes, and the app can continue using the same underlying functions and data sources.

## 10) AppV2 TradeChart coverage (props and functions)

Source: packages/trader/src/AppV2/Containers/Chart/trade-chart.tsx

Below lists every SmartChart prop used in AppV2, and whether the adapter must handle it, is compatible as-is, or needs verification/polyfill in smartchart-champion.

Networking/data providers (adapter responsibility)

- requestAPI, requestSubscribe, requestForget, requestForgetStream → REPLACED
    - Replace with: getQuotes, subscribeQuotes; optional unsubscribeQuotes
    - Status: Must be switched to adapter outputs
- initialData, chartData (activeSymbols) → AS-IS
    - Adapter exposes buildChartData() so containers can keep using preloaded ActiveSymbols
    - shouldFetchTradingTimes={false} remains
- feedCall={{ activeSymbols: false }} → VERIFY
    - Champion relies on chartData; feedCall is not required and can be kept or removed (no functional need if chartData provided)

Chart behavior and UX (generally compatible)

- symbol, chartType, granularity → AS-IS
- isMobile → AS-IS
- id → AS-IS
- settings → AS-IS
- allowTickChartTypeOnly → AS-IS
- stateChangeListener → AS-IS (wired to store.chartStateChange)
- chartStatusListener → AS-IS (wired to store.setChartStatus)
- isConnectionOpened → AS-IS (used to refresh on reconnection)
- isLive → AS-IS
- isVerticalScrollEnabled={false} → AS-IS
- enabledNavigationWidget, enabledChartFooter → AS-IS
- crosshair={isMobile?0:undefined} → AS-IS
- crosshairTooltipLeftAllow={560} → VERIFY
    - Not explicitly listed in SmartChart.md but supported in current integration; leave as-is. If upstream removes, polyfill with CSS override/tooltips.
- showLastDigitStats → VERIFY
    - Product feature flag; champion likely passes digits to bottom widgets similarly. Keep; if behavior differs, adapter doesn’t need to change (UI concern).
- maxTick → AS-IS
- yAxisMargin, leftMargin → AS-IS
- should_zoom_out_on_yaxis → VERIFY
    - Custom flag; if unsupported upstream, no-op is acceptable as it won’t break flow.
- clearChart={false} → AS-IS
- importedLayout, onExportLayout → AS-IS
- hasAlternativeSource → AS-IS
- getMarketsOrder(active_symbols) → AS-IS (function passed through)
- topWidgets={()=><div/>} → AS-IS (suppresses built-in title dropdown)
- bottomWidgets={BottomWidgetsMobile} → AS-IS (see note below)
- toolbarWidget={()=> <ToolbarWidgets ... />} → AS-IS
- barriers, contracts_array (markers_array) → AS-IS
- children (AccumulatorsChartElements) → AS-IS

BottomWidgetsMobile data flow

- BottomWidgetsMobile expects SmartChart to provide { digits, tick } to props of bottom widget.
- This behavior is retained with champion; adapter does not need to transform these values.
- Store captures them via setDigitStats(digits) and setTickData(tick), unchanged.

Conclusion for AppV2

- The only changes needed in AppV2 TradeChart are:
    - Swap requestAPI/requestSubscribe/requestForget/requestForgetStream → adapter.getQuotes/adapter.subscribeQuotes/(optional)adapter.unsubscribeQuotes
    - Provide chartData from adapter.buildChartData() or keep current chartData as-is if it already supplies ActiveSymbols
    - Keep all other props as-is; flagged items (crosshairTooltipLeftAllow, showLastDigitStats, should_zoom_out_on_yaxis) are safe to leave and verify visually

---

## 11) Request/response type transformation (explicit matrix)

Client app (Deriv WS) vs smartchart-champion expectations

History (one-shot)

- Champion input: TGetQuotesParams = { symbol: string; granularity: number; count: number; start?: number; end?: number }
- Client app transports: Deriv WS ticks_history requests

Transformation in adapter.getQuotes:

- Build request:
    - ticks_history = symbol
    - end = end? String(end) : 'latest'
    - adjust_start_time = 1
    - If granularity > 0: style='candles', granularity
    - Else: style='ticks'
    - If start: req.start = String(start)
    - Else if count: req.count = count
- Map responses to Champion:
    - Candles (Deriv):
        - Input: resp.candles: Array<{ open, high, low, close, epoch | open_time }>
        - Output: { candles: Array<{ open:number; high:number; low:number; close:number; epoch:number }> }
            - epoch = Number(epoch || open_time)
    - Ticks (Deriv):
        - Input: resp.history.{ prices: string[]|number[], times: string[]|number[] }
        - Output: { history: { prices:number[]; times:number[] } } (ensure Number(..) coercion)

Streaming (live)

- Champion subscribeQuotes params: { symbol, granularity }, callback(TQuote)
- Client app streaming: WS.subscribeTicksHistory(req, cb)

Transformation in adapter.subscribeQuotes:

- Request:
    - ticks_history = symbol; end='latest'; subscribe=1
    - style='candles', granularity if granularity>0; else style='ticks'
- Message mapping:
    - If msg.ohlc:
        - TQuote = { Date:String(open_time), Open:+open, High:+high, Low:+low, Close:+close, ohlc:{ open, high, low, close, epoch:+open_time, pip_size? } }
    - If msg.tick:
        - TQuote = { Date:String(epoch), Close:+quote, tick:{ epoch:+epoch, quote:+quote, symbol } }
- Returns: () => subscriber.unsubscribe()

Notes on type normalization

- Always coerce numeric fields to number to avoid accidental string types:
    - open/high/low/close/epoch/quote
- Prefer epoch string in TQuote.Date (SmartChart parses as UTC consistently)
- If your backend adds subscription.id in messages, you don’t need to use it in champion (closure-based unsubscribe is preferred), but it’s fine to store it internally if you wish.

Trading times data

- Champion accepts chartData.tradingTimes as a simplified map:
    - Record<symbol, { isOpen:boolean; openTime:string; closeTime:string }>
- Derive isOpen from ActiveSymbols.exchange_is_open; leave times blank if not available.

---

## 12) Actionable delta for this repo

To strictly follow “don’t create another doc; add what’s missing”:

- The adapter spec already defines the provider interfaces and core mapping.
- Added here:
    1. Full coverage for AppV2 TradeChart props (what changes, what stays)
    2. Explicit request/response transformation matrix (client app ⇄ champion)
    3. BottomWidgets digits/tick note to ensure V2 behavior remains

With these additions, the current adapter spec covers AppV2 needs and the critical request/response type transformations required for champion.

<!-- [/AI] -->
