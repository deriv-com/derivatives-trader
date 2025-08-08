import { useCallback, useEffect, useState } from 'react';

import { ActiveSymbols } from '@deriv/api-types';
import { CONTRACT_TYPES, getContractTypesConfig } from '@deriv/shared';
import { useStore } from '@deriv/stores';
import { localize } from '@deriv/translations';
import { useQuery, TContractType } from '@deriv/api';
import { useTraderStore } from 'Stores/useTraderStores';

const useActiveSymbols = () => {
    const { client, common } = useStore();
    const { is_switching } = client;
    const { showError } = common;
    const {
        active_symbols: symbols_from_store,
        contract_type,
        is_vanilla,
        is_turbos,
        setActiveSymbolsV2,
    } = useTraderStore();
    const [activeSymbols, setActiveSymbols] = useState<ActiveSymbols | []>(symbols_from_store);

    const getContractTypesList = () => {
        if (is_turbos) return [CONTRACT_TYPES.TURBOS.LONG, CONTRACT_TYPES.TURBOS.SHORT];
        if (is_vanilla) return [CONTRACT_TYPES.VANILLA.CALL, CONTRACT_TYPES.VANILLA.PUT];
        return getContractTypesConfig()[contract_type]?.trade_types ?? [];
    };

    const isQueryEnabled = useCallback(() => {
        // Remove dependency on available_contract_types to break circular dependency
        // Active symbols should load independently to provide data for other hooks
        if (is_switching) {
            return false;
        }
        return true;
    }, [is_switching]);

    const {
        data: response,
        error: queryError,
        isLoading,
    } = useQuery('active_symbols', {
        payload: {
            active_symbols: 'brief' as const,
            contract_type: getContractTypesList() as TContractType[], // Type assertion needed for contract type array
        },
        options: {
            enabled: isQueryEnabled(),
            staleTime: 5 * 60 * 1000, // 5 minutes - active symbols don't change frequently
            refetchOnWindowFocus: false,
        },
    });

    // Handle query errors (includes both network errors and API errors)
    useEffect(() => {
        if (queryError) {
            // Check if it's an API error or network error
            if (queryError.error) {
                showError({ message: localize('Trading is unavailable at this time.') });
            } else {
                showError({ message: localize('Failed to load market data. Please refresh the page.') });
            }
        }
    }, [queryError, showError]);

    useEffect(
        () => {
            const process = async () => {
                if (!response) return;

                // The API package's response structure: response.active_symbols contains the data
                const active_symbols = response.active_symbols || [];

                if (!active_symbols?.length) {
                    setActiveSymbols([]);
                } else {
                    setActiveSymbols(active_symbols);
                    setActiveSymbolsV2(active_symbols);
                }
            };
            process();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [response]
    );

    return { activeSymbols, isLoading };
};

export default useActiveSymbols;
