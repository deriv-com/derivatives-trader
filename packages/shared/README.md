# @deriv/shared

A comprehensive utility library providing shared functions, constants, types, and services used across the Derivatives Trader applications.

## Overview

The `@deriv/shared` package serves as the foundational utility library for the entire Derivative Trader ecosystem. It contains reusable functions, constants, type definitions, validation utilities, and common services that are shared across multiple packages including `@deriv/core`, `@deriv/trader`, `@deriv/reports`, and `@deriv/components`.

## Key Features

- **Utility Functions**: Comprehensive collection of helper functions for common operations
- **Constants & Configuration**: Centralized constants and configuration values
- **Validation**: Advanced form validation utilities and declarative validation rules
- **Date & Time**: Date manipulation and formatting utilities
- **Browser Detection**: Device and browser detection utilities ⚠️ **DEPRECATED**
- **Storage Management**: LocalStorage and SessionStorage utilities
- **URL & Routing**: URL manipulation and routing helpers
- **Contract Utilities**: Trading contract-specific helper functions
- **Analytics Integration**: Advanced analytics tracking with caching and error monitoring
- **Shortcode Processing**: Contract shortcode parsing and extraction utilities
- **Type Definitions**: Shared TypeScript types and interfaces

## Usage Examples

### Basic Usage

```javascript
// Import specific utilities
import { toMoment, formatMoney, isMobile, LocalStore, routes } from '@deriv/shared';

// Use the utilities
const formattedDate = toMoment('2023-01-01').format('DD MMM YYYY');
const formattedAmount = formatMoney('USD', 1000, true);
const isMobileDevice = isMobile();
```

### Storage Operations

```javascript
import { LocalStore, SessionStore } from '@deriv/shared';

// LocalStorage operations
LocalStore.set('user_preference', 'dark_mode');
const preference = LocalStore.get('user_preference');
LocalStore.setObject('user_data', { name: 'John', age: 30 });
const userData = LocalStore.getObject('user_data');
```

### Route Constants

```javascript
import { routes } from '@deriv/shared';

// Available routes
console.log(routes.trade); // '/trade'
console.log(routes.reports); // '/reports'
console.log(routes.positions); // '/reports/positions'
```

## Development

### Installation

This package is part of the derivatives-trader monorepo and is installed automatically when you install the project dependencies.

```bash
npm run bootstrap
```

### Testing

Run ESLint:

```bash
npm run test:eslint
```

Run all tests from the root:

```bash
npm test packages/shared
```

### Project Structure

```
src/
├── index.ts                # Main export file
├── services/              # Service integrations
│   └── ws-methods.ts      # WebSocket service methods
└── utils/                 # Utility functions
    ├── analytics/         # Analytics utilities
    ├── array/            # Array manipulation utilities
    ├── browser/          # Browser detection utilities
    ├── config/           # Configuration utilities
    ├── constants/        # Application constants
    ├── contract/         # Contract-related utilities
    ├── currency/         # Currency utilities
    ├── date/             # Date and time utilities
    ├── helpers/          # General helper functions
    ├── hooks/            # Custom React hooks
    ├── location/         # Location utilities
    ├── route/            # Routing utilities
    ├── storage/          # Storage utilities
    ├── string/           # String utilities
    ├── url/              # URL utilities
    ├── validation/       # Validation utilities
    └── validator/        # Validator functions
```

## Performance Considerations

- **Tree Shaking**: All utilities support tree shaking for optimal bundle sizes
- **Lazy Loading**: Heavy utilities are designed for lazy loading
- **Memoization**: Expensive operations are memoized where appropriate
- **Minimal Dependencies**: External dependencies are kept to a minimum

## Contributing

When contributing to this package:

1. **Add Comprehensive Tests**: All utilities should have corresponding tests
2. **Maintain TypeScript Types**: Ensure all functions have proper type definitions
3. **Follow Naming Conventions**: Use clear, descriptive function names
4. **Document Functions**: Add JSDoc comments for complex utilities
5. **Avoid Dependencies**: Keep external dependencies minimal
6. **Ensure Compatibility**: Test across different browsers and devices
7. **Update Documentation**: Update this README when adding new utilities
