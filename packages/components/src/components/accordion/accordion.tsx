import classNames from 'classnames';
import React from 'react';
import { usePrevious } from '../../hooks';
import { LegacyMinus1pxIcon, LegacyPlus1pxIcon } from '@deriv/quill-icons';
import { TAccordionProps } from '../types';

const Accordion = ({ className, icon_close, icon_open, list }: TAccordionProps) => {
    const [open_idx, setOpenIdx] = React.useState<number | null>(null);

    const prev_list = usePrevious(list);

    React.useEffect(() => {
        if (prev_list !== list) setOpenIdx(null);
    }, [list, prev_list]);

    // close if clicking the accordion that's open, otherwise open the new one
    const onClick = (index: number) => setOpenIdx(index === open_idx ? null : index);

    return (
        <div className={classNames('dc-accordion__wrapper', className)}>
            {list.map((item, idx) => (
                <div
                    className={classNames(
                        'dc-accordion__item',
                        `dc-accordion__item--${open_idx === idx ? 'open' : 'close'}`,
                        {
                            [`dc-accordion__item--${idx === 0 ? 'first' : 'last'}`]:
                                idx === 0 || idx === list.length - 1,
                        }
                    )}
                    key={idx}
                >
                    <div className='dc-accordion__item-header' onClick={() => onClick(idx)}>
                        {item.header}
                        <div className='dc-accordion__item-header-icon-wrapper'>
                            {open_idx === idx ? (
                                icon_open ? (
                                    <span className='dc-accordion__item-header-icon'>{icon_open}</span>
                                ) : (
                                    <LegacyMinus1pxIcon
                                        className='dc-accordion__item-header-icon'
                                        iconSize='xs'
                                        fill='var(--color-text-primary)'
                                    />
                                )
                            ) : icon_close ? (
                                <span className='dc-accordion__item-header-icon'>{icon_close}</span>
                            ) : (
                                <LegacyPlus1pxIcon
                                    className='dc-accordion__item-header-icon'
                                    iconSize='xs'
                                    fill='var(--color-text-primary)'
                                />
                            )}
                        </div>
                    </div>
                    <div className='dc-accordion__item-content'>{item.content}</div>
                </div>
            ))}
        </div>
    );
};

export default Accordion;
