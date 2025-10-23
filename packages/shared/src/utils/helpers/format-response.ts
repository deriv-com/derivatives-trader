import { TProfitTableResponse, TStatementResponse } from '@deriv/api';

import { getContractTypeFeatureFlag } from '../constants';
import { TContractInfo } from '../contract';
import { extractInfoFromShortcode, isHighLow } from '../shortcode';
import { LocalStore } from '../storage';

import { getSymbolDisplayName } from './active-symbols';
import { getMarketInformation } from './market-underlying';

export const filterDisabledPositions = (
    position:
        | TContractInfo
        | NonNullable<NonNullable<TStatementResponse['statement']>['transactions']>[number]
        | NonNullable<NonNullable<TProfitTableResponse['profit_table']>['transactions']>[number]
) => {
    const { contract_type, shortcode } = position as TContractInfo;
    const type = contract_type ?? extractInfoFromShortcode(shortcode ?? '').category?.toUpperCase() ?? '';
    return Object.entries(LocalStore.getObject('FeatureFlagsStore')?.data ?? {}).every(
        ([key, value]) => !!value || key !== getContractTypeFeatureFlag(type, isHighLow({ shortcode }))
    );
};

export const formatPortfolioPosition = (portfolio_pos: TContractInfo, indicative?: number) => {
    const purchase = portfolio_pos.buy_price;
    const payout = portfolio_pos.payout;
    const display_name = getSymbolDisplayName(getMarketInformation(portfolio_pos.shortcode || '').underlying);
    const transaction_id =
        portfolio_pos.transaction_id || (portfolio_pos.transaction_ids && portfolio_pos.transaction_ids.buy);

    return {
        contract_info: portfolio_pos,
        details: portfolio_pos.longcode?.replace(/\n/g, '<br />'),
        display_name,
        id: portfolio_pos.contract_id,
        indicative: (indicative && isNaN(indicative)) || !indicative ? 0 : indicative,
        payout,
        purchase,
        reference: Number(transaction_id),
        type: portfolio_pos.contract_type,
        contract_update: portfolio_pos.limit_order,
    };
};
