import React, { useState, useEffect, useRef, useCallback } from "react";
import { io } from "socket.io-client";
import {
  Search,
  Send,
  Users,
  UserPlus,
  Menu,
  ArrowLeft,
  MessageCircle,
  Clock,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar } from "flowbite-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSelector } from "react-redux";
import axios from "axios";

const ChatInterface = () => {
  const { currentUser, token } = useSelector((state) => ({
    currentUser: state.user.currentUser,
    token: state.user.token,
  }));
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [chatRoomId, setChatRoomId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    checkAuthentication();
  }, [token]);

  useEffect(() => {
    if (token && !socket) {
      const newSocket = io("http://localhost:8000/onetoone", {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        transports: ["websocket"],
      });

      // Socket connection handlers
      newSocket.on("connect", () => {
        console.log("Socket connected");
        setSocketConnected(true);
        setError(null);
      });

      newSocket.on("disconnect", () => {
        console.log("Socket disconnected");
        setSocketConnected(false);
        setError("Connection lost. Reconnecting...");
      });

      newSocket.on("connect_error", (error) => {
        console.error("Socket connection error:", error);
        setSocketConnected(false);
        setError("Connection error. Retrying...");
      });

      // Message handlers
      newSocket.on("new_message", (message) => {
        setMessages((prevMessages) => {
          // Check for duplicate messages
          const isDuplicate = prevMessages.some(
            (m) =>
              m.sentAt === message.sentAt &&
              m.senderId === message.senderId &&
              m.content === message.content
          );
          if (isDuplicate) return prevMessages;
          return [...prevMessages, message];
        });
        scrollToBottom();
      });

      // Typing indicators
      newSocket.on("typing", ({ userId }) => {
        setTypingUsers((prev) => new Set([...prev, userId]));
      });

      newSocket.on("stop_typing", ({ userId }) => {
        setTypingUsers((prev) => {
          const newSet = new Set(prev);
          newSet.delete(userId);
          return newSet;
        });
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.off("connect");
          newSocket.off("disconnect");
          newSocket.off("new_message");
          newSocket.off("typing");
          newSocket.off("stop_typing");
          newSocket.close();
        }
      };
    }
  }, [token]);

  // Handle room joining
  useEffect(() => {
    if (socket && socket.connected && chatRoomId) {
      // Leave previous room
      socket.emit("leave_room", chatRoomId);

      // Join new room
      socket.emit("join_room", chatRoomId);

      // Fetch initial messages
      fetchMessages(chatRoomId);

      return () => {
        socket.emit("leave_room", chatRoomId);
      };
    }
  }, [socket, chatRoomId, socketConnected]);

  const handleTyping = useCallback(() => {
    if (!socket || !chatRoomId) return;

    socket.emit("typing", { chatRoomId });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { chatRoomId });
    }, 1000);
  }, [socket, chatRoomId]);

  const checkAuthentication = () => {
    if (!token) {
      setIsAuthenticated(false);
      setError("Please log in to access the chat");
      return false;
    }
    setIsAuthenticated(true);
    return true;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchFriends();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchFriends = async () => {
    if (!checkAuthentication()) return;

    try {
      const response = await axios.get("http://localhost:8000/api/friends", {
        withCredentials: true,
      });
      console.log(response.data);
      setFriends(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        setError("Session expired. Please log in again");
      } else {
        setError("Failed to fetch friends list");
      }
    }
  };

  const searchUsers = async (query) => {
    if (!checkAuthentication()) return;
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8000/api/search`, {
        withCredentials: true,
        params: { username: query },
      });
      setSearchResults(response.data);
    } catch (error) {
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        setError("Session expired. Please log in again");
      } else {
        setError("Error searching for users");
      }
    }
  };

  const handleSearchInput = (value) => {
    setSearchQuery(value);
    if (searchTimeout) clearTimeout(searchTimeout);

    setSearchTimeout(
      setTimeout(() => {
        searchUsers(value);
      }, 500)
    );
  };

  const addFriend = async (friendId) => {
    if (!checkAuthentication()) return;

    try {
      await axios.post(
        "http://localhost:8000/api/friendship",
        { friendId },
        {
          withCredentials: true,
        }
      );
      setSuccess("Friend added successfully!");
      fetchFriends();
      setSearchResults((prev) => prev.filter((user) => user.id !== friendId));
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        setError("Session expired. Please log in again");
      } else {
        setError(error.response?.data.error || "Failed to add friend");
      }
      setTimeout(() => setError(null), 3000);
    }
  };

  const startChat = async (friendId) => {
    if (!checkAuthentication()) return;

    try {
      const response = await axios.post(
        "http://localhost:8000/api/start-chat",
        { friendId },
        {
          withCredentials: true,
        }
      );
      setChatRoomId(response.data.id);
      fetchMessages(response.data.id);
    } catch (error) {
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        setError("Session expired. Please log in again");
      } else {
        setError("Error starting chat");
      }
    }
  };

  const fetchMessages = async (chatRoomId) => {
    if (!checkAuthentication()) return;

    setLoading(true); // Start loading when fetching messages

    try {
      const response = await axios.get(
        `http://localhost:8000/api/chatroom/${chatRoomId}/tempmessages`,
        { withCredentials: true }
      );

      if (response.data && Array.isArray(response.data)) {
        setMessages(response.data); // Set messages if response is an array
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setIsAuthenticated(false);
        setError("Session expired. Please log in again");
      } else if (error.response?.status === 404) {
        setError("No messages found in this chat room.");
      } else {
        setError("Error fetching messages");
      }
    } finally {
      setLoading(false); // Stop loading when done
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!socket || !chatRoomId || !newMessage.trim() || !socketConnected)
      return;

    const messageData = {
      chatRoomId,
      content: newMessage,
      senderId: currentUser.id,
      sentAt: new Date().toISOString(),
    };

    try {
      // Optimistically add message to UI
      setMessages((prev) => [...prev, messageData]);

      // Emit through socket
      socket.emit("send_message", messageData);

      // Save to database
      await axios.post("http://localhost:8000/api/send-message", messageData, {
        withCredentials: true,
      });

      setNewMessage("");
      socket.emit("stop_typing", { chatRoomId });
    } catch (error) {
      setError("Failed to send message");
      // Remove optimistically added message on error
      setMessages((prev) => prev.filter((msg) => msg !== messageData));
    }
  };

  useEffect(() => {
    if (chatRoomId) {
      fetchMessages(chatRoomId); // Fetch messages when component mounts or chatRoomId changes
    }
  }, [chatRoomId]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };
  // If not authenticated, show error state
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <Card className="w-[90%] max-w-[400px] mx-4">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">
                Authentication Required
              </h3>
              <p className="text-gray-500">
                {error || "Please log in to access the chat"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderMessage = (message, index, messages) => {
    const isFirstInGroup =
      index === 0 || messages[index - 1].senderId !== message.senderId;
    const isLastInGroup =
      index === messages.length - 1 ||
      messages[index + 1].senderId !== message.senderId;

    return (
      <div
        key={index}
        className={`
          ${!isFirstInGroup ? "mt-1" : "mt-6"}
          ${
            message.senderId === currentUser.id
              ? "flex-row-reverse"
              : "flex-row"
          }
          flex items-end gap-2
        `}
      >
        {isLastInGroup && (
          <Avatar
            img={
              message.senderId === currentUser.id
                ? currentUser.avatar
                : selectedFriend.avatar
            }
            alt=""
            rounded
            className="w-8 h-8"
          />
        )}
        {!isLastInGroup && <div className="w-8" />}
        <div
          className={`
            max-w-[70%] p-3 shadow-lg
            ${
              message.senderId === currentUser.id
                ? "bg-blue-600 text-white rounded-2xl rounded-br-none shadow-blue-500/20"
                : "bg-gray-700/50 text-gray-200 rounded-2xl rounded-bl-none shadow-gray-700/20"
            }
            ${
              !isLastInGroup && message.senderId === currentUser.id
                ? "rounded-br-2xl mr-10"
                : ""
            }
            ${
              !isLastInGroup && message.senderId !== currentUser.id
                ? "rounded-bl-2xl ml-10"
                : ""
            }
          `}
        >
          <p className="text-sm">{message.content}</p>
          <div className="flex items-center justify-end mt-1 space-x-1">
            <span className="text-xs opacity-70">
              {formatMessageTime(message.sentAt)}
            </span>
            {message.senderId === currentUser.id && (
              <CheckCircle2 className="h-3 w-3 opacity-70" />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-900">
      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileMenu}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 text-gray-200"
      >
        {isMobileMenuOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Enhanced Sidebar with mobile responsiveness */}
      <div
        className={`
          fixed lg:relative w-80 bg-gray-800/95 border-r border-gray-700/80 backdrop-blur-sm
          transition-transform duration-300 ease-in-out z-40 h-full
          ${
            isMobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >
        <div className="p-4 h-full overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Messages
            </h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-blue-400 hover:bg-gray-700/70 transition-all duration-200"
                onClick={() => {
                  setView(view === "chat" ? "search" : "chat");
                  setIsMobileMenuOpen(false);
                }}
              >
                {view === "chat" ? (
                  <UserPlus className="h-5 w-5" />
                ) : (
                  <ArrowLeft className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>

          {/* Status Messages */}
          {error && (
            <Alert
              variant="destructive"
              className="mb-4 bg-red-500/10 border-red-500/20 backdrop-blur-sm"
            >
              <AlertDescription className="text-red-200">
                {error}
              </AlertDescription>
            </Alert>
          )}
          {success && (
            <Alert className="mb-4 bg-emerald-500/10 border-emerald-500/20 backdrop-blur-sm">
              <AlertDescription className="text-emerald-200">
                {success}
              </AlertDescription>
            </Alert>
          )}

          {/* Friends List / Search View */}
          {view === "chat" ? (
            <div className="space-y-2">
              {friends.length > 0 ? (
                friends.map((friend,index) => (
                  <div
                    key={friend.id}
                    onClick={() => {
                      setSelectedFriend(friend);
                      startChat(friend.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`
                        flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200
                        hover:scale-[1.02]
                        ${
                          selectedFriend?.id === friend.id
                            ? "bg-blue-600/20 border border-blue-500/30 shadow-lg shadow-blue-500/10"
                            : "hover:bg-gray-700/50 border border-transparent hover:border-gray-600/50"
                        }
                      `}
                  >
                    <div className="relative">
                      <Avatar img={friend.avatar} alt="" rounded />
                      <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
                    </div>
                    <div className="ml-3">
                      <p className="font-medium text-gray-200">
                        {friend.username}
                      </p>
                      <p className="text-xs text-gray-400">Online</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 px-4">
                  <div className="bg-gray-700/30 p-6 rounded-xl border border-gray-600/30">
                    <MessageCircle className="h-12 w-12 mx-auto text-blue-400 mb-4" />
                    <h3 className="font-medium text-gray-200 text-lg">
                      No conversations yet
                    </h3>
                    <p className="text-gray-400 mt-2 text-sm">
                      Start chatting by adding new friends
                    </p>
                    <Button
                      onClick={() => setView("search")}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Friends
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => handleSearchInput(e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600/50 text-gray-200 placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/20"
                />
                <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
              </div>

              <div className="space-y-2">
                {searchResults.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-700/30 border border-gray-600/30 hover:border-blue-500/30 transition-all duration-200"
                  >
                    <div className="flex items-center">
                      <Avatar img={user.avatar} alt="" rounded />
                      <p className="ml-3 font-medium text-gray-200">
                        {user.username}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                      onClick={() => addFriend(user.id)}
                    >
                      Add
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Chat Area */}
      <div className="flex-1 flex flex-col bg-gray-900">
        {selectedFriend ? (
          <>
            <div className="bg-gray-800/95 border-b border-gray-700/80 p-4 backdrop-blur-sm">
              <div className="flex items-center">
                <div className="relative">
                  <Avatar img={selectedFriend.avatar} alt="" rounded />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-800" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-gray-200">
                    {selectedFriend.username}
                  </h3>
                  {typingUsers.size > 0 ? (
                    <p className="text-sm text-blue-400 flex items-center">
                      <span className="mr-2">typing</span>
                      <span className="flex space-x-1">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" />
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-200" />
                      </span>
                    </p>
                  ) : (
                    <p className="text-sm text-gray-400">Active now</p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 text-blue-400 animate-spin" />
                </div>
              ) : messages.length > 0 ? (
                messages.map((message, index) =>
                  renderMessage(message, index, messages)
                )
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 mx-auto text-blue-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-300">
                      No messages yet
                    </h3>
                    <p className="text-gray-400 mt-2">
                      Start the conversation with {selectedFriend.username}
                    </p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="bg-gray-800/95 border-t border-gray-700/80 p-4 backdrop-blur-sm">
              <form onSubmit={sendMessage} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  className="flex-1 bg-gray-700/50 border-gray-600/50 text-gray-200 placeholder-gray-400 focus:border-blue-500/50 focus:ring-blue-500/20"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                  disabled={!newMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center max-w-md mx-auto">
              <div className="bg-gray-800/50 p-8 rounded-2xl border border-gray-700/50">
                <MessageCircle className="h-16 w-16 mx-auto text-blue-400 mb-6" />
                <h3 className="text-xl font-medium text-gray-200">
                  {friends.length > 0
                    ? "Select a friend to start chatting"
                    : "Welcome to Chat"}
                </h3>
                <p className="text-gray-400 mt-3">
                  {friends.length > 0
                    ? "Choose from your friends list to begin a conversation"
                    : "Add friends to start having amazing conversations"}
                </p>
                {friends.length === 0 && (
                  <Button
                    onClick={() => setView("search")}
                    className="mt-6 bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200 group"
                  >
                    <UserPlus className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
                    Find Friends
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Overlay for mobile menu */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
};

export default ChatInterface;
