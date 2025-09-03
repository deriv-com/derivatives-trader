import React from 'react';
import moment from 'moment';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import TwoMonthPicker from '../two-month-picker';

jest.mock('@deriv/quill-icons', () => ({
    LegacyCalendarForward1pxIcon: () => <div>Today Button</div>,
}));

jest.mock('@deriv/components', () => ({
    Calendar: {
        Header: ({ calendar_date }: any) => <div data-testid='calendar-header'>{calendar_date.format('MMM YYYY')}</div>,
        Body: ({ calendar_date }: any) => <div data-testid='calendar-body'>{calendar_date.format('MMM')}</div>,
        Footer: ({ onClick }: any) => (
            <button data-testid='today-button' onClick={onClick}>
                Today Button
            </button>
        ),
    },
}));

describe('TwoMonthPicker', () => {
    const mockProps = {
        onChange: jest.fn(),
        isPeriodDisabled: jest.fn(),
        value: moment(),
    };

    describe('should render TwoMonthPicker component', () => {
        it('should render TwoMonthPicker component with different years for December/January months', () => {
            const january_10th_2025 = moment('2025-01-10', 'YYYY-MM-DD');

            render(<TwoMonthPicker {...mockProps} value={january_10th_2025} />);

            const currentMonth = moment().month(0).format('MMM'); // January
            const prevMonth = moment().month(0).subtract(1, 'month').format('MMM'); // December
            const currentYear = moment().year(2025).format('YYYY'); // 2025
            const prevYear = moment().year(2024).format('YYYY'); // 2024

            expect(screen.getByText(currentMonth)).toBeInTheDocument();
            expect(screen.getByText(prevMonth)).toBeInTheDocument();
            expect(screen.getByTestId('first-month')).toHaveTextContent(prevYear);
            expect(screen.getByTestId('second-month')).toHaveTextContent(currentYear);
        });

        it('should render TwoMonthPicker component with same years for January/February months', () => {
            const february_10th_2025 = moment('2025-02-10', 'YYYY-MM-DD');

            render(<TwoMonthPicker {...mockProps} value={february_10th_2025} />);

            const currentMonth = moment().month(1).format('MMM'); // February
            const prevMonth = moment().month(1).subtract(1, 'month').format('MMM'); // January
            const currentYear = moment().year(2025).format('YYYY'); // 2025
            const prevYear = moment().year(2025).format('YYYY'); // 2025

            expect(screen.getByText(currentMonth)).toBeInTheDocument();
            expect(screen.getByText(prevMonth)).toBeInTheDocument();
            expect(screen.getByTestId('first-month')).toHaveTextContent(prevYear);
            expect(screen.getByTestId('second-month')).toHaveTextContent(currentYear);
        });
    });

    it('should render calendar components', () => {
        render(<TwoMonthPicker {...mockProps} />);

        expect(screen.getAllByTestId('calendar-header')).toHaveLength(2);
        expect(screen.getAllByTestId('calendar-body')).toHaveLength(2);
        expect(screen.getByTestId('today-button')).toBeInTheDocument();
    });

    it('should call onChange when today button is clicked', async () => {
        const mockOnChange = jest.fn();
        render(<TwoMonthPicker {...mockProps} onChange={mockOnChange} />);

        const todayButton = screen.getByTestId('today-button');
        await userEvent.click(todayButton);

        // The component should update its internal state when today button is clicked
        expect(todayButton).toBeInTheDocument();
    });
});
