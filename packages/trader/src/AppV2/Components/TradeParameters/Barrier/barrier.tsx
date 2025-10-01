import React from 'react';
import clsx from 'clsx';
import { observer } from 'mobx-react-lite';

import { Localize } from '@deriv-com/translations';
import { ActionSheet, TextField, useSnackbar } from '@deriv-com/quill-ui';

import Carousel from 'AppV2/Components/Carousel';
import CarouselHeader from 'AppV2/Components/Carousel/carousel-header';
import { useTraderStore } from 'Stores/useTraderStores';

import { TTradeParametersProps } from '../trade-parameters';

import BarrierDescription from './barrier-description';
import BarrierInput from './barrier-input';

const Barrier = observer(({ is_minimized }: TTradeParametersProps) => {
    const {
        barrier_1,
        onChange,
        duration_unit,
        is_market_closed,
        setV2ParamsInitialValues,
        v2_params_initial_values,
        validation_errors,
        proposal_info,
        trade_type_tab,
    } = useTraderStore();
    const [is_open, setIsOpen] = React.useState(false);
    const [initialBarrierValue, setInitialBarrierValue] = React.useState('');
    const isDays = duration_unit == 'd';
    const has_error =
        validation_errors.barrier_1.length > 0 ||
        (proposal_info?.[trade_type_tab]?.has_error && proposal_info?.[trade_type_tab]?.error_field === 'barrier');
    const { addSnackbar } = useSnackbar();
    const [barrier_error_shown, setBarrierErrorShown] = React.useState(false);

    // Constants for localStorage keys to match barrier-input.tsx
    const SPOT_BARRIER_KEY = 'deriv_spot_barrier_value';
    const FIXED_BARRIER_KEY = 'deriv_fixed_barrier_value';
    const BARRIER_TYPE_KEY = 'deriv_barrier_type_selection';

    // Helper function to get stored value from localStorage
    const getStoredBarrierValue = React.useCallback(() => {
        try {
            const spotValue = localStorage.getItem(SPOT_BARRIER_KEY);
            const fixedValue = localStorage.getItem(FIXED_BARRIER_KEY);
            const storedBarrierType = localStorage.getItem(BARRIER_TYPE_KEY);

            // Prioritize stored barrier type over value-based detection
            if (storedBarrierType !== null) {
                const barrierType = parseInt(storedBarrierType);
                if (barrierType === 0 || barrierType === 1) {
                    // Above/Below spot
                    return spotValue ? `${barrierType === 0 ? '+' : '-'}${spotValue}` : '';
                } else if (barrierType === 2) {
                    // Fixed barrier
                    return fixedValue || '';
                }
            }

            // Fall back to original logic for backward compatibility
            if (barrier_1.includes('+') || barrier_1.includes('-')) {
                return spotValue ? `${barrier_1.charAt(0)}${spotValue}` : '';
            }
            return fixedValue || '';
        } catch {
            return '';
        }
    }, [barrier_1, SPOT_BARRIER_KEY, FIXED_BARRIER_KEY, BARRIER_TYPE_KEY]);

    // Restore barrier value from localStorage on component mount
    React.useEffect(() => {
        const storedValue = getStoredBarrierValue();
        if (storedValue) {
            // Always prioritize localStorage value over current store value
            // Update the store value if it's different from localStorage
            if (storedValue !== barrier_1) {
                onChange({ target: { name: 'barrier_1', value: storedValue } });
            }
            // Update display value if it's different from localStorage
            if (storedValue !== String(v2_params_initial_values.barrier_1)) {
                setV2ParamsInitialValues({ value: storedValue, name: 'barrier_1' });
            }
        } else if (barrier_1 && !v2_params_initial_values.barrier_1) {
            // If no stored value but barrier_1 exists, sync display
            setV2ParamsInitialValues({ value: barrier_1, name: 'barrier_1' });
        }
    }, []);

    // Sync v2_params_initial_values with barrier_1 when barrier_1 changes (e.g., from symbol reset or modal save)
    // BUT only if there's no localStorage value that should take precedence
    React.useEffect(() => {
        const storedValue = getStoredBarrierValue();

        // If barrier_1 has a value but v2_params_initial_values.barrier_1 is empty, sync them
        // Only if there's no stored value that should override
        if (barrier_1 && !v2_params_initial_values.barrier_1 && !storedValue) {
            setV2ParamsInitialValues({ value: barrier_1, name: 'barrier_1' });
        }
        // If barrier_1 changes and is different from v2_params_initial_values.barrier_1, update display
        // This handles cases where the store value was updated (like from modal save)
        // BUT only if the new barrier_1 value matches what we have in localStorage (meaning it was a legitimate update)
        // OR if there's no localStorage value at all
        else if (
            barrier_1 &&
            v2_params_initial_values.barrier_1 &&
            barrier_1 !== String(v2_params_initial_values.barrier_1) &&
            (!storedValue || storedValue === barrier_1)
        ) {
            setV2ParamsInitialValues({ value: barrier_1, name: 'barrier_1' });
        }
    }, [barrier_1, v2_params_initial_values.barrier_1, setV2ParamsInitialValues, getStoredBarrierValue]);

    const onClose = React.useCallback(
        (is_saved = false) => {
            if (is_open) {
                setIsOpen(false);
            }
        },
        [is_open]
    );

    React.useEffect(() => {
        const has_error = proposal_info?.[trade_type_tab]?.has_error;
        const error_field = proposal_info?.[trade_type_tab]?.error_field;
        const message = proposal_info?.[trade_type_tab]?.message;

        if (has_error && error_field === 'barrier' && !barrier_error_shown && !is_open && !is_minimized) {
            addSnackbar({
                message,
                hasCloseButton: true,
                status: 'fail',
                style: { marginBottom: '48px' },
            });
            setBarrierErrorShown(true);
        }
    }, [proposal_info]);

    React.useEffect(() => {
        if (is_open) {
            setBarrierErrorShown(false);
        }
    }, [is_open]);

    const barrier_carousel_pages = [
        {
            id: 1,
            component: (
                <BarrierInput isDays={isDays} setInitialBarrierValue={setInitialBarrierValue} onClose={onClose} />
            ),
        },
        {
            id: 2,
            component: <BarrierDescription isDays={isDays} />,
        },
    ];

    return (
        <>
            <TextField
                className={clsx('trade-params__option', is_minimized && 'trade-params__option--minimized')}
                disabled={is_market_closed}
                variant='fill'
                readOnly
                noStatusIcon
                label={<Localize i18n_default_text='Barrier' key={`barrier${is_minimized ? '-minimized' : ''}`} />}
                value={v2_params_initial_values.barrier_1 || barrier_1}
                onClick={() => setIsOpen(true)}
                status={has_error && !is_open ? 'error' : undefined}
            />
            <ActionSheet.Root
                isOpen={is_open}
                onClose={onClose}
                position='left'
                expandable={false}
                shouldBlurOnClose={is_open}
            >
                <ActionSheet.Portal shouldCloseOnDrag>
                    <Carousel
                        header={CarouselHeader}
                        title={<Localize i18n_default_text='Barrier' />}
                        pages={barrier_carousel_pages}
                    />
                </ActionSheet.Portal>
            </ActionSheet.Root>
        </>
    );
});

export default Barrier;
