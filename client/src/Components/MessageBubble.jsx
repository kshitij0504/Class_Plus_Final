import React from "react";
import { Avatar } from "flowbite-react";

const MessageBubble = ({ message, currentUser }) => {
  const isOwnMessage = message.userId === currentUser.id;

  const messageClass = isOwnMessage
    ? "bg-blue-600 text-white self-end"
    : "bg-gray-700 text-gray-100 self-start";

  return (
    <div className={`flex items-start mb-4 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      {!isOwnMessage && (
        <Avatar
          img={message.user.avatar || "https://via.placeholder.com/150"}
          rounded
          size="sm"
        />
      )}
      <div className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg ml-2 ${messageClass}`}>
        <p className="text-sm font-semibold">{message.user.username}</p>
        <p className="mt-1">{message.content}</p>
        <span className="text-xs text-gray-400 mt-1 block text-right">
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      {isOwnMessage && (
        <Avatar
          img={currentUser.avatar || "https://via.placeholder.com/150"}
          rounded
          size="sm"
        />
      )}
    </div>
  );
};

export default MessageBubble;
