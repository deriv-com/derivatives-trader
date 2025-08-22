import { useState } from 'react';
import Cookies from 'js-cookie';

import { Icon, Loading } from '@deriv/components';
import { useOauth2 } from '@deriv/api';
import { BrandBrandLightDerivWordmarkHorizontal25YearsEnglishIcon as DerivLogo } from '@deriv/quill-icons';
import { getBrandUrl } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { localize } from '@deriv/translations';
import { requestOidcAuthentication } from '@deriv-com/auth-client';
import { Text } from '@deriv-com/ui';

import './AccessDeniedScreen.scss';

const AccessDeniedScreen = observer(() => {
    const client_information = JSON.parse(Cookies.get('client_information') || '{}');
    const email_address = client_information?.email;

    const [is_loading, setIsLoading] = useState(false);

    const { client } = useStore();
    const { logout } = client;
    const { oAuthLogout } = useOauth2({
        handleLogout: async () => {
            setIsLoading(true);

            try {
                await logout();
                await requestOidcAuthentication({
                    redirectCallbackUri: `${window.location.origin}/callback`,
                });

                setIsLoading(false);
            } catch (err) {
                // eslint-disable-next-line no-console
                console.error(err);
                setIsLoading(false);
            }
        },
    });

    const continueOnClick = () => {
        window.location.href = getBrandUrl();
    };

    return (
        <div className='access-denied'>
            <header className='access-denied__header'>
                <DerivLogo className='access-denied__logo' />
            </header>

            <main className='access-denied__main-container'>
                {is_loading ? (
                    <Loading />
                ) : (
                    <>
                        <Icon icon='IcWarningOrange' width={72} height={72} />
                        <Text as='h2' className='access-denied__title' weight='bold' align='center'>
                            {localize("You're currently logged in as")} <br />
                            {email_address}
                        </Text>
                        <Text as='p' align='center' className='access-denied__description'>
                            {localize('Would you like to continue with this')}
                            <br />
                            {localize('account or switch to a different one?')}
                        </Text>

                        <div className='access-denied__actions'>
                            <button className='access-denied__button' onClick={continueOnClick}>
                                {localize('Continue')}
                            </button>
                            <button
                                className='access-denied__button access-denied__button--switch'
                                onClick={oAuthLogout}
                            >
                                {localize('Switch account')}
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
});

export default AccessDeniedScreen;
