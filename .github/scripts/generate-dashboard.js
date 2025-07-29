#!/usr/bin/env node

/**
 * Generate AI Code Analysis Dashboard
 * 
 * Reads from stored JSON data to create a beautiful Markdown dashboard
 * This is FAST - no API calls needed!
 */

const fs = require('fs');

function generateMarkdown(stats, analyses, repo) {
  const lastUpdate = new Date().toISOString().split('T')[0];
  
  // Progress bar function for stats
  function createStatsProgressBar(percentage) {
    const width = 10;
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    
    // Use emoji blocks for consistent sizing and colors
    let filledEmoji = '🟥'; // Red for low usage
    if (percentage >= 80) filledEmoji = '🟩';      // Green (80-100%)
    else if (percentage >= 50) filledEmoji = '🟨'; // Yellow (50-79%)  
    else if (percentage >= 21) filledEmoji = '🟧'; // Orange (21-49%)
    
    // Create bar with consistent emoji blocks
    const filledBar = filledEmoji.repeat(filled);
    const emptyBar = '⬜'.repeat(empty);
    const bar = filledBar + emptyBar;
    
    return `${bar} ${percentage}%`;
  }
  
  return `# 🤖 AI Code Analysis Dashboard

<div align="center">

**${repo}**  
📅 Last updated: ${lastUpdate} • 🔄 Tracking merged PRs to main/master

</div>

---

## 📊 Quick Stats

| Metric | Value | Metric | Value |
|--------|-------|--------|-------|
| **📁 Total Merged PRs** | ${stats.totalMergedPRs} | **📈 Average AI Code** | ${createStatsProgressBar(stats.averageAiPercentage)} |
| **🤖 PRs with AI Analysis** | ${stats.totalAnalyzedPRs} | **🎯 Overall AI Percentage** | ${createStatsProgressBar(Math.round((stats.totalAiCharacters / stats.totalCharacters) * 100) || 0)} |
| **📄 Files Analyzed** | ${stats.totalFiles.toLocaleString()} | **⚡ Total AI Characters** | ${stats.totalAiCharacters.toLocaleString()} |

---

${analyses.length === 0 ? `
## 📈 Ready to Track AI Code

> 🚀 **Getting Started**: When you merge PRs with AI analysis, they'll appear here!  
> 💡 Create a PR with \`[AI]\` wrapped code to get started.

---
` : `
## 🚀 Recent Merged Pull Requests

> 📊 Showing the 10 most recent merged PRs (stats above include all ${analyses.length} PRs)

| PR | Author | Date | Files | AI Content | Percentage |
|----|--------|------|-------|------------|------------|${analyses.slice(0, 10).map(analysis => {
  const percentage = analysis.summary ? analysis.summary.percentage : 0;
  const date = new Date(analysis.mergedAt || analysis.timestamp).toLocaleDateString();
  const hasAnalysis = analysis.hasAnalysis !== false;
  
  // Create progress bar
  const createProgressBar = (pct) => {
    const width = 15;
    const filled = Math.round((pct / 100) * width);
    const empty = width - filled;
    
    // Use emoji blocks for consistent sizing and colors
    let filledEmoji = '🟥'; // Red for low usage
    if (pct >= 80) filledEmoji = '🟩';      // Green (80-100%)
    else if (pct >= 50) filledEmoji = '🟨'; // Yellow (50-79%)  
    else if (pct >= 21) filledEmoji = '🟧'; // Orange (21-49%)
    
    // Create bar with consistent emoji blocks
    const filledBar = filledEmoji.repeat(filled);
    const emptyBar = '⬜'.repeat(empty);
    const bar = filledBar + emptyBar;
    
    // Pad percentage to ensure consistent width
    const paddedPercentage = pct.toString().padStart(3, ' ');
    
    return `${bar} ${paddedPercentage}%`;
  };
  
  return `
| [#${analysis.pullRequest}](${analysis.prUrl}) **${analysis.prTitle}** | [@${analysis.author}](https://github.com/${analysis.author}) | ${date} | ${hasAnalysis ? analysis.files.length : 'N/A'} | ${hasAnalysis ? (analysis.summary.aiCharacters || 0).toLocaleString() + ' / ' + (analysis.summary.totalCharacters || 0).toLocaleString() + ' chars' : 'No data'} | ${createProgressBar(percentage)} |`;
}).join('')}

`}

---

<details>
<summary><strong>📊 View detailed visual breakdown</strong></summary>

### 📈 AI Usage Chart

\`\`\`
AI Percentage Distribution:
${analyses.length > 0 ? analyses.slice(0, 20).map((analysis, index) => {
  const percentage = analysis.summary ? analysis.summary.percentage : 0;
  const title = analysis.prTitle.length > 30 ? analysis.prTitle.substring(0, 27) + '...' : analysis.prTitle;
  const padding = ' '.repeat(Math.max(0, 30 - title.length));
  const barLength = 40;
  const filled = Math.round((percentage / 100) * barLength);
  const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
  
  return `PR #${analysis.pullRequest} ${title}${padding} │${bar}│ ${percentage}%`;
}).join('\n') : 'No data available yet'}
\`\`\`

### 🎯 Summary Statistics

\`\`\`
Total Characters:     ${stats.totalCharacters.toLocaleString()}
AI Characters:        ${stats.totalAiCharacters.toLocaleString()}
Human Characters:     ${(stats.totalCharacters - stats.totalAiCharacters).toLocaleString()}

AI vs Human Ratio:    ${Math.round((stats.totalAiCharacters / stats.totalCharacters) * 100) || 0}% : ${100 - Math.round((stats.totalAiCharacters / stats.totalCharacters) * 100) || 100}%
\`\`\`

</details>

---

<div align="center">

🚀 **Generated by ShiftAI**

</div>`;
}

async function main() {
  const REPO = process.env.GITHUB_REPOSITORY || 'your-org/repo';
  
  console.log('🚀 Generating AI Dashboard for ' + REPO + ' (from stored data)');
  
  // Check if historical data exists
  if (!fs.existsSync('.github/data/ai-analysis-history.json')) {
    console.log('⚠️  No historical data found, creating empty dashboard');
    
    const emptyStats = {
      totalMergedPRs: 0,
      totalAnalyzedPRs: 0,
      totalFiles: 0,
      totalCharacters: 0,
      totalAiCharacters: 0,
      averageAiPercentage: 0
    };
    
    const markdown = generateMarkdown(emptyStats, [], REPO);
    fs.writeFileSync('AI-DASHBOARD.md', markdown);
    console.log('✅ Empty dashboard generated');
    return;
  }
  
  // Read historical data (much faster than scanning PRs!)
  const history = JSON.parse(fs.readFileSync('.github/data/ai-analysis-history.json', 'utf8'));
  
  // Generate statistics from stored data
  const analyses = history.analyses.filter(a => a.hasAnalysis !== false);
  const stats = {
    totalMergedPRs: history.totalMergedPRs,
    totalAnalyzedPRs: analyses.length,
    totalFiles: analyses.reduce((sum, a) => sum + (a.files ? a.files.length : 0), 0),
    totalCharacters: analyses.reduce((sum, a) => sum + (a.summary ? a.summary.totalCharacters : 0), 0),
    totalAiCharacters: analyses.reduce((sum, a) => sum + (a.summary ? a.summary.aiCharacters : 0), 0),
    averageAiPercentage: analyses.length ? Math.round(analyses.reduce((sum, a) => sum + (a.summary ? a.summary.percentage : 0), 0) / analyses.length) : 0
  };
  
  console.log('📊 Dashboard stats:');
  console.log('   Total merged PRs: ' + stats.totalMergedPRs);
  console.log('   PRs with analysis: ' + stats.totalAnalyzedPRs);
  console.log('   Average AI %: ' + stats.averageAiPercentage + '%');
  
  // Generate Markdown from stored data
  const markdown = generateMarkdown(stats, history.analyses, REPO);
  
  // Save dashboard
  fs.writeFileSync('AI-DASHBOARD.md', markdown);
  console.log('✅ Dashboard generated from ' + history.totalMergedPRs + ' stored PRs (no API calls needed!)');
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { generateMarkdown }; 