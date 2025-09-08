<!-- [AI] -->

# SmartChart Implementation Verification Report

Scope

- Goal: Verify current implementation matches docs/charts/derivative-chart.md (SmartChart: Workflow, Lifecycle, Required Props, Functions, and Data Contracts)
- Repo area reviewed:
    - packages/trader/src/Modules/SmartChart/index.js
    - packages/trader/src/Modules/Trading/Containers/trade-chart.tsx
    - packages/trader/src/Modules/Contract/Containers/replay-chart.tsx
    - packages/trader/src/Stores/Modules/Trading/trade-store.ts

Verdict

- Result: Implementation aligns with the documentation. No functional conflicts found.
- Notes: Minor environment-specific differences and optional areas are called out below; they are non-blocking.

---

1. Initialization and Public Path

Documentation expectation

- App must load SmartChart and set public path for assets via setSmartChartsPublicPath('...').

Implementation

- packages/trader/src/Modules/SmartChart/index.js
    - Loads @deriv-com/derivatives-charts through moduleLoader + React.lazy
    - Sets public path using setSmartChartsPublicPath(getUrlBase('/js/smartcharts/'))
- Difference vs docs: Docs example uses '/dist/'. This repo uses '/js/smartcharts/'. This is simply an environment path choice; not a conflict so long as CSS/chunks are hosted there.

---

2. Required Network Functions (Contracts)

Documentation expectation

- requestAPI: one-shot calls (active_symbols, trading_times, time, ticks_history without subscribe)
- requestSubscribe: start a stream, continuously callback
- requestForget: stop a stream by original request pair
- requestForgetStream?: stop by subscription id (optional)

Implementation mapping

- Provided from containers into SmartChart:
    - trade-chart.tsx / replay-chart.tsx pass:
        - requestAPI={wsSendRequest}
        - requestSubscribe={wsSubscribe}
        - requestForget={wsForget}
        - requestForgetStream={wsForgetStream}
- Implementations (trade-store.ts):
    - wsSendRequest(req):
        - 'time' → ServerTime.timePromise() fallback WS.time()
        - 'active_symbols' → WS.authorized.activeSymbols('brief') or WS.activeSymbols('brief')
        - 'trading_times' → WS.tradingTimes(req.trading_times)
        - default → WS.storage.send(req)
        - Matches one-shot behavior in docs.
    - wsSubscribe(req, callback):
        - If market closed, deletes subscribe and calls WS.getTicksHistory(req) once (one-shot as per docs)
        - If req.subscribe === 1: uses WS.subscribeTicksHistory(req, callback)
        - Stores subscriber keyed by JSON.stringify(req) (see g_subscribers_map)
        - Matches streaming expectation.
    - wsForget(req):
        - Unsubscribes via stored subscriber and deletes map entry
        - Doc shows signature (request, callback) but SmartChart won’t require the second parameter at runtime; JS ignores extra args. Behavior is consistent.
    - wsForgetStream(stream_id):
        - Forgets by id via WS.forgetStream
        - Matches optional id-based forgetting.

Conclusion

- Required function contracts and semantics are satisfied.

---

3. Request/Response Shapes and Streaming Model

Documentation expectation

- Deriv-like payloads for tick/candle history and streams:
    - Ticks one-shot: { ticks_history, style: 'ticks', count, end, adjust_start_time }
    - Candles one-shot: with style: 'candles' and granularity
    - Streaming: add subscribe: 1 and stream messages include subscription.id

Implementation observations

- wsSubscribe passthrough callback handles:
    - 'tick' stream (TickSpotData)
    - 'history' (prices[]/times[]) and 'ohlc' (candles) responses
    - For granularity > 0, extracts close/pip_size to update UI tick data
    - For Accumulator type, enriches a store (updateAccumulatorBarriersData) with latest spot/epoch
- The shapes are consistent with expectations in the docs. Subscription handling is compatible with either request-pair or subscription-id forget.

---

4. Lifecycle, Mount/Unmount, and Prop Changes

Documentation expectation

- Mount: context init, adapter mount, props -> store
- Updates: props changes reload history and streams
- Unmount: forget streams and cleanup
- Mobile: crosshair behavior, widgets/dialogs
- Preload: initialData/chartData can reduce network calls

Implementation mapping

- Trade chart (packages/trader/src/Modules/Trading/Containers/trade-chart.tsx):
    - Passes SmartChart props that drive lifecycle:
        - symbol, chartType, granularity
        - network functions (wsSendRequest/wsSubscribe/wsForget/wsForgetStream)
        - initialData/chartData activeSymbols preloaded
        - isConnectionOpened for reconnection handling
        - chartStatusListener and stateChangeListener wired to store (chartStateChange/setChartStatus)
        - shouldFetchTradingTimes={false} (since activeSymbols and trading times are pre-provided; matches doc’s preload pattern)
    - Prop changes (symbol/granularity) are controlled by store and result in re-subscription — consistent with docs.
- Replay chart (packages/trader/src/Modules/Contract/Containers/replay-chart.tsx):
    - Similar networking and settings
    - startEpoch/endEpoch/scrollToEpoch/isStaticChart used for replay/static conditions as in docs.

Cleanup/unmount

- trade-store.onUnmount cleans related state and triggers underlying module unmounts; chart forget logic is covered by SmartChart’s usage of provided forget functions.

Conclusion

- Lifecycle and prop-driven behavior match the documented model.

---

5. Props Catalog Usage (Key Props in Use)

- Networking: requestAPI, requestSubscribe, requestForget, requestForgetStream (optional)
- Identification/data: id, symbol, granularity, chartType
- Preload/data injection:
    - initialData/chartData: activeSymbols is provided (reduces runtime calls)
    - shouldFetchTradingTimes={false} used; trading times appear to be handled via store or not required for current views
- Behavior/flags:
    - isMobile, enabledChartFooter, enabledNavigationWidget
    - isConnectionOpened: passed from store to manage reconnection
    - allowTickChartTypeOnly toggled for certain digit/accu modes in trade-chart
    - yAxisMargin/leftMargin/anchorChartToLeft/mobile crosshair used per UX
    - topWidgets/bottomWidgets/toolbarWidget used extensively
- Contracts/overlays:
    - barriers, contracts_array (markers_array), contractInfo (replay), allTicks (replay)
- Callbacks:
    - chartStatusListener, stateChangeListener wired to store chartStateChange and setChartStatus

This usage aligns with the doc’s TChartProps summary.

---

6. Pagination (jsInterop.loadHistory)

Documentation expectation

- Older history can be requested via window.jsInterop.loadHistory(params)
- Optional integration; host may call requestAPI with end epoch to load more

Implementation reality

- No explicit usage of jsInterop.loadHistory found in this repo (search showed none).
- This is optional and does not indicate a mismatch; pagination can be internal to the chart lib or not required by current product flows.

---

7. Differences and Non-Conflicts

- Public path: '/js/smartcharts/' vs docs example '/dist/' — acceptable environmental difference
- requestForget signature: docs include (request, callback); implementation uses (request). In JS, the callback param is not required; unsubscribe is executed by key. No functional conflict.
- shouldFetchTradingTimes: set to false where chartData/initialData is provided. This is aligned with docs recommendation to preload when available.
- Accumulator customizations: Additional in-store augmentations for tick handling are product-level logic and do not conflict with SmartChart contracts.

---

8. Recommendations (Optional Improvements)

- Consider using requestForgetStream more broadly if subscription ids are easily accessible from subscribe responses, especially if you diversify streaming beyond ticks_history. Current request-keyed approach is solid; id-based can be more precise in mixed-stream scenarios.
- Ensure CSS and chunks remain available at '/js/smartcharts/'. If operations/MFE path changes in deployment, update setSmartChartsPublicPath accordingly.

---

Appendix: Code Pointers

- SmartChart wrapper:
    - packages/trader/src/Modules/SmartChart/index.js
        - Module load and setSmartChartsPublicPath

- Trade Chart:
    - packages/trader/src/Modules/Trading/Containers/trade-chart.tsx
        - Passes requestAPI/requestSubscribe/requestForget/requestForgetStream
        - Preloads activeSymbols via initialData/chartData

- Replay Chart:
    - packages/trader/src/Modules/Contract/Containers/replay-chart.tsx
        - Uses startEpoch/endEpoch/scrollToEpoch and same network props

- Network functions:
    - packages/trader/src/Stores/Modules/Trading/trade-store.ts
        - wsSendRequest: one-shot requests
        - wsSubscribe: stream/one-shot fallback; maintains subscriber map
        - wsForget / wsForgetStream: unsubscribe mechanisms

Conclusion: Current implementation complies with the SmartChart integration contract as documented in docs/charts/derivative-chart.md.

<!-- [/AI] -->
