import React, { useState, useRef } from 'react';
import { 
  Upload, 
  FileSpreadsheet, 
  Trash2, 
  CheckCircle2, 
  Plus, 
  PanelLeftClose, 
  PanelLeftOpen, 
  Loader2,
  AlertCircle,
  Database,
  Radio
} from 'lucide-react';
import { DatasetMetadata } from '../../types/dataset';
import { api } from '../../services/api';

interface SidebarProps {
  datasets: DatasetMetadata[];
  activeDataset: DatasetMetadata | null;
  onSelectDataset: (dataset: DatasetMetadata) => void;
  onDatasetUploaded: (dataset: DatasetMetadata) => void;
  onDeleteDataset: (datasetId: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  datasets,
  activeDataset,
  onSelectDataset,
  onDatasetUploaded,
  onDeleteDataset,
  onNewChat,
  isOpen,
  onToggleOpen,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadError('Only .csv files are supported.');
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const metadata = await api.uploadDataset(file);
      onDatasetUploaded(metadata);
      onSelectDataset(metadata);
    } catch (err: any) {
      setUploadError(err.message || 'Failed to upload CSV dataset.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <aside
      className={`h-full border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/95 flex flex-col transition-all duration-300 z-10 flex-shrink-0 ${
        isOpen ? 'w-72 sm:w-80' : 'w-14'
      }`}
    >
      {/* Sidebar Header & Toggle */}
      <div className="h-14 px-3 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        {isOpen && (
          <button
            onClick={onNewChat}
            className="flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-sm transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>New Analysis</span>
          </button>
        )}
        <button
          onClick={onToggleOpen}
          className={`p-2 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors ${
            !isOpen ? 'mx-auto' : 'ml-2'
          }`}
          title={isOpen ? 'Collapse Sidebar' : 'Expand Sidebar'}
        >
          {isOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        </button>
      </div>

      {isOpen ? (
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Upload Dropzone */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Upload Dataset
              </span>
            </div>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-950/30'
                  : 'border-slate-300 dark:border-slate-700 hover:border-brand-400 dark:hover:border-brand-500/50 bg-white dark:bg-slate-800/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              {isUploading ? (
                <div className="flex flex-col items-center gap-2 py-2">
                  <Loader2 className="h-6 w-6 text-brand-500 animate-spin" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                    Profiling dataset...
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1.5 py-1">
                  <div className="h-8 w-8 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-500 flex items-center justify-center">
                    <Upload className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200">
                    Click or drag CSV here
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">
                    Auto-profiles schema & metrics
                  </span>
                </div>
              )}
            </div>

            {uploadError && (
              <div className="mt-2 p-2 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-xs text-red-600 dark:text-red-300 flex items-start gap-1.5">
                <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span className="flex-1">{uploadError}</span>
              </div>
            )}
          </div>

          {/* Uploaded Datasets List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Database className="h-3.5 w-3.5" />
                Datasets ({datasets.length})
              </span>
            </div>

            {datasets.length === 0 ? (
              <div className="text-center py-6 px-2 rounded-lg border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 dark:text-slate-500 text-xs">
                No datasets yet. Upload a CSV to start exploring.
              </div>
            ) : (
              <div className="space-y-1.5">
                {datasets.map((ds) => {
                  const isActive = activeDataset?.dataset_id === ds.dataset_id;
                  return (
                    <div
                      key={ds.dataset_id}
                      onClick={() => onSelectDataset(ds)}
                      className={`group relative p-2.5 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-2 ${
                        isActive
                          ? 'bg-brand-50/80 dark:bg-brand-950/40 border-brand-300 dark:border-brand-700/80 shadow-sm'
                          : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <FileSpreadsheet
                          className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                            isActive ? 'text-brand-500' : 'text-slate-400 dark:text-slate-500'
                          }`}
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400">
                            {ds.filename}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                            {ds.row_count.toLocaleString()} rows • {ds.column_count} cols
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {isActive && (
                          <CheckCircle2 className="h-4 w-4 text-brand-500 flex-shrink-0" />
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteDataset(ds.dataset_id);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-400 hover:text-red-500 transition-opacity"
                          title="Remove dataset"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Collapsed Sidebar icon view */
        <div className="flex-1 flex flex-col items-center py-4 space-y-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-lg text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
            title="Upload CSV"
          >
            <Upload className="h-5 w-5" />
          </button>
          <div className="h-[1px] w-6 bg-slate-200 dark:bg-slate-800"></div>
          {datasets.map((ds) => {
            const isActive = activeDataset?.dataset_id === ds.dataset_id;
            return (
              <button
                key={ds.dataset_id}
                onClick={() => onSelectDataset(ds)}
                className={`p-2 rounded-lg relative transition-colors ${
                  isActive
                    ? 'bg-brand-500 text-white'
                    : 'text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-200'
                }`}
                title={`${ds.filename} (${ds.row_count} rows)`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                {isActive && (
                  <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-slate-900" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Footer Backend Connection Status */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-400 dark:text-slate-500 flex items-center justify-between">
        {isOpen && (
          <>
            <div className="flex items-center gap-1.5">
              <Radio className="h-3 w-3 text-emerald-500 animate-pulse" />
              <span>FastAPI Backend</span>
            </div>
            <span className="text-[10px] bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded font-mono">
              :8000
            </span>
          </>
        )}
      </div>
    </aside>
  );
};
