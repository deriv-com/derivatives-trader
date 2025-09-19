import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { TSocketResponse } from '../../types';
import APIProvider from '../APIProvider';
import useMutation from '../useMutation';

jest.mock('@deriv/shared', () => ({
    ...jest.requireActual('@deriv/shared'),
    useWS: () => ({
        send: jest.fn(() =>
            Promise.resolve<TSocketResponse<'time'>>({
                msg_type: 'time',
                time: 123456789,
                echo_req: {},
            })
        ),
    }),
}));

describe('useMutation', () => {
    test('should call time and get response', async () => {
        const wrapper = ({ children }: { children: JSX.Element }) => <APIProvider>{children}</APIProvider>;

        const { result, waitFor } = renderHook(() => useMutation('time'), { wrapper });

        result.current.mutate();

        await waitFor(() => result.current.isSuccess, { timeout: 10000 });

        expect(result.current.data?.time).toEqual(123456789);
    });
});
