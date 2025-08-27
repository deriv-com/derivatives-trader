import classNames from 'classnames';
import React from 'react';
import Input, { TInputProps } from '../input';
import { LegacyVisibility1pxIcon, LegacyVisibilityOff1pxIcon } from '@deriv/quill-icons';

type TPasswordInput = Partial<TInputProps> & {
    autoComplete: string;
    className?: string;
    input_id?: string;
};

const PasswordInput = ({
    className, // Must not be passed to Input as the only trailing icon should be the visibility icon
    autoComplete, // Must be passed to Input, if not will get console warning
    input_id,
    ...otherProps
}: TPasswordInput) => {
    const [should_show_password, setShouldShowPassword] = React.useState(false);

    const togglePasswordVisibility = () => {
        setShouldShowPassword(!should_show_password);
    };

    return (
        <div className='dc-password-input'>
            <Input
                {...otherProps}
                autoComplete={autoComplete}
                type={should_show_password ? 'text' : 'password'}
                input_id={input_id}
                className={classNames('dc-password-input__field', className)}
                trailing_icon={
                    should_show_password ? (
                        <LegacyVisibility1pxIcon
                            className='dc-password-input__visibility-icon'
                            onClick={togglePasswordVisibility}
                            width={18}
                            height={18}
                            fill='var(--color-text-primary)'
                            data-testid='dt_password_input_visibility_icon'
                        />
                    ) : (
                        <LegacyVisibilityOff1pxIcon
                            className='dc-password-input__visibility-icon'
                            onClick={togglePasswordVisibility}
                            width={18}
                            height={18}
                            fill='var(--color-text-primary)'
                            data-testid='dt_password_input_visibility_icon'
                        />
                    )
                }
            />
        </div>
    );
};

export default PasswordInput;
