import React from 'react';
import { 
  Sparkles, 
  PanelRightClose, 
  PanelRightOpen, 
  Maximize2, 
  Minimize2, 
  Sun, 
  Moon, 
  Database,
  Layers
} from 'lucide-react';
import { DatasetMetadata } from '../../types/dataset';

interface HeaderProps {
  activeDataset: DatasetMetadata | null;
  isDockOpen: boolean;
  onToggleDock: () => void;
  isDockFullscreen: boolean;
  onToggleFullscreenDock: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeDataset,
  isDockOpen,
  onToggleDock,
  isDockFullscreen,
  onToggleFullscreenDock,
  isDarkMode,
  onToggleTheme,
}) => {
  return (
    <header className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 flex items-center justify-between z-20 flex-shrink-0">
      {/* Brand logo & title */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center shadow-lg shadow-brand-500/20 text-white font-bold text-lg">
          <Layers className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white">
            Data<span className="text-brand-500">Pilot</span>
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-brand-50 text-brand-600 dark:bg-brand-950/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Copilot
          </span>
        </div>
      </div>

      {/* Center: Active Dataset Indicator Pill */}
      <div className="hidden md:flex items-center">
        {activeDataset ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 shadow-sm">
            <Database className="h-3.5 w-3.5 text-brand-500" />
            <span className="font-semibold max-w-[200px] truncate">{activeDataset.filename}</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-slate-500 dark:text-slate-400">
              {activeDataset.row_count.toLocaleString()} rows × {activeDataset.column_count} cols
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse"></span>
            No dataset selected — upload or select from sidebar
          </div>
        )}
      </div>

      {/* Right Action buttons */}
      <div className="flex items-center gap-2">
        {/* Dock Controls */}
        <button
          onClick={onToggleDock}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            isDockOpen
              ? 'bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/30'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
          title={isDockOpen ? 'Close Tool Dock' : 'Open Tool Dock'}
        >
          {isDockOpen ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
          <span className="hidden sm:inline">{isDockOpen ? 'Hide Tools' : 'Show Tools'}</span>
        </button>

        {isDockOpen && (
          <button
            onClick={onToggleFullscreenDock}
            className={`p-2 rounded-lg text-xs transition-colors ${
              isDockFullscreen
                ? 'bg-brand-500 text-white'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title={isDockFullscreen ? 'Exit Fullscreen' : 'Expand Tool Dock to Fullscreen'}
          >
            {isDockFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        )}

        <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1"></div>

        {/* Dark / Light Toggle */}
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>
      </div>
    </header>
  );
};
