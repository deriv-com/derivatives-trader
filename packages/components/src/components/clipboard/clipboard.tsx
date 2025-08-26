import React from 'react';
import classNames from 'classnames';
import { useIsMounted } from '@deriv/shared';
import Popover from '../popover';
import { TPopoverProps } from '../types';
import { useCopyToClipboard } from '../../hooks';
import { LegacyWonIcon, LegacyCopy1pxIcon } from '@deriv/quill-icons';

type TClipboard = {
    text_copy: string;
    icon?: React.ReactElement;
    info_message?: string;
    success_message?: string;
    className?: string;
    onClickHandler?: VoidFunction;
    popoverClassName?: string;
    popoverAlignment?: 'top' | 'right' | 'bottom' | 'left';
    popover_props?: Partial<TPopoverProps>;
    size?: number;
};
const Clipboard = ({
    text_copy,
    info_message,
    icon,
    success_message,
    className,
    onClickHandler,
    popoverClassName,
    popover_props = {},
    popoverAlignment = 'bottom',
    size = 16,
}: TClipboard) => {
    const [is_copied, copyToClipboard, setIsCopied] = useCopyToClipboard();
    const isMounted = useIsMounted();
    let timeout_clipboard: ReturnType<typeof setTimeout>;

    const onClick = (event: { stopPropagation: () => void }) => {
        copyToClipboard(text_copy);
        timeout_clipboard = setTimeout(() => {
            if (isMounted()) {
                setIsCopied(false);
            }
        }, 2000);
        event.stopPropagation();
        onClickHandler?.();
    };

    React.useEffect(() => {
        return () => clearTimeout(timeout_clipboard);
    }, []);

    return (
        <Popover
            alignment={popoverAlignment}
            classNameBubble={classNames('dc-clipboard__popover', popoverClassName)}
            message={is_copied ? success_message : info_message}
            {...popover_props}
            zIndex='9999'
        >
            {is_copied ? (
                <LegacyWonIcon fill='var(--status-success)' className={classNames('dc-clipboard', className)} />
            ) : icon ? (
                React.cloneElement(icon, {
                    fill: 'var(--color-text-secondary)',
                    className: classNames('dc-clipboard', className),
                    onClick,
                    width: size,
                    height: size,
                })
            ) : (
                <LegacyCopy1pxIcon
                    fill='var(--color-text-secondary)'
                    className={classNames('dc-clipboard', className)}
                    onClick={onClick}
                    width={size}
                    height={size}
                />
            )}
        </Popover>
    );
};

export default Clipboard;
