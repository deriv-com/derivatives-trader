import React from 'react';

import { Button, Modal } from '@deriv/components';
import { observer, useStore } from '@deriv/stores';
import { Localize, useTranslations } from '@deriv-com/translations';

type TAccountVerificationRequiredModalProps = {
    is_visible: boolean;
    onConfirm: () => void;
};

const AccountVerificationRequiredModal = observer(
    ({ is_visible, onConfirm }: TAccountVerificationRequiredModalProps) => {
        const { localize } = useTranslations();
        const {
            ui: { is_mobile },
        } = useStore();
        return (
            <Modal
                is_open={is_visible}
                is_vertical_centered={is_mobile}
                className='account-verification-required-modal'
                toggleModal={onConfirm}
                title={localize('Account verification required')}
                width='440px'
                height={is_mobile ? 'auto' : '220px'}
            >
                <Modal.Body className='account-verification-required-modal-text'>
                    <Localize i18n_default_text='Please submit your proof of identity and proof of address to verify your account and continue trading.' />
                </Modal.Body>

                <div className='account-verification-required-modal-button'>
                    <Modal.Footer>
                        <Button has_effect text={localize('Submit Proof')} onClick={onConfirm} primary />
                    </Modal.Footer>
                </div>
            </Modal>
        );
    }
);

export default AccountVerificationRequiredModal;
