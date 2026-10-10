import React, { useState } from 'react';
import { useClouvea } from '../../context/ClouveaContext';
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
  X
} from 'lucide-react';

export const DeviceTrustModal: React.FC = () => {
  const {
    devices,
    pairNewDevice,
    revokeDeviceTrust,
    auditEvents,
    t,
    language
  } = useClouvea();

  const [showPairDialog, setShowPairDialog] = useState(false);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceIp, setNewDeviceIp] = useState('192.168.1.188');

  const handlePairSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeviceName.trim()) return;
    pairNewDevice({
      name: newDeviceName,
      ip: newDeviceIp,
      model: 'Android 14 Device'
    });
    setNewDeviceName('');
    setShowPairDialog(false);
  };

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
          onClick={() => setShowPairDialog(true)}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#1d99f3] to-purple-600 hover:from-[#3daee9] hover:to-purple-500 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{t.pairDevice}</span>
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

      {/* Verified Security Audit Trail */}
      <div className="p-5 rounded-2xl bg-[#141a22] border border-slate-700/80 shadow-xl space-y-3">
        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-purple-400" />
          <span>{t.auditLogTitle}</span>
        </h3>

        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {auditEvents.map(event => (
            <div
              key={event.id}
              className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
            >
              <div>
                <span className="font-bold text-white block">{event.action}</span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">{event.details}</span>
              </div>

              <div className="text-right shrink-0 font-mono text-[11px] text-slate-500">
                <span>{event.timestamp}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pair Device Modal */}
      {showPairDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handlePairSubmit} className="w-full max-w-md bg-[#141a22] rounded-3xl border border-slate-700 shadow-2xl p-6 text-white space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <QrCode className="w-4 h-4 text-purple-400" />
                <span>إقران جهاز Clouvea Node جديد</span>
              </h3>
              <button onClick={() => setShowPairDialog(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 rounded-xl bg-[#0d1217] text-center border border-slate-800 space-y-2">
              <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl flex items-center justify-center text-slate-900">
                <QrCode className="w-28 h-28" />
              </div>
              <p className="text-[11px] text-slate-400 font-mono">
                رمز الاقتران المتبادل: <strong className="text-emerald-400 text-sm">489-216</strong>
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div>
                <label className="text-slate-400 block mb-1">اسم الجهاز:</label>
                <input
                  type="text"
                  placeholder="مثال: هاتف سامسونج التابع للعمل"
                  value={newDeviceName}
                  onChange={e => setNewDeviceName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">عنوان IP على الشبكة المحلية:</label>
                <input
                  type="text"
                  value={newDeviceIp}
                  onChange={e => setNewDeviceIp(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-purple-500"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
            >
              تأكيد الاقتران والمصادقة
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
