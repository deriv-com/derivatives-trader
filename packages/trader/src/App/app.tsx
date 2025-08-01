import React from 'react';
import Loadable from 'react-loadable';

import type { TCoreStores } from '@deriv/stores/types';

import Routes from 'App/Containers/Routes/routes';
import TradeFooterExtensions from 'App/Containers/trade-footer-extensions';
import TradeHeaderExtensions from 'App/Containers/trade-header-extensions';
import TradeSettingsExtensions from 'App/Containers/trade-settings-extensions';
import { NetworkStatusToastErrorPopup } from 'Modules/Trading/Containers/toast-popup';
import ModulesProvider from 'Stores/Providers/modules-providers';
import type { TWebSocket } from 'Types';

import TraderProviders from '../trader-providers';

import initStore from './init-store';

import 'Sass/app.scss';

type Apptypes = {
    passthrough: {
        root_store: TCoreStores;
        WS: TWebSocket;
    };
};

const TradeModals = Loadable({
    loader: () => import(/* webpackChunkName: "trade-modals", webpackPrefetch: true */ './Containers/Modals'),
    loading: () => null,
});

const App = ({ passthrough }: Apptypes) => {
    const root_store = initStore(passthrough.root_store, passthrough.WS);

    React.useEffect(() => {
        return () => root_store.ui.setPromptHandler(false);
    }, [root_store]);

    return (
        <TraderProviders store={root_store}>
            <ModulesProvider store={root_store}>
                <Routes />
                <TradeModals />
                <NetworkStatusToastErrorPopup />
                <TradeHeaderExtensions store={root_store} />
                <TradeFooterExtensions />
                <TradeSettingsExtensions store={root_store} />
            </ModulesProvider>
        </TraderProviders>
    );
};

export default App;
