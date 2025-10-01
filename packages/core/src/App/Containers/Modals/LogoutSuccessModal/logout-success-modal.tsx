import React from 'react';
import { Button, Modal } from '@deriv/components';
import { ActionSheet, Text } from '@deriv-com/quill-ui';
import { Localize } from '@deriv-com/translations';
import { observer, useStore } from '@deriv/stores';
import './logout-success-modal.scss';

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
                className='logout-success-modal logout-success-modal--mobile'
                isOpen={is_logout_success_modal_visible}
                onClose={onClose}
                expandable={false}
                position='left'
            >
                <ActionSheet.Portal showHandlebar shouldCloseOnDrag>
                    <div className='logout-success-modal__body logout-success-modal__body--mobile'>
                        <div className='logout-success-modal__content logout-success-modal__content--mobile'>
                            <Text size='lg' className='logout-success-modal__title logout-success-modal__title--mobile'>
                                {sharedContent.title}
                            </Text>
                            <Text
                                size='sm'
                                className='logout-success-modal__message logout-success-modal__message--mobile'
                            >
                                {sharedContent.message}
                            </Text>
                        </div>
                    </div>
                    <ActionSheet.Footer
                        className='logout-success-modal__footer logout-success-modal__footer--mobile'
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
            small
            has_close_icon
            is_open={is_logout_success_modal_visible}
            title={sharedContent.title}
            toggleModal={onClose}
            className='logout-success-modal logout-success-modal--desktop'
            should_close_on_click_outside
            width='440px'
        >
            <Modal.Body className='logout-success-modal__body logout-success-modal__body--desktop'>
                <div className='logout-success-modal__message logout-success-modal__message--desktop'>
                    {sharedContent.message}
                </div>
            </Modal.Body>
            <Modal.Footer className='logout-success-modal__footer logout-success-modal__footer--desktop'>
                <Button
                    has_effect
                    onClick={onClose}
                    primary
                    large
                    className='logout-success-modal__button logout-success-modal__button--desktop'
                >
                    {sharedContent.buttonText}
                </Button>
            </Modal.Footer>
        </Modal>
    );
});

export default LogoutSuccessModal;
