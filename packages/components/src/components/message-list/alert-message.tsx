import React from 'react';
import { isMobile } from '@deriv/shared';
import Button from '../button';
import Text from '../text';
import { LegacyInformationIcon, LegacyErrorIcon, LegacyCheck1pxIcon } from '@deriv/quill-icons';

const type_mapper = {
    info: {
        icon: <LegacyInformationIcon />,
        color: 'var(--color-text-info)',
    },
    error: {
        icon: <LegacyErrorIcon />,
        color: 'var(--color-text-danger)',
    },
    success: {
        icon: <LegacyCheck1pxIcon />,
        color: 'var(--color-text-success)',
    },
};

type TAlertMessageProps =
    | {
          variant: 'with-action-button';
          button_label: string;
          message: string | JSX.Element;
          onClickHandler: VoidFunction;
          type: 'info' | 'error' | 'success';
      }
    | {
          variant: 'base';
          message: string | JSX.Element;
          type: 'info' | 'error' | 'success';
      };

const AlertMessage = (props: TAlertMessageProps) => {
    const { type, message, variant } = props;

    const icon = type_mapper[type].icon;
    const color = type_mapper[type].color;

    return (
        <div className='alert-message' data-testid='dt_alert_message'>
            <div className='alert-message__icon-container'>
                <div className='icon-container__line' />
                <div className='icon-container__icon'>
                    {React.cloneElement(icon, {
                        fill: color,
                        'data-testid': `dt_alert_message_icon`,
                    })}
                </div>
            </div>
            <div className='alert-message__message-container'>
                <Text size={isMobile() ? 'xxxs' : 'xxs'} color={color}>
                    {message}
                </Text>
            </div>
            {variant === 'with-action-button' && props.button_label && (
                <div className='alert-message__button-container'>
                    <Button primary small onClick={props.onClickHandler}>
                        {props.button_label}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AlertMessage;
