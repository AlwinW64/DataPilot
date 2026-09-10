declare module 'plotly.js-dist-min' {
  const Plotly: any;
  export default Plotly;
}

declare module 'react-plotly.js/factory' {
  import { ComponentType } from 'react';
  import { PlotParams } from 'react-plotly.js';
  export default function createPlotlyComponent(plotly: any): ComponentType<PlotParams>;
}

declare module 'react-plotly.js' {
  import { Component } from 'react';
  export interface PlotParams {
    data: any[];
    layout?: any;
    config?: any;
    frames?: any[];
    className?: string;
    style?: React.CSSProperties;
    useResizeHandler?: boolean;
    onInitialized?: (figure: any, graphDiv: HTMLElement) => void;
    onUpdate?: (figure: any, graphDiv: HTMLElement) => void;
    onPurge?: (figure: any, graphDiv: HTMLElement) => void;
    onError?: (err: Error) => void;
  }
  export default class Plot extends Component<PlotParams> {}
}
