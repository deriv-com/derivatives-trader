import React from 'react';
import { makeLazyLoader, moduleLoader } from '@deriv/shared';
import { observer } from '@deriv/stores';
import classNames from 'classnames';

const HeaderFallback = () => {
    return <div className={classNames('header')} />;
};

const HeaderLegacy = makeLazyLoader(
    () => moduleLoader(() => import(/* webpackChunkName: "dtrader-header" */ './header-legacy')),
    () => <HeaderFallback />
)();

const Header = observer(() => {
    return <HeaderLegacy />;
});

export default Header;
