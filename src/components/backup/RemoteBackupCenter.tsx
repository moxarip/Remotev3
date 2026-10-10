import React, { useState } from 'react';
import { useClouvea } from '../../context/ClouveaContext';
import {
  HardDrive,
  Folder,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  RotateCw,
  FileCheck2,
  AlertCircle,
  Play,
  Download,
  FolderSync,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';
import { formatBytes } from '../../utils/crypto';

export const RemoteBackupCenter: React.FC = () => {
  const {
    activeNode,
    folderScopes,
    startSmartBackup,
    restoreBackup,
    downloadBackupArchive,
    activeBackupJob,
    backupJobs,
    t,
    language,
    showToast
  } = useClouvea();

  const [selectedFolderIds, setSelectedFolderIds] = useState<string[]>(['scope-dcim', 'scope-docs']);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(['image', 'document', 'video']);
  const [restoreModalJobId, setRestoreModalJobId] = useState<string | null>(null);
  const [restorePath, setRestorePath] = useState('/storage/emulated/0/Clouvea/Restored');

  const availableFolders = folderScopes.filter(s => s.isShared);

  const toggleFolder = (id: string) => {
    setSelectedFolderIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(item => item !== cat) : [...prev, cat]
    );
  };

  const handleStartBackup = () => {
    if (selectedFolderIds.length === 0) {
      showToast(language === 'ar' ? 'يرجى اختيار مجلد واحد على الأقل للنسخ' : 'Select at least one folder');
      return;
    }
    startSmartBackup(selectedFolderIds, selectedCategories);
  };

  const handleConfirmRestore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreModalJobId) return;
    restoreBackup(restoreModalJobId, restorePath);
    setRestoreModalJobId(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-950/70 via-[#131c26] to-emerald-950/70 border border-slate-700/80 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#1d99f3] to-[#27ae60] flex items-center justify-center text-white shadow-lg shadow-sky-500/20 shrink-0">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">
                {t.smartBackupTitle}
              </h2>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono">
                SHA-256 Differential
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {t.smartBackupDesc}
            </p>
          </div>
        </div>

        {/* Safety Guarantee Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-emerald-400 font-medium">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>{t.noDataLossGuarantee}</span>
        </div>
      </div>

      {/* Backup Setup Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Source Scopes & Type Selectors (7 cols) */}
        <div className="lg:col-span-7 p-5 rounded-2xl bg-[#141a22] border border-slate-700/80 shadow-xl space-y-4">
          <h3 className="font-bold text-sm text-white flex items-center gap-2 pb-2 border-b border-slate-800">
            <Folder className="w-4 h-4 text-amber-400" />
            <span>{t.selectSourceFolders}</span>
          </h3>

          {/* Folder Choice Checkboxes */}
          <div className="space-y-2">
            {availableFolders.map(scope => {
              const isChecked = selectedFolderIds.includes(scope.id);
              return (
                <div
                  key={scope.id}
                  onClick={() => toggleFolder(scope.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isChecked
                      ? 'bg-[#182330] border-[#3daee9]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}}
                      className="w-4 h-4 accent-[#3daee9] rounded"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">{scope.name}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">{scope.path}</span>
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 font-mono">
                    {scope.fileCount} ملفات
                  </span>
                </div>
              );
            })}
          </div>

          {/* File Types Filtering */}
          <div className="pt-2">
            <span className="text-xs font-semibold text-slate-300 block mb-2">
              {t.selectFileTypes}
            </span>
            <div className="flex flex-wrap gap-2 text-xs">
              {[
                { id: 'image', label: 'الصور (JPEG, PNG, RAW)' },
                { id: 'video', label: 'الفيديوهات (MP4, MKV)' },
                { id: 'document', label: 'المستندات (PDF, DOCX, XLSX)' },
                { id: 'audio', label: 'التسجيلات الصوتية (M4A, MP3)' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => toggleCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                    selectedCategories.includes(cat.id)
                      ? 'bg-[#3daee9] text-white border-[#3daee9]'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Launch Backup CTA */}
          <button
            onClick={handleStartBackup}
            disabled={activeBackupJob?.status === 'scanning' || activeBackupJob?.status === 'transferring'}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#27ae60] to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 disabled:opacity-50 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/25 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{t.runBackup}</span>
          </button>
        </div>

        {/* Live Backup Engine Telemetry & Progress (5 cols) */}
        <div className="lg:col-span-5 p-5 rounded-2xl bg-[#141a22] border border-slate-700/80 shadow-xl space-y-4">
          <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
            <FolderSync className="w-4 h-4 text-emerald-400" />
            <span>حالة محرك النسخ التفاضلي الحالي</span>
          </h3>

          {activeBackupJob ? (
            <div className="space-y-3.5 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white font-mono">Job: {activeBackupJob.id}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-mono ${
                  activeBackupJob.status === 'completed'
                    ? 'bg-emerald-950 text-emerald-400'
                    : 'bg-sky-950 text-sky-400 animate-pulse'
                }`}>
                  {activeBackupJob.status}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-400">
                  <span>{t.backupProgress}</span>
                  <span className="font-bold text-white">{activeBackupJob.progress}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    style={{ width: `${activeBackupJob.progress}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-sky-500 transition-all duration-300"
                  />
                </div>
              </div>

              {/* Differential breakdown statistics */}
              <div className="grid grid-cols-2 gap-2 text-[11px] font-mono pt-1">
                <div className="p-2 rounded-lg bg-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">{t.changedFilesCount}</span>
                  <span className="font-bold text-emerald-400 text-sm">{activeBackupJob.changedFiles}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-800/80">
                  <span className="text-slate-400 block text-[10px]">{t.skippedFilesCount}</span>
                  <span className="font-bold text-sky-400 text-sm">{activeBackupJob.skippedFiles}</span>
                </div>
              </div>

              {/* Speed & Verification */}
              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-900/60 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 text-emerald-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>{t.verifiedChecksums}</span>
                </div>
                <span className="font-bold font-mono text-emerald-400">
                  {activeBackupJob.integrityVerifiedCount} / {activeBackupJob.changedFiles} SHA-256
                </span>
              </div>

              {activeBackupJob.status === 'completed' && (
                <div className="p-2 rounded-lg bg-slate-800/80 text-[10px] text-slate-300 font-mono truncate">
                  المسار: {activeBackupJob.destinationPath}
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-slate-900/60 border border-slate-800 text-center text-slate-500 text-xs">
              لا توجد عمليات نسخ احتياطي قيد التنفيذ حالياً. اختر المجلدات واضغط على زر البدء أعلاه.
            </div>
          )}
        </div>
      </div>

      {/* Backup History Table */}
      <div className="p-5 rounded-2xl bg-[#141a22] border border-slate-700/80 shadow-xl space-y-3">
        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <Clock className="w-4 h-4 text-sky-400" />
          <span>سجل النسخ الاحتياطية السابقة وإمكانية الاستعادة (Restore)</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-slate-300 text-right">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-mono text-[11px]">
                <th className="py-2.5 px-3">معرّف النسخة</th>
                <th className="py-2.5 px-3">المصدر</th>
                <th className="py-2.5 px-3">الملفات المنقولة</th>
                <th className="py-2.5 px-3">الحجم الإجمالي</th>
                <th className="py-2.5 px-3">فحص السلامة</th>
                <th className="py-2.5 px-3">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {backupJobs.map(job => (
                <tr key={job.id} className="hover:bg-slate-900/60">
                  <td className="py-3 px-3 font-bold text-white">{job.id}</td>
                  <td className="py-3 px-3">{job.sourceDeviceId}</td>
                  <td className="py-3 px-3 text-emerald-400">{job.transferredFiles} ملفات</td>
                  <td className="py-3 px-3">{formatBytes(job.transferredBytes)}</td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800">
                      مطابقة SHA-256
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => downloadBackupArchive(job.id)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-800 text-xs font-semibold flex items-center gap-1"
                        title="تنزيل أرشيف النسخ كملف مضغوط ZIP"
                      >
                        <Download className="w-3 h-3" />
                        <span>{language === 'ar' ? 'تنزيل ZIP' : 'ZIP'}</span>
                      </button>
                      <button
                        onClick={() => setRestoreModalJobId(job.id)}
                        className="px-2.5 py-1 rounded-lg bg-sky-950 hover:bg-sky-900 text-sky-400 border border-sky-800 text-xs font-semibold flex items-center gap-1"
                      >
                        <FolderSync className="w-3 h-3" />
                        <span>{t.restoreBackup}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restore Destination Modal */}
      {restoreModalJobId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <form onSubmit={handleConfirmRestore} className="w-full max-w-md bg-[#141a22] rounded-3xl border border-slate-700 shadow-2xl p-6 text-white space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Download className="w-4 h-4 text-[#3daee9]" />
              <span>استعادة النسخة الاحتياطية</span>
            </h3>

            <p className="text-xs text-slate-300">
              سيتم فحص سلامة النسخة واستعادة الملفات إلى المسار المحدد أدناه دون الكتابة فوق الملفات الأصلية:
            </p>

            <div>
              <label className="text-slate-400 text-xs block mb-1">{t.restoreDestination}</label>
              <input
                type="text"
                value={restorePath}
                onChange={e => setRestorePath(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#3daee9]"
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-xl bg-[#3daee9] hover:bg-[#1d99f3] text-white font-bold text-xs"
              >
                تأكيد وبدء الاستعادة
              </button>
              <button
                type="button"
                onClick={() => setRestoreModalJobId(null)}
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
