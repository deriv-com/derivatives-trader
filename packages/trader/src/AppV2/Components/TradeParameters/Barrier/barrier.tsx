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

    // Helper function to get stored value from localStorage
    const getStoredBarrierValue = React.useCallback(() => {
        try {
            const spotValue = localStorage.getItem(SPOT_BARRIER_KEY);
            const fixedValue = localStorage.getItem(FIXED_BARRIER_KEY);

            // If barrier_1 contains +/-, it's a spot barrier
            if (barrier_1.includes('+') || barrier_1.includes('-')) {
                return spotValue ? `${barrier_1.charAt(0)}${spotValue}` : '';
            }
            return fixedValue || '';
        } catch (e) {
            return '';
        }
    }, [barrier_1, SPOT_BARRIER_KEY, FIXED_BARRIER_KEY]);

    // Restore both store barrier_1 and v2_params_initial_values from localStorage on component mount
    React.useEffect(() => {
        // Only restore if v2_params_initial_values.barrier_1 is empty but we have stored values
        if (!v2_params_initial_values.barrier_1) {
            const storedValue = getStoredBarrierValue();
            if (storedValue && storedValue !== barrier_1) {
                // We have a manually edited value stored that differs from default
                // Update the actual store value first using onChange
                onChange({ target: { name: 'barrier_1', value: storedValue } });
                // Then update v2_params_initial_values to show the correct display value
                setV2ParamsInitialValues({ value: storedValue, name: 'barrier_1' });
            }
        }
    }, [v2_params_initial_values.barrier_1, barrier_1, getStoredBarrierValue, setV2ParamsInitialValues, onChange]);

    const onClose = React.useCallback(
        (is_saved = false) => {
            if (is_open) {
                if (!is_saved) {
                    onChange({ target: { name: 'barrier_1', value: initialBarrierValue } });
                }
                setV2ParamsInitialValues({ value: '', name: 'barrier_1' });
                setIsOpen(false);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [initialBarrierValue, is_open]
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
