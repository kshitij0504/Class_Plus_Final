import React, { useState } from "react";
import { Avatar } from "flowbite-react";
import moment from "moment";

const MessageBubble = ({ message, currentUser, showReadStatus }) => {
  const [showUserDetails, setShowUserDetails] = useState(false);
  const isOwnMessage = message.userId === currentUser.id;

  const handleToggleUserDetails = () => {
    setShowUserDetails(!showUserDetails);
  };

  const messageClass = isOwnMessage
    ? "bg-blue-600 text-white self-end"
    : "bg-gray-700 text-gray-100 self-start";

  return (
    <div className={`flex items-start mb-4 ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      {/* Avatar for the sender (other users) */}
      {!isOwnMessage && (
        <div className="relative">
          <Avatar
            img={message.user.avatar || "https://via.placeholder.com/150"}
            rounded
            size="sm"
            className="cursor-pointer hover:opacity-90 transition-opacity duration-200 ease-in-out"
            onClick={handleToggleUserDetails}
          />
          {showUserDetails && (
            <div className="absolute left-0 mt-2 w-48 p-4 bg-gray-800 text-white rounded-lg shadow-lg z-10 transition-transform duration-200 ease-in-out transform scale-95 origin-top-left">
              <p className="font-bold">{message.user.username}</p>
              <p className="text-sm">{message.user.email}</p>
              <p className="text-xs mt-1">{`Joined on: ${new Date(
                message.user.joinedAt
              ).toLocaleDateString()}`}</p>
            </div>
          )}
        </div>
      )}

      {/* Message Bubble */}
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-lg shadow-lg relative ${
          isOwnMessage ? "ml-2" : "mr-2"
        } ${messageClass}`}
      >
        {/* User name (if it's not the current user) */}
        {!isOwnMessage && (
          <p className="text-sm font-semibold">{message.user.username}</p>
        )}

        {/* Message content */}
        <p className="mt-1">{message.content}</p>

        {/* Timestamp and Read Status */}
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-400">
            {moment(message.createdAt).fromNow()}
          </span>

          {/* Read status (check marks) for own messages */}
          {isOwnMessage && showReadStatus && (
            <span className="text-xs text-gray-400 ml-2">
              {message.isRead ? (
                <span className="text-blue-400">&#10003;&#10003;</span> // Two check marks for read
              ) : (
                <span className="text-gray-400">&#10003;</span> // One check mark for sent
              )}
            </span>
          )}
        </div>
      </div>

      {/* Avatar for the current user (own message) */}
      {isOwnMessage && (
        <Avatar
          img={currentUser.avatar || "https://via.placeholder.com/150"}
          rounded
          size="sm"
          className="ml-2"
        />
      )}
    </div>
  );
};

export default MessageBubble;
