import { routes } from '../routes';
import { mapErrorMessage } from '../error-mapping';

type TMessage = {
    title: string;
    text: string;
    link: string;
    subcode?: string;
};

type TShowError = {
    message: string;
    header: string;
    redirect_label: string;
    redirectOnClick?: (() => void) | null;
    should_show_refresh: boolean;
    redirect_to: string;
    should_clear_error_on_click: boolean;
    should_redirect?: boolean;
};

type TAccounts = {
    residence?: string;
    landing_company_shortcode?: string;
};

export const showDigitalOptionsUnavailableError = (
    showError: (t: TShowError) => void,
    message: TMessage,
    redirectOnClick?: (() => void) | null,
    should_redirect?: boolean,
    should_clear_error_on_click = true
) => {
    const { title, text, link, subcode } = message;

    // Use mapped message if subcode is available, otherwise use original text
    const mappedMessage = subcode ? mapErrorMessage({ message: text, subcode }) : text;

    showError({
        message: mappedMessage,
        header: title,
        redirect_label: link,
        redirectOnClick,
        should_show_refresh: false,
        redirect_to: routes.index,
        should_clear_error_on_click,
        should_redirect,
    });
};
