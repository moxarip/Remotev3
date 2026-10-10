import React, { useState } from 'react';
import { useClouvea } from '../../context/ClouveaContext';
import {
  Server,
  FolderPlus,
  FolderLock,
  Folder,
  ShieldCheck,
  ShieldAlert,
  BatteryCharging,
  Battery,
  Wifi,
  Activity,
  Plus,
  Trash2,
  Lock,
  Unlock,
  Radio,
  FileCheck2,
  Clock,
  Sparkles
} from 'lucide-react';
import { formatBytes } from '../../utils/crypto';

export const NodeManagementPanel: React.FC = () => {
  const {
    activeNode,
    folderScopes,
    grantFolderScope,
    revokeFolderScope,
    tasks,
    auditEvents,
    t,
    language,
    showToast
  } = useClouvea();

  const [showGrantModal, setShowGrantModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderPath, setNewFolderPath] = useState('/storage/emulated/0/DCIM/Screenshots');
  const [newAccessMode, setNewAccessMode] = useState<'readonly' | 'readwrite'>('readonly');

  const handleGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !newFolderPath.trim()) return;
    grantFolderScope(newFolderName, newFolderPath, newAccessMode);
    setNewFolderName('');
    setShowGrantModal(false);
  };

  const incomingTasksForNode = tasks.filter(t => t.targetDeviceId === activeNode.id);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Node Identity & Daemon Status Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-[#131d24] to-[#121820] border border-emerald-800/50 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#27ae60] to-[#3daee9] flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {activeNode.name}
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                Clouvea Node Daemon
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {t.nodePanelSubtitle}
            </p>
          </div>
        </div>

        {/* Foreground Service Daemon Status */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300 font-medium">خدمة Foreground نشطة</span>
        </div>
      </div>

      {/* Storage Access Framework (SAF) Scopes Configuration */}
      <div className="p-5 rounded-2xl bg-[#141a22] border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-400" />
              <span>إدارة أذونات المجلدات المشتركة (SAF Scoped Access)</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              لا يمكن لجهاز التحكم قراءة أو كتابة أي مجلد إلا بعد منحه صلاحية DocumentFile صريحة هنا.
            </p>
          </div>

          <button
            onClick={() => setShowGrantModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>منح صلاحية مجلد جديد</span>
          </button>
        </div>

        {/* Scopes Table */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {folderScopes.map(scope => (
            <div
              key={scope.id}
              className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                scope.isShared
                  ? 'bg-[#18212c] border-slate-700 shadow-sm'
                  : 'bg-slate-900/60 border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-start gap-3 truncate">
                <div className={`p-2.5 rounded-lg shrink-0 ${scope.isShared ? 'bg-amber-950/60 text-amber-400 border border-amber-800' : 'bg-slate-800 text-slate-500'}`}>
                  {scope.isShared ? <Folder className="w-5 h-5" /> : <FolderLock className="w-5 h-5" />}
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-xs text-white truncate">{scope.name}</h4>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono ${
                      scope.accessMode === 'readwrite' ? 'bg-emerald-950 text-emerald-400' : 'bg-sky-950 text-sky-400'
                    }`}>
                      {scope.accessMode === 'readwrite' ? 'قراءة وكتابة' : 'قراءة فقط'}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-mono mt-1 truncate">{scope.path}</p>
                  <p className="text-[9px] text-slate-500 font-mono mt-0.5 truncate">{scope.safTreeUri}</p>
                </div>
              </div>

              {scope.isShared ? (
                <button
                  onClick={() => revokeFolderScope(scope.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/60 transition-colors shrink-0"
                  title={t.revokeFolderPermission}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              ) : (
                <span className="text-[10px] text-rose-400 font-mono shrink-0">محظور</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Real-time Controller Request Inspector & Audit Log */}
      <div className="p-5 rounded-2xl bg-[#141a22] border border-slate-700/80 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span>{t.liveIncomingRequests}</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-500">
            TLS Port 1716 Socket Stream
          </span>
        </div>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {incomingTasksForNode.map(task => (
            <div
              key={task.taskId}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <div>
                  <span className="font-bold text-white font-mono">{task.type}</span>
                  <span className="text-slate-500 font-mono text-[10px] ml-2">ID: {task.taskId.slice(0, 16)}</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {task.payload.fileName ? `ملف: ${task.payload.fileName}` : `نطاق: ${task.payload.folderScope || 'عام'}`}
                  </p>
                </div>
              </div>

              <div className="text-right font-mono">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  task.status === 'completed'
                    ? 'bg-emerald-950 text-emerald-400'
                    : task.status === 'executing'
                    ? 'bg-sky-950 text-sky-400 animate-pulse'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {task.status}
                </span>
                <span className="text-[10px] text-slate-500 block mt-1">{task.transferSpeed}</span>
              </div>
            </div>
          ))}

          {incomingTasksForNode.length === 0 && (
            <div className="text-center py-6 text-slate-500 text-xs font-mono">
              بانتظار طلبات المهام الواردة من جهاز التحكم...
            </div>
          )}
        </div>
      </div>

      {/* Grant SAF Scope Modal */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleGrant} className="w-full max-w-md bg-[#141a22] rounded-3xl border border-slate-700 shadow-2xl p-6 text-white space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <FolderPlus className="w-4 h-4 text-emerald-400" />
              <span>منح إذن مجلد جديد عبر Storage Access Framework</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">اسم المجلد المعروض:</label>
                <input
                  type="text"
                  placeholder="مثال: لقطات الشاشة (Screenshots)"
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">المسار في ذاكرة الهاتف:</label>
                <input
                  type="text"
                  value={newFolderPath}
                  onChange={e => setNewFolderPath(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">صلاحية الوصول الممنوحة للمتحكم:</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewAccessMode('readonly')}
                    className={`py-2 rounded-xl border text-xs font-semibold ${newAccessMode === 'readonly' ? 'bg-sky-950 text-sky-400 border-sky-600' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    قراءة فقط (ReadOnly)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAccessMode('readwrite')}
                    className={`py-2 rounded-xl border text-xs font-semibold ${newAccessMode === 'readwrite' ? 'bg-emerald-950 text-emerald-400 border-emerald-600' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
                  >
                    قراءة وكتابة (ReadWrite)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                تأكيد ومنح الصلاحية
              </button>
              <button
                type="button"
                onClick={() => setShowGrantModal(false)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
