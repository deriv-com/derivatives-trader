import { TBuyContractRequest, TBuyContractResponse } from '@deriv/api';
import { WS } from '@deriv/shared';

type TResponse = TBuyContractResponse & {
    echo_req: TBuyContractRequest;
    error?: {
        code: string;
        message: string;
        details?: TBuyContractResponse['buy'] & { field: string };
    };
};

export const processPurchase = async (
    proposal_id: string,
    price: string | number,
    passthrough?: TBuyContractRequest['passthrough']
): Promise<TResponse> =>
    WS.buy({
        proposal_id,
        price,
        ...(passthrough && { passthrough }),
    });
