'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Button } from '@/components/Button';
import { Plus, RefreshCw, Zap, Database, Settings } from 'lucide-react';

interface DataFeed {
  id: string;
  clientId: string;
  source: string;
  status: string;
  configJson: any;
  lastSyncAt?: string | null;
  client?: { name: string };
}

interface Client {
  id: string;
  name: string;
}

export default function DataFeedsPage() {
  const [feeds, setFeeds] = useState<DataFeed[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    source: 'FORTNOX',
    apiKey: '',
    accessToken: '',
    companyId: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [feedsRes, clientsRes] = await Promise.all([
        fetch('/api/datafeeds'),
        fetch('/api/clients'), // Du behöver skapa denna route
      ]);

      if (feedsRes.ok) {
        const feedsData = await feedsRes.json();
        setFeeds(feedsData);
      }

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();
        setClients(clientsData);
      } else {
        // Fallback: hämta från tasks
        const tasksRes = await fetch('/api/tasks');
        if (tasksRes.ok) {
          const tasks = await tasksRes.json();
          const uniqueClients = Array.from(
            new Map(tasks.map((t: any) => [t.client?.id, { id: t.client?.id, name: t.client?.name }])).values()
          ).filter((c: any) => c && c.id) as Client[];
          setClients(uniqueClients);
        }
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFeed = async () => {
    try {
      const configJson: any = {
        apiKey: formData.apiKey,
      };

      if (formData.source === 'FORTNOX') {
        if (formData.accessToken) configJson.accessToken = formData.accessToken;
        if (formData.companyId) configJson.companyId = formData.companyId;
      }

      const response = await fetch('/api/datafeeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: formData.clientId,
          source: formData.source,
          configJson,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create feed');
      }

      await loadData();
      setShowForm(false);
      setFormData({
        clientId: '',
        source: 'FORTNOX',
        apiKey: '',
        accessToken: '',
        companyId: '',
      });
      alert('DataFeed created successfully!');
    } catch (error) {
      console.error('Failed to create feed:', error);
      alert('Failed to create feed. Check console for details.');
    }
  };

  const handleSync = async (clientId: string, source: string) => {
    try {
      const response = await fetch('/api/datafeeds/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          source,
          period: {
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            end: new Date().toISOString(),
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to trigger sync');
      }

      alert('Sync triggered! Check workers for status.');
    } catch (error) {
      console.error('Failed to trigger sync:', error);
      alert('Failed to trigger sync. Check console for details.');
    }
  };

  const handleCreateTask = async (clientId: string, kind: string) => {
    try {
      const payload: any = {
        periodStart: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        periodEnd: new Date().toISOString(),
      };

      if (kind === 'KYC_REVIEW') {
        payload.investorId = prompt('Enter investor ID:');
        if (!payload.investorId) return;
      } else if (kind === 'REPORT_DRAFT') {
        payload.reportType = 'FUND_ACCOUNTING';
      }

      const response = await fetch('/api/tasks/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId,
          kind,
          payload,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create task');
      }

      await response.json(); // Parse response but don't use it
      alert(`Task created! Check Coordinator Inbox to review.`);
      window.location.href = '/coordinator/inbox';
    } catch (error) {
      console.error('Failed to create task:', error);
      alert('Failed to create task. Check console for details.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="page-container py-8">
          <div className="animate-pulse text-gray-500 uppercase tracking-wide">Loading...</div>
        </div>
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
            <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">DATA FEEDS & TASKS</h1>
            <p className="text-gray-600 text-sm uppercase tracking-wide">Configure data sources and trigger processing</p>
          </div>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="rounded-2xl uppercase tracking-wide"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add DataFeed
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <Card className="border-2 border-gray-200 bg-white mb-8 rounded-3xl">
            <CardHeader>
              <CardTitle className="text-xl uppercase tracking-wide">Configure New DataFeed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide mb-2">Client</label>
                <select
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                >
                  <option value="">Select client...</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide mb-2">Source</label>
                <select
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                >
                  <option value="FORTNOX">Fortnox</option>
                  <option value="BANK">Bank (Nordigen)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold uppercase tracking-wide mb-2">API Key</label>
                <input
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="Enter API key..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                />
              </div>

              {formData.source === 'FORTNOX' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                      Access Token (optional)
                    </label>
                    <input
                      type="password"
                      value={formData.accessToken}
                      onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                      placeholder="Enter access token..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
                      Company ID (optional)
                    </label>
                    <input
                      type="text"
                      value={formData.companyId}
                      onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                      placeholder="Enter company ID..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:border-black"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleCreateFeed}
                  className="rounded-2xl uppercase tracking-wide"
                >
                  Create DataFeed
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="rounded-2xl uppercase tracking-wide"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* DataFeeds List */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide">Configured DataFeeds</h2>
          {feeds.length === 0 ? (
            <Card className="border-2 border-dashed border-gray-300 bg-white rounded-3xl">
              <CardContent className="text-center py-16">
                <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-bold text-black uppercase tracking-wide mb-2">No DataFeeds</p>
                <p className="text-gray-600 text-sm uppercase tracking-wide">
                  Click "Add DataFeed" to configure Fortnox or Bank integration
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {feeds.map((feed) => (
                <Card key={feed.id} className="border-2 border-gray-200 bg-white hover:shadow-lg transition-all duration-200 rounded-3xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg uppercase tracking-wide">{feed.source}</CardTitle>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        feed.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {feed.status}
                      </span>
                    </div>
                    {feed.client && (
                      <p className="text-sm text-gray-600 mt-1">{feed.client.name}</p>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button
                        size="sm"
                        onClick={() => handleSync(feed.clientId, feed.source)}
                        className="w-full rounded-2xl uppercase tracking-wide"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Now
                      </Button>
                      <div className="text-xs text-gray-500">
                        Last sync: {feed.lastSyncAt ? new Date(feed.lastSyncAt as string).toLocaleString() : 'Never'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Trigger Tasks */}
        <div>
          <h2 className="text-2xl font-bold mb-4 uppercase tracking-wide">Trigger AI Tasks</h2>
          <div className="grid md:grid-cols-3 gap-4">
            {clients.map((client) => (
              <Card key={client.id} className="border-2 border-gray-200 bg-white hover:shadow-lg transition-all duration-200 rounded-3xl">
                <CardHeader>
                  <CardTitle className="text-lg uppercase tracking-wide">{client.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    size="sm"
                    onClick={() => handleCreateTask(client.id, 'BANK_RECON')}
                    className="w-full rounded-2xl uppercase tracking-wide"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Bank Reconciliation
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCreateTask(client.id, 'KYC_REVIEW')}
                    className="w-full rounded-2xl uppercase tracking-wide"
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    KYC Review
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleCreateTask(client.id, 'REPORT_DRAFT')}
                    className="w-full rounded-2xl uppercase tracking-wide"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Report Draft
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

