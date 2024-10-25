import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, TextInput, Spinner, Avatar } from "flowbite-react";
import {
  Send,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Paperclip,
  ArrowLeft,
} from "lucide-react";
import { io } from "socket.io-client";
import EmojiPicker from "emoji-picker-react";
import axios from "axios";
import MessageBubble from "../../Components/MessageBubble";

const ModernChat = () => {
  const { currentUser, token } = useSelector((state) => ({
    currentUser: state.user.currentUser,
    token: state.user.token,
  }));

  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const fetchGroupAndMessages = async () => {
      try {
        const groupResponse = await axios.get(`http://localhost:8000/api/groups/${id}`, {
          withCredentials: true,
        });
        setGroup(groupResponse.data.data);

        const messagesResponse = await axios.get(`http://localhost:8000/api/${id}/getmessage`, {
          withCredentials: true,
        });
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
      auth: { token: token },
    });
    console.log(id)

    socketRef.current.emit("joinChat", id);

    socketRef.current.on("messageReceived", (newMessage) => {
      setMessages(prev => [...prev, newMessage]);
    });

    return () => {
      socketRef.current.emit("leaveChat", id);
      socketRef.current.disconnect();
    };
  }, [id, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      socketRef.current.emit("sendMessage", {
        groupId: id,
        content: newMessage
      });
      
      await axios.post(
        `http://localhost:8000/api/${id}/messages`,
        { content: newMessage },
        { withCredentials: true }
      );
      setNewMessage("");
      setShowEmojiPicker(false);
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

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <Spinner size="xl" className="text-blue-500" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Group not found</h2>
          <p className="text-gray-400">It seems this group doesn't exist or has been deleted.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans p-4">
      {/* Header */}
      <header className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-white hover:text-gray-300 bg-blue-600"
            aria-label="Back to Group"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{group.name}</h1>
            <p className="text-sm text-gray-400">{group.members.length} members</p>
          </div>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900 rounded-lg my-4 custom-scrollbar">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageBubble key={message.id} message={message} currentUser={currentUser} />
          ))
        ) : (
          <p className="text-center text-gray-400">No messages yet. Start the conversation!</p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Area */}
      <div className="bg-gray-800 p-4 rounded-lg shadow-md flex items-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className="text-white hover:text-gray-300 bg-blue-600"
          aria-label="Toggle Emoji Picker"
        >
          <Smile className="h-6 w-6" />
        </Button>
        <TextInput
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 text-white placeholder-gray-400 rounded-full px-4 py-2 mx-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <Button
          onClick={handleSendMessage}
          className="bg-blue-600 text-white rounded-full p-2"
          aria-label="Send Message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      
      {showEmojiPicker && (
        <div className="absolute bottom-16 right-4 z-10 bg-gray-900 border border-gray-700 rounded-lg p-2 shadow-lg">
          <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
        </div>
      )}
    </div>
  );
};

export default ModernChat;
