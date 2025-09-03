import { ActiveSymbols } from '@deriv/api-types';
import { getTradeURLParams, setTradeURLParams } from '../trade-url-params-config';
import { TRADE_TYPES } from '../contract';
import { routes } from '../../routes';

// Mock window.location and window.history
const mockLocation = {
    pathname: routes.index,
    search: '',
    href: routes.index,
};

const mockHistory = {
    replaceState: jest.fn(),
};

describe('getTradeURLParams', () => {
    const mockActiveSymbols = [
        {
            symbol: 'R_100',
            underlying_symbol: 'R_100',
            display_name: 'Volatility 100 Index',
        },
        {
            symbol: 'frxEURUSD',
            underlying_symbol: 'frxEURUSD',
            display_name: 'EUR/USD',
        },
    ] as ActiveSymbols;

    const mockContractTypesList = {
        Accumulators: {
            name: 'Accumulators',
            categories: [{ value: TRADE_TYPES.ACCUMULATOR, text: 'Accumulators' }],
        },
        'Rise/Fall': {
            name: 'Rise/Fall',
            categories: [
                { value: TRADE_TYPES.RISE_FALL, text: 'Rise/Fall' },
                { value: 'call', text: 'Higher' },
                { value: 'put', text: 'Lower' },
            ],
        },
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Mock clean window.location
        Object.defineProperty(window, 'location', {
            configurable: true,
            enumerable: true,
            value: { ...mockLocation, search: '' },
        });
    });

    describe('when URL has no search params', () => {
        it('should return empty object when no search params', () => {
            expect(getTradeURLParams()).toEqual({});
        });

        it('should return empty object even with arguments provided', () => {
            expect(
                getTradeURLParams({
                    active_symbols: mockActiveSymbols,
                    contract_types_list: mockContractTypesList,
                })
            ).toEqual({});
        });
    });

    describe('chart_type parameter handling', () => {
        it('should return correct chartType for "area"', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?chart_type=area' },
            });

            expect(getTradeURLParams()).toEqual({
                chartType: 'line',
            });
        });

        it('should return correct chartType for "candle"', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?chart_type=candle' },
            });

            expect(getTradeURLParams()).toEqual({
                chartType: 'candles',
            });
        });

        it('should return correct chartType for "hollow"', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?chart_type=hollow' },
            });

            expect(getTradeURLParams()).toEqual({
                chartType: 'hollow',
            });
        });

        it('should return correct chartType for "ohlc"', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?chart_type=ohlc' },
            });

            expect(getTradeURLParams()).toEqual({
                chartType: 'ohlc',
            });
        });

        it('should ignore invalid chart_type', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?chart_type=invalid' },
            });

            expect(getTradeURLParams()).toEqual({});
        });
    });

    describe('interval parameter handling', () => {
        it('should return granularity 0 for "1t" interval', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?interval=1t' },
            });

            expect(getTradeURLParams()).toEqual({
                granularity: 0,
            });
        });

        it('should return granularity 60 for "1m" interval', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?interval=1m' },
            });

            expect(getTradeURLParams()).toEqual({
                granularity: 60,
            });
        });

        it('should return granularity 3600 for "1h" interval', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?interval=1h' },
            });

            expect(getTradeURLParams()).toEqual({
                granularity: 3600,
            });
        });

        it('should return granularity 86400 for "1d" interval', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?interval=1d' },
            });

            expect(getTradeURLParams()).toEqual({
                granularity: 86400,
            });
        });

        it('should ignore invalid interval', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?interval=invalid' },
            });

            expect(getTradeURLParams()).toEqual({});
        });
    });

    describe('chart_type and interval interaction', () => {
        it('should force chartType to "line" when interval is "1t" regardless of chart_type', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?chart_type=candle&interval=1t' },
            });

            expect(getTradeURLParams()).toEqual({
                chartType: 'line',
                granularity: 0,
            });
        });

        it('should use provided chartType when interval is not "1t"', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?chart_type=candle&interval=1m' },
            });

            expect(getTradeURLParams()).toEqual({
                chartType: 'candles',
                granularity: 60,
            });
        });

        it('should handle valid chart_type with invalid interval', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?chart_type=area&interval=invalid' },
            });

            expect(getTradeURLParams()).toEqual({
                chartType: 'line',
            });
        });
    });

    describe('symbol parameter handling', () => {
        it('should return symbol when valid and active_symbols provided', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?symbol=R_100' },
            });

            expect(getTradeURLParams({ active_symbols: mockActiveSymbols })).toEqual({
                symbol: 'R_100',
            });
        });

        it('should validate against underlying_symbol property', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?symbol=frxEURUSD' },
            });

            expect(getTradeURLParams({ active_symbols: mockActiveSymbols })).toEqual({
                symbol: 'frxEURUSD',
            });
        });

        it('should not return symbol when active_symbols not provided', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?symbol=R_100' },
            });

            expect(getTradeURLParams()).toEqual({});
        });

        it('should return showModal when symbol is invalid but active_symbols provided', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?symbol=INVALID' },
            });

            expect(getTradeURLParams({ active_symbols: mockActiveSymbols })).toEqual({
                showModal: true,
            });
        });

        it('should not show modal for invalid symbol when active_symbols is empty', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?symbol=INVALID' },
            });

            expect(getTradeURLParams({ active_symbols: [] })).toEqual({});
        });
    });

    describe('trade_type parameter handling', () => {
        it('should return contractType when valid and contract_types_list provided', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?trade_type=accumulator' },
            });

            expect(getTradeURLParams({ contract_types_list: mockContractTypesList })).toEqual({
                contractType: 'accumulator',
            });
        });

        it('should return contractType for nested category values', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?trade_type=call' },
            });

            expect(getTradeURLParams({ contract_types_list: mockContractTypesList })).toEqual({
                contractType: 'call',
            });
        });

        it('should return contractType when contract_types_list is empty (any non-empty trade_type is valid)', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?trade_type=any_type' },
            });

            expect(getTradeURLParams({ contract_types_list: {} })).toEqual({
                contractType: 'any_type',
            });
        });

        it('should not return contractType for empty trade_type even when contract_types_list is empty', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?trade_type=' },
            });

            expect(getTradeURLParams({ contract_types_list: {} })).toEqual({});
        });

        it('should return showModal when trade_type is invalid and contract_types_list provided', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?trade_type=INVALID' },
            });

            expect(getTradeURLParams({ contract_types_list: mockContractTypesList })).toEqual({
                showModal: true,
            });
        });

        it('should not show modal for invalid trade_type when contract_types_list is empty', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: { ...mockLocation, search: '?trade_type=INVALID' },
            });

            expect(getTradeURLParams({ contract_types_list: {} })).toEqual({
                contractType: 'INVALID',
            });
        });
    });

    describe('complex scenarios', () => {
        it('should handle multiple valid params', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: {
                    ...mockLocation,
                    search: '?symbol=R_100&trade_type=accumulator&chart_type=candle&interval=1m',
                },
            });

            expect(
                getTradeURLParams({
                    active_symbols: mockActiveSymbols,
                    contract_types_list: mockContractTypesList,
                })
            ).toEqual({
                symbol: 'R_100',
                contractType: 'accumulator',
                chartType: 'candles',
                granularity: 60,
            });
        });

        it('should show modal when both symbol and trade_type are invalid', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: {
                    ...mockLocation,
                    search: '?symbol=INVALID&trade_type=INVALID&chart_type=area&interval=1t',
                },
            });

            expect(
                getTradeURLParams({
                    active_symbols: mockActiveSymbols,
                    contract_types_list: mockContractTypesList,
                })
            ).toEqual({
                chartType: 'line',
                granularity: 0,
                showModal: true,
            });
        });

        it('should handle mix of valid and invalid params', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: {
                    ...mockLocation,
                    search: '?symbol=R_100&trade_type=INVALID&chart_type=invalid&interval=1m',
                },
            });

            expect(
                getTradeURLParams({
                    active_symbols: mockActiveSymbols,
                    contract_types_list: mockContractTypesList,
                })
            ).toEqual({
                symbol: 'R_100',
                granularity: 60,
                showModal: true,
            });
        });

        it('should handle 1t interval overriding chart_type with other valid params', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: {
                    ...mockLocation,
                    search: '?symbol=R_100&trade_type=accumulator&chart_type=ohlc&interval=1t',
                },
            });

            expect(
                getTradeURLParams({
                    active_symbols: mockActiveSymbols,
                    contract_types_list: mockContractTypesList,
                })
            ).toEqual({
                symbol: 'R_100',
                contractType: 'accumulator',
                chartType: 'line', // forced to 'line' because interval is '1t'
                granularity: 0,
            });
        });
    });
});

describe('setTradeURLParams', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        // Mock window.location with clean state
        Object.defineProperty(window, 'location', {
            configurable: true,
            enumerable: true,
            value: { ...mockLocation, search: '' },
        });

        // Mock window.history
        Object.defineProperty(window, 'history', {
            configurable: true,
            enumerable: true,
            value: mockHistory,
        });
    });

    describe('single parameter updates', () => {
        it('should set interval=1t for granularity 0', () => {
            setTradeURLParams({ granularity: 0 });

            expect(mockHistory.replaceState).toHaveBeenCalledWith({}, document.title, `${routes.index}?interval=1t`);
        });

        it('should set interval=1m for granularity 60', () => {
            setTradeURLParams({ granularity: 60 });

            expect(mockHistory.replaceState).toHaveBeenCalledWith({}, document.title, `${routes.index}?interval=1m`);
        });

        it('should set interval=1h for granularity 3600', () => {
            setTradeURLParams({ granularity: 3600 });

            expect(mockHistory.replaceState).toHaveBeenCalledWith({}, document.title, `${routes.index}?interval=1h`);
        });

        it('should set chart_type=area for chartType "line"', () => {
            setTradeURLParams({ chartType: 'line' });

            expect(mockHistory.replaceState).toHaveBeenCalledWith(
                {},
                document.title,
                `${routes.index}?chart_type=area`
            );
        });

        it('should set chart_type=candle for chartType "candles"', () => {
            setTradeURLParams({ chartType: 'candles' });

            expect(mockHistory.replaceState).toHaveBeenCalledWith(
                {},
                document.title,
                `${routes.index}?chart_type=candle`
            );
        });

        it('should set chart_type=hollow for chartType "hollow"', () => {
            setTradeURLParams({ chartType: 'hollow' });

            expect(mockHistory.replaceState).toHaveBeenCalledWith(
                {},
                document.title,
                `${routes.index}?chart_type=hollow`
            );
        });

        it('should set chart_type=ohlc for chartType "ohlc"', () => {
            setTradeURLParams({ chartType: 'ohlc' });

            expect(mockHistory.replaceState).toHaveBeenCalledWith(
                {},
                document.title,
                `${routes.index}?chart_type=ohlc`
            );
        });

        it('should set symbol parameter', () => {
            setTradeURLParams({ symbol: 'R_100' });

            expect(mockHistory.replaceState).toHaveBeenCalledWith({}, document.title, `${routes.index}?symbol=R_100`);
        });

        it('should set trade_type parameter', () => {
            setTradeURLParams({ contractType: 'accumulator' });

            expect(mockHistory.replaceState).toHaveBeenCalledWith(
                {},
                document.title,
                `${routes.index}?trade_type=accumulator`
            );
        });
    });

    describe('multiple parameter updates', () => {
        it('should set multiple query params when multiple values are provided', () => {
            setTradeURLParams({
                granularity: 0,
                chartType: 'line',
                symbol: 'R_100',
                contractType: 'accumulator',
            });

            expect(mockHistory.replaceState).toHaveBeenCalledWith(
                {},
                document.title,
                `${routes.index}?chart_type=area&interval=1t&symbol=R_100&trade_type=accumulator`
            );
        });

        it('should handle partial updates', () => {
            setTradeURLParams({
                symbol: 'R_100',
                contractType: 'accumulator',
            });

            expect(mockHistory.replaceState).toHaveBeenCalledWith(
                {},
                document.title,
                `${routes.index}?symbol=R_100&trade_type=accumulator`
            );
        });

        it('should handle chartType and granularity combination', () => {
            setTradeURLParams({
                chartType: 'candles',
                granularity: 60,
            });

            expect(mockHistory.replaceState).toHaveBeenCalledWith(
                {},
                document.title,
                `${routes.index}?chart_type=candle&interval=1m`
            );
        });
    });

    describe('edge cases and validation', () => {
        it('should not call replaceState when no params provided', () => {
            setTradeURLParams({});

            expect(mockHistory.replaceState).not.toHaveBeenCalled();
        });

        it('should not call replaceState when pathname is not routes.index', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: {
                    ...mockLocation,
                    pathname: '/different-route',
                    search: '',
                },
            });

            setTradeURLParams({ symbol: 'R_100' });

            expect(mockHistory.replaceState).not.toHaveBeenCalled();
        });

        it('should handle NaN granularity gracefully', () => {
            setTradeURLParams({ granularity: NaN });

            expect(mockHistory.replaceState).not.toHaveBeenCalled();
        });

        it('should handle undefined values gracefully', () => {
            setTradeURLParams({
                symbol: undefined,
                chartType: undefined,
                contractType: undefined,
                granularity: undefined,
            });

            expect(mockHistory.replaceState).not.toHaveBeenCalled();
        });

        it('should handle null granularity as 0', () => {
            setTradeURLParams({ granularity: null });

            expect(mockHistory.replaceState).toHaveBeenCalledWith({}, document.title, `${routes.index}?interval=1t`);
        });

        it('should handle empty string values gracefully', () => {
            setTradeURLParams({
                symbol: '',
                chartType: '',
                contractType: '',
            });

            expect(mockHistory.replaceState).not.toHaveBeenCalled();
        });

        it('should handle invalid chartType by setting empty chart_type param', () => {
            setTradeURLParams({ chartType: 'invalid_chart_type' });

            expect(mockHistory.replaceState).toHaveBeenCalledWith({}, document.title, `${routes.index}?chart_type=`);
        });

        it('should handle invalid granularity by setting empty interval param', () => {
            setTradeURLParams({ granularity: 999999 });

            expect(mockHistory.replaceState).toHaveBeenCalledWith({}, document.title, `${routes.index}?interval=`);
        });
    });

    describe('URL state management', () => {
        it('should preserve existing params when adding new ones', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: {
                    ...mockLocation,
                    search: '?existing_param=value',
                },
            });

            setTradeURLParams({ symbol: 'R_100' });

            expect(mockHistory.replaceState).toHaveBeenCalledWith(
                {},
                document.title,
                `${routes.index}?existing_param=value&symbol=R_100`
            );
        });

        it('should update existing params', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: {
                    ...mockLocation,
                    search: '?symbol=OLD_SYMBOL&chart_type=candle',
                },
            });

            setTradeURLParams({ symbol: 'NEW_SYMBOL' });

            expect(mockHistory.replaceState).toHaveBeenCalledWith(
                {},
                document.title,
                `${routes.index}?symbol=NEW_SYMBOL&chart_type=candle`
            );
        });

        it('should add new params to existing ones', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: {
                    ...mockLocation,
                    search: '?symbol=R_100',
                },
            });

            setTradeURLParams({ contractType: 'accumulator' });

            expect(mockHistory.replaceState).toHaveBeenCalledWith(
                {},
                document.title,
                `${routes.index}?symbol=R_100&trade_type=accumulator`
            );
        });

        it('should handle complex existing URL state', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: {
                    ...mockLocation,
                    search: '?symbol=R_100&chart_type=area&other_param=value',
                },
            });

            setTradeURLParams({
                granularity: 60,
                contractType: 'accumulator',
            });

            expect(mockHistory.replaceState).toHaveBeenCalledWith(
                {},
                document.title,
                `${routes.index}?symbol=R_100&chart_type=area&other_param=value&interval=1m&trade_type=accumulator`
            );
        });
    });

    describe('pathname validation', () => {
        it('should work when pathname is exactly routes.index', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: {
                    ...mockLocation,
                    pathname: routes.index, // '/'
                    search: '',
                },
            });

            setTradeURLParams({ symbol: 'R_100' });

            expect(mockHistory.replaceState).toHaveBeenCalledWith({}, document.title, `${routes.index}?symbol=R_100`);
        });

        it('should not work when pathname is different from routes.index', () => {
            Object.defineProperty(window, 'location', {
                configurable: true,
                value: {
                    ...mockLocation,
                    pathname: '/reports',
                    search: '',
                },
            });

            setTradeURLParams({ symbol: 'R_100' });

            expect(mockHistory.replaceState).not.toHaveBeenCalled();
        });
    });
});
