import React, { useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, PlusCircle, RefreshCw } from 'lucide-react';
import { useChatStore } from '../store/chatStore';
import { MessageResponse } from '../types';

interface ChatHistoryProps {
  onNewChat: () => void;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ onNewChat }) => {
  const { 
    sessions, 
    currentSessionId, 
    isLoading,
    fetchSessionById, 
    setCurrentSession,
    fetchSessions,
  } = useChatStore();
  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);
  // Fetch sessions on currentSessionId change, but skip if temp-
  useEffect(() => {
    if (!currentSessionId) return;
    if (currentSessionId.startsWith('temp-')) return;
    fetchSessionById(currentSessionId);
  }, [currentSessionId, fetchSessionById]);

  const getFirstMessage = (messages: MessageResponse[]) => {
    if (!messages || messages.length === 0) return 'New conversation';
    return messages[0]?.message?.content || 'New conversation';
  };

  const formatDate = (timestamp: number) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  return (
    <div className="flex flex-col h-full bg-gray-100 border-r border-gray-200">
      <div className="p-4 border-b border-gray-200 bg-white">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusCircle className="h-5 w-5" />
          <span>New Chat</span>
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        {isLoading && sessions.length === 0 ? (
          <div className="flex justify-center items-center h-32">
            <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
          </div>
        ) : (
          <div className="p-3">
            {sessions.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                No chat history yet
              </div>
            ) : (
              <ul className="flex flex-col gap-2 p-2">
                {sessions.map((session) => (
                  <li key={session.id}>
                    <button
                      className={`w-full text-left p-3 rounded-lg transition-colors flex items-start ${
                        session.id === currentSessionId
                          ? 'bg-primary-100 text-primary-800'
                          : 'hover:bg-gray-200 text-gray-700'
                      }`}
                      onClick={() => setCurrentSession(session.id)}
                    >
                      <MessageSquare className="h-5 w-5 mr-2 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {getFirstMessage(session.messages)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(session.startDate)}
                        </p>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;