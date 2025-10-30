/**
 * Feature flags configuration interface
 * Defines the structure of remote configuration flags
 */
export interface FeatureFlags {
    /** Enable/disable Intercom chat support */
    cs_chat_intercom: boolean;

    /** Enable/disable WhatsApp chat support */
    cs_chat_whatsapp: boolean;

    /** Enable/disable RudderStack analytics tracking */
    tracking_rudderstack: boolean;

    /** Enable/disable DataDog RUM tracking */
    tracking_datadog: boolean;
}

/**
 * Type guard to check if an object conforms to FeatureFlags interface
 */
export function isFeatureFlags(obj: any): obj is FeatureFlags {
    return (
        typeof obj === 'object' &&
        obj !== null &&
        typeof obj.cs_chat_intercom === 'boolean' &&
        typeof obj.cs_chat_whatsapp === 'boolean' &&
        typeof obj.tracking_rudderstack === 'boolean' &&
        typeof obj.tracking_datadog === 'boolean'
    );
}
