import React from 'react';

import { render, screen } from '@testing-library/react';

import LastDigitPointer from '../last-digit-pointer';

jest.mock('@deriv/quill-icons', () => ({
    ...jest.requireActual('@deriv/quill-icons'),
    LegacyTrendUpIcon: jest.fn(() => 'MockedIcon'),
}));

const mocked_props = {
    position: {
        left: 10,
        top: 10,
    },
};

describe('<LastDigitPointer />', () => {
    it('should render Icon if position is defined', () => {
        render(<LastDigitPointer {...mocked_props} />);
        expect(screen.getByText(/mockedicon/i)).toBeInTheDocument();
    });
});
