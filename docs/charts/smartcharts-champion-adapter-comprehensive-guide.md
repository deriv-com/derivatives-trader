# SmartCharts Champion Adapter - Comprehensive Implementation Guide

## Table of Contents

1. [Overview](#overview)
2. [Architecture & Design Patterns](#architecture--design-patterns)
3. [Core Components](#core-components)
4. [Type Definitions](#type-definitions)
5. [Implementation Details](#implementation-details)
6. [Creating Similar Adapters](#creating-similar-adapters)
7. [Testing Strategies](#testing-strategies)
8. [Best Practices](#best-practices)
9. [Troubleshooting](#troubleshooting)

## Overview

The SmartCharts Champion Adapter is a sophisticated adapter pattern implementation that bridges the gap between existing Deriv API infrastructure and the new `@deriv-com/smartcharts-champion` library. It provides a clean abstraction layer that transforms legacy data formats and API calls into the modern interface expected by SmartCharts Champion.

### Key Benefits

- **Zero Breaking Changes**: Existing codebase remains untouched
- **Clean Separation**: Adapter isolates transformation logic
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Extensible**: Easy to extend for new chart libraries or data sources
- **Testable**: Modular design enables comprehensive testing

### Architecture Philosophy

The adapter follows the **Adapter Pattern** combined with **Dependency Injection** principles:

- **Transport Layer**: Abstracts WebSocket communication
- **Services Layer**: Abstracts data fetching and processing
- **Transformation Layer**: Converts between data formats
- **Subscription Management**: Handles real-time data streams

## Architecture & Design Patterns

### 1. Layered Architecture

```
┌─────────────────────────────────────────┐
│           SmartCharts Champion          │
│         (External Library)              │
└─────────────────┬───────────────────────┘
                  │ TChartProps Interface
┌─────────────────▼───────────────────────┐
│         Adapter Interface               │
│  (SmartchartsChampionAdapter)           │
└─────────────────┬───────────────────────┘
                  │
    ┌─────────────┼─────────────┐
    │             │             │
┌───▼────┐ ┌─────▼──────┐ ┌────▼─────┐
│Transport│ │Transformers│ │ Services │
│ Layer   │ │   Layer    │ │  Layer   │
└───┬────┘ └─────┬──────┘ └────┬─────┘
    │             │             │
┌───▼─────────────▼─────────────▼─────┐
│        Existing Infrastructure      │
│   (chart_api, ApiHelpers, etc.)     │
└─────────────────────────────────────┘
```

### 2. Dependency Injection Pattern

The adapter uses constructor injection to receive its dependencies:

```typescript
export function buildSmartChartsChampionAdapter(
    transport: TTransport,
    services: TServices,
    config: AdapterConfig = {}
): SmartchartsChampionAdapter;
```

This enables:

- **Testability**: Easy to mock dependencies
- **Flexibility**: Different implementations for different environments
- **Separation of Concerns**: Each layer has a single responsibility

### 3. Observer Pattern for Subscriptions

Real-time data streaming uses the Observer pattern:

```typescript
subscribeQuotes(request: TGetQuotesRequest, callback: TSubscriptionCallback): TUnsubscribeFunction
```

## Core Components

### 1. Main Adapter (`index.ts`)

The main adapter file contains:

#### Core Functions

- **`getQuotes`**: Fetches historical data
- **`subscribeQuotes`**: Establishes real-time data streams
- **`unsubscribeQuotes`**: Terminates data streams
- **`getChartData`**: Retrieves reference data (symbols, trading times)

#### Transformation Utilities

- **`toTGetQuotesResult`**: Converts API responses to chart format
- **`toTQuoteFromStream`**: Transforms streaming data
- **`toActiveSymbols`**: Processes symbol metadata
- **`toTradingTimesMap`**: Formats trading hours data

#### Key Implementation Details

```typescript
const transformations = {
    /**
     * Transform Deriv API ticks_history response to TGetQuotesResult
     */
    toTGetQuotesResult(response: any, granularity: TGranularity): TGetQuotesResult {
        const quotes: TQuote[] = [];

        if (!response) {
            return { quotes, meta: { symbol: '', granularity } };
        }

        const { history, candles, prices, times } = response;
        const symbol = response.echo_req?.ticks_history || '';

        // Handle ticks (granularity = 0)
        if (granularity === 0 && history) {
            const { prices: tick_prices, times: tick_times } = history;
            if (tick_prices && tick_times) {
                for (let i = 0; i < tick_prices.length; i++) {
                    quotes.push({
                        Date: String(tick_times[i]),
                        Close: tick_prices[i],
                        DT: new Date(tick_times[i] * 1000),
                    });
                }
            }
        }
        // Handle candles (granularity > 0)
        else if (granularity > 0 && candles) {
            candles.forEach((candle: any) => {
                quotes.push({
                    Date: String(candle.epoch),
                    Open: candle.open,
                    High: candle.high,
                    Low: candle.low,
                    Close: candle.close,
                    DT: new Date(candle.epoch * 1000),
                });
            });
        }

        return {
            quotes,
            meta: {
                symbol,
                granularity,
                delay_amount: response.pip_size || 0,
            },
        };
    },
};
```

### 2. Transport Layer (`transport.ts`)

The transport layer wraps the existing `chart_api` to provide a clean interface:

#### Key Features

- **Subscription Management**: Tracks active subscriptions
- **Message Filtering**: Routes messages to correct callbacks
- **Error Handling**: Graceful degradation on failures
- **Cleanup**: Proper resource management

#### Implementation Highlights

```typescript
export function createTransport(): TTransport {
    const subscriptions = new Map<string, any>();

    return {
        /**
         * Subscribe to streaming data
         */
        subscribe(request: any, callback: (response: any) => void): string {
            const tempId = `temp-${Date.now()}-${Math.random()}`;

            // Set up message listener before sending request
            const messageSubscription = chart_api.api.onMessage()?.subscribe(({ data }: { data: any }) => {
                const subscriptionId = data?.subscription?.id;
                const storedSub = subscriptions.get(tempId);

                if (storedSub && subscriptionId === storedSub.realSubscriptionId) {
                    callback(data);
                }
            });

            // Store subscription info
            subscriptions.set(tempId, {
                request: { ...request, subscribe: 1 },
                callback,
                messageSubscription,
                realSubscriptionId: null,
            });

            return tempId;
        },
    };
}
```

### 3. Services Layer (`services.ts`)

The services layer abstracts data fetching operations:

#### Key Responsibilities

- **Active Symbols**: Retrieves and formats symbol metadata
- **Trading Times**: Fetches market hours information
- **Data Transformation**: Converts internal formats to adapter formats

#### Implementation Details

```typescript
export function createServices(): TServices {
    return {
        async getActiveSymbols(): Promise<any> {
            try {
                const apiHelpers = ApiHelpers.instance as any;

                if (!isApiHelpersInitialized(apiHelpers)) {
                    throw new Error('ApiHelpers not initialized');
                }

                const activeSymbols = await apiHelpers.active_symbols.retrieveActiveSymbols();
                return Array.isArray(activeSymbols) ? activeSymbols : [];
            } catch (error) {
                console.error('Error getting active symbols:', error);
                return [];
            }
        },

        async getTradingTimes(): Promise<any> {
            try {
                const apiHelpers = ApiHelpers.instance as any;
                await apiHelpers.trading_times.initialise();

                const tradingTimesData = apiHelpers.trading_times.trading_times;
                return transformTradingTimesData(tradingTimesData);
            } catch (error) {
                console.error('Error getting trading times:', error);
                return {};
            }
        },
    };
}
```

## Type Definitions

### Core Types (`types.ts`)

The adapter uses a comprehensive type system:

```typescript
// Granularity definition - 0 for ticks, >0 for candle intervals
export type TGranularity = 0 | 60 | 120 | 180 | 300 | 600 | 900 | 1800 | 3600 | 7200 | 14400 | 28800 | 86400;

// Quote data structure
export interface TQuote {
    Date: string; // epoch or ISO as string
    Close: number;
    Open?: number;
    High?: number;
    Low?: number;
    Volume?: number;
    tick?: any; // for tick streams
    ohlc?: any; // for candle streams
    DT?: Date;
    prevClose?: number;
}

// Request parameters for historical data
export interface TGetQuotesRequest {
    symbol: string;
    granularity: TGranularity;
    start?: number; // epoch timestamp
    end?: number | 'latest';
    count?: number;
}

// Response from historical data fetch
export interface TGetQuotesResult {
    quotes: TQuote[];
    meta?: {
        symbol: string;
        granularity: TGranularity;
        delay_amount?: number;
    };
}

// Trading times structure
export interface TradingTimesMap {
    [symbol: string]: {
        isOpen: boolean;
        openTime: string;
        closeTime: string;
    };
}

// Main adapter interface
export interface SmartchartsChampionAdapter extends SmartchartsChampionFunctions {
    transport: TTransport;
    services: TServices;
}
```

### Transport Interface

```typescript
export interface TTransport {
    send: (request: any) => Promise<any>;
    subscribe: (request: any, callback: (response: any) => void) => string;
    unsubscribe: (subscription_id: string) => void;
    unsubscribeAll: (msg_type?: string) => void;
}
```

### Services Interface

```typescript
export interface TServices {
    getActiveSymbols: () => Promise<any>;
    getTradingTimes: () => Promise<any>;
}
```

## Implementation Details

### 1. Historical Data Fetching

The `getQuotes` function handles both tick and candle data:

```typescript
async getQuotes(request: TGetQuotesRequest): Promise<TGetQuotesResult> {
    try {
        // Build ticks_history request
        const apiRequest: any = {
            ticks_history: request.symbol,
            end: request.end || 'latest',
            count: request.count || 1000,
            adjust_start_time: 1,
        };

        // Set style and granularity
        if (request.granularity === 0) {
            apiRequest.style = 'ticks';
        } else {
            apiRequest.style = 'candles';
            apiRequest.granularity = request.granularity;
        }

        // Add start time if provided
        if (request.start) {
            apiRequest.start = request.start;
            delete apiRequest.count;
        }

        const response = await transport.send(apiRequest);
        return transformations.toTGetQuotesResult(response, request.granularity);
    } catch (error) {
        console.log('Error in getQuotes:', error);
        return {
            quotes: [],
            meta: {
                symbol: request.symbol,
                granularity: request.granularity,
            },
        };
    }
}
```

### 2. Real-time Data Streaming

The `subscribeQuotes` function manages live data subscriptions:

```typescript
subscribeQuotes(request: TGetQuotesRequest, callback: TSubscriptionCallback): TUnsubscribeFunction {
    const subscriptionKey = `${request.symbol}-${request.granularity}`;

    // Build subscription request
    const apiRequest: any = {
        ticks_history: request.symbol,
        subscribe: 1,
        end: 'latest',
        count: 1,
    };

    if (request.granularity === 0) {
        apiRequest.style = 'ticks';
    } else {
        apiRequest.style = 'candles';
        apiRequest.granularity = request.granularity;
    }

    try {
        const subscriptionId = transport.subscribe(apiRequest, (response: any) => {
            try {
                const quote = response; // Already transformed by transport
                callback(quote);
            } catch (error) {
                console.error('Error transforming stream message:', error);
            }
        });

        // Create unsubscribe function
        const unsubscribe = () => {
            transport.unsubscribe(subscriptionId);
            subscriptions.delete(subscriptionKey);
        };

        subscriptions.set(subscriptionKey, unsubscribe);
        return unsubscribe;
    } catch (error) {
        console.error('Error in subscribeQuotes:', error);
        return () => {}; // Return no-op function on error
    }
}
```

### 3. Reference Data Management

The `getChartData` function provides symbol and trading time information:

```typescript
async getChartData(): Promise<{ activeSymbols: ActiveSymbols; tradingTimes: TradingTimesMap }> {
    try {
        // Get active symbols and trading times in parallel
        const [activeSymbolsData, tradingTimesData] = await Promise.all([
            services.getActiveSymbols(),
            services.getTradingTimes(),
        ]);

        const activeSymbols = transformations.toActiveSymbols(activeSymbolsData);
        const tradingTimes = transformations.toTradingTimesMap(tradingTimesData);

        return { activeSymbols, tradingTimes };
    } catch (error) {
        console.error('Error in getChartData:', error);
        return {
            activeSymbols: {},
            tradingTimes: {},
        };
    }
}
```

## Creating Similar Adapters

### Step-by-Step Guide

#### 1. Define Your Target Interface

First, understand what your target chart library expects:

```typescript
// Example: Different chart library interface
interface MyChartLibraryInterface {
    loadHistoricalData: (params: MyHistoryParams) => Promise<MyHistoryResult>;
    startLiveStream: (params: MyStreamParams, callback: MyStreamCallback) => MyUnsubscriber;
    getMarketData: () => Promise<MyMarketData>;
}
```

#### 2. Create Type Definitions

Define types that bridge your data sources and target interface:

```typescript
// my-chart-adapter/types.ts
export interface MyHistoryParams {
    instrument: string;
    timeframe: string;
    from?: Date;
    to?: Date;
    limit?: number;
}

export interface MyHistoryResult {
    data: MyDataPoint[];
    metadata: MyMetadata;
}

export interface MyDataPoint {
    timestamp: number;
    price: number;
    volume?: number;
}

// Transport interface for your data source
export interface MyTransport {
    fetchHistory: (request: any) => Promise<any>;
    subscribe: (request: any, callback: (data: any) => void) => string;
    unsubscribe: (subscriptionId: string) => void;
}

// Services interface for your data source
export interface MyServices {
    getInstruments: () => Promise<MyInstrument[]>;
    getMarketHours: () => Promise<MyMarketHours>;
}

// Main adapter interface
export interface MyChartAdapter {
    loadHistoricalData: (params: MyHistoryParams) => Promise<MyHistoryResult>;
    startLiveStream: (params: MyStreamParams, callback: MyStreamCallback) => MyUnsubscriber;
    getMarketData: () => Promise<MyMarketData>;
}
```

#### 3. Implement Transport Layer

Create a transport wrapper for your data source:

```typescript
// my-chart-adapter/transport.ts
import { MyDataSource } from '../external/my-data-source';
import type { MyTransport } from './types';

export function createMyTransport(): MyTransport {
    const subscriptions = new Map<string, any>();

    return {
        async fetchHistory(request: any): Promise<any> {
            try {
                return await MyDataSource.getHistoricalData(request);
            } catch (error) {
                console.error('Transport: Error fetching history:', error);
                throw error;
            }
        },

        subscribe(request: any, callback: (data: any) => void): string {
            const subscriptionId = `sub-${Date.now()}-${Math.random()}`;

            const subscription = MyDataSource.subscribe(request, (data: any) => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Transport: Error in subscription callback:', error);
                }
            });

            subscriptions.set(subscriptionId, subscription);
            return subscriptionId;
        },

        unsubscribe(subscriptionId: string): void {
            const subscription = subscriptions.get(subscriptionId);
            if (subscription) {
                subscription.unsubscribe();
                subscriptions.delete(subscriptionId);
            }
        },
    };
}
```

#### 4. Implement Services Layer

Create services for reference data:

```typescript
// my-chart-adapter/services.ts
import { MyDataHelpers } from '../external/my-data-helpers';
import type { MyServices } from './types';

export function createMyServices(): MyServices {
    return {
        async getInstruments(): Promise<MyInstrument[]> {
            try {
                const instruments = await MyDataHelpers.getAvailableInstruments();
                return instruments.map(transformInstrument);
            } catch (error) {
                console.error('Services: Error getting instruments:', error);
                return [];
            }
        },

        async getMarketHours(): Promise<MyMarketHours> {
            try {
                const marketData = await MyDataHelpers.getMarketHours();
                return transformMarketHours(marketData);
            } catch (error) {
                console.error('Services: Error getting market hours:', error);
                return {};
            }
        },
    };
}

function transformInstrument(raw: any): MyInstrument {
    return {
        symbol: raw.symbol,
        name: raw.display_name,
        type: raw.instrument_type,
        precision: raw.decimal_places,
        // ... other transformations
    };
}

function transformMarketHours(raw: any): MyMarketHours {
    const result: MyMarketHours = {};

    Object.keys(raw).forEach(symbol => {
        const hours = raw[symbol];
        result[symbol] = {
            isOpen: hours.is_open,
            openTime: hours.open_time,
            closeTime: hours.close_time,
        };
    });

    return result;
}
```

#### 5. Implement Main Adapter

Create the main adapter with transformation logic:

```typescript
// my-chart-adapter/index.ts
import type {
    MyChartAdapter,
    MyTransport,
    MyServices,
    MyHistoryParams,
    MyHistoryResult,
    MyStreamParams,
    MyStreamCallback,
    MyUnsubscriber,
    MyMarketData,
} from './types';

// Transformation utilities
const transformations = {
    toMyHistoryResult(response: any, params: MyHistoryParams): MyHistoryResult {
        const data: MyDataPoint[] = [];

        if (response.candles) {
            response.candles.forEach((candle: any) => {
                data.push({
                    timestamp: candle.timestamp,
                    price: candle.close,
                    volume: candle.volume,
                });
            });
        } else if (response.ticks) {
            response.ticks.forEach((tick: any) => {
                data.push({
                    timestamp: tick.timestamp,
                    price: tick.price,
                });
            });
        }

        return {
            data,
            metadata: {
                instrument: params.instrument,
                timeframe: params.timeframe,
                count: data.length,
            },
        };
    },

    toMyStreamData(message: any): MyDataPoint | null {
        if (message.tick) {
            return {
                timestamp: message.tick.timestamp,
                price: message.tick.price,
            };
        } else if (message.candle) {
            return {
                timestamp: message.candle.timestamp,
                price: message.candle.close,
                volume: message.candle.volume,
            };
        }
        return null;
    },
};

export function buildMyChartAdapter(
    transport: MyTransport,
    services: MyServices,
    config: MyAdapterConfig = {}
): MyChartAdapter {
    const subscriptions = new Map<string, () => void>();

    return {
        async loadHistoricalData(params: MyHistoryParams): Promise<MyHistoryResult> {
            try {
                // Transform parameters to your data source format
                const request = {
                    symbol: params.instrument,
                    timeframe: params.timeframe,
                    from: params.from?.getTime(),
                    to: params.to?.getTime(),
                    limit: params.limit || 1000,
                };

                const response = await transport.fetchHistory(request);
                return transformations.toMyHistoryResult(response, params);
            } catch (error) {
                console.error('Error loading historical data:', error);
                return {
                    data: [],
                    metadata: {
                        instrument: params.instrument,
                        timeframe: params.timeframe,
                        count: 0,
                    },
                };
            }
        },

        startLiveStream(params: MyStreamParams, callback: MyStreamCallback): MyUnsubscriber {
            const subscriptionKey = `${params.instrument}-${params.timeframe}`;

            try {
                const request = {
                    symbol: params.instrument,
                    timeframe: params.timeframe,
                    subscribe: true,
                };

                const subscriptionId = transport.subscribe(request, (message: any) => {
                    const dataPoint = transformations.toMyStreamData(message);
                    if (dataPoint) {
                        callback(dataPoint);
                    }
                });

                const unsubscribe = () => {
                    transport.unsubscribe(subscriptionId);
                    subscriptions.delete(subscriptionKey);
                };

                subscriptions.set(subscriptionKey, unsubscribe);
                return unsubscribe;
            } catch (error) {
                console.error('Error starting live stream:', error);
                return () => {}; // Return no-op function on error
            }
        },

        async getMarketData(): Promise<MyMarketData> {
            try {
                const [instruments, marketHours] = await Promise.all([
                    services.getInstruments(),
                    services.getMarketHours(),
                ]);

                return {
                    instruments,
                    marketHours,
                };
            } catch (error) {
                console.error('Error getting market data:', error);
                return {
                    instruments: [],
                    marketHours: {},
                };
            }
        },
    };
}
```

#### 6. Integration Example

Show how to use your adapter:

```typescript
// Usage example
import { buildMyChartAdapter, createMyTransport, createMyServices } from './my-chart-adapter';

// Create adapter instance
const transport = createMyTransport();
const services = createMyServices();
const adapter = buildMyChartAdapter(transport, services, { debug: true });

// Use with your chart library
const MyChartComponent = () => {
    const [marketData, setMarketData] = useState(null);

    useEffect(() => {
        adapter.getMarketData().then(setMarketData);
    }, []);

    return (
        <MyChartLibrary
            loadHistoricalData={adapter.loadHistoricalData}
            startLiveStream={adapter.startLiveStream}
            marketData={marketData}
            // ... other props
        />
    );
};
```

### Key Patterns to Follow

1. **Separation of Concerns**: Keep transport, services, and transformation logic separate
2. **Error Handling**: Always provide fallbacks and graceful degradation
3. **Type Safety**: Use TypeScript interfaces to ensure contract compliance
4. **Subscription Management**: Track and clean up subscriptions properly
5. **Configuration**: Allow customization through config objects
6. **Testing**: Design for testability with dependency injection

## Testing Strategies

### 1. Unit Testing

Test each layer independently:

```typescript
// __tests__/transport.test.ts
import { createTransport } from '../transport';
import chart_api from '@/external/bot-skeleton/services/api/chart-api';

jest.mock('@/external/bot-skeleton/services/api/chart-api');

describe('Transport Layer', () => {
    let transport: TTransport;

    beforeEach(() => {
        transport = createTransport();
        jest.clearAllMocks();
    });

    describe('send', () => {
        it('should send request and return response', async () => {
            const mockResponse = { history: { prices: [1, 2, 3], times: [1000, 2000, 3000] } };
            (chart_api.api.send as jest.Mock).mockResolvedValue(mockResponse);

            const request = { ticks_history: 'R_100', count: 100 };
            const result = await transport.send(request);

            expect(chart_api.api.send).toHaveBeenCalledWith(request);
            expect(result).toEqual(mockResponse);
        });

        it('should handle errors gracefully', async () => {
            const error = new Error('Network error');
            (chart_api.api.send as jest.Mock).mockRejectedValue(error);

            const request = { ticks_history: 'R_100', count: 100 };

            await expect(transport.send(request)).rejects.toThrow('Network error');
        });
    });

    describe('subscribe', () => {
        it('should create subscription and return subscription ID', () => {
            const mockSubscribe = jest.fn().mockReturnValue({ unsubscribe: jest.fn() });
            const mockOnMessage = jest.fn().mockReturnValue({ subscribe: mockSubscribe });
            (chart_api.api.onMessage as jest.Mock).mockReturnValue(mockOnMessage);

            const request = { ticks: 'R_100', subscribe: 1 };
            const callback = jest.fn();

            const subscriptionId = transport.subscribe(request, callback);

            expect(typeof subscriptionId).toBe('string');
            expect(subscriptionId).toMatch(/^temp-/);
        });
    });
});
```

### 2. Integration Testing

Test the complete adapter flow:

```typescript
// __tests__/adapter.integration.test.ts
import { buildSmartChartsChampionAdapter } from '../index';
import { createTransport } from '../transport';
import { createServices } from '../services';

describe('SmartCharts Champion Adapter Integration', () => {
    let adapter: SmartchartsChampionAdapter;
    let mockTransport: jest.Mocked<TTransport>;
    let mockServices: jest.Mocked<TServices>;

    beforeEach(() => {
        mockTransport = {
            send: jest.fn(),
            subscribe: jest.fn(),
            unsubscribe: jest.fn(),
            unsubscribeAll: jest.fn(),
        };

        mockServices = {
            getActiveSymbols: jest.fn(),
            getTradingTimes: jest.fn(),
        };

        adapter = buildSmartChartsChampionAdapter(mockTransport, mockServices);
    });

    describe('getQuotes', () => {
        it('should fetch and transform tick data', async () => {
            const mockResponse = {
                history: {
                    prices: [100.5, 100.6, 100.7],
                    times: [1609459200, 1609459260, 1609459320],
                },
                echo_req: { ticks_history: 'R_100' },
            };

            mockTransport.send.mockResolvedValue(mockResponse);

            const request: TGetQuotesRequest = {
                symbol: 'R_100',
                granularity: 0,
                count: 100,
            };

            const result = await adapter.getQuotes(request);

            expect(result.quotes).toHaveLength(3);
            expect(result.quotes[0]).toEqual({
                Date: '1609459200',
                Close: 100.5,
                DT: new Date(1609459200 * 1000),
            });
            expect(result.meta?.symbol).toBe('R_100');
            expect(result.meta?.granularity).toBe(0);
        });

        it('should fetch and transform candle data', async () => {
            const mockResponse = {
                candles: [
                    { open: 100.0, high: 100.8, low: 99.9, close: 100.5, epoch: 1609459200 },
                    { open: 100.5, high: 101.0, low: 100.2, close: 100.7, epoch: 1609459260 },
                ],
                echo_req: { ticks_history: 'R_100' },
            };

            mockTransport.send.mockResolvedValue(mockResponse);

            const request: TGetQuotesRequest = {
                symbol: 'R_100',
                granularity: 60,
                count: 100,
            };

            const result = await adapter.getQuotes(request);

            expect(result.quotes).toHaveLength(2);
            expect(result.quotes[0]).toEqual({
                Date: '1609459200',
                Open: 100.0,
                High: 100.8,
                Low: 99.9,
                Close: 100.5,
                DT: new Date(1609459200 * 1000),
            });
        });
    });

    describe('subscribeQuotes', () => {
        it('should create subscription and handle streaming data', () => {
            const mockSubscriptionId = 'sub-123';
            mockTransport.subscribe.mockReturnValue(mockSubscriptionId);

            const request: TGetQuotesRequest = {
                symbol: 'R_100',
                granularity: 0,
            };

            const callback = jest.fn();
            const unsubscribe = adapter.subscribeQuotes(request, callback);

            expect(mockTransport.subscribe).toHaveBeenCalledWith(
                expect.objectContaining({
                    ticks_history: 'R_100',
                    subscribe: 1,
                    style: 'ticks',
                }),
                expect.any(Function)
            );

            expect(typeof unsubscribe).toBe('function');
        });
    });

    describe('getChartData', () => {
        it('should fetch and transform chart reference data', async () => {
            const mockActiveSymbols = [
                {
                    symbol: 'R_100',
                    display_name: 'Volatility 100 Index',
                    market: 'synthetic_index',
                    pip: 0.01,
                },
            ];

            const mockTradingTimes = {
                R_100: {
                    open: ['00:00:00'],
                    close: ['23:59:59'],
                },
            };

            mockServices.getActiveSymbols.mockResolvedValue(mockActiveSymbols);
            mockServices.getTradingTimes.mockResolvedValue(mockTradingTimes);

            const result = await adapter.getChartData();

            expect(result.activeSymbols).toBeDefined();
            expect(result.tradingTimes).toBeDefined();
            expect(result.tradingTimes.R_100).toEqual({
                isOpen: true,
                openTime: '00:00:00',
                closeTime: '23:59:59',
            });
        });
    });
});
```

### 3. Transformation Testing

Test data transformation utilities:

```typescript
// __tests__/transformations.test.ts
import { transformations } from '../index';

describe('Transformation Utilities', () => {
    describe('toTGetQuotesResult', () => {
        it('should transform tick history response', () => {
            const response = {
                history: {
                    prices: [100.5, 100.6, 100.7],
                    times: [1609459200, 1609459260, 1609459320],
                },
                echo_req: { ticks_history: 'R_100' },
            };

            const result = transformations.toTGetQuotesResult(response, 0);

            expect(result.quotes).toHaveLength(3);
            expect(result.quotes[0]).toEqual({
                Date: '1609459200',
                Close: 100.5,
                DT: new Date(1609459200 * 1000),
            });
            expect(result.meta?.symbol).toBe('R_100');
            expect(result.meta?.granularity).toBe(0);
        });

        it('should transform candle history response', () => {
            const response = {
                candles: [{ open: 100.0, high: 100.8, low: 99.9, close: 100.5, epoch: 1609459200 }],
                echo_req: { ticks_history: 'R_100' },
            };

            const result = transformations.toTGetQuotesResult(response, 60);

            expect(result.quotes).toHaveLength(1);
            expect(result.quotes[0]).toEqual({
                Date: '1609459200',
                Open: 100.0,
                High: 100.8,
                Low: 99.9,
                Close: 100.5,
                DT: new Date(1609459200 * 1000),
            });
        });

        it('should handle empty response gracefully', () => {
            const result = transformations.toTGetQuotesResult(null, 0);

            expect(result.quotes).toEqual([]);
            expect(result.meta?.symbol).toBe('');
            expect(result.meta?.granularity).toBe(0);
        });
    });

    describe('toTradingTimesMap', () => {
        it('should transform trading times data', () => {
            const tradingTimesData = {
                R_100: {
                    open: ['00:00:00'],
                    close: ['23:59:59'],
                },
                EURUSD: {
                    open: ['--'],
                    close: ['--'],
                },
            };

            const result = transformations.toTradingTimesMap(tradingTimesData);

            expect(result.R_100).toEqual({
                isOpen: true,
                openTime: '00:00:00',
                closeTime: '23:59:59',
            });
            expect(result.EURUSD).toEqual({
                isOpen: false,
                openTime: '--',
                closeTime: '--',
            });
        });
    });
});
```

### 4. Mock Testing

Create comprehensive mocks for testing:

```typescript
// __tests__/mocks/transport.mock.ts
import type { TTransport } from '../../types';

export function createMockTransport(): jest.Mocked<TTransport> {
    return {
        send: jest.fn(),
        subscribe: jest.fn(),
        unsubscribe: jest.fn(),
        unsubscribeAll: jest.fn(),
    };
}

// __tests__/mocks/services.mock.ts
import type { TServices } from '../../types';

export function createMockServices(): jest.Mocked<TServices> {
    return {
        getActiveSymbols: jest.fn(),
        getTradingTimes: jest.fn(),
    };
}

// __tests__/mocks/data.mock.ts
export const mockTickResponse = {
    history: {
        prices: [100.5, 100.6, 100.7],
        times: [1609459200, 1609459260, 1609459320],
    },
    echo_req: { ticks_history: 'R_100' },
};

export const mockCandleResponse = {
    candles: [
        { open: 100.0, high: 100.8, low: 99.9, close: 100.5, epoch: 1609459200 },
        { open: 100.5, high: 101.0, low: 100.2, close: 100.7, epoch: 1609459260 },
    ],
    echo_req: { ticks_history: 'R_100' },
};

export const mockActiveSymbols = [
    {
        symbol: 'R_100',
        display_name: 'Volatility 100 Index',
        market: 'synthetic_index',
        market_display_name: 'Synthetic Indices',
        submarket: 'random_index',
        submarket_display_name: 'Continuous Indices',
        symbol_type: 'stockindex',
        pip: 0.01,
        exchange_is_open: 1,
        is_trading_suspended: 0,
    },
];

export const mockTradingTimes = {
    R_100: {
        open: ['00:00:00'],
        close: ['23:59:59'],
    },
};
```

## Best Practices

### 1. Error Handling

Always implement comprehensive error handling:

```typescript
// Good: Comprehensive error handling
async getQuotes(request: TGetQuotesRequest): Promise<TGetQuotesResult> {
    try {
        const response = await transport.send(apiRequest);
        return transformations.toTGetQuotesResult(response, request.granularity);
    } catch (error) {
        console.error('Error in getQuotes:', error);

        // Return safe fallback
        return {
            quotes: [],
            meta: {
                symbol: request.symbol,
                granularity: request.granularity,
                error: error instanceof Error ? error.message : 'Unknown error',
            },
        };
    }
}

// Bad: No error handling
async getQuotes(request: TGetQuotesRequest): Promise<TGetQuotesResult> {
    const response = await transport.send(apiRequest);
    return transformations.toTGetQuotesResult(response, request.granularity);
}
```

### 2. Type Safety

Use strict TypeScript configurations and comprehensive type definitions:

```typescript
// Good: Strict typing
interface StrictTQuote {
    readonly Date: string;
    readonly Close: number;
    readonly Open?: number;
    readonly High?: number;
    readonly Low?: number;
    readonly Volume?: number;
    readonly tick?: Readonly<TickData>;
    readonly ohlc?: Readonly<OHLCData>;
    readonly DT?: Date;
}

// Bad: Loose typing
interface LooseTQuote {
    Date: any;
    Close: any;
    [key: string]: any;
}
```

### 3. Subscription Management

Implement proper subscription lifecycle management:

```typescript
// Good: Proper subscription management
class SubscriptionManager {
    private subscriptions = new Map<string, () => void>();

    subscribe(key: string, unsubscribeFn: () => void): void {
        // Clean up existing subscription if any
        this.unsubscribe(key);
        this.subscriptions.set(key, unsubscribeFn);
    }

    unsubscribe(key: string): void {
        const unsubscribeFn = this.subscriptions.get(key);
        if (unsubscribeFn) {
            unsubscribeFn();
            this.subscriptions.delete(key);
        }
    }

    unsubscribeAll(): void {
        this.subscriptions.forEach(unsubscribeFn => unsubscribeFn());
        this.subscriptions.clear();
    }
}

// Bad: No subscription management
let currentSubscription: (() => void) | null = null;

function subscribe(callback: Function) {
    currentSubscription = transport.subscribe(request, callback);
}
```

### 4. Configuration Management

Provide flexible configuration options:

```typescript
// Good: Comprehensive configuration
interface AdapterConfig {
    debug?: boolean;
    timeout?: number;
    retryAttempts?: number;
    retryDelay?: number;
    subscriptionTimeout?: number;
    transformationOptions?: {
        dateFormat?: 'epoch' | 'iso';
        precision?: number;
        includeVolume?: boolean;
    };
}

export function buildAdapter(
    transport: TTransport,
    services: TServices,
    config: AdapterConfig = {}
): SmartchartsChampionAdapter {
    const finalConfig = {
        debug: false,
        timeout: 30000,
        retryAttempts: 3,
        retryDelay: 1000,
        subscriptionTimeout: 60000,
        transformationOptions: {
            dateFormat: 'epoch' as const,
            precision: 5,
            includeVolume: true,
        },
        ...config,
    };

    // Use finalConfig throughout the adapter
}
```

### 5. Logging and Debugging

Implement structured logging:

```typescript
// Good: Structured logging
class Logger {
    constructor(private debug: boolean = false) {}

    info(message: string, data?: any): void {
        if (this.debug) {
            console.log(`[Adapter] ${message}`, data);
        }
    }

    error(message: string, error?: any): void {
        console.error(`[Adapter] ${message}`, error);
    }

    warn(message: string, data?: any): void {
        console.warn(`[Adapter] ${message}`, data);
    }
}

// Usage in adapter
const logger = new Logger(config.debug);

async getQuotes(request: TGetQuotesRequest): Promise<TGetQuotesResult> {
    logger.info('Fetching quotes', { symbol: request.symbol, granularity: request.granularity });

    try {
        const response = await transport.send(apiRequest);
        logger.info('Quotes fetched successfully', { count: response.quotes?.length });
        return transformations.toTGetQuotesResult(response, request.granularity);
    } catch (error) {
        logger.error('Failed to fetch quotes', error);
        throw error;
    }
}
```

### 6. Performance Optimization

Implement caching and optimization strategies:

```typescript
// Good: Caching and optimization
class CacheManager {
    private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

    set(key: string, data: any, ttl: number = 300000): void {
        // 5 minutes default
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl,
        });
    }

    get(key: string): any | null {
        const entry = this.cache.get(key);
        if (!entry) return null;

        if (Date.now() - entry.timestamp > entry.ttl) {
            this.cache.delete(key);
            return null;
        }

        return entry.data;
    }

    clear(): void {
        this.cache.clear();
    }
}

// Usage in services
export function createServices(): TServices {
    const cache = new CacheManager();

    return {
        async getActiveSymbols(): Promise<any> {
            const cacheKey = 'active_symbols';
            const cached = cache.get(cacheKey);

            if (cached) {
                return cached;
            }

            try {
                const symbols = await ApiHelpers.instance.active_symbols.retrieveActiveSymbols();
                cache.set(cacheKey, symbols, 600000); // Cache for 10 minutes
                return symbols;
            } catch (error) {
                console.error('Error getting active symbols:', error);
                return [];
            }
        },
    };
}
```

## Troubleshooting

### Common Issues and Solutions

#### 1. Subscription Not Receiving Data

**Problem**: Subscriptions are created but callbacks are never called.

**Possible Causes**:

- Incorrect subscription ID mapping
- Message filtering issues
- WebSocket connection problems

**Solution**:

```typescript
// Debug subscription flow
subscribe(request: any, callback: (response: any) => void): string {
    const tempId = `temp-${Date.now()}-${Math.random()}`;

    console.log('🔄 Creating subscription:', { tempId, request });

    const messageSubscription = chart_api.api.onMessage()?.subscribe(({ data }: { data: any }) => {
        console.log('📨 Received message:', data);

        const subscriptionId = data?.subscription?.id;
        const storedSub = subscriptions.get(tempId);

        if (storedSub && subscriptionId === storedSub.realSubscriptionId) {
            console.log('✅ Message matches subscription:', { tempId, subscriptionId });
            callback(data);
        } else {
            console.log('❌ Message does not match:', { tempId, subscriptionId, stored: storedSub?.realSubscriptionId });
        }
    });

    // ... rest of implementation
}
```

#### 2. Data Transformation Errors

**Problem**: Data is not being transformed correctly between formats.

**Possible Causes**:

- API response format changes
- Missing or null data fields
- Type mismatches

**Solution**:

```typescript
// Add validation and fallbacks
toTGetQuotesResult(response: any, granularity: TGranularity): TGetQuotesResult {
    console.log('🔄 Transforming response:', { response, granularity });

    if (!response) {
        console.warn('⚠️ Empty response received');
        return { quotes: [], meta: { symbol: '', granularity } };
    }

    // Validate response structure
    if (granularity === 0) {
        if (!response.history || !response.history.prices || !response.history.times) {
            console.error('❌ Invalid tick response structure:', response);
            return { quotes: [], meta: { symbol: '', granularity } };
        }
    } else if (granularity > 0) {
        if (!response.candles || !Array.isArray(response.candles)) {
            console.error('❌ Invalid candle response structure:', response);
            return { quotes: [], meta: { symbol: '', granularity } };
        }
    }

    // Continue with transformation...
}
```

#### 3. Memory Leaks from Subscriptions

**Problem**: Application memory usage grows over time due to uncleared subscriptions.

**Possible Causes**:

- Subscriptions not being properly unsubscribed
- Event listeners not being removed
- References to callbacks being retained

**Solution**:

```typescript
// Implement proper cleanup
class SubscriptionTracker {
    private activeSubscriptions = new Set<string>();
    private subscriptionCallbacks = new Map<string, () => void>();

    track(subscriptionId: string, cleanup: () => void): void {
        this.activeSubscriptions.add(subscriptionId);
        this.subscriptionCallbacks.set(subscriptionId, cleanup);
    }

    untrack(subscriptionId: string): void {
        const cleanup = this.subscriptionCallbacks.get(subscriptionId);
        if (cleanup) {
            cleanup();
            this.subscriptionCallbacks.delete(subscriptionId);
        }
        this.activeSubscriptions.delete(subscriptionId);
    }

    cleanup(): void {
        this.subscriptionCallbacks.forEach(cleanup => cleanup());
        this.subscriptionCallbacks.clear();
        this.activeSubscriptions.clear();
    }

    getActiveCount(): number {
        return this.activeSubscriptions.size;
    }
}
```

#### 4. Type Compatibility Issues

**Problem**: TypeScript compilation errors due to interface mismatches.

**Possible Causes**:

- Chart library interface changes
- Missing type definitions
- Incorrect type mappings

**Solution**:

```typescript
// Use type guards and assertions
function isValidTQuote(obj: any): obj is TQuote {
    return (
        obj &&
        typeof obj.Date === 'string' &&
        typeof obj.Close === 'number' &&
        (obj.Open === undefined || typeof obj.Open === 'number') &&
        (obj.High === undefined || typeof obj.High === 'number') &&
        (obj.Low === undefined || typeof obj.Low === 'number')
    );
}

// Use in transformations
const quote = transformToTQuote(rawData);
if (isValidTQuote(quote)) {
    callback(quote);
} else {
    console.error('Invalid quote structure:', quote);
}
```

#### 5. Performance Issues with Large Datasets

**Problem**: Slow performance when handling large amounts of historical data.

**Possible Causes**:

- Inefficient data transformation
- Memory allocation issues
- Blocking operations on main thread

**Solution**:

```typescript
// Implement chunked processing
async function processLargeDataset(data: any[], chunkSize: number = 1000): Promise<TQuote[]> {
    const results: TQuote[] = [];

    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        const processedChunk = chunk.map(transformToTQuote);
        results.push(...processedChunk);

        // Allow other operations to run
        if (i % (chunkSize * 10) === 0) {
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    return results;
}
```

### Debugging Tools and Techniques

#### 1. Adapter Debug Mode

Enable comprehensive logging for troubleshooting:

```typescript
const adapter = buildSmartChartsChampionAdapter(transport, services, {
    debug: true,
    logLevel: 'verbose',
});
```

#### 2. Network Monitoring

Monitor WebSocket traffic:

```typescript
// Add to transport layer
const originalSend = chart_api.api.send;
chart_api.api.send = function (request: any) {
    console.log('📤 Outgoing request:', request);
    return originalSend.call(this, request).then(response => {
        console.log('📥 Incoming response:', response);
        return response;
    });
};
```

#### 3. Performance Monitoring

Track adapter performance:

```typescript
class PerformanceMonitor {
    private metrics = new Map<string, number[]>();

    time(operation: string): () => void {
        const start = performance.now();
        return () => {
            const duration = performance.now() - start;
            if (!this.metrics.has(operation)) {
                this.metrics.set(operation, []);
            }
            this.metrics.get(operation)!.push(duration);
        };
    }

    getStats(operation: string): { avg: number; min: number; max: number; count: number } {
        const times = this.metrics.get(operation) || [];
        if (times.length === 0) return { avg: 0, min: 0, max: 0, count: 0 };

        return {
            avg: times.reduce((a, b) => a + b, 0) / times.length,
            min: Math.min(...times),
            max: Math.max(...times),
            count: times.length,
        };
    }
}

// Usage
const monitor = new PerformanceMonitor();

async getQuotes(request: TGetQuotesRequest): Promise<TGetQuotesResult> {
    const endTiming = monitor.time('getQuotes');
    try {
        // ... implementation
        return result;
    } finally {
        endTiming();
    }
}
```

## Conclusion

The SmartCharts Champion Adapter demonstrates a robust, scalable approach to integrating legacy systems with modern chart libraries. By following the patterns and practices outlined in this guide, you can:

1. **Create Clean Abstractions**: Separate concerns and maintain clean interfaces
2. **Ensure Type Safety**: Use comprehensive TypeScript definitions
3. **Handle Errors Gracefully**: Implement proper error handling and fallbacks
4. **Optimize Performance**: Use caching, chunking, and efficient algorithms
5. **Enable Testing**: Design for testability with dependency injection
6. **Debug Effectively**: Implement comprehensive logging and monitoring

### Key Takeaways

- **Adapter Pattern**: Provides a clean way to integrate incompatible interfaces
- **Dependency Injection**: Enables testability and flexibility
- **Type Safety**: Prevents runtime errors and improves developer experience
- **Error Handling**: Ensures graceful degradation and better user experience
- **Performance**: Optimizations are crucial for handling real-time financial data
- **Testing**: Comprehensive testing strategies ensure reliability

This documentation serves as both a reference for the current implementation and a blueprint for creating similar adapters in other projects. The patterns and practices described here are applicable beyond chart libraries and can be used for any integration scenario where you need to bridge different systems or APIs.

### Next Steps

1. **Review Implementation**: Study the existing adapter code alongside this documentation
2. **Run Tests**: Execute the test suite to understand expected behavior
3. **Experiment**: Try creating a simple adapter for a different chart library
4. **Contribute**: Improve the existing adapter based on real-world usage
5. **Document**: Keep documentation updated as the adapter evolves

For questions or contributions, refer to the project's issue tracker and contribution guidelines.
</content>
<task_progress>

- [x] Explore adapter directory structure
- [x] Analyze smartcharts-champion implementation
- [x] Review existing documentation
- [x] Document adapter architecture and patterns
- [x] Document props, functions, and interfaces
- [x] Create implementation guide for similar adapters
- [x] Generate comprehensive documentation
      </task_progress>
