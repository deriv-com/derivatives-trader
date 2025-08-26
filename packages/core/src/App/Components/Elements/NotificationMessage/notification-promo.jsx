import React from 'react';
import { Button, Text } from '@deriv/components';
import { LegacyClose2pxIcon } from '@deriv/quill-icons';

const NotificationPromo = ({ cta_btn, img_alt, img_src, message, onClose }) => {
    return (
        <div data-testid='dt_notification_promo' className='notification-promo'>
            <img className='notification-promo__img' src={img_src} alt={img_alt} />
            <div className='notification-promo--container'>
                <div className='notification-promo--left'>
                    <Text as='p' size='xs' className='notification-promo__message'>
                        {message}
                    </Text>
                    {cta_btn && (
                        <Button className='notification-promo__btn' blue secondary onClick={cta_btn.onClick}>
                            {cta_btn.text}
                        </Button>
                    )}
                </div>
                <LegacyClose2pxIcon className='notification-promo__close-icon' onClick={onClose} iconSize='xs' />
            </div>
        </div>
    );
};

export default NotificationPromo;
