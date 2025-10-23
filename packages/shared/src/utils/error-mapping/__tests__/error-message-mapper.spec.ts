import { mapErrorMessage } from '../error-message-mapper';
import { localize } from '@deriv-com/translations';

// Mock the localize function to handle both string and params
jest.mock('@deriv-com/translations', () => ({
    localize: jest.fn((text: string, params?: Record<string, string>) => {
        if (!params) return text;
        // Simple replacement for testing
        let result = text;
        Object.keys(params).forEach(key => {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), params[key]);
        });
        return result;
    }),
}));

describe('mapErrorMessage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return default error message when error is null or undefined', () => {
        expect(mapErrorMessage(null as any)).toBe('An error occurred. Please try again later.');
        expect(mapErrorMessage(undefined as any)).toBe('An error occurred. Please try again later.');
    });

    it('should return backend message when subcode is not present', () => {
        const error = {
            message: 'Backend error message',
        };
        expect(mapErrorMessage(error)).toBe('Backend error message');
    });

    it('should return backend message when subcode is not mapped', () => {
        const error = {
            message: 'Backend error message',
            subcode: 'UnknownSubcode',
        };
        expect(mapErrorMessage(error)).toBe('Backend error message');
    });

    it('should return mapped message for known subcode without parameters', () => {
        const error = {
            message: 'Backend error message',
            subcode: 'AlreadyExpired',
        };
        const result = mapErrorMessage(error);
        expect(result).toBe('This contract has already expired.');
        expect(localize).toHaveBeenCalledWith('This contract has already expired.');
    });

    // Parameterized error messages are temporarily commented out in the mapper
    it.skip('should substitute single parameter in error message', () => {
        const error = {
            message: 'Backend error message',
            subcode: 'AccountBalanceExceedsLimit',
            code_args: ['1000', '5000'],
        };
        const result = mapErrorMessage(error);
        expect(result).toBe(
            'Sorry, your account cash balance is too high (1000). Your maximum account balance is 5000.'
        );
        expect(localize).toHaveBeenCalledWith(
            'Sorry, your account cash balance is too high ({{param_1}}). Your maximum account balance is {{param_2}}.',
            { param_1: '1000', param_2: '5000' }
        );
    });

    it.skip('should substitute multiple parameters in error message', () => {
        const error = {
            message: 'Backend error message',
            subcode: 'BarrierNotInRange',
            code_args: ['100', '150'],
        };
        const result = mapErrorMessage(error);
        expect(result).toBe('Barrier is not an integer in range of 100 to 150.');
        expect(localize).toHaveBeenCalledWith('Barrier is not an integer in range of {{param_1}} to {{param_2}}.', {
            param_1: '100',
            param_2: '150',
        });
    });

    it('should handle error message with no parameters when code_args is empty', () => {
        const error = {
            message: 'Backend error message',
            subcode: 'AlreadyExpired',
            code_args: [],
        };
        const result = mapErrorMessage(error);
        expect(result).toBe('This contract has already expired.');
    });

    it.skip('should handle error message with parameters when code_args is undefined', () => {
        const error = {
            message: 'Backend error message',
            subcode: 'AccountBalanceExceedsLimit',
        };
        const result = mapErrorMessage(error);
        // When params are undefined, they get substituted as "undefined"
        expect(result).toBe(
            'Sorry, your account cash balance is too high (undefined). Your maximum account balance is undefined.'
        );
    });

    it.skip('should handle complex error messages with multiple parameter substitutions', () => {
        const error = {
            message: 'Backend error message',
            subcode: 'DailyTurnoverLimitExceeded',
            code_args: ['500', 'USD'],
        };
        const result = mapErrorMessage(error);
        expect(result).toContain('500');
        expect(result).toContain('USD');
    });

    it('should return default message when error has no message and no subcode', () => {
        const error = {};
        expect(mapErrorMessage(error)).toBe('An error occurred. Please try again later.');
    });

    it('should call localize function for all messages', () => {
        const error = {
            message: 'Backend error message',
            subcode: 'AlreadyExpired',
        };
        mapErrorMessage(error);
        expect(localize).toHaveBeenCalled();
    });

    it('should handle error with subcode but empty message', () => {
        const error = {
            message: '',
            subcode: 'AlreadyExpired',
        };
        const result = mapErrorMessage(error);
        expect(result).toBe('This contract has already expired.');
    });

    it.skip('should preserve parameter order in substitution', () => {
        const error = {
            message: 'Backend error message',
            subcode: 'BarrierNotInRange',
            code_args: ['AAA', 'BBB'],
        };
        const result = mapErrorMessage(error);
        expect(result.indexOf('AAA')).toBeLessThan(result.indexOf('BBB'));
    });
});
