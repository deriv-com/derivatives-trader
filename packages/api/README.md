# @deriv/api

A React hooks-based API client package for Deriv applications, providing a clean interface for interacting with Deriv's WebSocket API using React Query.

## Overview

This package provides a set of React hooks and utilities for making API calls to Deriv's backend services. It's built on top of `@tanstack/react-query` and provides type-safe, efficient data fetching with caching, background updates, and error handling.

## Key Features

- **React Query Integration**: Built on top of React Query for optimal data fetching
- **TypeScript Support**: Full TypeScript support with proper type definitions
- **WebSocket Support**: Real-time data subscriptions via WebSocket connections
- **Caching**: Intelligent caching and background refetching
- **Error Handling**: Comprehensive error handling and retry mechanisms
- **Analytics Integration**: Built-in analytics tracking with `@deriv-com/analytics`
- **Feature Flags**: Support for feature flag management
- **Internationalization**: i18n support with `react-i18next`

## Usage

### Setting up the API Provider

Wrap your application with the `APIProvider` to enable API functionality:

```tsx
import { APIProvider } from '@deriv/api';

function App() {
    return <APIProvider standalone={true}>{/* Your app components */}</APIProvider>;
}
```

**APIProvider Props:**

- `standalone?: boolean` - If set to true, the APIProvider will instantiate its own socket connection. Default is `false`.

### Basic Hooks

#### useQuery

For fetching data:

```tsx
import { useQuery } from '@deriv/api';

function MyComponent() {
    const { data, isLoading, error } = useQuery('balance', {
        payload: { account: 'all' },
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return <div>Balance: {data?.balance?.balance}</div>;
}
```

**useQuery Parameters:**

- `name`: The API endpoint name (e.g., 'balance', 'active_symbols', 'profit_table')
- `options`: Optional object containing:
    - `payload`: Request payload for the API call
    - `options`: React Query options (enabled, refetchInterval, etc.)

#### useMutation

For making mutations (POST, PUT, DELETE operations):

```tsx
import { useMutation } from '@deriv/api';

function MyComponent() {
    const mutation = useMutation('buy');

    const handleBuy = () => {
        mutation.mutate({
            contract_type: 'CALL',
            amount: 10,
            // ... other parameters
        });
    };

    return (
        <button onClick={handleBuy} disabled={mutation.isLoading}>
            {mutation.isLoading ? 'Buying...' : 'Buy'}
        </button>
    );
}
```

#### useSubscription

For real-time data subscriptions:

```tsx
import { useSubscription } from '@deriv/api';

function PriceComponent() {
    const { data, subscribe, unsubscribe, isLoading, isSubscribed, error } = useSubscription('ticks');

    useEffect(() => {
        subscribe({ payload: { ticks: 'R_50' } });
        return () => unsubscribe();
    }, [subscribe, unsubscribe]);

    if (isLoading) return <div>Connecting...</div>;
    if (error) return <div>Error: {error.message}</div>;

    return <div>Current Price: {data?.tick?.quote}</div>;
}
```

**useSubscription Parameters:**

- `name`: The subscribable API endpoint name (e.g., 'ticks', 'proposal_open_contract', 'balance')
- `idle_time`: Optional timeout in milliseconds (default: 5000ms)

**useSubscription Returns:**

- `subscribe(options)`: Function to start subscription
- `unsubscribe()`: Function to stop subscription
- `data`: Latest received data
- `isLoading`: Loading state
- `isSubscribed`: Subscription status
- `isIdle`: Whether subscription is idle
- `error`: Error object if any

### Advanced Hooks

#### useInfiniteQuery

For paginated data:

```tsx
import { useInfiniteQuery } from '@deriv/api';

function TransactionHistory() {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery('statement');

    return (
        <div>
            {data?.pages.map((page, i) => (
                <div key={i}>
                    {page.transactions.map(transaction => (
                        <div key={transaction.id}>{transaction.description}</div>
                    ))}
                </div>
            ))}

            {hasNextPage && (
                <button onClick={fetchNextPage} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? 'Loading more...' : 'Load More'}
                </button>
            )}
        </div>
    );
}
```

#### usePaginatedFetch

For server-side paginated data:

```tsx
import { usePaginatedFetch } from '@deriv/api';

function DataTable() {
    const { data, isLoading, pagination } = usePaginatedFetch('profit_table', {
        limit: 50,
    });

    return (
        <div>
            {/* Render your data table */}
            <Pagination {...pagination} />
        </div>
    );
}
```

### Utility Hooks

#### useInvalidateQuery

For manually invalidating cached queries:

```tsx
import { useInvalidateQuery } from '@deriv/api';

function RefreshButton() {
    const invalidateQuery = useInvalidateQuery();

    const handleRefresh = () => {
        invalidateQuery('balance');
    };

    return <button onClick={handleRefresh}>Refresh Balance</button>;
}
```

### Feature-Specific Hooks

#### useRemoteConfig

For accessing remote configuration:

```tsx
import { useRemoteConfig } from '@deriv/api';

function FeatureComponent() {
    const { data: config } = useRemoteConfig();

    if (config?.new_feature_enabled) {
        return <NewFeature />;
    }

    return <OldFeature />;
}
```

#### useFeatureFlags

For feature flag management:

```tsx
import { useFeatureFlags } from '@deriv/api';

function ConditionalFeature() {
    const { isFeatureEnabled } = useFeatureFlags();

    if (isFeatureEnabled('new_trading_interface')) {
        return <NewTradingInterface />;
    }

    return <LegacyTradingInterface />;
}
```

#### useTrackJS

For error tracking and analytics:

```tsx
import { useTrackJS } from '@deriv/api';

function MyComponent() {
    const { trackError, trackEvent } = useTrackJS();

    const handleAction = () => {
        try {
            // Some action
            trackEvent('user_action', { action: 'button_click' });
        } catch (error) {
            trackError(error);
        }
    };

    return <button onClick={handleAction}>Action</button>;
}
```

## API Reference

### Core Hooks

| Hook                | Description                 | Parameters             | Returns               |
| ------------------- | --------------------------- | ---------------------- | --------------------- |
| `useQuery`          | Fetch data from API         | `(endpoint, options?)` | `QueryResult`         |
| `useMutation`       | Perform mutations           | `(endpoint, options?)` | `MutationResult`      |
| `useSubscription`   | Subscribe to real-time data | `(endpoint, params?)`  | `SubscriptionResult`  |
| `useInfiniteQuery`  | Paginated data fetching     | `(endpoint, options?)` | `InfiniteQueryResult` |
| `usePaginatedFetch` | Server-side pagination      | `(endpoint, options?)` | `PaginatedResult`     |

### Utility Hooks

| Hook                  | Description                  | Parameters             | Returns               |
| --------------------- | ---------------------------- | ---------------------- | --------------------- |
| `useInvalidateQuery`  | Invalidate cached queries    | `()`                   | `(queryKey) => void`  |
| `useRemoteConfig`     | Access remote configuration  | `()`                   | `QueryResult<Config>` |
| `useFeatureFlags`     | Feature flag management      | `()`                   | `FeatureFlagsResult`  |
| `useTrackJS`          | Error tracking and analytics | `()`                   | `TrackingMethods`     |
| `useIntercom`         | Intercom integration         | `()`                   | `IntercomMethods`     |
| `useIsRtl`            | RTL language detection       | `()`                   | `boolean`             |
| `useLocalStorageData` | Local storage utilities      | `(key, defaultValue?)` | `[value, setValue]`   |

## Dependencies

### Core Dependencies

- `@tanstack/react-query`: ^4.28.0 - Data fetching and caching
- `@deriv/deriv-api`: ^1.0.15 - Deriv API client
- `@deriv-com/analytics`: 1.31.6 - Analytics tracking
- `@deriv-com/ui`: 1.36.4 - UI components
- `react`: ^17.0.2 - React framework
- `react-i18next`: ^11.11.0 - Internationalization

### Utility Dependencies

- `dayjs`: ^1.11.11 - Date manipulation
- `js-cookie`: ^2.2.1 - Cookie management
- `usehooks-ts`: ^2.7.0 - TypeScript React hooks

## Development

### Installation

This package is part of the Deriv monorepo and is installed automatically when you install the project dependencies.

```bash
npm run bootstrap
```

### Building

The API package is built as part of the monorepo build process:

```bash
npm run build:all
```

### Running Tests

```bash
npm test packages/api
```

### Type Checking

TypeScript compilation is handled automatically during the build process. The package uses TypeScript 5.0.0 with strict type checking enabled.

## Contributing

When contributing to this package:

1. Ensure all new hooks follow the established patterns
2. Add comprehensive TypeScript types
3. Include unit tests for new functionality
4. Update this README with new features
5. Follow the existing code style and conventions
