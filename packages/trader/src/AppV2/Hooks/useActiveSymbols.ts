import { useCallback, useEffect, useState } from 'react';

import { ActiveSymbols, ActiveSymbolsResponse } from '@deriv/api-types';
import { CONTRACT_TYPES, getContractTypesConfig, isTurbosContract, isVanillaContract } from '@deriv/shared';
import { useStore } from '@deriv/stores';
import { localize } from '@deriv-com/translations';

import { useTraderStore } from 'Stores/useTraderStores';

import { useDtraderQuery } from './useDtraderQuery';

const useActiveSymbols = () => {
    const { client, common } = useStore();
    const { loginid } = client;
    const { showError, current_language } = common;
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
        // Removed switching logic for single account model
        return true;
    }, []);

    const getContractType = () => {
        if (isTurbosContract(contract_type)) {
            return 'turbos';
        } else if (isVanillaContract(contract_type)) {
            return 'vanilla';
        }
        return contract_type;
    };

    const { data: response, error: queryError } = useDtraderQuery<ActiveSymbolsResponse>(
        ['active_symbols', loginid ?? '', getContractType(), current_language],
        {
            active_symbols: 'brief',
            contract_type: getContractTypesList(),
        },
        {
            enabled: isQueryEnabled(),
        }
    );

    // Handle query errors
    useEffect(() => {
        if (queryError) {
            showError({ message: localize('Failed to load market data. Please refresh the page.') });
        }
    }, [queryError, showError]);

    useEffect(
        () => {
            const process = async () => {
                if (!response) return;

                const { active_symbols = [], error } = response;

                if (error) {
                    // Fallback: try to use existing symbols from store if available
                    if (symbols_from_store?.length) {
                        setActiveSymbols(symbols_from_store);
                        setActiveSymbolsV2(symbols_from_store);
                    } else {
                        showError({ message: localize('Trading is unavailable at this time.') });
                        setActiveSymbols([]);
                    }
                } else if (!active_symbols?.length) {
                    // Fallback: try to use existing symbols from store if available
                    if (symbols_from_store?.length) {
                        setActiveSymbols(symbols_from_store);
                        setActiveSymbolsV2(symbols_from_store);
                    } else {
                        setActiveSymbols([]);
                    }
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

    return { activeSymbols };
};

export default useActiveSymbols;
