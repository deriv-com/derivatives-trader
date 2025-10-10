import { useCallback, useEffect, useState } from 'react';

import { TActiveSymbolsResponse } from '@deriv/api';
import { CONTRACT_TYPES, getContractTypesConfig, isTurbosContract, isVanillaContract } from '@deriv/shared';
import { useStore } from '@deriv/stores';
import { localize } from '@deriv-com/translations';

import { useTraderStore } from 'Stores/useTraderStores';

import { useDtraderQuery } from './useDtraderQuery';

// LocalStorage persistence for navigation
const STORAGE_KEY = 'dtrader_v2_active_symbols';
const EXPIRY_TIME = 5 * 60 * 1000; // 5 minutes

const getStoredSymbols = () => {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const { symbols, timestamp } = JSON.parse(stored);
            if (Date.now() - timestamp < EXPIRY_TIME) return symbols;
        }
    } catch {
        // Ignore localStorage errors (e.g., quota exceeded, disabled)
    }
    return null;
};

const storeSymbols = (symbols: NonNullable<TActiveSymbolsResponse['active_symbols']>) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ symbols, timestamp: Date.now() }));
    } catch {
        // Ignore localStorage errors (e.g., quota exceeded, disabled)
    }
};

const useActiveSymbols = () => {
    const { client, common } = useStore();
    const { loginid } = client;
    const { showError, current_language } = common;
    const {
        active_symbols: symbols_from_store,
        contract_type,
        is_vanilla,
        is_turbos,
        has_symbols_for_v2,
        setActiveSymbolsV2,
    } = useTraderStore();
    const [activeSymbols, setActiveSymbols] = useState<NonNullable<TActiveSymbolsResponse['active_symbols']> | []>(
        () => {
            const stored = getStoredSymbols();
            return stored?.length ? stored : symbols_from_store || [];
        }
    );

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

    const { data: response, error: queryError } = useDtraderQuery<TActiveSymbolsResponse>(
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

    // Use store symbols when available and valid, but only for unchanged contract types
    useEffect(() => {
        if (has_symbols_for_v2 && symbols_from_store?.length && !response) {
            setActiveSymbols(symbols_from_store);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [has_symbols_for_v2, response]);

    useEffect(() => {
        if (!response) return;

        const { active_symbols = [], error } = response;

        if (error || !active_symbols?.length) {
            // Fallback to stored or store symbols
            const stored = getStoredSymbols();
            const fallback = stored?.length ? stored : symbols_from_store;
            if (fallback?.length) {
                setActiveSymbols(fallback);
                setActiveSymbolsV2(fallback);
            } else {
                showError({ message: localize('Trading is unavailable at this time.') });
                setActiveSymbols([]);
            }
        } else {
            // Success: store and update
            storeSymbols(active_symbols);
            setActiveSymbols(active_symbols);
            setActiveSymbolsV2(active_symbols);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [response]);

    return { activeSymbols };
};

export default useActiveSymbols;
