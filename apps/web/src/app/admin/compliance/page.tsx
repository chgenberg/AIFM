'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Header } from '@/components/Header';
import { Button } from '@/components/Button';
import { RefreshCw, Shield, AlertCircle, Calendar, FileCheck, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { errorToast } from '@/lib/toast';

interface KYCRecord {
  id: string;
  clientId: string;
  client: {
    name: string;
  };
  investorId: string | null;
  investor: {
    name: string;
  } | null;
  status: string;
  riskLevel: string | null;
  pepStatus: string | null;
  sanctionStatus: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ComplianceData {
  kycRecords: KYCRecord[];
  pending: number;
  approved: number;
  rejected: number;
  flagged: number;
  upcomingDeadlines: any[];
}

type ComplianceTab = 'OVERVIEW' | 'KYC' | 'DEADLINES' | 'REGISTER';

export default function CompliancePage() {
  const [complianceData, setComplianceData] = useState<ComplianceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<ComplianceTab>('OVERVIEW');
  const [kycFilter, setKycFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED'>('ALL');

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/compliance/status');
      if (!response.ok) {
        throw new Error('Failed to load compliance data');
      }
      const data = await response.json();
      setComplianceData(data);
    } catch (error) {
      console.error('Failed to load compliance data:', error);
      errorToast('Failed to load compliance data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'IN_REVIEW':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'PENDING':
        return 'bg-gray-100 text-gray-700 border-gray-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getRiskColor = (riskLevel: string | null) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-700 border-green-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'high':
        return 'bg-red-100 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading && !complianceData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="page-container py-12 text-center">
          <div className="animate-pulse">Loading compliance data...</div>
        </div>
      </div>
    );
  }

  const kycRecords = complianceData?.kycRecords || [];
  const pending = complianceData?.pending || 0;
  const approved = complianceData?.approved || 0;
  const rejected = complianceData?.rejected || 0;
  const flagged = complianceData?.flagged || 0;

  const filteredKycRecords = kycFilter === 'ALL'
    ? kycRecords
    : kycRecords.filter(r => {
        if (kycFilter === 'FLAGGED') {
          return r.pepStatus === 'flagged' || r.sanctionStatus === 'flagged' || r.riskLevel === 'high';
        }
        return r.status === kycFilter;
      });

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="page-container py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">COMPLIANCE & GOVERNANCE</h1>
            <p className="text-gray-600 text-sm uppercase tracking-wide">Regulatory compliance and governance oversight</p>
          </div>
          <Button onClick={loadComplianceData} disabled={loading} className="rounded-2xl uppercase tracking-wide">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Refreshing...' : 'Refresh'}
          </Button>
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
              <Shield className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('KYC')}
              className={`
                flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wide
                border-b-2 transition-all duration-200 whitespace-nowrap
                ${activeTab === 'KYC' 
                  ? 'border-black text-black bg-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <FileCheck className="w-4 h-4" />
              <span>KYC Records</span>
              {kycRecords.length > 0 && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold
                  ${activeTab === 'KYC' ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}
                `}>
                  {kycRecords.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('DEADLINES')}
              className={`
                flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wide
                border-b-2 transition-all duration-200 whitespace-nowrap
                ${activeTab === 'DEADLINES' 
                  ? 'border-black text-black bg-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <Calendar className="w-4 h-4" />
              <span>Deadlines</span>
              {complianceData?.upcomingDeadlines && complianceData.upcomingDeadlines.length > 0 && (
                <span className={`
                  px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500 text-white
                `}>
                  {complianceData.upcomingDeadlines.length}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('REGISTER')}
              className={`
                flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wide
                border-b-2 transition-all duration-200 whitespace-nowrap
                ${activeTab === 'REGISTER' 
                  ? 'border-black text-black bg-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Compliance Register</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'OVERVIEW' && (
          <div className="space-y-6">
            {/* Compliance Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="border-2 border-gray-200 bg-white rounded-3xl">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm uppercase tracking-wide text-gray-600 mb-2">Pending KYC</CardTitle>
                      <p className="text-3xl font-bold text-black">{pending}</p>
                    </div>
                    <div className="w-14 h-14 bg-yellow-50 rounded-2xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 bg-white rounded-3xl">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm uppercase tracking-wide text-gray-600 mb-2">Approved</CardTitle>
                      <p className="text-3xl font-bold text-black">{approved}</p>
                    </div>
                    <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 bg-white rounded-3xl">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm uppercase tracking-wide text-gray-600 mb-2">Rejected</CardTitle>
                      <p className="text-3xl font-bold text-black">{rejected}</p>
                    </div>
                    <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                      <XCircle className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2 border-gray-200 bg-white rounded-3xl">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-sm uppercase tracking-wide text-gray-600 mb-2">Flagged</CardTitle>
                      <p className="text-3xl font-bold text-black">{flagged}</p>
                    </div>
                    <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center">
                      <AlertCircle className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent KYC Records */}
            <Card className="border-2 border-gray-200 bg-white rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl uppercase tracking-wide">Recent KYC Records</CardTitle>
              </CardHeader>
              <CardContent>
                {kycRecords.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>No KYC records found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {kycRecords.slice(0, 5).map((record) => (
                      <div
                        key={record.id}
                        className="p-4 border-2 border-gray-200 rounded-2xl hover:border-gray-300 transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold text-black">
                                {record.investor?.name || 'Unknown Investor'}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(record.status)}`}>
                                {record.status}
                              </span>
                              {record.riskLevel && (
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getRiskColor(record.riskLevel)}`}>
                                  {record.riskLevel.toUpperCase()} RISK
                                </span>
                              )}
                              {(record.pepStatus === 'flagged' || record.sanctionStatus === 'flagged') && (
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border-2 border-red-300">
                                  FLAGGED
                                </span>
                              )}
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-gray-600">Client:</span>
                                <span className="ml-2 font-semibold">{record.client.name}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">PEP Status:</span>
                                <span className="ml-2 font-semibold">{record.pepStatus || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="text-gray-600">Sanctions:</span>
                                <span className="ml-2 font-semibold">{record.sanctionStatus || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'KYC' && (
          <div className="space-y-4">
            {/* KYC Filter */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {(['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'FLAGGED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setKycFilter(filter)}
                  className={`
                    px-4 py-2 rounded-2xl text-sm font-semibold uppercase tracking-wide whitespace-nowrap
                    transition-all border-2
                    ${kycFilter === filter
                      ? 'bg-black text-white border-black'
                      : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                    }
                  `}
                >
                  {filter}
                </button>
              ))}
            </div>

            {filteredKycRecords.length === 0 ? (
              <Card className="border-2 border-gray-200 bg-white rounded-3xl">
                <CardContent className="py-12 text-center text-gray-500">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No KYC records found</p>
                </CardContent>
              </Card>
            ) : (
              filteredKycRecords.map((record) => (
                <Card key={record.id} className="border-2 border-gray-200 bg-white rounded-3xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-xl font-bold text-black">
                          {record.investor?.name || 'Unknown Investor'}
                        </CardTitle>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getStatusColor(record.status)}`}>
                          {record.status}
                        </span>
                        {record.riskLevel && (
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border-2 ${getRiskColor(record.riskLevel)}`}>
                            {record.riskLevel.toUpperCase()} RISK
                          </span>
                        )}
                        {(record.pepStatus === 'flagged' || record.sanctionStatus === 'flagged') && (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 border-2 border-red-300">
                            FLAGGED
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-600">{formatDate(record.updatedAt)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <h4 className="text-sm uppercase tracking-wide text-gray-600 mb-2">Client</h4>
                        <p className="text-lg font-semibold text-black">{record.client.name}</p>
                      </div>
                      <div>
                        <h4 className="text-sm uppercase tracking-wide text-gray-600 mb-2">PEP Status</h4>
                        <p className="text-lg font-semibold text-black">{record.pepStatus || 'N/A'}</p>
                      </div>
                      <div>
                        <h4 className="text-sm uppercase tracking-wide text-gray-600 mb-2">Sanction Status</h4>
                        <p className="text-lg font-semibold text-black">{record.sanctionStatus || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Created:</span>
                          <span className="ml-2 font-semibold">{formatDate(record.createdAt)}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Updated:</span>
                          <span className="ml-2 font-semibold">{formatDate(record.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'DEADLINES' && (
          <div className="space-y-4">
            {complianceData?.upcomingDeadlines && complianceData.upcomingDeadlines.length > 0 ? (
              complianceData.upcomingDeadlines.map((deadline: any, idx: number) => (
                <Card key={idx} className="border-2 border-yellow-300 bg-yellow-50 rounded-3xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-yellow-600" />
                        <CardTitle className="text-xl font-bold text-black">{deadline.title || 'Regulatory Deadline'}</CardTitle>
                      </div>
                      <span className="text-sm font-semibold text-yellow-700">{formatDate(deadline.date)}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-700">{deadline.description || 'Regulatory reporting deadline'}</p>
                    {deadline.client && (
                      <p className="text-sm text-gray-600 mt-2">Client: {deadline.client}</p>
                    )}
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="border-2 border-gray-200 bg-white rounded-3xl">
                <CardContent className="py-12 text-center text-gray-500">
                  <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <p>No upcoming deadlines</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'REGISTER' && (
          <div className="space-y-4">
            <Card className="border-2 border-gray-200 bg-white rounded-3xl">
              <CardHeader>
                <CardTitle className="text-xl uppercase tracking-wide">Compliance Register</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm uppercase tracking-wide text-gray-600 mb-3">KYC Compliance</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-gray-50 rounded-2xl">
                        <p className="text-2xl font-bold text-black">{kycRecords.length}</p>
                        <p className="text-sm text-gray-600">Total KYC Records</p>
                      </div>
                      <div className="p-4 bg-green-50 rounded-2xl">
                        <p className="text-2xl font-bold text-green-700">{approved}</p>
                        <p className="text-sm text-gray-600">Approved</p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-2xl">
                        <p className="text-2xl font-bold text-red-700">{rejected}</p>
                        <p className="text-sm text-gray-600">Rejected</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm uppercase tracking-wide text-gray-600 mb-3">Risk Monitoring</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="p-4 bg-green-50 rounded-2xl">
                        <p className="text-2xl font-bold text-green-700">
                          {kycRecords.filter(r => r.riskLevel === 'low').length}
                        </p>
                        <p className="text-sm text-gray-600">Low Risk</p>
                      </div>
                      <div className="p-4 bg-yellow-50 rounded-2xl">
                        <p className="text-2xl font-bold text-yellow-700">
                          {kycRecords.filter(r => r.riskLevel === 'medium').length}
                        </p>
                        <p className="text-sm text-gray-600">Medium Risk</p>
                      </div>
                      <div className="p-4 bg-red-50 rounded-2xl">
                        <p className="text-2xl font-bold text-red-700">
                          {kycRecords.filter(r => r.riskLevel === 'high').length}
                        </p>
                        <p className="text-sm text-gray-600">High Risk</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm uppercase tracking-wide text-gray-600 mb-3">Flagged Items</h4>
                    <div className="p-4 bg-red-50 rounded-2xl">
                      <p className="text-2xl font-bold text-red-700">{flagged}</p>
                      <p className="text-sm text-gray-600">PEP or Sanction Flags</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}

