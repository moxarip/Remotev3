import React from 'react';
import { useClouvea } from '../../context/ClouveaContext';
import {
  Smartphone,
  Server,
  HardDrive,
  FolderTree,
  Wifi,
  Battery,
  BatteryCharging,
  ArrowRight,
  ShieldCheck,
  Zap,
  Play,
  RotateCw,
  Folder,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity
} from 'lucide-react';
import { formatBytes } from '../../utils/crypto';

export const ControllerDashboard: React.FC = () => {
  const {
    devices,
    activeNode,
    setActiveNodeId,
    setActiveView,
    dispatchTask,
    tasks,
    ringDevice,
    t,
    language
  } = useClouvea();

  const nodes = devices.filter(d => d.role === 'node');
  const usedPercent = Math.round((activeNode.storageUsedBytes / activeNode.storageTotalBytes) * 100);

  const handleQuickStatusQuery = () => {
    dispatchTask('GET_DEVICE_STATUS', { query: 'full_telemetry' });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#172230] via-[#131c26] to-[#121922] border border-slate-700/80 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-lg font-bold text-white">
              {language === 'ar' ? 'لوحة تحكم وإدارة الأجهزة (Clouvea Controller)' : 'Clouvea Controller Console'}
            </h2>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {language === 'ar'
              ? 'إدارة ومراقبة الأجهزة الشخصية المُدارة (Nodes)، تصفح المجلدات المصرح بها، تنفيذ أوامر النقل والنسخ الاحتياطي الذكي المشفر.'
              : 'Remotely monitor personal nodes, inspect authorized scoped directories, dispatch tasks, and trigger encrypted differential backups.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('dual_mesh')}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#1d99f3] to-[#3daee9] hover:from-[#3daee9] hover:to-[#5bc0ff] text-white text-xs font-bold shadow-md shadow-sky-500/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'عرض الربط المباشر بين الهاتفين' : 'Dual Phone Live Link'}</span>
          </button>
        </div>
      </div>

      {/* Fleet of Managed Nodes Cards */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Server className="w-4 h-4 text-[#3daee9]" />
            <span>أسطول الأجهزة المُدارة (Managed Nodes Fleet)</span>
          </h3>
          <span className="text-xs text-slate-500 font-mono">
            {nodes.filter(n => n.status === 'online').length} / {nodes.length} متصل
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nodes.map(node => {
            const isSelected = node.id === activeNode.id;
            const isOnline = node.status === 'online';

            return (
              <div
                key={node.id}
                onClick={() => setActiveNodeId(node.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-[#1a232f] border-[#3daee9] shadow-lg shadow-sky-950/40 ring-1 ring-[#3daee9]/50'
                    : 'bg-[#131922] border-slate-800 hover:border-slate-700 hover:bg-[#161d28]'
                }`}
              >
                {/* Status indicator bar */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${isOnline ? 'bg-emerald-500' : 'bg-slate-700'}`} />

                <div className="flex items-start justify-between mb-3 pt-1">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 ${
                      isSelected ? 'bg-[#3daee9]/20 text-[#3daee9] border border-[#3daee9]/40' : 'bg-slate-800 text-slate-300'
                    }`}>
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white group-hover:text-[#3daee9] transition-colors truncate max-w-[170px]">
                        {node.name}
                      </h4>
                      <p className="text-[10px] text-slate-400 font-mono mt-0.5">{node.model}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    isOnline
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {isOnline ? t.online : t.offline}
                  </span>
                </div>

                {/* Telemetry Row */}
                <div className="grid grid-cols-3 gap-1.5 pt-3 border-t border-slate-800/80 text-center font-mono">
                  <div className="p-1.5 rounded-lg bg-slate-900/60">
                    <span className="text-[9px] text-slate-500 block">البطارية</span>
                    <span className="text-xs text-slate-200 font-semibold">{node.batteryLevel}%</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900/60">
                    <span className="text-[9px] text-slate-500 block">التخزين الحر</span>
                    <span className="text-xs text-slate-200 font-semibold">{formatBytes(node.storageFreeBytes)}</span>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900/60">
                    <span className="text-[9px] text-slate-500 block">الاستجابة</span>
                    <span className="text-xs text-emerald-400 font-semibold">{node.latencyMs ? `${node.latencyMs}ms` : '--'}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Node Detailed Hardware Telemetry & Remote Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Hardware Status Panel (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#141a22] border border-slate-700/80 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-950/60 text-[#3daee9] border border-sky-800">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <span>{activeNode.name}</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </h3>
                <span className="text-[11px] font-mono text-sky-400">
                  {activeNode.ip}:{activeNode.port} • {activeNode.connectionType === 'local_wifi' ? 'Wi-Fi 6 LAN' : 'Internet Relay'}
                </span>
              </div>
            </div>

            <button
              onClick={handleQuickStatusQuery}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="تحديث واستعلام القياسات (GET_DEVICE_STATUS)"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>استعلام الحالة</span>
            </button>
          </div>

          {/* Storage Bar Breakdown */}
          <div className="space-y-2 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <HardDrive className="w-3.5 h-3.5 text-[#3daee9]" />
                <span>مساحة التخزين في الجهاز المُدار</span>
              </span>
              <span className="font-mono text-slate-400 text-[11px]">
                مستخدم: {formatBytes(activeNode.storageUsedBytes)} / {formatBytes(activeNode.storageTotalBytes)} ({usedPercent}%)
              </span>
            </div>

            <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden flex">
              <div
                style={{ width: `${usedPercent}%` }}
                className="bg-gradient-to-r from-sky-500 to-indigo-500 h-full rounded-full transition-all"
              />
            </div>

            <div className="flex justify-between text-[10px] text-slate-500 font-mono">
              <span>المساحة الشاغرة: {formatBytes(activeNode.storageFreeBytes)}</span>
              <span>نظام الملفات: ext4 / F2FS (Android Encrypted)</span>
            </div>
          </div>

          {/* Hardware & Network Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">البطارية والشحن</span>
              <div className="flex items-center gap-1.5 font-bold text-white font-mono">
                {activeNode.isCharging ? (
                  <BatteryCharging className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Battery className="w-4 h-4 text-sky-400" />
                )}
                <span>{activeNode.batteryLevel}%</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">
                {activeNode.isCharging ? 'متصل بالشاحن' : 'تفريغ عادي'}
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">سرعة الاستجابة</span>
              <div className="flex items-center gap-1.5 font-bold text-emerald-400 font-mono">
                <Wifi className="w-4 h-4" />
                <span>{activeNode.latencyMs} ms</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">TLS Socket ping</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">خدمة الخلفية Daemon</span>
              <div className="flex items-center gap-1 font-bold text-sky-400 text-[11px]">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <span>Foreground</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">إشعار نظام نشط</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 block mb-1">الأمان والمصادقة</span>
              <div className="flex items-center gap-1 font-bold text-purple-400 text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>RSA-4096</span>
              </div>
              <span className="text-[10px] text-slate-500 mt-1 block">بصمة موثقة</span>
            </div>
          </div>
        </div>

        {/* Quick Remote Actions & Dispatcher (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#141a22] border border-slate-700/80 shadow-xl space-y-3">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider mb-2">
            العمليات السريعة على الجهاز المُدار
          </h3>

          <div className="space-y-2">
            <button
              onClick={() => setActiveView('controller')}
              className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center justify-between text-xs font-semibold text-white transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Folder className="w-4 h-4 text-amber-400" />
                <span>استعراض وتصفح الملفات المصرح بها</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform" />
            </button>

            <button
              onClick={() => setActiveView('backup')}
              className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center justify-between text-xs font-semibold text-white transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <HardDrive className="w-4 h-4 text-emerald-400" />
                <span>بدء النسخ الاحتياطي التفاضلي الذكي</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform" />
            </button>

            <button
              onClick={() => setActiveView('tasks')}
              className="w-full p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 flex items-center justify-between text-xs font-semibold text-white transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <FolderTree className="w-4 h-4 text-[#3daee9]" />
                <span>متابعة طابور المهام وسجل العمليات</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform" />
            </button>

            <button
              onClick={() => ringDevice(activeNode.id)}
              className="w-full p-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 flex items-center justify-between text-xs font-semibold text-rose-300 transition-all group"
            >
              <div className="flex items-center gap-2.5">
                <Zap className="w-4 h-4 text-rose-400" />
                <span>تشغيل رنين الطوارئ للبحث عن الجهاز</span>
              </div>
              <ArrowRight className="w-4 h-4 text-rose-400 group-hover:text-rose-200 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
