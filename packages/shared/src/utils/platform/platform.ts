import { getPlatformName } from '../brand';
import { routes } from '../routes';

/*
 * These functions exist because we want to refresh the browser page on switch between Bot and the rest of the platforms.
 * */

export const platform_name = Object.freeze({
    DTrader: getPlatformName(),
});

export const getPathname = () => {
    switch (window.location.pathname.split('/')[1]) {
        case '':
            return platform_name.DTrader;
        case 'reports':
            return 'Reports';
        default:
            return platform_name.DTrader;
    }
};

export const getPlatformRedirect = () => {
    return { name: platform_name.DTrader, route: routes.index };
};
