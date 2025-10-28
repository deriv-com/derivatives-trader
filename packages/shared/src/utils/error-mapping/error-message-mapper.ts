import { localize } from '@deriv-com/translations';
import type { ErrorObject } from './types';

/**
 * Maps error subcodes to user-friendly, localized error messages
 * Parameters from code_args are passed directly to localize() as object literals
 *
 * @param error - Error object that may contain subcode, message, and code_args
 * @returns Localized error message with parameters substituted
 */
export const mapErrorMessage = (error: ErrorObject): string => {
    // If error object is null/undefined, return generic localized message
    if (!error) {
        return localize('An error occurred. Please try again later.');
    }

    // If subcode doesn't exist, return the backend message or default
    if (!error.subcode) {
        return error.message || localize('An error occurred. Please try again later.');
    }

    // Get parameters from code_args array
    const params = error.code_args || [];

    // Map subcode to localized message with parameter substitution
    switch (error.subcode) {
        case 'AccountBalanceExceedsLimit':
            return localize(
                'Sorry, your account cash balance is too high ({{param_1}}). Your maximum account balance is {{param_2}}.',
                {
                    param_1: params[0],
                    param_2: params[1],
                }
            );
        case 'AlreadyExpired':
            return localize('This contract has already expired.');
        case 'AuthorizationRequired':
            return localize('Please log in.');
        case 'BarrierNotAllowed':
            return localize('Barrier is not allowed for this contract type.');
        case 'BarrierNotInRange':
            return localize('Barrier is not an integer in range of {{param_1}} to {{param_2}}.', {
                param_1: params[0],
                param_2: params[1],
            });
        case 'BarrierOutOfRange':
            return localize('Barrier is out of acceptable range.');
        case 'BarrierValidationError':
            return localize('Barrier can only be up to {{param_1}} decimal places.', {
                param_1: params[0],
            });
        case 'BetExpired':
            return localize('The contract has expired.');
        case 'CancelIsBetter':
            return localize(
                'The spot price has moved. We have not closed this contract because your profit is negative and deal cancellation is active. Cancel your contract to get your full stake back.'
            );
        case 'CannotCancelContract':
            return localize('Deal cancellation is not available for this contract.');
        case 'CannotValidateContract':
            return localize('Cannot validate contract.');
        case 'ClientContractProfitLimitExceeded':
            return localize('Maximum daily profit limit exceeded for this contract.');
        case 'ClientUnderlyingVolumeLimitReached':
            return localize(
                'You will exceed the maximum exposure limit for this market if you purchase this contract. Please close some of your positions and try again.'
            );
        case 'ClientUnwelcome':
            return localize('Sorry, your account is not authorised for any further contract purchases.');
        case 'ClientVolumeLimitReached':
            return localize(
                'You will exceed the maximum exposure limit if you purchase this contract. Please close some of your positions and try again.'
            );
        case 'CompanyWideLimitExceeded':
            return localize(
                'No further trading is allowed on this contract type for the current trading session For more info, refer to our terms and conditions.'
            );
        case 'ContractAlreadySold':
            return localize('This contract has been sold.');
        case 'ContractAlreadyStarted':
            return localize('Start time is in the past.');
        case 'ContractExpiryNotAllowed':
            return localize('Contract may not expire between {{param_1}} and {{param_2}}.', {
                param_1: params[0],
                param_2: params[1],
            });
        case 'ContractNotFound':
            return localize('This contract was not found among your open positions.');
        case 'ContractUpdateDisabled':
            return localize('Update of stop loss and take profit is not available at the moment.');
        case 'ContractUpdateFailure':
            return localize('Invalid contract update parameters.');
        case 'ContractUpdateNotAllowed':
            return localize(
                "This contract cannot be updated once you've made your purchase.This feature is not available for this contract type."
            );
        case 'ContractUpdateTooFrequent':
            return localize('Only one update per second is allowed.');
        case 'CrossMarketIntraday':
            return localize('Intraday contracts may not cross market open.');
        case 'DailyProfitLimitExceeded':
            return localize('No further trading is allowed for the current trading session.');
        case 'DailyTurnoverLimitExceeded':
            return localize(
                'Purchasing this contract will cause you to exceed your daily turnover limit of {{param_1}} {{param_2}}.',
                {
                    param_1: params[0],
                    param_2: params[1],
                }
            );
        case 'DealCancellationBlackout':
            return localize('Deal cancellation is not available from {{param_1}} to {{param_2}}.', {
                param_1: params[0],
                param_2: params[1],
            });
        case 'DealCancellationExpired':
            return localize(
                'Deal cancellation period has expired. Your contract can only be cancelled while deal cancellation is active.'
            );
        case 'DealCancellationNotAvailable':
            return localize('Deal cancellation is not available for this asset.');
        case 'DealCancellationNotBought':
            return localize(
                'This contract does not include deal cancellation. Your contract can only be cancelled when you select deal cancellation in your purchase.'
            );
        case 'DigitOutOfRange':
            return localize('Digit must be in the range of {{param_1}} to {{param_2}}.', {
                param_1: params[0],
                param_2: params[1],
            });
        case 'DuplicateExpiry':
            return localize('Please enter only {{param_1}} or {{param_2}}.', {
                param_1: params[0],
                param_2: params[1],
            });
        case 'EitherStopLossOrCancel':
            return localize(
                'You may use either stop loss or deal cancellation, but not both. Please select either one.'
            );
        case 'EitherTakeProfitOrCancel':
            return localize(
                'You may use either take profit or deal cancellation, but not both. Please select either one.'
            );
        case 'EntryTickMissing':
            return localize('Waiting for entry tick.');
        case 'FutureStartTime':
            return localize('Start time is in the future.');
        case 'GeneralError':
            return localize('A general error has occurred.');
        case 'GrowthRateOutOfRange':
            return localize('Growth rate is not in acceptable range. Accepts {{param_1}}.', {
                param_1: params[0],
            });
        case 'IncorrectBarrierOffsetDecimals':
            return localize('{{param_1}} barrier offset can not have more than {{param_2}} decimal places.', {
                param_1: params[0],
                param_2: params[1],
            });
        case 'IncorrectPayoutDecimals':
            return localize('Payout can not have more than {{param_1}} decimal places.', {
                param_1: params[0],
            });
        case 'IncorrectStakeDecimals':
            return localize('Stake can not have more than {{param_1}} decimal places.', {
                param_1: params[0],
            });
        case 'InsufficientBalance':
            return localize('Your account balance is insufficient to buy this contract.');
        case 'IntegerBarrierRequired':
            return localize('Barrier must be an integer.');
        case 'IntegerSelectedTickRequired':
            return localize('Selected tick must be an integer.');
        case 'InternalServerError':
            return localize('Sorry, an error occurred while processing your request.');
        case 'InvalidAmount':
            return localize('Amount provided can not have more than {{param_1}} decimal places.', {
                param_1: params[0],
            });
        case 'InvalidBarrier':
            return localize('Invalid barrier.');
        case 'InvalidBarrierDifferentType':
            return localize('Invalid barrier (Barrier type must be the same for double-barrier contracts).');
        case 'InvalidBarrierDouble':
            return localize('Invalid barrier (Double barrier input is expected).');
        case 'InvalidBarrierForSpot':
            return localize('Barrier must be at least {{param_1}} away from the spot.', {
                param_1: params[0],
            });
        case 'InvalidBarrierMixedBarrier':
            return localize('Invalid barrier (Contract can have only one type of barrier).');
        case 'InvalidBarrierPredefined':
            return localize('Barriers available are {{param_1}}.', {
                param_1: params[0],
            });
        case 'InvalidBarrierRange':
            return localize('Barriers must be on either side of the spot.');
        case 'InvalidBarrierSingle':
            return localize('Invalid barrier (Single barrier input is expected).');
        case 'InvalidBarrierUndef':
            return localize('Invalid barrier.');
        case 'InvalidContractType':
            return localize('Invalid contract type.');
        case 'InvalidDatePricing':
            return localize('This contract cannot be properly validated at this time.');
        case 'InvalidDealCancellation':
            return localize('Deal cancellation is not offered at this duration.');
        case 'InvalidExpiry':
            return localize('Invalid input (duration or date_expiry) for this contract type ({{param_1}}).', {
                param_1: params[0],
            });
        case 'InvalidExpiryTime':
            return localize('Invalid expiry time.');
        case 'InvalidHighBarrier':
            return localize('High barrier must be higher than low barrier.');
        case 'InvalidHighLowBarrierRange':
            return localize('High barrier is out of acceptable range. Please adjust the high barrier.');
        case 'InvalidInput':
            return localize('{{param_1}} is not a valid input for contract type {{param_2}}.', {
                param_1: params[0],
                param_2: params[1],
            });
        case 'InvalidInputAsset':
            return localize('Trading is not offered for this asset.');
        case 'InvalidLowBarrierRange':
            return localize('Low barrier is out of acceptable range. Please adjust the low barrier.');
        case 'InvalidMinStake':
            return localize("Please enter a stake amount that's at least {{param_1}}.", {
                param_1: params[0],
            });
        case 'InvalidNonBinaryPrice':
            return localize('Contract price cannot be zero.');
        case 'InvalidPayoutCurrency':
            return localize('Invalid payout currency');
        case 'InvalidPayoutPerPoint':
            return localize('Available payout per points are {{param_1}}.', {
                param_1: params[0],
            });
        case 'InvalidPrice':
            return localize('Price provided can not have more than {{param_1}} decimal places.', {
                param_1: params[0],
            });
        case 'InvalidRequest':
            return localize('Invalid request.');
        case 'InvalidStake':
            return localize('Invalid stake/payout.');
        case 'InvalidStakeMoreThanPrice':
            return localize("Contract's stake amount is more than the maximum purchase price.");
        case 'InvalidStartEnd':
            return localize('Start time {{param_1}} must be before end time {{param_2}}', {
                param_1: params[0],
                param_2: params[1],
            });
        case 'InvalidStopOut':
            return localize(
                'Invalid stop out. Stop out must be {{param_1}} than current spot price. Please adjust stake or multiplier.',
                {
                    param_1: params[0],
                }
            );
        case 'InvalidStyle':
            return localize('Invalid style.');
        case 'InvalidSymbol':
            return localize('Invalid symbol.');
        case 'InvalidTickExpiry':
            return localize('Invalid duration (tick) for contract type ({{param_1}}).', {
                param_1: params[0],
            });
        case 'InvalidToken':
            return localize('Your token has expired or is invalid.');
        case 'InvalidUpdateArgument':
            return localize('Only a hash reference input is accepted.');
        case 'InvalidUpdateValue':
            return localize('Please enter a number or a null value.');
        case 'InvalidVolatility':
            return localize('We could not process this contract at this time.');
        case 'LimitOrderAmountTooHigh':
            return localize('Enter an amount equal to or lower than {{param_1}}.', {
                param_1: params[0],
            });
        case 'LimitOrderAmountTooLow':
            return localize('Enter an amount equal to or higher than {{param_1}}.', {
                param_1: params[0],
            });
        case 'LimitOrderIncorrectDecimal':
            return localize('Only {{param_1}} decimal places allowed.', {
                param_1: params[0],
            });
        case 'MarketIsClosed':
            return localize('This market is presently closed. Market will open at {{param_1}}.', {
                param_1: params[0],
            });
        case 'MaxAggregateOpenStakeExceeded':
            return localize(
                'No further trading is allowed on this growth rate and instrument. Please try again later or alternatively try on other instrument or growth rate.'
            );
        case 'MissingBasisSpot':
            return localize('Basis spot is not defined.');
        case 'MissingConfig':
            return localize('Missing configuration for {{param_1}} and {{param_2}} with expiry type {{param_3}}', {
                param_1: params[0],
                param_2: params[1],
                param_3: params[2],
            });
        case 'MissingContractId':
            return localize('Contract id is required.');
        case 'MissingEither':
            return localize('Please specify either {{param_1}} or {{param_2}}.', {
                param_1: params[0],
                param_2: params[1],
            });
        case 'MissingMarketData':
            return localize('Trading is suspended due to missing market data.');
        case 'MissingRequiredContractConfig':
            return localize('Missing required contract config.');
        case 'MissingRequiredContractParams':
            return localize('Missing required contract parameters ({{param_1}}).', {
                param_1: params[0],
            });
        case 'MissingRequiredDigit':
            return localize('Missing required contract parameters (last digit prediction for digit contracts).');
        case 'MissingRequiredSelectedTick':
            return localize('Missing required contract parameters (selected tick).');
        case 'MissingSpotMarketData':
            return localize('Trading is suspended due to missing market (spot too far) data.');
        case 'MissingTickMarketData':
            return localize('Trading is suspended due to missing market (tick) data.');
        case 'MissingVanillaFinancialConfig':
            return localize('Missing vanilla option configuration for financial symbols');
        case 'MissingVolatilityMarketData':
            return localize('Trading is suspended due to missing market (volatility) data.');
        case 'MultiplierOutOfRange':
            return localize('Multiplier is not in acceptable range. Accepts {{param_1}}.', {
                param_1: params[0],
            });
        case 'MultiplierRangeDisabled':
            return localize('Multiplier is not in acceptable range.');
        case 'NeedAbsoluteBarrier':
            return localize('Contracts more than 24 hours in duration would need an absolute barrier.');
        case 'NegativeContractBarrier':
            return localize('Barrier offset {{param_1}} exceeded quote price, contract barrier must be positive.', {
                param_1: params[0],
            });
        case 'NegativeTakeProfit':
            return localize('Negative take profit value is not accepted');
        case 'NoBusiness':
            return localize('This contract is unavailable on this account.');
        case 'NoBusinessMultiplier':
            return localize('Trading multiplier options on {{param_1}} is disabled. Please choose another market.', {
                param_1: params[0],
            });
        case 'NoCurrencySet':
            return localize('Please set the currency of your account.');
        case 'NoOpenPosition':
            return localize('This contract was not found among your open positions.');
        case 'NoReturn':
            return localize('This contract offers no return.');
        case 'NonDeterminedBarriers':
            return localize('Barriers could not be determined.');
        case 'NotDefaultCurrency':
            return localize('The provided currency {{param_1}} is not the default currency.', {
                param_1: params[0],
            });
        case 'OfferingsInvalidSymbol':
            return localize("There's no contract available for this symbol.");
        case 'OfferingsSymbolRequired':
            return localize('Symbol is required.');
        case 'OldMarketData':
            return localize('Trading is suspended due to missing market (old) data.');
        case 'OpenPositionLimit':
            return localize(
                'Sorry, you cannot hold more than {{param_1}} contracts at a given time.Please wait until some contracts have closed and try again.',
                {
                    param_1: params[0],
                }
            );
        case 'OpenPositionLimitExceeded':
            return localize('You have too many open positions for this contract type.');
        case 'OpenPositionPayoutLimit':
            return localize(
                'Sorry, the aggregate payouts of contracts on your account cannot exceed {{param_1}} {{param_2}}.',
                {
                    param_1: params[0],
                    param_2: params[1],
                }
            );
        case 'OrderUpdateNotAllowed':
            return localize('Only updates to these parameters are allowed {{param_1}}.', {
                param_1: params[0],
            });
        case 'OutdatedVolatilityData':
            return localize('Trading is suspended due to missing market (out-of-date volatility) data.');
        case 'PastExpiryTime':
            return localize('Expiry time cannot be in the past.');
        case 'PastStartTime':
            return localize('Start time is in the past.');
        case 'PayoutLimitExceeded':
            return localize('Maximum payout allowed is {{param_1}}.', {
                param_1: params[0],
            });
        case 'PayoutLimits':
            return localize(
                'Minimum stake of {{param_1}} and maximum payout of {{param_2}}. Current payout is {{param_3}}.',
                {
                    param_1: params[0],
                    param_2: params[1],
                    param_3: params[2],
                }
            );
        case 'PermissionDenied':
            return localize('Permission denied.');
        case 'PriceMoved':
            return localize(
                'The underlying market has moved too much since you priced the contract.The contract {{param_4}} has changed from {{param_2}} {{param_1}} to {{param_3}} {{param_1}}.',
                {
                    param_1: params[0],
                    param_2: params[1],
                    param_3: params[2],
                    param_4: params[3],
                }
            );
        case 'ProductSpecificTurnoverLimitExceeded':
            return localize(
                "You've reached the maximum daily stake for this trade type. Choose another trade type, or wait until {{param_1}} {{param_2}} {{param_3}} {{param_4}} {{param_5}} UTC tomorrow for the daily limit to reset.",
                {
                    param_1: params[0],
                    param_2: params[1],
                    param_3: params[2],
                    param_4: params[3],
                    param_5: params[4],
                }
            );
        case 'PromoCodeLimitExceeded':
            return localize(
                'Your account has exceeded the trading limit with free promo code, please deposit if you wish to continue trading.'
            );
        case 'RateLimitExceeded':
            return localize('Rate limit exceeded.');
        case 'RefundBuyForMissingData':
            return localize(
                'There was a market data disruption during the contract period.For real-money accounts we will attempt to correct this and settle the contract properly, otherwise the contract will be cancelled and refunded. Virtual-money contracts will be cancelled and refunded.'
            );
        case 'ResaleNotOffered':
            return localize('Resale of this contract is not offered.');
        case 'ResaleNotOfferedHolidays':
            return localize('Resale of this contract is not offered due to market holidays during contract period.');
        case 'ResalePathDependentNotAllowed':
            return localize('Resale not available during rollover time.');
        case 'ResetBarrierError':
            return localize('Non atm barrier is not allowed for reset contract.');
        case 'ResetFixedExpiryError':
            return localize('Fixed expiry for reset contract is not allowed.');
        case 'RoundingExceedPermittedEpsilon':
            return localize('Only a maximum of two decimal points are allowed for the amount.');
        case 'SameBarriersNotAllowed':
            return localize('High and low barriers must be different.');
        case 'SameExpiryStartTime':
            return localize('Expiry time cannot be equal to start time.');
        case 'SameStartSellTime':
            return localize('Contract cannot be sold at this time. Please try again.');
        case 'SameTradingDayExpiry':
            return localize(
                'Contracts on this market with a duration of under 24 hours must expire on the same trading day.'
            );
        case 'SelectedTickNumberLimits':
            return localize('Tick prediction must be between {{param_1}} and {{param_2}}.', {
                param_1: params[0],
                param_2: params[1],
            });
        case 'SellAtEntryTick':
            return localize('Contract cannot be sold at entry tick. Please wait for the next tick.');
        case 'SellFailureDueToUpdate':
            return localize('Sell failed because contract was updated.');
        case 'SellPriceLowerThanStake':
            return localize('Sell price must be higher than stake {{param_1}}.', {
                param_1: params[0],
            });
        case 'SingleTickNumberLimits':
            return localize('Number of ticks must be {{param_1}}.', {
                param_1: params[0],
            });
        case 'SpecificOpenPositionLimitExceeded':
            return localize('You have exceeded the open position limit for contracts of this type.');
        case 'StakeLimitExceeded':
            return localize('Maximum stake allowed is {{param_1}}.', {
                param_1: params[0],
            });
        case 'StakeLimits':
            return localize(
                'Minimum stake of {{param_1}} and maximum payout of {{param_2}}. Current stake is {{param_3}}.',
                {
                    param_1: params[0],
                    param_2: params[1],
                    param_3: params[2],
                }
            );
        case 'StakeTooLow':
            return localize(
                "This contract's price is {{param_2}} {{param_1}}. Contracts purchased from {{param_3}} must have a purchase price above {{param_4}} {{param_1}}. Please accordingly increase the contract amount to meet this minimum stake.",
                {
                    param_1: params[0],
                    param_2: params[1],
                    param_3: params[2],
                    param_4: params[3],
                }
            );
        case 'Suspendedlogin':
            return localize(
                "We can't take you to your account right now due to system maintenance.Please try again later."
            );
        case 'SymbolMissingInBetMarketTable':
            return localize('Trading is suspended for this instrument.');
        case 'TicksNumberLimits':
            return localize('Number of ticks must be between {{param_1}} and {{param_2}}.', {
                param_1: params[0],
                param_2: params[1],
            });
        case 'TooManyHolidays':
            return localize('Too many market holidays during the contract period.');
        case 'TradeTemporarilyUnavailable':
            return localize('This trade is temporarily unavailable.');
        case 'TradingConfigError':
            return localize('Sorry, an error occurred while processing your request.');
        case 'TradingDayEndExpiry':
            return localize(
                'Contracts on this market with a duration of more than 24 hours must expire at the end of a trading day.'
            );
        case 'TradingDayExpiry':
            return localize('The contract must expire on a trading day.');
        case 'TradingDisabled':
            return localize('Trading is disabled for this account.');
        case 'TradingDurationNotAllowed':
            return localize('Trading is not offered for this duration.');
        case 'TradingHoursExpiry':
            return localize('Contract must expire during trading hours.');
        case 'TradingNotAvailable':
            return localize('Trading is not available from {{param_1}} to {{param_2}}.', {
                param_1: params[0],
                param_2: params[1],
            });
        case 'TradingSuspendedSpecificHours':
            return localize(
                'Trading on forex contracts with duration less than 5 hours is not available from {{param_1}} to {{param_2}}',
                {
                    param_1: params[0],
                    param_2: params[1],
                }
            );
        case 'TransactionTimeTooOld':
            return localize('Cannot create contract.');
        case 'TransactionTimeTooYoung':
            return localize('Cannot create contract.');
        case 'UpdateStopLossNotAllowed':
            return localize('You may update your stop loss amount after deal cancellation has expired.');
        case 'UpdateTakeProfitNotAllowed':
            return localize('You may update your take profit amount after deal cancellation has expired.');
        case 'WaitForContractSettlement':
            return localize(
                'Please wait for contract settlement. The final settlement price may differ from the indicative price.'
            );
        case 'WrongAmountTypeOne':
            return localize('Basis must be {{param_1}} for this contract.', {
                param_1: params[0],
            });
        case 'WrongAmountTypeTwo':
            return localize('Basis can either be {{param_1}} or {{param_2}} for this contract.', {
                param_1: params[0],
                param_2: params[1],
            });
        case 'ZeroAbsoluteBarrier':
            return localize('Barrier cannot be zero.');

        // If subcode is not mapped, return the backend message or default
        default:
            return error.message || localize('An error occurred. Please try again later.');
    }
};
