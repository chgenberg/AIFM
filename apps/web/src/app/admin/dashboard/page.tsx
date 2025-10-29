'use client';

import { useEffect, useState } from 'react';
import Navigation from '@/components/Navigation';
import { Button } from '@/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

// Mock user for testing
const userId = 'test-admin-001';

interface HealthData {
  timestamp: string;
  checks: {
    database: {
      status: string;
      latency: string;
    };
    queue: {
      status: string;
      queues: Record<string, any>;
    };
  };
}

export default function AdminDashboardPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  useEffect(() => {
    if (!userId) return;
    loadHealth();
    const interval = setInterval(loadHealth, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [userId]);

  const loadHealth = async () => {
    try {
      setLoading(true);
      // In a real application, you would use an authenticated API client here
      // For this example, we'll simulate a successful response
      const mockHealthData: HealthData = {
        timestamp: new Date().toISOString(),
        checks: {
          database: {
            status: 'healthy',
            latency: '10ms',
          },
          queue: {
            status: 'healthy',
            queues: {
              'email-queue': { count: 10, active: 2, delayed: 0 },
              'notification-queue': { count: 5, active: 1, delayed: 0 },
              'payment-queue': { count: 2, active: 0, delayed: 0 },
            },
          },
        },
      };
      setHealth(mockHealthData);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Failed to load health:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!health) {
    return (
      <div className="page-container text-center py-12">
        <div className="animate-pulse">Loading system status...</div>
      </div>
    );
  }

  const dbHealthy = health.checks.database.status === 'healthy';
  const queueHealthy = health.checks.queue.status === 'healthy';

  return (
    <div className="page-container">
      <Navigation />
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
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Database</CardTitle>
              {dbHealthy ? (
                <CheckCircle className="w-6 h-6 text-success" />
              ) : (
                <AlertCircle className="w-6 h-6 text-danger" />
              )}
            </div>
            <CardDescription>{health.checks.database.status}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              <div>
                <span className="text-muted-foreground">Latency:</span>
                <span className="ml-2 font-semibold">{health.checks.database.latency}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Timestamp:</span>
                <span className="ml-2 font-semibold">
                  {new Date(health.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Job Queue</CardTitle>
              {queueHealthy ? (
                <CheckCircle className="w-6 h-6 text-success" />
              ) : (
                <AlertCircle className="w-6 h-6 text-danger" />
              )}
            </div>
            <CardDescription>{health.checks.queue.status}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-muted-foreground">
              {Object.keys(health.checks.queue.queues).length} queues active
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Queue Details */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Queue Status</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(health.checks.queue.queues).map(([name, stats]: any) => (
            <Card key={name}>
              <CardHeader>
                <CardTitle className="text-sm capitalize">{name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Waiting:</span>
                  <span className="ml-2 font-semibold">{stats.count || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Active:</span>
                  <span className="ml-2 font-semibold">{stats.active || 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Delayed:</span>
                  <span className="ml-2 font-semibold">{stats.delayed || 0}</span>
                </div>
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
  );
}
