import React from 'react';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ContractError from '../contract-error';

const mocked_props = {
    onClickClose: jest.fn(),
};
const test_text = 'test_text';
jest.mock('@deriv/quill-icons', () => ({
    LegacyClose2pxIcon: jest.fn(() => 'MockedIcon'),
}));

describe('ContractError', () => {
    it('should not render component if message is falsy', () => {
        const { container } = render(<ContractError {...mocked_props} />);

        expect(container).toBeEmptyDOMElement();
    });
    it('should render component with specific text inside if it was passed as a message in the props', () => {
        render(<ContractError {...mocked_props} message={test_text} />);

        expect(screen.getByText(test_text)).toBeInTheDocument();
    });
    it('should call the function if the close button was clicked', async () => {
        render(<ContractError {...mocked_props} message={test_text} />);
        const closeButton = screen.getByText('MockedIcon');
        await userEvent.click(closeButton);

        expect(mocked_props.onClickClose).toBeCalled();
    });
});
