import React from 'react';

import { TPriceProposalRequest, useQuery } from '@deriv/api';

import { getProposalRequestObject } from 'AppV2/Utils/trade-params-utils';
import { useTraderStore } from 'Stores/useTraderStores';

type TNewValues = {
    amount?: string | number;
    payout_per_point?: string | number;
    barrier_1?: string | number;
    has_take_profit?: boolean;
    has_stop_loss?: boolean;
    take_profit?: string | number;
    stop_loss?: string | number;
};

export const useProposal = ({
    trade_store,
    proposal_request_values,
    contract_type,
    is_enabled,
    should_skip_validation,
}: {
    trade_store: ReturnType<typeof useTraderStore>;
    proposal_request_values: TNewValues;
    contract_type: string;
    is_enabled?: boolean;
    should_skip_validation?: 'take_profit' | 'stop_loss';
}) => {
    const proposal_request = React.useMemo(() => {
        const request = getProposalRequestObject({
            new_values: proposal_request_values,
            trade_store,
            trade_type: contract_type,
        });

        // We need to exclude tp in case if validating sl and vice versa to validate them independently
        if (should_skip_validation === 'take_profit' && request.limit_order?.take_profit) {
            delete request.limit_order.take_profit;
        }
        if (should_skip_validation === 'stop_loss' && request.limit_order?.stop_loss) {
            delete request.limit_order.stop_loss;
        }

        return request;
    }, [proposal_request_values, trade_store, contract_type, should_skip_validation]);

    return useQuery('proposal', {
        payload: proposal_request as TPriceProposalRequest,
        options: {
            enabled: is_enabled,
            cacheTime: 0,
            retry: false,
        },
    });
};
