import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { User, MessageSquare } from 'lucide-react';
import { Message } from '../types';

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isAI = message.type === 'AI';
  
  // Format timestamp if available
  const formattedTime = message.timestamp 
    ? formatDistanceToNow(
        new Date(typeof message.timestamp === 'number' 
          ? message.timestamp 
          : Date.parse(message.timestamp as string)
        ),
        { addSuffix: true }
      )
    : '';
  
  return (
    <div className={`flex w-full mb-4 ${isAI ? 'justify-start' : 'justify-end'}`}>
      <div className={`
        flex max-w-[85%] md:max-w-[75%]
        ${isAI 
          ? 'bg-white border border-gray-200' 
          : 'bg-primary-600 text-white'}
        rounded-lg p-3 shadow-xs
      `}>
        <div className="flex-shrink-0 mr-3">
          {isAI 
            ? <MessageSquare className={`w-6 h-6 ${isAI ? 'text-primary-600' : 'text-white'}`} />
            : <User className="w-6 h-6" />
          }
        </div>
        <div className="flex-1">
          <div className={`text-sm ${isAI ? 'text-gray-800' : 'text-white'}`}>
            {message.content}
          </div>
          {formattedTime && (
            <div className={`text-xs mt-1 ${isAI ? 'text-gray-500' : 'text-primary-100'}`}>
              {formattedTime}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;