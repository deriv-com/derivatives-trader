import React from 'react';

import { observer, useStore } from '@deriv/stores';

import { AccountActions } from 'App/Components/Layout/Header';

const HeaderAccountActions = observer(() => {
    const { client } = useStore();
    const { balance, currency, is_logged_in, is_virtual, logout } = client;

    const handleLogout = () => {
        logout();
    };

    return (
        <div id='dt_core_header_acc-info-container' className='acc-info__container'>
            <AccountActions
                balance={balance}
                currency={currency}
                is_logged_in={is_logged_in}
                is_virtual={is_virtual}
                onClickLogout={handleLogout}
            />
        </div>
    );
});

export default HeaderAccountActions;
