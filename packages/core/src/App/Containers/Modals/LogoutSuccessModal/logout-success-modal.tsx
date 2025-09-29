import React from 'react';

import { observer, useStore } from '@deriv/stores';
import { ActionSheet, Modal, Text } from '@deriv-com/quill-ui';
import { Localize } from '@deriv-com/translations';

const LogoutSuccessModal = observer(() => {
    const { ui } = useStore();
    const { is_logout_success_modal_visible, toggleLogoutSuccessModal, is_mobile } = ui;

    const onClose = () => toggleLogoutSuccessModal(false);

    if (!is_logout_success_modal_visible) return null;

    const sharedContent = {
        title: <Localize i18n_default_text='Log out successful' />,
        message: (
            <Localize i18n_default_text='To sign out everywhere, log out from Home and your other active platforms.' />
        ),
        buttonText: <Localize i18n_default_text='Got it' />,
    };

    // Mobile Action Sheet
    if (is_mobile) {
        return (
            <ActionSheet.Root
                isOpen={is_logout_success_modal_visible}
                onClose={onClose}
                expandable={false}
                position='left'
            >
                <ActionSheet.Portal showHandlebar shouldCloseOnDrag>
                    <ActionSheet.Content>
                        <Text size='lg' bold>
                            {sharedContent.title}
                        </Text>
                        <div style={{ marginTop: '16px' }}>
                            <Text size='sm'>{sharedContent.message}</Text>
                        </div>
                    </ActionSheet.Content>
                    <ActionSheet.Footer
                        alignment='vertical'
                        primaryButtonColor='coral'
                        primaryAction={{
                            content: sharedContent.buttonText,
                            onAction: onClose,
                        }}
                    />
                </ActionSheet.Portal>
            </ActionSheet.Root>
        );
    }

    // Desktop Modal
    return (
        <Modal
            isOpened={is_logout_success_modal_visible}
            toggleModal={onClose}
            primaryButtonLabel={sharedContent.buttonText}
            shouldCloseOnPrimaryButtonClick
            buttonColor='coral'
        >
            <Modal.Header title={sharedContent.title} />
            <Modal.Body>
                <Text size='sm'>{sharedContent.message}</Text>
            </Modal.Body>
        </Modal>
    );
});

export default LogoutSuccessModal;
