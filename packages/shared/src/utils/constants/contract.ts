import React from 'react';

import { localize } from '@deriv-com/translations';

import { shouldShowCancellation, shouldShowExpiration, CONTRACT_TYPES, TRADE_TYPES } from '../contract';
import { TContractOptions } from '../contract/contract-types';
import { cloneObject } from '../object';
import { LocalStore } from '../storage';

export const getLocalizedBasis = () =>
    ({
        accumulator: localize('Accumulators'),
        current_stake: localize('Current stake'),
        multiplier: localize('Multiplier'),
        max_payout: localize('Max payout'),
        payout_per_pip: localize('Payout per pip'),
        payout_per_point: localize('Payout per point'),
        payout: localize('Payout'),
        stake: localize('Stake'),
        turbos: localize('Turbos'),
    }) as const;

/**
 * components can be undef or an array containing any of: 'start_date', 'barrier', 'last_digit'
 *     ['duration', 'amount'] are omitted, as they're available in all contract types
 */
type TContractTypesConfig = {
    title: string;
    trade_types: string[];
    basis: string[];
    components: string[];
    barrier_count?: number;
    config?: { hide_duration?: boolean; default_stake?: number };
};

type TGetContractTypesConfig = (symbol?: string) => Record<string, TContractTypesConfig>;

type TContractConfig = {
    button_name?: React.ReactNode;
    feature_flag?: string;
    name: React.ReactNode;
    position: string;
    main_title?: JSX.Element;
};

type TGetSupportedContracts = keyof ReturnType<typeof getSupportedContracts>;

export type TTextValueStrings = {
    text: string;
    value: string;
};

export type TTradeTypesCategories = {
    [key: string]: {
        name: string;
        categories: Array<string | TTextValueStrings>;
    };
};

export const getContractTypesConfig: TGetContractTypesConfig = symbol => ({
    [TRADE_TYPES.RISE_FALL]: {
        title: 'Rise/Fall',
        trade_types: [CONTRACT_TYPES.CALL, CONTRACT_TYPES.PUT],
        basis: ['stake', 'payout'],
        components: ['start_date'],
        barrier_count: 0,
    },
    [TRADE_TYPES.RISE_FALL_EQUAL]: {
        title: 'Rise/Fall',
        trade_types: [CONTRACT_TYPES.CALLE, CONTRACT_TYPES.PUTE],
        basis: ['stake', 'payout'],
        components: ['start_date'],
        barrier_count: 0,
    },
    [TRADE_TYPES.HIGH_LOW]: {
        title: 'Higher/Lower',
        trade_types: [CONTRACT_TYPES.HIGHER, CONTRACT_TYPES.LOWER],
        basis: ['stake', 'payout'],
        components: ['barrier'],
        barrier_count: 1,
    },
    [TRADE_TYPES.TOUCH]: {
        title: 'Touch/No Touch',
        trade_types: [CONTRACT_TYPES.TOUCH.ONE_TOUCH, CONTRACT_TYPES.TOUCH.NO_TOUCH],
        basis: ['stake', 'payout'],
        components: ['barrier'],
    },
    [TRADE_TYPES.END]: {
        title: 'Ends In/Ends Out',
        trade_types: [CONTRACT_TYPES.END.IN, CONTRACT_TYPES.END.OUT],
        basis: ['stake', 'payout'],
        components: ['barrier'],
    },
    [TRADE_TYPES.STAY]: {
        title: 'Stays In/Goes Out',
        trade_types: [CONTRACT_TYPES.STAY.IN, CONTRACT_TYPES.STAY.OUT],
        basis: ['stake', 'payout'],
        components: ['barrier'],
    },
    [TRADE_TYPES.ASIAN]: {
        title: 'Asian Up/Asian Down',
        trade_types: [CONTRACT_TYPES.ASIAN.UP, CONTRACT_TYPES.ASIAN.DOWN],
        basis: ['stake', 'payout'],
        components: [],
    },
    [TRADE_TYPES.MATCH_DIFF]: {
        title: 'Matches/Differs',
        trade_types: [CONTRACT_TYPES.MATCH_DIFF.MATCH, CONTRACT_TYPES.MATCH_DIFF.DIFF],
        basis: ['stake', 'payout'],
        components: ['last_digit'],
    },
    [TRADE_TYPES.EVEN_ODD]: {
        title: 'Even/Odd',
        trade_types: [CONTRACT_TYPES.EVEN_ODD.ODD, CONTRACT_TYPES.EVEN_ODD.EVEN],
        basis: ['stake', 'payout'],
        components: [],
    },
    [TRADE_TYPES.OVER_UNDER]: {
        title: 'Over/Under',
        trade_types: [CONTRACT_TYPES.OVER_UNDER.OVER, CONTRACT_TYPES.OVER_UNDER.UNDER],
        basis: ['stake', 'payout'],
        components: ['last_digit'],
    },
    [TRADE_TYPES.LB_CALL]: {
        title: 'Close-to-Low',
        trade_types: [CONTRACT_TYPES.LB_CALL],
        basis: ['multiplier'],
        components: [],
    },
    [TRADE_TYPES.LB_PUT]: {
        title: 'High-to-Close',
        trade_types: [CONTRACT_TYPES.LB_PUT],
        basis: ['multiplier'],
        components: [],
    },
    [TRADE_TYPES.LB_HIGH_LOW]: {
        title: 'High-to-Low',
        trade_types: [CONTRACT_TYPES.LB_HIGH_LOW],
        basis: ['multiplier'],
        components: [],
    },
    [TRADE_TYPES.TICK_HIGH_LOW]: {
        title: 'High Tick/Low Tick',
        trade_types: [CONTRACT_TYPES.TICK_HIGH_LOW.HIGH, CONTRACT_TYPES.TICK_HIGH_LOW.LOW],
        basis: [],
        components: [],
    },
    [TRADE_TYPES.RUN_HIGH_LOW]: {
        title: 'Only Ups/Only Downs',
        trade_types: [CONTRACT_TYPES.RUN_HIGH_LOW.HIGH, CONTRACT_TYPES.RUN_HIGH_LOW.LOW],
        basis: [],
        components: [],
    },
    [TRADE_TYPES.RESET]: {
        title: 'Reset Up/Reset Down',
        trade_types: [CONTRACT_TYPES.RESET.CALL, CONTRACT_TYPES.RESET.PUT],
        basis: [],
        components: [],
    },
    [TRADE_TYPES.CALL_PUT_SPREAD]: {
        title: 'Spread Up/Spread Down',
        trade_types: [CONTRACT_TYPES.CALL_PUT_SPREAD.CALL, CONTRACT_TYPES.CALL_PUT_SPREAD.PUT],
        basis: [],
        components: [],
    },
    [TRADE_TYPES.ACCUMULATOR]: {
        title: 'Accumulators',
        trade_types: [CONTRACT_TYPES.ACCUMULATOR],
        basis: ['stake'],
        components: ['take_profit', 'accumulator', 'accu_info_display'],
        barrier_count: 2,
        config: { hide_duration: true },
    },
    [TRADE_TYPES.MULTIPLIER]: {
        title: 'Multipliers',
        trade_types: [CONTRACT_TYPES.MULTIPLIER.UP, CONTRACT_TYPES.MULTIPLIER.DOWN],
        basis: ['stake'],
        components: [
            'take_profit',
            'stop_loss',
            ...(shouldShowCancellation(symbol) ? ['cancellation'] : []),
            ...(shouldShowExpiration(symbol) ? ['expiration'] : []),
        ],
        config: { hide_duration: true },
    }, // hide Duration for Multiplier contracts for now
    [TRADE_TYPES.TURBOS.LONG]: {
        title: 'Turbos',
        trade_types: [CONTRACT_TYPES.TURBOS.LONG],
        basis: ['stake'],
        barrier_count: 1,
        components: ['trade_type_tabs', 'payout_selector', 'take_profit'],
    },
    [TRADE_TYPES.TURBOS.SHORT]: {
        title: 'Turbos',
        trade_types: [CONTRACT_TYPES.TURBOS.SHORT],
        basis: ['stake'],
        barrier_count: 1,
        components: ['trade_type_tabs', 'payout_selector', 'take_profit'],
    },
    [TRADE_TYPES.VANILLA.CALL]: {
        title: 'Call/Put',
        trade_types: [CONTRACT_TYPES.VANILLA.CALL],
        basis: ['stake'],
        components: ['duration', 'strike', 'amount', 'trade_type_tabs'],
        barrier_count: 1,
    },
    [TRADE_TYPES.VANILLA.PUT]: {
        title: 'Call/Put',
        trade_types: [CONTRACT_TYPES.VANILLA.PUT],
        basis: ['stake'],
        components: ['duration', 'strike', 'amount', 'trade_type_tabs'],
        barrier_count: 1,
    },
});

// Config for rendering trade options
export const getContractCategoriesConfig = () =>
    ({
        Turbos: { name: 'Turbos', categories: [TRADE_TYPES.TURBOS.LONG, TRADE_TYPES.TURBOS.SHORT] },
        Multipliers: { name: 'Multipliers', categories: [TRADE_TYPES.MULTIPLIER] },
        'Ups & Downs': {
            name: 'Ups & Downs',
            categories: [
                TRADE_TYPES.RISE_FALL,
                TRADE_TYPES.RISE_FALL_EQUAL,
                TRADE_TYPES.HIGH_LOW,
                TRADE_TYPES.RUN_HIGH_LOW,
                TRADE_TYPES.RESET,
                TRADE_TYPES.ASIAN,
                TRADE_TYPES.CALL_PUT_SPREAD,
            ],
        },
        'Touch & No Touch': {
            name: 'Touch & No Touch',
            categories: [TRADE_TYPES.TOUCH, TRADE_TYPES.TICK_HIGH_LOW],
        },
        'Ins & Outs': { name: 'Ins & Outs', categories: [TRADE_TYPES.END, TRADE_TYPES.STAY] },
        'Look Backs': {
            name: 'Look Backs',
            categories: [TRADE_TYPES.LB_HIGH_LOW, TRADE_TYPES.LB_PUT, TRADE_TYPES.LB_CALL],
        },
        Digits: {
            name: 'Digits',
            categories: [TRADE_TYPES.MATCH_DIFF, TRADE_TYPES.EVEN_ODD, TRADE_TYPES.OVER_UNDER],
        },
        Vanillas: { name: 'Vanillas', categories: [TRADE_TYPES.VANILLA.CALL, TRADE_TYPES.VANILLA.PUT] },
        Accumulators: { name: 'Accumulators', categories: [TRADE_TYPES.ACCUMULATOR] },
    }) as const;

export const unsupported_contract_types_list = [
    // TODO: remove these once all contract types are supported
    TRADE_TYPES.CALL_PUT_SPREAD,
    TRADE_TYPES.RUN_HIGH_LOW,
    TRADE_TYPES.RESET,
    TRADE_TYPES.ASIAN,
    TRADE_TYPES.TICK_HIGH_LOW,
    TRADE_TYPES.END,
    TRADE_TYPES.STAY,
    TRADE_TYPES.LB_CALL,
    TRADE_TYPES.LB_PUT,
    TRADE_TYPES.LB_HIGH_LOW,
] as const;

export const getCardLabels = () =>
    ({
        APPLY: localize('Apply'),
        BARRIER: localize('Barrier:'),
        BUY_PRICE: localize('Buy price:'),
        CANCEL: localize('Cancel'),
        CLOSE: localize('Close'),
        CLOSED: localize('Closed'),
        COMMISSION: localize('Commission'),
        CONTRACT_COST: localize('Contract cost:'),
        CONTRACT_VALUE: localize('Contract value:'),
        CURRENT_STAKE: localize('Current stake:'),
        DAY: localize('day'),
        DAYS: localize('days'),
        DEAL_CANCEL_FEE: localize('Deal cancel. fee:'),
        DECREMENT_VALUE: localize('Decrement value'),
        DONT_SHOW_THIS_AGAIN: localize("Don't show this again"),
        DURATION: localize('Duration'),
        ENTRY_SPOT: localize('Entry spot:'),
        GROWTH_RATE: localize('Growth rate'),
        INCREMENT_VALUE: localize('Increment value'),
        INDICATIVE_PRICE: localize('Indicative price:'),
        INITIAL_STAKE: localize('Initial stake:'),
        LOST: localize('Lost'),
        MULTIPLIER: localize('Multiplier:'),
        NOT_AVAILABLE: localize('N/A'),
        NOT_SET: localize('Not set'),
        PAYOUT: localize('Sell price:'),
        PAYOUT_PER_POINT: localize('Payout per point'),
        POTENTIAL_PAYOUT: localize('Potential payout:'),
        POTENTIAL_PROFIT_LOSS: localize('Potential profit/loss:'),
        PROFIT_LOSS: localize('Profit/Loss:'),
        PURCHASE_PRICE: localize('Buy price:'),
        REFERENCE_ID: localize('Reference ID'),
        RESALE_NOT_OFFERED: localize('Resale not offered'),
        SELL: localize('Sell'),
        STAKE: localize('Stake:'),
        STOP_LOSS: localize('Stop loss:'),
        STOP_OUT_LEVEL: localize('Stop out level'),
        STRIKE: localize('Strike:'),
        STRIKE_PRICE: localize('Strike Price'),
        TAKE_PROFIT: localize('Take profit:'),
        TAKE_PROFIT_IS_NOT_AVAILABLE: localize("Take profit can't be adjusted for ongoing accumulator contracts."),
        TAKE_PROFIT_LOSS_NOT_AVAILABLE: localize(
            'Take profit and/or stop loss are not available while deal cancellation is active.'
        ),
        TARGET: localize('Target'),
        TICK: localize('Tick'),
        TICKS: localize('Ticks'),
        TOTAL_PROFIT_LOSS: localize('Total profit/loss:'),
        WON: localize('Won'),
    }) as const;

export const getCardLabelsV2 = () =>
    ({
        APPLY: localize('Apply'),
        BARRIER: localize('Barrier'),
        HIGH_BARRIER: localize('High Barrier'),
        LOW_BARRIER: localize('Low Barrier'),
        BUY_PRICE: localize('Buy price'),
        BUY: localize('Buy'),
        CANCEL: localize('Cancel'),
        CLOSE: localize('Close'),
        CLOSED: localize('Closed'),
        COMMISSION: localize('Commission'),
        CONTRACT_COST: localize('Contract cost'),
        CONTRACT_VALUE: localize('Contract value'),
        CURRENT_STAKE: localize('Current stake'),
        DAY: localize('day'),
        DAYS: localize('days'),
        DEAL_CANCEL_FEE: localize('Deal cancellation fees'),
        DECREMENT_VALUE: localize('Decrement value'),
        DONT_SHOW_THIS_AGAIN: localize("Don't show this again"),
        DURATION: localize('Duration'),
        ENTRY_SPOT: localize('Entry spot'),
        GROWTH_RATE: localize('Growth rate'),
        INCREMENT_VALUE: localize('Increment value'),
        INDICATIVE_PRICE: localize('Indicative price'),
        INDICATIVE_HIGH_SPOT: localize('Indicative high spot'),
        INDICATIVE_LOW_SPOT: localize('Indicative low spot'),
        HIGH_SPOT: localize('High spot'),
        LOW_SPOT: localize('Low spot'),
        INITIAL_STAKE: localize('Initial stake'),
        LOST: localize('Lost'),
        MULTIPLIER: localize('Multiplier'),
        NOT_AVAILABLE: localize('N/A'),
        NOT_SET: localize('Not set'),
        PAYOUT: localize('Sell price'),
        ACTIVE: localize('active'),
        EXECUTED: localize('executed'),
        EXPIRED: localize('expired'),
        PAYOUT_PER_POINT: localize('Payout per point'),
        POTENTIAL_PAYOUT: localize('Potential payout'),
        POTENTIAL_PROFIT_LOSS: localize('Potential profit/loss'),
        PROFIT_LOSS: localize('Profit/Loss'),
        PURCHASE_PRICE: localize('Buy price'),
        REFERENCE_ID: localize('Reference ID'),
        RESALE_NOT_OFFERED: localize('Resale not offered'),
        SELL: localize('Sell'),
        STAKE: localize('Stake'),
        STOP_LOSS: localize('Stop loss'),
        STOP_OUT_LEVEL: localize('Stop out level'),
        STRIKE: localize('Strike'),
        STRIKE_PRICE: localize('Strike Price'),
        TAKE_PROFIT: localize('Take profit'),
        TAKE_PROFIT_IS_NOT_AVAILABLE: localize("Take profit can't be adjusted for ongoing accumulator contracts."),
        TAKE_PROFIT_LOSS_NOT_AVAILABLE: localize(
            'Take profit and/or stop loss are not available while deal cancellation is active.'
        ),
        TARGET: localize('Target'),
        TICK: localize('Tick'),
        TICKS: localize('Ticks'),
        TOTAL_PROFIT_LOSS: localize('Total profit/loss'),
        WON: localize('Won'),
        RESET_BARRIER: localize('Reset barrier'),
        RESET_TIME: localize('Reset time'),
        SELECTED_TICK: localize('Selected tick'),
    }) as const;

export const getMarketNamesMap = () =>
    ({
        FRXAUDCAD: 'AUD/CAD',
        FRXAUDCHF: 'AUD/CHF',
        FRXAUDJPY: 'AUD/JPY',
        FRXAUDNZD: 'AUD/NZD',
        FRXAUDPLN: 'AUD/PLN',
        FRXAUDUSD: 'AUD/USD',
        FRXBROUSD: 'Oil/USD',
        FRXEURAUD: 'EUR/AUD',
        FRXEURCAD: 'EUR/CAD',
        FRXEURCHF: 'EUR/CHF',
        FRXEURGBP: 'EUR/GBP',
        FRXEURJPY: 'EUR/JPY',
        FRXEURNZD: 'EUR/NZD',
        FRXEURUSD: 'EUR/USD',
        FRXGBPAUD: 'GBP/AUD',
        FRXGBPCAD: 'GBP/CAD',
        FRXGBPCHF: 'GBP/CHF',
        FRXGBPJPY: 'GBP/JPY',
        FRXGBPNOK: 'GBP/NOK',
        FRXGBPUSD: 'GBP/USD',
        FRXNZDJPY: 'NZD/JPY',
        FRXNZDUSD: 'NZD/USD',
        FRXUSDCAD: 'USD/CAD',
        FRXUSDCHF: 'USD/CHF',
        FRXUSDJPY: 'USD/JPY',
        FRXUSDNOK: 'USD/NOK',
        FRXUSDPLN: 'USD/PLN',
        FRXUSDSEK: 'USD/SEK',
        FRXXAGUSD: 'Silver/USD',
        FRXXAUUSD: 'Gold/USD',
        FRXXPDUSD: 'Palladium/USD',
        FRXXPTUSD: 'Platinum/USD',
        OTC_AEX: 'Netherlands 25',
        OTC_AS51: 'Australia 200',
        OTC_DJI: 'Wall Street 30',
        OTC_FCHI: 'France 40',
        OTC_FTSE: 'UK 100',
        OTC_GDAXI: 'Germany 40',
        OTC_HSI: 'Hong Kong 50',
        OTC_IBEX35: 'Spanish Index',
        OTC_N225: 'Japan 225',
        OTC_NDX: 'US Tech 100',
        OTC_SPC: 'US 500',
        OTC_SSMI: 'Swiss 20',
        OTC_SX5E: 'Euro 50',
        R_10: 'Volatility 10 Index',
        R_25: 'Volatility 25 Index',
        R_50: 'Volatility 50 Index',
        R_75: 'Volatility 75 Index',
        R_100: 'Volatility 100 Index',
        BOOM300N: 'Boom 300 Index',
        BOOM500: 'Boom 500 Index',
        BOOM600: 'Boom 600 Index',
        BOOM900: 'Boom 900 Index',
        BOOM1000: 'Boom 1000 Index',
        CRASH300N: 'Crash 300 Index',
        CRASH500: 'Crash 500 Index',
        CRASH600: 'Crash 600 Index',
        CRASH900: 'Crash 900 Index',
        CRASH1000: 'Crash 1000 Index',
        RDBEAR: 'Bear Market Index',
        RDBULL: 'Bull Market Index',
        STPRNG: 'Step 100 Index',
        STPRNG2: 'Step 200 Index',
        STPRNG3: 'Step 300 Index',
        STPRNG4: 'Step 400 Index',
        STPRNG5: 'Step 500 Index',
        WLDAUD: 'AUD Basket',
        WLDEUR: 'EUR Basket',
        WLDGBP: 'GBP Basket',
        WLDXAU: 'Gold Basket',
        WLDUSD: 'USD Basket',
        '1HZ10V': 'Volatility 10 (1s) Index',
        '1HZ15V': 'Volatility 15 (1s) Index',
        '1HZ25V': 'Volatility 25 (1s) Index',
        '1HZ30V': 'Volatility 30 (1s) Index',
        '1HZ50V': 'Volatility 50 (1s) Index',
        '1HZ75V': 'Volatility 75 (1s) Index',
        '1HZ90V': 'Volatility 90 (1s) Index',
        '1HZ100V': 'Volatility 100 (1s) Index',
        '1HZ150V': 'Volatility 150 (1s) Index',
        '1HZ200V': 'Volatility 200 (1s) Index',
        '1HZ250V': 'Volatility 250 (1s) Index',
        '1HZ300V': 'Volatility 300 (1s) Index',
        RB100: 'Range Break 100 Index',
        RB200: 'Range Break 200 Index',
        JD10: 'Jump 10 Index',
        JD25: 'Jump 25 Index',
        JD50: 'Jump 50 Index',
        JD75: 'Jump 75 Index',
        JD100: 'Jump 100 Index',
        JD150: 'Jump 150 Index',
        JD200: 'Jump 200 Index',
        CRYBCHUSD: 'BCH/USD',
        CRYBNBUSD: 'BNB/USD',
        CRYBTCLTC: 'BTC/LTC',
        CRYIOTUSD: 'IOT/USD',
        CRYNEOUSD: 'NEO/USD',
        CRYOMGUSD: 'OMG/USD',
        CRYTRXUSD: 'TRX/USD',
        CRYBTCETH: 'BTC/ETH',
        CRYZECUSD: 'ZEC/USD',
        CRYXMRUSD: 'ZMR/USD',
        CRYXMLUSD: 'XLM/USD',
        CRYXRPUSD: 'XRP/USD',
        CRYBTCUSD: 'BTC/USD',
        CRYDSHUSD: 'DSH/USD',
        CRYETHUSD: 'ETH/USD',
        CRYEOSUSD: 'EOS/USD',
        CRYLTCUSD: 'LTC/USD',
    }) as const;

export const getUnsupportedContracts = () =>
    ({
        CALLSPREAD: {
            name: localize('Spread Up'),
            position: 'top',
        },
        PUTSPREAD: {
            name: localize('Spread Down'),
            position: 'bottom',
        },
    }) as const;

/**
 * // Config to display details such as trade buttons, their positions, and names of trade types
 *
 * @param {Boolean} is_high_low
 * @returns { object }
 */
export const getSupportedContracts = (is_high_low?: boolean) =>
    ({
        [CONTRACT_TYPES.ACCUMULATOR]: {
            button_name: localize('Buy'),
            name: 'Accumulators',
            position: 'top',
        },
        [CONTRACT_TYPES.CALL]: {
            name: is_high_low ? 'Higher' : 'Rise',
            position: 'top',
        },
        [CONTRACT_TYPES.PUT]: {
            name: is_high_low ? 'Lower' : 'Fall',
            position: 'bottom',
        },
        [CONTRACT_TYPES.HIGHER]: {
            name: 'Higher',
            position: 'top',
        },
        [CONTRACT_TYPES.LOWER]: {
            name: 'Lower',
            position: 'bottom',
        },
        [CONTRACT_TYPES.CALLE]: {
            name: 'Rise',
            position: 'top',
        },
        [CONTRACT_TYPES.PUTE]: {
            name: 'Fall',
            position: 'bottom',
        },
        [CONTRACT_TYPES.MATCH_DIFF.MATCH]: {
            name: 'Matches',
            position: 'top',
        },
        [CONTRACT_TYPES.MATCH_DIFF.DIFF]: {
            name: 'Differs',
            position: 'bottom',
        },
        [CONTRACT_TYPES.EVEN_ODD.EVEN]: {
            name: 'Even',
            position: 'top',
        },
        [CONTRACT_TYPES.EVEN_ODD.ODD]: {
            name: 'Odd',
            position: 'bottom',
        },
        [CONTRACT_TYPES.OVER_UNDER.OVER]: {
            name: 'Over',
            position: 'top',
        },
        [CONTRACT_TYPES.OVER_UNDER.UNDER]: {
            name: 'Under',
            position: 'bottom',
        },
        [CONTRACT_TYPES.TOUCH.ONE_TOUCH]: {
            name: 'Touch',
            position: 'top',
        },
        [CONTRACT_TYPES.TOUCH.NO_TOUCH]: {
            name: 'No Touch',
            position: 'bottom',
        },
        [CONTRACT_TYPES.MULTIPLIER.UP]: {
            name: 'Up',
            position: 'top',
            main_title: localize('Multipliers'),
        },
        [CONTRACT_TYPES.MULTIPLIER.DOWN]: {
            name: 'Down',
            position: 'bottom',
            main_title: localize('Multipliers'),
        },
        [CONTRACT_TYPES.TURBOS.LONG]: {
            name: 'Up',
            position: 'top',
            main_title: localize('Turbos'),
        },
        [CONTRACT_TYPES.TURBOS.SHORT]: {
            name: 'Down',
            position: 'bottom',
            main_title: localize('Turbos'),
        },
        [CONTRACT_TYPES.VANILLA.CALL]: {
            name: 'Call',
            position: 'top',
            main_title: localize('Vanillas'),
        },
        [CONTRACT_TYPES.VANILLA.PUT]: {
            name: 'Put',
            position: 'bottom',
            main_title: localize('Vanillas'),
        },
        [CONTRACT_TYPES.RUN_HIGH_LOW.HIGH]: {
            name: 'Only Ups',
            position: 'top',
        },
        [CONTRACT_TYPES.RUN_HIGH_LOW.LOW]: {
            name: 'Only Downs',
            position: 'bottom',
        },
        [CONTRACT_TYPES.END.OUT]: {
            name: 'Ends Outside',
            position: 'top',
        },
        [CONTRACT_TYPES.END.IN]: {
            name: 'Ends Between',
            position: 'bottom',
        },
        [CONTRACT_TYPES.STAY.IN]: {
            name: 'Stays Between',
            position: 'top',
        },
        [CONTRACT_TYPES.STAY.OUT]: {
            name: 'Goes Outside',
            position: 'bottom',
        },
        [CONTRACT_TYPES.ASIAN.UP]: {
            name: 'Asian Up',
            position: 'top',
        },
        [CONTRACT_TYPES.ASIAN.DOWN]: {
            name: 'Asian Down',
            position: 'bottom',
        },
        [CONTRACT_TYPES.TICK_HIGH_LOW.HIGH]: {
            name: 'High Tick',
            position: 'top',
        },
        [CONTRACT_TYPES.TICK_HIGH_LOW.LOW]: {
            name: 'Low Tick',
            position: 'bottom',
        },
        [CONTRACT_TYPES.RESET.CALL]: {
            name: 'Reset Call',
            position: 'top',
        },
        [CONTRACT_TYPES.RESET.PUT]: {
            name: 'Reset Put',
            position: 'bottom',
        },
        [CONTRACT_TYPES.LB_CALL]: {
            name: 'Close-Low',
            position: 'top',
        },
        [CONTRACT_TYPES.LB_PUT]: {
            name: 'High-Close',
            position: 'top',
        },
        [CONTRACT_TYPES.LB_HIGH_LOW]: {
            name: 'High-Low',
            position: 'top',
        },
        // To add a feature flag for a new trade_type, please add 'feature_flag' to its config here:
        // SHARKFIN: {
        //     feature_flag: 'sharkfin',
        //     name: localize('Sharkfin'),
        //     position: 'top',
        // }
        // and also to DTRADER_FLAGS in FeatureFlagsStore, e.g.: sharkfin: false,
    }) as const;

export const TRADE_FEATURE_FLAGS: string[] = [];

export const getCleanedUpCategories = (categories: TTradeTypesCategories) => {
    const categories_copy: TTradeTypesCategories = cloneObject(categories);
    const hidden_trade_types = Object.entries(LocalStore.getObject('FeatureFlagsStore')?.data ?? {})
        .filter(([key, value]) => TRADE_FEATURE_FLAGS.includes(key) && !value)
        .map(([key]) => key);

    return Object.keys(categories_copy).reduce((acc, key) => {
        const category = categories_copy[key].categories?.filter(item => {
            return (
                typeof item === 'object' &&
                // hide trade types with disabled feature flag:
                hidden_trade_types?.every(hidden_type => !item.value.startsWith(hidden_type))
            );
        });
        if (category?.length === 0) {
            delete acc[key];
        } else {
            acc[key].categories = category;
        }
        return acc;
    }, categories_copy);
};

export const getContractConfig = (is_high_low?: boolean) => ({
    ...getSupportedContracts(is_high_low),
    ...getUnsupportedContracts(),
});

export const getContractTypeDisplay = (type: string, options: TContractOptions = {}) => {
    const { isHighLow = false, showButtonName = false, showMainTitle = false } = options;

    const contract_config = getContractConfig(isHighLow)[type as TGetSupportedContracts] as TContractConfig;
    if (showMainTitle) return contract_config?.main_title ?? '';
    return (showButtonName && contract_config?.button_name) || contract_config?.name || '';
};

export const getContractTypeFeatureFlag = (type: string, is_high_low = false) => {
    const contract_config = getContractConfig(is_high_low)[type as TGetSupportedContracts] as TContractConfig;
    return contract_config?.feature_flag ?? '';
};

export const getContractTypePosition = (type: TGetSupportedContracts, is_high_low = false) =>
    getContractConfig(is_high_low)?.[type]?.position || 'top';

export const isCallPut = (trade_type: 'rise_fall' | 'rise_fall_equal'): boolean =>
    trade_type === TRADE_TYPES.RISE_FALL || trade_type === TRADE_TYPES.RISE_FALL_EQUAL;
