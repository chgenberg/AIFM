'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { formatDate } from '@/lib/utils';
import { Edit2, Check, Eye } from 'lucide-react';

interface Report {
  id: string;
  type: string;
  status: string;
  periodStart: Date | string;
  periodEnd: Date | string;
  draftText?: string | null;
  artifactUrl?: string | null;
  client?: { name: string };
}

const STATUSES = ['DRAFT', 'QC', 'APPROVAL', 'PUBLISHED'];

export default function SpecialistBoardPage() {
  const [reports, setReports] = useState<Record<string, Report[]>>({
    DRAFT: [],
    QC: [],
    APPROVAL: [],
    PUBLISHED: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reports');
      if (!response.ok) {
        throw new Error('Failed to load reports');
      }
      const data: Report[] = await response.json();

      const grouped: Record<string, Report[]> = {
        DRAFT: [],
        QC: [],
        APPROVAL: [],
        PUBLISHED: [],
      };

      data.forEach((report: Report) => {
        if (grouped[report.status]) {
          grouped[report.status].push(report);
        }
      });

      setReports(grouped);
    } catch (error) {
      console.error('Failed to load reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const moveReport = async (reportId: string, newStatus: string) => {
    try {
      // This function is not used in the current mock data loading,
      // but keeping it as it was in the original file.
      // In a real scenario, you would call an API client here.
      console.log(`Moving report ${reportId} to status: ${newStatus}`);
      // For now, we'll just reload reports to simulate the effect
      loadReports();
    } catch (error) {
      console.error('Failed to move report:', error);
    }
  };

  return (
    <div className="page-container">
      <div className="mb-8">
        <h1 className="section-title">Delivery Board</h1>
        <p className="section-subtitle">Manage report approvals and publications</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {STATUSES.map((status) => (
          <Card key={status}>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{reports[status].length}</div>
              <div className="text-sm text-muted-foreground">{status}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Kanban Board */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading reports...</div>
      ) : (
        <div className="grid grid-cols-4 gap-4">
          {STATUSES.map((status) => (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-4 text-sm">{status}</h3>
              <div className="space-y-3 min-h-[500px]">
                {reports[status].map((report) => (
                  <Card
                    key={report.id}
                    className="cursor-move hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">{report.type.replace(/_/g, ' ')}</CardTitle>
                      {report.client && <p className="text-xs text-gray-500 mt-1">{report.client.name}</p>}
                      <CardDescription className="text-xs">
                        {formatDate(typeof report.periodStart === 'string' ? report.periodStart : report.periodStart.toISOString())} – {formatDate(typeof report.periodEnd === 'string' ? report.periodEnd : report.periodEnd.toISOString())}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 flex-wrap mb-3">
                        {report.draftText && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                            Draft
                          </span>
                        )}
                        {report.artifactUrl && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                            PDF ready
                          </span>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        {status !== 'PUBLISHED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.location.href = `/specialist/${report.id}/edit`}
                          >
                            <Edit2 className="w-3 h-3" />
                          </Button>
                        )}

                        {status !== 'PUBLISHED' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              const nextStatus = STATUSES[STATUSES.indexOf(status) + 1];
                              moveReport(report.id, nextStatus);
                            }}
                          >
                            <Check className="w-3 h-3" />
                          </Button>
                        )}

                        {status === 'PUBLISHED' && report.artifactUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => window.open(report.artifactUrl)}
                          >
                            <Eye className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {reports[status].length === 0 && (
                  <div className="text-center py-8 text-muted-foreground text-sm">
                    No reports
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
