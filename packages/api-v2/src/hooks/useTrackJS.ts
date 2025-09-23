import { TrackJS } from 'trackjs';

/**
 * Custom hook to initialize TrackJS.
 * @returns {Object} An object containing the `initTrackJS` function.
 */
const useTrackJS = () => {
    const isProduction = process.env.NODE_ENV === 'production';

    const initTrackJS = (loginid?: string) => {
        try {
            if (!TrackJS.isInstalled() && process.env.TRACKJS_TOKEN) {
                TrackJS.install({
                    application: 'derivatives-trader',
                    dedupe: false,
                    enabled: isProduction,
                    token: process.env.TRACKJS_TOKEN,
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
