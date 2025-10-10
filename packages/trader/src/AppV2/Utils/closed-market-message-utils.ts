import { TTradingTimesResponse } from '@deriv/api';

export const calculateTimeLeft = (remaining_time_to_open: number) => {
    const difference = remaining_time_to_open - Date.now();
    return difference > 0
        ? {
              days: Math.floor(difference / (1000 * 60 * 60 * 24)),
              hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
              minutes: Math.floor((difference / 1000 / 60) % 60),
              seconds: Math.floor((difference / 1000) % 60),
          }
        : {};
};

export const getSymbol = (
    target_symbol: string,
    trading_times: NonNullable<DeepRequired<TTradingTimesResponse['trading_times']>>
) => {
    let symbol;
    const { markets } = trading_times;
    for (let i = 0; i < markets.length; i++) {
        const { submarkets } = markets[i];
        if (submarkets) {
            for (let j = 0; j < submarkets.length; j++) {
                const { symbols } = submarkets[j];
                symbol = symbols?.find(item => item.underlying_symbol === target_symbol);
                if (symbol !== undefined) return symbol;
            }
        }
    }
};
