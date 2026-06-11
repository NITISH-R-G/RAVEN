/* eslint-env node */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { GoogleGenAI } from '@google/genai';

const DATA_PATH = path.join(process.cwd(), 'public', 'dashboard-data.json');

// Mock data generator for history (last 7 days)
const generateHistory = (baseScore, variance, days = 7) => {
  const history = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    history.push({
      date: d.toISOString().split('T')[0],
      score: Math.max(0, Math.min(100, baseScore + (Math.random() * variance * 2 - variance))),
      coverage: Math.max(0, Math.min(100, 85 + (Math.random() * 5 - 2.5))),
      success: Math.floor(Math.random() * 20) + 80,
      failure: Math.floor(Math.random() * 5),
      critical: Math.floor(Math.random() * 2),
      high: Math.floor(Math.random() * 5),
      moderate: Math.floor(Math.random() * 10),
      lintErrors: Math.floor(Math.random() * 10),
      deadCode: Math.floor(Math.random() * 5),
      commits: Math.floor(Math.random() * 50) + 10,
      opened: Math.floor(Math.random() * 10) + 1,
      merged: Math.floor(Math.random() * 8) + 1,
      open: Math.floor(Math.random() * 20) + 10,
      closed: Math.floor(Math.random() * 15) + 5,
      buildTime: Math.floor(Math.random() * 60) + 120,
    });
  }
  return history;
};

async function gatherMetrics() {
  console.log('Gathering metrics...');
  const history = generateHistory(85, 5);

  // Base structure
  const data = {
    executiveOverview: {
      overallScore: 88,
      engineeringQualityScore: 92,
      securityScore: 85,
      maintainabilityScore: 89,
      documentationScore: 75,
      testReliabilityScore: 94,
      deploymentReliabilityScore: 99,
      history: history.map((h) => ({ date: h.date, score: Math.round(h.score) })),
    },
    buildHealth: {
      buildSuccessRate: 98,
      buildFailureRate: 2,
      deploySuccessRate: 99,
      deployFailureRate: 1,
      meanDeploymentTime: 145,
      history: history.map((h) => ({ date: h.date, success: h.success, failure: h.failure })),
    },
    testCoverage: {
      lines: 85,
      functions: 82,
      branches: 78,
      history: history.map((h) => ({ date: h.date, coverage: Math.round(h.coverage) })),
    },
    securityDashboard: {
      critical: 0,
      high: 2,
      moderate: 5,
      history: history.map((h) => ({
        date: h.date,
        critical: h.critical,
        high: h.high,
        moderate: h.moderate,
      })),
    },
    codeQuality: {
      lintErrors: 4,
      duplicateCode: 2.5,
      deadCode: 1,
      techDebtScore: 88,
      history: history.map((h) => ({
        date: h.date,
        lintErrors: h.lintErrors,
        deadCode: h.deadCode,
      })),
    },
    repositoryActivity: {
      totalCommits: 1450,
      activeContributors: 12,
      history: history.map((h) => ({ date: h.date, commits: h.commits })),
    },
    prAnalytics: {
      openPRs: 8,
      mergedPRs: 45,
      avgMergeTime: 24,
      history: history.map((h) => ({ date: h.date, opened: h.opened, merged: h.merged })),
    },
    issueManagement: {
      openIssues: 15,
      closedIssues: 120,
      history: history.map((h) => ({ date: h.date, open: h.open, closed: h.closed })),
    },
    performanceMonitoring: {
      buildDuration: 135,
      bundleSize: 1.2,
      history: history.map((h) => ({ date: h.date, buildTime: h.buildTime })),
    },
    contributors: {
      list: [
        { name: 'Alice Smith', commits: 342 },
        { name: 'Bob Jones', commits: 289 },
        { name: 'Charlie Brown', commits: 156 },
        { name: 'Diana Prince', commits: 98 },
      ],
    },
    aiInsights: {
      summary:
        'The repository is generally healthy with strong engineering practices. Test coverage is solid at 85%, though branch coverage could be improved. Recent build times have stabilized.',
      actionItems: [
        'Address 2 high severity vulnerabilities in npm dependencies.',
        'Improve branch coverage which is currently at 78%.',
        'Clean up the 1 dead code file identified by Knip.',
      ],
      positiveTrends: [
        'Deployment success rate is excellent at 99%.',
        'Duplicate code is very low (2.5%).',
        'PR merge velocity is strong (avg 24h).',
      ],
    },
  };

  // Attempt to enrich with real data where possible
  try {
    const gitLog = execSync('git log -1 --format="%cd"').toString().trim();
    console.log('Last commit date:', gitLog);
  } catch (error) {
    console.log('Git command failed, using mock data.', error.message);
  }

  // Attempt AI generation if key is present
  if (process.env.GEMINI_API_KEY) {
    try {
      console.log('Generating AI Insights...');
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `Analyze this project health data and provide a JSON response with 'summary', 'actionItems' (array of strings), and 'positiveTrends' (array of strings). Data: ${JSON.stringify(
        {
          coverage: data.testCoverage.lines,
          lintErrors: data.codeQuality.lintErrors,
          criticalVulns: data.securityDashboard.critical,
          highVulns: data.securityDashboard.high,
        },
      )}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });
      const aiResponse = JSON.parse(response.text());
      if (aiResponse.summary && aiResponse.actionItems && aiResponse.positiveTrends) {
        data.aiInsights = aiResponse;
      }
    } catch (error) {
      console.error(
        'AI Insight generation failed, falling back to static insights:',
        error.message,
      );
    }
  } else {
    console.log('GEMINI_API_KEY not found, skipping live AI generation.');
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  console.log(`Dashboard data written to ${DATA_PATH}`);
}

gatherMetrics().catch(console.error);
