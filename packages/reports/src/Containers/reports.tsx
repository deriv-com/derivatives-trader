import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { Div100vhContainer, FadeWrapper, Loading, PageOverlay, SelectNative, VerticalTab } from '@deriv/components';
import { getSelectedRoute, trackAnalyticsEvent } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { useTranslations } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';

import { TRoute } from 'Types';

import 'Sass/app/modules/reports.scss';

// Whitelist of allowed domains for redirect
const ALLOWED_DOMAINS = ['deriv.com', 'deriv.be', 'deriv.me'];

// Pattern for preview deployment domains (e.g., branch-name.derivatives-bot.pages.dev)
const PREVIEW_DOMAIN_PATTERN = /^[a-zA-Z0-9-]+\.derivatives-bot\.pages\.dev$/;

/**
 * Validates if a URL belongs to an allowed domain
 * @param url - The URL to validate
 * @returns true if the URL is from an allowed domain, false otherwise
 */
const isAllowedDomain = (url: string): boolean => {
    try {
        const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);

        // Block URLs with user credentials (phishing protection)
        if (urlObj.username || urlObj.password) {
            return false;
        }

        const hostname = urlObj.hostname;

        // Check against main domain whitelist
        const isMainDomain = ALLOWED_DOMAINS.some(domain => hostname === domain || hostname.endsWith(`.${domain}`));

        // Check against preview deployment pattern
        const isPreviewDomain = PREVIEW_DOMAIN_PATTERN.test(hostname);

        return isMainDomain || isPreviewDomain;
    } catch {
        return false;
    }
};

type TReports = {
    history: RouteComponentProps['history'];
    location: RouteComponentProps['location'];
    routes: TRoute[];
};

const Reports = observer(({ history, location, routes }: TReports) => {
    const { localize } = useTranslations();
    const { client, common, ui } = useStore();

    const { is_logged_in, is_logging_in } = client;
    const { routeBackInApp } = common;
    const { is_reports_visible, setReportsTabIndex, toggleReports } = ui;
    const { isDesktop } = useDevice();

    // Store the redirect parameter when component mounts to preserve it across tab navigation
    const redirectUrlRef = React.useRef<string | null>(null);

    // Ref to prevent duplicate analytics calls
    const analyticsCalledRef = React.useRef<boolean>(false);

    React.useEffect(() => {
        // Capture redirect parameter on mount
        const urlParams = new URLSearchParams(location.search);
        const redirectUrl = urlParams.get('redirect');
        if (redirectUrl) {
            redirectUrlRef.current = redirectUrl;
        }
    }, []); // Only run on mount

    React.useEffect(() => {
        // Prevent duplicate analytics calls if component remounts
        if (analyticsCalledRef.current) {
            return;
        }

        analyticsCalledRef.current = true;

        trackAnalyticsEvent('ce_reports_form_v2', {
            action: 'open',
            platform: 'DTrader',
        });

        toggleReports(true);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onClickClose = () => {
        sessionStorage.removeItem('open_positions_filter');

        // Check for stored redirect parameter
        if (redirectUrlRef.current) {
            // If redirect parameter exists, navigate to that URL
            try {
                // URL length validation (prevent DoS)
                if (redirectUrlRef.current.length > 2048) {
                    // eslint-disable-next-line no-console
                    console.error('Security: Blocked excessively long redirect URL');
                    routeBackInApp(history);
                    return;
                }

                // Decode URL multiple times to handle double/triple encoding attacks
                let decodedUrl = redirectUrlRef.current;
                let previousUrl = '';
                let decodeAttempts = 0;
                const MAX_DECODE_ATTEMPTS = 5;

                while (decodedUrl !== previousUrl && decodedUrl.includes('%') && decodeAttempts < MAX_DECODE_ATTEMPTS) {
                    previousUrl = decodedUrl;
                    try {
                        decodedUrl = decodeURIComponent(decodedUrl);
                        decodeAttempts++;
                    } catch {
                        // Invalid encoding, reject
                        // eslint-disable-next-line no-console
                        console.error('Security: Blocked redirect URL with invalid encoding');
                        routeBackInApp(history);
                        return;
                    }
                }

                // Normalize and trim the URL
                decodedUrl = decodedUrl.trim();

                // Block dangerous protocols (XSS protection)
                const BLOCKED_PROTOCOLS = ['javascript:', 'data:', 'vbscript:', 'file:', 'blob:'];
                const safeUrl = decodedUrl.toLowerCase();

                if (BLOCKED_PROTOCOLS.some(protocol => safeUrl.startsWith(protocol))) {
                    // eslint-disable-next-line no-console
                    console.error('Security: Blocked dangerous protocol in redirect URL:', safeUrl.split(':')[0]);
                    routeBackInApp(history);
                    return;
                }

                // Handle protocol-relative URLs
                if (decodedUrl.startsWith('//')) {
                    decodedUrl = `https:${decodedUrl}`;
                }

                // Add protocol if missing to ensure proper external navigation
                if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
                    decodedUrl = `https://${decodedUrl}`;
                }

                // Validate domain whitelist (Open Redirect protection)
                if (!isAllowedDomain(decodedUrl)) {
                    // eslint-disable-next-line no-console
                    console.error('Security: Blocked redirect to unauthorized domain');
                    routeBackInApp(history);
                    return;
                }

                window.location.href = decodedUrl;
            } catch (error) {
                // If any error occurs during validation, fall back to safe navigation
                // eslint-disable-next-line no-console
                console.error(
                    'Security: Redirect validation error:',
                    error instanceof Error ? error.message : 'Unknown error'
                );
                routeBackInApp(history);
            }
        } else {
            // If no redirect parameter, use existing logic
            routeBackInApp(history);
        }
    };

    const handleRouteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // Preserve redirect parameter when changing routes
        const newPath = e.target.value;
        if (redirectUrlRef.current) {
            const redirectParam = `?redirect=${encodeURIComponent(redirectUrlRef.current)}`;
            history.push(`${newPath}${redirectParam}`);
        } else {
            history.push(newPath);
        }
    };

    const menu_options = () => {
        return routes.map(route => ({
            default: route.default,
            icon: route.icon_component,
            label: route.getTitle(),
            value: route.component,
            // Keep path clean for React Router - don't include query parameters
            path: route.path,
            // Store the full path with query params for navigation purposes
            fullPath: redirectUrlRef.current
                ? `${route.path}?redirect=${encodeURIComponent(redirectUrlRef.current)}`
                : route.path,
        }));
    };

    const selected_route = getSelectedRoute({ routes, pathname: location.pathname });

    if (!is_logged_in && is_logging_in) {
        return <Loading is_fullscreen />;
    }

    return (
        <FadeWrapper is_visible={is_reports_visible} className='reports-page-wrapper' keyname='reports-page-wrapper'>
            <div className='reports'>
                <PageOverlay header={localize('Reports')} onClickClose={onClickClose}>
                    {isDesktop ? (
                        <VerticalTab
                            is_floating
                            current_path={location.pathname}
                            is_routed
                            is_full_width
                            setVerticalTabIndex={setReportsTabIndex}
                            list={menu_options()}
                        />
                    ) : (
                        <Div100vhContainer className='reports__mobile-wrapper' height_offset='80px'>
                            <SelectNative
                                className='reports__route-selection'
                                list_items={menu_options().map(option => ({
                                    text: option.label,
                                    value: option.path ?? '',
                                }))}
                                value={selected_route.path ?? ''}
                                should_show_empty_option={false}
                                onChange={handleRouteChange}
                                label={''}
                                hide_top_placeholder={false}
                            />
                            {selected_route?.component && (
                                <selected_route.component icon_component={selected_route.icon_component} />
                            )}
                        </Div100vhContainer>
                    )}
                </PageOverlay>
            </div>
        </FadeWrapper>
    );
});

export default Reports;
