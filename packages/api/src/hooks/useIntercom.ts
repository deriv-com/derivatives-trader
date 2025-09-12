import { useEffect, useState } from 'react';
import { useScript } from 'usehooks-ts';

export const useIntercom = (enabled: boolean, token: string | null) => {
    // TODO: Update the intercom script URL with v2 when it's available
    const intercom_script = 'https://static.deriv.com/scripts/intercom/v1.0.1.js';
    const scriptStatus = useScript(enabled ? intercom_script : null);

    useEffect(() => {
        if (!enabled || scriptStatus !== 'ready' || !window?.DerivInterCom) return;

        let intervalId: NodeJS.Timeout;

        const initIntercom = () => {
            window.DerivInterCom.initialize({
                hideLauncher: true,
                token,
            });

            intervalId = setInterval(() => {
                if (window?.Intercom) {
                    clearInterval(intervalId);
                }
            }, 500);
        };

        initIntercom();

        return () => {
            clearInterval(intervalId);
        };
    }, [enabled, scriptStatus, token]);
};

export const useIsIntercomAvailable = () => {
    const [is_ready, setIsReady] = useState(false);

    useEffect(() => {
        const TIMEOUT_DURATION = 5000;
        const startTime = Date.now();

        const checkIntercom = setInterval(() => {
            if (typeof window.Intercom === 'function') {
                setIsReady(true);
                clearInterval(checkIntercom);
            } else if (Date.now() - startTime >= TIMEOUT_DURATION) {
                clearInterval(checkIntercom);
            }
        }, 100);

        return () => clearInterval(checkIntercom);
    }, []);

    return is_ready;
};

export default useIntercom;
