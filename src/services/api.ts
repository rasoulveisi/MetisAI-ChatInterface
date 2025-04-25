import axios from 'axios';
import { ApiConfig, ChatSession, ChatSessionApiResponse, Message, MessageResponse } from '../types';

const DEFAULT_API_CONFIG: ApiConfig = {
  apiKey: 'YOUR_API_KEY_HERE',
  botId: 'BOT_ID',
  baseUrl: 'https://api.metisai.ir/api/v1'
};

class ApiService {
  private config: ApiConfig;
  
  constructor(config?: ApiConfig) {
    // Try to get values from localStorage
    const apiKey = typeof window !== 'undefined' ? localStorage.getItem('metisai_api_key') : null;
    const botId = typeof window !== 'undefined' ? localStorage.getItem('metisai_bot_id') : null;
  
    this.config = {
      ...DEFAULT_API_CONFIG,
      ...(config || {}),
      ...(apiKey && botId ? { apiKey, botId } : {})
    };
  }
  
  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  async createChatSession(initialMessage: string): Promise<ChatSession> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/chat/session`,
        {
          botId: this.config.botId,
          user: null,
          initialMessages: [
            {
              type: 'USER',
              content: initialMessage
            }
          ]
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error creating chat session:', error);
      throw error;
    }
  }

  async sendMessage(sessionId: string, content: string): Promise<Message> {
    try {
      const response = await axios.post(
        `${this.config.baseUrl}/chat/session/${sessionId}/message`,
        {
          message: {
            content,
            type: 'USER'
          }
        },
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/chat/session?botId=${this.config.botId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      throw error;
    }
  }

  async getChatSessionById(sessionId: string): Promise<ChatSessionApiResponse> {
    try {
      const response = await axios.get(
        `${this.config.baseUrl}/chat/session/${sessionId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Error getting chat sessions:', error);
      throw error;
    }
  }


  // Update API configuration
  updateConfig(config: Partial<ApiConfig>) {
    this.config = { ...this.config, ...config };
  }

  public getBotId() {
    return this.config.botId;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;