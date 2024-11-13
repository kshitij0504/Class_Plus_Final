import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import axios from "axios";
import Header from "../Components/Header";
import { SiGooglemeet } from "react-icons/si";
import { AiFillSchedule } from "react-icons/ai";
import { TbClockCheck } from "react-icons/tb";
import { BsKanban } from "react-icons/bs";
import Calendar from "@/Components/home/calendar";

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
  const date = new Intl.DateTimeFormat("en-US", { dateStyle: "full" }).format(now);

  const [notifications, setNotifications] = useState(() => {
    const savedNotifications = localStorage.getItem("notifications");
    return savedNotifications ? JSON.parse(savedNotifications) : [];
  });
  const [selectedDate, setSelectedDate] = useState(null);
  const [events, setEvents] = useState([]);
  const [upcomingSessions, setUpcomingSessions] = useState([]);
  const dailyQuote = quotes[Math.floor(Math.random() * quotes.length)];

  useEffect(() => {
    if (!currentUser?.id) return;

    const fetchUpcomingSessions = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:8000/api/users/me/top-sessions",
          { withCredentials: true }
        );
        setUpcomingSessions(data?.data || []);
      } catch (error) {
        console.error("Error fetching upcoming sessions:", error);
        setUpcomingSessions([]);
      }
    };

    fetchUpcomingSessions();
  }, [currentUser?.id]);

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const dateEvents = upcomingSessions.filter(
      (session) => new Date(session.startTime).toDateString() === date.toDateString()
    );
    setEvents(dateEvents);
  };

  const DashboardCard = ({ title, icon: Icon, gradient, items, textColor = "text-white" }) => (
    <div
      className={`rounded-xl font-poppins p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${gradient}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className={`text-lg sm:text-xl font-bold flex items-center gap-2 ${textColor}`}>
          <Icon className="text-xl sm:text-2xl" />
          {title}
        </h3>
      </div>
      <ul className="space-y-2">
        {items.length > 0 ? (
          items.map((item, index) => (
            <li
              key={index}
              className={`p-2 sm:p-3 rounded-lg ${
                textColor === "text-white" ? "bg-white/10" : "bg-black/5"
              } backdrop-blur-sm transition-colors duration-200 hover:bg-opacity-20 text-sm sm:text-base`}
            >
              {item}
            </li>
          ))
        ) : (
          <li
            className={`p-2 sm:p-3 rounded-lg ${
              textColor === "text-white" ? "bg-white/10" : "bg-black/5"
            } text-sm sm:text-base`}
          >
            No items to display
          </li>
        )}
      </ul>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white font-poppins">
      <Header />
      
      <main className="container mx-auto px-4 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Hero Section */}
        <div className="relative rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 overflow-hidden">
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative p-4 sm:p-8 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">{time}</h1>
                <p className="text-base sm:text-xl text-white/80 mt-1 sm:mt-2">{date}</p>
              </div>
              <div className="text-left sm:text-right w-full sm:w-auto">
                <h2 className="text-2xl sm:text-3xl font-semibold">
                  Welcome, {currentUser.username || "User"}!
                </h2>
                <p className="text-base sm:text-lg italic text-white/90 mt-1 sm:mt-2 max-w-lg">
                  {dailyQuote}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <DashboardCard
              title="Meetings"
              icon={SiGooglemeet}
              gradient="bg-gradient-to-br from-blue-500 to-teal-500"
              items={[
                "Team Sync - 12:30 PM",
                "Client Meeting - 2:00 PM"
              ]}
            />
            <DashboardCard
              title="Schedule"
              icon={AiFillSchedule}
              gradient="bg-gradient-to-br from-amber-400 to-orange-500"
              items={upcomingSessions.slice(0, 2).map(session => 
                `${session.title} - ${new Date(session.startTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                })}`
              )}
              textColor="text-black"
            />
            <DashboardCard
              title="Activity"
              icon={TbClockCheck}
              gradient="bg-gradient-to-br from-green-400 to-emerald-500"
              items={notifications.slice(0, 2).map(n => n.message) || []}
              textColor="text-black"
            />
            <DashboardCard
              title="Tasks"
              icon={BsKanban}
              gradient="bg-gradient-to-br from-purple-500 to-pink-500"
              items={[
                "Complete Project Plan",
                "Review Deliverables"
              ]}
            />
          </div>
          
          <div className="bg-white/10 rounded-xl p-4 sm:p-6 backdrop-blur-sm">
            <Calendar
              events={upcomingSessions}
              onDateSelect={handleDateSelect}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;