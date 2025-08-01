import React from 'react';
import { useHistory } from 'react-router';
import { Icon, Text, ThemedScrollbars, useOnClickOutside } from '@deriv/components';
import { platforms, routes } from '@deriv/shared';
import { observer } from '@deriv/stores';
import { Localize } from '@deriv/translations';
import { useIsHubRedirectionEnabled, useStoreWalletAccountsList } from '@deriv/api';
import { AccountSwitcherWalletList } from './account-switcher-wallet-list';

type TAccountSwitcherWalletProps = {
    is_visible: boolean;
    toggle: (value?: boolean) => void;
};

export const AccountSwitcherWallet = observer(({ is_visible, toggle }: TAccountSwitcherWalletProps) => {
    const { data: wallet_list } = useStoreWalletAccountsList();
    const dtrade_account_wallets = wallet_list?.filter(wallet => wallet.dtrade_loginid);

    const history = useHistory();

    const wrapper_ref = React.useRef<HTMLDivElement>(null);
    const { isHubRedirectionEnabled } = useIsHubRedirectionEnabled();

    const validateClickOutside = (event: MouseEvent) => {
        const checkAllParentNodes = (node: HTMLElement): boolean => {
            if (node?.classList?.contains('acc-info__wallets')) return true;
            const parent = node?.parentNode as HTMLElement;
            if (parent) return checkAllParentNodes(parent);
            return false;
        };

        return is_visible && !checkAllParentNodes(event.target as HTMLElement);
    };

    const url_query_string = window.location.search;
    const url_params = new URLSearchParams(url_query_string);
    const account_currency = url_params.get('account') || window.sessionStorage.getItem('account');

    const closeAccountsDialog = React.useCallback(() => {
        toggle(false);
    }, [toggle]);

    useOnClickOutside(wrapper_ref, closeAccountsDialog, validateClickOutside);

    const handleTradersHubRedirect = async () => {
        if (isHubRedirectionEnabled) {
            window.location.assign(
                `${platforms.tradershub_os.url}/redirect?action=redirect_to&redirect_to=cfds${account_currency ? `&account=${account_currency}` : ''}`
            );
            return;
        }
        closeAccountsDialog();
        history.push(routes.trade);
    };

    return (
        <div className='account-switcher-wallet' ref={wrapper_ref}>
            <div className='account-switcher-wallet__header'>
                <Text as='h4' weight='bold' size='xs'>
                    <Localize i18n_default_text='Options accounts' />
                </Text>
            </div>
            <ThemedScrollbars height={450}>
                <AccountSwitcherWalletList wallets={dtrade_account_wallets} closeAccountsDialog={closeAccountsDialog} />
            </ThemedScrollbars>
            <button
                className='account-switcher-wallet__looking-for-cfds'
                onClick={handleTradersHubRedirect}
                type='button'
            >
                <Text size='xs' line_height='xl'>
                    <Localize i18n_default_text='Looking for CFDs? Go to Trader’s Hub' />
                </Text>
                <Icon
                    data_testid='dt_go_to_arrow'
                    icon='IcChevronDownBold'
                    className='account-switcher-wallet__arrow'
                />
            </button>
        </div>
    );
});
