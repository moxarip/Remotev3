import {
  ClouveaDevice,
  ClouveaFolderScope,
  RemoteFile,
  ClouveaTask,
  BackupJob,
  AuditEvent
} from '../types';

export const initialClouveaDevices: ClouveaDevice[] = [
  {
    id: 'controller-device-1',
    name: 'Clouvea Controller (Galaxy S24 Ultra)',
    role: 'controller',
    model: 'Samsung SM-S928B • Android 14',
    status: 'online',
    connectionType: 'local_wifi',
    ip: '192.168.1.142',
    port: 1716,
    batteryLevel: 86,
    isCharging: false,
    storageTotalBytes: 512000000000,
    storageUsedBytes: 214000000000,
    storageFreeBytes: 298000000000,
    certificateFingerprint: 'A8:3F:B2:77:90:31:CF:45:9D:C2:55:7B:10:E4:C9:82:3F:8A:1E:50',
    lastSeen: 'الآن (متصل مباشرة)',
    latencyMs: 14,
    isTrusted: true,
    activeTasksCount: 1,
    location: {
      latitude: 24.7136,
      longitude: 46.6753,
      accuracy: 6,
      altitude: 612,
      speed: 0,
      heading: 45,
      timestamp: Date.now(),
      addressLabel: 'Riyadh, Al Olaya District',
      source: 'gps'
    }
  },
  {
    id: 'node-alpha-1',
    name: 'Node Alpha (Pixel 9 Pro - Personal Media)',
    role: 'node',
    model: 'Google G1NR4 • Android 15',
    status: 'online',
    connectionType: 'local_wifi',
    ip: '192.168.1.165',
    port: 1716,
    batteryLevel: 72,
    isCharging: true,
    storageTotalBytes: 256000000000,
    storageUsedBytes: 168000000000,
    storageFreeBytes: 88000000000,
    certificateFingerprint: 'F8:29:1A:05:CC:74:EE:31:8B:D0:62:3A:41:99:38:20:AA:15:E7:BC',
    lastSeen: 'الآن (متصل)',
    latencyMs: 22,
    isTrusted: true,
    activeTasksCount: 0,
    location: {
      latitude: 24.7178,
      longitude: 46.6792,
      accuracy: 8,
      altitude: 615,
      speed: 0,
      heading: 120,
      timestamp: Date.now(),
      addressLabel: 'King Fahd Road, Riyadh',
      source: 'gps'
    }
  },
  {
    id: 'node-beta-2',
    name: 'Node Beta (Galaxy Tab S9 - Vault & Docs)',
    role: 'node',
    model: 'Samsung SM-X710 • Android 14',
    status: 'online',
    connectionType: 'internet_relay',
    ip: '10.0.4.88',
    port: 1716,
    batteryLevel: 58,
    isCharging: false,
    storageTotalBytes: 256000000000,
    storageUsedBytes: 94000000000,
    storageFreeBytes: 162000000000,
    certificateFingerprint: '3C:5D:89:12:FA:7E:00:81:66:B9:43:11:09:A4:DE:67:EE:F1:02:88',
    lastSeen: 'منذ 2 دقيقة',
    latencyMs: 65,
    isTrusted: true,
    activeTasksCount: 0
  },
  {
    id: 'node-gamma-3',
    name: 'Node Gamma (Office Backup Device)',
    role: 'node',
    model: 'OnePlus 12 • Android 14',
    status: 'offline',
    connectionType: 'internet_relay',
    ip: '192.168.10.45',
    port: 1716,
    batteryLevel: 34,
    isCharging: false,
    storageTotalBytes: 512000000000,
    storageUsedBytes: 310000000000,
    storageFreeBytes: 202000000000,
    certificateFingerprint: '77:1A:E9:54:21:BB:00:99:C4:82:11:04:8E:22:90:DA:CC:89:12:33',
    lastSeen: 'منذ 3 ساعات',
    latencyMs: 0,
    isTrusted: true,
    activeTasksCount: 0
  }
];

export const initialFolderScopes: ClouveaFolderScope[] = [
  {
    id: 'scope-dcim',
    name: 'كاميرا الهاتف والصور (Camera & Photos)',
    path: '/storage/emulated/0/DCIM/Camera',
    safTreeUri: 'content://com.android.externalstorage.documents/tree/primary%3ADCIM%2FCamera',
    isShared: true,
    accessMode: 'readwrite',
    fileCount: 48,
    totalBytes: 5400000000,
    iconType: 'camera'
  },
  {
    id: 'scope-docs',
    name: 'المستندات والتقارير (Vault Documents)',
    path: '/storage/emulated/0/Documents/Vault',
    safTreeUri: 'content://com.android.externalstorage.documents/tree/primary%3ADocuments%2FVault',
    isShared: true,
    accessMode: 'readwrite',
    fileCount: 24,
    totalBytes: 380000000,
    iconType: 'documents'
  },
  {
    id: 'scope-downloads',
    name: 'مجلد التنزيلات (Downloads)',
    path: '/storage/emulated/0/Download',
    safTreeUri: 'content://com.android.externalstorage.documents/tree/primary%3ADownload',
    isShared: true,
    accessMode: 'readonly',
    fileCount: 35,
    totalBytes: 1250000000,
    iconType: 'downloads'
  },
  {
    id: 'scope-recordings',
    name: 'التسجيلات الصوتية (Private Audio Recordings)',
    path: '/storage/emulated/0/Music/Recordings',
    safTreeUri: 'content://com.android.externalstorage.documents/tree/primary%3AMusic%2FRecordings',
    isShared: false, // Explicitly unshared to demonstrate scoped security
    accessMode: 'readonly',
    fileCount: 12,
    totalBytes: 420000000,
    iconType: 'music'
  }
];

export const initialRemoteFiles: RemoteFile[] = [
  {
    id: 'file-1',
    folderId: 'scope-dcim',
    name: 'IMG_20261010_142018_4K.jpg',
    path: '/storage/emulated/0/DCIM/Camera/IMG_20261010_142018_4K.jpg',
    sizeBytes: 8420000,
    mtime: 1791642018000,
    mtimeFormatted: '2026-10-10 14:20',
    mimeType: 'image/jpeg',
    category: 'image',
    checksumSha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    thumbnailUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'file-2',
    folderId: 'scope-dcim',
    name: 'VID_20261009_Site_Inspection.mp4',
    path: '/storage/emulated/0/DCIM/Camera/VID_20261009_Site_Inspection.mp4',
    sizeBytes: 145000000,
    mtime: 1791555618000,
    mtimeFormatted: '2026-10-09 16:30',
    mimeType: 'video/mp4',
    category: 'video',
    checksumSha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    thumbnailUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'file-3',
    folderId: 'scope-dcim',
    name: 'Architecture_Blueprint_Diagram.png',
    path: '/storage/emulated/0/DCIM/Camera/Architecture_Blueprint_Diagram.png',
    sizeBytes: 4200000,
    mtime: 1791621000000,
    mtimeFormatted: '2026-10-10 09:15',
    mimeType: 'image/png',
    category: 'image',
    checksumSha256: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=300&q=80'
  },
  {
    id: 'file-4',
    folderId: 'scope-docs',
    name: 'Clouvea_Security_Protocol_Specification.pdf',
    path: '/storage/emulated/0/Documents/Vault/Clouvea_Security_Protocol_Specification.pdf',
    sizeBytes: 6850000,
    mtime: 1791631000000,
    mtimeFormatted: '2026-10-10 11:45',
    mimeType: 'application/pdf',
    category: 'document',
    checksumSha256: 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3'
  },
  {
    id: 'file-5',
    folderId: 'scope-docs',
    name: 'Quarterly_Financial_Ledger_2026.xlsx',
    path: '/storage/emulated/0/Documents/Vault/Quarterly_Financial_Ledger_2026.xlsx',
    sizeBytes: 1850000,
    mtime: 1791599000000,
    mtimeFormatted: '2026-10-09 18:20',
    mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    category: 'document',
    checksumSha256: '4b227777d4dd1fc61c6f884f48641d02b4d121d3fd328cb08b5531fcacdabf8a'
  },
  {
    id: 'file-6',
    folderId: 'scope-downloads',
    name: 'ClouveaNode_Daemon_v2.4.0.apk',
    path: '/storage/emulated/0/Download/ClouveaNode_Daemon_v2.4.0.apk',
    sizeBytes: 38400000,
    mtime: 1791605000000,
    mtimeFormatted: '2026-10-10 08:10',
    mimeType: 'application/vnd.android.package-archive',
    category: 'archive',
    checksumSha256: 'ef2d127de37b942baad06145e54b0c619a1f22327b2ebbcfbec78f5564afe39d'
  },
  {
    id: 'file-7',
    folderId: 'scope-downloads',
    name: 'Dataset_Sensor_Telemetry_Raw.json',
    path: '/storage/emulated/0/Download/Dataset_Sensor_Telemetry_Raw.json',
    sizeBytes: 1240000,
    mtime: 1791580000000,
    mtimeFormatted: '2026-10-09 13:00',
    mimeType: 'application/json',
    category: 'code',
    checksumSha256: 'b45cffe084dd3d20d928bee85e7b0f21ac64453b7999acb13f12711816738b2b'
  }
];

export const initialTasks: ClouveaTask[] = [
  {
    taskId: 'task-sync-101',
    sourceDeviceId: 'controller-device-1',
    targetDeviceId: 'node-alpha-1',
    type: 'START_BACKUP',
    status: 'completed',
    createdAt: Date.now() - 3600000,
    updatedAt: Date.now() - 3420000,
    progress: 100,
    bytesTransferred: 185000000,
    totalBytes: 185000000,
    transferSpeed: '18.4 MB/s',
    payload: { folderScope: 'scope-dcim', mode: 'differential' },
    result: { backedUpFilesCount: 14, skippedFilesCount: 34, shaVerified: true },
    retryCount: 0
  },
  {
    taskId: 'task-fetch-102',
    sourceDeviceId: 'controller-device-1',
    targetDeviceId: 'node-alpha-1',
    type: 'LIST_FILES',
    status: 'completed',
    createdAt: Date.now() - 900000,
    updatedAt: Date.now() - 898000,
    progress: 100,
    bytesTransferred: 45000,
    totalBytes: 45000,
    transferSpeed: '4.5 MB/s',
    payload: { folderScope: 'scope-docs' },
    result: { fileCount: 24 },
    retryCount: 0
  }
];

export const initialBackupJobs: BackupJob[] = [
  {
    id: 'backup-job-2026-10-10',
    sourceDeviceId: 'node-alpha-1',
    targetDeviceId: 'controller-device-1',
    sourceFolders: ['scope-dcim', 'scope-docs'],
    fileCategories: ['image', 'document', 'video'],
    status: 'completed',
    totalFiles: 72,
    scannedFiles: 72,
    changedFiles: 14,
    skippedFiles: 58,
    transferredFiles: 14,
    totalBytes: 284000000,
    transferredBytes: 284000000,
    progress: 100,
    speed: '22.8 MB/s',
    integrityVerifiedCount: 14,
    startTime: Date.now() - 7200000,
    endTime: Date.now() - 7080000,
    checksumMatched: true,
    destinationPath: '/storage/emulated/0/Clouvea/Backups/Node_Alpha_20261010'
  }
];

export const initialAuditEvents: AuditEvent[] = [
  {
    id: 'audit-1',
    timestamp: '18:04:12',
    sourceDevice: 'controller-device-1',
    targetDevice: 'node-alpha-1',
    action: 'TLS Mutual Handshake Verified',
    status: 'success',
    details: 'Verified certificate fingerprint A8:3F:B2:... with RSA-4096'
  },
  {
    id: 'audit-2',
    timestamp: '17:45:00',
    sourceDevice: 'controller-device-1',
    targetDevice: 'node-alpha-1',
    action: 'START_BACKUP Initiated',
    status: 'success',
    details: 'Differential backup of /DCIM/Camera completed with SHA-256 match'
  },
  {
    id: 'audit-3',
    timestamp: '16:20:10',
    sourceDevice: 'controller-device-1',
    targetDevice: 'node-gamma-3',
    action: 'Connection Probe Timeout',
    status: 'warning',
    details: 'Node Gamma unreachable over Internet Relay. Retrying queued tasks later.'
  }
];
