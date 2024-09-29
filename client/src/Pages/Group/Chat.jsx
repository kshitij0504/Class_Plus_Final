import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom"; // Added useNavigate
import { useSelector } from "react-redux";
import { Button, TextInput, Spinner, Avatar } from "flowbite-react";
import { Send, Smile, MoreVertical, Phone, Video, Paperclip, ArrowLeft } from "lucide-react"; // Added ArrowLeft
import { io } from "socket.io-client";
import EmojiPicker from "emoji-picker-react";
import axios from "axios";
import MessageBubble from "../../Components/MessageBubble";

const ModernChat = () => {
  const { currentUser } = useSelector((state) => state.user || {});
  const { id } = useParams();
  const navigate = useNavigate(); // Initialize useNavigate
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  const handleEmojiClick = (emojiObject) => {
    setNewMessage((prevInput) => prevInput + emojiObject.emoji);
  };

  useEffect(() => {
    const fetchGroupAndMessages = async () => {
      try {
        const groupResponse = await axios.get(
          `http://localhost:8000/api/groups/${id}`,
          { headers: { Authorization: `Bearer ${currentUser.token}` } }
        );
        setGroup(groupResponse.data.data);

        const messagesResponse = await axios.get(
          `http://localhost:8000/api/${id}/getmessage`,
          { withCredentials: true }
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
      auth: { token: currentUser.token },
    });

    socketRef.current.emit("joinGroup", id);

    socketRef.current.on("newMessage", (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
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
    navigate(-1); // Navigate back to the previous page (group page)
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
    <div className="flex flex-col h-screen bg-gray-900 text-white font-sans px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 to-blue-800 p-4 flex items-center justify-between shadow-lg rounded-lg">
        <div className="flex items-center space-x-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-white hover:text-gray-300"
            aria-label="Back to Group"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          {/* Group Avatar and Info */}
          <Avatar
            src={group.avatar || "/api/placeholder/40/40"}
            alt={group.name}
            className="w-10 h-10 rounded-full"
          />
          <div>
            <h1 className="text-xl font-semibold text-white">{group.name}</h1>
            <p className="text-sm text-gray-400">{group.members.length} members</p>
          </div>
        </div>
        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-white hover:text-gray-300">
            <MoreVertical className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-900 custom-scrollbar rounded-lg my-4">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUser={currentUser}
              // Customize message bubble with sent/received styles
            />
          ))
        ) : (
          <p className="text-center text-gray-400">
            No messages yet. Start the conversation!
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="bg-gray-800 p-4 rounded-lg relative">
        <div className="flex items-center space-x-2">
          {/* Emoji Picker Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="text-white hover:text-gray-300"
            aria-label="Toggle Emoji Picker"
          >
            <Smile className="h-6 w-6" />
          </Button>
          {/* Attachment Button */}
          <Button variant="ghost" size="icon" className="text-white hover:text-gray-300" aria-label="Attach File">
            <Paperclip className="h-6 w-6" />
          </Button>
          {/* Message Input */}
          <TextInput
            type="text"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 bg-gray-700 text-white placeholder-gray-400 rounded-full px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {/* Send Button */}
          <Button
            onClick={handleSendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2"
            aria-label="Send Message"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-16 right-4 z-10 bg-gray-900 border border-gray-700 rounded-lg p-2 shadow-lg">
            <EmojiPicker onEmojiClick={handleEmojiClick} theme="dark" />
          </div>
        )}
      </div>
    </div>
  );
};

export default ModernChat;
