import React, { useState, useMemo } from 'react';
import { useClouvea } from '../../context/ClouveaContext';
import { ClouveaTask, ClouveaTaskStatus, ClouveaTaskType } from '../../types';
import {
  FolderTree,
  Play,
  XCircle,
  RotateCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  FileText,
  Activity,
  Zap,
  Server
} from 'lucide-react';
import { formatBytes } from '../../utils/crypto';

export const TaskManagerConsole: React.FC = () => {
  const {
    tasks,
    cancelTask,
    retryTask,
    dispatchTask,
    activeNode,
    t,
    language
  } = useClouvea();

  const [statusFilter, setStatusFilter] = useState<'all' | ClouveaTaskStatus>('all');
  const [selectedTask, setSelectedTask] = useState<ClouveaTask | null>(null);

  const filteredTasks = useMemo(() => {
    if (statusFilter === 'all') return tasks;
    return tasks.filter(t => t.status === statusFilter);
  }, [tasks, statusFilter]);

  const getStatusBadge = (status: ClouveaTaskStatus) => {
    switch (status) {
      case 'executing':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-sky-950 text-sky-400 border border-sky-800 flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping" />
            {t.taskStatusExecuting}
          </span>
        );
      case 'completed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {t.taskStatusCompleted}
          </span>
        );
      case 'failed':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-rose-950 text-rose-400 border border-rose-800 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {t.taskStatusFailed}
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-slate-800 text-slate-400 border border-slate-700">
            {t.taskStatusCancelled}
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-900 text-slate-300">
            {t.taskStatusPending}
          </span>
        );
    }
  };

  const handleDispatchTestQuery = (type: ClouveaTaskType) => {
    dispatchTask(type, { query: 'test_dispatch', timestamp: Date.now() });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/70 via-[#131c26] to-purple-950/70 border border-slate-700/80 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1d99f3] to-purple-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 shrink-0">
            <FolderTree className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {t.unifiedTaskQueue}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              إدارة وتتبع أوامر التشغيل الموحدة (LIST_FILES, DOWNLOAD, UPLOAD, BACKUP) مع ضمان عدم التكرار (Idempotency) والاستئناف التلقائي.
            </p>
          </div>
        </div>

        {/* Quick Dispatch Buttons */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => handleDispatchTestQuery('GET_DEVICE_STATUS')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>استعلام الحالة</span>
          </button>
          <button
            onClick={() => handleDispatchTestQuery('LIST_FILES')}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-semibold border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <FolderTree className="w-3.5 h-3.5" />
            <span>فهرسة الملفات</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
        {[
          { id: 'all', label: 'جميع المهام' },
          { id: 'executing', label: t.taskStatusExecuting },
          { id: 'completed', label: t.taskStatusCompleted },
          { id: 'failed', label: t.taskStatusFailed },
          { id: 'cancelled', label: t.taskStatusCancelled }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === tab.id
                ? 'bg-[#3daee9] text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tasks Queue Table */}
      <div className="p-5 rounded-2xl bg-[#141a22] border border-slate-700/80 shadow-xl space-y-3">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-300 text-right">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-mono text-[11px]">
                <th className="py-2.5 px-3">معرّف المهمة</th>
                <th className="py-2.5 px-3">نوع العملية</th>
                <th className="py-2.5 px-3">الجهاز المستهدف</th>
                <th className="py-2.5 px-3">التقدم والسرعة</th>
                <th className="py-2.5 px-3">الحالة</th>
                <th className="py-2.5 px-3">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredTasks.map(task => (
                <tr
                  key={task.taskId}
                  onClick={() => setSelectedTask(task)}
                  className="hover:bg-slate-900/60 cursor-pointer transition-colors"
                >
                  <td className="py-3 px-3 font-bold text-white truncate max-w-[140px]">
                    {task.taskId}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-sky-400">{task.type}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-400">{task.targetDeviceId}</td>
                  <td className="py-3 px-3">
                    <div className="w-32 space-y-1">
                      <div className="flex justify-between text-[10px]">
                        <span>{task.progress}%</span>
                        <span className="text-slate-500">{task.transferSpeed}</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          style={{ width: `${task.progress}%` }}
                          className={`h-full ${task.status === 'completed' ? 'bg-emerald-500' : 'bg-sky-500'}`}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-3">{getStatusBadge(task.status)}</td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      {task.status === 'executing' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelTask(task.taskId);
                          }}
                          className="px-2 py-1 rounded bg-rose-950 text-rose-400 hover:bg-rose-900 text-[11px] font-semibold"
                        >
                          إلغاء
                        </button>
                      )}
                      {task.status === 'failed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            retryTask(task.taskId);
                          }}
                          className="px-2 py-1 rounded bg-slate-800 text-sky-400 hover:bg-slate-700 text-[11px] font-semibold flex items-center gap-1"
                        >
                          <RotateCw className="w-3 h-3" />
                          <span>إعادة</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Task Inspection Drawer */}
      {selectedTask && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700 text-xs font-mono space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="font-bold text-white">تفاصيل المهمة: {selectedTask.taskId}</span>
            <button onClick={() => setSelectedTask(null)} className="text-slate-400 hover:text-white">
              إغلاق
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-300">
            <div>النوع: <strong className="text-sky-400">{selectedTask.type}</strong></div>
            <div>الحالة: <strong className="text-emerald-400">{selectedTask.status}</strong></div>
            <div>المصدر: {selectedTask.sourceDeviceId}</div>
            <div>الهدف: {selectedTask.targetDeviceId}</div>
            <div>البيانات المنقولة: {formatBytes(selectedTask.bytesTransferred)} / {formatBytes(selectedTask.totalBytes)}</div>
            <div>سرعة النقل: {selectedTask.transferSpeed}</div>
          </div>
          <div className="p-2.5 rounded bg-[#0a0e13] text-slate-400 text-[11px] overflow-x-auto">
            Payload: {JSON.stringify(selectedTask.payload, null, 2)}
          </div>
        </div>
      )}
    </div>
  );
};
