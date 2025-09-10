import { render, screen } from '@testing-library/react';
import Header from '../header';

// eslint-disable-next-line react/display-name
jest.mock('../header-legacy', () => () => <div data-testid='dt_default_header'>MockedLegacyHeader</div>);

describe('Header', () => {
    const renderComponent = () => render(<Header />);

    it('should render the "HeaderLegacy"', async () => {
        renderComponent();
        expect(await screen.findByTestId('dt_default_header')).toBeInTheDocument();
        expect(screen.getByText('MockedLegacyHeader')).toBeInTheDocument();
    });
});
