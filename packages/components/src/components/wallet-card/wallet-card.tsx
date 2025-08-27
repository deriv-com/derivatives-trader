import React from 'react';
import classNames from 'classnames';
import { localize } from '@deriv-com/translations';
import Badge from '../badge';
import Button from '../button';
import Text from '../text';
import { isMobile } from '@deriv/shared';
import { WalletIcon } from '../wallet-icon';
import { LegacyCheck2pxIcon, LegacyPlus2pxIcon, LegacyWonIcon } from '@deriv/quill-icons';
import './wallet-card.scss';

type TWalletCardProps = {
    // TODO: This type should be updated when the response is ready
    wallet: {
        balance: string;
        currency: string;
        icon: string;
        icon_type: 'fiat' | 'crypto' | 'app' | 'demo';
        jurisdiction_title: string;
        name: string;
        gradient_class: string;
    };
    size?: 'small' | 'medium' | 'large';
    state?: 'active' | 'add' | 'added' | 'default' | 'disabled' | 'faded';
};

type IconComponentProps = {
    size: TWalletCardProps['size'];
    icon_type: TWalletCardProps['wallet']['icon_type'];
    icon_name: string;
};

// Helper function to convert icon string to React component
const getIconComponent = (iconName: string): React.ReactElement => {
    // For now, we'll need to create a mapping or use a fallback
    // This is a placeholder - in practice, you'd need proper icon mapping
    return <div data-icon={iconName} />;
};

const IconComponent = ({ size, icon_type, icon_name }: IconComponentProps) => {
    let icon_size: React.ComponentProps<typeof WalletIcon>['size'] = 'large';
    if (size === 'small') icon_size = 'medium';
    if (size === 'medium') icon_size = isMobile() && icon_type === 'crypto' ? 'medium' : 'large';
    const iconComponent = getIconComponent(icon_name);
    return <WalletIcon type={icon_type} icon={iconComponent} size={icon_size} />;
};

const WalletCard: React.FC<React.PropsWithChildren<TWalletCardProps>> = ({
    wallet,
    size = 'medium',
    state = 'default',
}) => (
    <div className={`wallet-card wallet-card--${size} wallet-card--${state}`}>
        <div
            className={`wallet-card__container wallet-card__container--${state} wallet-card__container--${size} ${wallet.gradient_class}`}
        >
            {size !== 'small' && <div className='wallet-card__shine' />}
            <div
                className={classNames('wallet-card__container-fade', {
                    [`wallet-card__container-fade--${state}`]: state,
                })}
            />
            {size === 'small' && <IconComponent size={size} icon_type={wallet.icon_type} icon_name={wallet.icon} />}
            {size !== 'small' && (
                <div className={`wallet-card__content wallet-card__content--${size}`}>
                    <div className='wallet-card__top-wrapper'>
                        <IconComponent size={size} icon_type={wallet.icon_type} icon_name={wallet.icon} />
                        {wallet.jurisdiction_title === 'virtual' ? (
                            <Badge label={localize('Demo')} type='contained' background_color='blue' />
                        ) : (
                            <Badge
                                custom_color='var(--color-text-primary)'
                                label={wallet.jurisdiction_title.toUpperCase()}
                                type='bordered'
                            />
                        )}
                    </div>

                    <div className='wallet-card__bottom-wrapper'>
                        {state !== 'add' && state !== 'added' ? (
                            <React.Fragment>
                                <Text color='primary' size={isMobile() ? 'xxxxs' : 'xxxs'}>
                                    {wallet.name}
                                </Text>
                                <Text color='primary' weight='bold' size={isMobile() ? 'xxs' : 'xs'}>
                                    {wallet.balance} {wallet.currency}
                                </Text>
                            </React.Fragment>
                        ) : (
                            <Button
                                className={`wallet-card__wallet-button wallet-card__wallet-button--${state}`}
                                classNameSpan='wallet-card__wallet-button-text'
                                icon={
                                    state === 'added' ? (
                                        <LegacyCheck2pxIcon
                                            className='wallet-card__wallet-button-icon'
                                            width={12}
                                            height={12}
                                            fill='var(--color-text-primary)'
                                        />
                                    ) : (
                                        <LegacyPlus2pxIcon
                                            className='wallet-card__wallet-button-icon'
                                            width={12}
                                            height={12}
                                            fill='var(--color-text-primary)'
                                        />
                                    )
                                }
                                text={state === 'added' ? localize('Added') : localize('Add')}
                                is_disabled={state === 'added'}
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
        {state === 'active' && (
            <div className={`wallet-card__active-icon wallet-card__active-icon--${size}`}>
                <LegacyWonIcon
                    data-testid='dt_ic_checkmark_circle'
                    width={size === 'small' ? 16 : 32}
                    height={size === 'small' ? 16 : 32}
                    fill='var(--color-status-success)'
                />
            </div>
        )}
    </div>
);
export default WalletCard;
