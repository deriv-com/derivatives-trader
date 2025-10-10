#!/usr/bin/env node

/**
 * Bundle Analysis Summary Script
 *
 * This script aggregates bundle analysis results from all packages
 * and provides a consolidated summary of bundle sizes and recommendations.
 */

const fs = require('fs');
const path = require('path');

// Package configuration
const PACKAGES = [
    { name: '@deriv/core', path: 'packages/core', description: 'Main application shell' },
    { name: '@deriv/trader', path: 'packages/trader', description: 'Trading interface and functionality' },
    { name: '@deriv/reports', path: 'packages/reports', description: 'Reports and trading history' },
    { name: '@deriv/components', path: 'packages/components', description: 'Reusable UI components library' },
];

// Size thresholds (in bytes) - Realistic for derivatives trading platform
const THRESHOLDS = {
    core: 800 * 1024, // 800KB (complex main app)
    trader: 600 * 1024, // 600KB (trading interface)
    reports: 400 * 1024, // 400KB (reports module)
    components: 200 * 1024, // 200KB (component library)
    chunk: 500 * 1024, // 500KB (reasonable chunk size)
    total: 1.5 * 1024 * 1024, // 1.5MB (realistic total target)
};

function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / k ** i).toFixed(dm)) + ' ' + sizes[i];
}

function getStatusIcon(size, threshold) {
    if (size > threshold) return '🔴';
    if (size > threshold * 0.8) return '🟡';
    return '🟢';
}

function analyzeBundleStats(statsPath, packageName) {
    if (!fs.existsSync(statsPath)) {
        return {
            error: 'Stats file not found. Run bundle analysis first.',
            recommendation: `Run: npm run analyze:bundle:${packageName.split('/')[1]}`,
        };
    }

    try {
        const stats = JSON.parse(fs.readFileSync(statsPath, 'utf8'));
        const assets = stats.assets || [];

        // Calculate sizes
        const jsAssets = assets.filter(asset => asset.name.endsWith('.js'));
        const cssAssets = assets.filter(asset => asset.name.endsWith('.css'));

        const totalJSSize = jsAssets.reduce((sum, asset) => sum + asset.size, 0);
        const totalCSSSize = cssAssets.reduce((sum, asset) => sum + asset.size, 0);
        const totalSize = totalJSSize + totalCSSSize;

        // Find largest assets
        const largestAssets = assets
            .sort((a, b) => b.size - a.size)
            .slice(0, 5)
            .map(asset => ({
                name: asset.name,
                size: asset.size,
                formatted: formatBytes(asset.size),
            }));

        // Determine appropriate threshold based on package type
        let threshold = THRESHOLDS.core; // default
        if (packageName.includes('components')) threshold = THRESHOLDS.components;
        else if (packageName.includes('trader')) threshold = THRESHOLDS.trader;
        else if (packageName.includes('reports')) threshold = THRESHOLDS.reports;
        else if (packageName.includes('core')) threshold = THRESHOLDS.core;

        return {
            totalSize,
            totalJSSize,
            totalCSSSize,
            assetCount: assets.length,
            largestAssets,
            threshold,
            status: getStatusIcon(totalSize, threshold),
            chunks: jsAssets.length,
            recommendations: generateRecommendations(totalSize, largestAssets, packageName, threshold),
        };
    } catch (error) {
        return {
            error: `Error parsing stats: ${error.message}`,
            recommendation: 'Check if the bundle-stats.json file is valid JSON',
        };
    }
}

function generateRecommendations(totalSize, largestAssets, packageName, threshold) {
    const recommendations = [];

    if (totalSize > threshold) {
        recommendations.push('📦 Bundle size exceeds recommended threshold');
    }

    if (largestAssets.length > 0 && largestAssets[0].size > THRESHOLDS.chunk) {
        recommendations.push('⚡ Consider code splitting for large chunks');
    }

    // Package-specific recommendations
    if (packageName.includes('trader')) {
        recommendations.push('🎯 Consider lazy loading trading modules');
    } else if (packageName.includes('reports')) {
        recommendations.push('📊 Consider virtual scrolling for large data tables');
    } else if (packageName.includes('components')) {
        recommendations.push('🧩 Ensure tree shaking is working for unused components');
    }

    if (recommendations.length === 0) {
        recommendations.push('✅ Bundle size is within recommended limits');
    }

    return recommendations;
}

function printSummary() {
    console.log('\n🔍 Bundle Analysis Summary\n');
    console.log('='.repeat(80));

    let totalProjectSize = 0;
    const results = [];

    // Analyze each package
    for (const pkg of PACKAGES) {
        const statsPath = path.join(pkg.path, 'bundle-stats.json');
        const reportPath = path.join(pkg.path, 'bundle-report.html');
        const analysis = analyzeBundleStats(statsPath, pkg.name);

        results.push({
            package: pkg,
            analysis,
            hasReport: fs.existsSync(reportPath),
        });

        if (!analysis.error) {
            totalProjectSize += analysis.totalSize;
        }
    }

    // Print individual package results
    for (const result of results) {
        const { package: pkg, analysis, hasReport } = result;

        console.log(`\n📦 ${pkg.name}`);
        console.log(`   ${pkg.description}`);
        console.log('   ' + '-'.repeat(50));

        if (analysis.error) {
            console.log(`   ❌ ${analysis.error}`);
            if (analysis.recommendation) {
                console.log(`   💡 ${analysis.recommendation}`);
            }
        } else {
            console.log(`   ${analysis.status} Total Size: ${formatBytes(analysis.totalSize)}`);
            console.log(`   📝 JavaScript: ${formatBytes(analysis.totalJSSize)}`);
            console.log(`   🎨 CSS: ${formatBytes(analysis.totalCSSSize)}`);
            console.log(`   🧩 Assets: ${analysis.assetCount} (${analysis.chunks} JS chunks)`);

            if (analysis.largestAssets.length > 0) {
                console.log(
                    `   📊 Largest Asset: ${analysis.largestAssets[0].name} (${analysis.largestAssets[0].formatted})`
                );
            }

            if (hasReport) {
                console.log(`   📋 Report: ${pkg.path}/bundle-report.html`);
            }

            if (analysis.recommendations.length > 0) {
                console.log('   💡 Recommendations:');
                analysis.recommendations.forEach(rec => {
                    console.log(`      ${rec}`);
                });
            }
        }
    }

    // Print project overview
    console.log('\n' + '='.repeat(80));
    console.log('📊 PROJECT OVERVIEW');
    console.log('='.repeat(80));

    const successfulAnalyses = results.filter(r => !r.analysis.error);
    console.log(`✅ Successfully analyzed: ${successfulAnalyses.length}/${PACKAGES.length} packages`);

    if (totalProjectSize > 0) {
        const status = getStatusIcon(totalProjectSize, THRESHOLDS.total);
        console.log(`${status} Total Project Size: ${formatBytes(totalProjectSize)}`);

        if (totalProjectSize > THRESHOLDS.total) {
            console.log(`⚠️  Project size exceeds recommended ${formatBytes(THRESHOLDS.total)} limit`);
        }
    }

    // Performance recommendations
    console.log('\n🚀 PERFORMANCE RECOMMENDATIONS');
    console.log('-'.repeat(50));

    const hasLargeBundle = results.some(r => !r.analysis.error && r.analysis.totalSize > r.analysis.threshold);
    if (hasLargeBundle) {
        console.log('• Implement more aggressive code splitting');
        console.log('• Consider lazy loading non-critical modules');
        console.log('• Review and optimize large dependencies');
    }

    console.log('• Monitor bundle size in CI/CD pipeline');
    console.log('• Set up performance budgets for each package');
    console.log('• Regular dependency audits for unused packages');

    // Next steps
    console.log('\n📋 NEXT STEPS');
    console.log('-'.repeat(50));
    console.log('• Open bundle reports in browser for detailed analysis');
    console.log('• Focus on packages marked with 🔴 or 🟡 status');
    console.log('• Set up automated bundle size monitoring');

    const failedPackages = results.filter(r => r.analysis.error);
    if (failedPackages.length > 0) {
        console.log('\n❌ Failed Analyses:');
        failedPackages.forEach(r => {
            console.log(`   ${r.package.name}: Run npm run analyze:bundle:${r.package.name.split('/')[1]}`);
        });
    }

    console.log('\n📖 For detailed usage instructions, see: docs/bundle-analysis.md');
    console.log('');
}

// Run the summary
if (require.main === module) {
    printSummary();
}

module.exports = { printSummary, analyzeBundleStats, formatBytes };
