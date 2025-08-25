import { Icon, Popover } from '@deriv/components';
import { isTabletOs } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { Localize } from '@deriv-com/translations';

const TradersHubOnboarding = observer(() => {
    const { ui } = useStore();
    const { is_dark_mode_on, is_mobile } = ui;

    const onboardingIcon = (
        <Icon
            data_testid='dt_traders_hub_onboarding_icon'
            icon={is_dark_mode_on ? 'IcTradingHubOnboardingDark' : 'IcTradingHubOnboarding'}
            size={20}
        />
    );

    return (
        <div data-testid='dt_traders_hub_onboarding' className='traders-hub-onboarding__toggle'>
            {isTabletOs ? (
                onboardingIcon
            ) : (
                <Popover
                    classNameBubble='account-settings-toggle__tooltip'
                    alignment='bottom'
                    message={!is_mobile && <Localize i18n_default_text='View tutorial' />}
                    should_disable_pointer_events
                    zIndex='9999'
                >
                    {onboardingIcon}
                </Popover>
            )}
        </div>
    );
});

export default TradersHubOnboarding;
