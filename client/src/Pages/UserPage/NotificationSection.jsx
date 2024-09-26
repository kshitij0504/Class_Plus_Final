import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import {
  FiMessageCircle,
  FiUserPlus,
  FiAlertCircle,
} from "react-icons/fi";

const Notification = ({ message, createdAt, read, type }) => {
  const date = new Date(createdAt);

  const getNotificationIcon = (type) => {
    switch (type) {
      case "message":
        return <FiMessageCircle className="text-blue-400" />;
      case "connect":
        return <FiUserPlus className="text-green-400" />;
      case "comment":
        return <FiAlertCircle className="text-purple-400" />;
      default:
        return <FiAlertCircle className="text-gray-400" />;
    }
  };

  const getNotificationLabel = (type) => {
    switch (type) {
      case "message":
        return "Message";
      case "connect":
        return "Connect";
      case "comment":
        return "Comment";
      default:
        return "Notification";
    }
  };

  return (
    <div
      className={`flex items-start p-4 mb-2 rounded-lg shadow-md transition-all duration-200  bg-white hover:bg-gray-600 hover:shadow-lg`}
    >
      <div className="mr-4">{getNotificationIcon(type)}</div>
      <div className="flex-grow">
        <div className="flex justify-between items-center">
          <p className="text-sm text-black">{getNotificationLabel(type)}</p>
          <span className="text-xs text-black">
            {isNaN(date) ? "Invalid date" : `${formatDistanceToNow(date)} ago`}
          </span>
        </div>
        <p className="text-black font-medium">{message}</p>
      </div>
    </div>
  );
};

const NotificationSection = () => {
  const { currentUser } = useSelector((state) => state.user || {});
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser || !currentUser.id) return;

      try {
        const response = await axios.get(
          `http://localhost:8000/api/notifications/${currentUser.id}`
        );

        const res = await axios.get(
          `http://localhost:8000/api/groupnotification/${currentUser.id}`
        )

        console.log(res)
        const data = response.data && res.data;

        if (Array.isArray(data.notifications)) {
          setNotifications(data.notifications);
        } else {
          console.error("Notifications response is not an array:", data);
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [currentUser.id]);

  useEffect(() => {
    if (!currentUser || !currentUser.id) return;

    const socket = io("http://localhost:8000", {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on(`notification_${currentUser.id}`, (notification) => {
      setNotifications((prevNotifications) => [
        notification,
        ...prevNotifications,
      ]); // Add new notification to the top
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser.id]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-900">
      <header className="bg-gray-800 text-white py-4 shadow-md">
        <h1 className="text-4xl font-bold text-center">Notifications</h1>
      </header>
      <main className="flex-grow flex flex-col items-center p-4">
        <div className="w-full max-w-lg h-full overflow-y-auto scrollbar-hide relative">
          {Array.isArray(notifications) && notifications.length > 0 ? (
            notifications.map((notification) => (
              <Notification
                key={notification.id}
                message={notification.message}
                createdAt={notification.createdAt}
                read={notification.read}
                type={notification.type}
              />
            ))
          ) : (
            <p className="p-4 text-center text-gray-400">No notifications</p>
          )}
        </div>
      </main>
      <footer className="bg-gray-800 text-gray-400 text-center py-4 w-full">
        <div className="flex justify-center items-center">
          <p className="text-sm">© 2024 Your Company. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default NotificationSection;
