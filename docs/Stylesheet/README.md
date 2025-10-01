# Stylesheet Guidelines

**In this document:**

- [General Guidelines](#general-guidelines)
    - [Naming Conventions](#naming-conventions)
    - [Units](#units)
    - [Absolute and relative units](#absolute-and-relative-units)
    - [Converts px to em values](#converts-px-to-em-values)
- [Typography](#typography)
- [Theme](#theme)
- [SVG](#svg)
- [Commenting](#commenting)

## General Guidelines

In order to improve the clarity, quality, and development time it is worth considering the following principles whenever possible:

- [Keep Sass Simple](https://www.sitepoint.com/keep-sass-simple/), which means [KISS (Keep It Simple, Stupid)](https://en.wikipedia.org/wiki/KISS_principle) may override [DRY (Don't Repeat Yourself)](https://en.wikipedia.org/wiki/Don't_repeat_yourself) in some cases
- [Single responsibility selectors](https://en.bem.info/methodology/css/#single-responsibility-principle)

---

## Style Guide

- [Airbnb CSS / Sass Styleguide](https://github.com/airbnb/css/blob/master/README.md) is partially being followed in our code base.

- [CSS with BEM](https://en.bem.info/methodology/css/) is partially being followed in our code base.

- Most styling issues will be caught by [stylelint](https://github.com/stylelint/stylelint/blob/master/README.md), so before pushing your changes remember to run `npm run test:stylelint` to catch and fix any issues that it finds.

- Check below for the rules that are not caught by styling but should be followed.

### Naming Conventions

<a id="naming-conventions-selectors"></a>
**[Selectors:](#naming-conventions-selectors)** Selectors should follow the [BEM Two Dashes style](https://en.bem.info/methodology/naming-convention/#two-dashes-style): `block-name__elem-name--mod-name--mod-val`.

```scss
.button {
}
.button--disabled {
}
```

Remember to follow the [Single responsibility principle](https://en.bem.info/methodology/css/#single-responsibility-principle).

<a id="naming-conventions-variables"></a>
**[Variables:](#naming-conventions-variables)** The project uses an automated color generation system based on `brand.config.json`. Colors are generated using semantic naming conventions:

```scss
// Auto-generated from brand.config.json
$color-primary: #ff444f;
$color-secondary: #85acb0;
$color-success: #4bb4b3;
$color-danger: #ec3f3f;

// Auto-generated variants
$color-primary-light: #ff6b6b;
$color-primary-dark: #e63946;
```

**Modern Color System:**

- Colors are defined in `brand.config.json` and auto-generated using `npm run generate:colors`
- Use CSS custom properties for theme-aware colors: `var(--color-text-primary)`
- Semantic tokens provide meaning: `var(--color-status-success)`, `var(--color-trade-buy)`
- Component tokens for specific UI elements: `var(--color-button-primary-bg)`

**DO NOT** manually edit generated color files. Instead:

1. Update colors in `brand.config.json`
2. Run `npm run generate:colors` to regenerate all color tokens
3. Use the generated CSS custom properties in your styles

---

### Units

<a id="units-flexibility"></a>
**[Flexibility:](#units-flexibility)** If flexibility is needed, for example for font-size, use units such as `rem`, `vh`, `vw`, `fr`, and only use `px` if it's supposed to be a fixed value.

#### Absolute and relative units

- `em` is typically used in padding and margin to maintain the vertical rhythm. If a user resizes the text, the `em` unit will be scaled proportionately. `em` size is always relative to the font-size of the element.

```scss
// For example: `span` with font-size of 14px and padding of 8px.
// The padding in `em` should be `14px/8px * 1em ~ 0.571em`.
span {
    font-size: 1.4em;
    padding: 0.571em;
}
```

- `px` is used to define a fixed value such as for `box-shadow`, `border-radius`, and `border-width`.

#### Modern Unit Usage

Use `rem` for most sizing as it's relative to the root font-size and provides consistent scaling across the application:

```scss
.component {
    font-size: 1.4rem; // 14px equivalent
    padding: 1.6rem; // 16px equivalent
    margin: 0.8rem; // 8px equivalent
}
```

For component-specific spacing that should scale with the component's font-size, use `em`:

```scss
.button {
    font-size: 1.4rem;
    padding: 0.5em 1em; // Scales with button font-size
}
```

---

## Typography

Use the `Text` component from `@deriv/components` for consistent typography across the platform:

```jsx
import { Text } from '@deriv/components';

<Text size='sm' weight='bold' color='prominent'>
    Your text content
</Text>;
```

For typography standards:

- Follow the design system typography scale
- Use semantic text components when available
- Ensure proper contrast ratios for accessibility
- Test typography in both light and dark themes

## Theme

The project uses CSS custom properties for theming with automatic generation from `brand.config.json`. Themes are managed through CSS classes:

```scss
.theme--light {
    // Light theme variables
    --color-text-primary: var(--brand-black);
    --color-surface-primary: var(--brand-white);
}

.theme--dark {
    // Dark theme variables
    --color-text-primary: var(--brand-white);
    --color-surface-primary: var(--brand-black);
}
```

**Theme Best Practices:**

- Use semantic color tokens: `var(--color-text-primary)`, `var(--color-surface-primary)`
- Test all components in both light and dark themes
- Use `var(--color-status-success)` for semantic states
- Leverage component tokens: `var(--color-button-primary-bg)`
- Colors automatically adapt when theme class changes on root element

## SVG

Use icons from `@deriv/quill-icons` for consistent iconography across the platform:

```jsx
import { LabelPairedChevronDownMdRegularIcon } from '@deriv/quill-icons';

<LabelPairedChevronDownMdRegularIcon />;
```

**SVG Best Practices:**

- Always use `@deriv/quill-icons` library for all iconography needs
- Avoid custom SVGs to maintain design system consistency
- Icons automatically adapt to theme changes
- Follow the Quill design system icon naming conventions
- Ensure proper accessibility with appropriate ARIA labels when needed

---

## Commenting

<a id="commenting-explanations"></a>
**[Explanations:](#commenting-explanations)** Feel free to add comments to explain any styling that is confusing.

<a id="commenting-todo"></a>
**[To do:](#commenting-todo)** Use `TODO: ...` comments anywhere that needs consideration or attention in the future.
