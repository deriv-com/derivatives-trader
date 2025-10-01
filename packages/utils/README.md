# @deriv/utils

A lightweight utility library providing essential helper functions for account management, storage operations, and common application utilities.

## Overview

The `@deriv/utils` package provides a focused collection of utility functions specifically designed for Deriv applications. It includes essential helpers for account management, localStorage operations, authentication token handling, chat integration, logging, and date/time utilities. This package serves as a lightweight alternative to the more comprehensive `@deriv/shared` package, focusing on core utilities needed across multiple applications.

## Key Features

- **Account Management**: Utilities for handling user accounts and authentication tokens
- **Storage Operations**: Safe localStorage access with JSON parsing capabilities
- **Chat Integration**: Intercom chat management utilities
- **Error Logging**: TrackJS integration for error tracking and logging
- **Date/Time Utilities**: Moment.js integration with UTC handling
- **URL Parsing**: External link detection and URL validation
- **Type Safety**: Full TypeScript support with proper type definitions

## Architecture

The package follows a simple, functional architecture with individual utility modules:

```
src/
├── index.ts                           # Main exports
├── getAccountsFromLocalStorage.ts     # Account list retrieval
├── getAccountListWithAuthToken.ts     # Account list with tokens
├── getActiveLoginIDFromLocalStorage.ts # Active login ID retrieval
├── getLocalStorage.ts                 # Safe localStorage operations
├── getToken.ts                        # Authentication token utilities
├── chat.ts                           # Intercom chat integration
├── logging.ts                        # Error logging with TrackJS
├── moment.ts                         # Date/time utilities
└── parse-url.ts                      # URL parsing utilities
```

## Usage/Development

### Installation

This package is part of the derivatives-trader monorepo:

```bash
npm run bootstrap
```

### Building

```bash
npm run build
```

### Testing

```bash
npm run test:eslint
```

## Account Management Utilities

### getAccountsFromLocalStorage

Retrieves the complete accounts list from localStorage with proper type safety:

```typescript
import { getAccountsFromLocalStorage } from '@deriv/utils';

const accounts = getAccountsFromLocalStorage();
// Returns: TLocalStorageAccountsList | undefined
```

### getToken

Gets the authentication token for a specific login ID:

```typescript
import { getToken } from '@deriv/utils';

const token = getToken('CR1234567');
// Returns: string | undefined
```

### getActiveLoginIDFromLocalStorage

Retrieves the currently active login ID:

```typescript
import { getActiveLoginIDFromLocalStorage } from '@deriv/utils';

const activeLoginId = getActiveLoginIDFromLocalStorage();
// Returns: string | undefined
```

## Storage Utilities

### safeParse

Safely parses JSON strings with fallback to original string:

```typescript
import { safeParse } from '@deriv/utils';

const data = safeParse('{"key": "value"}');
// Returns: object | string
```

### getLocalStorage (Deprecated)

⚠️ **Deprecated**: Use `LocalStorageUtils.getValue` from `@deriv-com/utils` instead.

```typescript
import { getLocalStorage } from '@deriv/utils';

const value = getLocalStorage('key');
// Returns: any | null
```

## Chat Integration

### Chat

Intercom chat management utilities:

```typescript
import { Chat } from '@deriv/utils';

// Open chat widget
Chat.open();

// Close chat widget
Chat.close();

// Clear chat session
Chat.clear();
```

## Error Logging

### logError

TrackJS integration for error tracking:

```typescript
import { logError } from '@deriv/utils';

logError('Something went wrong', {
    userId: 'CR1234567',
    action: 'trade_execution',
    additionalData: { symbol: 'EURUSD' },
});
```

## Date/Time Utilities

### toMoment

Converts various input types to UTC Moment objects:

```typescript
import { toMoment } from '@deriv/utils';

// From epoch timestamp
const momentFromEpoch = toMoment(1640995200);

// From date string
const momentFromString = toMoment('2022-01-01');

// Current time if no input
const momentNow = toMoment();

// All return moment.Moment objects in UTC
```

## URL Utilities

### isExternalLink

Checks if a URL is external (http, https, or mailto):

```typescript
import { isExternalLink } from '@deriv/utils';

const isExternal = isExternalLink('https://example.com');
// Returns: boolean
```

## Development Guidelines

### Code Organization

- **Single Responsibility**: Each utility module has a focused, single purpose
- **Type Safety**: All functions include proper TypeScript type definitions
- **Error Handling**: Graceful error handling with fallback values
- **Performance**: Lightweight implementations with minimal dependencies

### Dependencies Management

- **Minimal Dependencies**: Only essential external dependencies (moment, lodash utilities, bowser)
- **Tree Shaking**: All utilities support tree shaking for optimal bundle sizes
- **No Side Effects**: Pure functions without global state modifications

## Contributing

When contributing to this package:

1. **Maintain Simplicity**: Keep utilities focused and lightweight
2. **Type Safety**: Ensure all functions have proper TypeScript types
3. **Error Handling**: Include appropriate error handling and fallbacks
4. **Documentation**: Add clear JSDoc comments for all public functions
5. **Testing**: Add comprehensive tests for new utilities
