import { TrackJS } from 'trackjs';

const { TRACKJS_TOKEN, NODE_ENV } = process.env;

/**
 * Custom hook to initialize TrackJS.
 * @returns {Object} An object containing the `initTrackJS` function.
 */
const useTrackJS = () => {
    const isProduction = NODE_ENV === 'production';

    const initTrackJS = (loginid?: string) => {
        try {
            if (!TrackJS.isInstalled()) {
                TrackJS.install({
                    application: 'derivatives-trader',
                    dedupe: false,
                    enabled: isProduction,
                    token: TRACKJS_TOKEN!,
                    userId: loginid,
                });
            }
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to initialize TrackJS', error);
        }
    };

    return { initTrackJS };
};

export default useTrackJS;
