import React from 'react';

import { Text } from '@deriv/components';
import { LegacyPositionIcon } from '@deriv/quill-icons';
import { Localize } from '@deriv-com/translations';

type TEmptyPortfolioMessage = {
    error?: string;
};

const EmptyPortfolioMessage = ({ error }: TEmptyPortfolioMessage) => (
    <div className='portfolio-empty'>
        <div className='portfolio-empty__wrapper'>
            {error ? (
                <Text color='disabled' size='xs'>
                    {error}
                </Text>
            ) : (
                <React.Fragment>
                    <LegacyPositionIcon
                        className='portfolio-empty__icon'
                        iconSize='2xl'
                        fill='var(--color-text-disabled)'
                    />
                    <Text align='center' className='portfolio-empty__text' color='disabled' size='xs'>
                        <Localize i18n_default_text='You have no open positions.' />
                    </Text>
                </React.Fragment>
            )}
        </div>
    </div>
);

export default EmptyPortfolioMessage;
