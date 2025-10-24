import React from 'react';
import clsx from 'clsx';

import { observer } from '@deriv/stores';
import { WheelPickerContainer } from '@deriv-com/quill-ui';

import { DURATION_UNIT, getOptionPerUnit } from 'AppV2/Utils/trade-params-utils';
import { useTraderStore } from 'Stores/useTraderStores';

import HourPicker from './hourpicker';

const DurationWheelPicker = observer(
    ({
        unit,
        setWheelPickerValue,
        selected_duration,
    }: {
        unit: string;
        setWheelPickerValue: (index: number, value: string | number) => void;
        selected_duration: number[];
    }) => {
        const { duration_min_max, duration_units_list } = useTraderStore();
        const options = React.useMemo(() => getOptionPerUnit(unit, duration_min_max), [unit, duration_min_max]);

        const handleContainerHeight = () => {
            if (unit === DURATION_UNIT.DAYS) {
                return '228px';
            }
            return duration_units_list.length === 1 ? '230px' : '268px';
        };
        return (
            <div
                className={clsx('duration-container__wheel-picker-container', {
                    'duration-container__wheel-picker-container__single':
                        duration_units_list.length == 1 && unit !== DURATION_UNIT.DAYS,
                })}
            >
                {unit !== DURATION_UNIT.HOURS ? (
                    <WheelPickerContainer
                        data={options}
                        defaultValue={[String(selected_duration[0])]}
                        containerHeight={handleContainerHeight()}
                        inputValues={selected_duration}
                        setInputValues={setWheelPickerValue}
                    />
                ) : (
                    <HourPicker
                        setWheelPickerValue={setWheelPickerValue}
                        selected_duration={selected_duration}
                        duration_min_max={duration_min_max}
                    />
                )}
            </div>
        );
    }
);

export default DurationWheelPicker;
