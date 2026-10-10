import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import {
  ClouveaDevice,
  ClouveaFolderScope,
  RemoteFile,
  ClouveaTask,
  ClouveaTaskType,
  BackupJob,
  AuditEvent,
  ClouveaRole,
  ClouveaConnectionMode
} from '../types';
import {
  initialClouveaDevices,
  initialFolderScopes,
  initialRemoteFiles,
  initialTasks,
  initialBackupJobs,
  initialAuditEvents
} from './clouveaData';
import { translations, Language } from '../utils/translations';
import { soundEffects } from '../utils/soundEffects';
import { computeSha256, generateUuid, formatBytes } from '../utils/crypto';

export type ClouveaActiveView =
  | 'controller'
  | 'node'
  | 'dual_mesh'
  | 'backup'
  | 'tasks'
  | 'security'
  | 'architecture';

interface ClouveaContextType {
  activeView: ClouveaActiveView;
  setActiveView: (view: ClouveaActiveView) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['ar'];
  connectionMode: ClouveaConnectionMode;
  setConnectionMode: (mode: ClouveaConnectionMode) => void;
  
  // Devices & Fleet
  devices: ClouveaDevice[];
  activeNodeId: string;
  setActiveNodeId: (id: string) => void;
  activeNode: ClouveaDevice;
  controllerDevice: ClouveaDevice;
  pairNewDevice: (device: Partial<ClouveaDevice>) => void;
  revokeDeviceTrust: (deviceId: string) => void;
  ringDevice: (deviceId: string) => void;
  
  // Storage & Files (SAF)
  folderScopes: ClouveaFolderScope[];
  grantFolderScope: (name: string, path: string, accessMode: 'readonly' | 'readwrite') => void;
  revokeFolderScope: (folderId: string) => void;
  remoteFiles: RemoteFile[];
  downloadRemoteFile: (file: RemoteFile) => Promise<void>;
  uploadFileToNode: (folderId: string, file: File) => Promise<void>;
  
  // Unified Tasks
  tasks: ClouveaTask[];
  dispatchTask: (type: ClouveaTaskType, payload: Record<string, any>) => string;
  cancelTask: (taskId: string) => void;
  retryTask: (taskId: string) => void;
  
  // Smart Remote Backup
  backupJobs: BackupJob[];
  activeBackupJob: BackupJob | null;
  startSmartBackup: (sourceFolders: string[], categories: string[]) => Promise<void>;
  restoreBackup: (jobId: string, destination: string) => Promise<void>;
  
  // Audit Trail
  auditEvents: AuditEvent[];
  
  // Audio & Alerts
  soundEnabled: boolean;
  toggleSound: () => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  isRingingDeviceId: string | null;
  stopRinging: () => void;
}

const ClouveaContext = createContext<ClouveaContextType | undefined>(undefined);

export const ClouveaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeView, setActiveView] = useState<ClouveaActiveView>('controller');
  const [language, setLanguage] = useState<Language>('ar');
  const [connectionMode, setConnectionMode] = useState<ClouveaConnectionMode>('hybrid');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRingingDeviceId, setIsRingingDeviceId] = useState<string | null>(null);

  // Core Data State
  const [devices, setDevices] = useState<ClouveaDevice[]>(initialClouveaDevices);
  const [activeNodeId, setActiveNodeId] = useState<string>('node-alpha-1');
  const [folderScopes, setFolderScopes] = useState<ClouveaFolderScope[]>(initialFolderScopes);
  const [remoteFiles, setRemoteFiles] = useState<RemoteFile[]>(initialRemoteFiles);
  const [tasks, setTasks] = useState<ClouveaTask[]>(initialTasks);
  const [backupJobs, setBackupJobs] = useState<BackupJob[]>(initialBackupJobs);
  const [activeBackupJob, setActiveBackupJob] = useState<BackupJob | null>(null);
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>(initialAuditEvents);

  const t = translations[language];

  const controllerDevice = devices.find(d => d.role === 'controller') || devices[0];
  const activeNode = devices.find(d => d.id === activeNodeId) || devices[1];

  // BroadcastChannel for instant cross-tab / cross-window sync
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
        const channel = new BroadcastChannel('clouvea_mesh_broadcast');
        broadcastChannelRef.current = channel;

        channel.onmessage = (event) => {
          const { type, payload } = event.data;
          if (type === 'TASK_CREATED') {
            setTasks(prev => [payload, ...prev]);
          } else if (type === 'TASK_UPDATED') {
            setTasks(prev => prev.map(t => t.taskId === payload.taskId ? payload : t));
          } else if (type === 'FILE_UPLOADED') {
            setRemoteFiles(prev => [payload, ...prev]);
          } else if (type === 'RING_DEVICE') {
            setIsRingingDeviceId(payload.deviceId);
            soundEffects.startRing();
          } else if (type === 'STOP_RING') {
            setIsRingingDeviceId(null);
            soundEffects.stopRing();
          }
        };

        return () => channel.close();
      }
    } catch {
      // Ignored
    }
  }, []);

  const broadcastEvent = (type: string, payload: any) => {
    if (broadcastChannelRef.current) {
      try {
        broadcastChannelRef.current.postMessage({ type, payload });
      } catch {
        // Ignored
      }
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const toggleSound = () => {
    setSoundEnabled(prev => {
      const next = !prev;
      soundEffects.setMuted(!next);
      return next;
    });
  };

  const addAuditEvent = (action: string, status: 'success' | 'warning' | 'error', details: string, target = activeNodeId) => {
    const event: AuditEvent = {
      id: generateUuid(),
      timestamp: new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      sourceDevice: controllerDevice.id,
      targetDevice: target,
      action,
      status,
      details
    };
    setAuditEvents(prev => [event, ...prev.slice(0, 50)]);
  };

  // Ring remote device
  const ringDevice = (deviceId: string) => {
    setIsRingingDeviceId(deviceId);
    soundEffects.startRing();
    broadcastEvent('RING_DEVICE', { deviceId });
    addAuditEvent('Find Device Emergency Alarm', 'warning', 'Triggered high-volume emergency siren', deviceId);
    showToast(language === 'ar' ? 'تم تشغيل إنذار رنين الجهاز عن بُعد' : 'Triggered remote device ring');
  };

  const stopRinging = () => {
    setIsRingingDeviceId(null);
    soundEffects.stopRing();
    broadcastEvent('STOP_RING', {});
  };

  // Device pairing & trust
  const pairNewDevice = (deviceData: Partial<ClouveaDevice>) => {
    const newDev: ClouveaDevice = {
      id: generateUuid(),
      name: deviceData.name || 'Managed Clouvea Node',
      role: 'node',
      model: deviceData.model || 'Android 14 Handset',
      status: 'online',
      connectionType: 'local_wifi',
      ip: deviceData.ip || '192.168.1.199',
      port: 1716,
      batteryLevel: 80,
      isCharging: false,
      storageTotalBytes: 256000000000,
      storageUsedBytes: 85000000000,
      storageFreeBytes: 171000000000,
      certificateFingerprint: 'B2:44:91:AA:C1:66:D4:55:09:12:F4:7E:33:99:A8:12:CC:54:11:00',
      lastSeen: 'الآن',
      latencyMs: 18,
      isTrusted: true,
      activeTasksCount: 0,
      ...deviceData
    };
    setDevices(prev => [...prev, newDev]);
    soundEffects.playPairSuccess();
    addAuditEvent('Device Paired and Trusted', 'success', `Trusted node ${newDev.name} via TLS Handshake`, newDev.id);
    showToast(language === 'ar' ? `تم اقتران الجهاز بنجاح: ${newDev.name}` : `Paired device: ${newDev.name}`);
  };

  const revokeDeviceTrust = (deviceId: string) => {
    setDevices(prev => prev.map(d => d.id === deviceId ? { ...d, isTrusted: false, status: 'offline' } : d));
    addAuditEvent('Revoked Device Trust', 'warning', `Terminated trusted session for ${deviceId}`, deviceId);
    showToast(language === 'ar' ? 'تم إلغاء الثقة وفصل الجلسة' : 'Revoked trust and disconnected');
  };

  // SAF Folder Scoping
  const grantFolderScope = (name: string, path: string, accessMode: 'readonly' | 'readwrite') => {
    const newScope: ClouveaFolderScope = {
      id: `scope-${Date.now()}`,
      name,
      path,
      safTreeUri: `content://com.android.externalstorage.documents/tree/primary%3A${encodeURIComponent(path.replace('/storage/emulated/0/', ''))}`,
      isShared: true,
      accessMode,
      fileCount: 0,
      totalBytes: 0,
      iconType: 'custom'
    };
    setFolderScopes(prev => [...prev, newScope]);
    addAuditEvent('SAF Folder Permission Granted', 'success', `Authorized tree URI for path ${path} (${accessMode})`);
    showToast(language === 'ar' ? `تم منح الصلاحية ومشاركة المجلد: ${name}` : `Granted SAF scope: ${name}`);
  };

  const revokeFolderScope = (folderId: string) => {
    setFolderScopes(prev => prev.map(s => s.id === folderId ? { ...s, isShared: false } : s));
    addAuditEvent('SAF Folder Permission Revoked', 'warning', `Revoked tree URI access for ${folderId}`);
    showToast(language === 'ar' ? 'تم إلغاء مشاركة المجلد وحظر الوصول إليه' : 'Revoked folder access');
  };

  // Unified Task Dispatcher
  const dispatchTask = (type: ClouveaTaskType, payload: Record<string, any>): string => {
    const taskId = `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newTask: ClouveaTask = {
      taskId,
      sourceDeviceId: controllerDevice.id,
      targetDeviceId: activeNodeId,
      type,
      status: 'executing',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      progress: 0,
      bytesTransferred: 0,
      totalBytes: payload.totalBytes || 1024000,
      transferSpeed: '16.4 MB/s',
      payload,
      retryCount: 0
    };

    setTasks(prev => [newTask, ...prev]);
    broadcastEvent('TASK_CREATED', newTask);
    addAuditEvent(`Task Dispatched: ${type}`, 'success', `TaskId ${taskId} targeting node ${activeNode.name}`);

    // Simulate realistic progressive task execution
    let currentProgress = 10;
    const interval = setInterval(() => {
      currentProgress += 20;
      if (currentProgress >= 100) {
        clearInterval(interval);
        const completedTask: ClouveaTask = {
          ...newTask,
          status: 'completed',
          progress: 100,
          bytesTransferred: newTask.totalBytes,
          updatedAt: Date.now(),
          result: { success: true, timestamp: Date.now() }
        };
        setTasks(prev => prev.map(t => t.taskId === taskId ? completedTask : t));
        broadcastEvent('TASK_UPDATED', completedTask);
        soundEffects.playFileSent();
      } else {
        setTasks(prev => prev.map(t => t.taskId === taskId ? {
          ...t,
          progress: currentProgress,
          bytesTransferred: Math.floor((currentProgress / 100) * t.totalBytes),
          updatedAt: Date.now()
        } : t));
      }
    }, 450);

    return taskId;
  };

  const cancelTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.taskId === taskId ? { ...t, status: 'cancelled', updatedAt: Date.now() } : t));
    showToast(language === 'ar' ? 'تم إلغاء المهمة فورياً' : 'Task cancelled');
  };

  const retryTask = (taskId: string) => {
    const task = tasks.find(t => t.taskId === taskId);
    if (!task) return;
    dispatchTask(task.type, task.payload);
  };

  // Remote File Transfer (Chunked with SHA-256 Checksum)
  const downloadRemoteFile = async (file: RemoteFile) => {
    soundEffects.playClick('soft');
    showToast(language === 'ar' ? `بدء تنزيل الملف: ${file.name}` : `Starting download: ${file.name}`);
    
    const taskId = dispatchTask('DOWNLOAD_FILE', {
      fileId: file.id,
      fileName: file.name,
      totalBytes: file.sizeBytes,
      checksumExpected: file.checksumSha256
    });

    addAuditEvent('DOWNLOAD_FILE Stream', 'success', `Downloading ${file.name} (${formatBytes(file.sizeBytes)}) with chunked resumption support`);
  };

  const uploadFileToNode = async (folderId: string, file: File) => {
    soundEffects.playClick('soft');
    const checksum = await computeSha256(file.name + file.size + Date.now());
    const newRemoteFile: RemoteFile = {
      id: `file-up-${Date.now()}`,
      folderId,
      name: file.name,
      path: `/storage/emulated/0/Uploads/${file.name}`,
      sizeBytes: file.size,
      mtime: Date.now(),
      mtimeFormatted: new Date().toISOString().slice(0, 16).replace('T', ' '),
      mimeType: file.type || 'application/octet-stream',
      category: file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : 'document',
      checksumSha256: checksum
    };

    dispatchTask('UPLOAD_FILE', {
      fileName: file.name,
      totalBytes: file.size,
      checksum
    });

    setTimeout(() => {
      setRemoteFiles(prev => [newRemoteFile, ...prev]);
      broadcastEvent('FILE_UPLOADED', newRemoteFile);
      soundEffects.playFileSent();
      showToast(language === 'ar' ? `تم رفع الملف بنجاح مع مطابقة بصمة SHA-256: ${file.name}` : `Uploaded file: ${file.name}`);
    }, 1800);
  };

  // Smart Differential Backup Engine
  const startSmartBackup = async (sourceFolders: string[], categories: string[]) => {
    soundEffects.playClick('soft');
    const jobId = `backup-${Date.now()}`;
    
    // Determine files in chosen scopes
    const filesInScope = remoteFiles.filter(f => sourceFolders.includes(f.folderId));
    const totalFiles = filesInScope.length || 24;
    const totalBytes = filesInScope.reduce((acc, f) => acc + f.sizeBytes, 0) || 184000000;
    
    // Realistic differential detection: only modified/new files are transferred
    const changedFiles = Math.max(2, Math.floor(totalFiles * 0.25));
    const skippedFiles = totalFiles - changedFiles;
    const transferredBytes = Math.floor(totalBytes * 0.25);

    const newJob: BackupJob = {
      id: jobId,
      sourceDeviceId: activeNodeId,
      targetDeviceId: controllerDevice.id,
      sourceFolders,
      fileCategories: categories,
      status: 'scanning',
      totalFiles,
      scannedFiles: 0,
      changedFiles: 0,
      skippedFiles: 0,
      transferredFiles: 0,
      totalBytes,
      transferredBytes: 0,
      progress: 5,
      speed: '0 MB/s',
      integrityVerifiedCount: 0,
      startTime: Date.now(),
      checksumMatched: true,
      destinationPath: `/storage/emulated/0/Clouvea/Backups/${activeNode.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}`
    };

    setActiveBackupJob(newJob);
    dispatchTask('START_BACKUP', { jobId, mode: 'differential', sourceFolders });

    // Step 1: Scanning & SHA-256 Manifest Comparison
    setTimeout(() => {
      setActiveBackupJob(prev => prev ? {
        ...prev,
        status: 'transferring',
        scannedFiles: totalFiles,
        changedFiles,
        skippedFiles,
        progress: 35,
        speed: '24.5 MB/s'
      } : null);
    }, 1200);

    // Step 2: Chunked Differential Transfer
    setTimeout(() => {
      setActiveBackupJob(prev => prev ? {
        ...prev,
        status: 'verifying',
        transferredFiles: changedFiles,
        transferredBytes,
        progress: 85,
        speed: '19.2 MB/s'
      } : null);
    }, 2800);

    // Step 3: Checksum Integrity Verification
    setTimeout(() => {
      const finalJob: BackupJob = {
        ...newJob,
        status: 'completed',
        scannedFiles: totalFiles,
        changedFiles,
        skippedFiles,
        transferredFiles: changedFiles,
        transferredBytes,
        progress: 100,
        integrityVerifiedCount: changedFiles,
        endTime: Date.now(),
        checksumMatched: true
      };

      setActiveBackupJob(finalJob);
      setBackupJobs(prev => [finalJob, ...prev]);
      soundEffects.playFileSent();
      addAuditEvent('Smart Differential Backup Completed', 'success', `Verified ${changedFiles} changed files via SHA-256. Skipped ${skippedFiles} unchanged.`);
      showToast(language === 'ar' ? 'اكتمل النسخ الاحتياطي الذكي وتم التحقق من سلامة جميع الملفات!' : 'Smart backup completed and verified!');
    }, 4200);
  };

  const restoreBackup = async (jobId: string, destination: string) => {
    soundEffects.playClick('soft');
    dispatchTask('SYNC_FOLDER', { jobId, destination });
    showToast(language === 'ar' ? `جاري استعادة النسخة الاحتياطية إلى: ${destination}` : `Restoring backup to: ${destination}`);
  };

  return (
    <ClouveaContext.Provider
      value={{
        activeView,
        setActiveView,
        language,
        setLanguage,
        t,
        connectionMode,
        setConnectionMode,
        devices,
        activeNodeId,
        setActiveNodeId,
        activeNode,
        controllerDevice,
        pairNewDevice,
        revokeDeviceTrust,
        ringDevice,
        folderScopes,
        grantFolderScope,
        revokeFolderScope,
        remoteFiles,
        downloadRemoteFile,
        uploadFileToNode,
        tasks,
        dispatchTask,
        cancelTask,
        retryTask,
        backupJobs,
        activeBackupJob,
        startSmartBackup,
        restoreBackup,
        auditEvents,
        soundEnabled,
        toggleSound,
        toastMessage,
        showToast,
        isRingingDeviceId,
        stopRinging
      }}
    >
      {children}
    </ClouveaContext.Provider>
  );
};

export const useClouvea = () => {
  const context = useContext(ClouveaContext);
  if (!context) {
    throw new Error('useClouvea must be used within a ClouveaProvider');
  }
  return context;
};
