import React from 'react';
import { useTranslations } from '@deriv-com/translations';

const useIsRtl = () => {
    const { currentLang } = useTranslations();

    const checkRtl = React.useCallback(() => {
        return currentLang?.toLowerCase() === 'ar';
    }, [currentLang]);

    const [is_rtl, setIsRtl] = React.useState<boolean>(() => checkRtl());

    React.useEffect(() => {
        setIsRtl(checkRtl());
    }, [checkRtl, currentLang]);

    return is_rtl;
};

export default useIsRtl;
