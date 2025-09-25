import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { TSocketResponse } from '../../types';
import APIProvider from '../APIProvider';
import usePaginatedFetch from '../usePaginatedFetch';

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    useWS: () => ({
        send: jest.fn(() =>
            Promise.resolve<TSocketResponse<'statement'>>({
                statement: {
                    transactions: [
                        {
                            action_type: 'buy',
                            amount: 50,
                            balance_after: 1000,
                            contract_id: 123456789,
                            payout: 100,
                            purchase_time: 1234567890,
                            reference_id: 987654321,
                            shortcode: 'CALL_R_100_90_1234567890_1234567900_S0P_0',
                            transaction_id: 111222333,
                            transaction_time: 1234567890,
                        },
                    ],
                },
                echo_req: {},
                msg_type: 'statement',
                req_id: 1,
            })
        ),
    }),
}));

describe('usePaginatedFetch', () => {
    it('should call statement and get data in response', async () => {
        const wrapper = ({ children }: { children: JSX.Element }) => <APIProvider>{children}</APIProvider>;

        const { result, waitFor } = renderHook(() => usePaginatedFetch('statement'), { wrapper });

        await waitFor(() => result.current.isSuccess, { timeout: 10000 });

        const transactions = result.current.data?.statement?.transactions;

        expect(transactions).toHaveLength(1);
        expect(transactions?.[0].amount).toBe(50);
        expect(transactions?.[0].action_type).toBe('buy');
        expect(transactions?.[0].balance_after).toBe(1000);
    });
});
