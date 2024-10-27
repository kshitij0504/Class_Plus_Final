import React, { useState } from "react";
import { MoreVertical, Trash, Check } from "lucide-react";
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

  const isOwner = message.userId === currentUser.id;
  const messageAge = Date.now() - new Date(message.createdAt).getTime();
  const canDeleteForEveryone = isOwner && messageAge < 60 * 60 * 1000; // 1 hour limit

  const handleDeleteClick = (type) => {
    setDeleteType(type);
    setShowDeleteDialog(true);
  };

  const handleDelete = async () => {
    if (isDeleting) return;

    try {
      setIsDeleting(true);

      const endpoint =
        deleteType === "everyone"
          ? `http://localhost:8000/api/${message.id}/deleteForEveryone`
          : `http://localhost:8000/api/${message.id}/deleteForSelf`;

      const response = await fetch(endpoint, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete message");
      }

      onDelete(message.id);
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting message:", error);
      // You could add toast notification here for error feedback
    } finally {
      setIsDeleting(false);
    }
  };

  const messageContent = message.isDeletedForEveryone ? (
    <span className="italic text-gray-400">This message was deleted</span>
  ) : (
    message.content
  );

  return (
    <>
      <div
        className={`relative group flex items-start gap-2 mb-4 p-2 rounded-lg transition-colors
          ${isOwner ? "flex-row-reverse" : ""}
          ${selectionMode ? "cursor-pointer hover:bg-gray-800/30" : ""}
          ${isSelected ? "bg-gray-800/50" : ""}`}
        onClick={() => selectionMode && onSelect(message.id)}
      >
        {/* Avatar/Selection Circle */}
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
            {selectionMode ? (
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${
                  isSelected ? "border-blue-500 bg-blue-500" : "border-gray-400"
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center overflow-hidden">
                {message.user.avatar ? (
                  <img
                    src={message.user.avatar}
                    alt={`${message.user.username}'s avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium">
                    {message.user?.username?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Message Content */}
        <div className={`flex-1 max-w-[80%] ${isOwner ? "text-right" : ""}`}>
          <div
            className={`inline-block p-3 rounded-lg text-sm
            ${isOwner ? "bg-blue-600" : "bg-gray-700"}`}
          >
            <div className="font-medium text-xs text-gray-300 mb-1">
              {message.user?.username}
            </div>
            {messageContent}
            <div className="text-xs text-gray-400 mt-1">
              {new Date(message.createdAt).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Delete Options Dropdown */}
        {!selectionMode && !message.isDeletedForEveryone && isOwner && (
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => handleDeleteClick("self")}>
                  <Trash className="w-4 h-4 mr-2" />
                  Delete for me
                </DropdownMenuItem>
                {canDeleteForEveryone && (
                  <DropdownMenuItem
                    onClick={() => handleDeleteClick("everyone")}
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gray-800 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {deleteType === "everyone"
                ? "This message will be deleted for everyone in the chat. This action cannot be undone."
                : "This message will be deleted for you only. Other chat members will still be able to see it."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-gray-700 text-white hover:bg-gray-600"
              disabled={isDeleting}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
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
