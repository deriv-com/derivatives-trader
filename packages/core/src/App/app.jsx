import React from 'react';
// import { useTranslation } from 'react-i18next';
import { BrowserRouter as Router } from 'react-router-dom';
import PropTypes from 'prop-types';

import { APIProvider } from '@deriv/api';
import { Loading } from '@deriv/components';
import { initFormErrorMessages, setUrlLanguage, setWebsocket } from '@deriv/shared';
import { StoreProvider } from '@deriv/stores';
import { Analytics } from '@deriv-com/analytics';
import { BreakpointProvider } from '@deriv-com/quill-ui';
import { getInitialLanguage, initializeI18n, TranslationProvider } from '@deriv-com/translations';

import WS from 'Services/ws-methods';

import { FORM_ERROR_MESSAGES } from '../Constants/form-error-messages';

import AppContent from './AppContent';

import 'Sass/app.scss';

const App = ({ root_store }) => {
    const i18nInstance = initializeI18n({
        cdnUrl: `${process.env.CROWDIN_URL}/${process.env.R2_PROJECT_NAME}/${process.env.CROWDIN_BRANCH_NAME}`,
    });
    const l = window.location;
    const base = l.pathname.split('/')[1];
    const has_base = /^\/(br_)/.test(l.pathname);
    const { preferred_language } = root_store.client;
    const { is_dark_mode_on } = root_store.ui;
    const is_dark_mode = is_dark_mode_on || JSON.parse(localStorage.getItem('ui_store'))?.is_dark_mode_on;
    const language = preferred_language ?? getInitialLanguage();

    React.useEffect(() => {
        sessionStorage.removeItem('redirect_url');
        const loadSmartchartsStyles = () => {
            import('@deriv-com/derivatives-charts/dist/smartcharts.css');
        };

        // TODO: [translation-to-shared]: add translation implemnentation in shared
        setUrlLanguage(language);
        initFormErrorMessages(FORM_ERROR_MESSAGES);
        root_store.common.setPlatform();
        loadSmartchartsStyles();

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const platform_passthrough = {
        root_store,
        WS,
        i18nInstance,
        language,
    };

    setWebsocket(WS);

    React.useEffect(() => {
        if (!root_store.client.email) {
            Analytics.reset();
        }
    }, [root_store.client.email]);

    React.useEffect(() => {
        const html = document?.querySelector('html');

        if (!html) return;
        if (is_dark_mode) {
            html.classList?.remove('light');
            html.classList?.add('dark');
        } else {
            html.classList?.remove('dark');
            html.classList?.add('light');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <Router basename={has_base ? `/${base}` : null}>
            <StoreProvider store={root_store}>
                <BreakpointProvider>
                    <APIProvider>
                        <TranslationProvider defaultLang={language} i18nInstance={i18nInstance}>
                            {/* This is required as translation provider uses suspense to reload language */}
                            <React.Suspense fallback={<Loading />}>
                                <AppContent passthrough={platform_passthrough} />
                            </React.Suspense>
                        </TranslationProvider>
                    </APIProvider>
                </BreakpointProvider>
            </StoreProvider>
        </Router>
    );
};

App.propTypes = {
    root_store: PropTypes.object,
};

export default App;
