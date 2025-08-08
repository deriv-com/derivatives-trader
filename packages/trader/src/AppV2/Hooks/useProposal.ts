import { useQuery } from '@deriv/api';
import { getProposalRequestObject } from 'AppV2/Utils/trade-params-utils';
import { useTraderStore } from 'Stores/useTraderStores';

type TUseProposalOptions = {
    enabled?: boolean;
    new_values?: Record<string, any>;
    trade_type?: string;
};

/**
 * Custom hook for making proposal requests using the API package
 * Centralizes proposal logic and provides consistent interface
 */
export const useProposal = (options: TUseProposalOptions = {}) => {
    const { enabled = true, new_values = {}, trade_type } = options;
    const trade_store = useTraderStore();
    const { trade_types } = trade_store;

    const proposal_req = getProposalRequestObject({
        new_values,
        trade_store,
        trade_type: trade_type || Object.keys(trade_types)[0],
    });

    const {
        data: response,
        error,
        isLoading,
    } = useQuery('proposal', {
        payload: {
            ...proposal_req,
            underlying_symbol: proposal_req.underlying_symbol,
        },
        options: {
            enabled,
            staleTime: 0, // Proposals should always be fresh
        },
    });

    return {
        data: response,
        error,
        isLoading,
        proposal_req,
    };
};

export default useProposal;
