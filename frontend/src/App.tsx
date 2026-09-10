import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/sidebar/Sidebar';
import { ChatPane } from './components/chat/ChatPane';
import { ToolDock } from './components/tools/ToolDock';
import { DatasetMetadata, DatasetProfile, ChatMessage, ChartRequest } from './types/dataset';
import { api } from './services/api';

export function App() {
  const [datasets, setDatasets] = useState<DatasetMetadata[]>([]);
  const [activeDataset, setActiveDataset] = useState<DatasetMetadata | null>(null);
  const [datasetProfile, setDatasetProfile] = useState<DatasetProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState<boolean>(false);

  // Layout states
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [isDockOpen, setIsDockOpen] = useState<boolean>(true);
  const [isDockFullscreen, setIsDockFullscreen] = useState<boolean>(false);
  const [activeToolId, setActiveToolId] = useState<string>('profile');
  const [visualizerConfig, setVisualizerConfig] = useState<Partial<ChartRequest> | null>(null);

  // Chat states
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState<boolean>(false);

  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);

  // Apply dark mode class on html
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load saved datasets on initial mount
  useEffect(() => {
    const saved = api.getSavedDatasets();
    setDatasets(saved);
    if (saved.length > 0) {
      handleSelectDataset(saved[0]);
    }
  }, []);

  const handleSelectDataset = async (dataset: DatasetMetadata) => {
    setActiveDataset(dataset);
    setIsLoadingProfile(true);

    // Restore saved chat for this dataset
    const savedChat = api.getSavedChat(dataset.dataset_id);
    setMessages(savedChat);

    try {
      const prof = await api.getProfile(dataset.dataset_id);
      setDatasetProfile(prof);
    } catch (err) {
      console.warn('Could not load profile from backend:', err);
      setDatasetProfile(null);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const handleDatasetUploaded = (newDs: DatasetMetadata) => {
    setDatasets((prev) => [newDs, ...prev.filter((d) => d.dataset_id !== newDs.dataset_id)]);
    handleSelectDataset(newDs);
    setIsDockOpen(true);
    setActiveToolId('profile');
  };

  const handleDeleteDataset = (id: string) => {
    api.deleteSavedDataset(id);
    const remaining = datasets.filter((d) => d.dataset_id !== id);
    setDatasets(remaining);

    if (activeDataset?.dataset_id === id) {
      if (remaining.length > 0) {
        handleSelectDataset(remaining[0]);
      } else {
        setActiveDataset(null);
        setDatasetProfile(null);
        setMessages([]);
      }
    }
  };

  const handleNewChat = () => {
    if (activeDataset) {
      setMessages([]);
      api.saveChatLocally(activeDataset.dataset_id, []);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    if (activeDataset) {
      api.saveChatLocally(activeDataset.dataset_id, newMessages);
    }

    setIsLoadingChat(true);

    try {
      const response = await api.askCopilot(
        activeDataset?.dataset_id || 'demo',
        text,
        datasetProfile
      );

      const assistantMsg: ChatMessage = {
        id: `asst_${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toISOString(),
        actionTriggers: response.actionTriggers,
      };

      const finalMessages = [...newMessages, assistantMsg];
      setMessages(finalMessages);

      if (activeDataset) {
        api.saveChatLocally(activeDataset.dataset_id, finalMessages);
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Sorry, an error occurred while processing your request: ${err.message}`,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleOpenTool = (toolId: string, payload?: any) => {
    setActiveToolId(toolId);
    setIsDockOpen(true);
    if (payload && toolId === 'visualizer') {
      setVisualizerConfig(payload);
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Top Application Header */}
      <Header
        activeDataset={activeDataset}
        isDockOpen={isDockOpen}
        onToggleDock={() => setIsDockOpen(!isDockOpen)}
        isDockFullscreen={isDockFullscreen}
        onToggleFullscreenDock={() => setIsDockFullscreen(!isDockFullscreen)}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Split-Screen Workspace */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Dataset Management & History Sidebar */}
        <Sidebar
          datasets={datasets}
          activeDataset={activeDataset}
          onSelectDataset={handleSelectDataset}
          onDatasetUploaded={handleDatasetUploaded}
          onDeleteDataset={handleDeleteDataset}
          onNewChat={handleNewChat}
          isOpen={isSidebarOpen}
          onToggleOpen={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        {/* Center: Conversational AI Copilot Chat Pane */}
        <ChatPane
          activeDataset={activeDataset}
          datasetProfile={datasetProfile}
          onOpenTool={handleOpenTool}
          messages={messages}
          onSendMessage={handleSendMessage}
          isLoading={isLoadingChat}
        />

        {/* Right: Collapsible & Expandable Tool Dock */}
        <ToolDock
          activeDataset={activeDataset}
          profile={datasetProfile}
          isLoadingProfile={isLoadingProfile}
          activeToolId={activeToolId}
          onSelectTool={setActiveToolId}
          isOpen={isDockOpen}
          onClose={() => setIsDockOpen(false)}
          isFullscreen={isDockFullscreen}
          onToggleFullscreen={() => setIsDockFullscreen(!isDockFullscreen)}
          visualizerConfig={visualizerConfig}
        />
      </div>
    </div>
  );
}

export default App;
