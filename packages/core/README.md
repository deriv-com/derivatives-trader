# @deriv/core

The main application package for Deriv's trading platform, serving as the central hub that orchestrates all other packages and provides the core functionality.

## Overview

The `@deriv/core` package is the primary application entry point for Deriv's trading platform. It acts as the main orchestrator that brings together all other packages (`@deriv/trader`, `@deriv/components`, `@deriv/shared`, `@deriv/reports`, etc.) into a cohesive trading application. This package contains the main application shell, routing, global state management, and core services.

## Key Features

- **Application Shell**: Main React application structure and routing
- **Global State Management**: MobX stores for application-wide state
- **Module Integration**: Dynamic loading and coordination of feature modules
- **Internationalization**: Multi-language support with `@deriv-com/translations`
- **Theme System**: Dark/light theme support with `@deriv-com/quill-ui`
- **Error Handling**: Comprehensive error boundaries and tracking
- **Analytics Integration**: TrackJS integration for error tracking and analytics

## Architecture

### Core Components

- **App Shell**: Main application container and layout (`AppContent.tsx`)
- **Routing System**: React Router-based navigation with lazy loading
- **Store Management**: MobX stores for global state management
- **Module Integration**: Dynamic loading of trader and reports modules
- **Service Layer**: API integrations and external service management

### Application Structure

```
src/
├── App/                    # Main application components
│   ├── Components/         # Global UI components
│   │   ├── Elements/       # Core UI elements
│   │   └── Layout/         # Layout components
│   ├── Constants/          # Application constants
│   │   └── routes-config.js # Route configuration
│   └── Containers/         # Container components
│       ├── Layout/         # Layout containers
│       ├── Modals/         # Modal components
│       └── Routes/         # Route containers
├── Assets/                 # Static assets
├── Constants/              # Global constants
├── Modules/                # Feature modules
├── Services/               # External service integrations
├── Stores/                 # MobX stores
│   ├── client-store.js     # Client/user state
│   ├── common-store.js     # Common application state
│   ├── ui-store.js         # UI state management
│   ├── portfolio-store.js  # Portfolio management
│   └── notification-store.js # Notifications
├── Utils/                  # Utility functions
└── sass/                   # Global styles
```

## Development

### Installation

This package is part of the Deriv monorepo and is installed automatically when you install the project dependencies.

```bash
npm run bootstrap
```

### Running the Application

Start the development server:

```bash
npm run serve core
```

This will:

- Start the webpack dev server on `https://localhost:8443`
- Enable hot reloading for development
- Watch for file changes and rebuild automatically

### Building the Package

```bash
npm run build
```

### Testing

Run ESLint:

```bash
npm run test:eslint
```

Run all tests from the root:

```bash
npm test packages/core
```

## Routing

The application uses React Router with the following main routes:

- **`/`** - Trading home page (handled by `@deriv/trader`)
- **`/reports`** - Trading reports (handled by `@deriv/reports`)
    - `/reports/positions` - Open positions (default)
    - `/reports/profit` - Trade table
    - `/reports/statement` - Statement
- **`/contract`** - Contract details page (handled by `@deriv/trader`)

### Route Configuration

Routes are configured in `src/App/Constants/routes-config.js` with:

- Lazy loading of route components for performance
- Dynamic module loading
- Icon and title configuration for navigation
- Nested route support for reports section

```javascript
// Example route configuration
{
    path: routes.reports,
    component: Reports,
    getTitle: () => localize('Reports'),
    icon_component: <LegacyReportsIcon />,
    routes: [
        {
            path: routes.positions,
            component: Reports,
            getTitle: () => localize('Open positions'),
            default: true,
        },
        // ... other nested routes
    ],
}
```

## State Management

The application uses MobX for state management with the following key stores:

### Core Stores

- **Client Store** (`client-store.js`): User authentication, account management, and session handling
- **Common Store** (`common-store.js`): Shared application state, language, and server time
- **UI Store** (`ui-store.js`): UI state, theme preferences, and modal management
- **Portfolio Store** (`portfolio-store.js`): Trading portfolio and positions management
- **Notification Store** (`notification-store.js`): Application notifications and messages
- **Contract Store** (`contract-store.js`): Contract-related state management
- **Active Symbols Store** (`active-symbols-store.js`): Trading symbols and market data

### Store Usage

```javascript
// Example store usage with observer
import { observer, useStore } from '@deriv/stores';

const MyComponent = observer(() => {
    const { client, ui, common } = useStore();

    return (
        <div>
            {client.is_logged_in && <p>Welcome, {client.loginid}</p>}
            <p>Current language: {common.current_language}</p>
            <p>Theme: {ui.is_dark_mode_on ? 'Dark' : 'Light'}</p>
        </div>
    );
});
```

## Module Integration

The core package dynamically loads feature modules:

### Trader Module

```javascript
const Trader = React.lazy(() => import('@deriv/trader'));
```

### Reports Module

```javascript
const Reports = React.lazy(() => import('@deriv/reports'));
```

These modules are loaded on-demand to optimize initial bundle size and improve performance.

## Services and Integrations

### API Integration

- Uses `@deriv/api` for API client functionality
- WebSocket connections managed through shared services

### Theme Integration

```javascript
import { ThemeProvider } from '@deriv-com/quill-ui';

// Theme provider wraps the entire application
<ThemeProvider theme={is_dark_mode_on ? 'dark' : 'light'}>{/* Application content */}</ThemeProvider>;
```

## Build Configuration

### Webpack Configuration

The build process uses a sophisticated webpack configuration (`build/webpack.config.js`) with:

- **Code Splitting**: Automatic chunk splitting for optimal loading
- **Hot Reloading**: Development server with hot module replacement
- **Asset Optimization**: Minification and compression for production
- **Source Maps**: Development and production source map generation
- **HTTPS Development**: Secure development server on port 8443

### Performance Optimizations

- Bundle splitting with size limits (max 2.5MB chunks)
- Vendor code separation
- Lazy loading of route components
- Asset caching strategies

### Environment Configuration

The application supports different deployment environments through build-time configuration:

- Development: Local development with hot reloading
- Staging: Pre-production testing environment
- Production: Live production deployment

## Error Handling

### Error Boundaries

The application implements comprehensive error boundaries:

```javascript
<ErrorBoundary root_store={store}>
    <AppContents>
        <Routes />
    </AppContents>
</ErrorBoundary>
```

### Error Tracking

- TrackJS integration for error monitoring

## Development Guidelines

### Adding New Features

1. **Create Components**: Add new components in appropriate directories
2. **Update Routing**: Modify `routes-config.js` for new routes
3. **State Management**: Update or create MobX stores as needed
4. **Testing**: Add unit tests and integration tests
5. **Documentation**: Update relevant documentation

### Code Standards

- Use TypeScript for new components where possible
- Follow ESLint configuration rules
- Implement proper error boundaries
- Use MobX observer pattern for reactive components
- Add proper accessibility attributes

### Performance Considerations

- Use React.lazy for code splitting
- Implement proper loading states
- Optimize bundle sizes
- Use memoization for expensive computations

## Troubleshooting

### Common Issues

**Icons Missing**

```bash
npm run build:all
```

## Contributing

When contributing to this package:

1. Follow the established architecture patterns
2. Update relevant documentation
3. Add proper error handling and loading states
4. Ensure responsive design compatibility
5. Test across supported browsers
6. Follow the coding standards and ESLint rules
7. Update tests and add new ones as needed

## Related Documentation

- [Modules Documentation](docs/Modules/README.md) - Implementation guides and scaffolding help
- [API Documentation](../api/README.md) - API client usage
- [Components Documentation](../components/README.md) - UI component library
- [Shared Utilities](../shared/README.md) - Shared utilities and helpers
- [Trader Module](../trader/README.md) - Trading interface documentation
- [Reports Module](../reports/README.md) - Trade reports documentation
