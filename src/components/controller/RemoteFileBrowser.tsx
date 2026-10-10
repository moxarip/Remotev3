import React, { useState, useMemo } from 'react';
import { useClouvea } from '../../context/ClouveaContext';
import { RemoteFile, ClouveaFolderScope } from '../../types';
import {
  Folder,
  FolderLock,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileCode,
  FileArchive,
  Download,
  Upload,
  Search,
  ArrowUpDown,
  CheckSquare,
  Square,
  ShieldCheck,
  ShieldAlert,
  HardDrive,
  Eye,
  X,
  Sparkles,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import { formatBytes } from '../../utils/crypto';

export const RemoteFileBrowser: React.FC = () => {
  const {
    activeNode,
    folderScopes,
    remoteFiles,
    downloadRemoteFile,
    uploadFileToNode,
    dispatchTask,
    downloadFilesAsZip,
    t,
    language,
    showToast
  } = useClouvea();

  const [selectedFolderId, setSelectedFolderId] = useState<string>('scope-dcim');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date' | 'type'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [previewFile, setPreviewFile] = useState<RemoteFile | null>(null);

  const currentFolder = folderScopes.find(s => s.id === selectedFolderId) || folderScopes[0];

  // Filtering and sorting
  const filesInScope = useMemo(() => {
    return remoteFiles.filter(f => f.folderId === selectedFolderId);
  }, [remoteFiles, selectedFolderId]);

  const filteredAndSortedFiles = useMemo(() => {
    let result = filesInScope.filter(f =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    result.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
      else if (sortBy === 'size') cmp = a.sizeBytes - b.sizeBytes;
      else if (sortBy === 'date') cmp = a.mtime - b.mtime;
      else if (sortBy === 'type') cmp = a.category.localeCompare(b.category);
      return sortOrder === 'asc' ? cmp : -cmp;
    });

    return result;
  }, [filesInScope, searchQuery, sortBy, sortOrder]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (!currentFolder.isShared || currentFolder.accessMode === 'readonly') {
        showToast(language === 'ar' ? 'هذا المجلد للقراءة فقط ولا يسمح بالرفع إليه' : 'This folder is read-only');
        return;
      }
      uploadFileToNode(selectedFolderId, e.target.files[0]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedFileIds.length === filteredAndSortedFiles.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(filteredAndSortedFiles.map(f => f.id));
    }
  };

  const toggleSelectFile = (id: string) => {
    setSelectedFileIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBatchDownload = () => {
    const selectedFiles = filteredAndSortedFiles.filter(f => selectedFileIds.includes(f.id));
    if (selectedFiles.length === 0) return;
    downloadFilesAsZip(selectedFiles);
    setSelectedFileIds([]);
  };

  const getFileCategoryIcon = (category: RemoteFile['category']) => {
    switch (category) {
      case 'image':
        return <FileImage className="w-4 h-4 text-emerald-400" />;
      case 'video':
        return <FileVideo className="w-4 h-4 text-sky-400" />;
      case 'audio':
        return <FileAudio className="w-4 h-4 text-purple-400" />;
      case 'document':
        return <FileText className="w-4 h-4 text-rose-400" />;
      case 'archive':
        return <FileArchive className="w-4 h-4 text-amber-400" />;
      case 'code':
        return <FileCode className="w-4 h-4 text-indigo-400" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Top Scoped Folders Bar (SAF Roots) */}
      <div className="p-4 rounded-2xl bg-[#141a22] border border-slate-700/80 shadow-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-[#3daee9]" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              {t.sharedFolders} (Storage Access Framework Scopes)
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Node: {activeNode.name}
          </span>
        </div>

        {/* Folder Scope Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {folderScopes.map(scope => {
            const isSelected = scope.id === selectedFolderId;
            return (
              <div
                key={scope.id}
                onClick={() => {
                  if (scope.isShared) {
                    setSelectedFolderId(scope.id);
                    setSelectedFileIds([]);
                  } else {
                    showToast(language === 'ar' ? 'هذا المجلد غير مصرح به من قِبل مالك الجهاز المُدار' : 'Scope not authorized on Node');
                  }
                }}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  !scope.isShared
                    ? 'bg-slate-900/50 border-slate-800 opacity-60 cursor-not-allowed'
                    : isSelected
                    ? 'bg-[#1a232f] border-[#3daee9] shadow-md shadow-sky-950/30'
                    : 'bg-[#12171f] border-slate-800 hover:border-slate-700 hover:bg-[#151c26]'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    !scope.isShared ? 'bg-slate-800 text-slate-500' : isSelected ? 'bg-[#3daee9]/20 text-[#3daee9]' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {!scope.isShared ? <FolderLock className="w-4 h-4 text-rose-400" /> : <Folder className="w-4 h-4 text-amber-400" />}
                  </div>
                  <div className="truncate">
                    <h4 className="text-xs font-bold text-white truncate">{scope.name}</h4>
                    <span className="text-[10px] text-slate-400 font-mono block truncate">{scope.path}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    !scope.isShared ? 'bg-rose-950 text-rose-400 border border-rose-800' : scope.accessMode === 'readwrite' ? 'bg-emerald-950 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {!scope.isShared ? 'محظور' : scope.accessMode === 'readwrite' ? 'RW' : 'RO'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main File Explorer Table Card */}
      <div className="p-4 md:p-5 rounded-2xl bg-[#141a22] border border-slate-700/80 shadow-xl space-y-4">
        {/* Search, Sort, and Upload Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-slate-500 absolute top-2.5 right-3" />
            <input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-[#0e1318] border border-slate-700 rounded-xl pr-9 pl-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#3daee9]"
            />
          </div>

          {/* Sort Controls */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-400 hidden sm:inline">{t.sortBy}</span>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="bg-[#0e1318] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="date">{t.sortDate}</option>
              <option value="name">{t.sortName}</option>
              <option value="size">{t.sortSize}</option>
              <option value="type">{t.sortType}</option>
            </select>

            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-1.5 rounded-xl bg-[#0e1318] border border-slate-700 text-slate-300 hover:text-white"
              title="عكس ترتيب الفرز"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Actions: Upload to Node & Batch Download */}
          <div className="flex items-center gap-2">
            {selectedFileIds.length > 0 && (
              <button
                onClick={handleBatchDownload}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs font-bold shadow-md shadow-emerald-500/20 flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>تنزيل المحدد ({selectedFileIds.length})</span>
              </button>
            )}

            <label className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentFolder.accessMode === 'readonly'
                ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500 border-slate-700'
                : 'bg-[#3daee9]/15 hover:bg-[#3daee9]/30 text-[#3daee9] border-[#3daee9]/40 cursor-pointer shadow-sm'
            }`}>
              <Upload className="w-3.5 h-3.5" />
              <span>{t.upload}</span>
              <input
                type="file"
                disabled={currentFolder.accessMode === 'readonly'}
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Batch Select Helper Header */}
        <div className="flex items-center justify-between text-xs text-slate-400 px-2 py-1 bg-slate-900/50 rounded-lg">
          <div className="flex items-center gap-2">
            <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
              {selectedFileIds.length === filteredAndSortedFiles.length && filteredAndSortedFiles.length > 0 ? (
                <CheckSquare className="w-4 h-4 text-[#3daee9]" />
              ) : (
                <Square className="w-4 h-4" />
              )}
            </button>
            <span>{selectedFileIds.length > 0 ? `${selectedFileIds.length} ${t.selectedItems}` : 'تحديد الكل'}</span>
          </div>

          <span className="font-mono text-[11px] text-slate-500">
            {filteredAndSortedFiles.length} ملفات في هذا النطاق
          </span>
        </div>

        {/* Files Grid / High-Density List */}
        <div className="space-y-1.5 overflow-y-auto max-h-[460px] pr-1">
          {filteredAndSortedFiles.map(file => {
            const isSelected = selectedFileIds.includes(file.id);

            return (
              <div
                key={file.id}
                className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 group ${
                  isSelected
                    ? 'bg-[#1b2533] border-[#3daee9]/80 shadow-md'
                    : 'bg-[#10151c] border-slate-800 hover:border-slate-700 hover:bg-[#131922]'
                }`}
              >
                {/* Checkbox and Icon */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <button
                    onClick={() => toggleSelectFile(file.id)}
                    className="text-slate-500 hover:text-white shrink-0"
                  >
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-[#3daee9]" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>

                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                    {getFileCategoryIcon(file.category)}
                  </div>

                  {/* Name and Meta */}
                  <div className="truncate flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white group-hover:text-[#3daee9] transition-colors truncate">
                        {file.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-0.5">
                      <span>{formatBytes(file.sizeBytes)}</span>
                      <span>• {file.mtimeFormatted}</span>
                      <span className="hidden md:inline truncate text-slate-500">
                        SHA-256: {file.checksumSha256.slice(0, 16)}...
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Row Action Buttons */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {file.thumbnailUrl && (
                    <button
                      onClick={() => setPreviewFile(file)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="معاينة الملف"
                    >
                      <Eye className="w-4 h-4 text-sky-400" />
                    </button>
                  )}

                  <button
                    onClick={() => downloadRemoteFile(file)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-[#3daee9] text-slate-300 hover:text-white transition-all shadow-sm active:scale-95"
                    title={t.download}
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {filteredAndSortedFiles.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-xs">
              {t.noFilesFound}
            </div>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg bg-[#141a22] rounded-3xl border border-slate-700 shadow-2xl p-5 text-white space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                {getFileCategoryIcon(previewFile.category)}
                <h4 className="font-bold text-sm truncate max-w-xs">{previewFile.name}</h4>
              </div>
              <button
                onClick={() => setPreviewFile(null)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {previewFile.thumbnailUrl && (
              <div className="w-full h-64 rounded-2xl overflow-hidden bg-slate-900 border border-slate-800">
                <img
                  src={previewFile.thumbnailUrl}
                  alt={previewFile.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-3 rounded-xl bg-slate-900 text-xs font-mono space-y-1 text-slate-300">
              <div>الحجم: {formatBytes(previewFile.sizeBytes)}</div>
              <div>المسار: {previewFile.path}</div>
              <div className="truncate text-emerald-400">SHA-256: {previewFile.checksumSha256}</div>
            </div>

            <button
              onClick={() => {
                downloadRemoteFile(previewFile);
                setPreviewFile(null);
              }}
              className="w-full py-2.5 rounded-xl bg-[#3daee9] hover:bg-[#1d99f3] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg"
            >
              <Download className="w-4 h-4" />
              <span>تنزيل الملف إلى هذا الجهاز</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
