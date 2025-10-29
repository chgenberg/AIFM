'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { apiClient } from '@/lib/api-client';
import { exportTasksToCSV } from '@/lib/export';
import { successToast, errorToast } from '@/lib/toast';
import { formatDate } from '@/lib/utils';
import { Check, X, Download, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface Task {
  id: string;
  kind: string;
  status: string;
  createdAt: string;
  flags?: Array<{ id: string; type: string; message: string }>;
}

export default function CoordinatorInboxPage() {
  const userId = 'test-coordinator-001';
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; taskId: string | null }>({
    isOpen: false,
    taskId: null,
  });
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const mockTasks: Task[] = [
        {
          id: '1',
          kind: 'QC_CHECK',
          status: 'PENDING',
          createdAt: new Date().toISOString(),
          flags: [
            { id: 'f1', type: 'error', message: 'Reconciliation variance > 0.01%' },
            { id: 'f2', type: 'warning', message: 'Bank feed older than 24 hours' },
          ],
        },
        {
          id: '2',
          kind: 'QC_CHECK',
          status: 'PENDING',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          flags: [{ id: 'f3', type: 'warning', message: 'Missing supporting documents' }],
        },
      ];
      setTasks(mockTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      errorToast('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!confirmModal.taskId) return;
    try {
      setApproving(true);
      await apiClient.approveTask(confirmModal.taskId);
      setTasks((prev) => prev.filter((t) => t.id !== confirmModal.taskId));
      setConfirmModal({ isOpen: false, taskId: null });
      successToast('Task approved successfully');
    } catch (error) {
      console.error('Approve failed:', error);
      errorToast('Failed to approve task');
    } finally {
      setApproving(false);
    }
  };

  const handleExport = () => {
    try {
      exportTasksToCSV(tasks);
      successToast('Tasks exported to CSV');
    } catch (error) {
      console.error('Export failed:', error);
      errorToast('Failed to export tasks');
    }
  };

  const errorCount = tasks.reduce((sum, t) => sum + (t.flags?.filter(f => f.type === 'error').length || 0), 0);
  const warningCount = tasks.reduce((sum, t) => sum + (t.flags?.filter(f => f.type === 'warning').length || 0), 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="mb-8 animate-slideInDown">
        <h1 className="text-4xl font-bold text-black mb-2">Quality Control Inbox</h1>
        <p className="text-gray-600">Review and approve pending quality checks</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Total Tasks</p>
                <p className="text-3xl font-bold text-black mt-2">{tasks.length}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Errors</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{errorCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Warnings</p>
                <p className="text-3xl font-bold text-orange-600 mt-2">{warningCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 bg-white">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Ready</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{tasks.filter(t => !t.flags || t.flags.length === 0).length}</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {tasks.length} pending task{tasks.length !== 1 ? 's' : ''}
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2 border-gray-300">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-pulse text-gray-500">Loading tasks...</div>
        </div>
      ) : tasks.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
          <CardContent className="text-center py-16">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <p className="text-lg font-semibold text-black">All Done</p>
            <p className="text-gray-600 mt-2">No pending QC tasks. Great work!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, idx) => (
            <Card key={task.id} className="border-gray-200 bg-white overflow-hidden hover:shadow-md">
              <div className="flex">
                {/* Left border indicator */}
                <div className={`w-1 ${task.flags?.some(f => f.type === 'error') ? 'bg-red-600' : task.flags?.length ? 'bg-orange-600' : 'bg-green-600'}`} />
                
                <div className="flex-1 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-base font-semibold text-black flex items-center gap-3">
                        {task.kind.replace(/_/g, ' ')}
                        <span className={`text-xs font-medium px-2.5 py-1 rounded ${task.flags?.some(f => f.type === 'error') ? 'bg-red-100 text-red-700' : task.flags?.length ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                          {task.flags?.some(f => f.type === 'error') ? 'Review' : task.flags?.length ? 'Warnings' : 'Ready'}
                        </span>
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Created {formatDate(task.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Flags */}
                  {task.flags && task.flags.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {task.flags.map((flag) => (
                        <div
                          key={flag.id}
                          className={`flex items-start gap-3 p-3 rounded text-sm ${
                            flag.type === 'error'
                              ? 'bg-red-50 border border-red-200 text-red-900'
                              : 'bg-orange-50 border border-orange-200 text-orange-900'
                          }`}
                        >
                          <div className="mt-0.5">
                            <AlertCircle className={`w-4 h-4 ${flag.type === 'error' ? 'text-red-600' : 'text-orange-600'}`} />
                          </div>
                          <div>
                            <p className="font-medium text-xs uppercase">{flag.type}</p>
                            <p className="text-xs mt-1">{flag.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      className="gap-2 bg-black text-white hover:bg-gray-900"
                      onClick={() => setConfirmModal({ isOpen: true, taskId: task.id })}
                    >
                      <Check className="w-4 h-4" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-2 border-gray-300"
                      onClick={() => setConfirmModal({ isOpen: true, taskId: task.id })}
                    >
                      <X className="w-4 h-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        title="Confirm Action"
        onConfirm={handleApprove}
        onCancel={() => setConfirmModal({ isOpen: false, taskId: null })}
        confirmText="Approve"
        confirmLoading={approving}
      >
        <p className="text-gray-700">Are you sure you want to approve this task?</p>
      </Modal>
    </div>
  );
}
