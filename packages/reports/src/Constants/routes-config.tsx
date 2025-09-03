import React from 'react';

import { Loading } from '@deriv/components';
import {
    LegacyOpenPositionIcon,
    LegacyProfitTableIcon,
    LegacyReportsIcon,
    LegacyStatementIcon,
} from '@deriv/quill-icons';
import { makeLazyLoader, moduleLoader, routes } from '@deriv/shared';
import { localize } from '@deriv-com/translations';

import type { TRoute, TRouteConfig } from 'Types';

const Page404 = React.lazy(() => import(/* webpackChunkName: "404" */ 'Modules/Page404'));

const lazyLoadReportComponent = makeLazyLoader(
    () => moduleLoader(() => import(/* webpackChunkName: "reports-routes" */ '../Containers')),
    () => <Loading />
);

// Order matters
const initRoutesConfig = (): TRouteConfig[] => {
    return [
        {
            path: routes.reports,
            component: lazyLoadReportComponent('Reports'),
            is_authenticated: true,
            getTitle: () => localize('Reports'),
            icon_component: <LegacyReportsIcon iconSize='xs' />,
            routes: [
                {
                    path: routes.positions,
                    component: lazyLoadReportComponent('OpenPositions'),
                    getTitle: () => localize('Open positions'),
                    icon_component: <LegacyOpenPositionIcon iconSize='xs' />,
                    default: true,
                },
                {
                    path: routes.profit,
                    component: lazyLoadReportComponent('ProfitTable'),
                    getTitle: () => localize('Trade table'),
                    icon_component: <LegacyProfitTableIcon iconSize='xs' />,
                },
                {
                    path: routes.statement,
                    component: lazyLoadReportComponent('Statement'),
                    getTitle: () => localize('Statement'),
                    icon_component: <LegacyStatementIcon iconSize='xs' />,
                },
            ],
        },
    ];
};

let routesConfig: TRouteConfig[];

// For default page route if page/path is not found, must be kept at the end of routes_config array
const route_default: TRoute = { component: Page404, getTitle: () => localize('Error 404') };

const getRoutesConfig = (): TRouteConfig[] => {
    if (!routesConfig) {
        routesConfig = initRoutesConfig();
        routesConfig.push(route_default);
    }
    return routesConfig;
};

export default getRoutesConfig;
