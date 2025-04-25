export interface User {
  id?: string;
  name?: string;
}

export interface Message {
  id?: string;
  type: 'USER' | 'AI';
  content: string;
  attachments?: any[] | null;
  timestamp?: number | string;
  finishReason?: string;
  citations?: any[] | null;
  toolCalls?: any[] | null;
  rag?: any | null;
  billing?: {
    cost: number;
  } | null;
}

export interface MessageResponse {
  id: string;
  message: {
    type: 'USER' | 'AI';
    content: string;
    attachments: any[] | null;
  };
  timestamp: string;
}

export interface ChatSession {
  id: string;
  botId: string;
  user: User | null;
  messages: MessageResponse[];
  startDate: number;
}

export interface ApiConfig {
  apiKey: string;
  botId: string;
  baseUrl: string;
}