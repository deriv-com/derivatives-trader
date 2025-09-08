import React from 'react';
import classNames from 'classnames';
import { Popover } from '@deriv/components';
import { observer, useStore } from '@deriv/stores';
import { useTranslations } from '@deriv-com/translations';

interface NetworkStatusProps {
    is_mobile?: boolean;
}

const NetworkStatus: React.FC<NetworkStatusProps> = observer(({ is_mobile }) => {
    const { localize } = useTranslations();
    const { common } = useStore();
    const { network_status: status } = common;

    const network_status_element = (
        <div
            data-testid='dt_network_status_element'
            className={classNames('network-status__circle', {
                'network-status__circle--offline': status.class === 'offline',
                'network-status__circle--online': status.class === 'online',
                'network-status__circle--blinker': status.class === 'blinker',
            })}
        />
    );
    return (
        <div
            data-testid='dt_network_status'
            className={classNames('network-status__wrapper', {
                'network-status__wrapper--is-mobile': is_mobile,
            })}
        >
            {is_mobile ? (
                network_status_element
            ) : (
                <Popover
                    classNameBubble='network-status__tooltip'
                    alignment='top'
                    message={localize('Network status: {{status}}', {
                        status: status.tooltip || localize('Connecting to server'),
                    })}
                >
                    {network_status_element}
                </Popover>
            )}
        </div>
    );
});

NetworkStatus.displayName = 'NetworkStatus';

export default NetworkStatus;
