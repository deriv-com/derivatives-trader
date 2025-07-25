import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { getTerm } from 'AppV2/Utils/contract-description-utils';

import MultipliersTradeDescription from '../multipliers-trade-description';

jest.mock('@lottiefiles/dotlottie-react', () => ({
    DotLottieReact: jest.fn(() => <div>DotLottieReact</div>),
}));

describe('MultipliersTradeDescription', () => {
    it('should render a proper content', () => {
        render(<MultipliersTradeDescription onTermClick={jest.fn()} />);

        expect(
            screen.getByText(/your total profit\/loss will be the percentage increase in the underlying asset price/i)
        ).toBeInTheDocument();
    });

    it('should call onTermClick if user clicks on term "stop out level"', async () => {
        const onTermClick = jest.fn();
        render(<MultipliersTradeDescription onTermClick={onTermClick} />);

        await userEvent.click(screen.getByRole('button', { name: getTerm().STOP_OUT_LEVEL.toLowerCase() }));

        expect(onTermClick).toHaveBeenCalled();
    });

    it('should call onTermClick if user clicks on term "Take profit"', async () => {
        const onTermClick = jest.fn();
        render(<MultipliersTradeDescription onTermClick={onTermClick} />);

        await userEvent.click(screen.getByRole('button', { name: getTerm().TAKE_PROFIT }));

        expect(onTermClick).toHaveBeenCalled();
    });

    it('should call onTermClick if user clicks on term "Stop loss"', async () => {
        const onTermClick = jest.fn();
        render(<MultipliersTradeDescription onTermClick={onTermClick} />);

        await userEvent.click(screen.getByRole('button', { name: getTerm().STOP_LOSS }));

        expect(onTermClick).toHaveBeenCalled();
    });

    it('should call onTermClick if user clicks on term "Deal cancellation"', async () => {
        const onTermClick = jest.fn();
        render(<MultipliersTradeDescription onTermClick={onTermClick} />);

        await userEvent.click(screen.getByRole('button', { name: getTerm().DEAL_CANCELLATION }));

        expect(onTermClick).toHaveBeenCalled();
    });

    it('should call onTermClick if user clicks on term "slippage risk"', async () => {
        const onTermClick = jest.fn();
        render(<MultipliersTradeDescription onTermClick={onTermClick} />);

        await userEvent.click(screen.getByRole('button', { name: getTerm().SLIPPAGE_RISK.toLowerCase() }));

        expect(onTermClick).toHaveBeenCalled();
    });
});
