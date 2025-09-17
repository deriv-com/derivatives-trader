import { localize } from '@deriv-com/translations';

export const getDefaultError = () => ({
    header: localize('Sorry for the interruption'),
    description: localize('Our servers hit a bump. Let’s refresh to move on.'),
    cta_label: localize('Refresh'),
});
