import React, { useCallback, useEffect, useRef } from 'react';

import { cloneObject, getContractCategoriesConfig, getContractTypesConfig, setTradeURLParams } from '@deriv/shared';
import { useStore } from '@deriv/stores';

import { checkContractTypePrefix } from 'AppV2/Utils/contract-type';
import { getTradeTypesList } from 'AppV2/Utils/trade-types-utils';
import { TContractType } from 'Modules/Trading/Components/Form/ContractType/types';
import { useTraderStore } from 'Stores/useTraderStores';
import { TConfig, TContractTypesList } from 'Types';

import { useDtraderQuery } from './useDtraderQuery';

type TContractsForResponse = {
    contracts_for: {
        available: {
            contract_category: string;
            contract_type: string;
            default_stake: number;
            sentiment: string;
            underlying_symbol?: string; // New field (symbol → underlying_symbol)
            symbol?: string; // Legacy field for backward compatibility
            barrier?: string;
            barriers?: number;
            exchange_name?: string;
        }[];
        hit_count: number;
    };
};

const useContractsFor = () => {
    const [contract_types_list, setContractTypesList] = React.useState<TContractTypesList | []>([]);

    const [trade_types, setTradeTypes] = React.useState<TContractType[]>([]);
    const {
        contract_type,
        onChange,
        setContractTypesListV2,
        setDefaultStake,
        processContractsForV2,
        symbol,
        active_symbols,
    } = useTraderStore();
    const { client } = useStore();
    const { loginid } = client;

    // Helper function to get underlying_symbol from active_symbols
    const getUnderlyingSymbol = useCallback(
        (current_symbol: string) => {
            if (!current_symbol || !active_symbols?.length) return current_symbol;

            // Find symbol object where either symbol or underlying_symbol matches current_symbol
            const symbolInfo = active_symbols.find(symbol_info => {
                const underlying = (symbol_info as { underlying_symbol?: string }).underlying_symbol;
                const symbol = (symbol_info as { symbol?: string }).symbol;
                return underlying === current_symbol || symbol === current_symbol;
            });

            // Return underlying_symbol if found, otherwise fallback to current_symbol
            return symbolInfo
                ? (symbolInfo as { underlying_symbol?: string }).underlying_symbol || current_symbol
                : current_symbol;
        },
        [active_symbols]
    );

    const isQueryEnabled = useCallback(() => {
        // Always validate symbol presence first - prevents API calls with undefined symbol
        if (!symbol) return false;
        // Removed switching logic for single account model
        return true;
    }, [symbol]);

    // Get the underlying_symbol for the API call
    const underlying_symbol = getUnderlyingSymbol(symbol);

    const {
        data: response,
        error,
        is_fetching,
    } = useDtraderQuery<TContractsForResponse>(
        ['contracts_for', loginid ?? '', underlying_symbol],
        {
            contracts_for: underlying_symbol, // Use underlying_symbol from active_symbols lookup
        },
        {
            enabled: isQueryEnabled(),
        }
    );

    const contract_categories = getContractCategoriesConfig();
    const available_categories = cloneObject(contract_categories);
    const contract_types = getContractTypesConfig();
    const [available_contract_types, setAvailableContractTypes] = React.useState<
        ReturnType<typeof getContractTypesConfig> | undefined
    >();

    const is_fetching_ref = useRef(is_fetching);

    const isContractTypeAvailable = useCallback(
        (trade_types: TContractType[]) => {
            return trade_types.some(
                type => checkContractTypePrefix([contract_type, type.value]) || contract_type === type.value
            );
        },
        [contract_type]
    );

    const getTradeTypes = useCallback((categories: TContractTypesList) => {
        return Array.isArray(categories) && categories.length === 0
            ? []
            : getTradeTypesList(categories as TContractTypesList);
    }, []);

    const getNewContractType = useCallback(
        (trade_types: TContractType[]) => {
            if (!isContractTypeAvailable(trade_types) && trade_types.length > 0) {
                return trade_types[0].value;
            }
            return contract_type;
        },
        [contract_type, isContractTypeAvailable]
    );

    const processNewContractType = useCallback(
        (new_contract_type: string) => {
            const has_contract_type_changed = contract_type != new_contract_type && new_contract_type;
            if (has_contract_type_changed) {
                onChange({
                    target: {
                        name: 'contract_type',
                        value: new_contract_type,
                    },
                });
            }
            setTradeURLParams({ contractType: new_contract_type });
        },
        [contract_type, onChange]
    );

    useEffect(() => {
        setAvailableContractTypes(undefined);
        setContractTypesList([]);
        is_fetching_ref.current = true;
    }, [loginid]);

    useEffect(() => {
        try {
            const { contracts_for } = response || {};
            const available_contract_types: ReturnType<typeof getContractTypesConfig> = {};
            is_fetching_ref.current = false;

            if (!error && contracts_for?.available.length) {
                contracts_for.available.forEach(contract => {
                    // Enhanced contract type matching logic from legacy implementation
                    const type = Object.keys(contract_types).find(key => {
                        const isContractTypeMatch =
                            contract_types[key].trade_types.indexOf(contract.contract_type) !== -1;

                        // Handle the new API structure where Rise/Fall and Higher/Lower are distinguished by contract_category
                        if (contract.contract_category) {
                            // For Rise/Fall contracts with contract_category "callput"
                            if (contract.contract_category === 'callput' && key === 'rise_fall') {
                                return isContractTypeMatch;
                            }
                            // For Higher/Lower contracts with contract_category "higherlower"
                            if (contract.contract_category === 'higherlower' && key === 'high_low') {
                                return isContractTypeMatch;
                            }
                            // For other contract categories, use existing logic
                            return isContractTypeMatch;
                        }

                        // Fallback to original logic for backward compatibility
                        return (
                            isContractTypeMatch &&
                            (contract.contract_type !== 'PUT' || contract_types[key].barrier_count === 1)
                        );
                    });

                    if (!type) {
                        return; // ignore unsupported contract types
                    }

                    if (!available_contract_types[type]) {
                        // extend contract_categories to include what is needed to create the contract list
                        const category =
                            Object.keys(available_categories).find(
                                key => available_categories[key].categories.indexOf(type) !== -1
                            ) ?? '';

                        const sub_cats = available_categories[category]?.categories;

                        if (!sub_cats) {
                            return;
                        }

                        sub_cats[(sub_cats as string[]).indexOf(type)] = {
                            value: type,
                            text: contract_types[type].title,
                        };

                        available_contract_types[type] = cloneObject(contract_types[type]);
                    }
                    const config: TConfig = available_contract_types[type].config || {};
                    config.default_stake = contract.default_stake;
                    if (type === contract_type) setDefaultStake(contract.default_stake);
                    available_contract_types[type].config = config;
                });

                setContractTypesListV2(available_categories);
                setContractTypesList(available_categories);
                setAvailableContractTypes(available_contract_types);

                const trade_types = getTradeTypes(available_categories);
                setTradeTypes(trade_types);

                const new_contract_type = getNewContractType(trade_types);
                processNewContractType(new_contract_type);

                // Process contracts for V2 when data is available
                processContractsForV2();
            } else if (symbol && !error) {
                // Fallback: Set basic trade types if API fails but we have a valid symbol
                const fallbackTradeTypes = [
                    { text: 'Rise/Fall', value: 'rise_fall' },
                    { text: 'Higher/Lower', value: 'high_low' },
                ];
                setTradeTypes(fallbackTradeTypes);
            } else {
                setTradeTypes([]);
            }
        } catch (err) {
            /* eslint-disable no-console */
            console.error(err);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [response]);

    const resetTradeTypes = () => {
        setTradeTypes([]);
    };

    return { trade_types, contract_types_list, available_contract_types, is_fetching_ref, resetTradeTypes };
};

export default useContractsFor;
