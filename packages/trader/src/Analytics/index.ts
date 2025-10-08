import { cacheTrackEvents, trackAnalyticsEvent, getMarketName, getTradeTypeName } from '@deriv/shared';

// Legacy analytics functions - kept for backward compatibility and tests

export const sendMarketTypeToAnalytics = (market_name: string, trade_name: string) => {
    cacheTrackEvents.loadEvent([
        {
            event: {
                name: 'ce_dtrader_trade_form',
                properties: {
                    action: 'select_market_type',
                    market_name,
                    trade_name,
                },
            },
        },
    ]);
};

export const sendDtraderPurchaseToAnalytics = (
    trade_name: string,
    market_name: string,
    contract_id: number,
    client?: { is_logged_in: boolean; is_virtual: boolean }
) => {
    // Convert raw technical values to user-friendly display names
    const trade_type_name = getTradeTypeName(trade_name, { showMainTitle: true }) || trade_name;
    const market_type_name = getMarketName(market_name) || market_name;
    const contract_type = getTradeTypeName(trade_name) || '';

    if (client) {
        trackAnalyticsEvent('ce_contracts_set_up_form_v2', client, {
            action: 'run_contract',
            trade_type_name,
            market_type_name,
            contract_id,
            contract_type,
        });
    } else {
        // Fallback for when client is not provided
        cacheTrackEvents.loadEvent([
            {
                event: {
                    name: 'ce_contracts_set_up_form_v2',
                    properties: {
                        action: 'run_contract',
                        trade_type_name,
                        market_type_name,
                        contract_id,
                        contract_type,
                    },
                },
            },
        ]);
    }
};
