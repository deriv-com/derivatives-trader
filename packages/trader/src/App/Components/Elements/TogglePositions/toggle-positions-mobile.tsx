import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

import { Div100vhContainer, Icon, Modal, Text } from '@deriv/components';
import { isDisabledLandscapeBlockerRoute, isMobileOs, isTabletOs, routes } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { localize } from '@deriv/translations';
import { useDevice } from '@deriv-com/ui';

import PositionsModalCard from 'App/Components/Elements/PositionsDrawer/positions-modal-card';

import EmptyPortfolioMessage from '../EmptyPortfolioMessage';

import TogglePositions from './toggle-positions';

type TTogglePositionsMobile = Pick<
    ReturnType<typeof useStore>['portfolio'],
    'active_positions_count' | 'error' | 'onClickSell' | 'onClickCancel'
> & {
    currency: ReturnType<typeof useStore>['client']['currency'];
    filtered_positions: ReturnType<typeof useStore>['portfolio']['all_positions'];
    is_empty: boolean;
};

type THiddenPositionsId = TTogglePositionsMobile['filtered_positions'][0]['id'];

const TogglePositionsMobile = observer(
    ({
        active_positions_count,
        currency,
        error,
        filtered_positions,
        is_empty,
        onClickSell,
        onClickCancel,
    }: TTogglePositionsMobile) => {
        const { togglePositionsDrawer, is_positions_drawer_on } = useStore().ui;
        const [hidden_positions_ids, setHiddenPositionsIds] = React.useState<THiddenPositionsId[]>([]);
        const { isMobile, isTablet } = useDevice();

        const location = useLocation();
        const pathname = location?.pathname;
        const is_hidden_landscape_blocker = isDisabledLandscapeBlockerRoute(pathname);
        const should_show_dtrader_tablet_view = pathname === routes.trade && isTabletOs;

        const show_blocker_dtrader_mobile_landscape_view =
            !isMobile &&
            isMobileOs() &&
            (pathname.startsWith(routes.trade) ||
                pathname.startsWith(routes.reports) ||
                pathname.startsWith('/contract'));

        const hide_landscape_blocker =
            !show_blocker_dtrader_mobile_landscape_view &&
            (is_hidden_landscape_blocker || should_show_dtrader_tablet_view);

        const displayed_positions = filtered_positions
            .filter(p =>
                hidden_positions_ids.every(hidden_position_id => hidden_position_id !== p.contract_info.contract_id)
            )
            .slice(0, 5);
        const closed_positions_ids = displayed_positions
            .filter(position => position.contract_info?.is_sold)
            .map(p => p.contract_info.contract_id);

        const closeModal = () => {
            setHiddenPositionsIds([...new Set([...hidden_positions_ids, ...closed_positions_ids])]);
            togglePositionsDrawer();
        };
        // Show only 5 most recent open contracts
        const body_content = (
            <React.Fragment>
                <TransitionGroup component='div'>
                    {displayed_positions.map(portfolio_position => (
                        <CSSTransition
                            appear
                            key={portfolio_position.id}
                            in={true}
                            timeout={150}
                            classNames={{
                                appear: 'dc-contract-card__wrapper--enter',
                                enter: 'dc-contract-card__wrapper--enter',
                                enterDone: 'dc-contract-card__wrapper--enter-done',
                                exit: 'dc-contract-card__wrapper--exit',
                            }}
                            unmountOnExit
                        >
                            <PositionsModalCard
                                onClickSell={onClickSell}
                                onClickCancel={onClickCancel}
                                key={portfolio_position.id}
                                currency={currency}
                                togglePositions={togglePositionsDrawer}
                                {...portfolio_position}
                            />
                        </CSSTransition>
                    ))}
                </TransitionGroup>
            </React.Fragment>
        );

        return (
            <React.Fragment>
                <TogglePositions
                    is_open={is_positions_drawer_on}
                    togglePositions={togglePositionsDrawer}
                    positions_count={active_positions_count}
                />
                {hide_landscape_blocker && (
                    <Modal
                        is_open={is_positions_drawer_on}
                        toggleModal={closeModal}
                        id='dt_mobile_positions'
                        is_vertical_top
                        has_close_icon
                        width={isMobile ? 'calc(100vw - 32px)' : undefined}
                        className='toggle-positions'
                    >
                        <Div100vhContainer className='positions-modal' height_offset={isTablet ? '16rvh' : '48px'}>
                            <div className='positions-modal__header'>
                                <Text size='xxxs' className='positions-modal__title'>
                                    <Icon icon='IcPortfolio' className='positions-modal__title-icon' />
                                    {localize('Recent positions')}
                                </Text>
                                <div className='positions-modal__close-btn' onClick={closeModal}>
                                    <Icon data_testid='dt_modal_header_close' icon='IcMinusBold' />
                                </div>
                            </div>
                            <div className='positions-modal__body'>
                                {is_empty || !displayed_positions.length || error ? (
                                    <EmptyPortfolioMessage error={error} />
                                ) : (
                                    body_content
                                )}
                            </div>
                            <div className='positions-modal__footer'>
                                <NavLink
                                    onClick={closeModal}
                                    className='dc-btn dc-btn--secondary dc-btn__large positions-modal__footer-btn'
                                    to={routes.positions}
                                >
                                    <Text size='xs' weight='bold'>
                                        {localize('Go to Reports')}
                                    </Text>
                                </NavLink>
                            </div>
                        </Div100vhContainer>
                    </Modal>
                )}
            </React.Fragment>
        );
    }
);

export default TogglePositionsMobile;
