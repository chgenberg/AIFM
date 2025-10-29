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
  periodStart: string;
  periodEnd: string;
  draftText?: string;
  artifactUrl?: string;
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
      // Mock reports for testing
      const mockReports: Report[] = [
        { id: '1', type: 'Monthly Statement', status: 'DRAFT', periodStart: '2024-10-01', periodEnd: '2024-10-31', draftText: 'Report content here...' },
        { id: '2', type: 'Quarterly Report', status: 'QC', periodStart: '2024-Q3', periodEnd: '2024-Q3', draftText: 'Q3 analysis...' },
        { id: '3', type: 'Annual Report', status: 'APPROVAL', periodStart: '2023-01-01', periodEnd: '2023-12-31' },
        { id: '4', type: 'Fund Summary', status: 'PUBLISHED', periodStart: '2024-09-01', periodEnd: '2024-09-30', artifactUrl: 'https://example.com/report.pdf' },
      ];

      const grouped: Record<string, Report[]> = {
        DRAFT: [],
        QC: [],
        APPROVAL: [],
        PUBLISHED: [],
      };

      mockReports.forEach((report: Report) => {
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

  const totalReports = Object.values(reports).reduce((sum, arr) => sum + arr.length, 0);

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
                      <CardTitle className="text-sm">{report.type}</CardTitle>
                      <CardDescription className="text-xs">
                        {formatDate(report.periodStart)} – {formatDate(report.periodEnd)}
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
