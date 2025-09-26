import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

import { Div100vhContainer, FadeWrapper, Loading, PageOverlay, SelectNative, VerticalTab } from '@deriv/components';
import { getSelectedRoute } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { Analytics } from '@deriv-com/analytics';
import { useTranslations } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';

import { TRoute } from 'Types';

import 'Sass/app/modules/reports.scss';

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

    React.useEffect(() => {
        // Capture redirect parameter on mount
        const urlParams = new URLSearchParams(location.search);
        const redirectUrl = urlParams.get('redirect');
        if (redirectUrl) {
            redirectUrlRef.current = redirectUrl;
        }
    }, []); // Only run on mount

    React.useEffect(() => {
        Analytics.trackEvent('ce_reports_form', {
            action: 'open',
            form_name: 'default',
            subform_name: history.location.pathname.split('/')[2],
            form_source: 'deriv_trader',
        });
        toggleReports(true);
        return () => {
            toggleReports(false);
            Analytics.trackEvent('ce_reports_form', {
                action: 'close',
                form_name: 'default',
                subform_name: location.pathname.split('/')[2],
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onClickClose = () => {
        sessionStorage.removeItem('open_positions_filter');

        // Check for stored redirect parameter
        if (redirectUrlRef.current) {
            // If redirect parameter exists, navigate to that URL
            try {
                // Decode the URL in case it's encoded
                let decodedUrl = decodeURIComponent(redirectUrlRef.current);

                // Add protocol if missing to ensure proper external navigation
                if (!decodedUrl.startsWith('http://') && !decodedUrl.startsWith('https://')) {
                    decodedUrl = `https://${decodedUrl}`;
                }

                window.location.href = decodedUrl;
            } catch (error) {
                // If decoding fails, use the original URL with protocol
                let fallbackUrl = redirectUrlRef.current;
                if (!fallbackUrl.startsWith('http://') && !fallbackUrl.startsWith('https://')) {
                    fallbackUrl = `https://${fallbackUrl}`;
                }
                window.location.href = fallbackUrl;
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
            path: redirectUrlRef.current
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
