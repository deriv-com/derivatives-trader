import React from 'react';
import Loadable from 'react-loadable';

import { UILoader } from '@deriv/components';
import { LegacyChartsIcon } from '@deriv/quill-icons';
import { observer, useStore } from '@deriv/stores';
import type { TCoreStores } from '@deriv/stores/types';
import { useTranslations } from '@deriv-com/translations';

import TraderProviders from '../../trader-providers';

type TTradeSettingsExtensionsProps = {
    store: TCoreStores;
};

const ChartSettingContainer = Loadable({
    loader: () =>
        import(
            /* webpackChunkName: "settings-chart", webpackPrefetch: true */ 'App/Containers/SettingsModal/settings-chart'
        ),
    loading: () => <UILoader />,
});

const renderItemValue = <T extends object>(props: T, store: TCoreStores) => (
    <TraderProviders store={store}>
        <ChartSettingContainer {...props} />
    </TraderProviders>
);

const TradeSettingsExtensions = observer(({ store }: TTradeSettingsExtensionsProps) => {
    const { localize } = useTranslations();
    const { ui } = useStore();
    const { populateSettingsExtensions } = ui;
    const populateSettings = () => {
        const menu_items: Parameters<typeof populateSettingsExtensions>[0] = [
            {
                icon: <LegacyChartsIcon />,
                label: localize('Charts'),
                value: props => renderItemValue(props, store),
            },
        ];
        populateSettingsExtensions(menu_items);
    };

    React.useEffect(() => {
        return () => populateSettingsExtensions(null);
    }, [populateSettingsExtensions]);

    React.useEffect(() => populateSettings());

    return null;
});

export default TradeSettingsExtensions;
