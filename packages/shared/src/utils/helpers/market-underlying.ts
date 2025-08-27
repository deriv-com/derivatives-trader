import { localize } from '@deriv-com/translations';
import { getMarketNamesMap, getContractConfig } from '../constants/contract';
import { TContractOptions } from '../contract/contract-types';
import { isHighLow } from '../shortcode';

type TTradeConfig = {
    button_name?: JSX.Element;
    name: JSX.Element;
    position: string;
    main_title?: JSX.Element;
};

type TMarketInfo = {
    category: string;
    underlying: string;
};

export const getContractDurationType = (longcode: string, shortcode?: string): string => {
    if (shortcode && /^(MULTUP|MULTDOWN)/.test(shortcode)) return '';

    const duration_pattern = /ticks|tick|seconds|minutes|minute|hour|hours/;
    const extracted = duration_pattern.exec(longcode);
    if (extracted !== null) {
        const duration_type = extracted[0];
        const duration_text = duration_type[0].toUpperCase() + duration_type.slice(1);
        return duration_text.endsWith('s') ? duration_text : `${duration_text}s`;
    }
    return localize('Days');
};

/**
 * Fetch market information from shortcode
 * @param shortcode: string
 * @returns {{underlying: string, category: string}}
 */

// TODO: Combine with  extractInfoFromShortcode function in shared, both are currently used
export const getMarketInformation = (shortcode: string): TMarketInfo => {
    const market_info: TMarketInfo = {
        category: '',
        underlying: '',
    };

    const pattern = new RegExp(
        '^([A-Z]+)_((1HZ[0-9-V]+)|((CRASH|BOOM|STPRNG)[0-9\\d]+[A-Z]?)|(OTC_[A-Z0-9]+)|R_[\\d]{2,3}|(JD[0-9]+)|[A-Z]+)'
    );
    const extracted = pattern.exec(shortcode);
    if (extracted !== null) {
        market_info.category = extracted[1].toLowerCase();
        market_info.underlying = extracted[2];
    }

    return market_info;
};

export const getMarketName = (underlying: string) =>
    underlying ? getMarketNamesMap()[underlying.toUpperCase() as keyof typeof getMarketNamesMap] : null;

/**
 * Determines if a contract should be treated as Higher/Lower based on contract_category
 * This is more reliable than checking barriers since Rise/Fall contracts shouldn't have barriers
 * but sometimes do due to API inconsistencies
 */
export const isHigherLowerContractInfo = (contract_info: { contract_category?: string; shortcode?: string }) => {
    // Primary method: use contract_category if available
    if (contract_info.contract_category) {
        return contract_info.contract_category === 'higherLower';
    }

    // Fallback: use shortcode-based detection for backward compatibility
    return contract_info.shortcode ? isHighLow({ shortcode: contract_info.shortcode }) : false;
};

export const getTradeTypeName = (category: string, options: TContractOptions = {}) => {
    const { isHighLow = false, showButtonName = false, showMainTitle = false } = options;

    const trade_type =
        category &&
        (getContractConfig(isHighLow)[category.toUpperCase() as keyof typeof getContractConfig] as TTradeConfig);
    if (!trade_type) return null;
    if (showMainTitle) return trade_type?.main_title ?? '';
    return (showButtonName && trade_type.button_name) || trade_type.name || null;
};
