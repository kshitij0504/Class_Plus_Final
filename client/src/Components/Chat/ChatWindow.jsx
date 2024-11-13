import React, { useState, useEffect } from "react";
import axios from "axios";
import MessageInput from "./MessageInput";

const ChatWindow = ({ chatRoomId, user, friend, socket }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false); // Optional: To handle loading state

  useEffect(() => {
    if (!chatRoomId) return;
  
    console.log('Fetching messages for chatRoomId:', chatRoomId); // Log the chatRoomId
  
    const fetchMessages = async () => {
      try {
        const data  = await axios.get(
          `http://localhost:8000/api/chatroom/${chatRoomId}/tempmessages`,
          { withCredentials: true }
        );
        setMessages(data);
      } catch (error) {
        console.error('Error fetching messages:', error.response || error.message);
      }
    };    
  
    fetchMessages();
  }, [chatRoomId]);
  // Only re-run when chatRoomId or socket changes

  const handleSendMessage = async (content) => {
    const message = { chatRoomId, senderId: user.id, content };
    await axios.post("/sendMessage", message);
    socket.emit("send_message", message); // Emit the message to the server
  };

  return (
    <div className="flex-1 flex flex-col bg-darkGrey">
      <header className="p-4 border-b border-gray-600">
        <h2 className="text-xl font-semibold">{friend.username}</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        {loading ? (
          <div>Loading messages...</div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-2 my-1 ${
                msg.senderId === user.id ? "text-right" : "text-left"
              }`}
            >
              <span
                className={`inline-block p-2 rounded-lg ${
                  msg.senderId === user.id
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-white"
                }`}
              >
                {msg.content}
              </span>
            </div>
          ))
        )}
      </div>
      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
};

export default ChatWindow;
