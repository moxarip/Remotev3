import React from 'react';
import { ClouveaProvider, useClouvea } from './context/ClouveaContext';
import { Header } from './components/Header';
import { ControllerDashboard } from './components/controller/ControllerDashboard';
import { RemoteFileBrowser } from './components/controller/RemoteFileBrowser';
import { NodeManagementPanel } from './components/node/NodeManagementPanel';
import { DualMeshView } from './components/mesh/DualMeshView';
import { RemoteBackupCenter } from './components/backup/RemoteBackupCenter';
import { TaskManagerConsole } from './components/tasks/TaskManagerConsole';
import { DeviceTrustModal } from './components/security/DeviceTrustModal';
import { ArchitectureDocModal } from './components/analysis/ArchitectureDocModal';
import {
  CheckCircle2,
  ShieldCheck,
  BellRing,
  VolumeX,
  Smartphone,
  Layers,
  Heart
} from 'lucide-react';

const ClouveaMainContent: React.FC = () => {
  const {
    activeView,
    toastMessage,
    isRingingDeviceId,
    stopRinging,
    devices,
    language
  } = useClouvea();

  const ringingDevice = devices.find(d => d.id === isRingingDeviceId);

  return (
    <div className="min-h-screen bg-[#0d1218] text-slate-100 flex flex-col font-sans selection:bg-[#3daee9] selection:text-white">
      {/* Toast Notification Alert */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-[#16202c] border border-[#3daee9]/60 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#3daee9]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Emergency Ringing Alarm Overlay */}
      {isRingingDeviceId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-[#1e1317] border-2 border-rose-500 rounded-3xl p-8 text-center text-white shadow-2xl animate-ring-alarm space-y-6">
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
              <div className="absolute inset-0 bg-rose-500/30 rounded-full animate-ping" />
              <div className="w-20 h-20 bg-rose-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-rose-600/50">
                <BellRing className="w-10 h-10 animate-bounce" />
              </div>
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-extrabold text-white tracking-wide">
                إنذار رنين الطوارئ نشط!
              </h2>
              <p className="text-xs text-rose-300 font-medium">
                جهاز {ringingDevice?.name || 'Clouvea Node'} يرن بأعلى صوت للبحث عنه
              </p>
            </div>

            <button
              onClick={stopRinging}
              className="w-full py-3.5 px-6 rounded-2xl bg-white hover:bg-rose-100 text-rose-900 font-black text-sm shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <VolumeX className="w-5 h-5 text-rose-700" />
              <span>إيقاف الرنين</span>
            </button>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Header />

      {/* Main Content Viewport */}
      <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto">
        {activeView === 'controller' && (
          <div className="space-y-8">
            <ControllerDashboard />
            <RemoteFileBrowser />
          </div>
        )}

        {activeView === 'node' && <NodeManagementPanel />}
        {activeView === 'dual_mesh' && <DualMeshView />}
        {activeView === 'backup' && <RemoteBackupCenter />}
        {activeView === 'tasks' && <TaskManagerConsole />}
        {activeView === 'security' && <DeviceTrustModal />}
        {activeView === 'architecture' && <ArchitectureDocModal />}
      </main>

      {/* Enterprise Footer */}
      <footer className="bg-[#0a0e13] border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <ShieldCheck className="w-4 h-4 text-[#3daee9]" />
            <span>
              Clouvea Personal Remote Management System • TLS 1.3 & SHA-256 Verified
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
            <span>Storage Access Framework • WorkManager • Room Engine</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <ClouveaProvider>
      <ClouveaMainContent />
    </ClouveaProvider>
  );
}
