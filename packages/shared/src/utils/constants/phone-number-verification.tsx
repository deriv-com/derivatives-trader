import React from 'react';
import dayjs from 'dayjs';

import { Chat } from '@deriv/utils';
import { Localize } from '@deriv-com/translations';

export const getUseRequestPhoneNumberOTPErrorMessage = (
    error_code: string,
    getCurrentCarrier: () => string,
    getOtherCarrier: () => string
) => {
    switch (error_code) {
        case 'PhoneNumberTaken':
            return (
                <Localize
                    i18n_default_text='Number already exists in our system. Enter a new one or contact us via <0>live chat</0> for help.'
                    components={[
                        <span key={0} className='phone-verification__card--inputfield__livechat' onClick={Chat.open} />,
                    ]}
                />
            );
        case 'PhoneNumberVerificationSuspended':
            return (
                <Localize
                    i18n_default_text="We're unable to send codes via {{ current_carrier }} right now. Get your code by {{other_carriers}}."
                    values={{
                        current_carrier: getCurrentCarrier(),
                        other_carriers: getOtherCarrier(),
                    }}
                />
            );
        case 'InvalidPhone':
            return (
                <Localize i18n_default_text='Enter a valid phone number, including the country code (e.g. +15417541234).' />
            );
        default:
            break;
    }
};
