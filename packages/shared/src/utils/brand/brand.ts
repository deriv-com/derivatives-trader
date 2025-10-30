// eslint-disable-next-line import/no-relative-packages
import config_data from '../../../../../brand.config.json';

export const getBrandDomain = () => {
    return config_data.brand_domain;
};

export const getBrandName = () => {
    return config_data.brand_name;
};

export const getBrandLogo = () => {
    return config_data.brand_logo;
};

export const getBrandHostname = () => {
    // Determine environment - use production if NODE_ENV is production, otherwise staging
    const isProduction = process.env.NODE_ENV === 'production';

    // Return appropriate URL from brand config
    return isProduction ? config_data.brand_hostname.production : config_data.brand_hostname.staging;
};

export const getBrandUrl = () => {
    // Determine environment - use production if NODE_ENV is production, otherwise staging
    const isProduction = process.env.NODE_ENV === 'production';

    // Return appropriate URL from brand config
    return isProduction
        ? `https://${config_data.brand_hostname.production}`
        : `https://${config_data.brand_hostname.staging}`;
};

export const getBrandHomeUrl = () => {
    return `${getBrandUrl()}/home`;
};

export const getBrandLoginUrl = () => {
    return `${getBrandUrl()}/login`;
};

export const getBrandSignupUrl = () => {
    return `${getBrandUrl()}/signup`;
};

export const getPlatformName = () => {
    return config_data.platform.name;
};

export const getPlatformLogo = () => {
    return config_data.platform.logo;
};

export const getPlatformHostname = () => {
    // Check specific NODE_ENV values
    if (process.env.NODE_ENV === 'production') {
        return config_data.platform.hostname.production;
    } else if (process.env.NODE_ENV === 'staging') {
        return config_data.platform.hostname.staging;
    }
    if (typeof window !== 'undefined') {
        return window.location.host;
    }
    return config_data.platform.hostname.staging;
};

export const getProductionPlatformHostname = () => {
    return config_data.platform.hostname.production;
};

export const getStagingPlatformHostname = () => {
    return config_data.platform.hostname.staging;
};

export const getPlatformUrl = () => {
    // Determine environment - use production if NODE_ENV is production, otherwise staging
    const isProduction = process.env.NODE_ENV === 'production';

    // Return appropriate URL from brand config
    return isProduction
        ? `https://${config_data.platform.hostname.production}`
        : `https://${config_data.platform.hostname.staging}`;
};

export const getProductionPlatformUrl = () => {
    return `https://${config_data.platform.hostname.production}`;
};

export const getStagingPlatformUrl = () => {
    return `https://${config_data.platform.hostname.staging}`;
};

export const getDomainName = () => {
    // Split the hostname into parts
    const domainParts = window.location.hostname.split('.');

    // Ensure we have at least two parts (SLD and TLD)
    if (domainParts.length >= 2) {
        // Combine the SLD and TLD
        const domain = `${domainParts[domainParts.length - 2]}.${domainParts[domainParts.length - 1]}`;
        return domain;
    }

    return '';
};

/**
 * Gets the WebSocket URL based on environment and account type
 * @param isProductionEnv - Whether the current environment is production
 * @param accountType - 'real' or 'demo'
 * @returns WebSocket server URL
 */
export const getWebSocketURL = (isProductionEnv: boolean, accountType: 'real' | 'demo'): string => {
    return isProductionEnv
        ? config_data.platform.websocket.production[accountType]
        : config_data.platform.websocket.staging[accountType];
};
