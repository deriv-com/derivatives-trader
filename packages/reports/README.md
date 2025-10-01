# @deriv/reports

A comprehensive trading reports module for Deriv's trading platform, providing detailed views of trading history, open positions, and account statements.

## Overview

The `@deriv/reports` package is a React-based module that handles all trading-related reporting functionality within the Deriv ecosystem. It provides users with detailed insights into their trading activities through three main report types: Open Positions, Trade Table (Profit/Loss), and Account Statement.

## Key Features

- **Open Positions**: Real-time view of active trading positions
- **Account Statement**: Detailed account transaction history
- **Responsive Design**: Optimized for both desktop and mobile devices
- **Data Export**: Export capabilities for reports
- **Real-time Updates**: Live data synchronization with trading activities
- **Advanced Filtering**: Date range, contract type, and symbol filtering
- **Pagination**: Efficient handling of large datasets

## Architecture

### Main Components

- **Reports Container**: Main routing and layout management
- **Open Positions**: Active positions with real-time P&L updates
- **Profit Table**: Historical trade data with comprehensive filtering
- **Statement**: Account transaction history and balance changes
- **Mobile Renderers**: Optimized mobile view components

### Project Structure

```
src/
├── app.tsx                 # Main application entry point
├── reports-providers.tsx   # Context providers and store integration
├── Components/             # Reusable UI components
│   ├── Modals/            # Modal components
│   └── market-symbol-icon-row.tsx # Symbol display components
├── Constants/              # Application constants
│   └── data-table-constants.tsx # Table configuration
├── Containers/             # Main container components
│   ├── reports.tsx        # Main reports container
│   ├── open-positions.tsx # Open positions view
│   ├── profit-table.tsx   # Trade history view
│   ├── statement.tsx      # Account statement view
│   └── routes.tsx         # Route configuration
├── Helpers/               # Utility functions
├── Modules/               # Feature modules
├── Stores/                # MobX stores for state management
├── Types/                 # TypeScript type definitions
└── sass/                  # Styling files
```

## Installation

This package is part of the Deriv monorepo and is installed automatically when you install the project dependencies.

```bash
npm run bootstrap
```

## Development

### Running the Package

The reports package is loaded dynamically by the core application. To develop with reports:

```bash
# From the root of the monorepo
npm run serve reports
```

The reports module will be available at `/reports` route.

### Building the Package

```bash
npm run build
```

### Build Configuration

The package uses a sophisticated webpack configuration with:

- **Code Splitting**: Automatic chunking for optimal loading
- **Dynamic Imports**: Lazy loading of report components
- **CSS Optimization**: SCSS compilation with PostCSS processing
- **TypeScript Support**: Full TypeScript compilation
- **Asset Optimization**: SVG and image optimization
- **Development Server**: Hot module replacement for development

### Testing

Run ESLint:

```bash
npm run test:eslint
```

Run all tests from the root:

```bash
npm test packages/reports
```

## Report Types

### Open Positions

Displays currently active trading positions with:

- **Real-time P&L**: Live profit/loss calculations
- **Position Details**: Entry price, current price, stake amount
- **Contract Information**: Contract type, symbol, expiry time
- **Action Buttons**: Sell/close position capabilities (where applicable)

**Key Features:**

- Auto-refresh every few seconds
- Color-coded profit/loss indicators
- Mobile-optimized card layout
- Quick action buttons for position management

### Trade Table (Profit/Loss)

Comprehensive view of completed trades with:

- **Trade History**: All completed contracts and their outcomes
- **Filtering Options**: Date range, contract type, symbol filters
- **Sorting Capabilities**: Sort by date, profit/loss, stake, etc.
- **Detailed Information**: Entry/exit prices, duration, fees

**Data Columns:**

- Reference ID
- Contract type and symbol
- Entry and exit times
- Stake amount
- Payout/Profit
- Action buttons (view contract details)

### Account Statement

Detailed transaction history including:

- **Balance Changes**: All account balance modifications
- **Transaction Types**: Deposits, withdrawals, trading activity
- **Reference Numbers**: Transaction IDs for tracking
- **Date Filtering**: Customizable date range selection

**Transaction Categories:**

- Trading activity (buy/sell contracts)
- Deposits and withdrawals
- Adjustments and corrections
- Fees and charges

## Data Management

### API Integration

The reports module integrates with Deriv's API through Websocket connections:

```javascript
// Example API calls for reports data
import { WS } from '@deriv/shared';

// Fetch open positions
const getOpenPositions = () => {
    return WS.portfolio();
};

// Fetch profit table data
const getProfitTable = (date_from, date_to) => {
    return WS.profitTable({
        date_from,
        date_to,
        description: 1,
        limit: 50,
        offset: 0,
    });
};

// Fetch statement data
const getStatement = (date_from, date_to) => {
    return WS.statement({
        date_from,
        date_to,
        description: 1,
        limit: 50,
        offset: 0,
    });
};
```

### State Management

Reports use MobX stores for state management:

```javascript
// Example store usage
import { observer } from 'mobx-react-lite';
import { useStore } from '@deriv/stores';

const ReportsComponent = observer(() => {
    const { portfolio, client } = useStore();

    return (
        <div>
            {portfolio.positions.map(position => (
                <PositionCard key={position.id} position={position} currency={client.currency} />
            ))}
        </div>
    );
});
```

## Responsive Design

### Desktop Layout

- Full-width data tables with comprehensive column sets
- Advanced filtering sidebar
- Detailed modal views for contract information
- Bulk action capabilities

### Mobile Layout

- Card-based layout for easy touch interaction
- Swipe gestures for additional actions
- Condensed information display
- Bottom sheet modals for details

### Tablet Layout

- Hybrid approach combining desktop and mobile features
- Optimized column layouts
- Touch-friendly controls

## Data Export

Reports support data export functionality:

```javascript
// Export functionality
const exportData = (data, format = 'csv') => {
    // Implementation for exporting report data
    // Supports CSV and other formats
};
```

## Performance Optimization

### Data Loading

- **Pagination**: Efficient loading of large datasets
- **Virtual Scrolling**: For handling thousands of records
- **Lazy Loading**: Load data only when needed
- **Caching**: Smart caching of frequently accessed data

### Real-time Updates

- **WebSocket Integration**: Live updates for open positions

## Filtering and Search

### Advanced Filtering

```javascript
// Filter configuration example
const filterConfig = {
    date_range: {
        from: '2023-01-01',
        to: '2023-12-31',
    },
    contract_types: ['CALL', 'PUT', 'MULTUP', 'MULTDOWN'],
    symbols: ['R_50', 'R_100', 'EURUSD'],
    profit_range: {
        min: -1000,
        max: 1000,
    },
};
```

### Search Functionality

- **Quick Search**: Search by reference ID or symbol
- **Advanced Search**: Multiple criteria search
- **Search History**: Recently searched terms

## Integration with Core

The reports module integrates seamlessly with the core application:

```javascript
// Route configuration in core
{
    path: routes.reports,
    component: Reports,
    getTitle: () => localize('Reports'),
    routes: [
        {
            path: routes.positions,
            component: Reports,
            getTitle: () => localize('Open positions'),
            default: true,
        },
        {
            path: routes.profit,
            component: Reports,
            getTitle: () => localize('Trade table'),
        },
        {
            path: routes.statement,
            component: Reports,
            getTitle: () => localize('Statement'),
        },
    ],
}
```

## Development Guidelines

### Adding New Report Types

1. **Create Container Component**: Add new container in `src/Containers/`
2. **Update Routes**: Modify `routes.tsx` to include new route
3. **Add Store Logic**: Create or update relevant stores
4. **Implement API Integration**: Add API calls for data fetching
5. **Create Mobile Renderer**: Add mobile-optimized component
6. **Add Tests**: Include unit tests for new functionality

### Code Standards

- Use TypeScript for all new components
- Follow MobX patterns for state management
- Implement responsive design for all components
- Add proper loading states and error handling
- Include accessibility attributes
- Write comprehensive unit tests

### Performance Considerations

- Implement virtual scrolling for large datasets
- Use React.memo for expensive components
- Optimize API calls with proper caching
- Implement proper loading states
- Use debouncing for search and filter inputs

## Contributing

When contributing to this package:

1. Follow the established component patterns
2. Ensure responsive design compatibility
3. Add proper TypeScript types
4. Include comprehensive tests
5. Update documentation as needed
6. Follow accessibility guidelines
7. Optimize for performance
