import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { TSocketResponse } from '../../types';
import APIProvider from '../APIProvider';
import AuthProvider from '../AuthProvider';
import useMutation from '../useMutation';

jest.mock('../useAPI', () => () => ({
    send: async () => ({ ping: 'pong' }) as TSocketResponse<'ping'>,
}));

describe('useMutation', () => {
    test('should call ping and get pong in response', async () => {
        const wrapper = ({ children }: { children: JSX.Element }) => (
            <APIProvider>
                <AuthProvider>{children}</AuthProvider>
            </APIProvider>
        );

        const { result, waitFor } = renderHook(() => useMutation('ping'), { wrapper });

        result.current.mutate();

        await waitFor(() => result.current.isSuccess, { timeout: 10000 });

        expect(result.current.data?.ping).toEqual('pong');
    });
});
