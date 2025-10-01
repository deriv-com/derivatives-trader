import React from 'react';

import { mockStore, StoreProvider } from '@deriv/stores';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import LogoutSuccessModal from '../logout-success-modal';

describe('<LogoutSuccessModal />', () => {
    let modalRootEl: HTMLDivElement;

    beforeAll(() => {
        modalRootEl = document.createElement('div');
        modalRootEl.setAttribute('id', 'modal_root');
        document.body.appendChild(modalRootEl);
    });

    afterAll(() => {
        document.body.removeChild(modalRootEl);
    });

    const modalHeading = /Log out successful/i;
    const modalMessage = /To sign out everywhere, log out from Home and your other active platforms./i;
    const gotItButtonName = 'Got it';

    const renderComponent = (store: any) =>
        render(
            <StoreProvider store={store}>
                <LogoutSuccessModal />
            </StoreProvider>
        );

    describe('Desktop Modal', () => {
        const store = mockStore({
            ui: {
                is_logout_success_modal_visible: true,
                is_mobile: false,
            },
        });

        it('should render desktop modal if is_logout_success_modal_visible is true and not mobile', () => {
            renderComponent(store);
            expect(screen.getByRole('heading', { name: modalHeading })).toBeInTheDocument();
            expect(screen.getByText(modalMessage)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: gotItButtonName })).toBeInTheDocument();
        });

        it('should call toggleLogoutSuccessModal when Got it button is clicked', async () => {
            const toggleLogoutSuccessModal = jest.fn();
            store.ui.toggleLogoutSuccessModal = toggleLogoutSuccessModal;
            renderComponent(store);

            const gotItButton = screen.getByRole('button', { name: gotItButtonName });
            await userEvent.click(gotItButton);
            expect(toggleLogoutSuccessModal).toBeCalledWith(false);
        });
    });

    describe('Mobile Action Sheet', () => {
        const store = mockStore({
            ui: {
                is_logout_success_modal_visible: true,
                is_mobile: true,
            },
        });

        it('should render mobile action sheet if is_logout_success_modal_visible is true and is mobile', () => {
            renderComponent(store);
            expect(screen.getByText(modalHeading)).toBeInTheDocument();
            expect(screen.getByText(modalMessage)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: gotItButtonName })).toBeInTheDocument();
        });

        it('should call toggleLogoutSuccessModal when Got it button is clicked on mobile', async () => {
            const toggleLogoutSuccessModal = jest.fn();
            store.ui.toggleLogoutSuccessModal = toggleLogoutSuccessModal;
            renderComponent(store);

            const gotItButton = screen.getByRole('button', { name: gotItButtonName });
            await userEvent.click(gotItButton);
            expect(toggleLogoutSuccessModal).toBeCalledWith(false);
        });
    });

    describe('Visibility Logic', () => {
        it('should not render the component if is_logout_success_modal_visible is false', () => {
            const store = mockStore({
                ui: {
                    is_logout_success_modal_visible: false,
                    is_mobile: false,
                },
            });
            renderComponent(store);
            expect(screen.queryByText(modalHeading)).not.toBeInTheDocument();
            expect(screen.queryByText(modalMessage)).not.toBeInTheDocument();
            expect(screen.queryByRole('button', { name: gotItButtonName })).not.toBeInTheDocument();
        });
    });
});
