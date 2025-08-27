import React from 'react';
import { Button } from '@deriv/components';
import { formatMoney } from '@deriv/shared';
import { localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';

import { LoginButtonV2 } from './login-button-v2';

import 'Sass/app/_common/components/account-switcher.scss';

type TAccountActionsProps = {
    acc_switcher_disabled_message: string;
    balance: string | number | undefined;
    currency: string;
    is_acc_switcher_disabled: boolean;
    is_logged_in: boolean;
    is_virtual: boolean;
    onClickLogout: () => void;
};

const AccountInfo = React.lazy(
    () =>
        import(
            /* webpackChunkName: "account-info", webpackPreload: true */ 'App/Components/Layout/Header/account-info.jsx'
        )
);

const LogoutButton = ({ onClickLogout }: { onClickLogout: () => void }) => (
    <Button className='acc-info__button' has_effect text={localize('Log out')} onClick={onClickLogout} />
);

const LoggedOutView = () => (
    <>
        <LoginButtonV2 className='acc-info__button' />
    </>
);

const AccountActionsComponent = ({
    acc_switcher_disabled_message,
    balance,
    currency,
    is_acc_switcher_disabled,
    is_logged_in,
    is_virtual,
    onClickLogout,
}: TAccountActionsProps) => {
    const { isDesktop } = useDevice();
    const isLogoutButtonVisible = isDesktop && is_logged_in;
    const formattedBalance = balance != null ? formatMoney(currency, balance, true) : undefined;

    const renderAccountInfo = () => (
        <React.Suspense fallback={<div />}>
            <AccountInfo
                acc_switcher_disabled_message={acc_switcher_disabled_message}
                balance={formattedBalance}
                currency={currency}
                is_disabled={is_acc_switcher_disabled}
                is_virtual={is_virtual}
                {...(!isDesktop && {
                    is_mobile: true,
                })}
            />
        </React.Suspense>
    );

    if (!is_logged_in) {
        return <LoggedOutView />;
    }

    return (
        <React.Fragment>
            {renderAccountInfo()}
            {isLogoutButtonVisible && <LogoutButton onClickLogout={onClickLogout} />}
        </React.Fragment>
    );
};

AccountActionsComponent.displayName = 'AccountActions';

const AccountActions = React.memo(AccountActionsComponent);

export { AccountActions };
