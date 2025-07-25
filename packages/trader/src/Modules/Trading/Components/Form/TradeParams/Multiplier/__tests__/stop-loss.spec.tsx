import React from 'react';

import { mockStore } from '@deriv/stores';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TraderProviders from '../../../../../../../trader-providers';
import StopLoss from '../stop-loss';

describe('<StopLoss />', () => {
    let default_mocked_store: ReturnType<typeof mockStore>, default_mocked_props: React.ComponentProps<typeof StopLoss>;

    beforeEach(() => {
        default_mocked_store = {
            ...mockStore({}),
            modules: {
                trade: {
                    amount: 10,
                    currency: 'USD',
                    validation_errors: { take_profit_error: ['mocked_error', 'mocked_error'] },
                    stop_loss: '10',
                    has_stop_loss: true,
                    onChangeMultiple: jest.fn(),
                    onChange: jest.fn(),
                },
            },
        };

        default_mocked_props = {
            has_stop_loss: true,
            onChange: jest.fn(),
            onChangeMultiple: jest.fn(),
            stop_loss: '10',
            validation_errors: { take_profit_error: ['mocked_error', 'mocked_error'] },
        };
    });

    const mockStopLoss = () => {
        return (
            <TraderProviders store={default_mocked_store}>
                <StopLoss {...default_mocked_props} />
            </TraderProviders>
        );
    };

    it('should render Stop Loss input with checkbox', () => {
        render(mockStopLoss());

        expect(screen.getByText('Stop loss')).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).toBeInTheDocument();
        expect(screen.getByRole('textbox')).toBeInTheDocument();
    });
    it('should call onChangeMultiple if user clicked on checkbox', async () => {
        render(mockStopLoss());

        await userEvent.click(screen.getByRole('checkbox'));

        expect(default_mocked_props.onChangeMultiple).toBeCalled();
    });
    it('should call onChange if user changed value in input', async () => {
        render(mockStopLoss());

        await userEvent.type(screen.getByRole('textbox'), '20');

        expect(default_mocked_props.onChange).toBeCalled();
    });
    it('should render functioning Stop Loss input with checkbox if props were not passed (backup should work)', async () => {
        default_mocked_props = {};
        render(mockStopLoss());

        const check_box = screen.getByRole('checkbox');
        const input = screen.getByRole('textbox');

        expect(screen.getByText('Stop loss')).toBeInTheDocument();
        expect(check_box).toBeInTheDocument();
        expect(input).toBeInTheDocument();

        await userEvent.click(check_box);
        expect(default_mocked_store.modules.trade.onChangeMultiple).toBeCalled();

        await userEvent.type(input, '20');
        expect(default_mocked_store.modules.trade.onChange).toBeCalled();
    });
});
