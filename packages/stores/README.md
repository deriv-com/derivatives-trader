# @deriv/stores

A comprehensive MobX-based state management package providing centralized stores, React context integration, and persistent storage capabilities for Derivatives Trader applications.

## Overview

The `@deriv/stores` package provides a robust state management solution built on MobX, offering React context integration, persistent storage, and a unified store architecture. It serves as the bridge between core application stores and package-specific state management, with built-in support for feature flags and store persistence.

## Key Features

- **MobX Integration**: Full MobX reactive state management with observables and actions
- **React Context**: Seamless React integration with context providers and hooks
- **Persistent Storage**: Automatic localStorage persistence with hydration support
- **Store Architecture**: Extensible base store class for consistent store patterns
- **Type Safety**: Comprehensive TypeScript support with detailed type definitions
- **Testing Support**: Mock store capabilities for testing environments

## Architecture

### Core Components

- **BaseStore**: Foundation class for all stores with persistence capabilities
- **StoreProvider**: React context provider for store access
- **useStore**: React hook for accessing stores throughout the application
- **FeatureFlagsStore**: Specialized store for managing feature flags
- **Store Context**: React context for store dependency injection

### Store Integration

The package integrates with core application stores from `@deriv/core`:

- **Client Store**: User authentication and account management
- **Common Store**: Shared application state and utilities
- **UI Store**: User interface state and modal management
- **Portfolio Store**: Trading portfolio and positions management
- **Contract Trade Store**: Active contract and trading state
- **Notification Store**: Application notifications and messages

## Usage

### Setting Up Store Provider

Wrap your application with the `StoreProvider` to enable store access:

```tsx
import { StoreProvider } from '@deriv/stores';
import { coreStores } from '@deriv/core';

function App() {
    return <StoreProvider store={coreStores}>{/* Your application components */}</StoreProvider>;
}
```

### Using Stores in Components

Access stores using the `useStore` hook:

```tsx
import { observer } from '@deriv/stores';
import { useStore } from '@deriv/stores';

const MyComponent = observer(() => {
    const { client, ui, portfolio, feature_flags } = useStore();

    return (
        <div>
            {client.is_logged_in && <p>Welcome, {client.loginid}</p>}
            <p>Theme: {ui.is_dark_mode_on ? 'Dark' : 'Light'}</p>
            <p>Active Positions: {portfolio.active_positions_count}</p>
        </div>
    );
});
```

### Creating Custom Stores

Extend the `BaseStore` class for persistent stores:

```tsx
import { BaseStore } from '@deriv/stores';

interface UserPreferences {
    theme: 'light' | 'dark';
    language: string;
    notifications_enabled: boolean;
}

class UserPreferencesStore extends BaseStore<UserPreferences> {
    constructor() {
        super('UserPreferencesStore', () => {
            // Set default values on first load
            if (!this.data) {
                this.update({
                    theme: 'light',
                    language: 'en',
                    notifications_enabled: true,
                });
            }
        });
    }

    setTheme(theme: 'light' | 'dark') {
        this.update(prev => ({ ...prev, theme }));
    }

    setLanguage(language: string) {
        this.update(prev => ({ ...prev, language }));
    }
}
```

## Store Types

### Core Store Types

The package provides comprehensive TypeScript types for all stores:

- **TClientStore**: User authentication and account management
- **TCommonStore**: Shared application state
- **TUiStore**: UI state and modal management
- **TPortfolioStore**: Trading portfolio management
- **TContractTradeStore**: Contract trading state
- **TNotificationStore**: Notification management

### Portfolio Management

```tsx
const PortfolioComponent = observer(() => {
    const { portfolio } = useStore();

    return (
        <div>
            <h3>Active Positions ({portfolio.active_positions_count})</h3>
            {portfolio.active_positions.map(position => (
                <div key={position.contract_info.contract_id}>
                    <p>Symbol: {position.display_name}</p>
                    <p>P&L: {position.profit_loss}</p>
                    <button onClick={() => portfolio.onClickSell(position.contract_info.contract_id)}>Sell</button>
                </div>
            ))}
        </div>
    );
});
```

### UI State Management

```tsx
const UIComponent = observer(() => {
    const { ui } = useStore();

    const handleToggleTheme = () => {
        ui.setDarkMode(!ui.is_dark_mode_on);
    };

    const handleShowModal = () => {
        ui.toggleResetPasswordModal(true);
    };

    return (
        <div>
            <button onClick={handleToggleTheme}>Switch to {ui.is_dark_mode_on ? 'Light' : 'Dark'} Mode</button>
            <button onClick={handleShowModal}>Reset Password</button>
        </div>
    );
});
```

## Development

### Installation

This package is part of the derivatives-trader monorepo and is installed automatically when you install the project dependencies.

```bash
npm run bootstrap
```

### Testing

The package provides mock store capabilities for testing:

```tsx
import { mockStore } from '@deriv/stores';

// Use in tests
const TestComponent = () => (
    <StoreProvider store={mockStore}>
        <ComponentUnderTest />
    </StoreProvider>
);
```

Run tests:

```bash
npm test packages/stores
```

### Building

```bash
npm run build
```

## Store Persistence

### Automatic Persistence

Stores extending `BaseStore` automatically persist their data to localStorage:

- **Hydration**: Automatic data restoration on application load
- **Synchronization**: Real-time persistence of store updates
- **Error Handling**: Graceful handling of storage errors
- **Cleanup**: Proper cleanup on store unmount

### Storage Configuration

```tsx
class MyStore extends BaseStore<MyData> {
    constructor() {
        super('MyStoreName', () => {
            // Hydration callback - called after data is restored
            console.log('Store hydrated with data:', this.data);
        });
    }
}
```

## Performance Considerations

- **Selective Observation**: Use `observer` only on components that need reactivity
- **Store Separation**: Keep stores focused and avoid large monolithic stores
- **Computed Values**: Use MobX computed values for derived state
- **Action Batching**: Batch related updates in single actions

## Contributing

When contributing to this package:

1. **Follow MobX Patterns**: Use proper observables, actions, and computed values
2. **Maintain Type Safety**: Ensure all stores have comprehensive TypeScript types
3. **Test Store Logic**: Write unit tests for store actions and computed values
4. **Document Store APIs**: Add clear documentation for store methods
5. **Handle Persistence**: Consider persistence implications for new stores
6. **Update Types**: Update the main types file when adding new stores
