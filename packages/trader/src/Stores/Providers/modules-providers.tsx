import React from 'react';

import { StoreProvider } from '@deriv/stores';
import type { TCoreStores } from '@deriv/stores/types';

import { ModulesStoreProvider } from 'Stores/useModulesStores';

export const ModulesProvider = ({ children, store }: React.PropsWithChildren<{ store: TCoreStores }>) => {
    return (
        <StoreProvider store={store}>
            <ModulesStoreProvider>{children}</ModulesStoreProvider>
        </StoreProvider>
    );
};

export default ModulesProvider;
