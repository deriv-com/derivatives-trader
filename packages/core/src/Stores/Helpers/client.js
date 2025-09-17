import { localize } from '@deriv-com/translations';

export const getClientAccountType = loginid => {
    let account_type;
    if (/^VR/.test(loginid)) account_type = 'virtual';
    else if (/^MF/.test(loginid)) account_type = 'financial';
    else if (/^MLT|MX/.test(loginid)) account_type = 'gaming';
    return account_type;
};

const TypesMapConfig = (() => {
    let types_map_config;

    const initTypesMap = () => ({
        default: localize('Real'),
        financial: localize('Investment'),
        gaming: localize('Gaming'),
        virtual: localize('Virtual'),
    });

    return {
        get: () => {
            if (!types_map_config) {
                types_map_config = initTypesMap();
            }
            return types_map_config;
        },
    };
})();

export const getAccountTitle = loginid => {
    const types_map = TypesMapConfig.get();
    return types_map[getClientAccountType(loginid)] || types_map.default;
};

export const getAvailableAccount = market_type => {
    if (market_type === 'all') {
        return 'all';
    }
    return 'financial';
};

export const getLandingCompanyValue = () => {
    // Hardcoded changeable_fields for maximum permissiveness (ROW/SVG behavior)
    // This shows all possible fields that users can change
    const hardcoded_changeable_fields = [
        'first_name',
        'last_name',
        'date_of_birth',
        'citizen',
        'place_of_birth',
        'phone',
        'address_line_1',
        'address_line_2',
        'address_city',
        'address_state',
        'address_postcode',
        'tax_residence',
        'tax_identification_number',
        'account_opening_reason',
        'salutation',
    ];

    return hardcoded_changeable_fields;
};
