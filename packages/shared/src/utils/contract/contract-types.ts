import {
    TPortfolioResponse,
    TPriceProposalOpenContractsResponse,
    TUpdateContractHistoryResponse,
    TUpdateContractResponse,
} from '@deriv/api';

export type TContractStore = {
    clearContractUpdateConfigValues: () => void;
    contract_info: TContractInfo;
    contract_update_history: TUpdateContractHistoryResponse['contract_update_history'];
    contract_update_take_profit: number | string;
    contract_update_stop_loss: number | string;
    digits_info: TDigitsInfo;
    display_status: string;
    has_contract_update_take_profit: boolean;
    has_contract_update_stop_loss: boolean;
    is_digit_contract: boolean;
    is_ended: boolean;
    onChange: (param: { name: string; value: string | number | boolean }) => void;
    updateLimitOrder: () => void;
    validation_errors: { contract_update_stop_loss: string[]; contract_update_take_profit: string[] };
};

export type TContractInfo = NonNullable<TPriceProposalOpenContractsResponse['proposal_open_contract']> &
    Omit<NonNullable<NonNullable<TPortfolioResponse['portfolio']>['contracts']>[0], 'buy_price' | 'payout'> & {
        contract_update?: TUpdateContractResponse['contract_update'];
        // Override conflicting properties to use the Proposal contract types
        buy_price?: NonNullable<TPriceProposalOpenContractsResponse['proposal_open_contract']>['buy_price'];
        payout?: NonNullable<TPriceProposalOpenContractsResponse['proposal_open_contract']>['payout'];
    };

export type TTickItem = {
    epoch?: number;
    tick?: null | number;
    tick_display_value?: null | string;
};

export type TDigitsInfo = { [key: number]: { digit: number; spot: string } };

type TLimitProperty = {
    display_name?: string;
    order_amount?: null | number;
    order_date?: number;
    value?: null | string;
};

export type TLimitOrder = Partial<Record<'stop_loss' | 'stop_out' | 'take_profit', TLimitProperty>>;

export type TContractOptions = {
    isHighLow?: boolean;
    showButtonName?: boolean;
    showMainTitle?: boolean;
};
