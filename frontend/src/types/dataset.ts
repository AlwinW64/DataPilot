export interface DatasetMetadata {
  dataset_id: string;
  filename: string;
  row_count: number;
  column_count: number;
  columns: string[];
  uploaded_at?: string;
  filesize?: number;
}

export interface DatasetProfile {
  dataset_id: string;
  shape: {
    rows: number;
    columns: number;
  };
  columns: string[];
  numeric_columns: string[];
  categorical_columns: string[];
  missing_values: Record<string, number>;
  duplicate_rows: number;
  describe: Record<string, Record<string, number | null>>;
  memory_usage: string;
  preview: Array<Record<string, string | number | boolean | null>>;
}

export type ChartType = 'bar' | 'line' | 'scatter' | 'histogram';

export interface ChartRequest {
  chart_type: ChartType;
  x: string;
  y?: string;
  color?: string;
  title?: string;
}

export interface ChartResponse {
  figure: {
    data: any[];
    layout: Record<string, any>;
    frames?: any[];
  };
  chart_type: ChartType;
  title?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  actionTriggers?: {
    label: string;
    toolId: string;
    payload?: any;
  }[];
}

export interface ToolDefinition {
  id: string;
  label: string;
  description: string;
  icon: string;
  badge?: string;
  isAvailable: boolean;
}
