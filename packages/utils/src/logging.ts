import { TrackJS } from 'trackjs';

export type TLogData = Record<string, unknown>;

export const logError = (message: string, data: TLogData = {}): void => {
    const payload = { message, ...data };

    // Add TrackJS logging
    try {
        if (TrackJS.isInstalled()) {
            // Track the error
            TrackJS.track(new Error(message));
            // Log additional context
            TrackJS.console.log('logError called:', payload);
        }
    } catch (trackJSError) {
        // eslint-disable-next-line no-console
        console.error('Failed to log error with TrackJS:', trackJSError);
    }
};
