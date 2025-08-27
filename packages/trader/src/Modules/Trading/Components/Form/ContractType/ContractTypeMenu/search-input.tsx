import React from 'react';

import { Input } from '@deriv/components';
import { LegacySearch1pxIcon, LegacyCloseCircle1pxBlackIcon } from '@deriv/quill-icons';
import { localize } from '@deriv-com/translations';

type TSearchInput = {
    onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement | null>;
    onBlur: React.FocusEventHandler<HTMLInputElement | HTMLTextAreaElement | null> | undefined;
    onClickClearInput: () => void;
    value: string;
};

const SearchInput = React.forwardRef<HTMLInputElement & HTMLTextAreaElement, TSearchInput>(
    ({ onChange, onClickClearInput, onBlur, value }, ref) => (
        <Input
            ref={ref}
            data-lpignore='true'
            leading_icon={<LegacySearch1pxIcon iconSize='xs' />}
            trailing_icon={
                value ? <LegacyCloseCircle1pxBlackIcon onClick={onClickClearInput} iconSize='xs' /> : undefined
            }
            placeholder={localize('Search')}
            type='text'
            onChange={onChange}
            onBlur={onBlur}
            value={value}
        />
    )
);

SearchInput.displayName = 'SearchInput';

export default React.memo(SearchInput);
