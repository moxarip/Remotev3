import React from 'react';
import { useClouvea, ClouveaActiveView } from '../context/ClouveaContext';
import {
  Smartphone,
  Layers,
  HardDrive,
  FolderTree,
  Sliders,
  ShieldCheck,
  RotateCw,
  Volume2,
  VolumeX,
  Languages,
  CheckCircle2,
  Wifi,
  Battery,
  BatteryCharging,
  BellRing,
  BookOpen,
  ArrowLeftRight,
  Server
} from 'lucide-react';
import { formatBytes } from '../utils/crypto';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    language,
    setLanguage,
    t,
    devices,
    activeNode,
    setActiveNodeId,
    connectionMode,
    setConnectionMode,
    soundEnabled,
    toggleSound,
    ringDevice,
    isRingingDeviceId,
    stopRinging
  } = useClouvea();

  const navItems: { id: ClouveaActiveView; label: string; icon: React.ReactNode }[] = [
    { id: 'controller', label: language === 'ar' ? 'جهاز التحكم' : 'Controller', icon: <Smartphone className="w-3.5 h-3.5" /> },
    { id: 'node', label: language === 'ar' ? 'الجهاز المُدار (Node)' : 'Node', icon: <Server className="w-3.5 h-3.5" /> },
    { id: 'dual_mesh', label: language === 'ar' ? 'المحاكاة المزدوجة' : 'Dual Mesh', icon: <ArrowLeftRight className="w-3.5 h-3.5" /> },
    { id: 'backup', label: language === 'ar' ? 'النسخ الاحتياطي' : 'Backup', icon: <HardDrive className="w-3.5 h-3.5" /> },
    { id: 'tasks', label: language === 'ar' ? 'مركز المهام' : 'Tasks', icon: <FolderTree className="w-3.5 h-3.5" /> },
    { id: 'security', label: language === 'ar' ? 'الأجهزة والأمان' : 'Security', icon: <ShieldCheck className="w-3.5 h-3.5" /> },
    { id: 'architecture', label: language === 'ar' ? 'المعمارية التقنية' : 'Architecture', icon: <BookOpen className="w-3.5 h-3.5" /> }
  ];

  return (
    <header className="bg-[#141a22]/95 backdrop-blur-md border-b border-slate-700/80 sticky top-0 z-40 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#3daee9] via-[#1d99f3] to-[#27ae60] p-0.5 shadow-md shadow-sky-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#0f141a] rounded-[10px] flex items-center justify-center text-[#3daee9]">
              <Layers className="w-5 h-5" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-black text-sm md:text-base text-white tracking-wide">
                Clouvea Remote
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800">
                v2.6 Enterprise
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden lg:block">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Primary View Navigation Switcher */}
        <nav className="flex items-center bg-[#0d1217] p-1 rounded-xl border border-slate-800 shadow-inner overflow-x-auto max-w-full">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeView === item.id
                  ? 'bg-gradient-to-r from-[#1d99f3] to-[#3daee9] text-white shadow-md shadow-sky-500/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Active Node Quick Selector & Telemetry */}
        <div className="flex items-center gap-2.5">
          {/* Node selector dropdown */}
          <div className="flex items-center gap-2 bg-[#0d1217] border border-slate-700/80 rounded-xl px-2.5 py-1 text-xs">
            <span className={`w-2 h-2 rounded-full ${activeNode.status === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            <select
              value={activeNode.id}
              onChange={e => setActiveNodeId(e.target.value)}
              className="bg-transparent text-white font-medium focus:outline-none cursor-pointer max-w-[140px] truncate"
            >
              {devices.filter(d => d.role === 'node').map(node => (
                <option key={node.id} value={node.id} className="bg-slate-900 text-slate-100">
                  {node.name}
                </option>
              ))}
            </select>
            
            {/* Battery status */}
            <div className="flex items-center text-slate-300 font-mono text-[11px] border-l border-slate-700 pl-1.5">
              {activeNode.isCharging ? (
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 ml-1" />
              ) : (
                <Battery className="w-3.5 h-3.5 text-sky-400 ml-1" />
              )}
              <span>{activeNode.batteryLevel}%</span>
            </div>
          </div>

          {/* Emergency Ring Alarm Trigger */}
          <button
            onClick={() => isRingingDeviceId ? stopRinging() : ringDevice(activeNode.id)}
            className={`p-1.5 rounded-xl border text-xs font-semibold transition-all ${
              isRingingDeviceId
                ? 'bg-rose-600 text-white border-rose-500 animate-bounce'
                : 'bg-[#0d1217] hover:bg-rose-950 text-slate-400 hover:text-rose-400 border-slate-700'
            }`}
            title="رنين الطوارئ للبحث عن الجهاز"
          >
            <BellRing className="w-4 h-4" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className={`p-1.5 rounded-xl border transition-all ${
              soundEnabled
                ? 'bg-sky-950/40 text-sky-400 border-sky-800'
                : 'bg-[#0d1217] text-slate-500 border-slate-700'
            }`}
            title={t.sound}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Language Switcher */}
          <button
            onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-xl bg-[#0d1217] border border-slate-700 text-slate-200 hover:text-white font-semibold transition-all"
            title={t.language}
          >
            <Languages className="w-3.5 h-3.5 text-[#3daee9]" />
            <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
