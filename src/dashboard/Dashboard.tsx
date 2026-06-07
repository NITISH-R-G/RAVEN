import React, { useState, useEffect } from 'react';
import ExecutiveOverview from './components/ExecutiveOverview';
import BuildHealth from './components/BuildHealth';
import TestCoverage from './components/TestCoverage';
import SecurityDashboard from './components/SecurityDashboard';
import CodeQuality from './components/CodeQuality';
import RepositoryActivity from './components/RepositoryActivity';
import PRAnalytics from './components/PRAnalytics';
import IssueManagement from './components/IssueManagement';
import PerformanceMonitoring from './components/PerformanceMonitoring';
import Contributors from './components/Contributors';
import AIInsights from './components/AIInsights';

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('./dashboard-data.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load dashboard data');
        return res.json();
      })
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-white">Loading dashboard metrics...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-slate-350 p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="border-b border-white/10 pb-4 mb-8">
          <h1 className="text-3xl font-bold text-white">Repository Health Dashboard</h1>
          <p className="text-slate-400 mt-2">
            Single source of truth for repository health, engineering quality, security posture, and
            velocity.
          </p>
        </header>

        <AIInsights data={data.aiInsights} />

        <ExecutiveOverview data={data.executiveOverview} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <BuildHealth data={data.buildHealth} />
          <TestCoverage data={data.testCoverage} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SecurityDashboard data={data.securityDashboard} />
          <CodeQuality data={data.codeQuality} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RepositoryActivity data={data.repositoryActivity} />
          <PRAnalytics data={data.prAnalytics} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <IssueManagement data={data.issueManagement} />
          <PerformanceMonitoring data={data.performanceMonitoring} />
        </div>

        <Contributors data={data.contributors} />
      </div>
    </div>
  );
}
