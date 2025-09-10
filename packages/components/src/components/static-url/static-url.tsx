import React from 'react';

import { getStaticUrl, setUrlLanguage } from '@deriv/shared';
import { useTranslations } from '@deriv-com/translations';

type TStaticUrl = React.HTMLAttributes<HTMLAnchorElement> & {
    href?: string;
    is_document?: boolean;
    is_eu_url?: boolean;
};

const StaticUrl = ({ href, is_document, is_eu_url = false, children = null, ...props }: TStaticUrl) => {
    const { currentLang } = useTranslations();
    const getHref = () => {
        setUrlLanguage(currentLang);
        return getStaticUrl(href, is_document);
    };

    return (
        <a href={getHref()} rel='noopener noreferrer' target='_blank' {...props}>
            {children}
        </a>
    );
};

export default StaticUrl;
