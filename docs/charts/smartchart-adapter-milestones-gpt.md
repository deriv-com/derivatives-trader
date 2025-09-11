<!-- [AI] -->

# SmartChart Adapter Migration: Milestone Tracker

Purpose

- Track the migration to smartchart-champion using an adapter while preserving existing client app contracts.
- This tracker operationalizes the adapter spec in docs/charts/smartchart-adapter-spec.md and ensures request/response transformation is implemented and verified.

Scope

- Adapter that maps current Deriv WS requests/responses to smartchart-champion provider model.
- Wiring into Trade Chart (V1 & V2) and Replay Chart.
- Feature parity validation (widgets, digits/tick, markers/barriers).
- Documentation, rollout, and post-deploy checks.

Owners (placeholders)

- Tech Lead: TBD
- Frontend (Trader): TBD
- QA: TBD
- Release: TBD

---

Milestone M1: Preparation & Plan (1–2 days)

- Goal: Align on target bundle, paths, adapter pattern, and rollout plan.

Deliverables

- Confirm bundle change target: @deriv-com/smartcharts-champion (no code change yet).
- Confirm public path for assets (keep /js/smartcharts/ unless ops requires change).
- Rollout plan with flags (opt-in or branch-based).

Tasks

- [ ] Review adapter spec (docs/charts/smartchart-adapter-spec.md)
- [ ] Confirm bundle path and chunk hosting
- [ ] Decide gating flag/branch strategy
- [ ] Prepare test matrix (symbols, markets, timeframes, devices)

Acceptance Criteria

- [ ] Agreed bundle target & asset path
- [ ] Test matrix drafted
- [ ] Rollout plan approved

Risks/Mitigations

- Path mismatch → Validate in sandbox env early.

---

Milestone M2: Adapter Implementation (3–4 days)

- Goal: Implement makeChampionAdapter and strict request/response transformations.

Deliverables

- Adapter module: packages/trader/src/Modules/SmartChart/adapter/champion-adapter.ts
- Exposed functions:
    - getQuotes(params): Promise&lt;TGetQuotesResult&gt;
    - subscribeQuotes(params, cb): () =&gt; void
    - buildChartData(): { activeSymbols, tradingTimes? }
- Strict normalization:
    - Candles → { candles: [{ open, high, low, close, epoch }] }
    - Ticks → { history: { prices:number[], times:number[] } }
    - Streams:
        - ohlc → TQuote with ohlc object
        - tick → TQuote with tick object
    - Numeric coercion and Date as epoch string

Tasks

- [ ] Create adapter module and interfaces
- [ ] Implement getQuotes() mapping Deriv WS → champion
- [ ] Implement subscribeQuotes() with closure-based unsubscribe
- [ ] Implement buildChartData() from active_symbols (derive isOpen)
- [ ] Unit tests for mapping (ticks, candles, streams) with fixtures

Acceptance Criteria

- [ ] All unit tests pass
- [ ] API signatures match docs/charts/SmartChart.md
- [ ] Numeric types normalized; TQuote.Date uses epoch string

Dependencies

- M1 approved plan

Risks/Mitigations

- Hidden variance in WS messages → Add test fixtures for multiple markets/timeframes.

---

Milestone M3: AppV2 TradeChart Wiring (2–3 days)

- File: packages/trader/src/AppV2/Containers/Chart/trade-chart.tsx

Goal

- Replace derivatives-charts props with adapter providers while keeping UI intact.

Changes

- Remove:
    - requestAPI, requestSubscribe, requestForget, requestForgetStream
- Add:
    - getQuotes={adapter.getQuotes}
    - subscribeQuotes={adapter.subscribeQuotes}
    - (optional) unsubscribeQuotes
- Chart data:
    - Replace initialData/chartData object creation with adapter.buildChartData() or keep current activeSymbols (OK)
- Keep:
    - symbol, chartType, granularity
    - settings, isMobile, id
    - allowTickChartTypeOnly, stateChangeListener, chartStatusListener, isConnectionOpened, isLive
    - isVerticalScrollEnabled, enabledNavigationWidget, enabledChartFooter
    - crosshair, crosshairTooltipLeftAllow (verify visually), showLastDigitStats (verify)
    - maxTick, yAxisMargin, leftMargin, should_zoom_out_on_yaxis (verify)
    - clearChart, importedLayout, onExportLayout, hasAlternativeSource, getMarketsOrder
    - topWidgets, bottomWidgets, toolbarWidget, barriers, contracts_array, children

Tasks

- [ ] Instantiate adapter with getActiveSymbols from store
- [ ] Swap props as above and build chartData
- [ ] Verify BottomWidgetsMobile receives { digits, tick }
- [ ] Smoke test V2 flows (all trade types, especially digits/accumulator)

Acceptance Criteria

- [ ] Chart renders with history and live updates
- [ ] Digits/tick continue to populate BottomWidgetsMobile
- [ ] No regressions in layout/widgets

Dependencies

- M2 adapter ready

Risks/Mitigations

- Behavior flags like showLastDigitStats may differ → treat as UI concern; not adapter-level.

---

Milestone M4: Replay Chart Wiring (1–2 days)

- File: packages/trader/src/Modules/Contract/Containers/replay-chart.tsx

Goal

- Use adapter providers for historical view (and live if needed).

Changes

- Remove requestAPI/requestSubscribe/requestForget/requestForgetStream
- Add getQuotes/subscribeQuotes; prefer getQuotes for start/end ranges
- Keep startEpoch/endEpoch/scrollToEpoch/isStaticChart

Tasks

- [ ] Swap providers
- [ ] Validate static/historical view loads (no live stream unless required)
- [ ] Validate scrollToEpoch and markers

Acceptance Criteria

- [ ] Historical ranges render correctly
- [ ] Markers/overlays still correct

Dependencies

- M2 adapter ready

---

Milestone M5: Request/Response Transformation Validation (2–3 days)

- Goal: Prove end-to-end mapping correctness across diverse cases.

Tasks

- [ ] Build fixtures:
    - Ticks history (with strings & numbers)
    - Candles history (with epoch/open_time variance)
    - Streaming (tick & ohlc)
- [ ] Instrument logs for mapping (debug flag)
- [ ] Validate:
    - TGetQuotesResult integrity
    - TQuote emission correctness
    - Unsubscribe closure invoked on symbol/granularity change and unmount

Acceptance Criteria

- [ ] All fixtures pass mapping validation
- [ ] No type drift (always numbers for numeric fields)
- [ ] Unsubscribe path verified (no memory leak)

Dependencies

- M2, M3, M4

---

Milestone M6: Feature Parity & UX Verification (2–3 days)

- Goal: Confirm non-network props behave as before.

Checklist

- [ ] crosshairTooltipLeftAllow: tooltip aligns visually on mobile/desktop
- [ ] showLastDigitStats: digits stats appear as expected
- [ ] should_zoom_out_on_yaxis: no-op acceptable if unsupported; no breakage observed
- [ ] barriers/contracts_array/children markers: all render
- [ ] toolbar/top/bottom widgets: unchanged behavior

Acceptance Criteria

- [ ] No UX regressions identified by QA for listed items

Dependencies

- M3, M4

---

Milestone M7: Performance & Stability (1–2 days)

- Goal: Confirm performance and stability under normal/peak loads.

Tasks

- [ ] Compare render times and memory footprint pre/post migration
- [ ] Verify no subscription leaks on rapid symbol/timeframe switching
- [ ] Validate mobile behavior (scroll/crosshair) remains performant

Acceptance Criteria

- [ ] No leaks; performance matches or improves baseline

Dependencies

- M3–M6

---

Milestone M8: Documentation & Rollout (1 day)

- Goal: Finalize docs and rollout.

Tasks

- [ ] Update README/tech notes with adapter usage
- [ ] Confirm docs/charts/smartchart-adapter-spec.md coverage
- [ ] Choose gating (feature flag or branch) for staged rollout
- [ ] Provide rollback plan

Acceptance Criteria

- [ ] Docs complete and reviewed
- [ ] Rollout plan approved

Dependencies

- Prior milestones complete

---

Milestone M9: Post-Deployment Monitoring (ongoing)

- Goal: Monitor and address any issues.

Tasks

- [ ] Track error logs & user feedback
- [ ] Verify no unexpected chart behavior across markets/timeframes
- [ ] Address edge cases surfaced in production

Acceptance Criteria

- [ ] Observability dashboards updated
- [ ] No critical incidents outstanding

---

Appendix A: Direct Task-to-File Map

- Adapter module
    - packages/trader/src/Modules/SmartChart/adapter/champion-adapter.ts
- AppV2
    - packages/trader/src/AppV2/Containers/Chart/trade-chart.tsx
- Replay
    - packages/trader/src/Modules/Contract/Containers/replay-chart.tsx
- Docs (kept current)
    - docs/charts/smartchart-adapter-spec.md
    - docs/charts/SmartChart.md
    - docs/charts/migration-derivatives-to-smartchart-champion.md (reference)

Appendix B: Explicit Request/Response Responsibilities

- Request→Response type transform is implemented exclusively in adapter:
    - getQuotes: Deriv ticks_history → champion TGetQuotesResult
    - subscribeQuotes: Deriv stream → champion TQuote
- Containers/stores do not transform types; they pass through adapter outputs.

Timeline (suggested)

- M1: D1–D2
- M2: D3–D6
- M3: D7–D9
- M4: D10–D11
- M5: D12–D14
- M6: D15–D17
- M7: D18–D19
- M8: D20
- M9: ongoing

RACI (example)

- Responsible: Frontend (Trader)
- Accountable: Tech Lead
- Consulted: QA, Platform (for assets path)
- Informed: Release, PM

<!-- [/AI] -->
