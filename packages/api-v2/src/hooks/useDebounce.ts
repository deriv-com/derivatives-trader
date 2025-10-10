import { useEffect, useState } from 'react';

/**
 * A custom hook that debounces a value, delaying updates until after a specified delay period.
 * This is particularly useful for form inputs where you want to delay validation or API calls
 * until the user has stopped typing.
 *
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds before the debounced value is updated
 * @returns The debounced value
 *
 * @example
 * ```tsx
 * const [inputValue, setInputValue] = useState('');
 * const debouncedValue = useDebounce(inputValue, 300);
 *
 * // Use debouncedValue for validation or API calls
 * useEffect(() => {
 *   if (debouncedValue) {
 *     validateInput(debouncedValue);
 *   }
 * }, [debouncedValue]);
 * ```
 */
const useDebounce = <T>(value: T, delay: number): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

export default useDebounce;
