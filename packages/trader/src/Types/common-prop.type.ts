import { Redirect, RouteComponentProps } from 'react-router-dom';

import {
    TActiveSymbolsResponse,
    TBuyContractRequest,
    TBuyContractResponse,
    TContractsForSymbolResponse,
    TForgetAllResponse,
    TForgetResponse,
    TPriceProposalOpenContractsRequest,
    TPriceProposalOpenContractsResponse,
    TPriceProposalRequest,
    TPriceProposalResponse,
    TServerTimeResponse,
    TTicksHistoryResponse,
    TTicksStreamRequest,
    TTicksStreamResponse,
    TTradingTimesResponse,
    TUpdateContractHistoryResponse,
    TUpdateContractRequest,
    TUpdateContractResponse,
} from '@deriv/api';
import { TSocketEndpointNames, TSocketResponse } from '@deriv/api/types';
import { buildBarriersConfig, buildDurationConfig, getContractTypesConfig } from '@deriv/shared';
import { TCoreStores } from '@deriv/stores/types';

import ModulesStore from 'Stores/Modules';
import { useTraderStore } from 'Stores/useTraderStores';

export type TRootStore = {
    client: TCoreStores['client'];
    common: TCoreStores['common'];
    modules: ModulesStore;
    ui: TCoreStores['ui'];
    gtm: TCoreStores['gtm'];
    notifications: TCoreStores['notifications'];
    contract_replay: TCoreStores['contract_replay'];
    contract_trade: TCoreStores['contract_trade'];
    portfolio: TCoreStores['portfolio'];
    chart_barrier_store: TCoreStores['chart_barrier_store'];
    active_symbols: TCoreStores['active_symbols'];
};

export type TBinaryRoutesProps = {
    is_logged_in: boolean;
    is_logging_in: boolean;
    passthrough?: {
        root_store: TCoreStores;
        WS: TWebSocket;
    };
};

export type TBuyRequest = {
    proposal_id: string;
    price: string | number;
    passthrough?: TBuyContractRequest['passthrough'];
};

export type TServerError = {
    code: string;
    message: string;
    details?: { [key: string]: string };
    fields?: string[];
};

export type TTextValueStrings = {
    text: string;
    value: string;
};

export type TTextValueNumber = {
    text: string;
    value: number;
};

export type TProposalTypeInfo = TTradeStore['proposal_info'][string];

export type TError = {
    error?: {
        code?: string;
        details?: {
            field?: string;
        };
        message?: string;
    };
};

type TRoute = {
    component?: React.ComponentType<RouteComponentProps> | React.ComponentType<Record<string, never>> | typeof Redirect;
    default?: boolean;
    exact?: boolean;
    getTitle?: () => string;
    path?: string;
    to?: string;
};

export type TRouteConfig = TRoute & {
    is_authenticated?: boolean;
    routes?: TRoute[];
};

export type TTradeStore = ReturnType<typeof useTraderStore>;

type TWebSocketCall = {
    activeSymbols: (mode?: 'string') => Promise<TActiveSymbolsResponse>;
    send?: (req?: Record<string, unknown>) => Promise<{ error?: TServerError & Record<string, unknown> }>;
    subscribeProposalOpenContract: (
        contract_id: TPriceProposalOpenContractsRequest['contract_id'],
        callback: (response: TPriceProposalOpenContractsResponse) => void
    ) => void;
};

type TWebSocketSend = (req?: Record<string, unknown>) => Promise<{ error?: TServerError & Record<string, unknown> }>;

export type TWebSocket = {
    activeSymbols: (mode?: 'string') => Promise<TActiveSymbolsResponse>;
    authorized: TWebSocketCall;
    buy: (req: TBuyRequest) => Promise<TBuyContractResponse & { error?: TServerError }>;
    contractUpdate: (
        contract_id: TUpdateContractRequest['contract_id'],
        limit_order: TUpdateContractRequest['limit_order']
    ) => Promise<{ error?: TServerError } & TUpdateContractResponse>;
    contractUpdateHistory: (contract_id?: number) => Promise<TUpdateContractHistoryResponse & { error?: TServerError }>;
    forget: (id: string) => Promise<TForgetResponse>;
    forgetAll: <T extends TSocketEndpointNames>(value: T) => Promise<TForgetAllResponse>;
    forgetStream: (stream_id: string) => void;
    send?: TWebSocketSend;
    subscribeProposal: (
        req: Partial<TPriceProposalRequest>,
        callback: (response: Promise<TPriceProposalResponse & { error?: TServerError }>) => void
    ) => Promise<TPriceProposalResponse & { error?: TServerError }>;
    subscribeTicks: (symbol: string, callback: (response: TTicksStreamResponse) => void) => void;
    subscribeTicksHistory: (
        req: TTicksStreamRequest,
        callback: (response: TTicksHistoryResponse | TTicksStreamResponse) => void
    ) => Promise<{ error?: TServerError } & (TTicksHistoryResponse | TTicksStreamResponse)>;
    storage: {
        contractsFor: (symbol: string) => Promise<TContractsForSymbolResponse>;
        send?: TWebSocketSend;
    };
    time: () => Promise<TServerTimeResponse>;
    tradingTimes: (date: string) => Promise<TTradingTimesResponse>;
    wait: <T extends TSocketEndpointNames>(value: T) => Promise<TSocketResponse<T>>;
};

export type TContractTypesList = {
    [key: string]: {
        name: string;
        categories: TTextValueStrings[];
    };
};

export type TConfig = ReturnType<typeof getContractTypesConfig>[string]['config'] & {
    default_stake?: number;
    has_spot?: boolean;
    durations?: ReturnType<typeof buildDurationConfig>;
    trade_types?: { [key: string]: string };
    barriers?: ReturnType<typeof buildBarriersConfig>;
    growth_rate_range?: number[];
    multiplier_range?: number[];
    cancellation_range?: string[];
    barrier_choices?: string[];
};
