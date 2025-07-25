import React from 'react';

import { ActiveSymbols } from '@deriv/api-types';
import { mockStore } from '@deriv/stores';
import { TCoreStores } from '@deriv/stores/types';
import { useSnackbar } from '@deriv-com/quill-ui';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ModulesProvider from 'Stores/Providers/modules-providers';

import TraderProviders from '../../../../trader-providers';
import MarketCategoryItem from '..';

jest.mock('@deriv/quill-icons', () => ({
    ...jest.requireActual('@deriv/quill-icons'),
    StandaloneStarFillIcon: () => 'MockedStandaloneStarFillIcon',
    StandaloneStarRegularIcon: () => 'MockedStandaloneStarRegularIcon',
}));

jest.mock('@deriv-com/quill-ui', () => ({
    ...jest.requireActual('@deriv-com/quill-ui'),
    useSnackbar: jest.fn(),
}));

jest.mock('AppV2/Components/SymbolIconsMapper/symbol-icons-mapper', () =>
    jest.fn(() => <div>MockedSymbolIconsMapper</div>)
);
describe('<MarketCategoryItem />', () => {
    const mocked_props = {
        item: { symbol: 'cryBTCUSD', display_name: 'Bitcoin', exchange_is_open: 1 } as ActiveSymbols[0],
        selectedSymbol: 'cryBTCUSD',
        setSelectedSymbol: jest.fn(),
        setIsOpen: jest.fn(),
    };
    const mocked_store = {
        modules: {
            trade: {
                onChange: jest.fn(),
            },
            markets: {
                favoriteSymbols: [
                    { display_name: 'Symbol 1', symbol: 'SYMBOL1' },
                    { display_name: 'Symbol 2', symbol: 'SYMBOL2' },
                ],
                setFavoriteSymbols: jest.fn(),
                removeFavoriteSymbol: jest.fn(),
            },
        },
        ui: {
            is_dark_mode_on: false,
        },
    };
    const MockMarketCategoryItem = (
        mocked_store: TCoreStores,
        mocked_props: Parameters<typeof MarketCategoryItem>[0]
    ) => {
        return (
            <TraderProviders store={mocked_store}>
                <ModulesProvider store={mocked_store}>
                    <MarketCategoryItem {...mocked_props} />
                </ModulesProvider>
            </TraderProviders>
        );
    };

    const mockAddSnackbar = jest.fn();

    beforeAll(() => {
        (useSnackbar as jest.Mock).mockReturnValue({ addSnackbar: mockAddSnackbar });
    });

    const display_name = 'Bitcoin';

    it('should render content correctly when market is open', () => {
        render(MockMarketCategoryItem(mockStore(mocked_store), mocked_props));
        expect(screen.getByText('MockedSymbolIconsMapper')).toBeInTheDocument();
        expect(screen.getByText(display_name)).toBeInTheDocument();
        expect(screen.getByText('MockedStandaloneStarRegularIcon')).toBeInTheDocument();
    });
    it('should render Closed tag when market is closed', () => {
        const changed_props = {
            ...mocked_props,
            item: { symbol: 'cryBTCUSD', display_name: 'Bitcoin', exchange_is_open: 0 } as ActiveSymbols[0],
        };
        render(MockMarketCategoryItem(mockStore(mocked_store), changed_props));
        expect(screen.getByText('CLOSED')).toBeInTheDocument();
    });
    it('should handle item selection', async () => {
        render(MockMarketCategoryItem(mockStore(mocked_store), mocked_props));
        await userEvent.click(screen.getByText(display_name));
        expect(mocked_props.setSelectedSymbol).toHaveBeenCalledWith('cryBTCUSD');
    });
    it('should toggle favorites correctly', async () => {
        render(MockMarketCategoryItem(mockStore(mocked_store), mocked_props));
        await userEvent.click(screen.getByText('MockedStandaloneStarRegularIcon'));

        expect(mocked_store.modules.markets.setFavoriteSymbols).toHaveBeenCalled();
        expect(mockAddSnackbar).toHaveBeenCalled();
    });
});
