import React from 'react';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const MessageMenu = ({ message, currentUser, onDelete }) => {
  const isOwnMessage = message.userId === currentUser.id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-48 bg-gray-800 text-white border-gray-700">
        <DropdownMenuItem 
          className="text-red-400 hover:text-red-300 cursor-pointer"
          onClick={() => onDelete(message.id, 'everyone')}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete for Everyone
        </DropdownMenuItem>
        {isOwnMessage && (
          <DropdownMenuItem 
            className="text-red-400 hover:text-red-300 cursor-pointer"
            onClick={() => onDelete(message.id, 'self')}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete for Me
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MessageMenu;