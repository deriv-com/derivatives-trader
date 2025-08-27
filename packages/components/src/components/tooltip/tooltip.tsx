import classNames from 'classnames';
import React from 'react';
import { useHover } from '../../hooks/use-hover';
import {
    LegacyInfo1pxIcon,
    LegacyInformationIcon,
    LabelPairedQuestionCaptionBoldIcon,
    StandaloneCircleFillIcon,
} from '@deriv/quill-icons';

type TTooltip = {
    alignment: string;
    className?: string;
    classNameIcon?: string;
    has_error?: boolean;
    icon?: string;
    message?: string | null;
};

const Tooltip = ({
    alignment,
    children,
    className,
    classNameIcon,
    has_error,
    icon, // only question, info and dot accepted
    message,
}: React.PropsWithChildren<TTooltip>) => {
    const [hover_ref, show_tooltip_balloon_icon_on_hover] = useHover<SVGSVGElement>();

    const icon_class = classNames(classNameIcon, icon);

    return (
        <span
            className={classNames(className, 'dc-tooltip', { 'dc-tooltip--error': has_error })}
            data-tooltip={message || undefined}
            data-tooltip-pos={alignment}
        >
            {icon === 'info' && (
                <React.Fragment>
                    <LegacyInfo1pxIcon className={icon_class} ref={hover_ref} fill='var(--color-text-primary)' />
                    <LegacyInformationIcon
                        fill='var(--color-text-info)'
                        className={classNames(`${classNameIcon}-balloon-icon`, 'dc-tooltip__balloon-icon', {
                            'dc-tooltip__balloon-icon--show': show_tooltip_balloon_icon_on_hover,
                        })}
                    />
                </React.Fragment>
            )}
            {icon === 'question' && (
                <LabelPairedQuestionCaptionBoldIcon className={icon_class} fill='var(--color-text-primary)' />
            )}
            {icon === 'dot' && (
                <StandaloneCircleFillIcon className={icon_class} width={4} height={4} fill='var(--color-text-danger)' />
            )}
            {children}
        </span>
    );
};

export default Tooltip;
