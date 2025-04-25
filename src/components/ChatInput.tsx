import React, { useState, KeyboardEvent } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <div className="relative flex items-center">
        <textarea
          className="w-full resize-none border border-gray-300 rounded-lg py-3 px-4 pr-12 focus:outline-hidden focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
          placeholder="Type your message..."
          rows={1}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        <button
          className={`absolute right-2 p-2 rounded-md transition-colors ${
            message.trim() && !disabled
              ? 'text-primary-600 hover:bg-primary-50'
              : 'text-gray-400 cursor-not-allowed'
          }`}
          onClick={handleSubmit}
          disabled={!message.trim() || disabled}
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </button>
      </div>
      <div className="text-xs text-gray-500 mt-2 px-2">
        Press Enter to send, Shift+Enter for a new line
      </div>
    </div>
  );
};

export default ChatInput;