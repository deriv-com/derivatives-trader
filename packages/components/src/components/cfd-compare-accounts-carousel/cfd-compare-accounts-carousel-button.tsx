import React from 'react';
import classNames from 'classnames';
import { LegacyChevronLeft2pxIcon, LegacyChevronRight2pxIcon } from '@deriv/quill-icons';

type TPrevNextButtonProps = {
    enabled: boolean;
    onClick: () => void;
    isNext?: boolean;
    isRtl?: boolean;
};

const CFDCompareAccountsCarouselButton = (props: TPrevNextButtonProps) => {
    const { enabled, onClick, isNext = false, isRtl = false } = props;

    const getIconComponent = () => {
        if (isNext) {
            return isRtl ? <LegacyChevronLeft2pxIcon /> : <LegacyChevronRight2pxIcon />;
        }
        return isRtl ? <LegacyChevronRight2pxIcon /> : <LegacyChevronLeft2pxIcon />;
    };

    return (
        <button
            className={classNames('cfd-compare-accounts-carousel__button', {
                'cfd-compare-accounts-carousel__button--prev': !isNext,
                'cfd-compare-accounts-carousel__button--next': isNext,
            })}
            onClick={onClick}
            disabled={!enabled}
        >
            {React.cloneElement(getIconComponent(), {
                className: 'cfd-compare-accounts-carousel__button__svg',
                iconSize: 'xs',
                fill: 'var(--color-text-primary)',
            })}
        </button>
    );
};
export default CFDCompareAccountsCarouselButton;
