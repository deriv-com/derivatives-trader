import { useCallback, useEffect } from 'react';

import { TActiveSymbolsRequest, useQuery } from '@deriv/api';
import { CONTRACT_TYPES, getContractTypesConfig } from '@deriv/shared';
import { useStore } from '@deriv/stores';
import { localize } from '@deriv-com/translations';

import { useTraderStore } from 'Stores/useTraderStores';

type TContractTypesList = NonNullable<TActiveSymbolsRequest['contract_type']>;

// Cache configuration for active symbols query
const ACTIVE_SYMBOLS_CACHE_CONFIG = {
    STALE_TIME: 5 * 60 * 1000, // 5 minutes - data stays fresh
    CACHE_TIME: 10 * 60 * 1000, // 10 minutes - keep in cache even if unused
} as const;

/**
 * Hook to fetch and manage active symbols for trading
 */
const useActiveSymbols = () => {
    const { common } = useStore();
    const { showError } = common;
    const { contract_type, is_vanilla, is_turbos, setActiveSymbolsV2 } = useTraderStore();

    const getContractTypesList = (): TContractTypesList => {
        if (is_turbos) return [CONTRACT_TYPES.TURBOS.LONG, CONTRACT_TYPES.TURBOS.SHORT] as TContractTypesList;
        if (is_vanilla) return [CONTRACT_TYPES.VANILLA.CALL, CONTRACT_TYPES.VANILLA.PUT] as TContractTypesList;
        return (getContractTypesConfig()[contract_type]?.trade_types ?? []) as TContractTypesList;
    };

    const {
        data: response,
        error: queryError,
        isLoading,
    } = useQuery('active_symbols', {
        payload: {
            active_symbols: 'brief',
            contract_type: getContractTypesList(),
        },
        options: {
            staleTime: ACTIVE_SYMBOLS_CACHE_CONFIG.STALE_TIME,
            cacheTime: ACTIVE_SYMBOLS_CACHE_CONFIG.CACHE_TIME,
            refetchOnWindowFocus: false, // Don't refetch when window regains focus
        },
    });

    // Handle query errors
    useEffect(() => {
        if (queryError) {
            showError({ message: localize('Failed to load market data. Please refresh the page.') });
        }
    }, [queryError, showError]);

    // Update MobX store when data is received (for trade-store internal operations)
    useEffect(() => {
        if (!response) return;

        const { active_symbols = [] } = response;

        if (!active_symbols?.length) {
            showError({ message: localize('Trading is unavailable at this time.') });
            setActiveSymbolsV2([]);
        } else {
            // Update store with fresh data
            setActiveSymbolsV2(active_symbols);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [response]);

    return {
        activeSymbols: response?.active_symbols || [],
        isLoading,
    };
};

export default useActiveSymbols;
