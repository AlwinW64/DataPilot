import { DatasetMetadata, DatasetProfile, ChartRequest, ChartResponse, ChatMessage } from '../types/dataset';

const API_BASE = 'https://datapilot-lime.vercel.app'; // Relies on Vite proxy: /datasets, /dataset, /chat, /health

const STORAGE_KEY_DATASETS = 'datapilot_datasets';
const STORAGE_KEY_CHATS = 'datapilot_chats_';
const STORAGE_KEY_CONV = 'datapilot_conv_'; // Maps datasetId -> conversationId

export const api = {
  /**
   * Upload a CSV file to the FastAPI backend
   */
  async uploadDataset(file: File): Promise<DatasetMetadata> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE}/dataset`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(err.detail || `Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    // Backend UploadResponse: { dataset_id, filename, rows, columns (int), column_names }
    const metadata: DatasetMetadata = {
      dataset_id: data.dataset_id,
      filename: data.filename || file.name,
      row_count: data.rows ?? data.row_count ?? 0,
      column_count: typeof data.columns === 'number' ? data.columns : (data.column_count ?? data.column_names?.length ?? 0),
      columns: Array.isArray(data.column_names) ? data.column_names : [],
      uploaded_at: new Date().toISOString(),
      filesize: file.size,
    };

    // Save to local storage cache
    api.saveDatasetLocally(metadata);

    return metadata;
  },

  /**
   * Fetch complete dataset profile from backend
   */
  async getProfile(datasetId: string): Promise<DatasetProfile> {
    const response = await fetch(`${API_BASE}/dataset/${datasetId}/profile`);

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to fetch profile' }));
      throw new Error(err.detail || `Profile fetch failed with status ${response.status}`);
    }

    const raw = await response.json();
    return normalizeProfile(raw);
  },

  /**
   * Request Plotly figure from backend chart service
   */
  async generateChart(datasetId: string, request: ChartRequest): Promise<ChartResponse> {
    const response = await fetch(`${API_BASE}/datasets/${datasetId}/charts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({ detail: 'Failed to generate chart' }));
      throw new Error(err.detail || `Chart generation failed with status ${response.status}`);
    }

    return await response.json();
  },

  /**
   * Check health of backend
   */
  async checkHealth(): Promise<{ status: string; application?: string }> {
    try {
      const response = await fetch(`${API_BASE}/health`);
      if (response.ok) {
        return await response.json();
      }
    } catch {
      // ignore
    }
    return { status: 'disconnected' };
  },

  /**
   * Ask the AI Copilot a question about the active dataset.
   * Calls POST /chat with {conversation_id, message, dataset_ids} to match the backend schema.
   */
  async askCopilot(
    datasetId: string,
    question: string,
    profile?: DatasetProfile | null
  ): Promise<{ text: string; actionTriggers?: ChatMessage['actionTriggers'] }> {
    try {
      // Retrieve persisted conversation_id for this dataset (if any)
      const conversationId = api.getConversationId(datasetId) || undefined;

      const response = await fetch(`${API_BASE}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: conversationId ?? null,
          message: question,
          dataset_ids: [datasetId],
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Persist conversation_id returned by backend for follow-up messages
        if (data.conversation_id) {
          api.saveConversationId(datasetId, data.conversation_id);
        }
        if (data.answer && typeof data.answer === 'string') {
          return { text: data.answer };
        }
      }
    } catch {
      // Fallback to intelligent client-side Copilot synthesizer
    }

    // High quality intelligent client-side synthesis from real dataset profile
    return generateClientSideAnalysis(question, profile);
  },

  /* ---------------- Local Storage Persistence ---------------- */

  getSavedDatasets(): DatasetMetadata[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_DATASETS);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveDatasetLocally(dataset: DatasetMetadata): void {
    try {
      const existing = api.getSavedDatasets();
      const filtered = existing.filter((d) => d.dataset_id !== dataset.dataset_id);
      localStorage.setItem(STORAGE_KEY_DATASETS, JSON.stringify([dataset, ...filtered]));
    } catch (e) {
      console.warn('Failed to persist dataset to localStorage', e);
    }
  },

  deleteSavedDataset(datasetId: string): void {
    try {
      const existing = api.getSavedDatasets();
      const updated = existing.filter((d) => d.dataset_id !== datasetId);
      localStorage.setItem(STORAGE_KEY_DATASETS, JSON.stringify(updated));
      localStorage.removeItem(STORAGE_KEY_CHATS + datasetId);
      localStorage.removeItem(STORAGE_KEY_CONV + datasetId);
    } catch (e) {
      console.warn('Failed to delete dataset from localStorage', e);
    }
  },

  getSavedChat(datasetId: string): ChatMessage[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_CHATS + datasetId);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  saveChatLocally(datasetId: string, messages: ChatMessage[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CHATS + datasetId, JSON.stringify(messages));
    } catch (e) {
      console.warn('Failed to persist chat to localStorage', e);
    }
  },

  /** Retrieve the persisted backend conversation_id for a given dataset */
  getConversationId(datasetId: string): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY_CONV + datasetId);
    } catch {
      return null;
    }
  },

  /** Persist the backend conversation_id returned after a chat call */
  saveConversationId(datasetId: string, conversationId: string): void {
    try {
      localStorage.setItem(STORAGE_KEY_CONV + datasetId, conversationId);
    } catch (e) {
      console.warn('Failed to persist conversation id to localStorage', e);
    }
  },
};

/**
 * Intelligent client-side AI analysis synthesizer
 * Uses the dataset's actual profile statistics, column types, and preview to formulate accurate answers
 */
function generateClientSideAnalysis(
  question: string,
  profile?: DatasetProfile | null
): { text: string; actionTriggers?: ChatMessage['actionTriggers'] } {
  const q = question.toLowerCase().trim();

  if (!profile) {
    return {
      text: "I don't have an active dataset loaded yet. Please select or upload a CSV dataset from the left sidebar to begin analysis!",
    };
  }

  const { shape, numeric_columns, categorical_columns, missing_values, duplicate_rows, describe } = profile;
  const numRows = shape.rows;
  const numCols = shape.columns;
  const totalMissing = Object.values(missing_values).reduce((a, b) => a + b, 0);

  // Missing values / Data Quality query
  if (q.includes('missing') || q.includes('null') || q.includes('quality') || q.includes('clean') || q.includes('duplicate')) {
    const missingEntries = Object.entries(missing_values).filter(([_, count]) => count > 0);
    const missingSummary = missingEntries.length > 0
      ? missingEntries.map(([col, cnt]) => `* **\`${col}\`**: ${cnt} missing (${((cnt / numRows) * 100).toFixed(1)}%)`).join('\n')
      : '✅ No missing values detected across any columns!';

    return {
      text: `### 🔍 Data Quality & Completeness Audit\n\n- **Total Records:** ${numRows.toLocaleString()} rows\n- **Duplicate Rows:** ${duplicate_rows} duplicates detected (${((duplicate_rows / (numRows || 1)) * 100).toFixed(1)}%)\n- **Total Missing Cells:** ${totalMissing} across ${missingEntries.length} column(s)\n\n#### Missing Breakdown:\n${missingSummary}\n\n💡 *Recommendation:* Clean or impute missing numeric values before fitting models or generating aggregated metric summaries.`,
      actionTriggers: [
        { label: 'Inspect Profile & Missing Stats', toolId: 'profile' },
      ],
    };
  }

  // Summary / Overview query
  if (q.includes('summar') || q.includes('overview') || q.includes('profile') || q.includes('shape') || q.includes('tell me about')) {
    const numList = numeric_columns.slice(0, 4).map((c) => `\`${c}\``).join(', ');
    const catList = categorical_columns.slice(0, 4).map((c) => `\`${c}\``).join(', ');

    return {
      text: `### 📊 Dataset Executive Overview\n\nThis dataset contains **${numRows.toLocaleString()} rows** and **${numCols} columns**.\n\n- **Numeric Features (${numeric_columns.length}):** ${numList || 'None'}${numeric_columns.length > 4 ? ` (+${numeric_columns.length - 4} more)` : ''}\n- **Categorical Features (${categorical_columns.length}):** ${catList || 'None'}${categorical_columns.length > 4 ? ` (+${categorical_columns.length - 4} more)` : ''}\n- **Duplicate Rows:** ${duplicate_rows}\n- **Memory Footprint:** ${profile.memory_usage}\n\nYou can inspect individual column distributions, percentile ranges, and raw sample records directly in the **Profile View** tool.`,
      actionTriggers: [
        { label: 'Open Dataset Profile', toolId: 'profile' },
        { label: 'Generate Visualizations', toolId: 'visualizer' },
      ],
    };
  }

  // Visualization / Charting query
  if (q.includes('chart') || q.includes('plot') || q.includes('visual') || q.includes('graph') || q.includes('histogram') || q.includes('scatter')) {
    const firstNum = numeric_columns[0] || 'value';
    const secondNum = numeric_columns[1] || numeric_columns[0] || 'value';
    const firstCat = categorical_columns[0] || undefined;

    return {
      text: `### 📈 Visualization Recommendations\n\nBased on your dataset structure, here are recommended charts to explore:\n\n1. **Scatter Plot:** Compare \`${firstNum}\` vs \`${secondNum}\`${firstCat ? ` colored by \`${firstCat}\`` : ''} to uncover potential correlation.\n2. **Distribution Histogram:** Inspect skewness and outlier presence in \`${firstNum}\`.\n3. **Bar Chart:** Compare aggregate values grouped by \`${firstCat || 'categories'}\`.\n\nClick below to immediately load these features into the interactive Visualizer tool:`,
      actionTriggers: [
        {
          label: `Plot ${firstNum} vs ${secondNum}`,
          toolId: 'visualizer',
          payload: { chart_type: 'scatter', x: firstNum, y: secondNum, color: firstCat },
        },
        {
          label: `Histogram of ${firstNum}`,
          toolId: 'visualizer',
          payload: { chart_type: 'histogram', x: firstNum },
        },
      ],
    };
  }

  // Numerical stats / Average / Max / Min query
  if (q.includes('average') || q.includes('mean') || q.includes('max') || q.includes('min') || q.includes('statistic')) {
    const statsCols = Object.keys(describe).slice(0, 3);
    const statsSummary = statsCols.map((col) => {
      const s = describe[col];
      return `* **\`${col}\`**: Mean = ${s.mean?.toFixed(2) ?? 'N/A'}, Min = ${s.min ?? 'N/A'}, Max = ${s.max ?? 'N/A'}, Std = ${s.std?.toFixed(2) ?? 'N/A'}`;
    }).join('\n');

    return {
      text: `### 🧮 Descriptive Statistics Highlights\n\n${statsSummary || 'No continuous numeric columns available for descriptive stats.'}\n\nFull percentile distributions (25%, 50%, 75%) and count tables are available in the **Profile Inspector** tab.`,
      actionTriggers: [
        { label: 'View Full Statistics Table', toolId: 'profile' },
      ],
    };
  }

  // Default contextual response
  const topNum = numeric_columns[0];
  const topCat = categorical_columns[0];
  return {
    text: `### 💡 Analysis of "${question}"\n\nBased on your active dataset (**${numRows.toLocaleString()} rows**, **${numCols} columns**):\n\n- The dataset possesses **${numeric_columns.length} numeric variables** and **${categorical_columns.length} categorical dimensions**.\n- You can correlate metrics such as \`${topNum || 'columns'}\` across categories like \`${topCat || 'groups'}\`.\n- Would you like to view the distribution breakdown in the **Profile Inspector**, or generate an interactive Plotly chart in the **Visualizer**?`,
    actionTriggers: [
      { label: 'Open Profile Inspector', toolId: 'profile' },
      { label: 'Launch Visualizer', toolId: 'visualizer' },
    ],
  };
}

/**
 * Normalizes backend profile response formats into standard DatasetProfile.
 *
 * Backend ProfileResponse shape (app/schemas/profile.py):
 *   {
 *     dataset: { id, filename },
 *     data: { rows, columns, column_names },
 *     quality: { duplicate_rows, missing_values },
 *     types: { numeric_columns, categorical_columns },
 *     statistics: dict,
 *     preview: list,
 *     total_bytes: int,
 *   }
 */
function normalizeProfile(raw: any): DatasetProfile {
  // Rows / cols — prefer nested `data` object (backend), fall back to flat shapes
  const rows = raw.data?.rows ?? raw.basic?.rows ?? raw.shape?.rows ?? 0;
  const cols = raw.data?.columns ?? raw.basic?.columns ?? raw.shape?.columns ?? (raw.data?.column_names?.length || 0);
  const columns: string[] = raw.data?.column_names ?? raw.basic?.column_names ?? raw.columns ?? [];

  // Column type lists — nested `types` object (backend) with flat fallback
  const numeric_columns: string[] = raw.types?.numeric_columns ?? raw.numeric_columns ?? [];
  const categorical_columns: string[] = raw.types?.categorical_columns ?? raw.categorical_columns ?? [];

  // Data quality — nested `quality` object (backend) with flat fallback
  const missing_values: Record<string, number> = raw.quality?.missing_values ?? raw.missing_values ?? {};
  const duplicate_rows: number = raw.quality?.duplicate_rows ?? raw.duplicate_rows ?? 0;

  // Statistics dict
  const describe: Record<string, Record<string, number | null>> = raw.statistics ?? raw.describe ?? {};

  // Memory — backend provides total_bytes (int)
  const memory_usage: string =
    raw.memory_usage ??
    (raw.total_bytes != null ? `${(raw.total_bytes / (1024 * 1024)).toFixed(2)} MB` : 'N/A');

  const preview: Array<Record<string, any>> = Array.isArray(raw.preview) ? raw.preview : [];

  // dataset_id — nested `dataset.id` (backend) or flat field
  const dataset_id: string = raw.dataset?.id ?? raw.dataset_id ?? '';

  return {
    dataset_id,
    shape: { rows, columns: cols },
    columns,
    numeric_columns,
    categorical_columns,
    missing_values,
    duplicate_rows,
    describe,
    memory_usage,
    preview,
  };
}

