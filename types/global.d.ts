import { TLiveChatWidget } from './livechat';

declare global {
    interface Window {
        Analytics: any;
        dataLayer: object[];
        DD_RUM: object | undefined;
        DerivAppChannel?: DerivAppChannel;
        DerivInterCom: {
            initialize: (config: IntercomConfig) => void;
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Intercom: any;
        navigator: Navigator;
    }
    interface DerivAppChannelMessage {
        event: 'trading:back' | 'trading:home';
        // Add other event types as needed
    }
    interface DerivAppChannel {
        postMessage: (message: string) => void;
        isReady?: () => boolean;
    }
    interface IntercomConfig {
        token: string | null;
        hideLauncher?: boolean;
    }
    interface Navigator {
        connection?: NetworkInformation;
    }
    interface NetworkInformation {
        effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
        rtt?: number;
        downlink?: number;
    }
}

export {};
