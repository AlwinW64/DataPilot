import React, { useState } from 'react';
import { 
  Table, 
  BarChart3, 
  Filter, 
  Cpu, 
  FileText, 
  Plus, 
  Sparkles,
  ArrowRight,
  Calculator,
  CheckCircle,
  Database
} from 'lucide-react';
import { DatasetMetadata, DatasetProfile } from '../../types/dataset';

export interface ToolItem {
  id: string;
  name: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  description: string;
  isBuiltIn: boolean;
}

export const DEFAULT_TOOLS: ToolItem[] = [
  {
    id: 'profile',
    name: 'Dataset Profile',
    shortLabel: 'Profile',
    icon: Table,
    description: 'Explore shape, missing values, duplicates, and column stats.',
    isBuiltIn: true,
  },
  {
    id: 'visualizer',
    name: 'Chart Visualizer',
    shortLabel: 'Visualizer',
    icon: BarChart3,
    badge: 'Plotly',
    description: 'Build interactive scatter, bar, line, and histogram charts.',
    isBuiltIn: true,
  },
  {
    id: 'filter',
    name: 'Filter & Aggregations',
    shortLabel: 'Filter / Group',
    icon: Filter,
    description: 'Slice rows and compute grouped aggregations (mean, sum, min, max).',
    isBuiltIn: true,
  },
  {
    id: 'ml',
    name: 'Machine Learning Insights',
    shortLabel: 'ML Insights',
    icon: Cpu,
    badge: 'AI',
    description: 'Feature correlations, anomaly detection, and target correlation.',
    isBuiltIn: true,
  },
  {
    id: 'reports',
    name: 'Automated Reports',
    shortLabel: 'Report',
    icon: FileText,
    description: 'Generate executive summary reports ready for download.',
    isBuiltIn: true,
  },
];

/* ---------------- Additional Tool Plugin Components ---------------- */

export const FilterTool: React.FC<{ profile: DatasetProfile | null }> = ({ profile }) => {
  const [selectedCol, setSelectedCol] = useState(profile?.columns[0] || '');
  const [operator, setOperator] = useState('>');
  const [filterVal, setFilterVal] = useState('');
  const [groupCol, setGroupCol] = useState('');
  const [aggFunc, setAggFunc] = useState('mean');

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full text-slate-800 dark:text-slate-200">
      <div>
        <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <Filter className="h-4 w-4 text-brand-500" />
          Filter & Aggregate Studio
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Perform in-memory data transformation operations matching the FastAPI analysis service.
        </p>
      </div>

      {/* Filter Section */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Row Filtering</h4>
        <div className="grid grid-cols-3 gap-2">
          <select
            value={selectedCol}
            onChange={(e) => setSelectedCol(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            {profile?.columns.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={operator}
            onChange={(e) => setOperator(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          >
            <option value="==">== (equals)</option>
            <option value="!=">!= (not equal)</option>
            <option value=">">&gt; (greater than)</option>
            <option value="<">&lt; (less than)</option>
            <option value="contains">contains</option>
          </select>

          <input
            type="text"
            placeholder="Filter value..."
            value={filterVal}
            onChange={(e) => setFilterVal(e.target.value)}
            className="text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
          />
        </div>
      </div>

      {/* Grouping & Aggregation Section */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Group By & Aggregate</h4>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Group Dimension (Categorical)</label>
            <select
              value={groupCol}
              onChange={(e) => setGroupCol(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="">Select group column...</option>
              {profile?.categorical_columns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 mb-1">Aggregation Function</label>
            <select
              value={aggFunc}
              onChange={(e) => setAggFunc(e.target.value)}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
            >
              <option value="mean">Mean (Average)</option>
              <option value="sum">Sum (Total)</option>
              <option value="count">Count (Frequency)</option>
              <option value="min">Minimum</option>
              <option value="max">Maximum</option>
              <option value="median">Median</option>
            </select>
          </div>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center space-y-2">
        <Calculator className="h-6 w-6 text-brand-500 mx-auto" />
        <p className="text-xs text-slate-500">
          Filters and aggregations dynamically execute via the DataPilot Python analysis engine.
        </p>
      </div>
    </div>
  );
};

export const MLTool: React.FC<{ profile: DatasetProfile | null }> = ({ profile }) => {
  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full text-slate-800 dark:text-slate-200">
      <div>
        <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
          <Cpu className="h-4 w-4 text-purple-500" />
          Machine Learning Assistant
        </h3>
        <p className="text-xs text-slate-500 mt-1">
          Automated feature screening, correlation discovery, and baseline modeling.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Numeric Candidates</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {profile?.numeric_columns.length || 0} features
          </p>
        </div>
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
          <span className="text-[10px] font-semibold text-slate-400 uppercase">Categorical Encodings</span>
          <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">
            {profile?.categorical_columns.length || 0} features
          </p>
        </div>
      </div>

      <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/40 bg-purple-50/50 dark:bg-purple-950/20 space-y-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 dark:text-purple-300">
          <Sparkles className="h-4 w-4" />
          Recommended Model Tasks
        </div>
        <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1 list-disc list-inside">
          <li>Regression: Predict continuous target variables like <code>{profile?.numeric_columns[0] || 'target'}</code></li>
          <li>Classification: Segment records across categorical groups</li>
          <li>Outlier Detection: Flag anomalies in multi-dimensional feature space</li>
        </ul>
      </div>
    </div>
  );
};

export const ReportTool: React.FC<{ profile: DatasetProfile | null; metadata: DatasetMetadata | null }> = ({ profile, metadata }) => {
  const [copied, setCopied] = useState(false);

  const reportText = `# DataPilot Analytics Executive Report
Dataset: ${metadata?.filename || 'Active Dataset'}
Date: ${new Date().toLocaleDateString()}

## 1. Summary Metrics
- Total Records: ${profile?.shape.rows.toLocaleString()}
- Features Count: ${profile?.shape.columns}
- Duplicate Rows: ${profile?.duplicate_rows}
- Memory: ${profile?.memory_usage}

## 2. Feature Schema
- Numeric Variables: ${profile?.numeric_columns.join(', ')}
- Categorical Variables: ${profile?.categorical_columns.join(', ')}

Generated automatically by DataPilot Copilot.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full text-slate-800 dark:text-slate-200">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <FileText className="h-4 w-4 text-emerald-500" />
            Executive Summary Report
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Consolidated Markdown audit of dataset metrics and schema.
          </p>
        </div>
        <button
          onClick={handleCopy}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-brand-500 hover:bg-brand-600 text-white flex items-center gap-1.5 shadow-sm"
        >
          {copied ? <CheckCircle className="h-3.5 w-3.5" /> : null}
          <span>{copied ? 'Copied!' : 'Copy Markdown'}</span>
        </button>
      </div>

      <pre className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
        {reportText}
      </pre>
    </div>
  );
};
