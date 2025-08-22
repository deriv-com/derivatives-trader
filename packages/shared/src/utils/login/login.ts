import { getBrandLoginUrl, getBrandSignupUrl } from '../brand';

export const redirectToLogin = () => {
    window.location.href = getBrandLoginUrl();
};

export const redirectToSignUp = () => {
    window.location.href = getBrandSignupUrl();
};
