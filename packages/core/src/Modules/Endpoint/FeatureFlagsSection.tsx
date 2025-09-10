import React from 'react';
import { observer, useStore } from '@deriv/stores';
import { Checkbox, Text } from '@deriv/components';
import { getProductionPlatformHostname } from '@deriv/shared';

export const FeatureFlagsSection = observer(() => {
    const { feature_flags } = useStore();

    // Only show feature flags on non-production environments
    const visible_feature_flags = Object.entries(feature_flags.data ?? {})?.reduce<{ [key: string]: boolean }>(
        (flags, [key, value]) => {
            const is_production = location.hostname === getProductionPlatformHostname();
            if (!is_production && typeof value === 'boolean') {
                flags[key] = value;
            }
            return flags;
        },
        {} // hiding all flags from production
    );

    // Don't render anything if there are no feature flags or no data
    if (!feature_flags.data || Object.keys(visible_feature_flags).length === 0) return null;

    return (
        <div className='feature-flags'>
            <Text as='h1' weight='bold' color='primary'>
                Feature flags
            </Text>
            {Object.keys(visible_feature_flags).map(flag => (
                <div key={flag} className='feature-flags__item'>
                    <Checkbox
                        label={flag}
                        value={visible_feature_flags[flag as keyof typeof visible_feature_flags]}
                        onChange={e =>
                            feature_flags.update((old?: typeof feature_flags.data) => ({
                                ...(old as typeof feature_flags.data),
                                [flag]: (e.target as HTMLInputElement).checked,
                            }))
                        }
                    />
                </div>
            ))}
        </div>
    );
});
