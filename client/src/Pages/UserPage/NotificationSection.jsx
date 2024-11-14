import React, { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import { Bell, MessageSquare, UserPlus, Users2, Bell as BellIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

// PopupNotification Component
const PopupNotification = ({ message, onClose }) => (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg max-w-md w-full mx-4">
      <p className="text-center font-semibold">{message}</p>
      <button
        onClick={onClose}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Dismiss
      </button>
    </div>
  </div>
);

const NotificationItem = ({ message, createdAt, read, type }) => {
  const date = new Date(createdAt);

  const getNotificationIcon = (type) => {
    const iconProps = { 
      className: "h-5 w-5",
      strokeWidth: 1.5 
    };

    switch (type) {
      case "message":
        return <MessageSquare {...iconProps} className="text-blue-500" />;
      case "connect":
        return <UserPlus {...iconProps} className="text-green-500" />;
      case "group":
        return <Users2 {...iconProps} className="text-red-500" />;
      default:
        return <Bell {...iconProps} className="text-gray-500" />;
    }
  };

  return (
    <div className={`p-4 ${!read ? 'bg-blue-50/50 dark:bg-blue-950/20' : ''} rounded-lg transition-colors`}>
      <div className="flex items-start gap-4">
        <div className="mt-1">
          {getNotificationIcon(type)}
        </div>
        <div className="flex-1 space-y-1">
          <p className="text-sm font-medium text-primary">
            {type ? type.charAt(0).toUpperCase() + type.slice(1) : "Unknown"}
          </p>
          <p className="text-sm text-muted-foreground">
            {message}
          </p>
          <p className="text-xs text-muted-foreground">
            {isNaN(date) ? "Invalid date" : `${formatDistanceToNow(date)} ago`}
          </p>
        </div>
      </div>
    </div>
  );
};

const NotificationSection = () => {
  const { currentUser, token } = useSelector((state) => ({
    currentUser: state.user.currentUser,
    token: state.user.token,
  }));
  const [userNotifications, setUserNotifications] = useState([]);
  const [groupNotifications, setGroupNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState("user");
  const [unreadCount, setUnreadCount] = useState({ user: 0, group: 0 });
  const [popupNotification, setPopupNotification] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      if (!currentUser?.id) return;

      try {
        const [userResponse, groupResponse] = await Promise.all([
          axios.get(`https://class-plus-final.onrender.com/api/notifications/${currentUser.id}`),
          axios.get(`https://class-plus-final.onrender.com/api/groupnotification/${currentUser.id}`)
        ]);

        if (userResponse.data?.notifications) {
          setUserNotifications(userResponse.data.notifications);
          setUnreadCount(prev => ({
            ...prev,
            user: userResponse.data.notifications.filter(n => !n.read).length
          }));
        }

        if (groupResponse.data?.notifications) {
          setGroupNotifications(groupResponse.data.notifications);
          setUnreadCount(prev => ({
            ...prev,
            group: groupResponse.data.notifications.filter(n => !n.read).length
          }));
        }
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser?.id) return;

    const socket = io("https://class-plus-final.onrender.com", {
      auth: { token: token },
    });

    socket.on("connect", () => console.log("Connected to server"));

    socket.on(`notification_${currentUser.id}`, (notification) => {
      if (!notification.id || !notification.type) return;

      if (notification.type === "group") {
        setGroupNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => ({ ...prev, group: prev.group + 1 }));
      } else {
        setUserNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => ({ ...prev, user: prev.user + 1 }));
      }

      // Show popup notification
      setPopupNotification(notification.message);
      setTimeout(() => setPopupNotification(null), 5000); // Hide after 5 seconds
    });

    socket.on("connect_error", (err) => console.error("Socket connection error:", err));

    return () => socket.disconnect();
  }, [currentUser?.id]);

  const markAllAsRead = () => {
    if (activeTab === "user") {
      setUserNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(prev => ({ ...prev, user: 0 }));
    } else {
      setGroupNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(prev => ({ ...prev, group: 0 }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-800 dark:bg-gray-900">
      {popupNotification && (
        <PopupNotification 
          message={popupNotification}
          onClose={() => setPopupNotification(null)}
        />
      )}

      <div className="sticky top-0 z-10 bg-gray-800 dark:bg-gray-950 border-b">
        <div className="container flex h-16 items-center px-4 md:px-6 lg:px-8">
          <BellIcon className="mr-2 h-6 w-6" />
          <h1 className="text-xl font-semibold">Notifications</h1>
        </div>
      </div>

      <main className="container mx-auto p-4 md:p-6 lg:p-8">
        <Card className="max-w-full md:max-w-4xl mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-xl md:text-2xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="user" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="user" className="relative">
                  User Notifications
                  {unreadCount.user > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount.user}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="group">
                  Group Notifications
                  {unreadCount.group > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      {unreadCount.group}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="flex justify-end mb-4">
                <Button variant="outline" size="sm" onClick={markAllAsRead}>
                  Mark all as read
                </Button>
              </div>

              <TabsContent value="user">
                <ScrollArea className="h-[400px] md:h-[500px] rounded-md border p-2 md:p-4">
                  <div className="space-y-4">
                    {userNotifications.map((notification, index) => (
                      <React.Fragment key={notification.id}>
                        <NotificationItem
                          message={notification.message}
                          createdAt={notification.createdAt}
                          read={notification.read}
                          type={notification.type}
                        />
                        {index < userNotifications.length - 1 && (
                          <Separator className="my-2" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="group">
                <ScrollArea className="h-[400px] md:h-[500px] rounded-md border p-2 md:p-4">
                  <div className="space-y-4">
                    {groupNotifications.map((notification, index) => (
                      <React.Fragment key={notification.id}>
                        <NotificationItem
                          message={notification.message}
                          createdAt={notification.createdAt}
                          read={notification.read}
                          type={notification.type}
                        />
                        {index < groupNotifications.length - 1 && (
                          <Separator className="my-2" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default NotificationSection;
