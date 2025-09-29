import React from 'react';

import { LegacyPositionIcon, LegacyProfitTableIcon, LegacyReportsIcon, LegacyStatementIcon } from '@deriv/quill-icons';
import { routes } from '@deriv/shared';
import { localize } from '@deriv-com/translations';

import Endpoint from 'Modules/Endpoint';

// Error Routes
const Page404 = React.lazy(() => import(/* webpackChunkName: "404" */ 'Modules/Page404'));

const Trader = React.lazy(() => import(/* webpackChunkName: "trader" */ '@deriv/trader'));

const Reports = React.lazy(() => import(/* webpackChunkName: "reports" */ '@deriv/reports'));

const getModules = () => {
    const modules = [
        {
            path: routes.reports,
            component: Reports,
            getTitle: () => localize('Reports'),
            icon_component: <LegacyReportsIcon />,
            protected: true,
            routes: [
                {
                    path: routes.positions,
                    component: Reports,
                    getTitle: () => localize('Open positions'),
                    icon_component: <LegacyPositionIcon />,
                    default: true,
                    protected: true,
                },
                {
                    path: routes.profit,
                    component: Reports,
                    getTitle: () => localize('Trade table'),
                    icon_component: <LegacyProfitTableIcon />,
                    protected: true,
                },
                {
                    path: routes.statement,
                    component: Reports,
                    getTitle: () => localize('Statement'),
                    icon_component: <LegacyStatementIcon />,
                    protected: true,
                },
            ],
        },
        {
            path: routes.index,
            component: Trader,
            getTitle: () => localize('Trader'),
            protected: false,
        },
        {
            path: routes.contract,
            component: Trader,
            getTitle: () => localize('Contract Details'),
            protected: true,
        },
    ];

    return modules;
};

// Order matters
// TODO: search tag: test-route-parent-info -> Enable test for getting route parent info when there are nested routes
const initRoutesConfig = () => [
    { path: routes.endpoint, component: Endpoint, getTitle: () => 'Endpoint' }, // doesn't need localization as it's for internal use
    ...getModules(),
];

let routesConfig;

// For default page route if page/path is not found, must be kept at the end of routes_config array
const route_default = { component: Page404, getTitle: () => localize('Error 404') };

const getRoutesConfig = () => {
    if (!routesConfig) {
        routesConfig = initRoutesConfig();
        routesConfig.push(route_default);
    }
    return routesConfig;
};

export default getRoutesConfig;
