import React from 'react';
import { routes } from '@deriv/shared';
import { render } from '@testing-library/react';
import getRoutesConfig from '../routes-config';

// Mock shared utilities
jest.mock('@deriv/shared', () => ({
    routes: {
        reports: '/reports',
        positions: '/reports/positions',
        profit: '/reports/profit',
        statement: '/reports/statement',
    },
    makeLazyLoader: (loader: () => any, fallback: () => React.ReactNode) => {
        return (component: string) => {
            const components: Record<string, React.ComponentType> = {
                Reports: () => <div>Reports</div>,
                OpenPositions: () => <div>OpenPositions</div>,
                ProfitTable: () => <div>ProfitTable</div>,
                Statement: () => <div>Statement</div>,
            };
            return components[component] || (() => <div>{component}</div>);
        };
    },
    moduleLoader: (loader: () => any) => loader,
}));

// Mock the lazy-loaded components
jest.mock('Modules/Page404', () => ({
    __esModule: true,
    default: () => <div>Page404</div>,
}));

jest.mock('../../Containers', () => ({
    __esModule: true,
    default: {
        Reports: () => <div>Reports</div>,
        OpenPositions: () => <div>OpenPositions</div>,
        ProfitTable: () => <div>ProfitTable</div>,
        Statement: () => <div>Statement</div>,
    },
}));

// Mock icon components
jest.mock('@deriv/quill-icons', () => ({
    LegacyOpenPositionIcon: ({ iconSize }: { iconSize: string }) => <span>OpenPositionIcon-{iconSize}</span>,
    LegacyProfitTableIcon: ({ iconSize }: { iconSize: string }) => <span>ProfitTableIcon-{iconSize}</span>,
    LegacyReportsIcon: ({ iconSize }: { iconSize: string }) => <span>ReportsIcon-{iconSize}</span>,
    LegacyStatementIcon: ({ iconSize }: { iconSize: string }) => <span>StatementIcon-{iconSize}</span>,
}));

// Mock @deriv/components
jest.mock('@deriv/components', () => ({
    Loading: () => <div>Loading</div>,
}));

describe('Routes Config', () => {
    let routesConfig: ReturnType<typeof getRoutesConfig>;

    beforeEach(() => {
        // Clear the cached routes config for fresh testing
        jest.resetModules();
        routesConfig = getRoutesConfig();
    });

    describe('getRoutesConfig', () => {
        it('should return correct number of routes', () => {
            expect(routesConfig).toHaveLength(2);
        });

        it('should return the same instance when called multiple times (cached)', () => {
            const firstCall = getRoutesConfig();
            const secondCall = getRoutesConfig();
            expect(firstCall).toBe(secondCall);
        });
    });

    describe('Reports route configuration', () => {
        let reportsRoute: ReturnType<typeof getRoutesConfig>[0];

        beforeEach(() => {
            reportsRoute = routesConfig[0];
        });

        it('should have correct path and authentication settings', () => {
            expect(reportsRoute.path).toBe(routes.reports);
            expect(reportsRoute.is_authenticated).toBe(true);
        });

        it('should have a component that can be rendered', () => {
            expect(reportsRoute.component).toBeDefined();
            expect(typeof reportsRoute.component).toBe('function');
        });

        it('should have getTitle function that returns a localized string', () => {
            expect(reportsRoute.getTitle).toBeDefined();
            const title = reportsRoute.getTitle!();
            expect(typeof title).toBe('string');
            expect(title).toBe('Reports');
        });

        it('should have an icon component that renders correctly', () => {
            expect(reportsRoute.icon_component).toBeDefined();

            if (reportsRoute.icon_component) {
                render(reportsRoute.icon_component);
                expect(React.isValidElement(reportsRoute.icon_component)).toBe(true);
            }
        });

        it('should have correct number of nested routes', () => {
            expect(reportsRoute.routes).toBeDefined();
            expect(reportsRoute.routes).toHaveLength(3);
        });

        describe('Open Positions sub-route', () => {
            let openPositionsRoute: NonNullable<typeof reportsRoute.routes>[0];

            beforeEach(() => {
                openPositionsRoute = reportsRoute.routes![0];
            });

            it('should have correct configuration', () => {
                expect(openPositionsRoute.path).toBe(routes.positions);
                expect(openPositionsRoute.default).toBe(true);
                expect(openPositionsRoute.component).toBeDefined();
                expect(openPositionsRoute.getTitle).toBeDefined();
                expect(openPositionsRoute.icon_component).toBeDefined();
            });

            it('should have getTitle function that returns a localized string', () => {
                const title = openPositionsRoute.getTitle!();
                expect(typeof title).toBe('string');
                expect(title).toBe('Open positions');
            });

            it('should have an icon component that renders correctly', () => {
                expect(openPositionsRoute.icon_component).toBeDefined();

                if (openPositionsRoute.icon_component) {
                    render(openPositionsRoute.icon_component);
                    expect(React.isValidElement(openPositionsRoute.icon_component)).toBe(true);
                }
            });
        });

        describe('Profit Table sub-route', () => {
            let profitTableRoute: NonNullable<typeof reportsRoute.routes>[1];

            beforeEach(() => {
                profitTableRoute = reportsRoute.routes![1];
            });

            it('should have correct configuration', () => {
                expect(profitTableRoute.path).toBe(routes.profit);
                expect(profitTableRoute.default).toBeUndefined();
                expect(profitTableRoute.component).toBeDefined();
                expect(profitTableRoute.getTitle).toBeDefined();
                expect(profitTableRoute.icon_component).toBeDefined();
            });

            it('should have getTitle function that returns a localized string', () => {
                const title = profitTableRoute.getTitle!();
                expect(typeof title).toBe('string');
                expect(title).toBe('Trade table');
            });

            it('should have an icon component that renders correctly', () => {
                expect(profitTableRoute.icon_component).toBeDefined();

                if (profitTableRoute.icon_component) {
                    render(profitTableRoute.icon_component);
                    expect(React.isValidElement(profitTableRoute.icon_component)).toBe(true);
                }
            });
        });

        describe('Statement sub-route', () => {
            let statementRoute: NonNullable<typeof reportsRoute.routes>[2];

            beforeEach(() => {
                statementRoute = reportsRoute.routes![2];
            });

            it('should have correct configuration', () => {
                expect(statementRoute.path).toBe(routes.statement);
                expect(statementRoute.default).toBeUndefined();
                expect(statementRoute.component).toBeDefined();
                expect(statementRoute.getTitle).toBeDefined();
                expect(statementRoute.icon_component).toBeDefined();
            });

            it('should have getTitle function that returns a localized string', () => {
                const title = statementRoute.getTitle!();
                expect(typeof title).toBe('string');
                expect(title).toBe('Statement');
            });

            it('should have an icon component that renders correctly', () => {
                expect(statementRoute.icon_component).toBeDefined();

                if (statementRoute.icon_component) {
                    render(statementRoute.icon_component);
                    expect(React.isValidElement(statementRoute.icon_component)).toBe(true);
                }
            });
        });
    });

    describe('Default 404 route configuration', () => {
        let defaultRoute: ReturnType<typeof getRoutesConfig>[1];

        beforeEach(() => {
            defaultRoute = routesConfig[1];
        });

        it('should have correct configuration', () => {
            expect(defaultRoute.path).toBeUndefined();
            expect(defaultRoute.is_authenticated).toBeUndefined();
            expect(defaultRoute.component).toBeDefined();
            expect(defaultRoute.getTitle).toBeDefined();
        });

        it('should have getTitle function that returns a localized string', () => {
            const title = defaultRoute.getTitle!();
            expect(typeof title).toBe('string');
            expect(title).toBe('Error 404');
        });

        it('should have a component that can be rendered', () => {
            expect(defaultRoute.component).toBeDefined();
            // Page404 is a React.lazy component, so it should be an object with $$typeof symbol
            expect(typeof defaultRoute.component).toBe('object');
            expect(defaultRoute.component).toHaveProperty('$$typeof');
        });

        it('should not have nested routes', () => {
            expect(defaultRoute.routes).toBeUndefined();
        });

        it('should not have icon component', () => {
            expect(defaultRoute.icon_component).toBeUndefined();
        });
    });

    describe('Route structure integrity', () => {
        it('should have all routes with required properties', () => {
            routesConfig.forEach(route => {
                expect(route.component).toBeDefined();
                // Components can be either functions or React components (objects)
                expect(['function', 'object'].includes(typeof route.component)).toBe(true);

                if (route.getTitle) {
                    expect(typeof route.getTitle).toBe('function');
                    const title = route.getTitle();
                    expect(typeof title).toBe('string');
                }

                if (route.icon_component) {
                    expect(React.isValidElement(route.icon_component)).toBe(true);
                }

                if (route.routes) {
                    expect(Array.isArray(route.routes)).toBe(true);
                    route.routes.forEach(subRoute => {
                        expect(subRoute.component).toBeDefined();
                        // Sub-route components can also be functions or React components
                        expect(['function', 'object'].includes(typeof subRoute.component)).toBe(true);
                        if (subRoute.getTitle) {
                            expect(typeof subRoute.getTitle).toBe('function');
                        }
                    });
                }
            });
        });

        it('should have correct route paths that match shared routes constants', () => {
            const reportsRoute = routesConfig[0];
            expect(reportsRoute.path).toBe(routes.reports);

            if (reportsRoute.routes) {
                expect(reportsRoute.routes[0].path).toBe(routes.positions);
                expect(reportsRoute.routes[1].path).toBe(routes.profit);
                expect(reportsRoute.routes[2].path).toBe(routes.statement);
            }
        });

        it('should have exactly one default route among sub-routes', () => {
            const reportsRoute = routesConfig[0];
            if (reportsRoute.routes) {
                const defaultRoutes = reportsRoute.routes.filter(route => route.default);
                expect(defaultRoutes).toHaveLength(1);
                expect(defaultRoutes[0].path).toBe(routes.positions);
            }
        });

        it('should have 404 route as the last route', () => {
            const lastRoute = routesConfig[routesConfig.length - 1];
            expect(lastRoute.path).toBeUndefined(); // 404 route has no specific path
            expect(lastRoute.component).toBeDefined();
        });
    });
});
