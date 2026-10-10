import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
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
  Sparkles,
  Upload,
  QrCode,
  KeyRound,
  Copy,
  Check,
  Smartphone,
  HardDrive,
  MapPin
} from 'lucide-react';
import { formatBytes } from '../../utils/crypto';

export const NodeManagementPanel: React.FC = () => {
  const {
    activeNode,
    folderScopes,
    grantFolderScope,
    revokeFolderScope,
    addRealFilesFromDevice,
    remoteFiles,
    currentPairingCode,
    generatePairingCode,
    tasks,
    auditEvents,
    t,
    language,
    showToast
  } = useClouvea();

  const [showGrantModal, setShowGrantModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderPath, setNewFolderPath] = useState('/storage/emulated/0/DCIM/Camera');
  const [newAccessMode, setNewAccessMode] = useState<'readonly' | 'readwrite'>('readwrite');
  const [targetScopeForUpload, setTargetScopeForUpload] = useState<string>('scope-dcim');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Generate pairing code if not already set
  useEffect(() => {
    if (!currentPairingCode) {
      generatePairingCode();
    } else {
      const shareUrl = `${window.location.origin}/?pair=${currentPairingCode}&role=controller`;
      QRCode.toDataURL(shareUrl, {
        width: 180,
        margin: 1,
        color: { dark: '#0f172a', light: '#ffffff' }
      }).then(url => setQrDataUrl(url)).catch(() => {});
    }
  }, [currentPairingCode]);

  const handleGrant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim() || !newFolderPath.trim()) return;
    grantFolderScope(newFolderName, newFolderPath, newAccessMode);
    setNewFolderName('');
    setShowGrantModal(false);
  };

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await addRealFilesFromDevice(e.target.files, targetScopeForUpload);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (folderInputRef.current) folderInputRef.current.value = '';
    }
  };

  const handleCopyCode = () => {
    if (currentPairingCode) {
      navigator.clipboard.writeText(currentPairingCode);
      setCopiedCode(true);
      showToast(language === 'ar' ? 'تم نسخ رمز الاقتران' : 'Copied pairing PIN');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const incomingTasksForNode = tasks.filter(t => t.targetDeviceId === activeNode.id);
  const formattedCode = currentPairingCode
    ? `${currentPairingCode.slice(0, 3)} - ${currentPairingCode.slice(3)}`
    : '... ...';

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

        {/* Foreground Service Daemon Status & GPS Badge */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs font-mono">
            <MapPin className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span className="text-slate-300">GPS: {activeNode.location ? `${activeNode.location.latitude.toFixed(4)}, ${activeNode.location.longitude.toFixed(4)}` : 'بث مباشر نشط'}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">{language === 'ar' ? 'خدمة Foreground نشطة' : 'Foreground Active'}</span>
          </div>
        </div>
      </div>

      {/* Real Phone Pairing Info Card (QR Code & PIN) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-purple-950/50 via-[#161c26] to-[#121922] border border-purple-800/50 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="space-y-2 max-w-lg">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider">
            <KeyRound className="w-4 h-4" />
            <span>{language === 'ar' ? 'بيانات اقتران هذا الجهاز مع هاتف التحكم' : 'Node Pairing Credentials'}</span>
          </div>
          <h3 className="text-base font-extrabold text-white">
            {language === 'ar' ? 'امسح رمز QR أو أدخل الرمز في هاتف التحكم' : 'Scan QR or Enter PIN in Controller Phone'}
          </h3>
          <p className="text-xs text-slate-300">
            {language === 'ar'
              ? 'افتح التطبيق على هاتف التحكم، واختر "ربط هاتف" ثم أدخل رمز PIN أدناه أو امسح الرمز بكاميرا الهاتف للربط المباشر.'
              : 'Open the app on your Controller phone, click "Pair Phone" and enter this PIN or scan the QR.'}
          </p>

          <div className="flex items-center gap-3 pt-2">
            <div className="px-4 py-2 bg-slate-900/90 border border-purple-500/40 rounded-xl font-mono text-xl font-black text-purple-300 tracking-wider">
              {formattedCode}
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3 py-2 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedCode ? (language === 'ar' ? 'تم النسخ' : 'Copied') : (language === 'ar' ? 'نسخ الرمز' : 'Copy PIN')}</span>
            </button>
            <button
              onClick={() => generatePairingCode()}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs transition-colors"
            >
              {language === 'ar' ? 'تجديد الرمز' : 'New PIN'}
            </button>
          </div>
        </div>

        {/* Live QR Code Box */}
        {qrDataUrl && (
          <div className="bg-white p-2.5 rounded-2xl shadow-xl border-2 border-purple-500/50 shrink-0">
            <img src={qrDataUrl} alt="Pairing QR" className="w-36 h-36 object-contain rounded-lg" />
            <span className="text-[10px] text-slate-700 font-mono text-center block mt-1">
              P2P Fast Connect
            </span>
          </div>
        )}
      </div>

      {/* Real Device Local File Sharing Station */}
      <div className="p-5 rounded-2xl bg-[#141a22] border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" />
              <span>{language === 'ar' ? 'مشاركة ملفات حقيقية من ذاكرة هذا الهاتف' : 'Share Real Files From Phone Memory'}</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {language === 'ar'
                ? 'اختر صور، مقاطع فيديو، أو مستندات حقيقية من هاتفك لتكون متاحة فوراً لهاتف التحكم عبر اتصال P2P مشفر'
                : 'Select photos, videos, or documents from your phone to share live with Controller'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={targetScopeForUpload}
              onChange={e => setTargetScopeForUpload(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-xs text-white rounded-xl px-3 py-2 font-medium"
            >
              {folderScopes.filter(s => s.isShared).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            {/* Hidden File Inputs */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />
            <input
              ref={folderInputRef}
              type="file"
              // @ts-ignore
              webkitdirectory=""
              multiple
              onChange={handleFilesSelected}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'إضافة ملفات من الهاتف' : 'Add Files From Phone'}</span>
            </button>

            <button
              onClick={() => folderInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 active:scale-95 transition-all"
            >
              <FolderPlus className="w-3.5 h-3.5 text-amber-400" />
              <span>{language === 'ar' ? 'مشاركة مجلد' : 'Share Folder'}</span>
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center justify-between">
          <span>{language === 'ar' ? `إجمالي الملفات المتاحة للمشاركة: ${remoteFiles.length} ملف` : `Total shared files: ${remoteFiles.length}`}</span>
          <span className="font-mono text-[11px] text-emerald-400">{formatBytes(remoteFiles.reduce((acc, f) => acc + f.sizeBytes, 0))}</span>
        </div>
      </div>

      {/* Storage Access Framework (SAF) Scopes Configuration */}
      <div className="p-5 rounded-2xl bg-[#141a22] border border-slate-700/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Folder className="w-4 h-4 text-amber-400" />
              <span>{language === 'ar' ? 'إدارة أذونات المجلدات المشتركة (SAF Scoped Access)' : 'Authorized Scoped Folders'}</span>
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              لا يمكن لجهاز التحكم قراءة أو كتابة أي مجلد إلا بعد منحه صلاحية DocumentFile صريحة هنا.
            </p>
          </div>

          <button
            onClick={() => setShowGrantModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 active:scale-95 transition-all"
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

      {/* Grant SAF Modal */}
      {showGrantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#16202c] border border-slate-700 rounded-3xl p-6 text-white shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white">منح صلاحية DocumentFile جديدة</h3>

            <form onSubmit={handleGrant} className="space-y-3.5">
              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">اسم المجلد المعروض:</label>
                <input
                  type="text"
                  required
                  value={newFolderName}
                  onChange={e => setNewFolderName(e.target.value)}
                  placeholder="مجلد الصور والمستندات"
                  className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-[#3daee9]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">المسار في نظام أندرويد:</label>
                <input
                  type="text"
                  required
                  value={newFolderPath}
                  onChange={e => setNewFolderPath(e.target.value)}
                  placeholder="/storage/emulated/0/DCIM/Custom"
                  className="w-full py-2.5 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-[#3daee9]"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-300 block mb-1">نوع الوصول المصرح:</label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setNewAccessMode('readonly')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold ${
                      newAccessMode === 'readonly' ? 'bg-sky-600 text-white border-sky-500' : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    قراءة فقط (Safe)
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAccessMode('readwrite')}
                    className={`py-2 px-3 rounded-xl border text-center font-bold ${
                      newAccessMode === 'readwrite' ? 'bg-emerald-600 text-white border-emerald-500' : 'bg-slate-900 border-slate-700 text-slate-400'
                    }`}
                  >
                    قراءة وكتابة (Full)
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold hover:from-emerald-500"
                >
                  تأكيد ومنح الصلاحية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
