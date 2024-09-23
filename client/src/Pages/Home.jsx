import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import Header from "../Components/Header";
import { SiGooglemeet } from "react-icons/si";
import { AiFillSchedule } from "react-icons/ai";
import { TbClockCheck } from "react-icons/tb";
import { motion } from "framer-motion";

const quotes = [
  "The only way to do great work is to love what you do.",
  "Success usually comes to those who are too busy to be looking for it.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream bigger. Do bigger.",
  "Don't watch the clock; do what it does. Keep going.",
];

const Home = () => {
  const { currentUser } = useSelector((state) => state.user || {});
  const now = new Date();
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const date = new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(
    now
  );

  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem("notifications");
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  });

  const dailyQuote = quotes[Math.floor(Math.random() * quotes.length)];

  useEffect(() => {
    if (!currentUser || !currentUser.id) return;

    const socket = io("http://localhost:8000", {
      withCredentials: true,
    });

    socket.on("connect", () => {
      console.log("Connected to server");
    });

    socket.on(`notification_${currentUser.id}`, (notification) => {
      setNotifications((prevNotifications) => {
        const updatedNotifications = [...prevNotifications, notification];

        localStorage.setItem(
          "notifications",
          JSON.stringify(updatedNotifications)
        );

        return updatedNotifications;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUser.id]);

  return (
    <section className="flex flex-col gap-5 p-4 text-white mt-0">
      <Header />

      {/* Time and Date Section with Image Background */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="h-[250px] md:h-[300px] w-full rounded-[20px] bg-hero bg-cover bg-center flex flex-col justify-between p-4 md:p-8 shadow-lg"
        style={{
          backgroundImage: `url('/src/assets/hero-background.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="flex flex-col gap-2 p-2 md:p-4 rounded-lg">
          <h1 className="text-3xl font-extrabold md:text-5xl">{time}</h1>
          <p className="text-base font-medium text-white/80 md:text-lg">
            {date}
          </p>
          <h2 className="text-2xl md:text-3xl font-semibold mb-1 md:mb-2">
            Welcome, {currentUser.username || "User"}!
          </h2>
          <p className="text-sm md:text-lg italic text-white/90">
            {dailyQuote}
          </p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-4">
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-blue-500 to-teal-500 p-4 md:p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-4 flex items-center gap-2 text-white">
            <SiGooglemeet /> Upcoming Meetings
          </h3>
          <ul className="space-y-1 md:space-y-2 text-white/90">
            <li className="p-2 md:p-3 rounded-md bg-white/10">
              Meeting 1 - 12:30 PM
            </li>
            <li className="p-2 md:p-3 rounded-md bg-white/10">
              Meeting 2 - 2:00 PM
            </li>
            <li className="p-2 md:p-3 rounded-md bg-white/10">
              Meeting 3 - 4:15 PM
            </li>
          </ul>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-yellow-400 to-orange-500 p-4 md:p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-4 flex items-center gap-2 text-black">
            <AiFillSchedule /> Daily Schedule
          </h3>
          <ul className="space-y-1 md:space-y-2 text-black/80">
            <li className="p-2 md:p-3 rounded-md bg-white/20">
              Task 1 - 10:00 AM
            </li>
            <li className="p-2 md:p-3 rounded-md bg-white/20">
              Task 2 - 11:30 AM
            </li>
            <li className="p-2 md:p-3 rounded-md bg-white/20">
              Task 3 - 1:00 PM
            </li>
          </ul>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-green-400 to-emerald-500 p-4 md:p-6 rounded-xl shadow-lg"
        >
          <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-4 flex items-center gap-2 text-black">
            <TbClockCheck /> Recent Activity
          </h3>
          <ul className="space-y-1 md:space-y-2 text-black/80">
            {notifications.length > 0 ? (
              notifications.map((notification, index) => (
                <li key={index} className="p-2 md:p-3 rounded-md bg-white/20">
                  {notification.message}
                </li>
              ))
            ) : (
              <li className="p-2 md:p-3 rounded-md bg-white/20">
                No recent activity
              </li>
            )}
          </ul>
        </motion.div>
      </div>
    </section>
  );
};

export default Home;
