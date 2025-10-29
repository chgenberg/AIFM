'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { RefreshCw, LogOut } from 'lucide-react';

interface HealthData {
  clients: number;
  tasks: number;
  reports: number;
  investors: number;
  taskStats: Record<string, number>;
  reportStats: Record<string, number>;
}

export default function AdminDashboardPage() {
  const { data: session } = useSession();
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const loadHealth = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        throw new Error('Failed to load stats');
      }
      const data = await response.json();
      setHealth(data);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load health:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!health) {
    return (
      <div className="min-h-screen bg-white">
        <div className="page-container text-center py-12">
          <div className="animate-pulse">Loading system status...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Simple Header */}
      <div className="border-b border-gray-200 bg-white sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="font-bold text-xl">AIFM ADMIN</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{session?.user?.email}</span>
            <button
              onClick={() => signOut({ redirect: true, callbackUrl: '/' })}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="page-container">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="section-title">Admin Dashboard</h1>
            <p className="section-subtitle">System monitoring & health checks</p>
          </div>
          <Button onClick={loadHealth} disabled={loading}>
            <RefreshCw className="w-4 h-4 mr-2" />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </div>

        {/* Overall Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Clients</CardTitle>
              <CardDescription>Total clients</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{health.clients}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tasks</CardTitle>
              <CardDescription>Total tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{health.tasks}</div>
              <div className="text-sm text-gray-600 mt-2">
                {health.taskStats.NEEDS_REVIEW || 0} need review
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Reports</CardTitle>
              <CardDescription>Total reports</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{health.reports}</div>
              <div className="text-sm text-gray-600 mt-2">
                {health.reportStats.DRAFT || 0} drafts
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Investors</CardTitle>
              <CardDescription>Total investors</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{health.investors}</div>
            </CardContent>
          </Card>
        </div>

        {/* Task Status Breakdown */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Task Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(health.taskStats).map(([status, count]) => (
              <Card key={status}>
                <CardHeader>
                  <CardTitle className="text-sm capitalize">{status.replace(/_/g, ' ')}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count as number}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Report Status Breakdown */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Report Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(health.reportStats).map(([status, count]) => (
              <Card key={status}>
                <CardHeader>
                  <CardTitle className="text-sm capitalize">{status}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{count as number}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* System Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">System Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <div className="font-semibold">
                  {lastRefresh?.toLocaleTimeString()}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Environment:</span>
                <div className="font-semibold">production</div>
              </div>
              <div>
                <span className="text-muted-foreground">Uptime:</span>
                <div className="font-semibold">99.9%</div>
              </div>
              <div>
                <span className="text-muted-foreground">API Version:</span>
                <div className="font-semibold">1.0.0</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
