import React from 'react';
import ServicesErrorModal from '../Elements/Modals/ServicesErrorModal';
import { observer, useStore } from '@deriv/stores';

const TradeModals = observer(() => {
    const { ui, client, common } = useStore();
    const { is_virtual, is_logged_in } = client;

    const { services_error } = common;
    const { is_services_error_visible, toggleServicesErrorModal } = ui;

    const servicesErrorModalOnConfirm = () => {
        toggleServicesErrorModal(false);
    };

    return (
        <React.Fragment>
            <ServicesErrorModal
                onConfirm={servicesErrorModalOnConfirm}
                services_error={services_error}
                is_visible={is_services_error_visible}
                is_virtual={is_virtual}
                is_logged_in={is_logged_in}
            />
        </React.Fragment>
    );
});

export default TradeModals;
