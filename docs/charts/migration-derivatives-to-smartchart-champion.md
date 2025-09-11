<!-- [AI] -->

# Migration Guide: derivatives-charts → smartchart-champion

This document describes all required changes to migrate from the derivatives-charts SmartChart integration (requestAPI/requestSubscribe/requestForget) to smartchart-champion (getQuotes/subscribeQuotes/unsubscribeQuotes), including package changes, imports, props, data types, and implementation updates across containers and the trading store.

Target state is aligned with docs/charts/SmartChart.md.

---

0. Summary of Required Changes

- Dependencies
    - Replace package: @deriv-com/derivatives-charts → @deriv-com/smartcharts-champion
    - Keep SmartCharts CSS chunk serving (public path) but confirm path and function

- Loader wrapper (Modules/SmartChart/index.js)
    - Update moduleLoader import target to @deriv-com/smartcharts-champion
    - Keep setSmartChartsPublicPath with the correct asset base path

- Containers (trade-chart.tsx, replay-chart.tsx)
    - Remove requestAPI/requestSubscribe/requestForget/requestForgetStream props
    - Add getQuotes/subscribeQuotes/unsubscribeQuotes props
    - Continue to pass chartData with activeSymbols (and ideally tradingTimes map)
    - Keep other props (settings, widgets, symbol, granularity, etc.)

- Store (Stores/Modules/Trading/trade-store.ts)
    - Implement getQuotes(params) → Promise<TGetQuotesResult>
    - Implement subscribeQuotes(params, callback) → () => void (unsubscribe)
    - Implement unsubscribeQuotes(request?) (optional — champion relies on the closure from subscribeQuotes)
    - Keep existing WS helpers but adapt to return the shapes expected by smartchart-champion:
        - For granularity === 0: return { history: { prices, times } }
        - For granularity > 0: return { candles: [{ open, high, low, close, epoch }, ...] }
    - Map streaming (tick/ohlc) responses into TQuote in the subscribeQuotes callback

- Types and Data Shapes
    - Adopt champion’s TGetQuotes, TGetQuotesResult, TQuote conventions (see below)
    - Build a tradingTimes map if you want SmartChart to highlight market open/close per symbol

- Unsubscribe behavior
    - With champion, prefer using the unsubscribe function returned by subscribeQuotes
    - requestForget/requestForgetStream no longer passed to SmartChart

---

1. Package and Imports

package.json

- Remove:
    - "@deriv-com/derivatives-charts"
- Add:
    - "@deriv-com/smartcharts-champion": "^<latest>"

Modules/SmartChart/index.js

- Before:
    - import(/_ webpackChunkName: "smart_chart" _/ '@deriv-com/derivatives-charts')
- After:
    - import(/_ webpackChunkName: "smart_chart" _/ '@deriv-com/smartcharts-champion')

- Keep setSmartChartsPublicPath. Confirm your asset location (currently '/js/smartcharts/'). If your deployment keeps the same base path for CSS/chunks, there is no change aside from the module name.

Example diff (modules/trader/src/Modules/SmartChart/index.js):

```diff
- return import(/* webpackChunkName: "smart_chart" */ '@deriv-com/derivatives-charts');
+ return import(/* webpackChunkName: "smart_chart" */ '@deriv-com/smartcharts-champion');

 module.then(({ setSmartChartsPublicPath }) => {
-   setSmartChartsPublicPath(getUrlBase('/js/smartcharts/'));
+   // Keep as-is unless your hosting path changes
+   setSmartChartsPublicPath(getUrlBase('/js/smartcharts/'));
 });
```

Notes:

- Component names (SmartChart, ChartTitle, Views, etc.) remain the same in the champion bundle.
- If assets location changes, update getUrlBase('/js/smartcharts/') accordingly.

---

2. Prop Model Changes (Critical)

derivatives-charts expects:

- requestAPI(request)
- requestSubscribe(request, callback)
- requestForget(request) [+ optional requestForgetStream(id)]

smartchart-champion expects:

- getQuotes(params): Promise<TGetQuotesResult>
- subscribeQuotes(params, callback): () => void (returns unsubscribe)
- unsubscribeQuotes?(request?): void (optional, app-level manual forget)

What this means in our code:

- In trade-chart.tsx and replay-chart.tsx, replace requestAPI/requestSubscribe/requestForget/requestForgetStream with getQuotes/subscribeQuotes/unsubscribeQuotes.
- Build TGetQuotesResult shapes in the store.

---

3. Containers: trade-chart.tsx

Before (excerpt):

```tsx
<SmartChart
  ...
  requestAPI={wsSendRequest}
  requestForget={wsForget}
  requestForgetStream={wsForgetStream}
  requestSubscribe={wsSubscribe}
  initialData={{
    activeSymbols: JSON.parse(JSON.stringify(active_symbols)),
  }}
  chartData={{
    activeSymbols: JSON.parse(JSON.stringify(active_symbols)),
  }}
  shouldFetchTradingTimes={false}
  ...
/>
```

After (champion):

```tsx
import { useTraderStore } from 'Stores/useTraderStores';

...

const {
  // New champion providers
  getQuotes,
  subscribeQuotes,
  unsubscribeQuotes,
  // Existing store items...
  active_symbols,
  ...
} = useTraderStore();

const chartData = {
  activeSymbols: JSON.parse(JSON.stringify(active_symbols)),
  // Optional but recommended if you have it:
  // tradingTimes: trading_times_map,  // Record<string, { isOpen, openTime, closeTime }>
};

<SmartChart
  ...
  // Champion data providers
  getQuotes={getQuotes}
  subscribeQuotes={subscribeQuotes}
  unsubscribeQuotes={unsubscribeQuotes} // optional but recommended to keep a uniform API

  chartData={chartData}
  // With chartData provided, keep shouldFetchTradingTimes={false}
  shouldFetchTradingTimes={false}

  // Remove derivatives-only props
  // - requestAPI, requestSubscribe, requestForget, requestForgetStream
  ...
/>
```

Notes:

- Keep other props: symbol, granularity, chartType, settings, widgets, isMobile, isConnectionOpened, etc.
- For replay/static charts (with start/end epoch), champion uses getQuotes to load history and typically does not subscribe unless live.

---

4. Containers: replay-chart.tsx

Before:

```tsx
<SmartChart
  ...
  requestAPI={wsSendRequest}
  requestForget={wsForget}
  requestForgetStream={wsForgetStream}
  requestSubscribe={wsSubscribe}
  ...
/>
```

After:

```tsx
<SmartChart
  ...
  getQuotes={getQuotes}
  subscribeQuotes={subscribeQuotes}
  unsubscribeQuotes={unsubscribeQuotes}
  ...
/>
```

---

5. Store: Implement Champion Data Providers

Add the following to Stores/Modules/Trading/trade-store.ts.

5.1 Types used by champion

```ts
// Minimal local type aliases for champion contract
type TGranularity = number; // 0 for ticks, >0 for candles in seconds

type TQuote = {
    Date: string; // epoch or ISO string (SmartChart will parse as UTC)
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

type TGetQuotesParams = {
    symbol: string;
    granularity: TGranularity; // 0 ticks; >0 candles
    count: number;
    start?: number;
    end?: number;
    style?: 'ticks' | 'candles';
};

type TGetQuotesResult =
    | { candles: Array<{ open: number; high: number; low: number; close: number; epoch: number }> }
    | { history: { prices: number[]; times: number[] } };
```

5.2 getQuotes implementation

```ts
getQuotes = async ({ symbol, granularity, count, start, end }: TGetQuotesParams): Promise<TGetQuotesResult> => {
    // Build a Deriv ticks_history-like request
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

    if (start) {
        req.start = String(start);
    } else if (count) {
        req.count = Number(count);
    }

    // One-shot history
    const resp = await WS.getTicksHistory(req); // same service used by wsSubscribe when market is closed

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

    // Ticks history form
    const prices: number[] = (resp?.history?.prices || []).map(Number);
    const times: number[] = (resp?.history?.times || []).map(Number);
    return { history: { prices, times } };
};
```

5.3 subscribeQuotes implementation (returns unsubscribe)

```ts
subscribeQuotes = (
    { symbol, granularity }: { symbol: string; granularity: TGranularity },
    callback: (quote: TQuote) => void
): (() => void) => {
    // Streaming request (Deriv)
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

    // Wrap underlying WS.subscribeTicksHistory and normalize payload
    const subscriber = WS.subscribeTicksHistory(req, (msg: any) => {
        // Candles stream (ohlc)
        if (msg?.ohlc) {
            const { open, high, low, close, open_time } = msg.ohlc;
            const q: TQuote = {
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
                    pip_size: msg.ohlc.pip_size,
                },
            };
            callback(q);
            return;
        }

        // Ticks stream
        if (msg?.tick) {
            const { epoch, quote } = msg.tick;
            const q: TQuote = {
                Date: String(epoch),
                Close: Number(quote),
                tick: { epoch: Number(epoch), quote: Number(quote), symbol },
            };
            callback(q);
        }
    });

    // Return unsubscribe function
    return () => {
        try {
            subscriber?.unsubscribe?.();
        } catch (e) {
            // Fallback if subscription object differs:
            // WS.forget('ticks_history', ...) or track internally if needed
        }
    };
};
```

5.4 Optional manual unsubscribeQuotes

```ts
unsubscribeQuotes = (_request?: unknown) => {
    // Typically not needed because champion uses closure-based unsubscribe.
    // Kept here if you want app-level control or future expansion.
};
```

5.5 Preserve existing helpers (optional)

- You can keep wsSendRequest/wsSubscribe/wsForget/wsForgetStream as internal utilities for other modules if needed.
- Champion-facing SmartChart will consume only getQuotes/subscribeQuotes/unsubscribeQuotes.

---

6. chartData: Add tradingTimes Map (Optional but Recommended)

If you wish SmartChart to highlight open/close state:

- Build a simplified map: Record<string, { isOpen: boolean; openTime: string; closeTime: string }>
- If you already have trading_times in store, convert it for champion:

```ts
const trading_times_map: Record<string, { isOpen: boolean; openTime: string; closeTime: string }> = {};
// Populate by symbol; example stub below:
active_symbols.forEach((s: any) => {
  trading_times_map[s.symbol] = {
    isOpen: s.exchange_is_open === 1,
    openTime: '',
    closeTime: '',
  };
});

// In container:
<SmartChart chartData={{ activeSymbols, tradingTimes: trading_times_map }} />
```

- If you don’t have detailed open/close times, you can set isOpen from exchange_is_open and leave times blank.

---

7. Replay Chart Considerations

- For replay/static displays:
    - Pass startEpoch/endEpoch/isStaticChart/scrollToEpoch as you already do
    - Champion will call getQuotes with start/end to fetch history without subscribing
    - If you want live replay (when contract open), allow subscribeQuotes for current symbol/timeframe

---

8. Unsubscribe Behavior Changes

- Remove requestForget/requestForgetStream from SmartChart usage
- Use the function returned by subscribeQuotes to stop streaming when:
    - symbol or granularity changes
    - component unmounts
- unsubscribeQuotes(request?) can remain as a store-level utility if needed, but champion relies on closure-based unsubscribe

---

9. Markers/Contracts and Widgets

- contracts_array, barriers, contractInfo and FastMarker usage remain compatible
- Keep topWidgets/bottomWidgets/toolbarWidget logic unchanged
- No special change required for ChartMarker components (they interop via FastMarker/RawMarker)

---

10. End-to-End Example: trade-chart.tsx (Consolidated)

```tsx
// trade-chart.tsx (key parts)
const {
  getQuotes,
  subscribeQuotes,
  unsubscribeQuotes,
  active_symbols,
  ...
} = useTraderStore();

const chartData = {
  activeSymbols: JSON.parse(JSON.stringify(active_symbols)),
  // tradingTimes: trading_times_map, // optional
};

return (
  <SmartChart
    id="trade"
    symbol={symbol}
    isMobile={isMobile}
    chartType={chart_type}
    granularity={show_digits_stats || is_accumulator ? 0 : granularity}
    settings={settings}
    isConnectionOpened={is_socket_opened}
    // champion providers:
    getQuotes={getQuotes}
    subscribeQuotes={subscribeQuotes}
    unsubscribeQuotes={unsubscribeQuotes}
    chartData={chartData}
    shouldFetchTradingTimes={false}
    allowTickChartTypeOnly={show_digits_stats || is_accumulator}
    topWidgets={is_trade_enabled ? topWidgets : null}
    bottomWidgets={(is_accumulator || show_digits_stats) && !isMobile ? bottomWidgets : props.bottomWidgets}
    toolbarWidget={() => <ToolbarWidgets updateChartType={updateChartType} updateGranularity={updateGranularity} />}
    contracts_array={markers_array}
    barriers={barriers}
    ...
  />
);
```

---

11. Testing Checklist

- Build succeeds after switching package and imports
- SmartChart loads and CSS chunks served under /js/smartcharts/ (or your configured path)
- Initial history:
    - Ticks (granularity=0) returns history.prices/times arrays
    - Candles (granularity>0) returns candles array with epoch/open/high/low/close
- Live streaming:
    - subscribeQuotes callback receives TQuote for ticks and ohlc for candles
    - Unsubscribe function stops updates on symbol/granularity change and on unmount
- Replay:
    - start/end epoch view loads historical series without live stream (unless intended)
    - scrollToEpoch and isStaticChart behave as before
- Markers:
    - contracts_array and barriers render correctly
- UI:
    - toolbar, views, indicators widgets still work
    - chartStatusListener/stateChangeListener wired to store remain functional

---

12. Optional Enhancements

- Add tradingTimes map for better open/close UX
- Normalize Date handling:
    - For TQuote.Date, use epoch string (e.g., String(epoch)) to avoid TZ drift
- Centralize quote mapping logic for consistency between getQuotes and subscribeQuotes

---

Appendix: Quick Reference (Champion Types)

- TGetQuotes:

```ts
(params: { symbol: string; granularity: number; count: number; start?: number; end?: number }) =>
    Promise<TGetQuotesResult>;
```

- TGetQuotesResult:

```ts
{ history: { prices: number[]; times: number[] } } // for ticks
{ candles: Array<{ open: number; high: number; low: number; close: number; epoch: number }> } // for candles
```

- TSubscribeQuotes:

```ts
(params: { symbol: string; granularity: number }, callback: (quote: TQuote) => void) => () => void
```

- TQuote (callback param):

```ts
{
  Date: string; Close: number;
  Open?: number; High?: number; Low?: number; Volume?: number;
  tick?: { epoch: number; quote: number; symbol: string; id?: string };
  ohlc?: { open: string; high: string; low: string; close: string; epoch: number; symbol?: string; pip_size?: number };
}
```

With these changes, your integration will comply with smartchart-champion’s provider-driven model while preserving existing UI/UX and store behaviors.

<!-- [/AI] -->
