import React from 'react';

import { Text } from '@deriv-com/quill-ui';
import { Localize, useTranslations } from '@deriv-com/translations';

const SymbolNotFound = ({ searchTerm }: { searchTerm?: string }) => {
    const { localize } = useTranslations();
    return (
        <div className='symbol-not-found__container'>
            <div className='symbol-not-found__content'>
                <Text size='lg' bold color='quill-typography__color--subtle'>
                    {localize('No results for {{searchTerm}}', {
                        searchTerm,
                        interpolation: { escapeValue: false },
                    })}
                </Text>
                <Text size='sm' color='quill-typography__color--subtle'>
                    <Localize i18n_default_text='Try searching for something else.' />
                </Text>
            </div>
        </div>
    );
};

export default SymbolNotFound;
