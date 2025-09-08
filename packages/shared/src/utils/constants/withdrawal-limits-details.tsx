import { Localize } from '@deriv-com/translations';

export const getWithdrawalTitle = (withdrawal_type: string, num_of_days?: number) => {
    const titles = {
        lifetime_limit: <Localize i18n_default_text='Total withdrawal allowed (Lifetime)' />,
        num_of_days_limit: (
            <Localize i18n_default_text='Total withdrawal allowed ({{num_of_days}} days).' values={{ num_of_days }} />
        ),
        withdrawal_since_inception_monetary: <Localize i18n_default_text='Total withdrawn (Lifetime)' />,
        withdrawal_for_x_days_monetary: (
            <Localize i18n_default_text='Total withdrawn ({{num_of_days}} days)' values={{ num_of_days }} />
        ),
        remainder: <Localize i18n_default_text='Maximum withdrawal remaining' />,
    };
    return titles[withdrawal_type as keyof typeof titles] || null;
};

export const getWithdrawalInfoMessage = (withdrawal_type: string) => {
    const messages = {
        lifetime_limit: <Localize i18n_default_text='Total amount you can withdraw over the life of this account.' />,
        num_of_days_limit: <Localize i18n_default_text='Total amount you can withdraw over this period.' />,
        withdrawal_since_inception_monetary: (
            <Localize i18n_default_text='Total amount withdrawn since account opening.' />
        ),
        withdrawal_for_x_days_monetary: <Localize i18n_default_text='Total amount withdrawn over this period.' />,
        remainder: <Localize i18n_default_text='Maximum funds available for withdrawal.' />,
    };
    return messages[withdrawal_type as keyof typeof messages];
};
