import {
    getContractStatus,
    getDecimalPlaces,
    getEndTime,
    isAccumulatorContract,
    isAccumulatorContractOpen,
    isDigitContract,
    isMultiplierContract,
    isOpen,
    isSmartTraderContract,
    isTicksContract,
    unique,
} from '@deriv/shared';
import { localize } from '@deriv-com/translations';

import { MARKER_TYPES_CONFIG } from '../Constants/markers';

import {
    createMarkerEndTime,
    createMarkerPurchaseTime,
    createMarkerResetTime,
    createMarkerSpotEntry,
    createMarkerSpotExit,
    createMarkerSpotMiddle,
    createMarkerStartTime,
    getSpotCount,
} from './chart-marker-helpers';
import { getChartType } from './logic';

export const createChartMarkers = (contract_info, is_delayed_markers_update) => {
    const { tick_stream } = contract_info;
    const should_show_10_last_ticks = isAccumulatorContractOpen(contract_info) && tick_stream.length === 10;

    let markers = [];
    if (contract_info) {
        const end_time = getEndTime(contract_info);
        const chart_type = getChartType(contract_info.date_start, end_time);

        if (contract_info.tick_count) {
            const tick_markers = createTickMarkers(contract_info, is_delayed_markers_update);
            markers.push(...tick_markers);
        } else if (chart_type !== 'candles') {
            const spot_markers = Object.keys(marker_spots).map(type => marker_spots[type](contract_info));
            markers.push(...spot_markers);
        }
        if (!should_show_10_last_ticks) {
            // don't draw start/end lines if only 10 last ticks are displayed
            const line_markers = Object.keys(marker_lines).map(type => marker_lines[type](contract_info));
            markers.push(...line_markers);
        }
        markers = markers.filter(m => !!m);
    }
    markers.forEach(marker => {
        const contract_id = contract_info.contract_id;
        marker.react_key = `${contract_id}-${marker.type}`;
    });

    return markers;
};

const marker_spots = {
    [MARKER_TYPES_CONFIG.SPOT_ENTRY.type]: createMarkerSpotEntry,
    [MARKER_TYPES_CONFIG.SPOT_EXIT.type]: createMarkerSpotExit,
};

const marker_lines = {
    [MARKER_TYPES_CONFIG.LINE_START.type]: createMarkerStartTime,
    [MARKER_TYPES_CONFIG.LINE_RESET.type]: createMarkerResetTime,
    [MARKER_TYPES_CONFIG.LINE_END.type]: createMarkerEndTime,
    [MARKER_TYPES_CONFIG.LINE_PURCHASE.type]: createMarkerPurchaseTime,
};

const addLabelAlignment = (tick, idx, arr) => {
    if (idx > 0 && arr.length) {
        const prev_tick = arr[idx - 1];

        if (+tick > +prev_tick.tick) tick.align_label = 'top';
        if (+tick.tick < +prev_tick.tick) tick.align_label = 'bottom';
        if (+tick.tick === +prev_tick.tick) tick.align_label = prev_tick.align_label;
    }

    return tick;
};

export const createTickMarkers = (contract_info, is_delayed_markers_update) => {
    const is_accumulator = isAccumulatorContract(contract_info.contract_type);
    const is_smarttrader_contract = isSmartTraderContract(contract_info.contract_type);
    const is_ticks_contract = isTicksContract(contract_info.contract_type);
    const is_accu_contract_closed = is_accumulator && !isOpen(contract_info);
    const available_ticks = (is_accumulator && contract_info.audit_details?.all_ticks) || contract_info.tick_stream;
    const tick_stream = unique(available_ticks, 'epoch').map(addLabelAlignment);
    const result = [];

    if (is_accu_contract_closed) {
        const { tick_stream: ticks } = contract_info || {};
        const exit_spot_time = contract_info.exit_spot_time;
        if (exit_spot_time && tick_stream.every(({ epoch }) => epoch !== exit_spot_time)) {
            // sometimes exit_spot is present in tick_stream but missing from audit_details
            tick_stream.push(ticks[ticks.length - 1]);
        }
        const exit_spot_count = tick_stream.findIndex(({ epoch }) => epoch === exit_spot_time) + 1;
        tick_stream.length = exit_spot_count > 0 ? exit_spot_count : tick_stream.length;
    }

    tick_stream.forEach((tick, idx) => {
        const entry_spot_time = contract_info.entry_spot_time;
        const exit_spot_time = contract_info.exit_spot_time;

        const isEntrySpot = _tick => +_tick.epoch === entry_spot_time;
        const is_entry_spot = +tick.epoch !== exit_spot_time && (is_accumulator ? isEntrySpot(tick) : idx === 0);
        // accumulators entry spot will be missing from tick_stream when contract is lasting for longer than 10 ticks
        const entry_spot_index = is_accumulator ? tick_stream.findIndex(isEntrySpot) : 0;
        const is_middle_spot = idx > entry_spot_index && +tick.epoch !== +exit_spot_time;
        const is_selected_tick = is_ticks_contract && idx + 1 === contract_info.selected_tick;
        const isExitSpot = (_tick, _idx) =>
            +_tick.epoch === +exit_spot_time || getSpotCount(contract_info, _idx) === contract_info.tick_count;
        const is_exit_spot = isExitSpot(tick, idx);
        const is_current_last_spot = idx === tick_stream.length - 1;
        const exit_spot_index = tick_stream.findIndex(isExitSpot);
        const is_accu_current_last_spot = is_accumulator && !is_exit_spot && is_current_last_spot;
        const is_accu_preexit_spot =
            is_accumulator && (is_accu_contract_closed ? idx === exit_spot_index - 1 : idx === tick_stream.length - 2);

        let marker_config;
        if (is_entry_spot) {
            marker_config = createMarkerSpotEntry(contract_info);
        } else if (is_middle_spot) {
            marker_config = createMarkerSpotMiddle(contract_info, tick, idx);
        } else if (is_exit_spot && !is_accu_current_last_spot) {
            tick.align_label = 'top'; // force exit spot label to be 'top' to avoid overlapping
            marker_config = createMarkerSpotExit(contract_info, tick, idx);
        }

        if (is_selected_tick && is_smarttrader_contract) {
            marker_config = createMarkerSpotMiddle(contract_info, tick, idx);
        }

        const spot_className = marker_config && marker_config.content_config.spot_className;

        if (is_smarttrader_contract && is_middle_spot && !is_selected_tick) {
            marker_config &&
                (marker_config.content_config.spot_className = `${spot_className} ${spot_className}--smarttrader-contract-middle`);

            if (!is_current_last_spot) {
                marker_config.content_config.is_value_hidden = true;
            }
        }
        if (is_selected_tick) {
            marker_config.content_config.spot_className = `${spot_className} chart-spot__spot--${contract_info.status}`;
        }
        if (is_accumulator) {
            if ((is_accu_current_last_spot || is_exit_spot) && !is_accu_contract_closed) return;
            if (marker_config && (is_middle_spot || is_exit_spot)) {
                const should_highlight_previous_spot =
                    is_accu_preexit_spot && (!is_delayed_markers_update || is_accu_contract_closed);
                const spot_className = marker_config.content_config.spot_className;
                marker_config.content_config.spot_className = `${spot_className} ${spot_className}--accumulator${
                    is_exit_spot ? '-exit' : `-middle${should_highlight_previous_spot ? '--preexit' : ''}`
                }`;
            }
        }
        if (marker_config) {
            result.push(marker_config);
        }
    });
    return result;
};

const dark_theme = {
    bg: '#181c25',
    fg: '#ffffff',
    grey_border: '#6e6e6e',
    lost: '#e6190e',
    open: '#2c9aff',
    sold: '#ffad3a',
    won: '#008832',
};

const light_theme = {
    bg: '#ffffff',
    fg: '#333333',
    grey_border: '#999999',
    lost: '#ec3f3f',
    open: '#2c9aff',
    sold: '#ffad3a',
    won: '#008832',
};

function getColor({ status, profit, is_dark_theme, is_vanilla }) {
    const colors = is_dark_theme ? dark_theme : light_theme;
    let color = colors[status || 'open'];
    if (is_vanilla) {
        if (status === 'open') return colors.open;
        return colors[profit > 0 ? 'won' : 'lost'];
    }
    if (status === 'open' && profit) {
        color = colors[profit > 0 ? 'won' : 'lost'];
    }
    return color;
}

const currency_symbols = {
    AUD: '\u0041\u0024',
    EUR: '\u20AC',
    GBP: '\u00A3',
    JPY: '\u00A5',
    USD: '\u0024',
    BTC: '\u20bf',
    BCH: '\ue901',
    ETH: '\u0045',
    ETC: '\ue900',
    LTC: '\u0141',
    UST: '\u20ae',
};

export const getMarkerContractType = contract_info => {
    const { tick_count, contract_type } = contract_info;

    if (isAccumulatorContract(contract_type)) {
        return 'AccumulatorContract';
    }

    return tick_count > 0 ? 'TickContract' : 'NonTickContract';
};

/**
 * Returns the direction ("up" or "down") based on contract type
 * @param {string} contract_type - The contract type string
 * @returns {string} - "up" or "down"
 */
export const getMarkerDirection = contract_type => {
    if (!contract_type || typeof contract_type !== 'string') {
        return 'up'; // default fallback
    }

    const type = contract_type.toUpperCase();

    // UP direction contracts
    const upContracts = [
        'CALL',
        'CALLE',
        'RISE',
        'HIGHER',
        'ASIANU',
        'MULTUP',
        'TURBOSLONG',
        'VANILLALONGCALL',
        'LBFLOATCALL',
        'RESETCALL',
        'RUNHIGH',
        'TICKHIGH',
        'ONETOUCH',
        'CALLSPREAD',
        'CALL_BARRIER',
        'DIGITOVER',
        'DIGITMATCH',
        'DIGITEVEN',
    ];

    // DOWN direction contracts
    const downContracts = [
        'PUT',
        'PUTE',
        'FALL',
        'LOWER',
        'ASIAND',
        'MULTDOWN',
        'TURBOSSHORT',
        'VANILLALONGPUT',
        'LBFLOATPUT',
        'RESETPUT',
        'RUNLOW',
        'TICKLOW',
        'NOTOUCH',
        'PUTSPREAD',
        'PUT_BARRIER',
        'DIGITODD',
        'DIGITUNDER',
        'DIGITDIFF',
    ];

    // Check for exact matches first
    if (upContracts.includes(type)) {
        return 'up';
    }

    if (downContracts.includes(type)) {
        return 'down';
    }

    // Check for partial matches for complex contract types
    if (
        type.includes('CALL') ||
        type.includes('RISE') ||
        type.includes('HIGHER') ||
        type.includes('UP') ||
        type.includes('HIGH') ||
        type.includes('LONG')
    ) {
        return 'up';
    }

    if (
        type.includes('PUT') ||
        type.includes('FALL') ||
        type.includes('LOWER') ||
        type.includes('DOWN') ||
        type.includes('LOW') ||
        type.includes('SHORT')
    ) {
        return 'down';
    }

    // Default fallback for neutral contracts (ACCU, digits, etc.)
    return 'up';
};

export const getStartText = contract_info => {
    const { barrier, contract_type, currency, is_sold, profit, tick_count, tick_stream } = contract_info;
    const is_non_tick_contract = !tick_count;

    if (is_sold || isAccumulatorContract(contract_type)) return undefined;

    // NonTickContract
    if (is_non_tick_contract) {
        if (!(profit && barrier)) return undefined;

        const symbol = currency_symbols[currency] || '';
        const decimal_places = getDecimalPlaces(currency);
        const sign = profit < 0 ? '-' : profit > 0 ? '+' : ' ';
        return `${sign}${symbol}${Math.abs(profit).toFixed(decimal_places)}`;
    }

    return `${Math.max(tick_stream.length - 1, 0)}/${tick_count}`;
};

export const getTickStreamMarkers = (contract_info, barrier_price) => {
    const { contract_type, tick_stream } = contract_info;
    const is_digit_contract = isDigitContract(contract_type);
    const is_accumulator_contract = isAccumulatorContract(contract_type);

    const last_tick = tick_stream.length > 1 ? tick_stream[tick_stream.length - 1] : null;
    const markers = [];

    if (!is_digit_contract && !is_accumulator_contract && last_tick) {
        markers.push({
            epoch: last_tick.epoch,
            quote: last_tick.quote,
            type: 'latestTick',
        });
        markers.push({
            epoch: last_tick.epoch,
            quote: barrier_price,
            type: 'latestTickBarrier',
        });
    }

    return markers;
};

// eslint-disable-next-line no-unused-vars
export function calculateMarker(
    contract_info,
    is_dark_theme,
    is_last_contract,
    is_mobile = false,
    is_resize_desktop = false
) {
    if (!contract_info) {
        return null;
    }
    const {
        transaction_ids,
        tick_stream,
        date_start,
        date_expiry,
        entry_tick,
        entry_spot_time: entry_spot_time_field,
        exit_spot_time: exit_spot_time_field,
        contract_type,
        tick_count,
        barrier_count,
        barrier,
        high_barrier,
        low_barrier,
    } = contract_info;

    // Backward compatibility: use new property names with fallback to old ones
    const entry_spot = contract_info.entry_spot ?? entry_tick;
    const is_accumulator_contract = isAccumulatorContract(contract_type);
    const is_digit_contract = isDigitContract(contract_type);
    const is_multiplier_contract = isMultiplierContract(contract_type);
    const is_tick_contract = tick_count > 0;

    const entry_spot_time = entry_spot_time_field;
    const exit_spot_time = exit_spot_time_field;

    let end_time = is_tick_contract ? date_expiry : getEndTime(contract_info) || date_expiry;
    if (is_accumulator_contract || is_multiplier_contract) {
        end_time = exit_spot_time;
    }

    let barrier_price;
    if (is_digit_contract || is_accumulator_contract || is_multiplier_contract) {
        barrier_price = +entry_spot;
    } else if (+barrier_count === 1 && barrier) {
        barrier_price = +barrier;
    } else if (+barrier_count === 2 && high_barrier && low_barrier) {
        barrier_price = +high_barrier;
    }

    if (!date_start) {
        return null;
    }
    // if we have not yet received the first POC response
    if (!transaction_ids) {
        return {
            type: getMarkerContractType(contract_info),
            markers: [],
        };
    }

    const markers = [];

    const price = barrier_price || 0;

    const is_contract_finished = contract_info.is_sold || contract_info.is_expired;
    const exit_spot = contract_info.exit_spot;

    if (is_contract_finished) {
        if (!is_accumulator_contract) {
            if (entry_spot) {
                markers.push({
                    epoch: entry_spot_time,
                    quote: entry_spot,
                    type: 'entrySpot',
                    direction: getMarkerDirection(contract_type),
                });
            }

            if (date_start) {
                markers.push({
                    epoch: date_start,
                    quote: price,
                    type: 'startTimeCollapsed',
                    direction: getMarkerDirection(contract_type),
                });
            }
        }
        if (end_time) {
            markers.push({
                epoch: end_time,
                quote: price,
                type: 'exitTimeCollapsed',
                direction: getMarkerDirection(contract_type),
            });
        }
        if (exit_spot_time && exit_spot) {
            markers.push({
                epoch: exit_spot_time,
                quote: exit_spot,
                type: 'exitSpot',
                direction: getMarkerDirection(contract_type),
            });
        }

        //Add profit and loss label marker when contract is finished (sold or expired)
        markers.push({
            epoch: exit_spot_time,
            quote: is_accumulator_contract ? exit_spot : price,
            type: 'profitAndLossLabel',
            direction: getMarkerDirection(contract_type),
        });
    } else if (!is_accumulator_contract) {
        if (date_start && entry_spot) {
            markers.push({
                epoch: date_start,
                quote: price,
                type: 'startTimeCollapsed',
                direction: getMarkerDirection(contract_type),
            });
        } else if (date_start && !entry_spot) {
            markers.push({
                epoch: date_start,
                quote: price,
                type: 'startTime',
                direction: getMarkerDirection(contract_type),
            });
        }

        if (entry_spot) {
            markers.push({
                epoch: entry_spot_time,
                quote: entry_spot,
                type: 'entrySpot',
                direction: getMarkerDirection(contract_type),
            });
            markers.push({
                epoch: date_start,
                quote: price,
                type: 'contractMarker',
                text: `${localize('Start')}\n${localize('Time')}`,
                direction: getMarkerDirection(contract_type),
            });
        }

        if (exit_spot) {
            markers.push({
                epoch: exit_spot_time,
                quote: exit_spot,
                type: 'exitSpot',
                direction: getMarkerDirection(contract_type),
            });
        }

        if (end_time && entry_spot) {
            markers.push({
                epoch: end_time,
                quote: price,
                type: 'exitTimeCollapsed',
                direction: getMarkerDirection(contract_type),
            });
        } else if (end_time && !entry_spot) {
            markers.push({
                epoch: end_time,
                quote: price,
                type: 'exitTime',
                direction: getMarkerDirection(contract_type),
            });
        }
    }

    if (tick_stream?.length > 0) {
        markers.push(...getTickStreamMarkers(contract_info, barrier_price));
    }

    if (is_accumulator_contract && tick_stream?.length > 0) {
        const contract_status = getContractStatus(contract_info);
        const is_accu_contract_ended = contract_status !== 'open';

        if (is_accu_contract_ended) {
            const exit = tick_stream[tick_stream.length - 1];
            const previous_tick = tick_stream[tick_stream.length - 2] || exit;

            markers.push(
                ...getAccumulatorBarrierMarkers({
                    high_barrier,
                    low_barrier,
                    prev_epoch: previous_tick.epoch,
                    is_dark_mode_on: is_dark_theme,
                    contract_info,
                })
            );
        }
    }

    let contractMarkerLeftPadding = is_mobile ? 10 : 80;

    if (is_resize_desktop && !is_mobile) {
        contractMarkerLeftPadding = 330;
    }

    // Helper to normalize profit value to a number or null
    const getNumericProfit = profit => {
        if (profit === undefined || profit === null) return null;
        const profit_num = Number(profit);
        return isNaN(profit_num) ? null : profit_num;
    };

    // Calculate dynamic profit/loss text
    const getProfitAndLossText = () => {
        const { profit, currency } = contract_info;
        const profit_num = getNumericProfit(profit);
        if (profit_num === null) return null;

        const decimal_places = getDecimalPlaces(currency);
        const sign = profit_num > 0 ? '+' : '';

        return `${sign}${profit_num.toFixed(decimal_places)} ${currency}`;
    };

    const profit_num = getNumericProfit(contract_info.profit);

    const result = {
        type: getMarkerContractType(contract_info),
        markers,
        props: {
            isProfit: profit_num !== null ? profit_num > 0 : true,
            isRunning: !contract_info?.is_expired,
            contractMarkerLeftPadding,
            markerLabel: getContractTypeLabel(contract_info),
        },
        direction: getMarkerDirection(contract_type),
        profitAndLossText: getProfitAndLossText(),
        currentEpoch: contract_info.current_spot_time,
    };
    return result;
}

/**
 * Returns the first letter of the contract label based on contract type
 * Touch contracts are categorized as Touch/No Touch
 * @param {object} contract_info - The contract information object
 * @returns {string} - The first letter of the label, or null if no match
 */
export const getContractTypeLabel = contract_info => {
    if (!contract_info || typeof contract_info !== 'object') {
        return null;
    }

    const { contract_type } = contract_info;
    if (!contract_type || typeof contract_type !== 'string') {
        return null;
    }
    const type = contract_type.toUpperCase();

    // Touch contracts - Touch/No Touch category
    const touchContracts = {
        ONETOUCH: 'T', // Touch
        NOTOUCH: 'NT', // No Touch
    };

    // Digit contracts
    const digitContracts = {
        DIGITEVEN: 'E', // Even
        DIGITODD: 'O', // Odd
        DIGITMATCH: `${contract_info.barrier}`, // Matches
        DIGITDIFF: `${contract_info.barrier}`, // Differs
        DIGITOVER: `${contract_info.barrier}`, // Over
        DIGITUNDER: `${contract_info.barrier}`, // Under
    };

    // Accumulator contracts
    const accumulatorContracts = {
        ACCU: `${contract_info.growth_rate * 100}%`, // Accumulators
    };

    // Combine all contract mappings
    const allContracts = {
        ...touchContracts,
        ...digitContracts,
        ...accumulatorContracts,
    };

    // Only return label if there's an exact match, otherwise return null
    return allContracts[type] || null;
};

function getAccumulatorBarrierMarkers({
    contract_info,
    high_barrier,
    low_barrier,
    is_accumulator_trade_without_contract = false,
    is_dark_theme,
    has_crossed_accu_barriers,
    barrier_spot_distance,
    prev_epoch: epoch,
}) {
    const { profit, is_sold } = contract_info || {};

    const contract_status = getContractStatus(contract_info || {});
    const is_accu_contract_ended = contract_status !== 'open';

    const getStatus = () => {
        if (has_crossed_accu_barriers || contract_status === 'lost') {
            return 'lost';
        } else if (is_accumulator_trade_without_contract) {
            return 'open';
        }

        return 'won';
    };

    const barrier_color = getColor({
        status: getStatus(),
        is_dark_theme,
    });

    const tick_color = is_accumulator_trade_without_contract
        ? getColor({ status: 'fg', is_dark_theme })
        : getColor({
              is_dark_theme,
              status: contract_status,
              profit: is_sold || is_accu_contract_ended ? profit : null,
          });

    const markers = [
        {
            epoch,
            quote: +high_barrier,
            type: 'highBarrier',
            color: barrier_color,
            text: barrier_spot_distance ? `+${barrier_spot_distance}` : '',
        },
        {
            epoch,
            quote: +low_barrier,
            type: 'lowBarrier',
            color: barrier_color,
            text: barrier_spot_distance ? `-${barrier_spot_distance}` : '',
        },
        {
            epoch,
            type: 'previousTick',
            color: tick_color,
        },
    ];

    return markers;
}

export function getAccumulatorMarkers({
    prev_epoch,
    high_barrier,
    low_barrier,
    is_accumulator_trade_without_contract = false,
    has_crossed_accu_barriers = false,
    is_dark_theme,
    contract_info,
    in_contract_details = false,
    barrier_spot_distance,
}) {
    const markers = getAccumulatorBarrierMarkers({
        contract_info,
        high_barrier,
        low_barrier,
        is_accumulator_trade_without_contract,
        is_dark_theme,
        has_crossed_accu_barriers,
        barrier_spot_distance,
        prev_epoch,
    });

    return {
        type: 'AccumulatorContract',
        markers,
        props: {
            hasPersistentBorders: in_contract_details,
        },
    };
}
