import { useCallback, useEffect, useRef, useState } from 'react';

import { WS } from '@deriv/shared';

import { TServerError } from 'Types';

type QueryResult<T> = {
    data: null | T;
    error: TServerError | null;
    is_fetching: boolean;
    refetch: () => void;
};

type QueryOptions = {
    wait_for_authorize?: boolean;
    enabled?: boolean;
    timeout?: number; // timeout in milliseconds, default 30 seconds
};

// Cache object to store the results
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache: Record<string, any> = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ongoing_requests: Record<string, Promise<any> | undefined> = {};

const getKey = (keys: string | string[]) => (Array.isArray(keys) ? keys.join('-') : keys);

export const useDtraderQuery = <Response>(
    keys: string | string[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    request: Record<string, any>,
    options: QueryOptions = {}
): QueryResult<Response> => {
    const key = getKey(keys);
    const { enabled = true, timeout: _timeout = 30000 } = options;
    const [data, setData] = useState<Response | null>(cache[key] || null);
    const [error, setError] = useState<TServerError | null>(null);
    const [is_fetching, setIsFetching] = useState(!cache[key] && enabled);
    const is_mounted = useRef(false);
    const request_string = JSON.stringify(request);

    const { wait_for_authorize = true } = options;

    useEffect(() => {
        is_mounted.current = true;

        return () => {
            is_mounted.current = false;
        };
    }, []);

    const fetchData = useCallback(() => {
        setIsFetching(true);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let send_promise: Promise<any> | undefined;

        if (ongoing_requests[key]) {
            send_promise = ongoing_requests[key];
        } else {
            const request = JSON.parse(request_string);
            send_promise = wait_for_authorize ? WS.authorized.send(request) : WS.send(request);
            ongoing_requests[key] = send_promise;
        }

        // Add timeout to the promise
        const timeout_ms = options?.timeout || 30000; // Default 30 seconds
        const timeout_promise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error(`Request timeout after ${timeout_ms}ms`)), timeout_ms);
        });

        Promise.race([send_promise, timeout_promise])
            ?.then((result: Response) => {
                if (!is_mounted.current) return;

                cache[key] = result;
                setData(result);
                setIsFetching(false);
            })
            .catch((err: TServerError | Error) => {
                if (!is_mounted.current) return;

                setError(err as TServerError);
                setIsFetching(false);
            })
            .finally(() => {
                delete ongoing_requests[key];
            });
    }, [key, request_string, wait_for_authorize, options?.timeout]);

    useEffect(() => {
        if (enabled && !cache[key]) {
            fetchData();
        }
    }, [key, fetchData, enabled]);

    useEffect(() => {
        if (enabled && data !== cache[key]) {
            setData(cache[key]);
        }
    }, [enabled, key, data]);

    const refetch = useCallback(() => {
        cache[key] = null;
        fetchData();
    }, [fetchData, key]);

    return { data, error, is_fetching, refetch };
};

export const invalidateDTraderCache = (keys: string | string[]) => {
    const key = getKey(keys);
    cache[key] = null;
};
