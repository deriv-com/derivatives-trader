import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StoreProvider, mockStore } from '@deriv/stores';
import { FeatureFlagsSection } from '../FeatureFlagsSection';

const FLAGS = {
    DUMMY_FLAG: 'dummy_flag',
};
const feature_flags_title = 'Feature flags';

describe('<FeatureFlagsSection/>', () => {
    const original_window_location = { ...window.location };
    const original_location = { ...location };
    let default_mock_store: ReturnType<typeof mockStore>;

    beforeEach(() => {
        Object.defineProperty(window, 'location', {
            value: { ...original_window_location },
            configurable: true,
            writable: true,
        });

        Object.defineProperty(global, 'location', {
            value: { ...original_location },
            configurable: true,
            writable: true,
        });

        window.location.href = 'https://localhost:8443';

        default_mock_store = mockStore({
            feature_flags: {
                data: {
                    dummy_flag: false,
                },
            },
        });
    });

    afterEach(() => {
        jest.clearAllMocks();

        Object.defineProperty(window, 'location', {
            value: { ...original_window_location },
            configurable: true,
            writable: true,
        });

        Object.defineProperty(global, 'location', {
            value: { ...original_location },
            configurable: true,
            writable: true,
        });
    });

    const mockFeatureFlagsSection = (store: ReturnType<typeof mockStore> = default_mock_store) => {
        return (
            <StoreProvider store={store}>
                <FeatureFlagsSection />
            </StoreProvider>
        );
    };

    it('should render dummy flag unchecked on localhost', () => {
        render(mockFeatureFlagsSection());

        expect(screen.getByText(feature_flags_title)).toBeInTheDocument();
        expect(screen.getByRole('checkbox', { name: FLAGS.DUMMY_FLAG })).not.toBeChecked();
    });

    it('should render checked dummy flag on localhost', () => {
        render(
            mockFeatureFlagsSection(
                mockStore({
                    feature_flags: {
                        data: {
                            dummy_flag: true,
                        },
                    },
                })
            )
        );

        expect(screen.getByRole('checkbox', { name: FLAGS.DUMMY_FLAG })).toBeChecked();
    });

    it('should render dummy flag on development domain', () => {
        location.hostname = 'localhost';
        render(mockFeatureFlagsSection());

        expect(screen.getByRole('checkbox', { name: FLAGS.DUMMY_FLAG })).toBeInTheDocument();
    });

    it('should render dummy flag on staging', () => {
        location.hostname = 'staging-dtrader.deriv.com';
        render(mockFeatureFlagsSection());

        expect(screen.getByRole('checkbox', { name: FLAGS.DUMMY_FLAG })).toBeInTheDocument();
    });

    it('should render none of the flags on production', () => {
        location.hostname = 'dtrader.deriv.com';
        render(mockFeatureFlagsSection());

        expect(screen.queryByRole('checkbox', { name: FLAGS.DUMMY_FLAG })).not.toBeInTheDocument();
    });

    it('should not render any flags or "Feature flags" title when data object with flags is undefined', () => {
        delete default_mock_store.feature_flags.data;
        render(mockFeatureFlagsSection());

        expect(screen.queryByRole(feature_flags_title)).not.toBeInTheDocument();
        expect(screen.queryByRole('checkbox', { name: FLAGS.DUMMY_FLAG })).not.toBeInTheDocument();
    });

    it('should not render any flags or "Feature flags" title when there are no feature flags', () => {
        render(
            mockFeatureFlagsSection(
                mockStore({
                    feature_flags: {
                        data: {},
                    },
                })
            )
        );

        expect(screen.queryByText(feature_flags_title)).not.toBeInTheDocument();
    });

    it('should call feature_flags.update() method when a flag is checked', async () => {
        const update = jest.fn();
        default_mock_store.feature_flags.update = update;
        render(mockFeatureFlagsSection());

        await userEvent.click(screen.getByRole('checkbox', { name: FLAGS.DUMMY_FLAG }));

        expect(update).toBeCalled();
    });
});
