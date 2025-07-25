import React from 'react';

import { Localize } from '@deriv/translations';
import { ActionSheet, SegmentedControlSingleChoice } from '@deriv-com/quill-ui';

import DealCancellation from './deal-cancellation';
import TakeProfitAndStopLossContainer from './take-profit-and-stop-loss-container';

type TRiskManagementPickerProps = {
    closeActionSheet: () => void;
    initial_tab_index?: number;
    should_show_deal_cancellation?: boolean;
};

const RiskManagementPicker = ({
    closeActionSheet,
    initial_tab_index = 0,
    should_show_deal_cancellation,
}: TRiskManagementPickerProps) => {
    const [tab_index, setTabIndex] = React.useState(initial_tab_index);

    return (
        <ActionSheet.Content className='risk-management__picker'>
            {should_show_deal_cancellation && (
                <SegmentedControlSingleChoice
                    hasContainerWidth
                    onChange={setTabIndex}
                    options={[
                        { label: <Localize i18n_default_text='TP & SL' /> },
                        { label: <Localize i18n_default_text='Deal cancellation' /> },
                    ]}
                    size='sm'
                    selectedItemIndex={tab_index}
                />
            )}
            {tab_index ? (
                <DealCancellation closeActionSheet={closeActionSheet} />
            ) : (
                <TakeProfitAndStopLossContainer closeActionSheet={closeActionSheet} />
            )}
        </ActionSheet.Content>
    );
};

export default RiskManagementPicker;
