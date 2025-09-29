import React from 'react';
import { Redirect, Route } from 'react-router-dom';

import { getBrandName, isEmptyObject, removeBranchName, routes } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';

import Page404 from 'Modules/Page404';

const RouteWithSubRoutes = observer(route => {
    const { client } = useStore();
    const { is_logged_in, is_logging_in } = client;

    const validateRoute = () => {
        // Check if route requires authentication
        if (route.protected) {
            // If route is protected but user is not logged in and not logging in, deny access
            if (!is_logged_in && !is_logging_in) {
                return false;
            }
        }

        return true;
    };

    const renderFactory = props => {
        let result = null;
        const pathname = removeBranchName(location.pathname).replace(/\/$/, '');
        const is_valid_route = validateRoute(pathname);

        if (route.component === Redirect) {
            let to = route.to;

            // This if clause has been added just to remove '/index' from url in localhost env.
            if (route.path === routes.index) {
                const { location } = props;
                to = location.pathname.toLowerCase().replace(route.path, '');
            }
            result = <Redirect to={to} />;
        } else {
            const default_subroute = route.routes ? route.routes.find(r => r.default) : {};
            const has_default_subroute = !isEmptyObject(default_subroute);

            let content;
            if (is_valid_route) {
                content = <route.component {...props} routes={route.routes} passthrough={route.passthrough} />;
            } else if (route.protected) {
                content = <Redirect to={routes.index} />;
            } else {
                content = <Page404 />;
            }

            result = (
                <React.Fragment>
                    {has_default_subroute && pathname === route.path && <Redirect to={default_subroute.path} />}
                    {content}
                </React.Fragment>
            );
        }

        const title = route.getTitle?.() || '';
        document.title = `${title} | ${getBrandName()}`;

        return result;
    };

    return <Route exact={route.exact} path={route.path} render={renderFactory} />;
});

export default RouteWithSubRoutes;
