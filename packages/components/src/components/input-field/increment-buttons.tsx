import React from 'react';
import classNames from 'classnames';
import Button from '../button';
import { StandalonePlusRegularIcon, StandaloneMinusRegularIcon } from '@deriv/quill-icons';

export type TButtonType = 'button' | 'submit' | 'reset';

type IncrementButtonsProps = {
    decrementValue: (
        ev?: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>,
        long_press_step?: number
    ) => void;
    id?: string;
    incrementValue: (
        ev?: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>,
        long_press_step?: number
    ) => void;
    onLongPressEnd: () => void;
    is_incrementable_on_long_press?: boolean;
    max_is_disabled: number | boolean;
    min_is_disabled: number | boolean;
    type?: TButtonType;
};

const IncrementButtons = ({
    decrementValue,
    id,
    incrementValue,
    max_is_disabled,
    min_is_disabled,
    is_incrementable_on_long_press,
    onLongPressEnd,
    type,
}: IncrementButtonsProps) => {
    const interval_ref = React.useRef<ReturnType<typeof setInterval>>();
    const timeout_ref = React.useRef<ReturnType<typeof setTimeout>>();
    const is_long_press_ref = React.useRef(false);

    const handleButtonPress =
        (
            onChange: (
                e: React.TouchEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>,
                step: number
            ) => void
        ) =>
        (ev: React.TouchEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) => {
            timeout_ref.current = setTimeout(() => {
                is_long_press_ref.current = true;
                let step = 1;
                onChange(ev, step);
                interval_ref.current = setInterval(() => {
                    onChange(ev, ++step);
                }, 50);
            }, 300);
        };

    const handleButtonRelease = () => {
        clearInterval(interval_ref.current);
        clearTimeout(timeout_ref.current);

        if (onLongPressEnd && is_long_press_ref.current) onLongPressEnd();

        is_long_press_ref.current = false;
    };

    const getPressEvents = (
        onChange: (e: React.TouchEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>, step: number) => void
    ) => {
        if (!is_incrementable_on_long_press) return {};
        return {
            onContextMenu: (e: React.TouchEvent<HTMLButtonElement> | React.MouseEvent<HTMLButtonElement>) =>
                e.preventDefault(),
            onTouchStart: handleButtonPress(onChange),
            onTouchEnd: handleButtonRelease,
            onMouseDown: handleButtonPress(onChange),
            onMouseUp: handleButtonRelease,
        };
    };

    return (
        <React.Fragment>
            <Button
                id={`${id}_add`}
                className={classNames('dc-input-wrapper__button dc-input-wrapper__button--increment', {
                    'dc-input-wrapper__button--disabled': !!max_is_disabled,
                })}
                is_disabled={!!max_is_disabled}
                onClick={incrementValue}
                tabIndex={-1}
                aria-label={'Increment value'}
                type={type}
                {...getPressEvents(incrementValue)}
            >
                <StandalonePlusRegularIcon
                    className={'dc-input-wrapper__icon dc-input-wrapper__icon--plus'}
                    fill={max_is_disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)'}
                    iconSize='xs'
                />
            </Button>
            <Button
                id={`${id}_sub`}
                className={classNames('dc-input-wrapper__button dc-input-wrapper__button--decrement', {
                    'dc-input-wrapper__button--disabled': !!min_is_disabled,
                })}
                is_disabled={!!min_is_disabled}
                onClick={decrementValue}
                tabIndex={-1}
                aria-label={'Decrement value'}
                type={type}
                {...getPressEvents(decrementValue)}
            >
                <StandaloneMinusRegularIcon
                    className={'dc-input-wrapper__icon dc-input-wrapper__icon--minus'}
                    fill={min_is_disabled ? 'var(--color-text-disabled)' : 'var(--color-text-primary)'}
                    iconSize='xs'
                />
            </Button>
        </React.Fragment>
    );
};

export default IncrementButtons;
