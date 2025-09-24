import React from 'react';
import { renderHook } from '@testing-library/react-hooks';
import { TSocketResponse } from '../../types';
import APIProvider from '../APIProvider';
import AuthProvider from '../AuthProvider';
import useQuery from '../useQuery';

// mock the useAPI hook
jest.mock('../useAPI', () => () => ({
    send: async () => ({ time: 123456789 }) as TSocketResponse<'time'>,
}));

describe('useQuery', () => {
    test('should call time and get response', async () => {
        const wrapper = ({ children }: { children: JSX.Element }) => (
            <APIProvider>
                <AuthProvider>{children}</AuthProvider>
            </APIProvider>
        );

        const { result, waitFor } = renderHook(() => useQuery('time'), { wrapper });

        await waitFor(() => result.current.isSuccess, { timeout: 10000 });

        expect(result.current.data?.time).toEqual(123456789);
    });
});
