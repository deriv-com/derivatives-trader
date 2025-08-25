import { useTranslation } from 'react-i18next';
import { Text, Icon } from '@deriv/components';
import { BinaryLink } from '../../Routes';
import { observer, useStore } from '@deriv/stores';
import { routes } from '@deriv/shared';
import { localize } from '@deriv-com/translations';
import './menu-links.scss';

const MenuItems = ({ id, text, icon, link_to }) => {
    return (
        <BinaryLink
            id={id}
            key={icon}
            to={link_to}
            className='header__menu-link'
            active_class='header__menu-link--active'
        >
            <Text size='m' line_height='xs' title={text} className='header__menu-link-text'>
                {icon}
                {text}
            </Text>
        </BinaryLink>
    );
};

const ReportTab = () => (
    <MenuItems
        id={'dt_reports_tab'}
        icon={<Icon icon='IcReports' className='header__icon' />}
        text={localize('Reports')}
        link_to={routes.reports}
    />
);

const MenuLinks = observer(({ is_traders_hub_routes = false }) => {
    const { i18n } = useTranslation();
    const { client } = useStore();
    const { is_logged_in } = client;

    if (!is_logged_in) return <></>;

    return (
        <div key={`menu-links__${i18n.language}`} className='header__menu-links'>
            {!is_traders_hub_routes && <ReportTab />}
        </div>
    );
});

export default MenuLinks;
