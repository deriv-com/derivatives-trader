import { getBrandUrl } from '@deriv/shared';

// Define allowed redirect destinations as a type-safe enum
export type RedirectDestination = 'home' | 'account-limits';

export const useAccountSettingsRedirect = (redirect_to: RedirectDestination = 'home') => {
    const search_params = new URLSearchParams(window.location.search);
    const account_type = search_params.get('account');

    // Always use hub URL for account settings redirects
    const hubUrl = getBrandUrl();
    const redirect_url = `${hubUrl}/accounts/redirect?action=redirect_to&redirect_to=${redirect_to}&account=${account_type}`;
    const mobile_redirect_url = `${hubUrl}/accounts/redirect?action=redirect_to&redirect_to=${redirect_to}&account=${account_type}`;

    return { redirect_url, mobile_redirect_url };
};

export default useAccountSettingsRedirect;
