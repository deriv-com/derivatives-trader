import React from 'react';
import classNames from 'classnames';

import { MobileWrapper } from '@deriv/components';
import { AMOUNT_MAX_LENGTH, getDecimalPlaces } from '@deriv/shared';
import { observer, useStore } from '@deriv/stores';
import { localize } from '@deriv/translations';

import { useTraderStore } from 'Stores/useTraderStores';

import LabeledQuantityInputMobile from '../../LabeledQuantityInputMobile';

const AccumulatorsAmountMobile = observer(() => {
    const { ui, client } = useStore();
    const { current_focus, setCurrentFocus } = ui;
    const { is_single_currency } = client;
    const { amount, currency, onChange, has_open_accu_contract } = useTraderStore();
    return (
        <>
            <MobileWrapper>
                <LabeledQuantityInputMobile
                    input_label={localize('Stake')}
                    className={classNames('trade-container__amount', 'trade-container__amount--accumulator')}
                    classNameInlinePrefix='trade-container__currency'
                    classNameInput={classNames('trade-container__input', 'trade-container__input--accumulator')}
                    currency={currency}
                    current_focus={current_focus}
                    fractional_digits={getDecimalPlaces(currency)}
                    id='dt_amount_input'
                    inline_prefix={is_single_currency ? currency : undefined}
                    is_autocomplete_disabled
                    is_disabled={has_open_accu_contract}
                    is_float
                    is_hj_whitelisted
                    is_incrementable
                    is_negative_disabled
                    max_length={AMOUNT_MAX_LENGTH}
                    name='amount'
                    onChange={onChange}
                    type='tel'
                    value={amount}
                    ariaLabel={localize('Amount')}
                    setCurrentFocus={setCurrentFocus}
                />
            </MobileWrapper>
        </>
    );
});

export default AccumulatorsAmountMobile;
