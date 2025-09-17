import React from 'react';
import { render, screen } from '@testing-library/react';
import moment from 'moment';
import {
    getAccumulatorOpenPositionsColumnsTemplate,
    getMultiplierOpenPositionsColumnsTemplate,
    getOpenPositionsColumnsTemplate,
    getProfitTableColumnsTemplate,
    getStatementTableColumnsTemplate,
} from 'Constants/data-table-constants';
import { TCellContentProps } from 'Types';

// Mock external dependencies
jest.mock('@deriv/shared', () => ({
    getCurrencyDisplayCode: jest.fn(currency => currency),
    getTotalProfit: jest.fn(contract_info => {
        const { bid_price, buy_price } = contract_info;
        return Number(bid_price) - Number(buy_price);
    }),
    getGrowthRatePercentage: jest.fn(growth_rate => `${growth_rate * 100}`),
    getCardLabels: jest.fn(() => ({})),
}));

jest.mock('../../Containers/progress-slider-stream', () => jest.fn(() => <div>ProgressSliderStream</div>));

jest.mock('Components/indicative-cell', () => ({
    __esModule: true,
    default: ({ amount }: { amount: number }) => <div>IndicativeCell: {amount}</div>,
}));

jest.mock('Components/currency-wrapper', () => ({
    __esModule: true,
    default: ({ currency }: { currency: string }) => <div>Currency: {currency}</div>,
}));

jest.mock('Components/market-symbol-icon-row', () => ({
    __esModule: true,
    default: ({ payload }: { payload: any }) => (
        <div>MarketIcon: {payload?.id || payload?.transaction_id || 'unknown'}</div>
    ),
}));

jest.mock('Components/profit-loss-cell', () => ({
    __esModule: true,
    default: ({ children }: { children: React.ReactNode }) => <div>ProfitLoss: {children}</div>,
}));

jest.mock('@deriv/components', () => ({
    ArrowIndicator: ({ value }: { value: number }) => <span>Arrow({value})</span>,
    ContractCard: {
        MultiplierCloseActions: ({ contract_info }: { contract_info: any }) => (
            <div>MultiplierActions: {contract_info.contract_id}</div>
        ),
    },
    ContractCardSell: ({ contract_info }: { contract_info: any }) => (
        <div>ContractSell: {contract_info.contract_id}</div>
    ),
    Money: ({ amount, has_sign }: { amount: string | number; has_sign?: boolean }) => (
        <span>
            {has_sign ? '+' : ''}
            {amount}
        </span>
    ),
    Label: ({ children, mode }: { children: React.ReactNode; mode: string }) => (
        <span className={`label-${mode}`}>{children}</span>
    ),
    Popover: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe('getStatementTableColumnsTemplate', () => {
    const currency = 'USD';
    const isDesktop = true;
    const columns = getStatementTableColumnsTemplate(currency, isDesktop);

    it('should return correct number of columns', () => {
        expect(columns).toHaveLength(7);
    });

    it('should have correct column structure', () => {
        expect(columns[0]).toHaveProperty('key', 'icon');
        expect(columns[0]).toHaveProperty('col_index', 'icon');
        expect(columns[0]).toHaveProperty('title');
        expect(columns[0]).toHaveProperty('renderCellContent');

        expect(columns[1]).toHaveProperty('col_index', 'refid');
        expect(columns[2]).toHaveProperty('col_index', 'currency');
        expect(columns[3]).toHaveProperty('col_index', 'date');
        expect(columns[4]).toHaveProperty('col_index', 'action_type');
        expect(columns[5]).toHaveProperty('col_index', 'amount');
        expect(columns[6]).toHaveProperty('col_index', 'balance');
    });

    it('should render cell content correctly', () => {
        const mockRow = {
            transaction_id: '12345',
            action: 'buy',
        };

        const mockProps: TCellContentProps = {
            cell_value: '1000.00',
            row_obj: mockRow,
            is_footer: false,
            passthrough: {
                isTopUp: jest.fn(() => false),
            },
            is_vanilla: false,
            is_turbos: false,
        };

        // Test currency column
        const currencyColumn = columns[2];
        render(currencyColumn.renderCellContent(mockProps) as JSX.Element);
        expect(screen.getByText('Currency: USD')).toBeInTheDocument();

        // Test transaction time column
        const timeColumn = columns[3];
        const timeProps = { ...mockProps, cell_value: '2023-01-01 12:00:00' };
        render(timeColumn.renderCellContent(timeProps) as JSX.Element);
        expect(screen.getByText('2023-01-01 12:00:00 GMT')).toBeInTheDocument();

        // Test amount column
        const amountColumn = columns[5];
        render(amountColumn.renderCellContent(mockProps) as JSX.Element);
        expect(screen.getByText('+1000.00')).toBeInTheDocument();
    });
});

describe('getProfitTableColumnsTemplate', () => {
    const currency = 'USD';
    const items_count = 10;
    const isDesktop = true;
    const columns = getProfitTableColumnsTemplate(currency, items_count, isDesktop);

    it('should return correct number of columns', () => {
        expect(columns).toHaveLength(8);
    });

    it('should have correct column structure', () => {
        expect(columns[0]).toHaveProperty('key', 'icon');
        expect(columns[0]).toHaveProperty('col_index', 'action_type');
        expect(columns[1]).toHaveProperty('col_index', 'transaction_id');
        expect(columns[2]).toHaveProperty('col_index', 'currency');
        expect(columns[3]).toHaveProperty('col_index', 'purchase_time');
        expect(columns[4]).toHaveProperty('col_index', 'buy_price');
        expect(columns[5]).toHaveProperty('col_index', 'sell_time');
        expect(columns[6]).toHaveProperty('col_index', 'sell_price');
        expect(columns[7]).toHaveProperty('col_index', 'profit_loss');
    });

    it('should render footer content for Type column', () => {
        const typeColumn = columns[0];
        const mockProps: TCellContentProps = {
            cell_value: '',
            row_obj: {},
            is_footer: true,
            passthrough: {},
            is_vanilla: false,
            is_turbos: false,
        };

        if (typeColumn.renderCellContent) {
            render(typeColumn.renderCellContent(mockProps) as JSX.Element);
            expect(screen.getByText(/on the last 10 contracts/)).toBeInTheDocument();
        }
    });

    it('should render cell content correctly', () => {
        const mockProps: TCellContentProps = {
            cell_value: '1000.00',
            row_obj: { transaction_id: '12345' },
            is_footer: false,
            passthrough: {},
            is_vanilla: false,
            is_turbos: false,
        };

        // Test currency column
        const currencyColumn = columns[2];
        if (currencyColumn.renderCellContent) {
            render(currencyColumn.renderCellContent(mockProps) as JSX.Element);
            expect(screen.getByText('Currency: USD')).toBeInTheDocument();
        }

        // Test buy time column
        const buyTimeColumn = columns[3];
        const timeProps = { ...mockProps, cell_value: '2023-01-01 12:00:00' };
        if (buyTimeColumn.renderCellContent) {
            render(buyTimeColumn.renderCellContent(timeProps) as JSX.Element);
            expect(screen.getByText('2023-01-01 12:00:00 GMT')).toBeInTheDocument();
        }
    });
});

describe('getOpenPositionsColumnsTemplate', () => {
    const currency = 'USD';
    const isDesktop = true;
    const columns = getOpenPositionsColumnsTemplate(currency, isDesktop);

    it('should return correct number of columns', () => {
        expect(columns).toHaveLength(8);
    });

    it('should have correct column structure', () => {
        expect(columns[0]).toHaveProperty('col_index', 'type');
        expect(columns[1]).toHaveProperty('col_index', 'reference');
        expect(columns[2]).toHaveProperty('col_index', 'currency');
        expect(columns[3]).toHaveProperty('col_index', 'purchase');
        expect(columns[4]).toHaveProperty('col_index', 'payout');
        expect(columns[5]).toHaveProperty('col_index', 'profit');
        expect(columns[6]).toHaveProperty('col_index', 'indicative');
        expect(columns[7]).toHaveProperty('col_index', 'id');
    });

    it('should render cell content correctly', () => {
        const mockRowObj = {
            id: 'position_123',
            contract_info: {
                id: 'contract_123',
                currency: 'USD',
                profit: 100,
            },
            profit_loss: 50,
        };

        const mockProps: TCellContentProps = {
            cell_value: '1000',
            row_obj: mockRowObj,
            is_footer: false,
            passthrough: {},
            is_vanilla: false,
            is_turbos: false,
        };

        // Test type column (footer)
        const typeColumn = columns[0];
        const footerProps = { ...mockProps, is_footer: true };
        if (typeColumn.renderCellContent) {
            render(typeColumn.renderCellContent(footerProps) as JSX.Element);
            expect(screen.getByText('Total')).toBeInTheDocument();
        }

        // Test currency column
        const currencyColumn = columns[2];
        if (currencyColumn.renderCellContent) {
            render(currencyColumn.renderCellContent(mockProps) as JSX.Element);
            expect(screen.getByText('Currency: USD')).toBeInTheDocument();
        }

        // Test purchase column
        const purchaseColumn = columns[3];
        if (purchaseColumn.renderCellContent) {
            render(purchaseColumn.renderCellContent(mockProps) as JSX.Element);
            expect(screen.getByText('1000')).toBeInTheDocument();
        }
    });
});

describe('getMultiplierOpenPositionsColumnsTemplate', () => {
    const mockParams = {
        currency: 'USD',
        onClickCancel: jest.fn(),
        onClickSell: jest.fn(),
        getPositionById: jest.fn(),
        server_time: moment('2024-01-01T12:00:00Z'),
        isDesktop: true,
    };

    const columns = getMultiplierOpenPositionsColumnsTemplate(mockParams);

    it('should return correct number of columns', () => {
        expect(columns).toHaveLength(10);
    });

    it('should have correct column structure', () => {
        expect(columns[0]).toHaveProperty('col_index', 'type');
        expect(columns[1]).toHaveProperty('col_index', 'multiplier');
        expect(columns[2]).toHaveProperty('col_index', 'currency');
        expect(columns[3]).toHaveProperty('col_index', 'buy_price');
        expect(columns[4]).toHaveProperty('col_index', 'cancellation');
        expect(columns[5]).toHaveProperty('col_index', 'purchase');
        expect(columns[6]).toHaveProperty('col_index', 'limit_order');
        expect(columns[7]).toHaveProperty('col_index', 'bid_price');
        expect(columns[8]).toHaveProperty('col_index', 'profit');
        expect(columns[9]).toHaveProperty('col_index', 'action');
    });

    it('should render cell content correctly', () => {
        const mockRowObj = {
            id: 'multiplier_123',
            contract_info: {
                id: 'contract_123',
                currency: 'USD',
                multiplier: 10,
                buy_price: 1000,
                bid_price: 1200,
                profit: 200,
                contract_id: 'contract_123',
                limit_order: {
                    take_profit: { order_amount: 1500 },
                    stop_loss: { order_amount: 500 },
                },
                cancellation: { ask_price: 50 },
                underlying: '1HZ10V',
            },
        };

        const mockProps: TCellContentProps = {
            cell_value: '1000',
            row_obj: mockRowObj,
            is_footer: false,
            passthrough: {},
            is_vanilla: false,
            is_turbos: false,
        };

        // Test type column (footer)
        const typeColumn = columns[0];
        const footerProps = { ...mockProps, is_footer: true };
        if (typeColumn.renderCellContent) {
            render(typeColumn.renderCellContent(footerProps) as JSX.Element);
            expect(screen.getByText('Total')).toBeInTheDocument();
        }

        // Test multiplier column
        const multiplierColumn = columns[1];
        if (multiplierColumn.renderCellContent) {
            render(multiplierColumn.renderCellContent(mockProps) as JSX.Element);
            expect(screen.getByText('x10')).toBeInTheDocument();
        }

        // Test currency column
        const currencyColumn = columns[2];
        if (currencyColumn.renderCellContent) {
            render(currencyColumn.renderCellContent(mockProps) as JSX.Element);
            expect(screen.getByText('Currency: USD')).toBeInTheDocument();
        }
    });
});

describe('getAccumulatorOpenPositionsColumnsTemplate', () => {
    const mockParams = {
        currency: 'USD',
        onClickSell: jest.fn(),
        getPositionById: jest.fn(),
        isDesktop: true,
    };

    const columns = getAccumulatorOpenPositionsColumnsTemplate(mockParams);

    it('should return correct number of columns', () => {
        expect(columns).toHaveLength(8);
    });

    it('should have correct column structure', () => {
        expect(columns[0]).toHaveProperty('col_index', 'type');
        expect(columns[1]).toHaveProperty('col_index', 'growth_rate');
        expect(columns[2]).toHaveProperty('col_index', 'currency');
        expect(columns[3]).toHaveProperty('col_index', 'buy_price');
        expect(columns[4]).toHaveProperty('col_index', 'limit_order');
        expect(columns[5]).toHaveProperty('col_index', 'bid_price');
        expect(columns[6]).toHaveProperty('col_index', 'profit');
        expect(columns[7]).toHaveProperty('col_index', 'action');
    });

    it('should render cell content correctly', () => {
        const mockRowObj = {
            id: 'accumulator_123',
            contract_info: {
                id: 'contract_123',
                currency: 'USD',
                growth_rate: 0.1,
                buy_price: 1000,
                bid_price: 1200,
                profit: 200,
                contract_id: 'contract_123',
                limit_order: {
                    take_profit: { order_amount: 1500 },
                },
            },
        };

        const mockProps: TCellContentProps = {
            cell_value: '1000',
            row_obj: mockRowObj,
            is_footer: false,
            passthrough: {},
            is_vanilla: false,
            is_turbos: false,
        };

        // Test type column (footer)
        const typeColumn = columns[0];
        const footerProps = { ...mockProps, is_footer: true };
        if (typeColumn.renderCellContent) {
            render(typeColumn.renderCellContent(footerProps) as JSX.Element);
            expect(screen.getByText('Total')).toBeInTheDocument();
        }

        // Test growth rate column
        const growthRateColumn = columns[1];
        if (growthRateColumn.renderCellContent) {
            render(growthRateColumn.renderCellContent(mockProps) as JSX.Element);
            expect(screen.getByText('10%')).toBeInTheDocument();
        }

        // Test currency column
        const currencyColumn = columns[2];
        if (currencyColumn.renderCellContent) {
            render(currencyColumn.renderCellContent(mockProps) as JSX.Element);
            expect(screen.getByText('Currency: USD')).toBeInTheDocument();
        }

        // Test stake column
        const stakeColumn = columns[3];
        if (stakeColumn.renderCellContent) {
            render(stakeColumn.renderCellContent(mockProps) as JSX.Element);
            expect(screen.getByText('1000')).toBeInTheDocument();
        }
    });

    it('should handle missing contract_info gracefully', () => {
        const mockRowObj = {
            id: 'accumulator_123',
            contract_info: undefined,
        };

        const mockProps: TCellContentProps = {
            cell_value: '1000',
            row_obj: mockRowObj,
            is_footer: false,
            passthrough: {},
            is_vanilla: false,
            is_turbos: false,
        };

        // Test stake column with missing contract_info
        const stakeColumn = columns[3];
        if (stakeColumn.renderCellContent) {
            const view = stakeColumn.renderCellContent(mockProps);
            expect(view).toBe('');
        }

        // Test bid_price column with missing contract_info
        const bidPriceColumn = columns[5];
        if (bidPriceColumn.renderCellContent) {
            const view = bidPriceColumn.renderCellContent(mockProps);
            expect(view).toBe('-');
        }
    });
});
