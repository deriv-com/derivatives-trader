import PropTypes from 'prop-types';
import React from 'react';
import { TrackJS } from 'trackjs';
import ErrorComponent from './index';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }
    componentDidCatch = (error, info) => {
        // Track the error with TrackJS
        try {
            if (TrackJS.isInstalled()) {
                // Track the actual error
                TrackJS.track(error);

                // Log additional context information
                TrackJS.console.log('Error Boundary - Component Stack:', info.componentStack);
                TrackJS.console.log('Error Boundary - Store State:', this.props.root_store);
                TrackJS.console.log('Error Boundary - Error Info:', {
                    message: error.message,
                    stack: error.stack,
                    name: error.name,
                });
            }
        } catch (trackJSError) {
            // eslint-disable-next-line no-console
            console.error('Failed to track error with TrackJS:', trackJSError);
        }

        this.setState({
            hasError: true,
            error,
            info,
        });
    };
    render = () => (this.state.hasError ? <ErrorComponent should_show_refresh={true} /> : this.props.children);
}

ErrorBoundary.propTypes = {
    root_store: PropTypes.object,
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
};

export default ErrorBoundary;
