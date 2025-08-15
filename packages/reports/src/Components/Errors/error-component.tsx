import React from 'react';

import { Dialog, PageErrorContainer } from '@deriv/components';
import { routes } from '@deriv/shared';
import { localize } from '@deriv/translations';

import { TErrorComponent } from 'Types';

/**
 * Enhanced error component with improved TypeScript, accessibility, and UX
 * Supports multiple error types, retry mechanisms, and error reporting
 */

// Enhanced type definitions for better type safety
interface EnhancedErrorProps extends Partial<TErrorComponent> {
    // Core error properties
    header?: string;
    message?: string;
    error_code?: string;
    error_type?: 'network' | 'validation' | 'permission' | 'server' | 'client' | 'unknown';

    // Display options
    is_dialog?: boolean;
    should_show_refresh?: boolean;
    should_show_retry?: boolean;
    should_auto_retry?: boolean;

    // Customization
    redirect_label?: string;
    retry_label?: string;
    cancel_label?: string;

    // Callbacks
    redirectOnClick?: () => void;
    onRetry?: () => Promise<void> | void;
    onCancel?: () => void;
    onErrorReport?: (error: ErrorReportData) => void;

    // Advanced options
    max_retry_attempts?: number;
    retry_delay?: number;
    show_error_details?: boolean;
    custom_actions?: Array<{
        label: string;
        action: () => void;
        variant?: 'primary' | 'secondary' | 'danger';
    }>;
}

interface ErrorReportData {
    error_code?: string;
    error_type: string;
    message: string;
    timestamp: number;
    user_agent: string;
    url: string;
}

/**
 * Enhanced Error Component with comprehensive error handling
 * Provides better UX, accessibility, and error reporting capabilities
 */
const ErrorComponent: React.FC<EnhancedErrorProps> = ({
    header,
    message,
    error_code,
    error_type = 'unknown',
    is_dialog = false,
    should_show_refresh = true,
    should_show_retry = false,
    should_auto_retry = false,
    redirect_label,
    retry_label,
    cancel_label,
    redirectOnClick,
    onRetry,
    onCancel,
    onErrorReport,
    max_retry_attempts = 3,
    retry_delay = 1000,
    show_error_details = false,
    custom_actions = [],
}) => {
    const [retry_count, setRetryCount] = React.useState(0);
    const [is_retrying, setIsRetrying] = React.useState(false);
    const [show_details, setShowDetails] = React.useState(false);
    const retry_timeout_ref = React.useRef<NodeJS.Timeout>();

    // Auto-retry logic
    React.useEffect(() => {
        if (should_auto_retry && retry_count < max_retry_attempts && onRetry) {
            retry_timeout_ref.current = setTimeout(
                () => {
                    handleRetry();
                },
                retry_delay * 2 ** retry_count
            ); // Exponential backoff
        }

        return () => {
            if (retry_timeout_ref.current) {
                clearTimeout(retry_timeout_ref.current);
            }
        };
    }, [should_auto_retry, retry_count, max_retry_attempts, retry_delay, onRetry]);

    // Error reporting
    React.useEffect(() => {
        if (onErrorReport) {
            const error_data: ErrorReportData = {
                error_code,
                error_type,
                message: message || 'Unknown error occurred',
                timestamp: Date.now(),
                user_agent: navigator.userAgent,
                url: window.location.href,
            };
            onErrorReport(error_data);
        }
    }, [error_code, error_type, message, onErrorReport]);

    const handleRetry = async () => {
        if (!onRetry || retry_count >= max_retry_attempts) return;

        setIsRetrying(true);
        try {
            await onRetry();
            setRetryCount(0); // Reset on success
        } catch (error) {
            setRetryCount(prev => prev + 1);
        } finally {
            setIsRetrying(false);
        }
    };

    const handleRefresh = () => {
        if (redirectOnClick) {
            redirectOnClick();
        } else {
            window.location.reload();
        }
    };

    const getErrorIcon = () => {
        switch (error_type) {
            case 'network':
                return '🌐';
            case 'validation':
                return '⚠️';
            case 'permission':
                return '🔒';
            case 'server':
                return '🖥️';
            case 'client':
                return '💻';
            default:
                return '❌';
        }
    };

    const getContextualMessage = () => {
        if (message) return message;

        switch (error_type) {
            case 'network':
                return localize('Network connection issue. Please check your internet connection and try again.');
            case 'validation':
                return localize('Please check your input and try again.');
            case 'permission':
                return localize('You do not have permission to perform this action.');
            case 'server':
                return localize('Server error occurred. Our team has been notified.');
            case 'client':
                return localize('An unexpected error occurred. Please refresh the page.');
            default:
                return localize('Sorry, an error occurred while processing your request.');
        }
    };

    const refresh_message = should_show_refresh ? localize('Please refresh this page to continue.') : '';
    const retry_available = should_show_retry && onRetry && retry_count < max_retry_attempts;
    const contextual_message = getContextualMessage();

    if (is_dialog) {
        return (
            <Dialog
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span role='img' aria-label='Error'>
                            {getErrorIcon()}
                        </span>
                        {header || localize('There was an error')}
                    </div>
                }
                is_visible
                confirm_button_text={
                    retry_available ? retry_label || localize('Retry') : redirect_label || localize('Ok')
                }
                onConfirm={retry_available ? handleRetry : handleRefresh}
                cancel_button_text={retry_available ? redirect_label || localize('Refresh') : undefined}
                onCancel={retry_available ? handleRefresh : onCancel}
                has_close_icon={!retry_available}
                is_loading={is_retrying}
                className='error-dialog'
                data-testid='error-dialog'
                // Accessibility improvements
                aria-describedby='error-message'
                aria-live='polite'
            >
                <div id='error-message' className='error-content'>
                    <p className='error-main-message'>{contextual_message}</p>

                    {retry_available && (
                        <p className='error-retry-info'>
                            {localize('Attempt {{current}} of {{max}}', {
                                current: retry_count + 1,
                                max: max_retry_attempts,
                            })}
                        </p>
                    )}

                    {show_error_details && (error_code || error_type !== 'unknown') && (
                        <details className='error-details'>
                            <summary onClick={() => setShowDetails(!show_details)} className='error-details-toggle'>
                                {localize('Error Details')}
                            </summary>
                            {show_details && (
                                <div className='error-details-content'>
                                    {error_code && <p>Code: {error_code}</p>}
                                    <p>Type: {error_type}</p>
                                    <p>Time: {new Date().toLocaleString()}</p>
                                </div>
                            )}
                        </details>
                    )}

                    {custom_actions.length > 0 && (
                        <div className='error-custom-actions'>
                            {custom_actions.map((action, index) => (
                                <button
                                    key={index}
                                    onClick={action.action}
                                    className={`custom-action-btn ${action.variant || 'secondary'}`}
                                    type='button'
                                >
                                    {action.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </Dialog>
        );
    }

    // Enhanced PageErrorContainer rendering
    const error_messages = [];
    if (contextual_message) error_messages.push(contextual_message);
    if (refresh_message) error_messages.push(refresh_message);

    if (retry_available) {
        error_messages.push(
            localize('You can try again or refresh the page. (Attempt {{current}} of {{max}})', {
                current: retry_count + 1,
                max: max_retry_attempts,
            })
        );
    }

    const redirect_urls = [routes.index];
    const redirect_labels = [];

    if (retry_available) {
        redirect_labels.push(retry_label || localize('Retry'));
        redirect_labels.push(redirect_label || localize('Refresh'));
    } else {
        redirect_labels.push(redirect_label || localize('Refresh'));
    }

    return (
        <div className='enhanced-page-error' data-testid='page-error' role='alert' aria-live='polite'>
            <div className='error-icon-container'>
                <span role='img' aria-label='Error' className='error-icon'>
                    {getErrorIcon()}
                </span>
            </div>

            <PageErrorContainer
                error_header={header || localize('Something went wrong')}
                error_messages={error_messages}
                redirect_urls={redirect_urls}
                redirect_labels={redirect_labels}
                buttonOnClick={retry_available ? handleRetry : handleRefresh}
            />

            {show_error_details && (error_code || error_type !== 'unknown') && (
                <details className='page-error-details'>
                    <summary className='error-details-toggle'>{localize('Technical Details')}</summary>
                    <div className='error-details-content'>
                        {error_code && (
                            <p>
                                <strong>Error Code:</strong> {error_code}
                            </p>
                        )}
                        <p>
                            <strong>Error Type:</strong> {error_type}
                        </p>
                        <p>
                            <strong>Timestamp:</strong> {new Date().toISOString()}
                        </p>
                        {retry_count > 0 && (
                            <p>
                                <strong>Retry Attempts:</strong> {retry_count}
                            </p>
                        )}
                    </div>
                </details>
            )}

            {custom_actions.length > 0 && (
                <div className='page-error-actions'>
                    {custom_actions.map((action, index) => (
                        <button
                            key={index}
                            onClick={action.action}
                            className={`page-action-btn ${action.variant || 'secondary'}`}
                            type='button'
                        >
                            {action.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

};

export default ErrorComponent;
