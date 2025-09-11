import React from 'react';

import { Text } from '@deriv/components';
import { TranslationFlag } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { Localize, useTranslations } from '@deriv-com/translations';

const MenuTitle = observer(() => {
    const { localize } = useTranslations();
    // const { common, ui } = useStore();
    // const { current_language } = common;
    // const { is_mobile_language_menu_open, setMobileLanguageMenuOpen } = ui;

    return (
        <React.Fragment>
            <div>{localize('Menu')}</div>
            {/* Language switcher is hidden for MVP */}
            {/* <div
                className='settings-language__language-button_wrapper'
                onClick={() => {
                    if (!is_mobile_language_menu_open) {
                        setMobileLanguageMenuOpen(true);
                    }
                }}
            >
                {!is_mobile_language_menu_open && (
                    <React.Fragment>
                        {TranslationFlag[current_language] && TranslationFlag[current_language](22, 16)}
                        <Text weight='bold' size='xxs' className='ic-settings-language__text'>
                            <Localize i18n_default_text={current_language} />
                        </Text>
                    </React.Fragment>
                )}
            </div> */}
        </React.Fragment>
    );
});

export default MenuTitle;
