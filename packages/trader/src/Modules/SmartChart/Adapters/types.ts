/**
 * SmartCharts Champion Adapter - Type Definitions
 *
 * Comprehensive TypeScript interfaces for the adapter pattern implementation
 * that bridges Deriv API infrastructure with SmartCharts Champion library.
 */

// Granularity definition - 0 for ticks, >0 for candle intervals in seconds
export type TGranularity = 0 | 60 | 120 | 180 | 300 | 600 | 900 | 1800 | 3600 | 7200 | 14400 | 28800 | 86400;

// Quote data structure for both ticks and candles
export interface TQuote {
    Date: string; // epoch or ISO as string
    Close: number;
    Open?: number; // Required for candles, optional for ticks
    High?: number; // Required for candles, optional for ticks
    Low?: number; // Required for candles, optional for ticks
    Volume?: number; // Optional volume data
    tick?: any; // Raw tick data for streaming
    ohlc?: any; // Raw OHLC data for streaming
    DT?: Date; // JavaScript Date object
    prevClose?: number; // Previous close price
}

// Function type for getting quotes (used by trade-chart components)
export type TGetQuotes = (params: {
    symbol: string;
    granularity: number; // 0 for ticks, >0 for candles in seconds
    count: number;
    start?: number;
    end?: number;
    style?: string; // 'ticks' or 'candles' (optional)
}) => Promise<TGetQuotesResponse>;

// Response from TGetQuotes function
export interface TGetQuotesResponse {
    candles?: Array<{
        open: number;
        high: number;
        low: number;
        close: number;
        epoch: number;
    }>;
    history?: {
        prices: number[];
        times: number[]; // epoch in seconds
    };
}

export type TSubscribeQuotes = (
    params: { symbol: string; granularity: TGranularity },
    callback: (quote: TQuote) => void
) => () => void; // returns unsubscribe function

export type TUnsubscribeQuotes = (request?: any, callback?: any) => void;

// Request parameters for historical data
export interface TGetQuotesRequest {
    symbol: string;
    granularity: TGranularity;
    start?: number; // epoch timestamp
    end?: number | 'latest';
    count?: number; // number of data points to fetch
}

// Response from historical data fetch
export interface TGetQuotesResult {
    quotes: TQuote[];
    meta?: {
        symbol: string;
        granularity: TGranularity;
        delay_amount?: number;
        error?: string;
    };
}

// Subscription callback function type
export type TSubscriptionCallback = (quote: TQuote) => void;

// Unsubscribe function type
export type TUnsubscribeFunction = () => void;

// Active symbols structure
export interface ActiveSymbol {
    display_name: string;
    market: string;
    market_display_name: string;
    subgroup: string;
    subgroup_display_name: string;
    submarket: string;
    submarket_display_name: string;
    symbol: string;
    symbol_type: string;
    pip: number;
    exchange_is_open: 0 | 1;
    is_trading_suspended: 0 | 1;
    delay_amount?: number;
}

// Active symbols collection (array of symbols)
export type ActiveSymbols = ActiveSymbol[];

// Trading times structure
export interface TradingTimesMap {
    [symbol: string]: {
        isOpen: boolean;
        openTime: string;
        closeTime: string;
    };
}

// Chart data response
export interface ChartDataResponse {
    activeSymbols: ActiveSymbols;
    tradingTimes: TradingTimesMap;
}

// Transport layer interface - abstracts WebSocket communication
export interface TTransport {
    send: (request: any) => Promise<any>;
    subscribe: (request: any, callback: (response: any) => void) => string;
    unsubscribe: (subscription_id: string) => void;
    unsubscribeAll: (msg_type?: string) => void;
}

// Services layer interface - abstracts data fetching operations
export interface TServices {
    getActiveSymbols: () => Promise<any>;
    getTradingTimes: () => Promise<any>;
}

// Adapter configuration options
export interface AdapterConfig {
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

// Main SmartCharts Champion functions interface
export interface SmartchartsChampionFunctions {
    getQuotes: (request: TGetQuotesRequest) => Promise<TGetQuotesResult>;
    subscribeQuotes: (request: TGetQuotesRequest, callback: TSubscriptionCallback) => TUnsubscribeFunction;
    getChartData: () => Promise<ChartDataResponse>;
    unsubscribeQuotes: (request: TGetQuotesRequest) => void;
}

// Complete adapter interface
export interface SmartchartsChampionAdapter extends SmartchartsChampionFunctions {
    transport: TTransport;
    services: TServices;
    config: AdapterConfig;
}

// Subscription tracking interface
export interface SubscriptionInfo {
    request: any;
    callback: (response: any) => void;
    messageSubscription?: any;
    realSubscriptionId?: string | null;
}

// Logger interface
export interface ILogger {
    info: (message: string, data?: any) => void;
    error: (message: string, error?: any) => void;
    warn: (message: string, data?: any) => void;
    debug: (message: string, data?: any) => void;
}
