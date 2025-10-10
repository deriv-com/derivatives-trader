import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import { Button, Modal } from '@deriv/components';
import { getBrandUrl } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { useTranslations } from '@deriv-com/translations';

type TInsufficientBalanceModal = RouteComponentProps & {
    is_virtual?: boolean;
    is_visible: boolean;
    message: string;
    toggleModal: () => void;
};

const InsufficientBalanceModal = observer(
    ({ is_virtual, is_visible, message, toggleModal }: TInsufficientBalanceModal) => {
        const {
            ui: { is_mobile },
            client: { currency },
        } = useStore();
        const { localize } = useTranslations();
        return (
            <Modal
                id='dt_insufficient_balance_modal'
                is_open={is_visible}
                small
                is_vertical_centered={is_mobile}
                toggleModal={toggleModal}
                title={localize('Insufficient balance')}
            >
                <Modal.Body>{message}</Modal.Body>
                <Modal.Footer>
                    <Button
                        has_effect
                        text={is_virtual ? localize('OK') : localize('Transfer now')}
                        onClick={() => {
                            if (!is_virtual) {
                                // Redirect to the brand deposit page
                                const brandUrl = getBrandUrl();
                                window.location.href = `${brandUrl}/transfer?acc=options&curr=${currency}&from=home&source=options`;
                            } else {
                                toggleModal();
                            }
                        }}
                        primary
                    />
                </Modal.Footer>
            </Modal>
        );
    }
);

export default withRouter(InsufficientBalanceModal);
