# Migration Checklist: derivatives-chart to smartchart-champion

## Pre-Migration Setup

- [ ] Create migration branch: `git checkout -b migrate-to-smartchart-champion`
- [ ] Backup current working state
- [ ] Research smartchart-champion version compatibility
- [ ] Review API documentation for breaking changes

## Phase 1: Dependency Updates

### Root Level

- [ ] Update `package.json` - replace `@deriv-com/derivatives-charts` with `@deriv-com/smartchart-champion`
- [ ] Update `package-lock.json` via `npm install`

### Trader Package

- [ ] Update `packages/trader/package.json` dependency
- [ ] Verify no other references in trader package files

### Core Package

- [ ] Update `packages/core/package.json` dependency
- [ ] Verify no other references in core package files

## Phase 2: Code Updates

### Import Statements

- [ ] Update `packages/trader/src/Modules/SmartChart/index.js`
    - [ ] Change import from `@deriv-com/derivatives-charts` to `@deriv-com/smartchart-champion`
    - [ ] Update webpack chunk name if needed
- [ ] Update `packages/core/src/App/app.jsx`
    - [ ] Change CSS import path

### Build Configuration

- [ ] Update `packages/trader/build/webpack.config.js`
    - [ ] Update external dependencies mapping
- [ ] Update `packages/core/build/constants.js`
    - [ ] Update path resolution
- [ ] Update `packages/core/build/config.js`
    - [ ] Update asset copying paths (3 locations)

## Phase 3: Testing

### Build Testing

- [ ] Run `npm install` to update dependencies
- [ ] Run `npm run build:all` - verify no build errors
- [ ] Check webpack bundle analysis for correct chunks
- [ ] Verify assets are copied to correct locations

### Development Testing

- [ ] Run `npm run serve` for trader package
- [ ] Run `npm run serve` for core package
- [ ] Verify no console errors on startup

### Functional Testing

- [ ] Chart renders correctly
- [ ] Symbol switching works
- [ ] Chart interactions work (zoom, pan)
- [ ] Drawing tools function properly
- [ ] Theme switching (dark/light) works
- [ ] Mobile responsiveness maintained
- [ ] Contract overlays display correctly

### Integration Testing

- [ ] Test with trading interface
- [ ] Verify market data displays correctly
- [ ] Test chart mode switching
- [ ] Validate performance metrics

## Phase 4: Validation

### Code Quality

- [ ] Run `npm run test:eslint-all`
- [ ] Run `npm run test:stylelint`
- [ ] Run `npm run test:jest`
- [ ] Fix any linting issues

### Final Verification

- [ ] All builds pass
- [ ] All tests pass
- [ ] No console errors
- [ ] Functionality matches previous version
- [ ] Performance is acceptable

## Post-Migration

### Documentation

- [ ] Update README files if necessary
- [ ] Update any developer documentation
- [ ] Document any API changes discovered

### Cleanup

- [ ] Remove any unused configuration
- [ ] Clean up temporary files
- [ ] Update .gitignore if needed

### Deployment Preparation

- [ ] Create pull request with detailed description
- [ ] Add migration notes for reviewers
- [ ] Plan deployment strategy
- [ ] Prepare rollback plan

## Rollback Checklist (if needed)

- [ ] `git checkout main` (or previous branch)
- [ ] `npm install` to restore previous dependencies
- [ ] `npm run build:all` to verify rollback
- [ ] Test functionality to ensure rollback successful

## Notes Section

```
Date Started: ___________
Issues Encountered:
-
-
-

Solutions Applied:
-
-
-

Final Status: ___________
Completed By: ___________
```

---

**Checklist Version**: 1.0  
**Created**: 2025-01-18  
**Status**: Ready for Use
