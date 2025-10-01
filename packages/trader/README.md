# @deriv/trader

A comprehensive trading platform application providing both desktop and mobile-optimized interfaces for derivatives trading.

## Overview

The `@deriv/trader` package is the main trading application for Deriv's derivatives platform. It provides a complete trading experience with real-time market data, advanced charting, contract management, and portfolio tracking. The package features a dual-architecture approach with V1 (desktop-focused) and V2 (mobile-first) interfaces, supporting multiple contract types including Multipliers, Accumulators, Turbos, and Vanilla Options.

## Key Features

- **Dual Interface Architecture**: V1 for desktop users, V2 for mobile-optimized experience
- **Real-time Trading**: Live market data, real-time proposals, and instant trade execution
- **Advanced Charting**: Integration with SmartCharts for technical analysis
- **Contract Management**: Support for multiple contract types with specialized interfaces
- **Portfolio Management**: Real-time position tracking and P&L monitoring
- **Risk Management**: Stop Loss, Take Profit, and Deal Cancellation features
- **Mobile-First V2**: Swipeable interfaces, touch-optimized controls, and responsive design
- **State Management**: MobX-based reactive state management with persistence
- **Analytics Integration**: Comprehensive tracking and user behavior analytics

## Architecture

### V1 (Desktop Interface)

- **Traditional Layout**: Sidebar trading form with full-screen chart
- **Advanced Features**: Complex trading parameters and professional tools
- **Chart Integration**: Full SmartCharts integration with technical indicators
- **Multi-window Support**: Positions drawer and modal management

### V2 (Mobile Interface)

- **Mobile-First Design**: Touch-optimized swipeable interfaces
- **Simplified UX**: Streamlined trading flow for mobile users
- **Bottom Navigation**: Easy thumb-reach navigation patterns
- **Gesture Support**: Swipe actions for contract management
- **Responsive Components**: Adaptive layouts for different screen sizes

## Usage/Development

### Installation

This package is part of the derivatives-trader monorepo:

```bash
npm run bootstrap
```

### Development Server

```bash
npm run serve trader
```

### Building

```bash
npm run build
```

### Testing

```bash
npm run test:eslint
```

## State Management

### TradeStore (MobX)

- **Reactive State**: Observable trading parameters
- **Proposal Management**: Real-time proposal subscriptions
- **Validation System**: Comprehensive form validation
- **Persistence**: LocalStorage and SessionStorage integration

### Key Store Features

- **Symbol Management**: Active symbols and market status
- **Contract Configuration**: Dynamic contract type handling
- **Barrier Calculations**: Automatic barrier adjustments
- **Duration Handling**: Flexible duration and expiry management
- **Risk Parameters**: Stop loss, take profit, and cancellation logic

## Components Architecture

### V1 Components

```
App/
├── Components/          # Reusable UI components
├── Containers/          # Container components with business logic
└── Modules/
    ├── Trading/         # Main trading interface
    ├── SmartChart/      # Chart integration
    └── Contract/        # Contract-specific components
```

### V2 Components

```
AppV2/
├── Components/          # Mobile-optimized components
│   ├── ContractCard/    # Swipeable contract cards
│   ├── CurrentSpot/     # Real-time price display
│   └── MarketCategory/  # Market selection interface
├── Containers/          # V2 container components
│   ├── Trade/           # Mobile trading interface
│   ├── Positions/       # Portfolio management
│   └── ContractDetails/ # Contract detail views
└── Routes/              # V2 routing configuration
```

## Development Guidelines

### Code Organization

- **Separation of Concerns**: Maintain clear separation between V1 and V2 architectures
- **Mobile-First Approach**: Consider mobile experience in all development decisions
- **Component Reusability**: Create reusable components that work across both interfaces
- **State Management**: Use MobX patterns consistently throughout the application

### Performance Standards

- **Code Splitting**: Implement lazy loading for optimal performance
- **Bundle Optimization**: Keep bundle sizes minimal with proper splitting
- **State Efficiency**: Use selective observation to minimize re-renders
- **API Optimization**: Implement debounced proposals and efficient data fetching

## Contributing

When contributing to this package:

1. **Follow Architecture Patterns**: Maintain separation between V1 and V2 interfaces
2. **Mobile-First Development**: Consider mobile experience in all changes
3. **State Management**: Use MobX patterns consistently with proper observables and actions
4. **Performance Considerations**: Consider bundle size and runtime performance impact
5. **Comprehensive Testing**: Add tests for trading logic, state management, and UI interactions
6. **Documentation**: Update documentation for new features and architectural changes
