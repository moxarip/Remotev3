import React from 'react';
import { useClouvea } from '../../context/ClouveaContext';
import { RemoteFileBrowser } from '../controller/RemoteFileBrowser';
import { NodeManagementPanel } from '../node/NodeManagementPanel';
import { ControllerDashboard } from '../controller/ControllerDashboard';
import {
  ArrowLeftRight,
  Smartphone,
  Server,
  Zap,
  HardDrive,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Radio
} from 'lucide-react';

export const DualMeshView: React.FC = () => {
  const { controllerDevice, activeNode, t, language, measuredLatencyMs } = useClouvea();

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Dual Live Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-950/70 via-[#131c26] to-emerald-950/70 border border-slate-700/80 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1d99f3] to-[#27ae60] flex items-center justify-center text-white shadow-lg shadow-sky-500/20 shrink-0">
            <ArrowLeftRight className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span>{language === 'ar' ? 'الربط المباشر بين الهاتفين (Clouvea Dual Live Link)' : 'Dual Phone Direct Link'}</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live Socket Active ({measuredLatencyMs}ms)
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              {language === 'ar'
                ? 'عرض تفاعلي مباشر لكلا الجهازين: تنفيذ الأوامر من هاتف التحكم يُعالج فورياً على الجهاز المُدار مع تدفق الملفات والبيانات بالوقت الفعلي.'
                : 'Direct interactive view for both devices: Controller actions process in real time on the Node device over P2P link.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-sky-400 font-bold">{controllerDevice.name}</span>
          <span className="text-slate-500">⟷</span>
          <span className="text-emerald-400 font-bold">{activeNode.name}</span>
        </div>
      </div>

      {/* Side-by-Side Dual Column Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Controller View */}
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-[#141a22] border border-sky-800/60 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
              <Smartphone className="w-4 h-4" />
              <span>{language === 'ar' ? 'هاتف التحكم (Clouvea Controller)' : 'Controller Phone'}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{controllerDevice.ip}</span>
          </div>

          <RemoteFileBrowser />
        </div>

        {/* Right Column: Node View */}
        <div className="space-y-4">
          <div className="p-3 rounded-xl bg-[#141a22] border border-emerald-800/60 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
              <Server className="w-4 h-4" />
              <span>{language === 'ar' ? 'الجهاز المُدار (Clouvea Node - ذاكرة الهاتف)' : 'Managed Node Phone'}</span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">{activeNode.ip}</span>
          </div>

          <NodeManagementPanel />
        </div>
      </div>
    </div>
  );
};
