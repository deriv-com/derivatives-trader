import React from 'react';

import { Button, Modal } from '@deriv/components';
import { mapErrorMessage } from '@deriv/shared';
import { useTranslations } from '@deriv-com/translations';

import AccountVerificationRequiredModal from './account-verification-required-modal';
import AuthorizationRequiredModal from './authorization-required-modal';
import CompanyWideLimitExceededModal from './company-wide-limit-exceeded-modal';
import { getTitle } from './constants';
import InsufficientBalanceModal from './insufficient-balance-modal';

type TServicesError = {
    code?: string;
    message?: string;
    subcode?: string;
    type?: string;
};

type TPropServicesErrorModel = {
    is_virtual?: boolean;
    is_visible: boolean;
    is_logged_in: boolean;
    onConfirm: () => void;
    services_error: TServicesError;
};

const ServicesErrorModal = ({
    is_virtual,
    is_visible,
    is_logged_in,
    onConfirm,
    services_error,
}: TPropServicesErrorModel) => {
    const { code, type } = services_error;
    const { localize } = useTranslations();

    // Get mapped error message
    const mappedMessage = mapErrorMessage(services_error);

    if (!code || !mappedMessage) return <React.Fragment />;
    switch (code) {
        case 'AuthorizationRequired':
            return (
                <AuthorizationRequiredModal
                    is_logged_in={is_logged_in}
                    is_visible={is_visible}
                    toggleModal={onConfirm}
                />
            );
        case 'InsufficientBalance':
            return (
                <InsufficientBalanceModal
                    is_virtual={is_virtual}
                    is_visible={is_visible}
                    message={mappedMessage}
                    toggleModal={onConfirm}
                />
            );
        case 'CompanyWideLimitExceeded':
            return <CompanyWideLimitExceededModal is_visible={is_visible} onConfirm={onConfirm} />;
        case 'PleaseAuthenticate':
            return <AccountVerificationRequiredModal is_visible={is_visible} onConfirm={onConfirm} />;
        default:
            return (
                <Modal is_open={is_visible} small title={getTitle(type)} toggleModal={onConfirm}>
                    <Modal.Body>{mappedMessage}</Modal.Body>
                    <Modal.Footer>
                        <Button has_effect text={localize('OK')} onClick={onConfirm} primary />
                    </Modal.Footer>
                </Modal>
            );
    }
};

export default ServicesErrorModal;
