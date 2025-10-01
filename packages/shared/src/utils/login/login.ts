import { getBrandLoginUrl, getBrandSignupUrl, getPlatformHostname } from '../brand';

export const redirectToLogin = () => {
    const baseLoginUrl = getBrandLoginUrl();
    const platformHostname = getPlatformHostname();
    const loginUrlWithRedirect = `${baseLoginUrl}?redirect=${encodeURIComponent(platformHostname)}`;

    window.location.href = loginUrlWithRedirect;
};

export const redirectToSignUp = () => {
    window.location.href = getBrandSignupUrl();
};
