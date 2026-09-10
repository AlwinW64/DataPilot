import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  ArrowUpRight, 
  Loader2, 
  RefreshCw,
  HelpCircle,
  BarChart3,
  Search,
  FileText
} from 'lucide-react';
import { ChatMessage, DatasetMetadata, DatasetProfile } from '../../types/dataset';
import { api } from '../../services/api';

interface ChatPaneProps {
  activeDataset: DatasetMetadata | null;
  datasetProfile: DatasetProfile | null;
  onOpenTool: (toolId: string, payload?: any) => void;
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

export const ChatPane: React.FC<ChatPaneProps> = ({
  activeDataset,
  datasetProfile,
  onOpenTool,
  messages,
  onSendMessage,
  isLoading,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const samplePrompts = [
    {
      title: 'Summarize Dataset',
      icon: <FileText className="h-3.5 w-3.5" />,
      prompt: 'Give me an executive summary of this dataset, its shape, and key features.',
    },
    {
      title: 'Data Quality Audit',
      icon: <Search className="h-3.5 w-3.5" />,
      prompt: 'Check for missing values, duplicates, and assess overall data quality.',
    },
    {
      title: 'Recommend Charts',
      icon: <BarChart3 className="h-3.5 w-3.5" />,
      prompt: 'What are the best charts to visualize the relationships in this dataset?',
    },
    {
      title: 'Key Column Statistics',
      icon: <Sparkles className="h-3.5 w-3.5" />,
      prompt: 'What are the average, min, and max values across the numeric columns?',
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-slate-950 overflow-hidden relative">
      {/* Scrollable Conversation History */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6">
        {messages.length === 0 ? (
          /* Empty / Welcome State */
          <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center py-10 space-y-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 text-white flex items-center justify-center shadow-xl shadow-brand-500/20">
              <Sparkles className="h-8 w-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                How can DataPilot help you analyze today?
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {activeDataset
                  ? `Active dataset: ${activeDataset.filename} (${activeDataset.row_count.toLocaleString()} rows, ${activeDataset.column_count} columns)`
                  : 'Upload a CSV dataset from the left sidebar or select an existing one to unlock automated profiling, Plotly visualizations, and AI insights.'}
              </p>
            </div>

            {/* Quick Prompt Cards */}
            {activeDataset && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-2">
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => onSendMessage(p.prompt)}
                    className="p-3.5 text-left rounded-xl border border-slate-200 dark:border-slate-800 hover:border-brand-400 dark:hover:border-brand-500/50 bg-slate-50/70 dark:bg-slate-900/50 hover:bg-brand-50/40 dark:hover:bg-brand-950/20 transition-all flex flex-col justify-between group"
                  >
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                      <span className="text-brand-500">{p.icon}</span>
                      {p.title}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {p.prompt}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          /* Message Stream */
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${
                  msg.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-600 to-sky-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-sm text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-600 text-white rounded-tr-sm ml-auto'
                      : 'bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-tl-sm'
                  }`}
                >
                  {/* Message body with Markdown format */}
                  <div className="whitespace-pre-line prose prose-slate dark:prose-invert prose-sm max-w-none">
                    {msg.content}
                  </div>

                  {/* Action triggers / Tool buttons */}
                  {msg.actionTriggers && msg.actionTriggers.length > 0 && (
                    <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap gap-2">
                      {msg.actionTriggers.map((act, i) => (
                        <button
                          key={i}
                          onClick={() => onOpenTool(act.toolId, act.payload)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-brand-600 dark:text-brand-300 border border-brand-200 dark:border-brand-800 hover:bg-brand-50 dark:hover:bg-brand-950/60 transition-colors shadow-xs"
                        >
                          <span>{act.label}</span>
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-2 flex items-center gap-1 ${
                      msg.role === 'user' ? 'text-brand-200 justify-end' : 'text-slate-400'
                    }`}
                  >
                    <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div className="h-8 w-8 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3.5 justify-start">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-brand-600 to-sky-500 text-white flex items-center justify-center flex-shrink-0 animate-pulse">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="p-4 rounded-2xl rounded-tl-sm bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin text-brand-500" />
                  <span>Analyzing dataset context...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Composer Bar */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/90 backdrop-blur-md flex-shrink-0">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto relative">
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              activeDataset
                ? `Ask about ${activeDataset.filename} (e.g. 'Show missing values', 'Plot correlation')...`
                : 'Upload or select a dataset from the sidebar to ask questions...'
            }
            className="w-full resize-none rounded-2xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 px-4 py-3 pr-14 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500 dark:focus:ring-brand-400 transition-all shadow-sm"
          />

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`absolute right-3 bottom-3.5 p-2 rounded-xl text-white transition-all ${
              input.trim() && !isLoading
                ? 'bg-brand-500 hover:bg-brand-600 shadow-md shadow-brand-500/30 cursor-pointer'
                : 'bg-slate-300 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
            }`}
            title="Send Message"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </form>
        <div className="max-w-3xl mx-auto mt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 px-1">
          <span>Shift + Enter for new line</span>
          <span>DataPilot Copilot</span>
        </div>
      </div>
    </div>
  );
};
