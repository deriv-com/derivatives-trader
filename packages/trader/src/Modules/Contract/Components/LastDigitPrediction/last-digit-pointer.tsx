import React from 'react';
import classNames from 'classnames';

import { LegacyTrendUpIcon } from '@deriv/quill-icons';

type TLastDigitPointer = {
    is_lost?: boolean;
    is_trade_page?: boolean;
    is_won?: boolean;
    position: {
        left: number;
        top: number;
    };
};

const LastDigitPointer = ({ is_lost, is_trade_page, is_won, position }: TLastDigitPointer) => (
    <React.Fragment>
        {!!position && (
            <span
                className='digits__pointer'
                style={{ transform: `translate3d(calc(${position.left}px), ${position.top}px, 0px)` }}
            >
                <LegacyTrendUpIcon
                    className={classNames('digits__icon', {
                        'digits__icon--win': is_won && !is_trade_page,
                        'digits__icon--loss': is_lost && !is_trade_page,
                    })}
                    fill={
                        is_won
                            ? 'var(--color-status-success)'
                            : is_lost
                              ? 'var(--color-status-danger)'
                              : 'var(--color-status-neutral)'
                    }
                    iconSize='xs'
                />
            </span>
        )}
    </React.Fragment>
);

export default LastDigitPointer;
