import React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import { Button, Modal } from '@deriv/components';
import { getBrandUrl } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { localize } from '@deriv/translations';

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
        } = useStore();
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
                        text={is_virtual ? localize('OK') : localize('Deposit now')}
                        onClick={() => {
                            if (!is_virtual) {
                                const hubUrl = getBrandUrl();
                                const url_query_string = window.location.search;
                                const url_params = new URLSearchParams(url_query_string);
                                const account_currency =
                                    window.sessionStorage.getItem('account') || url_params.get('account');

                                window.location.href = `${hubUrl}/redirect?action=redirect_to&redirect_to=wallet${account_currency ? `&account=${account_currency}` : ''}`;
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
