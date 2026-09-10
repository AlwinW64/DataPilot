import React, { useState } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Plus, 
  Layers, 
  ExternalLink,
  ChevronRight,
  Info
} from 'lucide-react';
import { DatasetMetadata, DatasetProfile, ChartRequest } from '../../types/dataset';
import { ProfileTool } from './ProfileTool';
import { VisualizerTool } from './VisualizerTool';
import { DEFAULT_TOOLS, FilterTool, MLTool, ReportTool, ToolItem } from './ToolRegistry';

interface ToolDockProps {
  activeDataset: DatasetMetadata | null;
  profile: DatasetProfile | null;
  isLoadingProfile: boolean;
  activeToolId: string;
  onSelectTool: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  visualizerConfig?: Partial<ChartRequest> | null;
}

export const ToolDock: React.FC<ToolDockProps> = ({
  activeDataset,
  profile,
  isLoadingProfile,
  activeToolId,
  onSelectTool,
  isOpen,
  onClose,
  isFullscreen,
  onToggleFullscreen,
  visualizerConfig,
}) => {
  const [toolsList, setToolsList] = useState<ToolItem[]>(DEFAULT_TOOLS);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newToolName, setNewToolName] = useState('');
  const [newToolDesc, setNewToolDesc] = useState('');

  if (!isOpen) return null;

  const handleAddCustomTool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newToolName.trim()) return;

    const newId = `custom_${Date.now()}`;
    const newTool: ToolItem = {
      id: newId,
      name: newToolName.trim(),
      shortLabel: newToolName.trim().slice(0, 10),
      icon: Layers,
      badge: 'Custom',
      description: newToolDesc.trim() || 'Custom user extension tool',
      isBuiltIn: false,
    };

    setToolsList([...toolsList, newTool]);
    onSelectTool(newId);
    setIsAddModalOpen(false);
    setNewToolName('');
    setNewToolDesc('');
  };

  const activeTool = toolsList.find((t) => t.id === activeToolId) || toolsList[0];

  return (
    <aside
      className={`border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col transition-all duration-300 z-10 ${
        isFullscreen ? 'fixed inset-0 z-50 w-screen h-screen' : 'w-full md:w-[580px] lg:w-[680px] xl:w-[740px]'
      }`}
    >
      {/* Top Dock Header & Tool Ribbon */}
      <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-md px-3 flex items-center justify-between gap-2 flex-shrink-0">
        {/* Ribbon of Tool Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {toolsList.map((tool) => {
            const Icon = tool.icon;
            const isActive = activeTool.id === tool.id;

            return (
              <button
                key={tool.id}
                onClick={() => onSelectTool(tool.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-500 text-white shadow-sm shadow-brand-500/20'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
                title={tool.description}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tool.shortLabel}</span>
                {tool.badge && (
                  <span
                    className={`text-[9px] px-1 py-0.2 rounded font-semibold uppercase ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {tool.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* "+ Add Tool" Slot */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
            title="Register new tool"
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Add Tool</span>
          </button>
        </div>

        {/* Header Action Controls */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onToggleFullscreen}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
            title="Close Tool Dock"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Tool Content Pane */}
      <div className="flex-1 overflow-hidden relative">
        {activeTool.id === 'profile' && (
          <ProfileTool profile={profile} isLoading={isLoadingProfile} />
        )}

        {activeTool.id === 'visualizer' && (
          <VisualizerTool
            activeDataset={activeDataset}
            profile={profile}
            initialConfig={visualizerConfig}
          />
        )}

        {activeTool.id === 'filter' && (
          <FilterTool profile={profile} />
        )}

        {activeTool.id === 'ml' && (
          <MLTool profile={profile} />
        )}

        {activeTool.id === 'reports' && (
          <ReportTool profile={profile} metadata={activeDataset} />
        )}

        {!activeTool.isBuiltIn && (
          <div className="p-8 h-full flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-brand-500/10 text-brand-500 flex items-center justify-center">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {activeTool.name}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              {activeTool.description}
            </p>
            <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-xs text-slate-400 max-w-md">
              Custom plugin module loaded into DataPilot Tool Registry. Ready to receive dataset context: <code>{activeDataset?.filename}</code>.
            </div>
          </div>
        )}
      </div>

      {/* Add Custom Tool Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-brand-500" />
                Register New Tool Extension
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Extend DataPilot by adding new analytical workspace plugins into the tool dock.
            </p>

            <form onSubmit={handleAddCustomTool} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tool Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Geolocation Map, SQL Query Editor"
                  value={newToolName}
                  onChange={(e) => setNewToolName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the tool capabilities..."
                  value={newToolDesc}
                  onChange={(e) => setNewToolDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white shadow-sm"
                >
                  Add to Dock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
