'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { Card, CardContent } from '@/components/Card';
import { Modal } from '@/components/Modal';
import { exportTasksToCSV } from '@/lib/export';
import { successToast, errorToast } from '@/lib/toast';
import { formatDate } from '@/lib/utils';
import { Check, X, Download, AlertCircle, CheckCircle2, Clock, TrendingUp, FileText, Shield } from 'lucide-react';

interface Task {
  id: string;
  kind: string;
  status: string;
  createdAt: string;
  client?: { name: string };
  flags?: Array<{ id: string; severity: string; message: string }>;
  payload?: any;
}

type TaskFilter = 'ALL' | 'BANK_RECON' | 'KYC_REVIEW' | 'REPORT_DRAFT';

const TASK_KINDS = {
  ALL: { label: 'All Tasks', icon: Clock, color: 'gray' },
  BANK_RECON: { label: 'Bank Reconciliation', icon: TrendingUp, color: 'blue' },
  KYC_REVIEW: { label: 'KYC Review', icon: Shield, color: 'purple' },
  REPORT_DRAFT: { label: 'Report Draft', icon: FileText, color: 'green' },
};

export default function CoordinatorInboxPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TaskFilter>('ALL');
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
      const response = await fetch('/api/tasks');
      if (!response.ok) {
        throw new Error('Failed to load tasks');
      }
      const data = await response.json();
      setTasks(data);
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
      const response = await fetch(`/api/tasks/${confirmModal.taskId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to approve task');
      }

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

  const filteredTasks = activeTab === 'ALL' 
    ? tasks 
    : tasks.filter(t => t.kind === activeTab);

  const errorCount = filteredTasks.reduce((sum, t) => sum + (t.flags?.filter(f => f.severity === 'error').length || 0), 0);
  const warningCount = filteredTasks.reduce((sum, t) => sum + (t.flags?.filter(f => f.severity === 'warning').length || 0), 0);
  const readyCount = filteredTasks.filter(t => !t.flags || t.flags.length === 0).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="page-container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-black mb-2 tracking-tight">QUALITY CONTROL INBOX</h1>
          <p className="text-gray-600 text-sm uppercase tracking-wide">Review and approve pending quality checks</p>
        </div>

        {/* Tabs */}
        <div className="mb-8 border-b border-gray-200">
          <div className="flex gap-1 overflow-x-auto">
            {(Object.keys(TASK_KINDS) as TaskFilter[]).map((key) => {
              const config = TASK_KINDS[key];
              const Icon = config.icon;
              const count = key === 'ALL' ? tasks.length : tasks.filter(t => t.kind === key).length;
              const isActive = activeTab === key;
              
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={`
                    flex items-center gap-2 px-6 py-3 text-sm font-semibold uppercase tracking-wide
                    border-b-2 transition-all duration-200 whitespace-nowrap
                    ${isActive 
                      ? 'border-black text-black bg-white' 
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{config.label}</span>
                  {count > 0 && (
                    <span className={`
                      px-2 py-0.5 rounded-full text-xs font-bold
                      ${isActive ? 'bg-black text-white' : 'bg-gray-200 text-gray-600'}
                    `}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-2 border-gray-200 bg-white hover:border-gray-300 transition-all duration-200 hover:shadow-lg rounded-3xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Total Tasks</p>
                  <p className="text-3xl font-bold text-black mt-2">{filteredTasks.length}</p>
                </div>
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Clock className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 bg-white hover:border-red-300 transition-all duration-200 hover:shadow-lg rounded-3xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Errors</p>
                  <p className="text-3xl font-bold text-red-600 mt-2">{errorCount}</p>
                </div>
                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 bg-white hover:border-orange-300 transition-all duration-200 hover:shadow-lg rounded-3xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Warnings</p>
                  <p className="text-3xl font-bold text-orange-600 mt-2">{warningCount}</p>
                </div>
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-gray-200 bg-white hover:border-green-300 transition-all duration-200 hover:shadow-lg rounded-3xl">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500 font-semibold">Ready</p>
                  <p className="text-3xl font-bold text-green-600 mt-2">{readyCount}</p>
                </div>
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex items-center justify-between">
        <div className="text-sm text-gray-600 uppercase tracking-wide">
          {filteredTasks.length} pending task{filteredTasks.length !== 1 ? 's' : ''}
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2 border-2 border-gray-300 hover:border-gray-400 rounded-2xl uppercase tracking-wide">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Tasks List */}
      {loading ? (
        <div className="text-center py-16">
          <div className="animate-pulse text-gray-500 uppercase tracking-wide">Loading tasks...</div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <Card className="border-2 border-dashed border-gray-300 bg-white rounded-3xl">
          <CardContent className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <p className="text-xl font-bold text-black uppercase tracking-wide mb-2">All Done</p>
            <p className="text-gray-600 text-sm uppercase tracking-wide">No pending QC tasks. Great work!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredTasks.map((task) => {
            const taskConfig = TASK_KINDS[task.kind as keyof typeof TASK_KINDS] || TASK_KINDS.ALL;
            const TaskIcon = taskConfig.icon;
            
            return (
              <Card 
                key={task.id} 
                className="border-2 border-gray-200 bg-white overflow-hidden hover:shadow-xl hover:border-gray-300 transition-all duration-300 rounded-3xl group"
              >
                <div className="flex">
                  {/* Left border indicator */}
                  <div className={`
                    w-2 transition-all duration-300
                    ${task.flags?.some(f => f.severity === 'error') 
                      ? 'bg-red-600' 
                      : task.flags?.length 
                        ? 'bg-orange-600' 
                        : 'bg-green-600'
                    }
                  `} />
                  
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-4 flex-1">
                        <div className={`
                          w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0
                          ${task.kind === 'BANK_RECON' ? 'bg-blue-50' :
                            task.kind === 'KYC_REVIEW' ? 'bg-purple-50' :
                            task.kind === 'REPORT_DRAFT' ? 'bg-green-50' : 'bg-gray-50'
                          }
                        `}>
                          <TaskIcon className={`
                            w-6 h-6
                            ${task.kind === 'BANK_RECON' ? 'text-blue-600' :
                              task.kind === 'KYC_REVIEW' ? 'text-purple-600' :
                              task.kind === 'REPORT_DRAFT' ? 'text-green-600' : 'text-gray-600'
                            }
                          `} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-black flex items-center gap-3 mb-1">
                            {task.kind.replace(/_/g, ' ')}
                            {task.client && (
                              <span className="text-xs font-normal text-gray-500">• {task.client.name}</span>
                            )}
                          </h3>
                          <p className="text-xs text-gray-500 uppercase tracking-wide mb-3">
                            Created {formatDate(task.createdAt)}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className={`
                              text-xs font-bold uppercase tracking-wide px-3 py-1 rounded-full
                              ${task.flags?.some(f => f.severity === 'error') 
                                ? 'bg-red-100 text-red-700' 
                                : task.flags?.length 
                                  ? 'bg-orange-100 text-orange-700' 
                                  : 'bg-green-100 text-green-700'
                              }
                            `}>
                              {task.flags?.some(f => f.severity === 'error') ? 'Review' : task.flags?.length ? 'Warnings' : 'Ready'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Flags */}
                    {task.flags && task.flags.length > 0 && (
                      <div className="mb-4 space-y-2">
                        {task.flags.map((flag) => (
                          <div
                            key={flag.id}
                            className={`
                              flex items-start gap-3 p-4 rounded-2xl text-sm border-2 transition-all duration-200
                              ${flag.severity === 'error'
                                ? 'bg-red-50 border-red-200 text-red-900'
                                : 'bg-orange-50 border-orange-200 text-orange-900'
                              }
                            `}
                          >
                            <div className="mt-0.5">
                              <AlertCircle className={`w-5 h-5 ${flag.severity === 'error' ? 'text-red-600' : 'text-orange-600'}`} />
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-xs uppercase tracking-wide">{flag.severity}</p>
                              <p className="text-xs mt-1">{flag.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                      <Button
                        size="sm"
                        className="gap-2 bg-black text-white hover:bg-gray-900 rounded-2xl uppercase tracking-wide font-semibold transition-all duration-200 hover:scale-105"
                        onClick={() => setConfirmModal({ isOpen: true, taskId: task.id })}
                      >
                        <Check className="w-4 h-4" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-2 border-2 border-gray-300 hover:border-gray-400 rounded-2xl uppercase tracking-wide font-semibold transition-all duration-200 hover:scale-105"
                        onClick={() => setConfirmModal({ isOpen: true, taskId: task.id })}
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModal.isOpen}
        title="Confirm Action"
        onConfirm={handleApprove}
        onCancel={() => setConfirmModal({ isOpen: false, taskId: null })}
        confirmText="Approve"
        isLoading={approving}
      >
        <p className="text-gray-700">Are you sure you want to approve this task?</p>
      </Modal>
    </div>
  );
}
