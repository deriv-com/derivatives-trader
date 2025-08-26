import React from 'react';
import classNames from 'classnames';

import { TradeTypeIconsMapper } from '@deriv/components';
import { TRADE_TYPES } from '@deriv/shared';

type TIconTradeCategory = {
    category: string;
    className?: string;
};

const IconTradeCategory = ({ category, className }: TIconTradeCategory) => {
    let IconCategory;
    if (category) {
        switch (category) {
            case TRADE_TYPES.RISE_FALL:
            case TRADE_TYPES.RISE_FALL_EQUAL:
                IconCategory = (
                    <React.Fragment>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeCall' className='category-type' />
                        </div>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypePut' className='category-type' />
                        </div>
                    </React.Fragment>
                );
                break;
            case TRADE_TYPES.HIGH_LOW:
                IconCategory = (
                    <React.Fragment>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeCallBarrier' className='category-type' />
                        </div>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypePutBarrier' className='category-type' />
                        </div>
                    </React.Fragment>
                );
                break;
            case TRADE_TYPES.END:
                IconCategory = (
                    <React.Fragment>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeExpirymiss' className='category-type' />
                        </div>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeExpiryrange' className='category-type' />
                        </div>
                    </React.Fragment>
                );
                break;
            case TRADE_TYPES.STAY:
                IconCategory = (
                    <React.Fragment>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeRange' className='category-type' />
                        </div>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeUpordown' className='category-type' />
                        </div>
                    </React.Fragment>
                );
                break;
            case TRADE_TYPES.MATCH_DIFF:
                IconCategory = (
                    <React.Fragment>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeDigitmatch' className='category-type' />
                        </div>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeDigitdiff' className='category-type' />
                        </div>
                    </React.Fragment>
                );
                break;
            case TRADE_TYPES.EVEN_ODD:
                IconCategory = (
                    <React.Fragment>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeDigiteven' className='category-type' />
                        </div>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeDigitodd' className='category-type' />
                        </div>
                    </React.Fragment>
                );
                break;
            case TRADE_TYPES.OVER_UNDER:
                IconCategory = (
                    <React.Fragment>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeDigitover' className='category-type' />
                        </div>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeDigitunder' className='category-type' />
                        </div>
                    </React.Fragment>
                );
                break;
            case TRADE_TYPES.TOUCH:
                IconCategory = (
                    <React.Fragment>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeOnetouch' className='category-type' />
                        </div>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeNotouch' className='category-type' />
                        </div>
                    </React.Fragment>
                );
                break;
            case TRADE_TYPES.ASIAN:
                IconCategory = (
                    <React.Fragment>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeAsianu' className='category-type' />
                        </div>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeAsiand' className='category-type' />
                        </div>
                    </React.Fragment>
                );
                break;
            case TRADE_TYPES.LB_CALL:
                IconCategory = (
                    <div className='category-wrapper'>
                        <TradeTypeIconsMapper icon='IcTradetypeLbcall' className='category-type' />
                    </div>
                );
                break;
            case TRADE_TYPES.LB_PUT:
                IconCategory = (
                    <div className='category-wrapper'>
                        <TradeTypeIconsMapper icon='IcTradetypeLbput' className='category-type' />
                    </div>
                );
                break;
            case TRADE_TYPES.LB_HIGH_LOW:
                IconCategory = (
                    <div className='category-wrapper'>
                        <TradeTypeIconsMapper icon='IcTradetypeLbhighlow' className='category-type' />
                    </div>
                );
                break;
            case TRADE_TYPES.RUN_HIGH_LOW:
                IconCategory = (
                    <React.Fragment>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeRunhigh' className='category-type' />
                        </div>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeRunlow' className='category-type' />
                        </div>
                    </React.Fragment>
                );
                break;
            case TRADE_TYPES.RESET:
                IconCategory = (
                    <React.Fragment>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeResetcall' className='category-type' />
                        </div>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeResetput' className='category-type' />
                        </div>
                    </React.Fragment>
                );
                break;
            case TRADE_TYPES.TICK_HIGH_LOW:
                IconCategory = (
                    <React.Fragment>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeTickhigh' className='category-type' />
                        </div>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeTicklow' className='category-type' />
                        </div>
                    </React.Fragment>
                );
                break;
            case TRADE_TYPES.CALL_PUT_SPREAD:
                IconCategory = (
                    <React.Fragment>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeCallspread' className='category-type' />
                        </div>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypePutspread' className='category-type' />
                        </div>
                    </React.Fragment>
                );
                break;
            case TRADE_TYPES.MULTIPLIER:
                IconCategory = (
                    <React.Fragment>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeMultup' className='category-type' />
                        </div>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeMultdown' className='category-type' />
                        </div>
                    </React.Fragment>
                );
                break;
            case TRADE_TYPES.ACCUMULATOR:
                IconCategory = (
                    <div className='category-wrapper'>
                        <TradeTypeIconsMapper icon='IcTradetypeAccu' className='category-type' />
                    </div>
                );
                break;
            case TRADE_TYPES.TURBOS.LONG:
            case TRADE_TYPES.TURBOS.SHORT:
                IconCategory = (
                    <React.Fragment>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeTurboslong' className='category-type' />
                        </div>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeTurbosshort' className='category-type' />
                        </div>
                    </React.Fragment>
                );
                break;
            case TRADE_TYPES.VANILLA.CALL:
            case TRADE_TYPES.VANILLA.PUT:
                IconCategory = (
                    <React.Fragment>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeVanillaLongCall' className='category-type' />
                        </div>
                        <div className='category-wrapper'>
                            <TradeTypeIconsMapper icon='IcTradetypeVanillaLongPut' className='category-type' />
                        </div>
                    </React.Fragment>
                );
                break;
            default:
                IconCategory = (
                    <div className='category-wrapper'>
                        <TradeTypeIconsMapper icon='IcUnknown' className='category-type' />
                    </div>
                );
                break;
        }
    }
    return (
        <div className={classNames('categories-container', className)} data-testid='dt-categories-container'>
            {IconCategory}
        </div>
    );
};

export default IconTradeCategory;
