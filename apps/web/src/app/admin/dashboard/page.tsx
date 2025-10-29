'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { Header } from '@/components/Header';
import { RefreshCw, LogOut, Users, FileText, BarChart3, Activity, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface HealthData {
  clients: number;
  tasks: number;
  reports: number;
  investors: number;
  taskStats: Record<string, number>;
  reportStats: Record<string, number>;
}

type DashboardTab = 'OVERVIEW' | 'TASKS' | 'REPORTS';

export default function AdminDashboardPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<DashboardTab>('OVERVIEW');
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
    <div className="min-h-screen bg-gray-50">
      <Header />
      {/* Main Content */}
      <div className="page-container py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
            <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">ADMIN DASHBOARD</h1>
            <p className="text-gray-600 text-sm uppercase tracking-wide">System monitoring & health checks</p>
        </div>
          <Button onClick={loadHealth} disabled={loading} className="rounded-2xl uppercase tracking-wide">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link href="/admin/activity">
            <Card className="border-2 border-gray-200 bg-white hover:shadow-xl hover:border-blue-300 transition-all duration-200 rounded-3xl cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg uppercase tracking-wide mb-2">System Activity</CardTitle>
                    <p className="text-sm text-gray-600">Live monitoring of workflow</p>
                  </div>
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          <Link href="/admin/ai-chat">
            <Card className="border-2 border-gray-200 bg-white hover:shadow-xl hover:border-purple-300 transition-all duration-200 rounded-3xl cursor-pointer group">
              <CardContent className="pt-6">
            <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg uppercase tracking-wide mb-2">AI Assistant</CardTitle>
                    <p className="text-sm text-gray-600">Chat with AI about your system</p>
                  </div>
                  <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('OVERVIEW')}
              className={`
                flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wide
                border-b-2 transition-all duration-200 whitespace-nowrap
                ${activeTab === 'OVERVIEW' 
                  ? 'border-black text-black bg-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('TASKS')}
              className={`
                flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wide
                border-b-2 transition-all duration-200 whitespace-nowrap
                ${activeTab === 'TASKS' 
                  ? 'border-black text-black bg-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Activity className="w-4 h-4" />
              <span>Tasks</span>
              {health && Object.values(health.taskStats).reduce((a, b) => a + b, 0) > 0 && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold
                  ${activeTab === 'TASKS' ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {Object.values(health.taskStats).reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('REPORTS')}
              className={`
                flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wide
                border-b-2 transition-all duration-200 whitespace-nowrap
                ${activeTab === 'REPORTS' 
                  ? 'border-black text-black bg-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <FileText className="w-4 h-4" />
              <span>Reports</span>
              {health && Object.values(health.reportStats).reduce((a, b) => a + b, 0) > 0 && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold
                  ${activeTab === 'REPORTS' ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {Object.values(health.reportStats).reduce((a, b) => a + b, 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'OVERVIEW' && (
          <>
            {/* Overall Status */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <Card className="border-2 border-gray-200 bg-white hover:shadow-lg transition-all duration-200 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg uppercase tracking-wide">Clients</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-wide">Total clients</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{health.clients}</div>
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-blue-600" />
                    </div>
            </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 bg-white hover:shadow-lg transition-all duration-200 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg uppercase tracking-wide">Tasks</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-wide">Total tasks</CardDescription>
          </CardHeader>
          <CardContent>
                  <div className="flex items-center justify-between">
              <div>
                      <div className="text-3xl font-bold">{health.tasks}</div>
                      <div className="text-sm text-gray-600 mt-2">
                        {health.taskStats.NEEDS_REVIEW || 0} need review
                      </div>
              </div>
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center">
                      <Activity className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

              <Card className="border-2 border-gray-200 bg-white hover:shadow-lg transition-all duration-200 rounded-3xl">
          <CardHeader>
                  <CardTitle className="text-lg uppercase tracking-wide">Reports</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-wide">Total reports</CardDescription>
                </CardHeader>
                <CardContent>
            <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold">{health.reports}</div>
                      <div className="text-sm text-gray-600 mt-2">
                        {health.reportStats.DRAFT || 0} drafts
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-green-600" />
                    </div>
            </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 bg-white hover:shadow-lg transition-all duration-200 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg uppercase tracking-wide">Investors</CardTitle>
                  <CardDescription className="text-xs uppercase tracking-wide">Total investors</CardDescription>
          </CardHeader>
          <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold">{health.investors}</div>
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center">
                      <Users className="w-6 h-6 text-purple-600" />
                    </div>
            </div>
          </CardContent>
        </Card>
      </div>
          </>
        )}

        {activeTab === 'TASKS' && (
      <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide">Task Status Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Object.entries(health.taskStats).map(([status, count]) => (
                <Card key={status} className="border-2 border-gray-200 bg-white hover:shadow-lg transition-all duration-200 rounded-3xl">
              <CardHeader>
                    <CardTitle className="text-sm capitalize uppercase tracking-wide">{status.replace(/_/g, ' ')}</CardTitle>
              </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{count as number}</div>
                  </CardContent>
                </Card>
              ))}
                </div>
                </div>
        )}

        {activeTab === 'REPORTS' && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide">Report Status Breakdown</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(health.reportStats).map(([status, count]) => (
                <Card key={status} className="border-2 border-gray-200 bg-white hover:shadow-lg transition-all duration-200 rounded-3xl">
                  <CardHeader>
                    <CardTitle className="text-sm capitalize uppercase tracking-wide">{status}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{count as number}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
        )}

      {/* System Info */}
        <Card className="border-2 border-gray-200 bg-white rounded-3xl">
        <CardHeader>
            <CardTitle className="text-lg uppercase tracking-wide">System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
                <span className="text-gray-600 uppercase tracking-wide">Last Updated:</span>
                <div className="font-semibold mt-1">
                {lastRefresh?.toLocaleTimeString()}
              </div>
            </div>
            <div>
                <span className="text-gray-600 uppercase tracking-wide">Environment:</span>
                <div className="font-semibold mt-1 uppercase">production</div>
            </div>
            <div>
                <span className="text-gray-600 uppercase tracking-wide">Uptime:</span>
                <div className="font-semibold mt-1">99.9%</div>
            </div>
            <div>
                <span className="text-gray-600 uppercase tracking-wide">API Version:</span>
                <div className="font-semibold mt-1">1.0.0</div>
              </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
