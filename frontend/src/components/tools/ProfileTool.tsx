import React, { useState } from 'react';
import { 
  Table, 
  BarChart2, 
  AlertTriangle, 
  Copy, 
  HardDrive, 
  Check, 
  Search, 
  ListFilter,
  Columns,
  Hash,
  Type
} from 'lucide-react';
import { DatasetProfile } from '../../types/dataset';

interface ProfileToolProps {
  profile: DatasetProfile | null;
  isLoading: boolean;
}

export const ProfileTool: React.FC<ProfileToolProps> = ({ profile, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'preview' | 'stats'>('overview');
  const [searchTerm, setSearchTerm] = useState('');

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 space-y-3">
        <div className="h-8 w-8 rounded-full border-2 border-brand-500 border-t-transparent animate-spin"></div>
        <p className="text-xs text-slate-500 dark:text-slate-400">Loading dataset profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
        <Table className="h-10 w-10 text-slate-400 dark:text-slate-600" />
        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">No profile available</h3>
        <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
          Select or upload a CSV dataset to view its profile, data types, and descriptive statistics.
        </p>
      </div>
    );
  }

  const { shape, numeric_columns, categorical_columns, missing_values, duplicate_rows, describe, memory_usage, preview } = profile;
  const totalMissing = Object.values(missing_values).reduce((a, b) => a + b, 0);

  // Filter preview rows by search term
  const filteredPreview = preview.filter((row) => {
    if (!searchTerm.trim()) return true;
    return Object.values(row).some((val) => 
      String(val ?? '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900 overflow-hidden">
      {/* Sub-tab bar */}
      <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'overview'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Overview & Schema
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'preview'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Data Preview
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-1 rounded-md transition-colors ${
              activeTab === 'stats'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Descriptive Stats
          </button>
        </div>

        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
          Memory: {memory_usage}
        </span>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Table className="h-3.5 w-3.5 text-brand-500" />
                  Total Rows
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {shape.rows.toLocaleString()}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Columns className="h-3.5 w-3.5 text-sky-500" />
                  Columns
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {shape.columns}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <Copy className="h-3.5 w-3.5 text-amber-500" />
                  Duplicates
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {duplicate_rows}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-500" />
                  Missing Cells
                </div>
                <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {totalMissing}
                </div>
              </div>
            </div>

            {/* Column Schema & Missing Values */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                <ListFilter className="h-3.5 w-3.5" />
                Column Schema & Quality ({profile.columns.length} columns)
              </h4>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                      <th className="p-3">Column Name</th>
                      <th className="p-3">Data Type</th>
                      <th className="p-3">Missing Values</th>
                      <th className="p-3">Completeness</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {profile.columns.map((col) => {
                      const isNum = numeric_columns.includes(col);
                      const missingCount = missing_values[col] || 0;
                      const completeness = Math.max(0, 100 - (missingCount / (shape.rows || 1)) * 100);

                      return (
                        <tr key={col} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                          <td className="p-3 font-mono font-medium text-slate-900 dark:text-slate-100">
                            {col}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold ${
                                isNum
                                  ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900'
                                  : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900'
                              }`}
                            >
                              {isNum ? <Hash className="h-2.5 w-2.5" /> : <Type className="h-2.5 w-2.5" />}
                              {isNum ? 'Numeric' : 'Categorical'}
                            </span>
                          </td>
                          <td className="p-3">
                            {missingCount > 0 ? (
                              <span className="text-amber-600 dark:text-amber-400 font-medium">
                                {missingCount} ({((missingCount / shape.rows) * 100).toFixed(1)}%)
                              </span>
                            ) : (
                              <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <Check className="h-3 w-3" /> 0 missing
                              </span>
                            )}
                          </td>
                          <td className="p-3">
                            <div className="flex items-center gap-2">
                              <div className="w-20 bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-brand-500 rounded-full"
                                  style={{ width: `${completeness}%` }}
                                />
                              </div>
                              <span className="text-[11px] text-slate-500 font-mono">
                                {completeness.toFixed(0)}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Data Preview Tab */}
        {activeTab === 'preview' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search preview rows..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
              </div>
              <span className="text-xs text-slate-400">
                Showing top {filteredPreview.length} rows
              </span>
            </div>

            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                    <th className="p-2.5 w-12 text-center text-slate-400 font-mono">#</th>
                    {profile.columns.map((col) => (
                      <th key={col} className="p-2.5 font-mono">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {filteredPreview.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="p-2.5 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>
                      {profile.columns.map((col) => (
                        <td key={col} className="p-2.5 text-slate-700 dark:text-slate-300 font-mono text-[11px] whitespace-nowrap">
                          {row[col] !== null && row[col] !== undefined ? String(row[col]) : (
                            <span className="text-slate-400 italic">null</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Descriptive Statistics Tab */}
        {activeTab === 'stats' && (
          <div className="space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-2">
              <BarChart2 className="h-3.5 w-3.5" />
              Descriptive Statistics (Numeric Columns)
            </h4>

            {Object.keys(describe).length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 border border-dashed rounded-xl">
                No numeric columns available to compute descriptive statistics.
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
                      <th className="p-2.5 font-mono">Metric</th>
                      {Object.keys(describe).map((col) => (
                        <th key={col} className="p-2.5 font-mono">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px]">
                    {['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max'].map((stat) => (
                      <tr key={stat} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="p-2.5 font-semibold text-slate-500 uppercase">{stat}</td>
                        {Object.keys(describe).map((col) => {
                          const val = describe[col]?.[stat];
                          return (
                            <td key={col} className="p-2.5 text-slate-700 dark:text-slate-300">
                              {typeof val === 'number'
                                ? stat === 'count' ? val.toLocaleString() : val.toFixed(2)
                                : '—'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
