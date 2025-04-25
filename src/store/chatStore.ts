import { create } from 'zustand';
import { ChatSession, ChatSessionApiResponse, Message, MessageResponse } from '../types';
import apiService from '../services/api';

interface ChatState {
  sessions: ChatSession[];
  currentSessionId: string | null;
  isLoading: boolean;
  error: string | null;
  messages: Record<string, Message[]>;
  
  // Actions
  fetchSessions: () => Promise<void>;
  fetchSessionById: (sessionId: string) => Promise<void>;
  createNewChat: () => Promise<string>;
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

  fetchSessionById: async (sessionId: string) => {
    set({ isLoading: true, error: null });
    try {
      const session: ChatSessionApiResponse = await apiService.getChatSessionById(sessionId);
      set(state => ({
        messages: {
          ...state.messages,
          [sessionId]: (session.messages || [])
            .slice() // make a shallow copy to avoid mutating original
            .reverse()
            .map(m => ({
              id: m.id,
              type: m.type,
              content: m.content,
              timestamp: m.timestamp,
              attachments: m.attachments
            }))
        },
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch chat session', 
        isLoading: false 
      });
    }
  },
  
  createNewChat: async () => {
    // Create a local temporary session, do not call API
    const tempId = `temp-${Date.now()}`;
    const botId = apiService.getBotId();
    const tempSession = {
      id: tempId,
      botId,
      user: null,
      messages: [],
      startDate: Date.now(),
    };
    set(state => ({
      sessions: [tempSession, ...state.sessions],
      currentSessionId: tempId,
      messages: {
        ...state.messages,
        [tempId]: []
      },
      isLoading: false,
      error: null
    }));
    return tempId;
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
    
    // Check if this is a temporary session
    if (currentSessionId.startsWith('temp-')) {
      try {
        // Create session and send first message in one API call
        const session = await apiService.createChatSession(content);
        set(state => {
          // Remove temp session and replace with real session
          const newSessions = [session, ...state.sessions.filter(s => s.id !== currentSessionId)];
          return {
            sessions: newSessions,
            currentSessionId: session.id,
            isLoading: false,
            messages: {
              ...state.messages,
              // Remove temp messages, add real messages (may be empty)
              [session.id]: (session.messages || []).map(m => ({
                id: m.id,
                type: m.message.type,
                content: m.message.content,
                timestamp: m.timestamp,
                attachments: m.message.attachments
              }))
            }
          };
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to create new chat', 
          isLoading: false 
        });
      }
      return;
    }
    
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