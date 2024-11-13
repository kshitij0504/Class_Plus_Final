import React, { useState } from "react";
import { MoreVertical, Trash, Check, Clock, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import FilePreview from "@/Pages/Group/Chat/fileupload";

const MessageBubble = ({
  message,
  currentUser,
  isSelected,
  onSelect,
  onDelete,
  selectionMode,
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteType, setDeleteType] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isOwner = message.userId === currentUser.id;
  const messageAge = Date.now() - new Date(message.createdAt).getTime();
  const canDeleteForEveryone = isOwner && messageAge < 60 * 60 * 1000;

  const handleDeleteClick = (type) => {
    setDeleteType(type);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    try {
      setIsDeleting(true);
      const endpoint = deleteType === "everyone"
        ? `http://localhost:8000/api/${message.id}/deleteForEveryone`
        : `http://localhost:8000/api/${message.id}/deleteForSelf`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete message");
      }
      onDelete(message.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting message:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessageContent = () => {
    if (message.isDeletedForEveryone) {
      return (
        <div className="flex items-center gap-2 text-gray-400 italic">
          <Trash className="w-4 h-4" />
          <span>This message was deleted</span>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {message.content && (
          <p className="leading-relaxed">{message.content}</p>
        )}
        {message.fileUrl && (
          <div className="rounded-lg overflow-hidden">
            <FilePreview
              fileUrl={message.fileUrl}
              fileName={message.fileName}
              fileType={message.fileType}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div
        className={`relative flex items-end gap-2 mb-6 group px-4 py-1
          ${isOwner ? "flex-row-reverse" : ""}
          ${selectionMode ? "cursor-pointer hover:bg-gray-800/20" : ""}
          ${isSelected ? "bg-gray-800/30" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => selectionMode && onSelect(message.id)}
      >
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isOwner ? "ml-2" : "mr-2"}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center overflow-hidden shadow-lg">
            {selectionMode ? (
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${isSelected ? "border-blue-500 bg-blue-500" : "border-gray-400"}`}>
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            ) : (
              message.user.avatar ? (
                <img
                  src={message.user.avatar}
                  alt={`${message.user.username}'s avatar`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-sm font-semibold text-white">
                  {message.user?.username?.[0]?.toUpperCase()}
                </span>
              )
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`relative max-w-[70%] ${isOwner ? "items-end" : "items-start"}`}>
          {/* Username */}
          <div className={`text-xs font-medium text-gray-400 mb-1 ${isOwner ? "text-right" : "text-left"}`}>
            {message.user?.username}
          </div>

          {/* Message Bubble */}
          <div className={`relative group rounded-2xl px-4 py-2.5 shadow-md
            ${isOwner 
              ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white" 
              : "bg-gray-800 text-gray-100"}`}>
            {renderMessageContent()}

            {/* Time and Status */}
            <div className={`flex items-center gap-1 mt-1 text-xs
              ${isOwner ? "justify-end text-blue-100" : "text-gray-400"}`}>
              <span>{formatTime(message.createdAt)}</span>
              {isOwner && (
                <CheckCheck className="w-3.5 h-3.5" />
              )}
            </div>
          </div>
        </div>

        {/* Actions Dropdown */}
        {!selectionMode && !message.isDeletedForEveryone && isOwner && isHovered && (
          <div className="absolute top-0 right-0 transform -translate-y-1/2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 rounded-full bg-gray-800/80 hover:bg-gray-700/80 backdrop-blur-sm"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-gray-800 border-gray-700"
              >
                <DropdownMenuItem 
                  onClick={() => handleDeleteClick("self")}
                  className="text-red-400 focus:text-red-300 focus:bg-gray-700"
                >
                  <Trash className="w-4 h-4 mr-2" />
                  Delete for me
                </DropdownMenuItem>
                {canDeleteForEveryone && (
                  <DropdownMenuItem 
                    onClick={() => handleDeleteClick("everyone")}
                    className="text-red-400 focus:text-red-300 focus:bg-gray-700"
                  >
                    <Trash className="w-4 h-4 mr-2" />
                    Delete for everyone
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-800 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Message</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {deleteType === "everyone"
                ? "This message will be deleted for everyone in the chat. This action cannot be undone."
                : "This message will be deleted for you only. Other chat members will still be able to see it."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-gray-700 hover:bg-gray-600 text-white border-0"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white border-0"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MessageBubble;