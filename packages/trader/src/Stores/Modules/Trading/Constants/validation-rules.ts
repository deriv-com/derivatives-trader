import { isHourValid, isMinuteValid, isTimeValid, toMoment, TRuleOptions } from '@deriv/shared';
import { localize } from '@deriv-com/translations';

import { TTradeStore } from 'Types';

import { isSessionAvailable } from '../Helpers/start-date';

type TValidationRules = {
    [key: string]: {
        rules?: Array<string | TRuleOptions<TTradeStore>>[];
        trigger?: string;
    };
};

const tradeSpecificBarrierCheck = (is_vanilla: boolean, input: number) => is_vanilla || input !== 0;

// Helper function to create dynamic validation messages that update with language changes
const getDynamicMessage = (messageKey: string) => () => localize(messageKey);

export const getValidationRules = (): TValidationRules => ({
    amount: {
        rules: [
            ['req', { message: getDynamicMessage('Amount is a required field.') }],
            ['number', { min: 0, type: 'float' }],
        ],
    },
    barrier_1: {
        rules: [
            [
                'req',
                {
                    condition: store => !!store.barrier_count && store.form_components.indexOf('barrier') > -1,
                    message: getDynamicMessage('Barrier is a required field.'),
                },
            ],
            ['barrier', { condition: (store: TTradeStore) => !!store.barrier_count }],
            [
                'custom',
                {
                    func: (value: TTradeStore['barrier_1'], options, store, inputs) =>
                        Number(store?.barrier_count) > 1 ? +value > Number(inputs?.barrier_2) : true,
                    message: getDynamicMessage('Higher barrier must be higher than lower barrier.'),
                },
            ],
            [
                'custom',
                {
                    func: (value: TTradeStore['barrier_1'], options, store, inputs) =>
                        /^[+-]/.test(inputs?.barrier_1 ?? '')
                            ? tradeSpecificBarrierCheck(!!store?.is_vanilla, Number(inputs?.barrier_1))
                            : true,
                    message: getDynamicMessage('Barrier cannot be zero.'),
                },
            ],
        ],
        trigger: 'barrier_2',
    },
    barrier_2: {
        rules: [
            [
                'req',
                {
                    condition: store => store.barrier_count > 1 && store.form_components.indexOf('barrier') > -1,
                    message: getDynamicMessage('Barrier is a required field.'),
                },
            ],
            ['barrier', { condition: (store: TTradeStore) => !!store.barrier_count }],
            [
                'custom',
                {
                    func: (value: TTradeStore['barrier_2'], options, store, inputs) =>
                        (/^[+-]/g.test(inputs?.barrier_1 ?? '') && /^[+-]/g.test(value)) ||
                        (/^(?![+-])/g.test(inputs?.barrier_1 ?? '') && /^(?![+-])/g.test(value)),
                    message: getDynamicMessage('Both barriers should be relative or absolute'),
                },
            ],
            [
                'custom',
                {
                    func: (value: TTradeStore['barrier_2'], options, store, inputs) =>
                        Number(inputs?.barrier_1) > +value,
                    message: getDynamicMessage('Lower barrier must be lower than higher barrier.'),
                },
            ],
        ],
        trigger: 'barrier_1',
    },
    duration: {
        rules: [['req', { message: getDynamicMessage('Duration is a required field.') }]],
    },
    start_date: {
        trigger: 'start_time',
    },
    expiry_date: {
        trigger: 'expiry_time',
    },
    start_time: {
        rules: [
            [
                'custom',
                {
                    func: (value: TTradeStore['start_time'], options, store) => !value || isTimeValid(value),
                    message: getDynamicMessage('Please enter the start time in the format "HH:MM".'),
                },
            ],
            [
                'custom',
                {
                    func: (value: TTradeStore['start_time'], options, store) => !value || isHourValid(value),
                    message: getDynamicMessage('Hour must be between 0 and 23.'),
                },
            ],
            [
                'custom',
                {
                    func: (value: TTradeStore['start_time'], options, store) => !value || isMinuteValid(value),
                    message: getDynamicMessage('Minute must be between 0 and 59.'),
                },
            ],
            [
                'custom',
                {
                    func: (value: TTradeStore['start_time'], options, store) => {
                        return true; // Always valid since all contracts now default to spot behavior
                    },
                    message: getDynamicMessage('Start time cannot be in the past.'),
                },
            ],
        ],
    },
    expiry_time: {
        rules: [
            [
                'custom',
                {
                    func: (value: TTradeStore['expiry_time'], options, store) => !value || isTimeValid(value),
                    message: getDynamicMessage('Please enter the expiry time in the format "HH:MM".'),
                },
            ],
            [
                'custom',
                {
                    func: (value: TTradeStore['expiry_time'], options, store) => !value || isHourValid(value),
                    message: getDynamicMessage('Hour must be between 0 and 23.'),
                },
            ],
            [
                'custom',
                {
                    func: (value: TTradeStore['expiry_time'], options, store) => !value || isMinuteValid(value),
                    message: getDynamicMessage('Minute must be between 0 and 59.'),
                },
            ],
            [
                'custom',
                {
                    func: (value: TTradeStore['expiry_time'], options, store) => {
                        return true; // Always valid since all contracts now default to spot behavior
                    },
                    message: getDynamicMessage('Expiry time cannot be in the past.'),
                },
            ],
        ],
    },
    ...getMultiplierValidationRules(),
});

export const getMultiplierValidationRules = () => ({
    stop_loss: {
        rules: [
            [
                'req',
                {
                    condition: (store: TTradeStore) => store.has_stop_loss && !store.stop_loss,
                    message: getDynamicMessage('Please enter a stop loss amount.'),
                },
            ],
        ],
    },
    take_profit: {
        rules: [
            [
                'req',
                {
                    condition: (store: TTradeStore) => store.has_take_profit && !store.take_profit,
                    message: getDynamicMessage('Please enter a take profit amount.'),
                },
            ],
        ],
    },
});
