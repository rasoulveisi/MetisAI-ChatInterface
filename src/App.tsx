import React, { useEffect, useState } from 'react';
import ChatHistory from './components/ChatHistory';
import ChatView from './components/ChatView';
import Navbar from './components/Navbar';
import ApiKeyModal from './components/ApiKeyModal';
import { useChatStore } from './store/chatStore';
import apiService from './services/api';

function App() {
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [apiConfigured, setApiConfigured] = useState(false);
  const createNewChat = useChatStore(state => state.createNewChat);

  // Check for saved API credentials
  useEffect(() => {
    const savedApiKey = localStorage.getItem('metisai_api_key');
    const savedBotId = localStorage.getItem('metisai_bot_id');
    
    if (savedApiKey && savedBotId) {
      apiService.updateConfig({
        apiKey: savedApiKey,
        botId: savedBotId
      });
      setApiConfigured(true);
    } else {
      // Show settings modal if API is not configured
      setShowSettingsModal(true);
    }
  }, []);

  const handleNewChat = async () => {
    try {
      if (!apiConfigured) {
        setShowSettingsModal(true);
        return;
      }
      await createNewChat('Hello');
    } catch (error) {
      console.error('Failed to create new chat:', error);
    }
  };

  const handleCloseSettingsModal = () => {
    setShowSettingsModal(false);
    setApiConfigured(true);
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <Navbar 
        onToggleSidebar={() => setShowSidebar(!showSidebar)} 
        onOpenSettings={() => setShowSettingsModal(true)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - hidden on mobile unless toggled */}
        <div className={`
          ${showSidebar ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 transition-transform duration-300 ease-in-out
          w-full md:w-80 lg:w-96 absolute md:relative z-10 md:z-0 h-[calc(100vh-3.5rem)]
        `}>
          <ChatHistory onNewChat={handleNewChat} />
        </div>
        
        {/* Overlay for mobile */}
        {showSidebar && (
          <div 
            className="md:hidden fixed inset-0 bg-gray-900 bg-opacity-50 z-0"
            onClick={() => setShowSidebar(false)}
          />
        )}
        
        {/* Main chat area */}
        <div className="flex-1 min-w-0">
          <ChatView onNewChat={handleNewChat} />
        </div>
      </div>
      
      {/* API Key Modal */}
      <ApiKeyModal 
        isOpen={showSettingsModal} 
        onClose={handleCloseSettingsModal} 
      />
    </div>
  );
}

export default App;