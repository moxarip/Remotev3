import React, { useState } from 'react';
import {
  BookOpen,
  Cpu,
  Layers,
  ShieldCheck,
  FileCode,
  FolderTree,
  Terminal,
  CheckCircle2,
  Database,
  Cloud
} from 'lucide-react';

export const ArchitectureDocModal: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'jetpack' | 'protocol' | 'storage' | 'security'>('jetpack');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-[#131c26] to-sky-950/70 border border-emerald-800/50 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#27ae60] to-[#3daee9] flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">
              المعمارية البرمجية ومطابقة واجهات Android الرسمية (Clouvea Architecture)
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              توثيق هندسي دقيق لكيفية ربط وظائف النظام بمكونات Android Jetpack الرسمية (Room, WorkManager, SAF, Foreground Service).
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs">
        <button
          onClick={() => setActiveTab('jetpack')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'jetpack' ? 'bg-[#27ae60] text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>مكونات Android Jetpack</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'storage' ? 'bg-[#3daee9] text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <FolderTree className="w-4 h-4" />
          <span>Storage Access Framework</span>
        </button>

        <button
          onClick={() => setActiveTab('protocol')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'protocol' ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>بروتوكول المهام والحزم</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-semibold transition-all ${
            activeTab === 'security' ? 'bg-amber-600 text-white shadow-md' : 'bg-slate-900 text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>الأمان وتشفير SHA-256</span>
        </button>
      </div>

      {/* Content Panel */}
      <div className="p-6 rounded-2xl bg-[#141a22] border border-slate-700/80 shadow-xl text-slate-300 text-xs leading-relaxed space-y-4 font-sans">
        {activeTab === 'jetpack' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>مكونات أندرويد الأساسية في بنية Clouvea:</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-bold text-sky-400 font-mono block">1. Room Persistence Database</span>
                <p>
                  تخزين حالات المهام محلياً وفهرسة بصمات الملفات (Manifest Hash Database). يضمن بقاء حالة المهام عند انقطاع الاتصال أو إعادة تشغيل الجهاز.
                </p>
                <code className="text-[10px] text-emerald-400 font-mono block bg-[#0a0e13] p-2 rounded">
                  @Entity(tableName = "clouvea_tasks") data class TaskEntity(...)
                </code>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-bold text-emerald-400 font-mono block">2. Android WorkManager</span>
                <p>
                  جدولة وتشغيل النسخ الاحتياطي التفاضلي مع فرض قيود النظام (العمل فقط أثناء التوصيل بالشاحن أو اتصال Wi-Fi غير المحدود).
                </p>
                <code className="text-[10px] text-emerald-400 font-mono block bg-[#0a0e13] p-2 rounded">
                  class DifferentialBackupWorker(ctx, params) : CoroutineWorker(ctx, params)
                </code>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-bold text-amber-400 font-mono block">3. Foreground Service Daemon</span>
                <p>
                  خدمة خلفية مستمرة بإشعار واضح لحماية مآخذ اتصال الـ TCP/TLS من الإيقاف بواسطة ميزة Doze Mode ونظام تحسين البطارية.
                </p>
                <code className="text-[10px] text-emerald-400 font-mono block bg-[#0a0e13] p-2 rounded">
                  startForeground(NOTIFICATION_ID, buildDaemonNotification())
                </code>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <span className="font-bold text-purple-400 font-mono block">4. Network Link Providers</span>
                <p>
                  طبقة هجينة تكتشف الأجهزة المحلية على المنفذ 1716 وتتحول إلى خادم الترحيل الآمن (Relay Server) عند وجود الأجهزة عبر الإنترنت.
                </p>
                <code className="text-[10px] text-emerald-400 font-mono block bg-[#0a0e13] p-2 rounded">
                  class ClouveaHybridLink(val localLink: LanLink, val relay: WebSocketRelay)
                </code>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'storage' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-[#3daee9]" />
              <span>تكامل Storage Access Framework (SAF) والصلاحيات المقيدة:</span>
            </h3>

            <p>
              لا يطلب التطبيق صلاحية <code className="text-rose-400 bg-slate-900 px-1.5 py-0.5 rounded">MANAGE_EXTERNAL_STORAGE</code> الخطرة، بل يعتمد على المعيار الرسمي لأندرويد 11+ عبر شجرة الـ URIs:
            </p>

            <div className="p-4 rounded-xl bg-[#0a0e13] border border-slate-800 font-mono text-[11px] text-sky-300 overflow-x-auto space-y-2">
              <div>// 1. طلب الصلاحية من المستخدم عبر SAF Intent</div>
              <div className="text-slate-400">val intent = Intent(Intent.ACTION_OPEN_DOCUMENT_TREE)</div>
              <div>// 2. الحفاظ على الصلاحية بشكل دائم بعد إعادة التشغيل</div>
              <div className="text-emerald-400">context.contentResolver.takePersistableUriPermission(treeUri, flags)</div>
              <div>// 3. التصفح الآمن للمجلدات المصرح بها فقط</div>
              <div className="text-amber-400">val scopedRoot = DocumentFile.fromTreeUri(context, treeUri)</div>
            </div>
          </div>
        )}

        {activeTab === 'protocol' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Terminal className="w-4 h-4 text-indigo-400" />
              <span>بروتوكول المهام الموحد (Clouvea Unified Task Protocol):</span>
            </h3>

            <p>
              يتم إرسال حزم المهام بصيغة كائنات JSON موحدة مع آلية منع التكرار (Idempotency):
            </p>

            <div className="p-4 rounded-xl bg-[#0a0e13] border border-slate-800 font-mono text-[11px] text-emerald-400 overflow-x-auto">
              <pre>{`{
  "taskId": "task-8f921-uuid",
  "type": "DOWNLOAD_FILE",
  "sourceDevice": "controller-galaxy-s24",
  "targetDevice": "node-pixel-9",
  "payload": {
    "fileId": "IMG_20261010_142018_4K.jpg",
    "chunkSize": 1048576,
    "offset": 0,
    "checksumExpected": "e3b0c44298fc1c149afbf4c8..."
  }
}`}</pre>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>فحص سلامة البيانات والتشفير:</span>
            </h3>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-0.5">مطابقة بصمة SHA-256 للملفات</h4>
                  <p className="text-slate-400">
                    يتم حساب بصمة التجزئة SHA-256 قبل وأثناء وبعد نقل كل ملف، ولا تُعتبر المهمة مكتملة بنجاح إلا بمطابقة البصمة الأصلية.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-0.5">تشفير القناة ونفق TLS 1.3</h4>
                  <p className="text-slate-400">
                    توليد شهادات RSA-4096 محلياً وتبادل البصمة ثنائياً برمز اقتران أو رمز QR يمنع أي طرف غريب من التجسس على حزم النقل.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
