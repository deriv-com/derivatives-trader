import React from 'react';
import { render, screen } from '@testing-library/react';
import AccountInfoIcon from '../account-info-icon';

describe('AccountInfoIcon component', () => {
    it('should render icon with testid', () => {
        render(<AccountInfoIcon />);
        expect(screen.queryByTestId('dt_icon')).toBeInTheDocument();
    });

    it('should render icon for demo', () => {
        render(<AccountInfoIcon is_demo={true} currency='usd' />);
        const icon = screen.queryByTestId('dt_icon');
        expect(icon).toHaveClass('acc-info__id-icon--demo');
        expect(icon).not.toHaveClass('acc-info__id-icon--usd');
    });

    it('should render icon for not demo and usd currency', () => {
        render(<AccountInfoIcon currency='usd' />);
        const icon = screen.queryByTestId('dt_icon');
        expect(icon).toHaveClass('acc-info__id-icon--usd');
        expect(icon).not.toHaveClass('acc-info__id-icon--demo');
    });
});
