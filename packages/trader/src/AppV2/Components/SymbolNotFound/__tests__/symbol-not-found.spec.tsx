import React from 'react';

import { render, screen } from '@testing-library/react';

import SymbolNotFound from '../symbol-not-found';

describe('<SymbolNotFound />', () => {
    it('should show correct text', () => {
        render(<SymbolNotFound searchTerm='test' />);
        expect(screen.getByText('No results for test')).toBeInTheDocument();
        expect(screen.getByText('Try searching for something else.')).toBeInTheDocument();
    });
});
