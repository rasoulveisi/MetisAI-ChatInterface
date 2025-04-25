import { create } from 'zustand';
import { ChatSession, Message } from '../types';
import apiService from '../services/api';

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
  messages: Record<string, Message[]>;
  
  // Actions
  fetchSessions: () => Promise<void>;
  createNewChat: (initialMessage: string) => Promise<string>;
  sendMessage: (content: string) => Promise<void>;
  setCurrentSession: (sessionId: string) => void;
  resetError: () => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  sessions: [],
  currentSessionId: null,
  isLoading: false,
  error: null,
  messages: {},
  
  fetchSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await apiService.getChatSessions();
      set({ sessions, isLoading: false });
      
      // Initialize messages from fetched sessions
      const messagesMap: Record<string, Message[]> = {};
      sessions.forEach(session => {
        messagesMap[session.id] = session.messages.map(m => ({
          id: m.id,
          type: m.message.type,
          content: m.message.content,
          timestamp: m.timestamp,
          attachments: m.message.attachments
        }));
      });
      
      set(state => ({ 
        messages: { ...state.messages, ...messagesMap }
      }));
      
      // Set first session as current if none is selected
      if (sessions.length > 0 && !get().currentSessionId) {
        set({ currentSessionId: sessions[0].id });
      }
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch chat sessions', 
        isLoading: false 
      });
    }
  },
  
  createNewChat: async (initialMessage: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await apiService.createChatSession(initialMessage);
      set(state => ({
        sessions: [session, ...state.sessions],
        currentSessionId: session.id,
        isLoading: false,
        messages: {
          ...state.messages,
          [session.id]: session.messages.map(m => ({
            id: m.id,
            type: m.message.type,
            content: m.message.content,
            timestamp: m.timestamp,
            attachments: m.message.attachments
          }))
        }
      }));
      return session.id;
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create new chat', 
        isLoading: false 
      });
      throw error;
    }
  },
  
  sendMessage: async (content: string) => {
    const { currentSessionId } = get();
    if (!currentSessionId) {
      set({ error: 'No active chat session' });
      return;
    }
    
    // Optimistically add user message to UI
    const tempUserMessage: Message = {
      id: `temp-${Date.now()}`,
      type: 'USER',
      content,
      timestamp: new Date().toISOString()
    };
    
    set(state => ({
      messages: {
        ...state.messages,
        [currentSessionId]: [
          ...(state.messages[currentSessionId] || []),
          tempUserMessage
        ]
      },
      isLoading: true,
      error: null
    }));
    
    try {
      // Send message to API
      const response = await apiService.sendMessage(currentSessionId, content);
      
      // Add AI response to messages
      set(state => ({
        messages: {
          ...state.messages,
          [currentSessionId]: [
            ...(state.messages[currentSessionId] || []),
            response
          ]
        },
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to send message', 
        isLoading: false 
      });
    }
  },
  
  setCurrentSession: (sessionId: string) => {
    set({ currentSessionId: sessionId });
  },
  
  resetError: () => {
    set({ error: null });
  }
}));