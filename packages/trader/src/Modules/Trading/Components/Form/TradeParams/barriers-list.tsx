import React from 'react';
import { CSSTransition } from 'react-transition-group';
import classNames from 'classnames';

import { DesktopWrapper, MobileWrapper, Text } from '@deriv/components';
import { LegacyClose2pxIcon } from '@deriv/quill-icons';

import Fieldset from 'App/Components/Form/fieldset';

import BarriersListBody, { TBarriersListBody } from './barriers-list-body';

type TBarriersList = TBarriersListBody & {
    header: string | React.ReactNode;
    onClickCross: () => void;
    show_table: boolean;
};

const BarriersList = ({ className, header, onClickCross, show_table, ...props }: TBarriersList) => (
    <React.Fragment>
        <DesktopWrapper>
            <CSSTransition
                appear
                in={show_table}
                timeout={250}
                classNames={{
                    appear: `${className}--enter`,
                    enter: `${className}--enter`,
                    enterDone: `${className}--enter-done`,
                    exit: `${className}--exit`,
                }}
                unmountOnExit
            >
                <Fieldset className={classNames('trade-container__fieldset', className)}>
                    <div className={`${className}__header`}>
                        <Text color='primary' weight='bold' size='xs'>
                            {header}
                        </Text>
                        <div className={`${className}__icon-close`} onClick={onClickCross}>
                            <LegacyClose2pxIcon
                                data-testid={`dt_${className}__icon_close`}
                                fill='var(--color-text-primary)'
                            />
                        </div>
                    </div>
                    <BarriersListBody className={className} {...props} />
                </Fieldset>
            </CSSTransition>
        </DesktopWrapper>
        <MobileWrapper>
            <BarriersListBody className={className} {...props} />
        </MobileWrapper>
    </React.Fragment>
);

export default React.memo(BarriersList);
