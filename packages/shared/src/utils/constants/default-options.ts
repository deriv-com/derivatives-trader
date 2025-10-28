import { isProduction } from '../config/config';

/**
 * Returns List of unsupported languages based on the environment.
 * Supported languages: EN, ES, FR, PT, AR, IT, RU, BN, DE, KO, SW, TR, VI, ZH_CN, ZH_TW
 */
export const UNSUPPORTED_LANGUAGES = ['ID', 'KM', 'MN', 'PL', 'SI', 'UZ', 'TH'];
