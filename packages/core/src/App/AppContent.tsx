import React from 'react';
import { useLocation } from 'react-router-dom';

import { useIntercom, useRemoteConfig, useTrackJS } from '@deriv/api';
import { observer, useStore } from '@deriv/stores';
import { ThemeProvider } from '@deriv-com/quill-ui';
import { useTranslations } from '@deriv-com/translations';

import initDatadog from '../Utils/Datadog';

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
    const { initTrackJS } = useTrackJS();

    const store = useStore();
    const { current_account } = store.client;
    const { current_language } = store.common;
    const { is_dark_mode_on } = store.ui;

    const { switchLanguage } = useTranslations();

    const location = useLocation();
    const has_access_denied_error = location.search.includes('access_denied');

    const { data } = useRemoteConfig(true);
    const { tracking_datadog } = data;

    const token = current_account?.session_token || null;
    useIntercom(token);

    const html = document.documentElement;

    React.useEffect(() => {
        const loginid = current_account?.loginid || undefined;
        initTrackJS(loginid);
    }, [initTrackJS, current_account?.loginid]);

    React.useEffect(() => {
        switchLanguage(current_language);
        html?.setAttribute('lang', current_language.toLowerCase());
        html?.setAttribute('dir', current_language.toLowerCase() === 'ar' ? 'rtl' : 'ltr');
    }, [current_language, switchLanguage, html]);

    React.useEffect(() => {
        initDatadog(tracking_datadog);
    }, [tracking_datadog]);

    return (
        <ThemeProvider theme={is_dark_mode_on ? 'dark' : 'light'}>
            <LandscapeBlocker />
            {<Header />}
            <ErrorBoundary root_store={store}>
                <AppContents>
                    <Routes {...({ passthrough } as any)} />
                </AppContents>
            </ErrorBoundary>
            {!has_access_denied_error && <Footer />}
            <ErrorBoundary root_store={store}>
                <AppModals />
            </ErrorBoundary>
            <AppToastMessages />
            <Devtools />
        </ThemeProvider>
    );
});

export default AppContent;
