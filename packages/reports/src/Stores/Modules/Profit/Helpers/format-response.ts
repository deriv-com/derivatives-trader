import { TProfitTableResponse } from '@deriv/api';
import { formatMoney, getMarketInformation, getSymbolDisplayName, toMoment } from '@deriv/shared';

export type TTransaction = NonNullable<NonNullable<TProfitTableResponse['profit_table']>['transactions']>[number];

export const formatProfitTableTransactions = (transaction: TTransaction, currency: string) => {
    const format_string = 'DD MMM YYYY HH:mm:ss';
    const purchase_time =
        transaction.purchase_time && `${toMoment(Number(transaction.purchase_time)).format(format_string)}`;
    const purchase_time_unix = transaction.purchase_time;
    const sell_time = transaction.sell_time && `${toMoment(Number(transaction.sell_time)).format(format_string)}`;
    const payout = transaction.payout ?? NaN;
    const sell_price = transaction.sell_price ?? NaN;
    const buy_price = transaction.buy_price ?? NaN;
    const profit_loss = formatMoney(currency, Number(sell_price - buy_price), true);
    const display_name = getSymbolDisplayName(getMarketInformation(transaction.shortcode ?? '').underlying);

    return {
        ...transaction,
        ...{
            payout,
            sell_price,
            buy_price,
            profit_loss,
            sell_time,
            purchase_time,
            display_name,
            purchase_time_unix,
        },
    };
};
