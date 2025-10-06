import { useMemo } from 'react';

import { getTradeTypesList } from 'AppV2/Utils/trade-types-utils';
import { useTraderStore } from 'Stores/useTraderStores';

/**
 * Lightweight hook for Guide component that uses existing trade store data
 * without triggering API calls. This prevents the barrier reset issue caused
 * by useContractsFor when Guide is displayed during scrolling.
 */
const useGuideContractTypes = () => {
    const { contract_types_list_v2, contract_types_list, is_dtrader_v2 } = useTraderStore();

    const trade_types = useMemo(() => {
        // Use the appropriate contract types list based on dtrader version
        const contract_list = is_dtrader_v2 ? contract_types_list_v2 : contract_types_list;

        // If no contract types are available, return empty array
        if (!contract_list || Object.keys(contract_list).length === 0) {
            return [];
        }

        // Use the same logic as useContractsFor but without API calls
        return getTradeTypesList(contract_list);
    }, [contract_types_list_v2, contract_types_list, is_dtrader_v2]);

    return { trade_types };
};

export default useGuideContractTypes;
