export type DeviceType = 'phone' | 'laptop' | 'desktop' | 'tablet' | 'tv';

export type ClouveaRole = 'controller' | 'node';
export type ClouveaConnectionMode = 'hybrid' | 'local_lan' | 'internet_relay';
export type ConnectionMode = 'phone-to-phone' | 'phone-to-pc';

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  isPaired: boolean;
  isTrusted: boolean;
  batteryLevel: number;
  isCharging: boolean;
  ip: string;
  port: number;
  os: string;
  lastSeen: string;
  certificateFingerprint: string;
  signalStrength: number;
  networkType: 'Wi-Fi 6' | 'Wi-Fi 5' | '5G' | '4G' | 'LAN';
}

export type PluginId =
  | 'battery'
  | 'clipboard'
  | 'mousepad'
  | 'mpris'
  | 'notifications'
  | 'share'
  | 'sftp'
  | 'findmyphone'
  | 'runcommand'
  | 'presenter'
  | 'digitizer'
  | 'sms'
  | 'telephony'
  | 'connectivityreport'
  | 'p2pchat'
  | 'flashlight';

export interface PluginConfig {
  id: PluginId;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  iconName: string;
  isEnabled: boolean;
  category: 'input' | 'multimedia' | 'connectivity' | 'filesystem' | 'system';
}

export interface NotificationItem {
  id: string;
  appName: string;
  title: string;
  body: string;
  timestamp: string;
  iconType: 'whatsapp' | 'slack' | 'sms' | 'call' | 'email' | 'system' | 'music';
  hasReplyAction?: boolean;
  actions?: string[];
}

export interface SmsMessage {
  id: string;
  sender: 'me' | 'contact';
  text: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface SmsThread {
  id: string;
  contactName: string;
  phoneNumber: string;
  avatar: string;
  unreadCount: number;
  messages: SmsMessage[];
}

export interface MediaTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: number;
  position: number;
  isPlaying: boolean;
  albumArt: string;
  volume: number;
  isMuted: boolean;
  shuffle: boolean;
  repeatMode: 'none' | 'track' | 'playlist';
}

export interface CommandItem {
  id: string;
  name: string;
  nameAr: string;
  command: string;
  icon: string;
  category: 'system' | 'media' | 'utility';
}

export interface SharedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  dataUrl?: string;
  timestamp: string;
  direction: 'sent' | 'received';
  progress: number;
  status: 'completed' | 'transferring' | 'failed';
  senderPhone?: string;
  receiverPhone?: string;
}

export interface SftpFileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: number;
  extension?: string;
  modified: string;
  path: string;
}

export interface VirtualCursorState {
  x: number;
  y: number;
  isClicking: boolean;
  clickType?: 'left' | 'right' | 'middle';
  isDragging: boolean;
  laserPointerActive: boolean;
  laserX?: number;
  laserY?: number;
  terminalLogs: string[];
  activeWindow: 'desktop' | 'media' | 'terminal' | 'canvas' | 'slides' | 'files';
}

export interface DirectChatMessage {
  id: string;
  from: 'phone1' | 'phone2';
  text: string;
  timestamp: string;
  fileAttachment?: {
    name: string;
    size: number;
    dataUrl?: string;
  };
}

export interface PhoneDeviceState {
  id: string;
  name: string;
  model: string;
  ip: string;
  batteryLevel: number;
  isCharging: boolean;
  signalStrength: number;
  networkType: 'Wi-Fi 6' | 'Wi-Fi 5' | '5G' | '4G';
  isFlashlightOn: boolean;
  isRinging: boolean;
  clipboard: string;
  media: MediaTrack;
}

// Clouvea Models
export interface ClouveaDevice {
  id: string;
  name: string;
  role: ClouveaRole;
  model: string;
  status: 'online' | 'offline' | 'busy';
  connectionType: 'local_wifi' | 'internet_relay' | 'hotspot';
  ip: string;
  port: number;
  batteryLevel: number;
  isCharging: boolean;
  storageTotalBytes: number;
  storageUsedBytes: number;
  storageFreeBytes: number;
  certificateFingerprint: string;
  lastSeen: string;
  latencyMs: number;
  isTrusted: boolean;
  activeTasksCount: number;
}

export interface ClouveaFolderScope {
  id: string;
  name: string;
  path: string;
  safTreeUri: string;
  isShared: boolean;
  accessMode: 'readonly' | 'readwrite';
  fileCount: number;
  totalBytes: number;
  iconType: 'camera' | 'documents' | 'downloads' | 'music' | 'custom';
}

export interface RemoteFile {
  id: string;
  folderId: string;
  name: string;
  path: string;
  sizeBytes: number;
  mtime: number;
  mtimeFormatted: string;
  mimeType: string;
  category: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'code' | 'other';
  checksumSha256: string;
  thumbnailUrl?: string;
  dataUrl?: string;
}

export type ClouveaTaskType =
  | 'LIST_FILES'
  | 'SEARCH_FILES'
  | 'DOWNLOAD_FILE'
  | 'UPLOAD_FILE'
  | 'START_BACKUP'
  | 'GET_DEVICE_STATUS'
  | 'SYNC_FOLDER'
  | 'CANCEL_TASK';

export type ClouveaTaskStatus =
  | 'pending'
  | 'executing'
  | 'completed'
  | 'failed'
  | 'cancelled';

export interface ClouveaTask {
  taskId: string;
  sourceDeviceId: string;
  targetDeviceId: string;
  type: ClouveaTaskType;
  status: ClouveaTaskStatus;
  createdAt: number;
  updatedAt: number;
  progress: number;
  bytesTransferred: number;
  totalBytes: number;
  transferSpeed: string;
  payload: Record<string, any>;
  result?: Record<string, any>;
  errorReason?: string;
  retryCount: number;
}

export interface BackupJob {
  id: string;
  sourceDeviceId: string;
  targetDeviceId: string;
  sourceFolders: string[];
  fileCategories: string[];
  status: 'idle' | 'scanning' | 'transferring' | 'verifying' | 'completed' | 'failed';
  totalFiles: number;
  scannedFiles: number;
  changedFiles: number;
  skippedFiles: number;
  transferredFiles: number;
  totalBytes: number;
  transferredBytes: number;
  progress: number;
  speed: string;
  integrityVerifiedCount: number;
  startTime: number;
  endTime?: number;
  checksumMatched: boolean;
  destinationPath: string;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  sourceDevice: string;
  targetDevice: string;
  action: string;
  status: 'success' | 'warning' | 'error';
  details: string;
}

export interface PairingRequest {
  code: string;
  controller: {
    id: string;
    name: string;
    model: string;
    ip?: string;
  };
}

