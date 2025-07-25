import React from 'react';

import { mockStore } from '@deriv/stores';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TraderProviders from '../../../../../../../trader-providers';
import TakeProfit from '../take-profit';

describe('<TakeProfit />', () => {
    let default_mocked_store: ReturnType<typeof mockStore>,
        default_mocked_props: React.ComponentProps<typeof TakeProfit>;
    const popoverTestid = 'dt_popover_wrapper';
    const takeProfitTooltipText = /When your profit reaches/i;
    const takeProfitTooltipTextForAcc = /Take profit can't be adjusted after your contract starts./i;

    beforeEach(() => {
        default_mocked_store = {
            ...mockStore({}),
            modules: {
                trade: {
                    is_accumulator: false,
                    is_multiplier: true,
                    has_open_accu_contract: false,
                    amount: 10,
                    validation_errors: { stop_loss_error: ['mocked_error', 'mocked_error'] },
                    take_profit: '10',
                    has_take_profit: true,
                    onChangeMultiple: jest.fn(),
                    onChange: jest.fn(),
                },
            },
        };

        default_mocked_props = {
            has_take_profit: true,
            onChange: jest.fn(),
            onChangeMultiple: jest.fn(),
            take_profit: '10',
            validation_errors: { stop_loss_error: ['mocked_error', 'mocked_error'] },
        };
    });

    const mockTakeProfit = () => {
        return (
            <TraderProviders store={default_mocked_store}>
                <TakeProfit {...default_mocked_props} />
            </TraderProviders>
        );
    };

    it('should render Take profit input with checkbox', () => {
        render(mockTakeProfit());

        expect(screen.getByText('Take profit')).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
    it('should call onChangeMultiple if user clicked on checkbox', async () => {
        render(mockTakeProfit());

        await userEvent.click(screen.getByRole('checkbox'));

        expect(default_mocked_props.onChangeMultiple).toBeCalled();
    });
    it('should call onChange if user changed value in input', async () => {
        render(mockTakeProfit());

        await userEvent.type(screen.getByRole('textbox'), '20');

        expect(default_mocked_props.onChange).toBeCalled();
    });
    it('should render functioning Take profits input with checkbox if props were not passed (backup should work)', async () => {
        default_mocked_props = {};
        render(mockTakeProfit());

        const check_box = screen.getByRole('checkbox');
        const input = screen.getByRole('textbox');

        expect(screen.getByText('Take profit')).toBeInTheDocument();
        expect(check_box).toBeInTheDocument();
        expect(input).toBeInTheDocument();

        await userEvent.click(check_box);
        expect(default_mocked_store.modules.trade.onChangeMultiple).toBeCalled();

        await userEvent.type(input, '20');
        expect(default_mocked_store.modules.trade.onChange).toBeCalled();
    });
    it('should render correct text of the tooltip for Multipliers', async () => {
        render(mockTakeProfit());

        expect(screen.queryByText(takeProfitTooltipText)).not.toBeInTheDocument();
        await userEvent.hover(screen.getByTestId(popoverTestid));

        expect(screen.getByText(takeProfitTooltipText)).toBeInTheDocument();
    });
    it('should render correct text of the tooltip for Accumulators', async () => {
        default_mocked_store.modules.trade.is_accumulator = true;
        default_mocked_store.modules.trade.is_multiplier = false;
        render(mockTakeProfit());

        expect(screen.queryByText(takeProfitTooltipTextForAcc)).not.toBeInTheDocument();
        await userEvent.hover(screen.getByTestId(popoverTestid));

        expect(screen.getByText(takeProfitTooltipTextForAcc)).toBeInTheDocument();
    });
});
