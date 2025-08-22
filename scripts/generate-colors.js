#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Color Generation Script
 *
 * This script reads the brand.config.json file and automatically generates:
 * - constants.scss with semantic color variables (color-primary, color-secondary, etc.)
 * - brand.scss with proper brand token mappings
 *
 * Partners only need to modify colors in brand.config.json
 */

// Helper function to validate hex colors
function isValidHexColor(color) {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

// Helper function to lighten/darken colors (simple approximation)
function adjustColor(hex, percentage, lighten = true) {
    // Remove # if present
    // eslint-disable-next-line no-param-reassign
    hex = hex.replace('#', '');

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Adjust brightness
    const adjust = color => {
        if (lighten) {
            return Math.min(255, Math.round(color + (255 - color) * (percentage / 100)));
        }
        return Math.max(0, Math.round(color * (1 - percentage / 100)));
    };

    const newR = adjust(r);
    const newG = adjust(g);
    const newB = adjust(b);

    // Convert back to hex
    const toHex = c => c.toString(16).padStart(2, '0');
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`;
}

// Read brand configuration
function readBrandConfig() {
    const configPath = path.join(__dirname, '../brand.config.json');

    if (!fs.existsSync(configPath)) {
        throw new Error('brand.config.json not found');
    }

    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

    if (!config.colors) {
        throw new Error('Colors section not found in brand.config.json');
    }

    // Validate colors
    Object.entries(config.colors).forEach(([name, color]) => {
        if (!isValidHexColor(color)) {
            throw new Error(`Invalid hex color for ${name}: ${color}`);
        }
    });

    return config;
}

// Generate constants.scss
function generateConstants(config) {
    const { colors, color_variants } = config;

    let content = `/*------------------------------------*
 *  # Color Constants (Auto-Generated)
 *------------------------------------*/

/* 
 * This file is auto-generated from brand.config.json
 * Do not edit manually - run 'npm run generate:colors' instead
 */

/* COLOR PALETTE */

/* Semantic colors from brand configuration */
$color-primary: ${colors.primary};
$color-secondary: ${colors.secondary};
$color-tertiary: ${colors.tertiary};
$color-danger: ${colors.danger};
$color-success: ${colors.success};
$color-warning: ${colors.warning};
$color-info: ${colors.info};
$color-neutral: ${colors.neutral};
$color-black: ${colors.black};
$color-white: ${colors.white};

`;

    // Add variant colors if auto-generation is enabled
    if (color_variants && color_variants.auto_generate) {
        const lightenPercent = color_variants.lighten_percentage || 10;
        const darkenPercent = color_variants.darken_percentage || 10;

        content += `/* Auto-generated color variants */
$color-primary-light: ${adjustColor(colors.primary, lightenPercent, true)};
$color-primary-dark: ${adjustColor(colors.primary, darkenPercent, false)};
$color-secondary-light: ${adjustColor(colors.secondary, lightenPercent, true)};
$color-secondary-dark: ${adjustColor(colors.secondary, darkenPercent, false)};
$color-tertiary-light: ${adjustColor(colors.tertiary, lightenPercent, true)};
$color-tertiary-dark: ${adjustColor(colors.tertiary, darkenPercent, false)};
$color-danger-light: ${adjustColor(colors.danger, lightenPercent, true)};
$color-danger-dark: ${adjustColor(colors.danger, darkenPercent, false)};
$color-success-light: ${adjustColor(colors.success, lightenPercent, true)};
$color-success-dark: ${adjustColor(colors.success, darkenPercent, false)};
$color-warning-light: ${adjustColor(colors.warning, lightenPercent, true)};
$color-warning-dark: ${adjustColor(colors.warning, darkenPercent, false)};
$color-info-light: ${adjustColor(colors.info, lightenPercent, true)};
$color-info-dark: ${adjustColor(colors.info, darkenPercent, false)};
`;
    }

    return content;
}

// Generate brand.scss
function generateBrandTokens(config) {
    const { color_variants } = config;

    let content = `/**
 * Brand Tokens - Core White-Label Variables (Auto-Generated)
 * 
 * This file is auto-generated from brand.config.json
 * Do not edit manually - run 'npm run generate:colors' instead
 * 
 * Partners only need to customize colors in brand.config.json
 */

:root {
  // Core Brand Colors (White-Label Targets)
  // These are the primary variables that control the entire theme
  --brand-primary: #{$color-primary};           // Main brand color (buttons, links, highlights)
  --brand-secondary: #{$color-secondary};       // Success color (rise trades, success states)
  --brand-tertiary: #{$color-tertiary};         // Accent color (highlights, call-to-actions)
  --brand-success: #{$color-success};           // Success color (profit trades, success states)
  --brand-danger: #{$color-danger};             // Error color (fall trades, error states)
  --brand-warning: #{$color-warning};           // Warning color (warning states)
  --brand-info: #{$color-info};                 // Information color (info states, highlights)
  --brand-neutral: #{$color-neutral};           // Neutral color (disabled states, secondary text)

`;

    // Add derived colors if auto-generation is enabled
    if (color_variants && color_variants.auto_generate) {
        content += `  // Derived Brand Colors (Auto-generated from core colors)
  // These provide lighter/darker variants for hover states, etc.
  --brand-primary-light: #{$color-primary-light};
  --brand-primary-dark: #{$color-primary-dark};
  --brand-secondary-light: #{$color-secondary-light};
  --brand-secondary-dark: #{$color-secondary-dark};
  --brand-tertiary-light: #{$color-tertiary-light};
  --brand-tertiary-dark: #{$color-tertiary-dark};
  --brand-danger-light: #{$color-danger-light};
  --brand-danger-dark: #{$color-danger-dark};
  --brand-success-light: #{$color-success-light};
  --brand-success-dark: #{$color-success-dark};
  --brand-warning-light: #{$color-warning-light};
  --brand-warning-dark: #{$color-warning-dark};
  --brand-info-light: #{$color-info-light};
  --brand-info-dark: #{$color-info-dark};

`;
    }

    content += `  // Brand Assets
  --brand-white: #{$color-white};               // Pure white for contrast
  --brand-black: #{$color-black};               // Pure black for contrast
}
`;

    return content;
}

// Generate semantic.scss
function generateSemanticTokens() {
    return `/**
 * Semantic Color Tokens (Auto-Generated)
 * 
 * This file is auto-generated from brand.config.json
 * Do not edit manually - run 'npm run generate:colors' instead
 * 
 * These variables provide semantic meaning to colors and reference the brand tokens.
 * SCSS functions use actual color constants, not CSS variables.
 */

:root {
  .theme--light {
    // Surface Colors
    --color-surface-primary: var(--brand-white);                        // Main backgrounds, cards
    --color-surface-overlay: var(--brand-white);                        // Modal/dialog overlays
    --color-surface-contrast: var(--brand-white);                       // High contrast backgrounds for text
    --color-surface-section: #{mix($color-black, $color-white, 5%)};    // Section backgrounds (light grey)
    --color-surface-border: #{mix($color-black, $color-white, 6%)};     // Border color for surfaces and containers

    // Text Colors
    --color-text-primary: var(--brand-black);                           // Primary text (headings, important text)
    --color-text-secondary: #{transparentize($color-black, 0.3)};       // Secondary text (body text)
    --color-text-disabled: #{transparentize($color-black, 0.6)};        // Disabled text
    --color-text-inverse: var(--brand-white);                           // Text on dark backgrounds
    --color-text-success: var(--brand-success);                         // Success messages, profit text
    --color-text-danger: var(--brand-danger);                           // Error messages, loss text
    --color-text-warning: var(--brand-warning);                         // Warning messages
    --color-text-info: var(--brand-info);                               // Info messages
    --color-text-link: #{lighten($color-primary, 5%)};                  // Link text color (derived from brand-info to match #2196f3)

    // Interactive States
    --color-interactive-default: #{transparentize($color-black, 0.8)};  // Default borders, dividers
    --color-interactive-hover: #{lighten($color-neutral, 30%)};         // Hover states (derived from brand-neutral)
    --color-interactive-active: #{lighten($color-neutral, 25%)};        // Active/selected states (derived from brand-neutral)
    --color-interactive-disabled: #{transparentize($color-black, 0.9)}; // Disabled states
    --color-interactive-focus: var(--brand-info);                       // Focus states

    // Status Colors
    --color-status-success: var(--brand-success);
    --color-status-success-bg: #{transparentize($color-success, 0.84)};
    --color-status-danger: var(--brand-danger);
    --color-status-danger-bg: #{transparentize($color-danger, 0.84)};
    --color-status-warning: var(--brand-warning);
    --color-status-warning-bg: #{transparentize($color-warning, 0.84)};
    --color-status-info: var(--brand-info);
    --color-status-info-bg: #{transparentize($color-primary, 0.84)};
    --color-status-neutral: var(--brand-neutral);

    // Shadow Colors
    --color-shadow-subtle: #{transparentize($color-black, 0.92)};       // Light shadows
    --color-shadow-medium: #{transparentize($color-black, 0.84)};       // Medium shadows
    --color-shadow-strong: #{transparentize($color-black, 0.16)};       // Strong shadows

    // Gradient Colors
    --color-gradient-overlay: linear-gradient(to top, #{$color-white 85%}, #{transparentize($color-danger, 0.84)});
    --color-gradient-success: linear-gradient(to top, #{$color-white}, #{transparentize($color-success, 0.84)});
    --color-gradient-danger: linear-gradient(to top, #{$color-white}, #{transparentize($color-danger, 0.84)});
  }

  .theme--dark {
    // Surface Colors
    --color-surface-primary: var(--brand-black);                        // Main backgrounds, cards
    --color-surface-overlay: #{transparentize($color-black, 0.04)};     // Modal/dialog overlays
    --color-surface-contrast: var(--brand-white);                       // High contrast backgrounds for text
    --color-surface-section: #{mix($color-white, $color-black, 3%)};    // Section backgrounds (derived from brand colors to get #151717)
    --color-surface-border: #{mix($color-white, $color-black, 8%)};     // Border color for surfaces and containers (dark theme)

    // Text Colors
    --color-text-primary: var(--brand-white);                           // Primary text (headings, important text)
    --color-text-secondary: #{transparentize($color-white, 0.2)};       // Secondary text (body text)
    --color-text-disabled: #{transparentize($color-white, 0.6)};        // Disabled text
    --color-text-inverse: var(--brand-white);                           // Text on dark backgrounds
    --color-text-success: var(--brand-success);                         // Success messages, profit text
    --color-text-danger: var(--brand-danger);                           // Error messages, loss text
    --color-text-warning: var(--brand-warning);                         // Warning messages
    --color-text-info: var(--brand-info);                               // Info messages
    --color-text-link: #{lighten($color-primary, 5%)};                  // Link text color (derived from brand-info to match #2196f3)

    // Interactive States
    --color-interactive-default: #{lighten($color-black, 20%)};         // Default borders, dividers
    --color-interactive-hover: #{lighten($color-black, 8%)};            // Hover states (derived from brand-black to get #242828)
    --color-interactive-active: #{lighten($color-black, 25%)};          // Active/selected states (derived from brand-black to get #323738)
    --color-interactive-disabled: #{lighten($color-black, 12%)};        // Disabled states
    --color-interactive-focus: var(--brand-info);                       // Focus states

    // Status Colors
    --color-status-success: var(--brand-success);
    --color-status-success-bg: #{transparentize($color-success, 0.84)};
    --color-status-danger: var(--brand-danger);
    --color-status-danger-bg: #{transparentize($color-danger, 0.84)};
    --color-status-warning: var(--brand-warning);
    --color-status-warning-bg: #{transparentize($color-warning, 0.84)};
    --color-status-info: var(--brand-info);
    --color-status-info-bg: #{transparentize($color-primary, 0.84)};
    --color-status-neutral: var(--brand-neutral);

    // Shadow Colors
    --color-shadow-subtle: #{transparentize($color-black, 0.36)};       // Light shadows
    --color-shadow-medium: #{transparentize($color-black, 0.16)};       // Medium shadows
    --color-shadow-strong: #{transparentize($color-black, 0.28)};       // Strong shadows

    // Gradient Colors
    --color-gradient-overlay: linear-gradient(to top, #{$color-black 85%}, #{transparentize($color-danger, 0.84)});
    --color-gradient-success: linear-gradient(to top, #{$color-black}, #{transparentize($color-success, 0.84)});
    --color-gradient-danger: linear-gradient(to top, #{$color-black}, #{transparentize($color-danger, 0.84)});
  }
}
`;
}

// Generate components.scss
function generateComponentTokens() {
    return `/**
 * Component Color Tokens (Auto-Generated)
 * 
 * This file is auto-generated from brand.config.json
 * Do not edit manually - run 'npm run generate:colors' instead
 * 
 * These variables define colors for specific UI components.
 * SCSS functions use actual color constants, not CSS variables.
 */

:root {
  .theme--light {
    // Button Colors
    --color-button-primary-bg: var(--brand-primary);
    --color-button-primary-text: var(--color-surface-contrast);
    --color-button-primary-hover: var(--brand-primary-dark);
    
    --color-button-secondary-bg: transparent;
    --color-button-secondary-border: var(--color-interactive-active);
    --color-button-secondary-text: var(--brand-black);
    --color-button-secondary-hover: var(--color-interactive-hover);
    
    --color-button-tertiary-bg: transparent;
    --color-button-tertiary-text: var(--brand-primary);
    --color-button-tertiary-hover: #{transparentize($color-primary, 0.92)};
    
    --color-button-disabled-bg: var(--color-interactive-disabled);
    --color-button-disabled-text: var(--color-text-disabled);

    // Trading/Purchase Colors (exact legacy match for light theme)
    --color-trade-buy: #{$color-success};                               // Buy/Higher/Rise trades
    --color-trade-buy-bg: #{darken($color-success, 10%)};               // Buy background (derived from brand-secondary to get #3d9494)
    --color-trade-sell: #{$color-danger};                               // Sell/Lower/Fall trades
    --color-trade-sell-bg: #{darken($color-danger, 10%)};               // Sell background (derived from brand-danger)
    --color-trade-disabled: var(--color-interactive-disabled);

    // Form Colors
    --color-input-bg: var(--color-surface-primary);
    --color-input-border: var(--color-interactive-default);
    --color-input-border-focus: var(--color-interactive-focus);
    --color-input-border-error: var(--brand-danger);
    --color-input-text: var(--color-text-secondary);
    --color-input-placeholder: var(--color-text-disabled);

    // Link Colors
    --color-link-default: var(--brand-primary);
    --color-link-hover: var(--brand-primary-dark);
    --color-link-visited: var(--brand-primary);

    // Card/Container Colors
    --color-card-bg: var(--color-surface-primary);
    --color-card-border: var(--color-interactive-default);
    --color-card-shadow: var(--color-shadow-subtle);

    // Navigation Colors
    --color-nav-bg: var(--color-surface-primary);
    --color-nav-border: var(--color-interactive-default);
    --color-nav-item-active: var(--brand-primary);
    --color-nav-item-hover: var(--color-interactive-hover);

    // Modal/Dialog Colors
    --color-modal-bg: var(--color-surface-overlay);
    --color-modal-backdrop: #{transparentize($color-black, 0.72)};
    --color-modal-border: var(--color-interactive-default);

    // Table Colors
    --color-table-header-bg: #{mix($color-black, $color-white, 5%)};
    --color-table-border: var(--color-interactive-default);
    --color-table-row-hover: #{mix($color-black, $color-white, 7%)};
    --color-table-row-selected: var(--color-status-info-bg);

    // Chart Colors (for trading charts)
    --color-chart-buy: var(--color-trade-buy);
    --color-chart-sell: var(--color-trade-sell);
    --color-chart-grid: var(--color-interactive-default);
    --color-chart-axis: var(--color-text-secondary);

    // Notification/Toast Colors
    --color-notification-success-bg: var(--color-status-success-bg);
    --color-notification-success-border: var(--color-status-success);
    --color-notification-error-bg: var(--color-status-danger-bg);
    --color-notification-error-border: var(--color-status-danger);
    --color-notification-warning-bg: var(--color-status-warning-bg);
    --color-notification-warning-border: var(--color-status-warning);
    --color-notification-info-bg: var(--color-status-info-bg);
    --color-notification-info-border: var(--color-status-info);

    // Progress/Loading Colors
    --color-progress-bg: #{transparentize($color-black, 0.9)};
    --color-progress-fill: var(--brand-primary);
    --color-loading-spinner: var(--brand-primary);

    // Badge Colors
    --color-badge-success-bg: var(--color-status-success);
    --color-badge-success-text: var(--color-surface-contrast);
    --color-badge-danger-bg: var(--color-status-danger);
    --color-badge-danger-text: var(--color-surface-contrast);
    --color-badge-warning-bg: var(--color-status-warning);
    --color-badge-warning-text: var(--brand-black);
    --color-badge-info-bg: var(--color-status-info);
    --color-badge-info-text: var(--color-surface-contrast);
    --color-badge-neutral-bg: var(--color-status-neutral);
    --color-badge-neutral-text: var(--color-surface-contrast);
  }

  .theme--dark {
    // Button Colors
    --color-button-primary-bg: var(--brand-primary);
    --color-button-primary-text: var(--color-surface-contrast);
    --color-button-primary-hover: var(--brand-primary-dark);
    
    --color-button-secondary-bg: transparent;
    --color-button-secondary-border: var(--color-interactive-active);
    --color-button-secondary-text: var(--brand-white);
    --color-button-secondary-hover: #{transparentize($color-white, 0.92)};
    
    --color-button-tertiary-bg: transparent;
    --color-button-tertiary-text: var(--brand-primary);
    --color-button-tertiary-hover: #{transparentize($color-danger, 0.92)};
    
    --color-button-disabled-bg: var(--color-interactive-disabled);
    --color-button-disabled-text: var(--color-text-disabled);

    // Trading/Purchase Colors (dark theme variants)
    --color-trade-buy: #{$color-success};                               // Buy/Higher/Rise trades (dark)
    --color-trade-buy-bg: #{darken($color-success, 10%)};               // Buy background (derived from brand-secondary to get #3d9494)
    --color-trade-sell: #{$color-danger};                               // Sell/Lower/Fall trades (dark)
    --color-trade-sell-bg: #{darken($color-danger, 10%)};               // Sell background (derived from brand-danger)
    --color-trade-disabled: var(--color-interactive-disabled);

    // Form Colors
    --color-input-bg: var(--color-surface-primary);
    --color-input-border: var(--color-interactive-default);
    --color-input-border-focus: var(--color-interactive-focus);
    --color-input-border-error: var(--brand-danger);
    --color-input-text: var(--color-text-secondary);
    --color-input-placeholder: var(--color-text-disabled);

    // Link Colors
    --color-link-default: var(--brand-primary);
    --color-link-hover: var(--brand-primary-dark);
    --color-link-visited: var(--brand-primary);

    // Card/Container Colors
    --color-card-bg: #{lighten($color-black, 8%)};
    --color-card-border: var(--color-interactive-default);
    --color-card-shadow: var(--color-shadow-subtle);

    // Navigation Colors
    --color-nav-bg: #{lighten($color-black, 8%)};
    --color-nav-border: var(--color-interactive-default);
    --color-nav-item-active: var(--brand-primary);
    --color-nav-item-hover: var(--color-interactive-hover);

    // Modal/Dialog Colors
    --color-modal-bg: var(--color-surface-overlay);
    --color-modal-backdrop: #{transparentize($color-black, 0.4)};
    --color-modal-border: var(--color-interactive-default);

    // Table Colors
    --color-table-header-bg: #{lighten($color-black, 15%)};
    --color-table-border: var(--color-interactive-default);
    --color-table-row-hover: #{lighten($color-black, 15%)};
    --color-table-row-selected: var(--color-status-info-bg);

    // Chart Colors (for trading charts)
    --color-chart-buy: var(--color-trade-buy);
    --color-chart-sell: var(--color-trade-sell);
    --color-chart-grid: var(--color-interactive-default);
    --color-chart-axis: var(--color-text-secondary);

    // Notification/Toast Colors
    --color-notification-success-bg: var(--color-status-success-bg);
    --color-notification-success-border: var(--color-status-success);
    --color-notification-error-bg: var(--color-status-danger-bg);
    --color-notification-error-border: var(--color-status-danger);
    --color-notification-warning-bg: var(--color-status-warning-bg);
    --color-notification-warning-border: var(--color-status-warning);
    --color-notification-info-bg: var(--color-status-info-bg);
    --color-notification-info-border: var(--color-status-info);

    // Progress/Loading Colors
    --color-progress-bg: #{lighten($color-black, 12%)};
    --color-progress-fill: var(--brand-primary);
    --color-loading-spinner: var(--brand-primary);

    // Badge Colors
    --color-badge-success-bg: var(--color-status-success);
    --color-badge-success-text: var(--color-surface-contrast);
    --color-badge-danger-bg: var(--color-status-danger);
    --color-badge-danger-text: var(--color-surface-contrast);
    --color-badge-warning-bg: var(--color-status-warning);
    --color-badge-warning-text: var(--brand-black);
    --color-badge-info-bg: var(--color-status-info);
    --color-badge-info-text: var(--color-surface-contrast);
    --color-badge-neutral-bg: var(--color-status-neutral);
    --color-badge-neutral-text: var(--color-surface-contrast);
  }
}
`;
}

// Main execution
function main() {
    /* eslint-disable no-console */
    try {
        console.log('🎨 Generating colors from brand.config.json...');

        // Read configuration
        const config = readBrandConfig();
        console.log(`✅ Loaded brand configuration for: ${config.brand_name}`);

        // Generate colors.scss
        const colorsContent = generateConstants(config);
        const colorsPath = path.join(__dirname, '../packages/shared/src/styles/constants/colors.scss');
        fs.writeFileSync(colorsPath, colorsContent);
        console.log('✅ Generated colors.scss');

        // Generate brand.scss
        const brandContent = generateBrandTokens(config);
        const brandPath = path.join(__dirname, '../packages/shared/src/styles/tokens/brand.scss');
        fs.writeFileSync(brandPath, brandContent);
        console.log('✅ Generated brand.scss');

        // Generate semantic.scss
        const semanticContent = generateSemanticTokens();
        const semanticPath = path.join(__dirname, '../packages/shared/src/styles/tokens/semantic.scss');
        fs.writeFileSync(semanticPath, semanticContent);
        console.log('✅ Generated semantic.scss');

        // Generate components.scss
        const componentsContent = generateComponentTokens();
        const componentsPath = path.join(__dirname, '../packages/shared/src/styles/tokens/components.scss');
        fs.writeFileSync(componentsPath, componentsContent);
        console.log('✅ Generated components.scss');

        console.log('🎉 Color generation completed successfully!');
        console.log('\nGenerated colors:');
        Object.entries(config.colors).forEach(([name, color]) => {
            console.log(`  ${name}: ${color}`);
        });
    } catch (error) {
        console.error('❌ Error generating colors:', error.message);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    main,
    readBrandConfig,
    generateConstants,
    generateBrandTokens,
    generateSemanticTokens,
    generateComponentTokens,
};
