import React from 'react';
import { useLocation } from 'react-router-dom';

import { useGrowthbookGetFeatureValue, useGrowthbookIsOn, useIntercom, useLiveChat, useRemoteConfig } from '@deriv/api';
import { observer, useStore } from '@deriv/stores';
import { ThemeProvider } from '@deriv-com/quill-ui';
import { useTranslations } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import { browserSupportsWebAuthn } from '@simplewebauthn/browser';

import initDatadog from '../Utils/Datadog';
import initHotjar from '../Utils/Hotjar';

import ErrorBoundary from './Components/Elements/Errors/error-boundary.jsx';
import LandscapeBlocker from './Components/Elements/LandscapeBlocker';
import AppToastMessages from './Containers/app-toast-messages.jsx';
import AppContents from './Containers/Layout/app-contents.jsx';
import Footer from './Containers/Layout/footer.jsx';
import Header from './Containers/Layout/header';
import AppModals from './Containers/Modals';
import Routes from './Containers/Routes/routes.jsx';
import Devtools from './Devtools';

const AppContent: React.FC<{ passthrough: any }> = observer(({ passthrough }) => {
    const store = useStore();
    const {
        is_logged_in,
        loginid,
        is_client_store_initialized,
        landing_company_shortcode,
        currency,
        residence,
        email,
        setIsPasskeySupported,
        current_account,
    } = store.client;
    const { current_language } = store.common;
    const { is_dark_mode_on } = store.ui;

    const { isMobile } = useDevice();
    const { switchLanguage } = useTranslations();
    const location = useLocation();
    const has_access_denied_error = location.search.includes('access_denied');

    const [isWebPasskeysFFEnabled, isGBLoaded] = useGrowthbookIsOn({
        featureFlag: 'web_passkeys',
    });
    const [isServicePasskeysFFEnabled] = useGrowthbookIsOn({
        featureFlag: 'service_passkeys',
    });
    const [isDuplicateLoginEnabled] = useGrowthbookGetFeatureValue({
        featureFlag: 'duplicate-login',
    });

    const { data } = useRemoteConfig(true);
    const { tracking_datadog } = data;
    const is_passkeys_supported = browserSupportsWebAuthn();

    const livechat_client_information: Parameters<typeof useLiveChat>[0] = {
        is_client_store_initialized,
        is_logged_in,
        loginid,
        landing_company_shortcode,
        currency,
        residence,
        email,
        first_name: current_account?.first_name,
        last_name: current_account?.last_name,
    };

    useLiveChat(livechat_client_information);
    const token = current_account?.session_token || null;
    useIntercom(token);

    const html = document.documentElement;

    React.useEffect(() => {
        switchLanguage(current_language);
        html?.setAttribute('lang', current_language.toLowerCase());
        html?.setAttribute('dir', current_language.toLowerCase() === 'ar' ? 'rtl' : 'ltr');
    }, [current_language, switchLanguage, html]);

    React.useEffect(() => {
        if (isGBLoaded && isWebPasskeysFFEnabled && isServicePasskeysFFEnabled) {
            setIsPasskeySupported(
                is_passkeys_supported && isServicePasskeysFFEnabled && isWebPasskeysFFEnabled && isMobile
            );
        }
    }, [
        isServicePasskeysFFEnabled,
        isGBLoaded,
        isWebPasskeysFFEnabled,
        is_passkeys_supported,
        isMobile,
        setIsPasskeySupported,
    ]);

    React.useEffect(() => {
        initDatadog(tracking_datadog);
    }, [tracking_datadog]);

    React.useEffect(() => {
        if (is_client_store_initialized) initHotjar(store.client);
    }, [store.client, is_client_store_initialized]);

    const isCallBackPage = window.location.pathname.includes('callback');

    return (
        <ThemeProvider theme={is_dark_mode_on ? 'dark' : 'light'}>
            <LandscapeBlocker />
            {!isCallBackPage && <Header />}
            <ErrorBoundary root_store={store}>
                <AppContents>
                    <Routes {...({ passthrough } as any)} />
                </AppContents>
            </ErrorBoundary>
            {!(isDuplicateLoginEnabled && has_access_denied_error) && <Footer />}
            <ErrorBoundary root_store={store}>
                <AppModals />
            </ErrorBoundary>
            <AppToastMessages />
            <Devtools />
        </ThemeProvider>
    );
});

export default AppContent;
