import React from 'react';
import { Redirect, RouteComponentProps } from 'react-router-dom';

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
    const { is_from_derivgo, routeBackInApp } = common;
    const { is_reports_visible, setReportsTabIndex, toggleReports } = ui;
    const { isDesktop } = useDevice();

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
        routeBackInApp(history);
    };

    const handleRouteChange = (e: React.ChangeEvent<HTMLSelectElement>) => history.push(e.target.value);

    const menu_options = () => {
        return routes.map(route => ({
            default: route.default,
            icon: route.icon_component,
            label: route.getTitle(),
            value: route.component,
            path: route.path,
        }));
    };

    const selected_route = getSelectedRoute({ routes, pathname: location.pathname });

    if (!is_logged_in && is_logging_in) {
        return <Loading is_fullscreen />;
    }

    return (
        <FadeWrapper is_visible={is_reports_visible} className='reports-page-wrapper' keyname='reports-page-wrapper'>
            <div className='reports'>
                <PageOverlay header={localize('Reports')} onClickClose={onClickClose} is_from_app={is_from_derivgo}>
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
