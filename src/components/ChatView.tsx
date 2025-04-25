import React, { useEffect, useRef } from 'react';
import { MessageSquare, Loader } from 'lucide-react';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import { useChatStore } from '../store/chatStore';

interface ChatViewProps {
  onNewChat: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ onNewChat }) => {
  const { 
    currentSessionId, 
    messages, 
    isLoading, 
    sendMessage 
  } = useChatStore();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentMessages = currentSessionId ? messages[currentSessionId] || [] : [];

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages]);

  if (!currentSessionId) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-6">
        <MessageSquare className="h-16 w-16 text-primary-300 mb-4" />
        <h2 className="text-xl font-semibold text-gray-700 mb-2">No active chat</h2>
        <p className="text-gray-500 mb-6 text-center max-w-md">
          Start a new conversation or select a chat from the history.
        </p>
        <button
          onClick={onNewChat}
          className="bg-primary-600 text-white py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Start New Chat
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {currentMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <MessageSquare className="h-16 w-16 text-primary-300 mb-4" />
            <p className="text-gray-500">Send a message to start the conversation</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4 p-4">
            {currentMessages.map((message, index) => (
              <MessageBubble key={message.id || index} message={message} />
            ))}
            {isLoading && (
              <div className="flex items-center text-gray-500 p-3">
                <Loader className="h-5 w-5 animate-spin mr-2" />
                <span>AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <ChatInput onSendMessage={sendMessage} disabled={isLoading} />
    </div>
  );
};

export default ChatView;