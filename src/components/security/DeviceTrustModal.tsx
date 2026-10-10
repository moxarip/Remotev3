import React, { useState } from 'react';
import { useClouvea } from '../../context/ClouveaContext';
import { PhonePairingModal } from './PhonePairingModal';
import {
  ShieldCheck,
  ShieldAlert,
  Smartphone,
  Server,
  QrCode,
  Key,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Plus,
  X,
  KeyRound
} from 'lucide-react';

export const DeviceTrustModal: React.FC = () => {
  const {
    devices,
    revokeDeviceTrust,
    auditEvents,
    t,
    language
  } = useClouvea();

  const [showPairModal, setShowPairModal] = useState(false);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/70 via-[#161d26] to-[#121820] border border-purple-800/50 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-purple-500 to-[#1d99f3] flex items-center justify-center text-white shadow-lg shadow-purple-500/20 shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              {t.securityMode}
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              إدارة الأجهزة الموثوقة، تبادل شهادات التشفير RSA-4096، والتحقق من بصمات SHA-256 لمنع الوصول غير المصرح به.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowPairModal(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1d99f3] to-purple-600 hover:from-[#3daee9] hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <KeyRound className="w-4 h-4" />
          <span>{t.pairDevice} (PIN / QR)</span>
        </button>
      </div>

      {/* Trusted Devices Fleet Cards */}
      <div className="p-5 rounded-2xl bg-[#141a22] border border-slate-700/80 shadow-xl space-y-4">
        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider">
          الأجهزة الموثوقة والجلسات النشطة
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {devices.map(device => (
            <div
              key={device.id}
              className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-slate-800 text-purple-400 border border-slate-700">
                    {device.role === 'controller' ? <Smartphone className="w-5 h-5" /> : <Server className="w-5 h-5" />}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white">{device.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">{device.model}</span>
                  </div>
                </div>

                <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                  device.isTrusted ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400'
                }`}>
                  {device.isTrusted ? 'موثوق' : 'غير موثوق'}
                </span>
              </div>

              {/* Fingerprint row */}
              <div className="p-2.5 rounded-lg bg-[#0e1218] border border-slate-800/80 text-[11px] font-mono">
                <span className="text-slate-500 block text-[9px] mb-0.5">{t.certFingerprint}:</span>
                <span className="text-emerald-400 select-all break-all">{device.certificateFingerprint}</span>
              </div>

              {device.role !== 'controller' && device.isTrusted && (
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => revokeDeviceTrust(device.id)}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{t.revokeTrust}</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Audit Log */}
      <div className="p-5 rounded-2xl bg-[#141a22] border border-slate-700/80 shadow-xl space-y-3">
        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <span>{t.auditLogTitle}</span>
        </h3>

        <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-xs">
          {auditEvents.map(event => (
            <div
              key={event.id}
              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-start justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${
                    event.status === 'success' ? 'bg-emerald-400' : event.status === 'warning' ? 'bg-amber-400' : 'bg-rose-400'
                  }`} />
                  <span className="font-bold text-white">{event.action}</span>
                </div>
                <p className="text-[11px] text-slate-400 pl-4">{event.details}</p>
              </div>

              <span className="text-[10px] text-slate-500 shrink-0">{event.timestamp}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phone Pairing Modal */}
      <PhonePairingModal
        isOpen={showPairModal}
        onClose={() => setShowPairModal(false)}
      />
    </div>
  );
};
