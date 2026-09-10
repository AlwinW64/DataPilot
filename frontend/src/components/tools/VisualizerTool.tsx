import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  LineChart, 
  ScatterChart, 
  PieChart, 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  Download, 
  RefreshCw,
  Sliders
} from 'lucide-react';
import Plotly from 'plotly.js-dist-min';
import createPlotlyComponent from 'react-plotly.js/factory';
import { ChartRequest, ChartType, DatasetMetadata, DatasetProfile } from '../../types/dataset';
import { api } from '../../services/api';

const Plot = createPlotlyComponent(Plotly);

interface VisualizerToolProps {
  activeDataset: DatasetMetadata | null;
  profile: DatasetProfile | null;
  initialConfig?: Partial<ChartRequest> | null;
}

export const VisualizerTool: React.FC<VisualizerToolProps> = ({
  activeDataset,
  profile,
  initialConfig,
}) => {
  const [chartType, setChartType] = useState<ChartType>('scatter');
  const [xCol, setXCol] = useState<string>('');
  const [yCol, setYCol] = useState<string>('');
  const [colorCol, setColorCol] = useState<string>('');
  const [title, setTitle] = useState<string>('');

  const [figure, setFigure] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-populate defaults when profile loads or when initialConfig changes
  useEffect(() => {
    if (initialConfig) {
      if (initialConfig.chart_type) setChartType(initialConfig.chart_type);
      if (initialConfig.x) setXCol(initialConfig.x);
      if (initialConfig.y !== undefined) setYCol(initialConfig.y || '');
      if (initialConfig.color !== undefined) setColorCol(initialConfig.color || '');
      if (initialConfig.title) setTitle(initialConfig.title);
      return;
    }

    if (profile) {
      const numCols = profile.numeric_columns;
      const catCols = profile.categorical_columns;

      if (numCols.length > 0 && !xCol) {
        setXCol(numCols[0]);
      }
      if (numCols.length > 1 && !yCol) {
        setYCol(numCols[1]);
      } else if (numCols.length === 1 && !yCol) {
        setYCol(numCols[0]);
      }
      if (catCols.length > 0 && !colorCol) {
        setColorCol('');
      }
    }
  }, [profile, initialConfig]);

  const handleGenerate = async () => {
    if (!activeDataset || !xCol) return;

    setIsLoading(true);
    setError(null);

    try {
      const req: ChartRequest = {
        chart_type: chartType,
        x: xCol,
        y: chartType === 'histogram' ? undefined : (yCol || undefined),
        color: colorCol || undefined,
        title: title.trim() || `${chartType.toUpperCase()}: ${xCol}${yCol ? ` vs ${yCol}` : ''}`,
      };

      const res = await api.generateChart(activeDataset.dataset_id, req);
      
      // Enhance layout for dark/light consistency
      const figureData = res.figure;
      if (figureData && figureData.layout) {
        figureData.layout.autosize = true;
        figureData.layout.paper_bgcolor = 'transparent';
        figureData.layout.plot_bgcolor = 'transparent';
        figureData.layout.font = {
          color: '#94a3b8',
          family: 'Inter, sans-serif',
        };
        figureData.layout.margin = { l: 50, r: 30, t: 50, b: 50 };
      }

      setFigure(figureData);
    } catch (err: any) {
      setError(err.message || 'Failed to generate chart figure.');
    } finally {
      setIsLoading(false);
    }
  };

  // Automatically generate when initialConfig is passed from chat
  useEffect(() => {
    if (initialConfig && activeDataset && (initialConfig.x || xCol)) {
      handleGenerate();
    }
  }, [initialConfig]);

  if (!activeDataset || !profile) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3 bg-white dark:bg-slate-900">
        <BarChart3 className="h-10 w-10 text-slate-400 dark:text-slate-600" />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No active dataset</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
          Select or upload a CSV dataset to configure and generate Plotly charts.
        </p>
      </div>
    );
  }

  const chartOptions: { type: ChartType; label: string; icon: React.ReactNode }[] = [
    { type: 'scatter', label: 'Scatter', icon: <ScatterChart className="h-4 w-4" /> },
    { type: 'bar', label: 'Bar', icon: <BarChart3 className="h-4 w-4" /> },
    { type: 'line', label: 'Line', icon: <LineChart className="h-4 w-4" /> },
    { type: 'histogram', label: 'Histogram', icon: <PieChart className="h-4 w-4" /> },
  ];

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
      {/* Visualizer Configuration Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60 space-y-3">
        {/* Chart type pills */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-xl">
            {chartOptions.map((opt) => (
              <button
                key={opt.type}
                onClick={() => setChartType(opt.type)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  chartType === opt.type
                    ? 'bg-white dark:bg-slate-700 text-brand-600 dark:text-brand-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {opt.icon}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !xCol}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-500 hover:bg-brand-600 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white shadow-sm shadow-brand-500/20 transition-all cursor-pointer"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            <span>Generate Chart</span>
          </button>
        </div>

        {/* Dropdowns for Dimensions */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 pt-1">
          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              X Axis (Required)
            </label>
            <select
              value={xCol}
              onChange={(e) => setXCol(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-2 text-slate-800 dark:text-slate-200 font-mono focus:ring-1 focus:ring-brand-500"
            >
              <option value="">Select X column...</option>
              {profile.columns.map((c) => (
                <option key={c} value={c}>
                  {c} {profile.numeric_columns.includes(c) ? '(num)' : '(cat)'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Y Axis {chartType === 'histogram' ? '(Optional)' : '(Required)'}
            </label>
            <select
              value={yCol}
              onChange={(e) => setYCol(e.target.value)}
              disabled={chartType === 'histogram'}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-2 text-slate-800 dark:text-slate-200 font-mono focus:ring-1 focus:ring-brand-500 disabled:opacity-50"
            >
              <option value="">Select Y column...</option>
              {profile.numeric_columns.map((c) => (
                <option key={c} value={c}>
                  {c} (num)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Color Grouping (Optional)
            </label>
            <select
              value={colorCol}
              onChange={(e) => setColorCol(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-2 text-slate-800 dark:text-slate-200 font-mono focus:ring-1 focus:ring-brand-500"
            >
              <option value="">None</option>
              {profile.columns.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Chart Title (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Sales vs Age"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 p-2 text-slate-800 dark:text-slate-200 focus:ring-1 focus:ring-brand-500"
            />
          </div>
        </div>
      </div>

      {/* Main Chart Viewer Area */}
      <div className="flex-1 p-4 overflow-hidden relative flex flex-col items-center justify-center">
        {error && (
          <div className="absolute top-4 left-4 right-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 flex items-start gap-2 z-10">
            <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            <p className="text-xs text-slate-400">Rendering Plotly figure from backend...</p>
          </div>
        ) : figure ? (
          <div className="w-full h-full flex flex-col">
            <div className="flex-1 w-full h-full min-h-[350px]">
              <Plot
                data={figure.data || []}
                layout={{
                  ...figure.layout,
                  autosize: true,
                }}
                useResizeHandler={true}
                className="w-full h-full"
                config={{
                  responsive: true,
                  displayModeBar: true,
                  displaylogo: false,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="text-center space-y-2 max-w-sm">
            <Sliders className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Select columns above and click <span className="font-semibold text-brand-500">Generate Chart</span>
            </p>
            <p className="text-[11px] text-slate-400">
              Interactive Plotly graphics will render with pan, box zoom, and SVG export.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
