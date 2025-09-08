import React from 'react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import { ReportsStoreProvider } from '@deriv/reports/src/Stores/useReportsStores';
import { mockStore } from '@deriv/stores';
import { render, screen, fireEvent } from '@testing-library/react';

import ModulesProvider from 'Stores/Providers/modules-providers';
import TraderProviders from '../../../../trader-providers';
import Trade from '../trade';

// Mock all external dependencies
jest.mock('@deriv/components', () => ({
    ...jest.requireActual('@deriv/components'),
    Loading: {
        DTraderV2: jest.fn(() => <div data-testid='dt_trade_loader'>Loading...</div>),
    },
}));

jest.mock('@deriv/api', () => ({
    useLocalStorageData: jest.fn(() => [{ trade_page: false }]),
}));

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    getSymbolDisplayName: jest.fn((symbols, symbol) => `${symbol} Display Name`),
    redirectToLogin: jest.fn(),
    redirectToSignUp: jest.fn(),
    getBrandUrl: jest.fn(() => 'https://deriv.com'),
    isEmptyObject: jest.fn(obj => !obj || Object.keys(obj).length === 0),
}));

jest.mock('Modules/Trading/Helpers/digits', () => ({
    isDigitTradeType: jest.fn(
        contract_type =>
            contract_type === 'even_odd' || contract_type === 'match_diff' || contract_type === 'over_under'
    ),
}));

// Mock all components
jest.mock('AppV2/Components/AccumulatorStats', () =>
    jest.fn(() => <div data-testid='accumulator-stats'>AccumulatorStats</div>)
);
jest.mock('AppV2/Components/BottomNav', () =>
    jest.fn(({ children, onScroll }) => (
        <div data-testid='bottom-nav' onScroll={onScroll}>
            {children}
        </div>
    ))
);
jest.mock('AppV2/Components/ClosedMarketMessage', () =>
    jest.fn(() => <div data-testid='closed-market-message'>ClosedMarketMessage</div>)
);
jest.mock('AppV2/Components/CurrentSpot', () => jest.fn(() => <div data-testid='current-spot'>CurrentSpot</div>));
jest.mock('AppV2/Components/MarketSelector', () =>
    jest.fn(() => <div data-testid='market-selector'>MarketSelector</div>)
);
jest.mock('AppV2/Components/OnboardingGuide/GuideForPages', () =>
    jest.fn(() => <div data-testid='onboarding-guide'>OnboardingGuide</div>)
);
jest.mock('AppV2/Components/PurchaseButton', () =>
    jest.fn(() => <div data-testid='purchase-button'>PurchaseButton</div>)
);
jest.mock('AppV2/Components/ServiceErrorSheet', () =>
    jest.fn(() => <div data-testid='service-error-sheet'>ServiceErrorSheet</div>)
);
jest.mock('AppV2/Components/TradeErrorSnackbar', () =>
    jest.fn(() => <div data-testid='trade-error-snackbar'>TradeErrorSnackbar</div>)
);
jest.mock('AppV2/Components/TradeParameters', () => ({
    TradeParametersContainer: jest.fn(({ children }) => <div data-testid='trade-params-container'>{children}</div>),
    TradeParameters: jest.fn(() => <div data-testid='trade-parameters'>TradeParameters</div>),
}));
jest.mock('../../Chart', () => ({
    TradeChart: jest.fn(() => <div data-testid='trade-chart'>TradeChart</div>),
}));
jest.mock('../trade-types', () => jest.fn(() => <div data-testid='trade-types'>TradeTypes</div>));

// Mock analytics
jest.mock('../../../../Analytics', () => ({
    sendSelectedTradeTypeToAnalytics: jest.fn(),
}));

// Mock layout utils
jest.mock('AppV2/Utils/layout-utils', () => ({
    getChartHeight: jest.fn(() => 400),
    HEIGHT: { BOTTOM_NAV: 60 },
    checkIsServiceModalError: jest.fn(() => true),
    SERVICE_ERROR: {
        INSUFFICIENT_BALANCE: 'InsufficientBalance',
        AUTHORIZATION_REQUIRED: 'AuthorizationRequired',
    },
}));

// Mock trade types utils
jest.mock('AppV2/Utils/trade-types-utils', () => ({
    getDisplayedContractTypes: jest.fn(() => ['rise_fall', 'higher_lower']),
}));

// Default mock data
const mockTradeTypes = [
    { text: 'Rise/Fall', value: 'rise_fall' },
    { text: 'Higher/Lower', value: 'higher_lower' },
];

const mockActiveSymbols = [
    {
        symbol: 'cryBTCUSD',
        display_name: 'BTC/USD',
        market: 'cryptocurrency',
        submarket: 'non_stable_coin',
    },
];

// Mock hooks
const mockUseContractsFor = jest.fn(() => ({
    trade_types: mockTradeTypes,
    is_fetching_ref: { current: false },
    resetTradeTypes: jest.fn(),
}));

const mockUseDefaultSymbol = jest.fn(() => ({
    symbol: 'cryBTCUSD',
}));

const mockUseTraderStore = jest.fn(() => ({
    active_symbols: mockActiveSymbols,
    contract_type: 'rise_fall',
    has_cancellation: false,
    is_accumulator: false,
    is_multiplier: false,
    is_market_closed: false,
    onChange: jest.fn(),
    onMount: jest.fn(),
    onUnmount: jest.fn(),
    symbol: 'cryBTCUSD',
    proposal_info: {},
    trade_types: {
        rise_fall: {},
        higher_lower: {},
    },
    trade_type_tab: '',
    clearPurchaseInfo: jest.fn(),
    requestProposal: jest.fn(),
}));

jest.mock('AppV2/Hooks/useContractsFor', () => ({
    __esModule: true,
    default: () => mockUseContractsFor(),
}));

jest.mock('AppV2/Hooks/useDefaultSymbol', () => ({
    __esModule: true,
    default: () => mockUseDefaultSymbol(),
}));

jest.mock('Stores/useTraderStores', () => ({
    TraderStoreProvider: ({ children }: { children: React.ReactNode }) => (
        <div data-testid='trader-store-provider'>{children}</div>
    ),
    useTraderStore: () => mockUseTraderStore(),
}));

describe('Trade', () => {
    let default_mock_store: ReturnType<typeof mockStore>, history: ReturnType<typeof createMemoryHistory>;

    beforeEach(() => {
        history = createMemoryHistory();
        default_mock_store = mockStore({
            client: {
                is_logged_in: true,
                is_virtual: false,
            },
            common: {
                current_language: 'EN',
                network_status: { class: 'online' },
                services_error: undefined,
                resetServicesError: jest.fn(),
            },
            ui: {
                is_dark_mode_on: false,
            },
        });

        // Reset all mocks to defaults
        mockUseContractsFor.mockReturnValue({
            trade_types: mockTradeTypes,
            is_fetching_ref: { current: false },
            resetTradeTypes: jest.fn(),
        });

        mockUseTraderStore.mockReturnValue({
            active_symbols: mockActiveSymbols,
            contract_type: 'rise_fall',
            has_cancellation: false,
            is_accumulator: false,
            is_multiplier: false,
            is_market_closed: false,
            onChange: jest.fn(),
            onMount: jest.fn(),
            onUnmount: jest.fn(),
            symbol: 'cryBTCUSD',
            proposal_info: {},
            trade_types: {
                rise_fall: {},
                higher_lower: {},
            },
            trade_type_tab: '',
            clearPurchaseInfo: jest.fn(),
            requestProposal: jest.fn(),
        });

        jest.clearAllMocks();
    });

    const renderTrade = () => {
        return render(
            <Router history={history}>
                <TraderProviders store={default_mock_store}>
                    <ReportsStoreProvider>
                        <ModulesProvider store={default_mock_store}>
                            <Trade />
                        </ModulesProvider>
                    </ReportsStoreProvider>
                </TraderProviders>
            </Router>
        );
    };

    describe('Loading States', () => {
        it('should render loading component when symbols are empty', () => {
            mockUseTraderStore.mockReturnValue({
                ...mockUseTraderStore(),
                active_symbols: [],
            });

            renderTrade();

            expect(screen.getByTestId('dt_trade_loader')).toBeInTheDocument();
        });

        it('should render loading component when trade_types are empty', () => {
            mockUseContractsFor.mockReturnValue({
                trade_types: [],
                is_fetching_ref: { current: false },
                resetTradeTypes: jest.fn(),
            });

            renderTrade();

            expect(screen.getByTestId('dt_trade_loader')).toBeInTheDocument();
        });
    });

    describe('Main Trading Interface', () => {
        it('should render all main trading components when data is loaded', () => {
            renderTrade();

            expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
            expect(screen.getByTestId('trade-types')).toBeInTheDocument();
            expect(screen.getByTestId('market-selector')).toBeInTheDocument();
            expect(screen.getAllByTestId('trade-params-container')).toHaveLength(2);
            expect(screen.getAllByTestId('trade-parameters')).toHaveLength(2);
            expect(screen.getByTestId('trade-chart')).toBeInTheDocument();
            expect(screen.getByTestId('purchase-button')).toBeInTheDocument();
            expect(screen.getByTestId('service-error-sheet')).toBeInTheDocument();
            expect(screen.getByTestId('closed-market-message')).toBeInTheDocument();
            expect(screen.getByTestId('trade-error-snackbar')).toBeInTheDocument();
        });

        it('should call onMount on component mount', () => {
            const mockOnMount = jest.fn();
            mockUseTraderStore.mockReturnValue({
                ...mockUseTraderStore(),
                onMount: mockOnMount,
            });

            renderTrade();

            expect(mockOnMount).toHaveBeenCalled();
        });

        it('should handle scroll events on BottomNav', () => {
            // Mock getBoundingClientRect
            const mockGetBoundingClientRect = jest.fn(() => ({
                bottom: 500,
            }));

            Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
                value: mockGetBoundingClientRect,
                writable: true,
            });

            renderTrade();

            const bottomNav = screen.getByTestId('bottom-nav');
            fireEvent.scroll(bottomNav);

            expect(mockGetBoundingClientRect).toHaveBeenCalled();
        });
    });

    describe('Conditional Rendering', () => {
        it('should render CurrentSpot when contract type is digit type', () => {
            mockUseTraderStore.mockReturnValue({
                ...mockUseTraderStore(),
                contract_type: 'even_odd',
            });

            renderTrade();

            expect(screen.getByTestId('current-spot')).toBeInTheDocument();
        });

        it('should not render CurrentSpot for non-digit contract types', () => {
            mockUseTraderStore.mockReturnValue({
                ...mockUseTraderStore(),
                contract_type: 'rise_fall',
            });

            renderTrade();

            expect(screen.queryByTestId('current-spot')).not.toBeInTheDocument();
        });

        it('should render AccumulatorStats when is_accumulator is true', () => {
            mockUseTraderStore.mockReturnValue({
                ...mockUseTraderStore(),
                is_accumulator: true,
            });

            renderTrade();

            expect(screen.getByTestId('accumulator-stats')).toBeInTheDocument();
        });

        it('should not render AccumulatorStats when is_accumulator is false', () => {
            renderTrade();

            expect(screen.queryByTestId('accumulator-stats')).not.toBeInTheDocument();
        });

        it('should not render PurchaseButton when market is closed', () => {
            mockUseTraderStore.mockReturnValue({
                ...mockUseTraderStore(),
                is_market_closed: true,
            });

            renderTrade();

            expect(screen.queryByTestId('purchase-button')).not.toBeInTheDocument();
        });

        it('should render OnboardingGuide when user is logged in and guide is not completed', () => {
            const { useLocalStorageData } = jest.requireMock('@deriv/api');
            useLocalStorageData.mockReturnValue([{ trade_page: false }]);

            renderTrade();

            expect(screen.getByTestId('onboarding-guide')).toBeInTheDocument();
        });

        it('should not render OnboardingGuide when user is not logged in', () => {
            default_mock_store.client.is_logged_in = false;

            renderTrade();

            expect(screen.queryByTestId('onboarding-guide')).not.toBeInTheDocument();
        });

        it('should not render OnboardingGuide when guide is completed', () => {
            const { useLocalStorageData } = jest.requireMock('@deriv/api');
            useLocalStorageData.mockReturnValue([{ trade_page: true }]);

            renderTrade();

            expect(screen.queryByTestId('onboarding-guide')).not.toBeInTheDocument();
        });
    });

    describe('Component Behavior', () => {
        it('should render trade parameters in both normal and minimized containers', () => {
            renderTrade();

            const tradeParamsContainers = screen.getAllByTestId('trade-params-container');
            const tradeParameters = screen.getAllByTestId('trade-parameters');

            expect(tradeParamsContainers).toHaveLength(2);
            expect(tradeParameters).toHaveLength(2);
        });
    });
});
