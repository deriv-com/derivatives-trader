import { localize } from '@deriv-com/translations';
import type { ErrorObject } from './types';

/**
 * Maps error subcodes to user-friendly, localized error messages
 * Parameters from errorcode_arr_js are passed directly to localize() as object literals
 *
 * @param error - Error object that may contain subcode, message, and errorcode_arr_js
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

    // Get parameters from errorcode_arr_js array
    const params = error.errorcode_arr_js || [];

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
                'This contract cannot be updated once you have made your purchase. This feature is not available for this contract type.'
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
            return localize(
                'You have insufficient funds in your account to purchase this contract. Please add funds to your account to continue trading.'
            );
        case 'InvalidAmount':
            return localize('Please enter a valid amount.');
        case 'InvalidBarrier':
            return localize('Please enter a valid barrier.');
        case 'InvalidContractType':
            return localize('Invalid contract type.');
        case 'InvalidCurrency':
            return localize('Invalid currency.');
        case 'InvalidDate':
            return localize('Please enter a valid date.');
        case 'InvalidDuration':
            return localize('Please enter a valid duration.');
        case 'InvalidDurationUnit':
            return localize('Invalid duration unit.');
        case 'InvalidExpiry':
            return localize('Please enter a valid expiry time.');
        case 'InvalidMarket':
            return localize('Invalid market.');
        case 'InvalidPayout':
            return localize('Please enter a valid payout.');
        case 'InvalidStake':
            return localize('Please enter a valid stake.');
        case 'InvalidStartTime':
            return localize('Please enter a valid start time.');
        case 'InvalidStopLoss':
            return localize('Please enter a valid stop loss amount.');
        case 'InvalidSymbol':
            return localize('Invalid symbol.');
        case 'InvalidTakeProfit':
            return localize('Please enter a valid take profit amount.');
        case 'LimitOrderNotAllowed':
            return localize('Limit orders are not available for this contract type.');
        case 'MarketClosed':
            return localize('This market is currently closed.');
        case 'MarketNotOpen':
            return localize('Market is not open yet.');
        case 'MaxContractDuration':
            return localize('Maximum contract duration is {{param_1}}.', {
                param_1: params[0],
            });
        case 'MaxPayout':
            return localize('Maximum payout is {{param_1}}.', {
                param_1: params[0],
            });
        case 'MaxStake':
            return localize('Maximum stake is {{param_1}}.', {
                param_1: params[0],
            });
        case 'MinContractDuration':
            return localize('Minimum contract duration is {{param_1}}.', {
                param_1: params[0],
            });
        case 'MinPayout':
            return localize('Minimum payout is {{param_1}}.', {
                param_1: params[0],
            });
        case 'MinStake':
            return localize('Minimum stake is {{param_1}}.', {
                param_1: params[0],
            });
        case 'MultiplierNotAllowed':
            return localize('Multiplier is not allowed for this contract type.');
        case 'NoOpenPosition':
            return localize('You have no open positions.');
        case 'NotAuthorized':
            return localize('You are not authorized to perform this action.');
        case 'OptionNotAvailable':
            return localize('This option is not available.');
        case 'PayoutNotInRange':
            return localize('Payout must be between {{param_1}} and {{param_2}}.', {
                param_1: params[0],
                param_2: params[1],
            });
        case 'PleaseAuthenticate':
            return localize('Please authenticate your account to continue trading.');
        case 'ProfitTableEmpty':
            return localize('You have no trading activity.');
        case 'ProposalArrayEmpty':
            return localize('No proposals available.');
        case 'ProposalError':
            return localize('An error occurred while processing your proposal.');
        case 'PurchaseError':
            return localize('An error occurred while processing your purchase.');
        case 'RateLimitExceeded':
            return localize('You have exceeded the rate limit. Please try again later.');
        case 'RequestExpired':
            return localize('This request has expired.');
        case 'SellNotAvailable':
            return localize('Sell is not available for this contract.');
        case 'ServiceUnavailable':
            return localize('Service is temporarily unavailable. Please try again later.');
        case 'SessionExpired':
            return localize('Your session has expired. Please log in again.');
        case 'StakeNotInRange':
            return localize('Stake must be between {{param_1}} and {{param_2}}.', {
                param_1: params[0],
                param_2: params[1],
            });
        case 'StopLossNotAllowed':
            return localize('Stop loss is not allowed for this contract type.');
        case 'StopLossTooHigh':
            return localize('Stop loss must be less than {{param_1}}.', {
                param_1: params[0],
            });
        case 'StopLossTooLow':
            return localize('Stop loss must be more than {{param_1}}.', {
                param_1: params[0],
            });
        case 'SymbolNotActive':
            return localize('This symbol is not active.');
        case 'TakeProfitNotAllowed':
            return localize('Take profit is not allowed for this contract type.');
        case 'TakeProfitTooHigh':
            return localize('Take profit must be less than {{param_1}}.', {
                param_1: params[0],
            });
        case 'TakeProfitTooLow':
            return localize('Take profit must be more than {{param_1}}.', {
                param_1: params[0],
            });
        case 'TradingDisabled':
            return localize('Trading is disabled for your account.');
        case 'TradingHalted':
            return localize('Trading has been halted for this symbol.');
        case 'UnderlyingNotAvailable':
            return localize('This underlying is not available.');
        case 'UnexpectedError':
            return localize('An unexpected error occurred. Please try again.');
        case 'UnsupportedContractType':
            return localize('This contract type is not supported.');
        case 'ValidationFailed':
            return localize('Validation failed. Please check your input.');
        case 'WrongAccountType':
            return localize('This feature is not available for your account type.');
        case 'AccountSuspended':
            return localize('Your account has been suspended. Please contact customer support.');
        case 'AskPriceNotAvailable':
            return localize('Ask price is not available at the moment.');
        case 'BalanceTooLow':
            return localize('Your balance is too low to place this trade.');
        case 'BarrierTooClose':
            return localize('Barrier is too close to current spot price.');
        case 'BarrierTooFar':
            return localize('Barrier is too far from current spot price.');
        case 'BidPriceNotAvailable':
            return localize('Bid price is not available at the moment.');
        case 'ContractExpired':
            return localize('This contract has expired.');
        case 'ContractLocked':
            return localize('This contract is locked and cannot be modified.');
        case 'ContractNotActive':
            return localize('This contract is not active.');
        case 'ContractSold':
            return localize('This contract has already been sold.');
        case 'CurrencyMismatch':
            return localize('Currency mismatch. Please check your account currency.');
        case 'DuplicateContract':
            return localize('You already have an identical contract.');
        case 'DurationTooLong':
            return localize('Duration is too long. Maximum duration is {{param_1}}.', {
                param_1: params[0],
            });
        case 'DurationTooShort':
            return localize('Duration is too short. Minimum duration is {{param_1}}.', {
                param_1: params[0],
            });
        case 'ExpiryInPast':
            return localize('Expiry time is in the past.');
        case 'FeatureNotAvailable':
            return localize('This feature is not available at the moment.');
        case 'ForwardStartingNotAllowed':
            return localize('Forward starting is not allowed for this contract type.');
        case 'HighLowBarrierMismatch':
            return localize('High barrier must be higher than low barrier.');
        case 'InsufficientMargin':
            return localize('Insufficient margin to place this trade.');
        case 'InvalidAccount':
            return localize('Invalid account. Please check your account details.');
        case 'InvalidBarrierOffset':
            return localize('Invalid barrier offset.');
        case 'InvalidContractId':
            return localize('Invalid contract ID.');
        case 'InvalidDateFormat':
            return localize('Invalid date format. Please use the correct format.');
        case 'InvalidMultiplier':
            return localize('Invalid multiplier value.');
        case 'InvalidPrediction':
            return localize('Invalid prediction value.');
        case 'InvalidRequest':
            return localize('Invalid request. Please check your input.');
        case 'InvalidTickCount':
            return localize('Invalid tick count.');
        case 'InvalidTimeFormat':
            return localize('Invalid time format. Please use the correct format.');
        case 'LimitOrdersNotSupported':
            return localize('Limit orders are not supported for this contract.');
        case 'MaintenanceMode':
            return localize('System is under maintenance. Please try again later.');
        case 'MarketSuspended':
            return localize('This market is currently suspended.');
        case 'MaxOpenContracts':
            return localize('You have reached the maximum number of open contracts.');
        case 'MaxPositionSize':
            return localize('Maximum position size exceeded.');
        case 'MinimumNotMet':
            return localize('Minimum requirement not met.');
        case 'MultiplierOutOfRange':
            return localize('Multiplier must be between {{param_1}} and {{param_2}}.', {
                param_1: params[0],
                param_2: params[1],
            });
        case 'NetworkError':
            return localize('Network error. Please check your connection.');
        case 'NoActiveAccount':
            return localize('No active account found.');
        case 'NoQuoteAvailable':
            return localize('No quote available at the moment.');
        case 'NotEnoughBalance':
            return localize('Not enough balance to complete this transaction.');
        case 'OperationNotAllowed':
            return localize('This operation is not allowed.');
        case 'OutsideTradingHours':
            return localize('Trading is not allowed outside trading hours.');
        case 'ParameterMissing':
            return localize('Required parameter is missing.');
        case 'PayoutExceedsLimit':
            return localize('Payout exceeds the maximum limit.');
        case 'PendingVerification':
            return localize('Your account is pending verification.');
        case 'PositionClosed':
            return localize('This position has been closed.');
        case 'PriceNotAvailable':
            return localize('Price is not available at the moment.');
        case 'QuoteExpired':
            return localize('Quote has expired. Please request a new quote.');
        case 'RegionRestricted':
            return localize('This service is not available in your region.');
        case 'SelfExcluded':
            return localize('You have self-excluded from trading.');
        case 'ServerBusy':
            return localize('Server is busy. Please try again later.');
        case 'SpotNotAvailable':
            return localize('Spot price is not available.');
        case 'StakeExceedsLimit':
            return localize('Stake exceeds the maximum limit.');
        case 'StartTimeInPast':
            return localize('Start time cannot be in the past.');
        case 'StartTimeTooFar':
            return localize('Start time is too far in the future.');
        case 'StopLossExceedsStake':
            return localize('Stop loss cannot exceed your stake.');
        case 'SymbolUnavailable':
            return localize('This symbol is currently unavailable.');
        case 'SystemError':
            return localize('A system error occurred. Please try again.');
        case 'TakeProfitTooClose':
            return localize('Take profit is too close to current price.');
        case 'TickDataUnavailable':
            return localize('Tick data is not available.');
        case 'TimeoutError':
            return localize('Request timed out. Please try again.');
        case 'TooManyRequests':
            return localize('Too many requests. Please slow down.');
        case 'TradeNotAllowed':
            return localize('Trading is not allowed for this account.');
        case 'TradingLimitExceeded':
            return localize('You have exceeded your trading limit.');
        case 'TransactionFailed':
            return localize('Transaction failed. Please try again.');
        case 'UnauthorizedAccess':
            return localize('Unauthorized access. Please log in.');
        case 'UnavailableForDemo':
            return localize('This feature is not available for demo accounts.');
        case 'UnavailableForReal':
            return localize('This feature is not available for real accounts.');
        case 'UnknownError':
            return localize('An unknown error occurred.');
        case 'UnknownSymbol':
            return localize('Unknown symbol.');
        case 'UnsupportedOperation':
            return localize('This operation is not supported.');
        case 'UpdateNotAllowed':
            return localize('Update is not allowed at this time.');
        case 'VerificationRequired':
            return localize('Account verification is required to continue.');
        case 'WithdrawalLocked':
            return localize('Withdrawals are currently locked for your account.');

        // If subcode is not mapped, return the backend message or default
        default:
            return error.message || localize('An error occurred. Please try again later.');
    }
};
