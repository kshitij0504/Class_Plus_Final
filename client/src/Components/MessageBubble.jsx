import React from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, CheckCheck } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MessageBubble = ({ message, currentUser }) => {
  // Add null checks and default values
  if (!message || !currentUser) {
    console.error('MessageBubble: Missing required props', { message, currentUser });
    return null;
  }

  const isOwnMessage = message.userId === currentUser.id;
  
  const formatTime = (date) => {
    try {
      return format(new Date(date), 'h:mm a');
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const getInitials = (username = '') => {
    return username
      .slice(0, 2)
      .toUpperCase();
  };

  // Safely access user data with default values
  const user = message.user || {};
  const username = user.username || 'Unknown User';
  const avatar = user.avatar || '';

  return (
    <div
      className={`flex mb-4 ${
        isOwnMessage ? 'justify-end' : 'justify-start'
      } items-end gap-2`}
    >
      {!isOwnMessage && (
        <div className="flex-shrink-0">
          {avatar ? (
            <img 
              src={avatar} 
              alt={username}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs font-medium text-white">
              {getInitials(username)}
            </div>
          )}
        </div>
      )}
      
      <div className={`group relative max-w-[70%] ${isOwnMessage ? 'order-1' : 'order-2'}`}>
        {!isOwnMessage && (
          <div className="text-sm text-gray-400 mb-1 ml-1">
            {username}
          </div>
        )}
        
        <div
          className={`relative px-4 py-2 rounded-2xl ${
            isOwnMessage
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-700 text-white rounded-bl-sm'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.content || ''}
          </p>
          
          <div className={`flex items-center gap-1 text-xs mt-1 ${
            isOwnMessage ? 'text-blue-200' : 'text-gray-400'
          }`}>
            <span>{formatTime(message.createdAt)}</span>
            {isOwnMessage && (
              <CheckCheck className="w-4 h-4" />
            )}
          </div>
        </div>

        <div className={`absolute top-0 ${
          isOwnMessage ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
        } opacity-0 group-hover:opacity-100 transition-opacity`}>
          <DropdownMenu>
            <DropdownMenuTrigger className="p-1 hover:bg-gray-700 rounded-full">
              <MoreHorizontal className="w-4 h-4 text-gray-400" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => navigator.clipboard.writeText(message.content)}>
                Copy Text
              </DropdownMenuItem>
              {isOwnMessage && (
                <DropdownMenuItem className="text-red-500">
                  Delete Message
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;