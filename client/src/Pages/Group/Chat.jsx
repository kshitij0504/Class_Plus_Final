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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [selectedMessages, setSelectedMessages] = useState(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchGroupAndMessages = async () => {
      try {
        const groupResponse = await axios.get(
          `http://localhost:8000/api/groups/${id}`,
          {
            withCredentials: true,
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
    socketRef.current = io("http://localhost:8000/chat", {
      auth: { token: token },
    });

    socketRef.current.emit("joinChat", id);

    socketRef.current.on("messageReceived", (newMessage) => {
      setMessages((prev) => [...prev, newMessage]);
      // Clear typing indicator when message is received
      setTypingUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(newMessage.userId);
        return updated;
      });
    });

    socketRef.current.on("userTyping", ({ userId }) => {
      setTypingUsers((prev) => new Set([...prev, userId]));
    });

    socketRef.current.on("userStoppedTyping", ({ userId }) => {
      setTypingUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(userId);
        return updated;
      });
    });

    return () => {
      socketRef.current.emit("leaveChat", id);
      socketRef.current.disconnect();
    };
  }, [id, currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const emitTyping = () => {
    socketRef.current.emit("startTyping", id);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current.emit("stopTyping", id);
    }, 2000);
  };

  const handleMessageChange = (e) => {
    setNewMessage(e.target.value);
    emitTyping();
  };

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;

    try {
      socketRef.current.emit("sendMessage", {
        groupId: id,
        content: newMessage,
      });

      await axios.post(
        `http://localhost:8000/api/${id}/messages`,
        { content: newMessage },
        { withCredentials: true }
      );
      setNewMessage("");
      setShowEmojiPicker(false);
      socketRef.current.emit("stopTyping", id);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleEmojiClick = (emoji) => {
    setNewMessage((prevMessage) => prevMessage + emoji.emoji);
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

  const renderTypingIndicator = () => {
    console.log(group.members);
    const typingUsersArray = Array.from(typingUsers);
    if (typingUsersArray.length === 0 || !group) return null; // Added a check for group existence

    // Find the typing members in the group by matching userId
    const typingMembers = typingUsersArray
      .map((userId) => group.members.find((member) => member.id === userId))
      .filter((member) => member && member.id !== currentUser.id);

    if (typingMembers.length === 0) return null;

    const names = typingMembers.map((member) => member.username);
    console.log(names);
    let typingText = "";
    if (names.length === 1) {
      typingText = `${names[0]} is typing...`;
    } else if (names.length === 2) {
      typingText = `${names[0]} and ${names[1]} are typing...`;
    } else {
      typingText = "Several people are typing...";
    }

    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-800/50 backdrop-blur-sm w-fit">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-[bounce_1s_infinite_0ms]" />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-[bounce_1s_infinite_200ms]" />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-[bounce_1s_infinite_400ms]" />
        </div>
        <span className="text-sm text-gray-400 font-medium">{typingText}</span>
      </div>
    );
  };

  const toggleMessageSelection = (messageId) => {
    setSelectedMessages((prev) => {
      const newSelected = new Set(prev);
      if (newSelected.has(messageId)) {
        newSelected.delete(messageId);
      } else {
        newSelected.add(messageId);
      }
      return newSelected;
    });
  };

  const handleDeleteSelected = async (deleteType) => {
    const messageIds = Array.from(selectedMessages);

    try {
      const endpoint =
        deleteType === "everyone"
          ? "http://localhost:8000/api/message/deleteMultipleforeveryone"
          : "http://localhost:8000/api/message/deleteMultipleForSelf";

      const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messageIds }),
        credentials: "include",
      });

      if (response.ok) {
        // If deletion is successful, remove deleted messages from local state
        setMessages(prevMessages =>
          prevMessages.filter(message => !selectedMessages.has(message.id))
        );
      }

      // Clear selection after successful deletion
      setSelectedMessages(new Set());
      setSelectionMode(false);
    } catch (error) {
      console.error("Error deleting messages:", error);
    }
  };

  const handleSingleMessageDelete = (messageId) => {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
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
          <p className="text-gray-400">
            It seems this group doesn't exist or has been deleted.
          </p>
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
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold">{group.name}</h1>
            <p className="text-sm text-gray-400">
              {group.members.length} members
            </p>
          </div>
        </div>

        {/* Selection mode toggle */}
        {messages.length > 0 && (
          <div className="flex items-center gap-2">
            {selectionMode ? (
              <>
                <Button
                  variant="destructive"
                  onClick={() => setSelectionMode(false)}
                  className="text-sm"
                >
                  Cancel
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="default"
                      disabled={selectedMessages.size === 0}
                      className="text-sm"
                    >
                      Delete ({selectedMessages.size})
                    </Button>
                  </SheetTrigger>
                  <SheetContent
                    side="bottom"
                    className="bg-gray-800 text-white"
                  >
                    <SheetHeader>
                      <SheetTitle className="text-white">
                        Delete Messages
                      </SheetTitle>
                      <SheetDescription className="text-gray-400">
                        Choose how you want to delete the selected messages
                      </SheetDescription>
                    </SheetHeader>
                    <div className="flex flex-col gap-2 mt-4">
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteSelected("self")}
                        className="w-full"
                      >
                        Delete for me
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteSelected("everyone")}
                        className="w-full"
                      >
                        Delete for everyone
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <Button
                variant="ghost"
                onClick={() => setSelectionMode(true)}
                className="text-sm"
              >
                Select
              </Button>
            )}
          </div>
        )}
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-900 rounded-lg my-4 custom-scrollbar">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              currentUser={currentUser}
              isSelected={selectedMessages.has(message.id)}
              onSelect={() => toggleMessageSelection(message.id)}
              onDelete={() => handleSingleMessageDelete(message.id)}
              selectionMode={selectionMode}
            />
          ))
        ) : (
          <p className="text-center text-gray-400">
            No messages yet. Start the conversation!
          </p>
        )}
        <div ref={messagesEndRef} />
      </div>

      {renderTypingIndicator()}

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
          onChange={handleMessageChange}
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