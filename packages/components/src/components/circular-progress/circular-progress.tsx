import classNames from 'classnames';
import React from 'react';

type TCircularProgressProps = {
    className?: string;
    danger_limit?: number;
    is_clockwise?: boolean;
    progress?: number;
    radius?: number;
    stroke?: number;
    warning_limit?: number;
    icon?: React.ReactElement;
};

const CircularProgress = ({
    className,
    danger_limit = 20,
    icon,
    is_clockwise = false,
    progress = 0,
    radius = 22,
    stroke = 3,
    warning_limit = 50,
}: TCircularProgressProps) => {
    const normalizedRadius = radius - stroke / 2;
    const circumference = normalizedRadius * 2 * Math.PI;
    const strokeDashoffset = circumference - (progress / 100) * circumference;
    return (
        <div className={classNames('dc-circular-progress', className)}>
            {icon &&
                React.cloneElement(icon, {
                    className: 'dc-circular-progress__icon',
                    iconSize: icon.props.iconSize || 'xs',
                    fill: icon.props.fill || 'var(--color-text-primary)',
                })}
            <svg height={radius * 2} width={radius * 2}>
                <circle
                    className={classNames('dc-circular-progress__bar', {
                        'dc-circular-progress--clockwise': is_clockwise,
                        'dc-circular-progress__bar--warning': progress <= warning_limit && progress > danger_limit,
                        'dc-circular-progress__bar--danger': progress <= danger_limit,
                    })}
                    cx={radius}
                    cy={radius}
                    fill='transparent'
                    r={normalizedRadius}
                    strokeDasharray={`${circumference} ${circumference}`}
                    strokeWidth={stroke}
                    style={{ strokeDashoffset }}
                />
            </svg>
        </div>
    );
};

export default CircularProgress;
