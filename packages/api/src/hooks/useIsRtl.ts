import React from 'react';
import { useTranslations } from '@deriv-com/translations';

const useIsRtl = () => {
    const { currentLang, instance } = useTranslations();

    const checkRtl = React.useCallback(() => {
        if (instance && typeof instance.dir === 'function') {
            return instance.dir(currentLang?.toLowerCase()) === 'rtl';
        }
        return false;
    }, [currentLang, instance]);

    const [is_rtl, setIsRtl] = React.useState<boolean>(() => checkRtl());

    React.useEffect(() => {
        setIsRtl(checkRtl());
    }, [checkRtl]);

    return is_rtl;
};

export default useIsRtl;
