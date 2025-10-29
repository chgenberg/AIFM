/**
 * Export utilities for CSV and other formats
 */

/**
 * Convert array of objects to CSV string
 */
export const objectsToCSV = (data: Record<string, any>[]): string => {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.map((h) => `"${h}"`).join(',');

  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        if (value === null || value === undefined) return '""';
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return `"${value}"`;
      })
      .join(',')
  );

  return [csvHeaders, ...csvRows].join('\n');
};

/**
 * Download CSV file
 */
export const downloadCSV = (data: Record<string, any>[], filename: string) => {
  const csv = objectsToCSV(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export tasks to CSV
 */
export const exportTasksToCSV = (tasks: any[]) => {
  const data = tasks.map((task) => ({
    ID: task.id,
    Kind: task.kind,
    Status: task.status,
    'Created At': new Date(task.createdAt).toLocaleString(),
    'Updated At': new Date(task.updatedAt).toLocaleString(),
    'Flag Count': task.flags?.length || 0,
    Assignee: task.assigneeId || 'Unassigned',
  }));

  downloadCSV(data, `tasks-${new Date().toISOString().split('T')[0]}`);
};

/**
 * Export reports to CSV
 */
export const exportReportsToCSV = (reports: any[]) => {
  const data = reports.map((report) => ({
    ID: report.id,
    Type: report.type,
    Status: report.status,
    'Period Start': new Date(report.periodStart).toLocaleDateString(),
    'Period End': new Date(report.periodEnd).toLocaleDateString(),
    'Created At': new Date(report.createdAt).toLocaleString(),
    'Sign-offs': report.signOffs?.length || 0,
    'Versions': report.versions?.length || 0,
  }));

  downloadCSV(data, `reports-${new Date().toISOString().split('T')[0]}`);
};

/**
 * Export data feeds to CSV
 */
export const exportDataFeedsToCSV = (feeds: any[]) => {
  const data = feeds.map((feed) => ({
    ID: feed.id,
    Source: feed.source,
    Status: feed.status,
    'Last Synced': feed.lastSyncedAt ? new Date(feed.lastSyncedAt).toLocaleString() : 'Never',
    'Created At': new Date(feed.createdAt).toLocaleString(),
  }));

  downloadCSV(data, `datafeeds-${new Date().toISOString().split('T')[0]}`);
};

/**
 * Export to JSON (for debugging)
 */
export const downloadJSON = (data: any, filename: string) => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.json`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
