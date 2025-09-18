# Migration Plan: derivatives-chart to smartchart-champion

## Executive Summary

This document outlines the comprehensive plan to migrate from `@deriv-com/derivatives-charts` to `@deriv-com/smartchart-champion` across the derivatives-trader project. This migration involves updating dependencies, import statements, configuration files, and ensuring compatibility across all affected packages.

## Current State Analysis

### Dependencies Currently Using derivatives-charts

1. **Root package.json**
    - `"@deriv-com/derivatives-charts": "^1.1.8"`

2. **packages/trader/package.json**
    - `"@deriv-com/derivatives-charts": "^1.1.8"`

3. **packages/core/package.json**
    - `"@deriv-com/derivatives-charts": "^1.1.8"`

### Key Files Affected

1. **Import/Module Loading**
    - `packages/trader/src/Modules/SmartChart/index.js` - Main module loader
    - `packages/core/src/App/app.jsx` - CSS imports

2. **Build Configuration**
    - `packages/trader/build/webpack.config.js` - External dependencies
    - `packages/core/build/config.js` - Asset copying configuration
    - `packages/core/build/constants.js` - Path resolution

3. **Styling References**
    - Multiple SCSS files referencing `smartcharts` classes
    - CSS imports for smartcharts styles

### Interesting Discovery

The compiled JavaScript files in `packages/trader/dist/trader/js/trader.js` already show references to `@deriv-com/smartcharts-champion`, suggesting this migration may be partially complete or there's already some build-time transformation happening.

## Migration Strategy

### Phase 1: Dependency Updates

#### 1.1 Update Package Dependencies

- **Root package.json**: Replace `@deriv-com/derivatives-charts` with `@deriv-com/smartchart-champion`
- **packages/trader/package.json**: Update dependency
- **packages/core/package.json**: Update dependency
- **package-lock.json**: Will be automatically updated during npm install

#### 1.2 Version Considerations

- Determine the appropriate version of `@deriv-com/smartchart-champion` to use
- Check for breaking changes between derivatives-charts and smartchart-champion
- Verify API compatibility

### Phase 2: Code Updates

#### 2.1 Module Import Updates

**File: `packages/trader/src/Modules/SmartChart/index.js`**

```javascript
// [AI]
// Current
return import(/* webpackChunkName: "smart_chart" */ '@deriv-com/derivatives-charts');

// Updated
return import(/* webpackChunkName: "smart_chart_champion" */ '@deriv-com/smartchart-champion');
// [/AI]
```

#### 2.2 CSS Import Updates

**File: `packages/core/src/App/app.jsx`**

```javascript
// [AI]
// Current
import('@deriv-com/derivatives-charts/dist/smartcharts.css');

// Updated
import('@deriv-com/smartchart-champion/dist/smartcharts.css');
// [/AI]
```

#### 2.3 Build Configuration Updates

**File: `packages/trader/build/webpack.config.js`**

```javascript
// [AI]
// Current
'@deriv-com/derivatives-charts': '@deriv-com/derivatives-charts',

// Updated
'@deriv-com/smartchart-champion': '@deriv-com/smartchart-champion',
// [/AI]
```

**File: `packages/core/build/constants.js`**

```javascript
// [AI]
// Current
'@deriv-com/derivatives-charts': path.resolve(__dirname, '../../../node_modules/@deriv-com/derivatives-charts'),

// Updated
'@deriv-com/smartchart-champion': path.resolve(__dirname, '../../../node_modules/@deriv-com/smartchart-champion'),
// [/AI]
```

**File: `packages/core/build/config.js`**

```javascript
// [AI]
// Current paths
from: path.resolve(__dirname, '../../../node_modules/@deriv-com/derivatives-charts/dist'),

// Updated paths
from: path.resolve(__dirname, '../../../node_modules/@deriv-com/smartchart-champion/dist'),
// [/AI]
```

### Phase 3: Asset and Path Updates

#### 3.1 Asset Path Updates

Update all asset copying configurations to point to the new package structure:

- Chart assets
- Distribution files
- Public path configurations

#### 3.2 Public Path Configuration

Verify that `setSmartChartsPublicPath` function exists and works the same way in smartchart-champion.

### Phase 4: Testing and Validation

#### 4.1 Functional Testing

- Verify all chart components load correctly
- Test chart interactions (zoom, pan, drawing tools)
- Validate symbol changes and market data display
- Test mobile responsiveness

#### 4.2 Build Testing

- Ensure webpack builds complete successfully
- Verify chunk splitting works correctly
- Check that assets are copied to correct locations
- Validate CSS loading and styling

#### 4.3 Integration Testing

- Test chart integration with trading interface
- Verify contract overlays and markers work
- Test chart mode switching
- Validate theme switching (dark/light)

## Implementation Steps

### Step 1: Pre-Migration Preparation

1. **Backup Current State**
    - Create a git branch for the migration
    - Document current functionality for regression testing

2. **Research smartchart-champion**
    - Review documentation for API changes
    - Identify any breaking changes
    - Check version compatibility

### Step 2: Dependency Migration

1. **Update package.json files**

    ```bash
    # Remove old dependency
    npm uninstall @deriv-com/derivatives-charts

    # Install new dependency
    npm install @deriv-com/smartchart-champion@<version>
    ```

2. **Update lock files**
    ```bash
    npm install
    ```

### Step 3: Code Updates

1. **Update import statements** in `packages/trader/src/Modules/SmartChart/index.js`
2. **Update CSS imports** in `packages/core/src/App/app.jsx`
3. **Update webpack configurations** in both trader and core packages
4. **Update build constants and paths**

### Step 4: Asset Configuration

1. **Update asset copying paths** in `packages/core/build/config.js`
2. **Verify public path configuration**
3. **Update any hardcoded paths** in configuration files

### Step 5: Testing and Validation

1. **Run build process**

    ```bash
    npm run build:all
    ```

2. **Start development server**

    ```bash
    npm run serve
    ```

3. **Perform functional testing**
4. **Run automated tests**
    ```bash
    npm run test
    ```

### Step 6: Documentation and Cleanup

1. **Update documentation** to reflect new dependency
2. **Remove any unused configurations** related to derivatives-charts
3. **Update README files** if necessary

## Risk Assessment

### High Risk Items

1. **API Compatibility**: Potential breaking changes between packages
2. **Asset Paths**: Incorrect asset paths could break chart functionality
3. **Build Configuration**: Webpack configuration errors could prevent builds

### Medium Risk Items

1. **Styling Changes**: CSS class names or structure might differ
2. **Public Path Configuration**: Path resolution issues
3. **Component Exports**: Different export structure in new package

### Low Risk Items

1. **Package Installation**: Standard npm dependency update
2. **Import Statement Updates**: Straightforward find/replace operation

## Rollback Plan

If issues arise during migration:

1. **Immediate Rollback**

    ```bash
    git checkout <previous-branch>
    npm install
    npm run build:all
    ```

2. **Partial Rollback**
    - Revert specific files that cause issues
    - Keep successful changes
    - Investigate and fix problems incrementally

## Success Criteria

### Technical Success Criteria

- [ ] All builds complete without errors
- [ ] All chart components render correctly
- [ ] No console errors related to chart functionality
- [ ] Asset loading works correctly
- [ ] Mobile and desktop views work properly

### Functional Success Criteria

- [ ] Chart displays market data correctly
- [ ] User interactions work (zoom, pan, drawing)
- [ ] Symbol switching functions properly
- [ ] Theme switching works
- [ ] Contract overlays display correctly
- [ ] Performance is maintained or improved

## Timeline Estimate

- **Phase 1 (Dependency Updates)**: 1-2 hours
- **Phase 2 (Code Updates)**: 2-4 hours
- **Phase 3 (Asset Updates)**: 1-2 hours
- **Phase 4 (Testing)**: 4-8 hours
- **Total Estimated Time**: 8-16 hours

## Post-Migration Tasks

1. **Monitor Performance**: Compare before/after metrics
2. **User Feedback**: Collect feedback on chart functionality
3. **Documentation Updates**: Update any developer documentation
4. **Dependency Audit**: Ensure no unused dependencies remain

## Notes and Considerations

1. **Version Pinning**: Consider pinning to a specific version initially for stability
2. **Gradual Rollout**: Consider feature flags if possible for gradual rollout
3. **Monitoring**: Implement monitoring to catch any issues early
4. **Communication**: Notify team members about the migration timeline

---

**Document Version**: 1.0  
**Created**: 2025-01-18  
**Last Updated**: 2025-01-18  
**Author**: AI Assistant  
**Status**: Draft - Pending Review
