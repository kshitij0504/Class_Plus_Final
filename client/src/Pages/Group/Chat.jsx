// src/pages/Chat.js
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, TextInput, Spinner, Avatar } from "flowbite-react";
import { FaPaperPlane } from "react-icons/fa";
import { io } from "socket.io-client";
import axios from "axios";
import MessageBubble from "../../Components/MessageBubble"; 

const Chat = () => {
  const { currentUser } = useSelector((state) => state.user || {});
  const { id } = useParams(); 
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const socketRef = useRef();

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchGroupAndMessages = async () => {
      try {
        const groupResponse = await axios.get(
          `http://localhost:8000/api/groups/${id}`,
          {
            headers: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          }
        );
        setGroup(groupResponse.data.data);

        const messagesResponse = await axios.get(
          `http://localhost:8000/api/${id}/getmessage`,
          {
            withCredentials: true,
          }
        );
        setMessages(messagesResponse.data.data);
      } catch (error) {
        console.error("Error fetching group details or messages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupAndMessages();
  }, [id, currentUser]);

  useEffect(() => {
    socketRef.current = io("http://localhost:8000", {
      auth: {
        token: currentUser.token, 
      },
    });

    socketRef.current.emit("joinGroup", id);

    socketRef.current.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socketRef.current.on("memberJoined", (data) => {
      console.log(`${data.username} has joined the group.`);
    });

    socketRef.current.on("memberLeft", (data) => {
      console.log(`${data.username} has left the group.`);
    });

    return () => {
      socketRef.current.emit("leaveGroup", id);
      socketRef.current.disconnect();
    };
  }, [id, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
       await axios.post(
        `http://localhost:8000/api/${id}/messages`,
        { content: newMessage },
        {
          withCredentials: true,
        }
      );

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-900 to-gray-800 text-white">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-900 to-gray-800 text-white">
        Group not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white font-poppins">
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 shadow-lg">
        <h1 className="text-3xl font-bold">{group.name} - Chat</h1>
      </header>

      <div className="flex flex-1 p-4 lg:p-8">
        <div className="flex flex-col w-full bg-gray-800 rounded-2xl shadow-xl p-6">
          <div className="flex-1 overflow-y-auto mb-4 scrollbar-hide">
            {messages.length > 0 ? (
              messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  message={message}
                  currentUser={currentUser}
                />
              ))
            ) : (
              <p className="text-center text-gray-400">
                No messages yet. Start the conversation!
              </p>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex items-center space-x-4">
            <TextInput
              type="text"
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              required
            />
            <Button
              onClick={handleSendMessage}
              className="flex items-center justify-center"
            >
              <FaPaperPlane />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
