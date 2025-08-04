import React, { useCallback, useEffect, useRef } from 'react';

import { cloneObject, getContractCategoriesConfig, getContractTypesConfig, setTradeURLParams } from '@deriv/shared';
import { useStore } from '@deriv/stores';
import { useQuery } from '@deriv/api';

import { isLoginidDefined } from 'AppV2/Utils/client';
import { checkContractTypePrefix } from 'AppV2/Utils/contract-type';
import { getTradeTypesList } from 'AppV2/Utils/trade-types-utils';
import { TContractType } from 'Modules/Trading/Components/Form/ContractType/types';
import { useTraderStore } from 'Stores/useTraderStores';
import { TConfig, TContractTypesList } from 'Types';

type TContractsForResponse = {
    contracts_for: {
        available: {
            barrier_category: string;
            contract_category: string;
            contract_type: string;
            default_stake: number;
            sentiment: string;
            underlying_symbol?: string; // New field (symbol → underlying_symbol)
            symbol?: string; // Legacy field for backward compatibility
        }[];
        hit_count: number;
    };
};

const useContractsForCompany = () => {
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
    const { loginid, is_switching, landing_company_shortcode } = client;
    const prev_landing_company_shortcode_ref = React.useRef(landing_company_shortcode);

    // Helper function to get underlying_symbol from active_symbols
    const getUnderlyingSymbol = useCallback(
        (current_symbol: string) => {
            if (!current_symbol || !active_symbols?.length) return current_symbol;

            // Find symbol object where either symbol or underlying_symbol matches current_symbol
            const symbolInfo = active_symbols.find(symbol_info => {
                const underlying = (symbol_info as any).underlying_symbol;
                const symbol = (symbol_info as any).symbol;
                return underlying === current_symbol || symbol === current_symbol;
            });

            // Return underlying_symbol if found, otherwise fallback to current_symbol
            return symbolInfo ? (symbolInfo as any).underlying_symbol || current_symbol : current_symbol;
        },
        [active_symbols]
    );

    const isQueryEnabled = useCallback(() => {
        // Always validate symbol presence first - prevents API calls with undefined symbol
        if (!symbol) return false;
        if (is_switching) return false;
        return true;
    }, [symbol, is_switching]);

    // Get the underlying_symbol for the API call
    const underlying_symbol = getUnderlyingSymbol(symbol);

    const {
        data: response,
        error,
        isLoading: is_fetching,
    } = useQuery('contracts_for', {
        payload: {
            contracts_for: underlying_symbol, // Use underlying_symbol from active_symbols lookup
        },
        options: {
            enabled: isQueryEnabled(),
            staleTime: 10 * 60 * 1000, // 10 minutes - contracts don't change frequently
            refetchOnWindowFocus: false,
        },
    });

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
            // The API package's response structure: response.contracts_for contains the data
            const contracts_for = response?.contracts_for;
            const available_contract_types: ReturnType<typeof getContractTypesConfig> = {};
            is_fetching_ref.current = false;

            if (!error && contracts_for?.available?.length) {
                contracts_for.available.forEach((contract: any) => {
                    const type = Object.keys(contract_types).find(
                        key =>
                            contract_types[key].trade_types.indexOf(contract.contract_type) !== -1 &&
                            (contract.contract_type !== 'PUT' || contract_types[key].barrier_count === 1) // To distinguish betweeen Rise/Fall & Higher/Lower
                    );

                    if (!type) return; // ignore unsupported contract types

                    if (!available_contract_types[type]) {
                        // extend contract_categories to include what is needed to create the contract list
                        const category =
                            Object.keys(available_categories).find(
                                key => available_categories[key].categories.indexOf(type) !== -1
                            ) ?? '';

                        const sub_cats = available_categories[category]?.categories;

                        if (!sub_cats) return;

                        sub_cats[(sub_cats as string[]).indexOf(type)] = {
                            value: type,
                            text: contract_types[type].title,
                            barrier_category: contract.barrier_category,
                        };

                        available_contract_types[type] = cloneObject(contract_types[type]);
                    }
                    const config: TConfig = available_contract_types[type].config || {};
                    config.barrier_category =
                        contract_types[type].barrier_count === 0
                            ? 'euro_atm'
                            : (contract.barrier_category as TConfig['barrier_category']);
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

                if (symbol !== prev_landing_company_shortcode_ref.current) {
                    onChange({
                        target: {
                            name: 'symbol',
                            value: symbol,
                        },
                    }).then(() => {
                        processContractsForV2();
                        prev_landing_company_shortcode_ref.current = symbol;
                    });
                }
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

export default useContractsForCompany;
