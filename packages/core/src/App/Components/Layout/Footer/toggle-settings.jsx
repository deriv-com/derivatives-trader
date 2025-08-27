import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import { Modal, Popover, VerticalTab } from '@deriv/components';
import { LegacySettings1pxIcon } from '@deriv/quill-icons';
import { localize } from '@deriv-com/translations';
import 'Sass/app/modules/settings.scss';

const ModalContent = ({ settings_extension }) => {
    const content = [];

    content.push(...(settings_extension || []));

    return <VerticalTab list={content} />;
};

const ToggleSettings = ({
    enableApp,
    is_settings_visible,
    disableApp,
    toggleSettings,
    settings_extension,
    showPopover,
}) => {
    const toggle_settings_class = classNames('ic-settings', 'footer__link', {
        'ic-settings--active': is_settings_visible,
    });
    return (
        <React.Fragment>
            <a
                id='dt_settings_toggle'
                data-testid='dt_toggle_settings'
                onClick={toggleSettings}
                className={`${toggle_settings_class} footer__link`}
            >
                {showPopover ? (
                    <Popover alignment='top' message={localize('Platform settings')} zIndex={9999}>
                        <LegacySettings1pxIcon
                            data-testid='dt_icon'
                            className='footer__icon ic-settings__icon'
                            iconSize='xs'
                            fill='var(--color-text-primary)'
                        />
                    </Popover>
                ) : (
                    <LegacySettings1pxIcon
                        data-testid='dt_icon'
                        className='footer__icon ic-settings__icon'
                        iconSize='xs'
                        fill='var(--color-text-primary)'
                    />
                )}
            </a>
            <Modal
                id='dt_settings_modal'
                className='modal-settings'
                enableApp={enableApp}
                is_open={is_settings_visible}
                disableApp={disableApp}
                title={localize('Platform settings')}
                toggleModal={toggleSettings}
                height='616px'
                width='736px'
            >
                <ModalContent settings_extension={settings_extension} />
            </Modal>
        </React.Fragment>
    );
};

ToggleSettings.propTypes = {
    disableApp: PropTypes.func,
    enableApp: PropTypes.func,
    is_settings_visible: PropTypes.bool,
    settings_extension: PropTypes.array,
    toggleSettings: PropTypes.func,
    showPopover: PropTypes.bool,
};

export { ToggleSettings };
