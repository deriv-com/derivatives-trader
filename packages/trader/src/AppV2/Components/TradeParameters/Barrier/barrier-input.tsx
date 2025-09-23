import React from 'react';
import { observer } from 'mobx-react-lite';

import { ActionSheet, Chip, Text, TextField, TextFieldAddon } from '@deriv-com/quill-ui';
import { Localize, useTranslations } from '@deriv-com/translations';

import { useTraderStore } from 'Stores/useTraderStores';

const chips_options = [
    {
        name: <Localize i18n_default_text='Above spot' />,
    },
    {
        name: <Localize i18n_default_text='Below spot' />,
    },
    {
        name: <Localize i18n_default_text='Fixed barrier' />,
    },
];
const BarrierInput = observer(
    ({
        setInitialBarrierValue,
        isDays,
        onClose,
    }: {
        setInitialBarrierValue: (val: string) => void;
        isDays: boolean;
        onClose: (val: boolean) => void;
    }) => {
        const {
            barrier_1,
            onChange,
            validation_errors,
            tick_data,
            setV2ParamsInitialValues,
            v2_params_initial_values,
            symbol,
            active_symbols,
        } = useTraderStore();
        const [should_show_error, setShouldShowError] = React.useState(false);
        const { localize } = useTranslations();

        // Draft state for staging changes until save
        interface DraftState {
            value: string;
            type: number;
            spotValue: string;
            fixedValue: string;
        }

        const [draftState, setDraftState] = React.useState<DraftState>({
            value: '',
            type: 0,
            spotValue: '',
            fixedValue: '',
        });

        // Constants for localStorage keys
        const SPOT_BARRIER_KEY = 'deriv_spot_barrier_value';
        const FIXED_BARRIER_KEY = 'deriv_fixed_barrier_value';
        const BARRIER_TYPE_KEY = 'deriv_barrier_type_selection';

        // Helper functions for localStorage
        const getStoredValue = (key: string) => {
            try {
                const storedValue = localStorage.getItem(key);
                return storedValue || '';
            } catch {
                return '';
            }
        };

        const storeValue = (key: string, value: string) => {
            try {
                localStorage.setItem(key, value);
            } catch {
                // Ignore errors (e.g., localStorage not available)
            }
        };

        // Helper functions for barrier type persistence
        const getStoredBarrierType = () => {
            try {
                const storedType = localStorage.getItem(BARRIER_TYPE_KEY);
                return storedType ? parseInt(storedType) : null;
            } catch {
                return null;
            }
        };

        const storeBarrierType = (type: number) => {
            try {
                localStorage.setItem(BARRIER_TYPE_KEY, type.toString());
            } catch {
                // Ignore errors (e.g., localStorage not available)
            }
        };

        // Add separate state variables for different barrier types
        const [spot_barrier_value, setSpotBarrierValue] = React.useState(getStoredValue(SPOT_BARRIER_KEY) || '');
        const [fixed_barrier_value, setFixedBarrierValue] = React.useState(getStoredValue(FIXED_BARRIER_KEY) || '');
        const [is_focused, setIsFocused] = React.useState(false);
        const { pip_size } = tick_data ?? {};
        const barrier_ref = React.useRef<HTMLInputElement | null>(null);
        const show_hidden_error = validation_errors?.barrier_1.length > 0 && (barrier_1 || should_show_error);
        const [previous_symbol, setPreviousSymbol] = React.useState(symbol);

        // Helper function to determine barrier support for current symbol
        const getSymbolBarrierSupport = React.useCallback((): 'relative' | 'absolute' => {
            if (!symbol || !active_symbols.length) return 'absolute';

            const symbol_info = active_symbols.find(s => ((s as any).underlying_symbol || s.symbol) === symbol);

            if (!symbol_info) return 'absolute';

            const market = symbol_info.market;
            const symbol_type = (symbol_info as any).symbol_type;

            // Forex symbols only support absolute barriers
            if (market === 'forex' || symbol_type === 'forex') {
                return 'absolute';
            }

            // Most other markets support relative barriers
            return 'relative';
        }, [symbol, active_symbols]);

        // Effect to handle symbol changes and reset barrier type if needed
        React.useEffect(() => {
            if (symbol && previous_symbol && symbol !== previous_symbol) {
                const barrier_support = getSymbolBarrierSupport();

                // If switching to forex (absolute only), force fixed barrier option
                if (barrier_support === 'absolute') {
                    setDraftState(prev => ({ ...prev, type: 2 })); // Fixed barrier
                    // Clear stored barrier type to prevent conflicts
                    try {
                        localStorage.removeItem(BARRIER_TYPE_KEY);
                        localStorage.removeItem(SPOT_BARRIER_KEY);
                    } catch {
                        // Ignore localStorage errors
                    }

                    // Set a default barrier value if current barrier is empty or relative
                    if (!barrier_1 || barrier_1.includes('+') || barrier_1.includes('-')) {
                        const current_spot = tick_data?.quote;
                        const default_barrier = current_spot ? (current_spot + 0.0001).toFixed(5) : '1.0000';
                        onChange({ target: { name: 'barrier_1', value: default_barrier } });
                        setV2ParamsInitialValues({ name: 'barrier_1', value: default_barrier });
                        setFixedBarrierValue(default_barrier);
                    }
                }

                setPreviousSymbol(symbol);
            }
        }, [
            symbol,
            previous_symbol,
            getSymbolBarrierSupport,
            barrier_1,
            tick_data,
            onChange,
            setV2ParamsInitialValues,
        ]);

        // Initialize draft state when modal opens
        React.useEffect(() => {
            const initialValue = v2_params_initial_values?.barrier_1;
            const savedBarrierValue = String(initialValue || barrier_1);
            const storedBarrierType = getStoredBarrierType();
            const barrier_support = getSymbolBarrierSupport();

            setInitialBarrierValue(savedBarrierValue);
            setV2ParamsInitialValues({ name: 'barrier_1', value: savedBarrierValue });

            // Determine barrier option based on symbol support and stored values
            let determinedOption: number;

            // For forex symbols, force fixed barrier regardless of stored values
            if (barrier_support === 'absolute') {
                determinedOption = 2; // Fixed barrier
            } else if (storedBarrierType !== null && storedBarrierType >= 0 && storedBarrierType <= 2) {
                // Use stored barrier type if available and valid for non-forex symbols
                determinedOption = storedBarrierType;
            } else if (savedBarrierValue.includes('-')) {
                determinedOption = 1; // Below spot
            } else if (savedBarrierValue.includes('+')) {
                determinedOption = 0; // Above spot
            } else {
                determinedOption = 2; // Fixed barrier
            }

            // Initialize draft state with current values
            let spotValue = '';
            let fixedValue = '';

            if (determinedOption === 0 || determinedOption === 1) {
                // Above/Below spot
                const valueWithoutSign = savedBarrierValue.replace(/^[+-]/, '');
                spotValue = valueWithoutSign;
                setSpotBarrierValue(valueWithoutSign);
                // Store in localStorage if not already there
                if (!spot_barrier_value) {
                    storeValue(SPOT_BARRIER_KEY, valueWithoutSign);
                }
            } else {
                // Fixed barrier
                fixedValue = savedBarrierValue;
                setFixedBarrierValue(savedBarrierValue);
                // Store in localStorage if not already there
                if (!fixed_barrier_value) {
                    storeValue(FIXED_BARRIER_KEY, savedBarrierValue);
                }
            }

            // Initialize draft state with all values
            setDraftState({
                value: savedBarrierValue,
                type: determinedOption,
                spotValue: spotValue || getStoredValue(SPOT_BARRIER_KEY),
                fixedValue: fixedValue || getStoredValue(FIXED_BARRIER_KEY),
            });

            // Store the determined barrier type for future use (only for non-forex)
            if (barrier_support !== 'absolute') {
                storeBarrierType(determinedOption);
            }

            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [getSymbolBarrierSupport]);

        React.useEffect(() => {
            const barrier_element = barrier_ref.current;
            const checkFocus = () => {
                setIsFocused(!!(barrier_element && barrier_element.contains(document.activeElement)));
            };
            document.addEventListener('focusin', checkFocus);
            document.addEventListener('focusout', checkFocus);

            return () => {
                document.removeEventListener('focusin', checkFocus);
                document.removeEventListener('focusout', checkFocus);
            };
        });

        React.useEffect(() => {
            if (is_focused) {
                setShouldShowError(false);
            }
        }, [is_focused]);

        const handleChipSelect = (index: number) => {
            const previousOption = draftState.type; // Store the previous option before updating

            // Save current value to the appropriate draft state variable
            if (previousOption === 0 || previousOption === 1) {
                // Coming from Above/Below spot, save to spotValue
                const valueWithoutSign = draftState.value.replace(/^[+-]/, '');
                setDraftState(prev => ({ ...prev, spotValue: valueWithoutSign }));
            } else if (previousOption === 2) {
                // Coming from Fixed barrier, save to fixedValue
                setDraftState(prev => ({ ...prev, fixedValue: draftState.value }));
            }

            // Determine the new value based on the tab we're switching to
            let newValue = '';
            if (index === 0 || index === 1) {
                // Switching to Above/Below spot
                const valueToUse = draftState.spotValue || '';
                newValue = index === 0 ? `+${valueToUse}` : `-${valueToUse}`;
            } else if (index === 2) {
                // Switching to Fixed barrier
                newValue = draftState.fixedValue || '';
            }

            if ((newValue.startsWith('+') || newValue.startsWith('-')) && newValue.charAt(1) === '.') {
                newValue = `${newValue.charAt(0)}0${newValue.slice(1)}`;
            } else if (newValue.startsWith('.')) {
                newValue = `0${newValue}`;
            }

            // Update draft state with new type and value
            setDraftState(prev => ({ ...prev, type: index, value: newValue }));
        };

        const handleOnChange = (e: { target: { name: string; value: string } }) => {
            let value = e.target.value;
            if (draftState.type === 0) value = `+${value}`;
            if (draftState.type === 1) value = `-${value}`;

            // Update the appropriate draft state variable based on the current tab
            if (draftState.type === 0 || draftState.type === 1) {
                // Above/Below spot - store without sign
                const valueWithoutSign = value.replace(/^[+-]/, '');
                setDraftState(prev => ({ ...prev, value, spotValue: valueWithoutSign }));
            } else if (draftState.type === 2) {
                // Fixed barrier
                setDraftState(prev => ({ ...prev, value, fixedValue: value }));
            }
        };

        return (
            <>
                <ActionSheet.Content>
                    <div className='barrier-params'>
                        {!isDays && getSymbolBarrierSupport() === 'relative' && (
                            <div className='barrier-params__chips'>
                                {chips_options.map((item, index) => (
                                    <Chip.Selectable
                                        key={index}
                                        onClick={() => handleChipSelect(index)}
                                        selected={index == draftState.type}
                                    >
                                        <Text size='sm'>{item.name}</Text>
                                    </Chip.Selectable>
                                ))}
                            </div>
                        )}

                        <div>
                            {draftState.type === 2 || isDays ? (
                                <TextField
                                    customType='commaRemoval'
                                    name='barrier_1'
                                    noStatusIcon
                                    status={show_hidden_error ? 'error' : 'neutral'}
                                    value={draftState.value}
                                    allowDecimals
                                    decimals={pip_size}
                                    allowSign={false}
                                    inputMode='decimal'
                                    regex={/[^0-9.,]/g}
                                    textAlignment='center'
                                    onChange={handleOnChange}
                                    placeholder={localize('Price')}
                                    variant='fill'
                                    message={show_hidden_error ? validation_errors?.barrier_1[0] : ''}
                                    ref={barrier_ref}
                                />
                            ) : (
                                <TextFieldAddon
                                    fillAddonBorderColor='var(--semantic-color-slate-solid-surface-frame-mid)'
                                    customType='commaRemoval'
                                    name='barrier_1'
                                    noStatusIcon
                                    addonLabel={draftState.type == 0 ? '+' : '-'}
                                    decimals={pip_size}
                                    value={draftState.value.replace(/[+-]/g, '')}
                                    allowDecimals
                                    inputMode='decimal'
                                    allowSign={false}
                                    status={show_hidden_error ? 'error' : 'neutral'}
                                    onChange={handleOnChange}
                                    placeholder={localize('Distance to spot')}
                                    regex={/[^0-9.,]/g}
                                    variant='fill'
                                    message={show_hidden_error ? validation_errors?.barrier_1[0] : ''}
                                    ref={barrier_ref}
                                />
                            )}
                            {(validation_errors?.barrier_1.length == 0 || !show_hidden_error) && (
                                <div className='barrier-params__error-area' />
                            )}
                        </div>
                        <div className='barrier-params__current-spot-wrapper'>
                            <Text size='sm'>
                                <Localize i18n_default_text='Current spot' />
                            </Text>
                            <Text size='sm'>{tick_data?.quote}</Text>
                        </div>
                    </div>
                </ActionSheet.Content>
                <ActionSheet.Footer
                    alignment='vertical'
                    shouldCloseOnPrimaryButtonClick={false}
                    primaryAction={{
                        content: <Localize i18n_default_text='Save' />,
                        onAction: () => {
                            if (validation_errors.barrier_1.length === 0) {
                                // Apply draft changes to store
                                onChange({ target: { name: 'barrier_1', value: draftState.value } });
                                setV2ParamsInitialValues({ name: 'barrier_1', value: draftState.value });

                                // Save the current values to localStorage
                                if (draftState.type === 0 || draftState.type === 1) {
                                    storeValue(SPOT_BARRIER_KEY, draftState.spotValue);
                                } else if (draftState.type === 2) {
                                    storeValue(FIXED_BARRIER_KEY, draftState.fixedValue);
                                }

                                // Save the current barrier type selection
                                storeBarrierType(draftState.type);

                                onClose(true);
                            } else {
                                setShouldShowError(true);
                            }
                        },
                    }}
                />
            </>
        );
    }
);

export default BarrierInput;
