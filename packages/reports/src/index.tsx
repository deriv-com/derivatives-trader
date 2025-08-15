import React from 'react';

import { Loading } from '@deriv/components';
import { makeLazyLoader } from '@deriv/shared';

import 'promise-polyfill';

const App = makeLazyLoader(
    () => import(/* webpackChunkName: "reports-app", webpackPreload: true */ './app'),

    () => <Loading />
)();

export default App;
