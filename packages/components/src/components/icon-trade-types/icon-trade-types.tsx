import React from 'react';
import TradeTypeIconsMapper from '../trade-type-icons-mapper';
import { CONTRACT_TYPES } from '@deriv/shared';

type TIconTradeTypes = {
    type: string;
    className?: string;
    iconSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
    color?: string;
};

const IconTradeTypes = ({ type, className, iconSize = 'md', color, ...props }: TIconTradeTypes) => {
    const getIconName = (contractType: string): string => {
        switch (contractType.toUpperCase()) {
            case CONTRACT_TYPES.ACCUMULATOR:
                return 'IcTradetypeAccu';
            case CONTRACT_TYPES.ASIAN.DOWN:
                return 'IcTradetypeAsiand';
            case CONTRACT_TYPES.ASIAN.UP:
                return 'IcTradetypeAsianu';
            case CONTRACT_TYPES.CALL_BARRIER:
                return 'IcTradetypeCallBarrier';
            case CONTRACT_TYPES.CALLE:
            case CONTRACT_TYPES.CALL:
                return 'IcTradetypeCall';
            case CONTRACT_TYPES.CALL_PUT_SPREAD.CALL:
                return 'IcTradetypeCallspread';
            case CONTRACT_TYPES.CALL_PUT_SPREAD.PUT:
                return 'IcTradetypePutspread';
            case CONTRACT_TYPES.MATCH_DIFF.DIFF:
                return 'IcTradetypeDigitdiff';
            case CONTRACT_TYPES.EVEN_ODD.EVEN:
                return 'IcTradetypeDigiteven';
            case CONTRACT_TYPES.MATCH_DIFF.MATCH:
                return 'IcTradetypeDigitmatch';
            case CONTRACT_TYPES.EVEN_ODD.ODD:
                return 'IcTradetypeDigitodd';
            case CONTRACT_TYPES.OVER_UNDER.OVER:
                return 'IcTradetypeDigitover';
            case CONTRACT_TYPES.OVER_UNDER.UNDER:
                return 'IcTradetypeDigitunder';
            case CONTRACT_TYPES.END.OUT:
                return 'IcTradetypeExpirymiss';
            case CONTRACT_TYPES.EXPIRYRANGEE:
            case CONTRACT_TYPES.END.IN:
                return 'IcTradetypeExpiryrange';
            case CONTRACT_TYPES.LB_CALL:
                return 'IcTradetypeLbcall';
            case CONTRACT_TYPES.HIGHER:
            case 'HIGHER_BARRIER':
                return 'IcTradetypeCallBarrier';
            case CONTRACT_TYPES.LB_PUT:
                return 'IcTradetypeLbput';
            case CONTRACT_TYPES.LB_HIGH_LOW:
                return 'IcTradetypeLbhighlow';
            case CONTRACT_TYPES.LOWER:
            case 'LOWER_BARRIER':
                return 'IcTradetypePutBarrier';
            case CONTRACT_TYPES.MULTIPLIER.DOWN:
                return 'IcTradetypeMultdown';
            case CONTRACT_TYPES.MULTIPLIER.UP:
                return 'IcTradetypeMultup';
            case CONTRACT_TYPES.TOUCH.NO_TOUCH:
                return 'IcTradetypeNotouch';
            case CONTRACT_TYPES.TOUCH.ONE_TOUCH:
                return 'IcTradetypeOnetouch';
            case CONTRACT_TYPES.PUT_BARRIER:
                return 'IcTradetypePutBarrier';
            case CONTRACT_TYPES.PUTE:
            case CONTRACT_TYPES.PUT:
                return 'IcTradetypePut';
            case CONTRACT_TYPES.STAY.IN:
                return 'IcTradetypeRange';
            case CONTRACT_TYPES.RESET.CALL:
                return 'IcTradetypeResetcall';
            case CONTRACT_TYPES.RESET.PUT:
                return 'IcTradetypeResetput';
            case CONTRACT_TYPES.RUN_HIGH_LOW.HIGH:
                return 'IcTradetypeRunhigh';
            case CONTRACT_TYPES.RUN_HIGH_LOW.LOW:
                return 'IcTradetypeRunlow';
            case CONTRACT_TYPES.TICK_HIGH_LOW.HIGH:
                return 'IcTradetypeTickhigh';
            case CONTRACT_TYPES.TICK_HIGH_LOW.LOW:
                return 'IcTradetypeTicklow';
            case CONTRACT_TYPES.TURBOS.LONG:
                return 'IcTradetypeTurboslong';
            case CONTRACT_TYPES.TURBOS.SHORT:
                return 'IcTradetypeTurbosshort';
            case CONTRACT_TYPES.STAY.OUT:
                return 'IcTradetypeUpordown';
            case CONTRACT_TYPES.VANILLA.CALL:
                return 'IcTradetypeVanillaLongCall';
            case CONTRACT_TYPES.VANILLA.PUT:
                return 'IcTradetypeVanillaLongPut';
            default:
                return 'IcUnknown';
        }
    };

    const iconName = getIconName(type);

    return <TradeTypeIconsMapper icon={iconName} className={className} iconSize={iconSize} color={color} {...props} />;
};

export default IconTradeTypes;
