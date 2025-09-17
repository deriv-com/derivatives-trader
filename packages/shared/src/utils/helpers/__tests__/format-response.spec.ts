import { filterDisabledPositions, formatPortfolioPosition } from '../format-response';
import { LocalStore } from '../../storage';
import { CONTRACT_TYPES } from '../../contract';
import { getContractTypeFeatureFlag } from '../../constants';

jest.mock('../../constants', () => ({
    ...jest.requireActual('../../constants'),
    getContractTypeFeatureFlag: jest.fn(() => 'rise_fall'),
}));
jest.mock('../../storage', () => ({
    ...jest.requireActual('../../storage'),
    LocalStore: {
        getObject: jest.fn(() => ({ data: { rise_fall: false } })),
    },
}));

describe('format-response', () => {
    const mock_active_symbols = [{ display_name: 'Volatility 25 Index', symbol: 'R_25' }];
    const portfolio_pos = {
        buy_price: 2500.5,
        contract_id: 1234,
        contract_type: CONTRACT_TYPES.ASIAN.UP,
        longcode: 'test \n test \n test',
        payout: 3500.1,
        symbol: 'R_25',
        shortcode: 'ASIANU_R_25_',
        transaction_id: 5678,
    };

    it('should return an object with values in object passed as argument to formatPortfolioPosition', () => {
        expect(formatPortfolioPosition(portfolio_pos, mock_active_symbols)).toEqual({
            details: 'test <br /> test <br /> test',
            display_name: 'Volatility 25 Index',
            id: 1234,
            indicative: 0,
            payout: 3500.1,
            contract_update: undefined,
            purchase: 2500.5,
            reference: +5678,
            type: CONTRACT_TYPES.ASIAN.UP,
            contract_info: portfolio_pos,
        });
    });

    describe('filterDisabledPositions', () => {
        const position = {
            contract_type: 'CALL',
            shortcode: 'CALL_1HZ100V_19.53_1695913929_5T_S0P_0',
        };
        it('should return false if a feature flag for position.contract_type is disabled', () => {
            (LocalStore.getObject as jest.Mock).mockReturnValueOnce({ data: { rise_fall: false } });
            expect(filterDisabledPositions(position)).toBeFalsy();
        });
        it('should return true if a feature flag for position.contract_type is enabled', () => {
            (LocalStore.getObject as jest.Mock).mockReturnValueOnce({ data: { rise_fall: true } });
            expect(filterDisabledPositions(position)).toBeTruthy();
        });
        it('should return true if a feature flag for position.contract_type is not defined', () => {
            (getContractTypeFeatureFlag as jest.Mock).mockReturnValueOnce(undefined);
            expect(filterDisabledPositions(position)).toBeTruthy();
        });
        it(`should return true if a feature flag for transaction contract category is enabled
            based on shortcode when contract_type property is missing`, () => {
            const transaction = {
                shortcode: 'CALL_1HZ100V_19.53_1695913929_5T_S0P_0',
            };
            (LocalStore.getObject as jest.Mock).mockReturnValueOnce({ data: { rise_fall: true } });
            expect(filterDisabledPositions(transaction)).toBeTruthy();
        });
    });
});
