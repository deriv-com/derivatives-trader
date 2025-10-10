import {
    getContractDurationType,
    getMarketInformation,
    getMarketName,
    getTradeTypeName,
    isHigherLowerContractInfo,
} from '../market-underlying';
import { getSymbolDisplayName } from '../active-symbols';
import { CONTRACT_TYPES, TRADE_TYPES } from '../../contract';

describe('market-underlying', () => {
    const position = {
        contract_type: 'CALL',
        shortcode: 'CALL_1HZ100V_19.53_1695913929_5T_S0P_0',
    };
    describe('getContractDurationType', () => {
        it('should return Ticks if longcode contains ticks', () => {
            expect(getContractDurationType('... ticks')).toBe('Ticks');
        });
        it('should return Days when longcode does not contain duration and shortcode is not passed', () => {
            expect(getContractDurationType('')).toBe('Days');
        });
        it('should return Days when longcode does not contain duration and shortcode is not for Multipliers', () => {
            expect(getContractDurationType('', position.shortcode)).toBe('Days');
        });
        it('should return an empty string when shortcode is for Multipliers', () => {
            expect(getContractDurationType('', 'MULTUP_1HZ100V_10.00_10_1702912846_4856543999_0_0.00')).toBe('');
        });
        it('should return a plural duration if longcode contains singular duration', () => {
            expect(
                getContractDurationType(
                    'Win payout if Volatility 100 (1s) Index is strictly higher than entry spot at 1 minute after contract start time.'
                )
            ).toBe('Minutes');
        });
    });
    describe('getMarketInformation', () => {
        it('should return an object with correct data about contract_type and symbol when shortcode is provided', () => {
            expect(getMarketInformation(position.shortcode)).toMatchObject({ category: 'call', underlying: '1HZ100V' });
            expect(getMarketInformation('MULTUP_CRASH1000_100.00_100_1719905471_4873564799_0_0.00_N1')).toMatchObject({
                category: 'multup',
                underlying: 'CRASH1000',
            });
            expect(getMarketInformation('MULTUP_STPRNG_10.00_100_1716797490_4870454399_0_0.00_N1')).toMatchObject({
                category: 'multup',
                underlying: 'STPRNG',
            });
            expect(getMarketInformation('MULTUP_STPRNG2_10.00_100_1716797490_4870454399_0_0.00_N1')).toMatchObject({
                category: 'multup',
                underlying: 'STPRNG2',
            });
        });
        it('should return an object with empty values when shortcode is not provided', () => {
            expect(getMarketInformation('')).toMatchObject({ category: '', underlying: '' });
        });
        it('should correctly extract Jump index symbols from shortcodes', () => {
            // Test various Jump index shortcode formats
            expect(getMarketInformation('CALL_JD100_19.53_1695913929_5T_S0P_0')).toMatchObject({
                category: 'call',
                underlying: 'JD100',
            });
            expect(getMarketInformation('PUT_JD10_19.53_1695913929_5T_S0P_0')).toMatchObject({
                category: 'put',
                underlying: 'JD10',
            });
            expect(getMarketInformation('CALL_JD25_19.53_1695913929_5T_S0P_0')).toMatchObject({
                category: 'call',
                underlying: 'JD25',
            });
            expect(getMarketInformation('PUT_JD50_19.53_1695913929_5T_S0P_0')).toMatchObject({
                category: 'put',
                underlying: 'JD50',
            });
            expect(getMarketInformation('CALL_JD75_19.53_1695913929_5T_S0P_0')).toMatchObject({
                category: 'call',
                underlying: 'JD75',
            });
            expect(getMarketInformation('PUT_JD150_19.53_1695913929_5T_S0P_0')).toMatchObject({
                category: 'put',
                underlying: 'JD150',
            });
            expect(getMarketInformation('CALL_JD200_19.53_1695913929_5T_S0P_0')).toMatchObject({
                category: 'call',
                underlying: 'JD200',
            });
        });
    });

    describe('getSymbolDisplayName integration with getMarketInformation', () => {
        it('should correctly resolve Jump index display names from shortcodes', () => {
            // Test the complete flow: shortcode -> getMarketInformation -> getSymbolDisplayName
            const { underlying } = getMarketInformation('CALL_JD100_19.53_1695913929_5T_S0P_0');
            expect(underlying).toBe('JD100');

            // Test the complete flow with getSymbolDisplayName
            const displayName = getSymbolDisplayName(underlying);
            expect(displayName).toBe('Jump 100 Index');
        });

        it('should correctly resolve all Jump index variants', () => {
            const testCases = [
                { shortcode: 'CALL_JD10_19.53_1695913929_5T_S0P_0', expected: 'Jump 10 Index' },
                { shortcode: 'CALL_JD25_19.53_1695913929_5T_S0P_0', expected: 'Jump 25 Index' },
                { shortcode: 'CALL_JD50_19.53_1695913929_5T_S0P_0', expected: 'Jump 50 Index' },
                { shortcode: 'CALL_JD75_19.53_1695913929_5T_S0P_0', expected: 'Jump 75 Index' },
                { shortcode: 'CALL_JD100_19.53_1695913929_5T_S0P_0', expected: 'Jump 100 Index' },
                { shortcode: 'CALL_JD150_19.53_1695913929_5T_S0P_0', expected: 'Jump 150 Index' },
                { shortcode: 'CALL_JD200_19.53_1695913929_5T_S0P_0', expected: 'Jump 200 Index' },
            ];

            testCases.forEach(({ shortcode, expected }) => {
                const { underlying } = getMarketInformation(shortcode);
                const displayName = getSymbolDisplayName(underlying);
                expect(displayName).toBe(expected);
            });
        });
    });
    describe('getMarketName', () => {
        it('should return the correct symbol display name when symbol is provided', () => {
            expect(getMarketName('R_100')).toBe('Volatility 100 Index');
        });
        it('should return null when symbol is not provided', () => {
            expect(getMarketName('')).toBe(null);
        });
    });
    describe('getTradeTypeName', () => {
        it('should return the correct contract type display name', () => {
            expect(getTradeTypeName(CONTRACT_TYPES.ACCUMULATOR)).toBe('Accumulators');
        });
        it('should return the correct Higher or Lower contract type display name when is_how_low === true', () => {
            expect(getTradeTypeName(position.contract_type, { isHighLow: true })).toBe('Higher');
            expect(getTradeTypeName(CONTRACT_TYPES.PUT, { isHighLow: true })).toBe('Lower');
        });
        it('should return the correct Rise or Fall contract type display name when is_how_low === false', () => {
            expect(getTradeTypeName(position.contract_type)).toBe('Rise');
            expect(getTradeTypeName(CONTRACT_TYPES.PUT)).toBe('Fall');
        });
        it('should return the correct Up or Down contract type display name when show_button_name is true', () => {
            expect(getTradeTypeName(CONTRACT_TYPES.TURBOS.LONG, { showButtonName: true })).toBe('Up');
            expect(getTradeTypeName(CONTRACT_TYPES.TURBOS.SHORT, { showButtonName: true })).toBe('Down');
        });
        it('should return null if an incorrect contract_type is provided', () => {
            expect(getTradeTypeName(TRADE_TYPES.RISE_FALL)).toBe(null);
        });
        it('should return main title for contracts which have such field if show_main_title is true', () => {
            expect(getTradeTypeName(CONTRACT_TYPES.TURBOS.LONG, { showMainTitle: true })).toBe('Turbos');
            expect(getTradeTypeName(CONTRACT_TYPES.VANILLA.CALL, { showMainTitle: true })).toBe('Vanillas');
            expect(getTradeTypeName(CONTRACT_TYPES.MULTIPLIER.DOWN, { showMainTitle: true })).toBe('Multipliers');
        });
        it('should not return main title for contracts which have such field but show_main_title is false', () => {
            expect(getTradeTypeName(CONTRACT_TYPES.TURBOS.LONG)).not.toBe('Turbos');
            expect(getTradeTypeName(CONTRACT_TYPES.VANILLA.CALL)).not.toBe('Vanillas');
            expect(getTradeTypeName(CONTRACT_TYPES.MULTIPLIER.DOWN)).not.toBe('Multipliers');
        });
        it('should not return main title for contracts which have not such field if show_main_title is true', () => {
            expect(getTradeTypeName(CONTRACT_TYPES.FALL, { showMainTitle: true })).toBeFalsy();
        });
    });
    describe('isHigherLowerContractInfo', () => {
        it('should return true for Higher/Lower contracts based on contract_category', () => {
            expect(isHigherLowerContractInfo({ contract_category: 'higherLower' })).toBe(true);
        });

        it('should return false for Rise/Fall contracts based on contract_category', () => {
            expect(isHigherLowerContractInfo({ contract_category: 'callput' })).toBe(false);
        });

        it('should fallback to shortcode detection when contract_category is not available', () => {
            // Test with a shortcode that has numeric barriers (should be Higher/Lower)
            expect(isHigherLowerContractInfo({ shortcode: 'CALL_1HZ100V_19.53_1695913929_5T_19.60_0' })).toBe(true);

            // Test with a shortcode that has S0P barrier (should be Rise/Fall)
            expect(isHigherLowerContractInfo({ shortcode: 'CALL_1HZ100V_19.53_1695913929_5T_S0P_0' })).toBe(false);
        });

        it('should return false when neither contract_category nor shortcode is available', () => {
            expect(isHigherLowerContractInfo({})).toBe(false);
        });

        it('should prioritize contract_category over shortcode when both are available', () => {
            // Even if shortcode suggests Higher/Lower, contract_category should take precedence
            expect(
                isHigherLowerContractInfo({
                    contract_category: 'callput',
                    shortcode: 'CALL_R_100_10_1234567890_1234567890_+1.23_0',
                })
            ).toBe(false);
        });
    });
});
