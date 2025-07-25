import { lazy } from 'react';

import { routes } from '@deriv/shared';

import ContractDetails from 'AppV2/Containers/ContractDetails';
import Positions from 'AppV2/Containers/Positions';
import Trade from 'AppV2/Containers/Trade';
import { TRouteConfig } from 'Types';

type TRouteConfigExtended = Omit<TRouteConfig, 'routes'> & {
    path: string;
    component: React.ComponentType;
    default: boolean;
};

const traderRoutes: TRouteConfigExtended[] = [
    {
        path: routes.trade,
        component: Trade,
        exact: true,
        default: false,
    },
    {
        path: routes.trader_positions,
        component: Positions,
        is_authenticated: true,
        default: false,
    },
    {
        path: routes.contract,
        component: ContractDetails,
        is_authenticated: true,
        default: false,
    },
    {
        // default route
        path: '/*',
        component: lazy(() => import('Modules/Page404')),
        default: false,
    },
];

export default traderRoutes;
