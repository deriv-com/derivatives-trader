import moment from 'moment';
import { isEmptyObject } from '../object';
import { isAccumulatorContract, isOpen, isUserSold } from '../contract';
import { TContractInfo, TContractStore } from '../contract/contract-types';
import { TickSpotData, WebsiteStatus, AccountListResponse } from '@deriv/api-types';
import { getSupportedContracts } from '../constants/contract';

type TIsSoldBeforeStart = Required<Pick<TContractInfo, 'sell_time' | 'date_start'>>;

export const isContractElapsed = (contract_info: TContractInfo, tick?: null | TickSpotData) => {
    if (isEmptyObject(tick) || isEmptyObject(contract_info)) return false;
    const end_time = getEndTime(contract_info) || 0;
    if (end_time && tick && tick.epoch) {
        const seconds = moment.duration(moment.unix(tick.epoch).diff(moment.unix(end_time))).asSeconds();
        return seconds >= 2;
    }
    return false;
};

export const isEndedBeforeCancellationExpired = (contract_info: TContractInfo) => {
    const end_time = getEndTime(contract_info) || 0;
    return !!(contract_info.cancellation?.date_expiry && end_time < contract_info.cancellation.date_expiry);
};

export const hasContractStarted = (contract_info?: TContractInfo) =>
    Number(contract_info?.current_spot_time) > Number(contract_info?.date_start);

export const isUserCancelled = (contract_info: TContractInfo) => contract_info.status === 'cancelled';

export const getEndTime = (contract_info: TContractInfo) => {
    const {
        contract_type,
        // @ts-expect-error - exit_spot_time exists in runtime but not in type definition
        exit_spot_time,
        date_expiry,
        is_expired,
        is_path_dependent,
        sell_time,
        tick_count: is_tick_contract,
    } = contract_info;

    // Handle type coercion for API response properties that might be strings or numbers
    // Convert truthy values (1, '1', true) to boolean true, everything else to false
    const normalizedIsExpired = Boolean(is_expired && (is_expired === 1 || is_expired === '1' || is_expired === true));
    const normalizedIsPathDependent = Boolean(
        is_path_dependent && (is_path_dependent === 1 || is_path_dependent === '1' || is_path_dependent === true)
    );

    const is_open = isOpen(contract_info);
    const is_user_sold = isUserSold(contract_info);
    const is_user_cancelled = isUserCancelled(contract_info);
    const is_accumulator = isAccumulatorContract(contract_type);
    const is_finished = !is_open && (normalizedIsExpired || is_accumulator);

    // For open contracts that are not sold or cancelled, return undefined (active)
    if (!is_finished && !is_user_sold && !is_user_cancelled) {
        return undefined;
    }

    // Handle user sold contracts
    if (is_user_sold && sell_time) {
        const result = sell_time > Number(date_expiry) ? date_expiry : sell_time;
        return result;
    } else if (!is_tick_contract && sell_time && sell_time > Number(date_expiry)) {
        return date_expiry;
    }

    // Final fallback for closed contracts
    const result =
        Number(date_expiry) > Number(exit_spot_time) && !normalizedIsPathDependent ? date_expiry : exit_spot_time;
    return result;
};

export const getBuyPrice = (contract_store: TContractStore) => {
    return contract_store.contract_info.buy_price;
};

/**
 * Checks if the server is currently down or updating.
 *
 * @param {WebsiteStatusResponse} response - The response object containing the status of the website.
 * @returns {boolean} True if the website status is 'down' or 'updating', false otherwise.
 */
export const checkServerMaintenance = (website_status: WebsiteStatus | undefined | null) => {
    const { site_status = '' } = website_status || {};
    return site_status === 'down' || site_status === 'updating';
};

export const isContractSupportedAndStarted = (symbol: string, contract_info?: TContractInfo) => {
    if (!contract_info) return false;

    // Backward compatibility: fallback to old field name
    // @ts-expect-error - underlying_symbol exists in runtime but not in type definition
    const contract_underlying = contract_info.underlying_symbol || contract_info.underlying;

    return (
        symbol === contract_underlying &&
        //Added check for unsupported and forward starting contracts, which have not started yet
        !!getSupportedContracts()[contract_info?.contract_type as keyof ReturnType<typeof getSupportedContracts>] &&
        hasContractStarted(contract_info)
    );
};
