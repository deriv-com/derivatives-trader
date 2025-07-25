import React from 'react';

import { StoreProvider } from '@deriv/stores';
import type { TCoreStores } from '@deriv/stores/types';

import { TraderStoreProvider } from 'Stores/useTraderStores';

export const TraderProviders = ({ children, store }: React.PropsWithChildren<{ store: TCoreStores }>) => {
    return (
        <StoreProvider store={store}>
            <TraderStoreProvider>{children}</TraderStoreProvider>
        </StoreProvider>
    );
};

export default TraderProviders;
