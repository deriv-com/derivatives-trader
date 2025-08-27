import React from 'react';
import { Modal, Popover } from '@deriv/components';
import { LegacyRegulatoryInformationIcon } from '@deriv/quill-icons';
import { localize, Localize } from '@deriv-com/translations';
import { deriv_urls } from '@deriv/shared';

const MFRegulatoryInformation = () => (
    <div className='footer-regulatory-information'>
        <p>
            <Localize
                i18n_default_text='{{legal_entity_name}} is licensed in Malta and regulated by the Malta Financial Services Authority, under the Investment Services Act, to provide investment services (<0>view licence</0>).'
                components={[
                    <a
                        href={`https://${deriv_urls.DERIV_HOST_NAME}/regulatory/Deriv_Investments_(Europe)_Limited.pdf`}
                        target='_blank'
                        rel='nofollow noreferrer'
                        key={0}
                        className='footer-regulatory-information__link'
                    />,
                ]}
                values={{
                    legal_entity_name: 'Deriv Investments (Europe) Limited',
                }}
            />
        </p>
    </div>
);

export const RegulatoryInformation = ({ landing_company, is_eu, show_eu_related_content, showPopover }) => {
    const [should_show_modal, showModal] = React.useState(false);
    if (!is_eu || (is_eu && !show_eu_related_content)) return null;
    const is_mf = landing_company === 'maltainvest';
    const content = (
        <a onClick={() => showModal(true)}>
            <LegacyRegulatoryInformationIcon className='footer__icon ic-deriv__icon' iconSize='xs' />
        </a>
    );

    return (
        <div className='footer__link'>
            {showPopover ? (
                <Popover alignment='top' message={localize('Regulatory Information')} zIndex={9999}>
                    {content}
                </Popover>
            ) : (
                content
            )}
            <Modal
                is_open={should_show_modal}
                small
                has_close_icon
                toggleModal={() => showModal(false)}
                title={localize('Regulatory Information')}
            >
                {(is_mf || show_eu_related_content) && <MFRegulatoryInformation />}
            </Modal>
        </div>
    );
};
