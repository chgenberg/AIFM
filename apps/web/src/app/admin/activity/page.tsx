'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Header } from '@/components/Header';
import { Activity, TrendingUp, FileText, Shield, CheckCircle2, Zap, ArrowRight, Power, PowerOff } from 'lucide-react';

interface ActivityData {
  recentTasks: Array<{
    id: string;
    kind: string;
    status: string;
    updatedAt: string;
    client?: { name: string };
    flags?: Array<{ severity: string }>;
  }>;
  stats: {
    totalTasks: number;
    tasksByStatus: Record<string, number>;
    tasksByKind: Record<string, number>;
  };
  activity: Array<{
    id: string;
    kind: string;
    status: string;
    updatedAt: string;
    client?: { name: string };
  }>;
}

const STATUS_COLORS = {
  QUEUED: 'bg-gray-200 text-gray-700',
  IN_PROGRESS: 'bg-blue-200 text-blue-700',
  NEEDS_REVIEW: 'bg-orange-200 text-orange-700',
  BLOCKED: 'bg-red-200 text-red-700',
  DONE: 'bg-green-200 text-green-700',
};

const KIND_ICONS = {
  BANK_RECON: TrendingUp,
  KYC_REVIEW: Shield,
  REPORT_DRAFT: FileText,
  QC_CHECK: CheckCircle2,
};

export default function SystemActivityPage() {
  const [data, setData] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadActivity();
    const interval = setInterval(() => {
      if (autoRefresh) {
        loadActivity();
      }
    }, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadActivity = async () => {
    try {
      const response = await fetch('/api/system/activity');
      if (!response.ok) throw new Error('Failed to load');
      const json = await response.json();
      setData(json);
    } catch (error) {
      console.error('Failed to load activity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 uppercase tracking-wide">Loading system activity...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="page-container py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">SYSTEM ACTIVITY</h1>
            <p className="text-gray-600 text-sm uppercase tracking-wide">Live monitoring of system workflow</p>
          </div>
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-2xl text-sm font-semibold uppercase tracking-wide transition-all flex items-center gap-2 ${
              autoRefresh
                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                : 'bg-gray-100 text-gray-700 border-2 border-gray-300'
            }`}
          >
            {autoRefresh ? (
              <>
                <Power className="w-4 h-4 text-green-600" />
                Auto Refresh ON
              </>
            ) : (
              <>
                <PowerOff className="w-4 h-4 text-gray-600" />
                Auto Refresh OFF
              </>
            )}
          </button>
        </div>

        {/* Flow Visualization */}
        <Card className="border-2 border-gray-200 bg-white mb-8 rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl uppercase tracking-wide flex items-center gap-3">
              <Activity className="w-6 h-6" />
              Task Flow Pipeline
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-4 relative">
              {['QUEUED', 'IN_PROGRESS', 'NEEDS_REVIEW', 'BLOCKED', 'DONE'].map((status, idx) => {
                const count = data.stats.tasksByStatus[status] || 0;
                const total = data.stats.totalTasks;
                const percentage = total > 0 ? (count / total) * 100 : 0;
                
                return (
                  <div key={status} className="text-center relative">
                    <div className={`w-full h-8 rounded-2xl mb-2 flex items-center justify-center font-bold text-sm ${STATUS_COLORS[status as keyof typeof STATUS_COLORS] || 'bg-gray-200'}`}>
                      {count}
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-700 mb-1">
                      {status.replace(/_/g, ' ')}
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          STATUS_COLORS[status as keyof typeof STATUS_COLORS]?.split(' ')[0] || 'bg-gray-300'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    {idx < 4 && (
                      <div className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-2 hidden md:block">
                        <ArrowRight className="w-4 h-4 text-gray-400" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-gray-200 bg-white hover:shadow-lg transition-all duration-200 rounded-3xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Total Tasks</p>
                  <p className="text-3xl font-bold text-black mt-2">{data.stats.totalTasks}</p>
                </div>
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Activity className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {Object.entries(data.stats.tasksByKind).slice(0, 3).map(([kind, count]) => {
            const Icon = KIND_ICONS[kind as keyof typeof KIND_ICONS] || Activity;
            return (
              <Card key={kind} className="border-2 border-gray-200 bg-white hover:shadow-lg transition-all duration-200 rounded-3xl">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">
                        {kind.replace(/_/g, ' ')}
                      </p>
                      <p className="text-3xl font-bold text-black mt-2">{count as number}</p>
                    </div>
                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity Timeline */}
        <Card className="border-2 border-gray-200 bg-white rounded-3xl">
          <CardHeader>
            <CardTitle className="text-xl uppercase tracking-wide flex items-center gap-3">
              <Zap className="w-6 h-6" />
              Recent Activity (Last 24 Hours)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.activity.length === 0 ? (
                <div className="text-center py-12 text-gray-500 uppercase tracking-wide">
                  No recent activity
                </div>
              ) : (
                data.activity.map((item) => {
                  const Icon = KIND_ICONS[item.kind as keyof typeof KIND_ICONS] || Activity;
                  const statusColor = STATUS_COLORS[item.status as keyof typeof STATUS_COLORS] || 'bg-gray-200';
                  
                  return (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 border-2 border-gray-100 rounded-2xl hover:border-gray-200 transition-all duration-200"
                    >
                      <div className="w-10 h-10 bg-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-black uppercase tracking-wide">
                            {item.kind.replace(/_/g, ' ')}
                          </span>
                          {item.client && (
                            <span className="text-xs text-gray-500">• {item.client.name}</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(item.updatedAt).toLocaleString()}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColor}`}>
                        {item.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

