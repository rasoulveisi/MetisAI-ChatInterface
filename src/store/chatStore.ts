import { create } from 'zustand';
import { ChatSession, ChatSessionApiResponse, Message } from '../types';
import apiService from '../services/api';

// Helper to map API messages to app Message type
const mapApiMessages = (apiMessages: any[]): Message[] =>
  apiMessages
    .slice() // avoid mutating original
    .reverse()
    .map((m) => ({
      id: m.id,
      type: m.type,
      content: m.content,
      timestamp: m.timestamp,
      attachments: m.attachments,
      finishReason: m.finishReason,
      citations: m.citations,
      toolCalls: m.toolCalls,
      rag: m.rag,
      billing: m.billing,
    }));

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
  
  fetchSessions: async (): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const sessions = await apiService.getChatSessions();
      set({ sessions, isLoading: false });
      
      // Initialize messages from fetched sessions
      const messagesMap: Record<string, Message[]> = {};
      sessions.forEach((session) => {
        messagesMap[session.id] = mapApiMessages(session.messages || []);
      });
      
      set((state) => ({ 
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
      console.error(error);
    }
  },

  fetchSessionById: async (sessionId: string): Promise<void> => {
    set({ isLoading: true, error: null });
    try {
      const session: ChatSessionApiResponse = await apiService.getChatSessionById(sessionId);
      set((state) => ({
        messages: {
          ...state.messages,
          [sessionId]: mapApiMessages(session.messages || [])
        },
        isLoading: false
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch chat session', 
        isLoading: false 
      });
      console.error(error);
    }
  },
  
  createNewChat: async (): Promise<string> => {
    // Create a local temporary session, do not call API
    const tempId = `temp-${Date.now()}`;
    const botId = apiService.getBotId();
    const tempSession: ChatSession = {
      id: tempId,
      botId,
      user: null,
      messages: [],
      startDate: Date.now(),
    };
    set((state) => ({
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
  
  sendMessage: async (content: string): Promise<void> => {
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
    
    set((state) => ({
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
        set((state) => {
          // Remove temp session and replace with real session
          const newSessions = [session, ...state.sessions.filter(s => s.id !== currentSessionId)];
          return {
            sessions: newSessions,
            currentSessionId: session.id,
            isLoading: false,
            messages: {
              ...state.messages,
              // Remove temp messages, add real messages (may be empty)
              [session.id]: mapApiMessages(session.messages || [])
            }
          };
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to create new chat', 
          isLoading: false 
        });
        console.error(error);
      }
      return;
    }
    
    try {
      // Send message to API
      const response = await apiService.sendMessage(currentSessionId, content);
      
      // Add AI response to messages
      set((state) => ({
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
      console.error(error);
    }
  },
  
  setCurrentSession: (sessionId: string): void => {
    set({ currentSessionId: sessionId });
  },
  
  resetError: (): void => {
    set({ error: null });
  }
}));