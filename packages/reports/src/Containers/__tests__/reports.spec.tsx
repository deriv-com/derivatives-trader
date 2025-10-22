import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory, History } from 'history';

import { trackAnalyticsEvent } from '@deriv/shared';
import { mockStore, StoreProvider } from '@deriv/stores';
import { TStores } from '@deriv/stores/types';
import { useDevice } from '@deriv-com/ui';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Reports from '../reports';

jest.mock('@deriv-com/ui', () => ({
    useDevice: jest.fn(),
}));

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    getSelectedRoute: jest.fn(({ routes, pathname }) => {
        return routes.find((route: { path: string }) => route.path === pathname) || routes[0];
    }),
    trackAnalyticsEvent: jest.fn(),
}));

// Mock window.location.href for redirect tests
delete (window as any).location;
window.location = { href: '', search: '' } as any;

const mockSelectNative = jest.fn();
const mockVerticalTab = jest.fn();
const route1 = '/report1';
const route2 = '/report2';
const onCloseClick = 'onclose-click';
const report1Text = 'Report 1';
const report2Text = 'Report 2';
const Loading = 'Loading';
jest.mock('@deriv/components', () => ({
    ...jest.requireActual('@deriv/components'),
    DesktopWrapper: jest.fn(({ children }) => children),
    MobileWrapper: jest.fn(({ children }) => children),
    Div100vhContainer: jest.fn(({ children }) => children),
    FadeWrapper: jest.fn(({ children }) => children),
    Loading: () => <div>{Loading}</div>,
    PageOverlay: jest.fn(({ children, onClickClose }) => (
        <div>
            <button data-testid={onCloseClick} onClick={onClickClose}>
                close
            </button>
            Overlay
            {children}
        </div>
    )),
    VerticalTab: (props: { list: { label: string }[]; vertical_tab_index?: number; [key: string]: any }) => {
        mockVerticalTab(props);

        return (
            <>
                <div>Vertical Tab </div>
                {props.list.map(item => (
                    <div key={item.label}>{item.label}</div>
                ))}
            </>
        );
    },
    SelectNative: (props: { onChange: React.ChangeEventHandler<HTMLSelectElement> | undefined; list_items: any[] }) => {
        mockSelectNative(props);
        return (
            <select onChange={props.onChange}>
                {props.list_items.map(item => (
                    <option key={item.value} value={item.value}>
                        {item.text}
                    </option>
                ))}
            </select>
        );
    },
}));

const mock = {
    client: {
        is_logged_in: true,
        is_logging_in: false,
    },
    common: {
        routeBackInApp: jest.fn(),
    },
    ui: {
        is_reports_visible: true,
        setReportsTabIndex: jest.fn(),
        reports_route_tab_index: 1,
        toggleReports: jest.fn(),
        setVerticalTabIndex: jest.fn(),
    },
};

jest.mock('@deriv/stores', () => ({
    ...jest.requireActual('@deriv/stores'),
    observer: jest.fn(x => x),
}));

const routes = [
    { path: route1, component: () => <div>{report1Text}</div>, getTitle: () => report1Text, default: true },
    { path: route2, component: () => <div>{report2Text}</div>, getTitle: () => report2Text },
];

describe('Reports', () => {
    let store = mockStore(mock);

    beforeEach(() => {
        store = mockStore(mock);
        jest.clearAllMocks();

        // Default mock for useDevice
        (useDevice as jest.Mock).mockReturnValue({
            isDesktop: false,
            isMobile: true,
            isTablet: false,
            isTabletPortrait: false,
            isMobileOrTabletLandscape: false,
        });
    });

    const renderReports = (store: TStores, history: History) => {
        render(
            <StoreProvider store={store}>
                <Router history={history}>
                    <Reports history={history} location={history.location} routes={routes} />
                </Router>
            </StoreProvider>
        );
    };
    test('renders Reports component', () => {
        const history = createMemoryHistory();
        renderReports(store, history);
        expect(screen.getAllByText(report1Text).length).toBeGreaterThan(0);
        expect(screen.getAllByText(report2Text).length).toBeGreaterThan(0);
    });

    test('shows loader when is_logged_in is false', () => {
        const history = createMemoryHistory();
        store = mockStore({
            ...mock,
            client: {
                ...mock.client,
                is_logged_in: false,
                is_logging_in: true,
            },
        });
        renderReports(store, history);
        expect(screen.getByText(Loading)).toBeInTheDocument();
    });

    test('navigates to a different route on select change', async () => {
        (useDevice as jest.Mock).mockReturnValue({
            isDesktop: false,
            isMobile: true,
            isTablet: false,
            isTabletPortrait: false,
            isMobileOrTabletLandscape: false,
        });
        const history = createMemoryHistory();
        renderReports(store, history);
        await userEvent.selectOptions(screen.getByRole('combobox'), route2);
        expect(history.location.pathname).toBe(route2);
    });

    test('calls routeBackInApp on close button click', async () => {
        const mockRouteBackInApp = jest.fn();
        store = mockStore({
            ...mock,
            common: {
                ...mock.common,
                routeBackInApp: mockRouteBackInApp,
            },
        });
        const history = createMemoryHistory();
        renderReports(store, history);
        await userEvent.click(screen.getByTestId(onCloseClick));
        expect(mockRouteBackInApp).toHaveBeenCalled();
    });

    test('calls setReportsTabIndex when VerticalTab is rendered on desktop', () => {
        (useDevice as jest.Mock).mockReturnValue({
            isDesktop: true,
            isMobile: false,
            isTablet: false,
            isTabletPortrait: false,
            isMobileOrTabletLandscape: false,
        });
        const history = createMemoryHistory();
        history.push(route1);
        renderReports(store, history);

        expect(mockVerticalTab).toHaveBeenCalledWith(
            expect.objectContaining({
                is_floating: true,
                is_routed: true,
                is_full_width: true,
                current_path: route1,
                setVerticalTabIndex: expect.any(Function),
                list: expect.any(Array),
            })
        );
    });

    test('renders correctly for different routes', () => {
        (useDevice as jest.Mock).mockReturnValue({
            isDesktop: true,
            isMobile: false,
            isTablet: false,
            isTabletPortrait: false,
            isMobileOrTabletLandscape: false,
        });
        const history = createMemoryHistory();
        history.push(route2);
        renderReports(store, history);

        expect(mockVerticalTab).toHaveBeenCalledWith(
            expect.objectContaining({
                current_path: route2,
                list: expect.arrayContaining([
                    expect.objectContaining({
                        label: report1Text,
                        path: route1,
                        default: true,
                    }),
                    expect.objectContaining({
                        label: report2Text,
                        path: route2,
                    }),
                ]),
            })
        );
    });

    describe('Redirect functionality', () => {
        beforeEach(() => {
            // Reset window.location before each test
            window.location.href = '';
            window.location.search = '';
        });

        describe('Valid redirects - Allowed domains', () => {
            test('redirects to deriv.com domain', async () => {
                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=dtrader.deriv.com'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(window.location.href).toBe('https://dtrader.deriv.com');
            });

            test('redirects to deriv.be domain', async () => {
                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=dtrader.deriv.be'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(window.location.href).toBe('https://dtrader.deriv.be');
            });

            test('redirects to deriv.me domain', async () => {
                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=dtrader.deriv.me'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(window.location.href).toBe('https://dtrader.deriv.me');
            });

            test('redirects to subdomain of allowed domain', async () => {
                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=staging-dtrader.deriv.com'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(window.location.href).toBe('https://staging-dtrader.deriv.com');
            });

            test('redirects to preview deployment domain', async () => {
                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=feature-branch.derivatives-bot.pages.dev'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(window.location.href).toBe('https://feature-branch.derivatives-bot.pages.dev');
            });

            test('redirects to main branch preview deployment', async () => {
                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=main.derivatives-bot.pages.dev'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(window.location.href).toBe('https://main.derivatives-bot.pages.dev');
            });

            test('redirects to encoded URL when redirect parameter is encoded', async () => {
                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=dtrader.deriv.com%2Fbot'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(window.location.href).toBe('https://dtrader.deriv.com/bot');
            });

            test('adds https protocol when missing', async () => {
                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=dtrader.deriv.com'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(window.location.href).toBe('https://dtrader.deriv.com');
            });
        });

        describe('Security - XSS Protection', () => {
            test('blocks javascript: protocol URLs', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });

                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=javascript:alert(document.cookie)'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });

            test('blocks javascript: protocol with mixed case', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });

                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=JaVaScRiPt:alert(1)'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });

            test('blocks encoded javascript: URLs', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });

                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=javascript%3Aalert%28%27xss%27%29'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });

            test('blocks data: protocol URLs', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });

                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=data:text/html,<script>alert(1)</script>'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });

            test('blocks vbscript: protocol URLs', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });

                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=vbscript:msgbox(1)'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });

            test('blocks URLs with leading whitespace', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });

                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=%20javascript:alert(1)'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });

            test('blocks file: protocol URLs', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });

                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=file:///etc/passwd'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });

            test('blocks blob: protocol URLs', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });

                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=blob:https://example.com/malicious'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });

            test('blocks double-encoded javascript: URLs', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });

                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=javascript%253Aalert(1)'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });

            test('blocks triple-encoded javascript: URLs', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });

                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=javascript%25253Aalert(1)'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });
        });

        describe('Security - Open Redirect Protection', () => {
            test('blocks redirect to unauthorized external domain', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });

                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=malicious-site.com'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });

            test('blocks redirect to phishing site mimicking deriv domain', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });

                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=deriv.com.phishing.com'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });

            test('blocks redirect to unauthorized preview domain', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });

                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=derivatives-bot.pages.dev'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });

            test('blocks redirect with invalid preview domain pattern', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });

                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=malicious.derivatives-bot.pages.dev.evil.com'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });

            test('blocks URLs with user credentials (phishing protection)', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });

                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=https://user:pass@evil.com'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });

            test('blocks URLs with username only', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });

                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=https://deriv.com@evil.com'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });

            test('handles protocol-relative URLs correctly', async () => {
                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=//dtrader.deriv.com'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(window.location.href).toBe('https://dtrader.deriv.com');
            });

            test('blocks extremely long URLs (DoS protection)', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });

                const longUrl = `dtrader.deriv.com/${'a'.repeat(3000)}`;
                const history = createMemoryHistory({
                    initialEntries: [`/?redirect=${longUrl}`],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });
        });

        describe('Error handling', () => {
            test('handles malformed URLs gracefully', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });

                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=ht!tp://invalid'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });

            test('calls routeBackInApp when no redirect parameter is present', async () => {
                const mockRouteBackInApp = jest.fn();
                store = mockStore({
                    ...mock,
                    common: {
                        ...mock.common,
                        routeBackInApp: mockRouteBackInApp,
                    },
                });
                const history = createMemoryHistory({
                    initialEntries: ['/'],
                });

                renderReports(store, history);
                await userEvent.click(screen.getByTestId(onCloseClick));

                expect(mockRouteBackInApp).toHaveBeenCalled();
                expect(window.location.href).toBe('');
            });
        });

        describe('Component behavior', () => {
            test('captures redirect parameter on component mount', () => {
                const history = createMemoryHistory({
                    initialEntries: ['/?redirect=dtrader.deriv.com'],
                });

                renderReports(store, history);

                // The component should render without errors when redirect parameter is present
                expect(screen.getByTestId(onCloseClick)).toBeInTheDocument();
            });

            test('handles navigation without redirect parameter', () => {
                const history = createMemoryHistory({
                    initialEntries: ['/'],
                });

                renderReports(store, history);

                // The component should render normally without redirect parameter
                expect(screen.getByTestId(onCloseClick)).toBeInTheDocument();
            });
        });
    });
});
