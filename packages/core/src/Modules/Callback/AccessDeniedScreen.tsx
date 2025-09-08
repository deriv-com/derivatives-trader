import { useState } from 'react';
import Cookies from 'js-cookie';

import { useOauth2 } from '@deriv/api';
import { Loading } from '@deriv/components';
import {
    BrandBrandLightDerivWordmarkHorizontal25YearsEnglishIcon as DerivLogo,
    LegacyWarningIcon,
} from '@deriv/quill-icons';
import { getBrandUrl } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { requestOidcAuthentication } from '@deriv-com/auth-client';
import { Localize } from '@deriv-com/translations';
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
                        <LegacyWarningIcon width={72} height={72} fill='var(--color-text-warning)' />
                        <Text as='h2' className='access-denied__title' weight='bold' align='center'>
                            <Localize i18n_default_text="You're currently logged in as" /> <br />
                            {email_address}
                        </Text>
                        <Text as='p' align='center' className='access-denied__description'>
                            <Localize i18n_default_text='Would you like to continue with this' />
                            <br />
                            <Localize i18n_default_text='account or switch to a different one?' />
                        </Text>

                        <div className='access-denied__actions'>
                            <button className='access-denied__button' onClick={continueOnClick}>
                                <Localize i18n_default_text='Continue' />
                            </button>
                            <button
                                className='access-denied__button access-denied__button--switch'
                                onClick={oAuthLogout}
                            >
                                <Localize i18n_default_text='Switch account' />
                            </button>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
});

export default AccessDeniedScreen;
