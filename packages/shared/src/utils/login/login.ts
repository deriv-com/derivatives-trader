import { getBrandHubLoginUrl, getBrandHubSignupUrl } from '../brand';

export const redirectToLogin = () => {
    window.location.href = getBrandHubLoginUrl();
};

export const redirectToSignUp = () => {
    window.location.href = getBrandHubSignupUrl();
};
