import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { TSocketResponse } from '../../types';
import APIProvider from '../APIProvider';
import AuthProvider from '../AuthProvider';
import useMutation from '../useMutation';

jest.mock('../useAPI', () => () => ({
    send: async () => ({ time: 123456789 }) as TSocketResponse<'time'>,
}));

describe('useMutation', () => {
    test('should call time and get response', async () => {
        const wrapper = ({ children }: { children: JSX.Element }) => (
            <APIProvider>
                <AuthProvider>{children}</AuthProvider>
            </APIProvider>
        );

        const { result, waitFor } = renderHook(() => useMutation('time'), { wrapper });

        result.current.mutate();

        await waitFor(() => result.current.isSuccess, { timeout: 10000 });

        expect(result.current.data?.time).toEqual(123456789);
    });
});
