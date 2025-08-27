import React from 'react';
import Button from '../button';
import Text from '../text';
import { DerivLightIcCashierBlockedIcon } from '@deriv/quill-icons';
import { Localize } from '@deriv-com/translations';

type TErrorModalContent = {
    error_message?: string;
};

const ErrorModalContent = ({ error_message }: TErrorModalContent) => {
    return (
        <div className='unhandled-error'>
            <DerivLightIcCashierBlockedIcon width={96} height={96} />
            <Text className='da-icon-with-message__text' as='p' line_height='xxl' align='center' weight='bold'>
                <Localize i18n_default_text='Sorry for the interruption' />
            </Text>
            <Text className='da-icon-with-message__text__desc' as='p' size='xs' line_height='xxs' align='center'>
                {error_message}
            </Text>
            <Button onClick={() => location.reload()} has_effect primary large>
                <Localize i18n_default_text='Refresh' />
            </Button>
        </div>
    );
};

export default ErrorModalContent;
