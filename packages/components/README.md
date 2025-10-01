# @deriv/components

A comprehensive React UI component library for Derivative Trader application, providing reusable, accessible, and customizable components.

## Overview

The `@deriv/components` package is a foundational UI library that provides a wide range of React components used across Deriv applications. It includes everything from basic UI elements like buttons and inputs to complex components like data tables and trading-specific widgets.

### Key Principles

- **Reusability**: Components are designed to be reused across different parts of the application
- **Consistency**: Uniform design language and behavior patterns
- **Performance**: Optimized for performance with minimal re-renders
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Features

- **60+ React Components**: Comprehensive collection of UI components
- **TypeScript Support**: Full TypeScript support with proper type definitions
- **Responsive Design**: Mobile-first responsive components
- **Accessibility**: WCAG compliant components with proper ARIA attributes
- **Theming Support**: Consistent styling with theme support
- **Custom Hooks**: Utility hooks for common UI patterns
- **Trading Components**: Specialized components for trading interfaces
- **Webpack Build System**: Optimized build process for production

## Available Components

### Form Components

- **Button** - Primary, secondary, and tertiary button variants
- **Input** - Text input with validation support
- **InputField** - Input with label and error handling
- **InputWithCheckbox** - Combined input and checkbox component
- **Checkbox** - Customizable checkbox component
- **RadioGroup** - Radio button group component
- **Dropdown** - Dropdown selection component
- **SelectNative** - Native select component
- **ToggleSwitch** - Toggle switch component
- **DatePicker** - Date selection component
- **Calendar** - Full calendar component
- **RelativeDatepicker** - Relative date picker
- **Numpad** - Virtual number pad component

### Layout Components

- **Modal** - Modal dialog component
- **Dialog** - Dialog component
- **MobileDialog** - Mobile-optimized dialog
- **MobileDrawer** - Mobile drawer component
- **Popover** - Popover component with positioning
- **Tooltip** - Tooltip component
- **Tabs** - Tab navigation component
- **VerticalTab** - Vertical tab navigation
- **Collapsible** - Collapsible content component
- **PageOverlay** - Full-page overlay component

### Data Display Components

- **DataTable** - Advanced data table with sorting and filtering
- **DataList** - List component for data display
- **Text** - Typography component with variants
- **Label** - Label component
- **Money** - Currency display component
- **CurrencyBadge** - Currency badge component
- **ContractCard** - Trading contract card
- **PositionsDrawerCard** - Positions drawer card component

### Navigation Components

- **ButtonLink** - Link styled as button
- **RouteWithSubroutes** - Route component with subroutes
- **StaticUrl** - Static URL component

### Feedback Components

- **Loading** - Loading spinner component
- **CircularProgress** - Circular progress indicator
- **LinearProgress** - Linear progress bar
- **ProgressBar** - Progress bar component
- **ProgressSlider** - Progress slider component
- **ProgressSliderMobile** - Mobile progress slider
- **Toast** - Toast notification component
- **SwipeableNotification** - Swipeable notification
- **InformationBanner** - Information banner component

### Utility Components

- **AutoSizer** - Automatic sizing component
- **DesktopWrapper** - Desktop-only wrapper
- **MobileWrapper** - Mobile-only wrapper
- **Div100vhContainer** - 100vh container component
- **FadeWrapper** - Fade animation wrapper
- **SwipeableWrapper** - Swipeable wrapper
- **ThemedScrollbars** - Themed scrollbar component
- **PageError** - Error page component
- **PageErrorContainer** - Error container component
- **UnhandledErrorModal** - Unhandled error modal
- **ErrorModal** - Error modal component

### Trading-Specific Components

- **IconTradeTypes** - Trade type icons
- **TradeTypeIconsMapper** - Trade type icon mapper
- **SymbolIconsMapper** - Symbol icon mapper
- **TickPicker** - Tick selection component
- **TickProgress** - Tick progress indicator
- **RemainingTime** - Remaining time display
- **Counter** - Counter component
- **VideoPlayer** - Video player component

### Advanced Components

- **Autocomplete** - Autocomplete input component
- **FilterDropdown** - Filter dropdown component
- **PopoverMessageCheckbox** - Popover with checkbox message
- **ArrowIndicator** - Arrow direction indicator
- **ButtonToggle** - Toggle button component
- **Clipboard** - Clipboard functionality component
- **UILoader** - UI loading component

## Custom Hooks

The package also provides a collection of custom React hooks:

- **useBlockScroll** - Block page scrolling
- **useConstructor** - Constructor-like hook
- **useCopyToClipboard** - Copy text to clipboard
- **useDebounce** - Debounce values
- **useDeepEffect** - Deep comparison useEffect
- **useDevice** - Device detection
- **useEventListener** - Event listener management
- **useHover** - Hover state detection
- **useInterval** - Interval management
- **useIsomorphicLayoutEffect** - Isomorphic layout effect
- **useOnScroll** - Scroll event handling
- **useOnClickOutside** - Click outside detection
- **useOnLongPress** - Long press detection
- **usePreventIOSZoom** - Prevent iOS zoom
- **usePrevious** - Previous value tracking
- **useSafeState** - Safe state management
- **useStateCallback** - State with callback

## Usage Examples

### Basic Component Usage

```tsx
import { Button, Input, Modal } from '@deriv/components';

const MyComponent = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [inputValue, setInputValue] = useState('');

    return (
        <div>
            <Input
                type='text'
                placeholder='Enter text'
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
            />

            <Button primary onClick={() => setIsModalOpen(true)}>
                Open Modal
            </Button>

            <Modal is_open={isModalOpen} title='Example Modal' onClose={() => setIsModalOpen(false)}>
                <p>Modal content goes here</p>
            </Modal>
        </div>
    );
};
```

### Using Custom Hooks

```tsx
import { useDevice, useDebounce, useCopyToClipboard } from '@deriv/components';

const MyComponent = () => {
    const { isMobile, isDesktop } = useDevice();
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const [copyToClipboard, isCopied] = useCopyToClipboard();

    const handleCopy = () => {
        copyToClipboard('Text to copy');
    };

    return (
        <div>
            {isMobile && <p>Mobile view</p>}
            {isDesktop && <p>Desktop view</p>}

            <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder='Search...' />

            <button onClick={handleCopy}>{isCopied ? 'Copied!' : 'Copy Text'}</button>
        </div>
    );
};
```

### Trading Components

```tsx
import { ContractCard, Money, RemainingTime } from '@deriv/components';

const TradingComponent = () => {
    return (
        <ContractCard
            contract_info={{
                contract_type: 'CALL',
                currency: 'USD',
                buy_price: 10,
                payout: 19.5,
                // ... other contract properties
            }}
            getCardLabels={() => ({
                // Label configuration
            })}
            is_multiplier={false}
            profit_loss={5.5}
            should_show_result_overlay={false}
        >
            <div className='contract-details'>
                <Money amount={10} currency='USD' />
                <RemainingTime end_time={Date.now() + 300000} />
            </div>
        </ContractCard>
    );
};
```

### Data Table Usage

```tsx
import { DataTable } from '@deriv/components';

const TableComponent = () => {
    const columns = [
        {
            title: 'Name',
            col_index: 'name',
            renderCellContent: ({ cell_value }) => cell_value,
        },
        {
            title: 'Amount',
            col_index: 'amount',
            renderCellContent: ({ cell_value }) => <Money amount={cell_value} currency='USD' />,
        },
    ];

    const data = [
        { name: 'Trade 1', amount: 100 },
        { name: 'Trade 2', amount: 250 },
    ];

    return <DataTable columns={columns} data_source={data} keyMapper={row => row.name} />;
};
```

## Development

### Installation

This package is part of the Deriv monorepo and is installed automatically when you install the project dependencies.

```bash
npm run bootstrap
```

### Building

Build the components package:

```bash
npm run build
```

### Testing

Run tests:

```bash
npm test packages/components
```

Run ESLint:

```bash
npm run test:eslint
```

**Note**: The components package automatically updates the application when changes are made during development, so no separate serve command is needed.

### Project Structure

```
components/
├── src/
│   ├── components/          # All UI components
│   │   ├── button/         # Button component
│   │   ├── input/          # Input component
│   │   ├── modal/          # Modal component
│   │   └── ...             # Other components
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── index.ts            # Main export file
├── lib/                    # Built output
├── webpack.config.js       # Webpack configuration
└── package.json           # Package configuration
```

## Contributing

When contributing to this package:

1. Follow the established component patterns and structure
2. Add comprehensive TypeScript types for all props
3. Include proper accessibility attributes (ARIA labels, roles, etc.)
4. Write unit tests for new components
5. Update this README when adding new components
6. Follow the existing naming conventions
7. Ensure responsive design compatibility

### Component Development Guidelines

1. **File Structure**: Each component should have its own directory with:
    - `index.tsx` - Main component file
    - `[component-name].scss` - Styles
    - `__tests__/` - Test files (if applicable)

2. **TypeScript**: All components must be written in TypeScript with proper prop interfaces

3. **Styling**: Use SCSS for styling with BEM methodology

4. **Accessibility**: Ensure all components are accessible with proper ARIA attributes

5. **Testing**: Write unit tests for complex components
