import React from 'react';
import { observer, useStore } from '@deriv/stores';
import { AccountActions } from 'App/Components/Layout/Header';

const HeaderAccountActions = observer(() => {
    const { client, ui } = useStore();
    const { balance, currency, is_logged_in, is_virtual, logout } = client;
    const { account_switcher_disabled_message, is_account_switcher_disabled } = ui;

    const handleLogout = () => {
        logout();
    };

    return (
        <div id='dt_core_header_acc-info-container' className='acc-info__container'>
            <AccountActions
                acc_switcher_disabled_message={account_switcher_disabled_message}
                balance={balance}
                currency={currency}
                is_acc_switcher_disabled={is_account_switcher_disabled}
                is_logged_in={is_logged_in}
                is_virtual={is_virtual}
                onClickLogout={handleLogout}
            />
        </div>
    );
});

export default HeaderAccountActions;
