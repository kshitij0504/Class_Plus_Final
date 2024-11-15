import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { 
  Users, Calendar, MessageSquare, Trash2, TrendingUp, 
  Book, Activity, Home, Settings, LogOut, PieChart,
  BarChart2, UserPlus, Group
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart as RePieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import axios from "axios";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [statistics, setStatistics] = useState({
    totalUsers: 0,
    totalGroups: 0,
    totalMeetings: 0,
    totalMessages: 0,
    activityData: [],
  });
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [activityLogs, setActivityLogs] = useState({
    recentMessages: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charts colors
  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD'];
  
  // Dummy data for additional charts
 // Format activity data for the chart
 const formatActivityData = (data) => {
  // Ensure we have some default data even if the API returns nothing
  if (!data || data.length === 0) {
    return Array.from({ length: 7 }, (_, i) => ({
      date: new Date(
        Date.now() - (6 - i) * 24 * 60 * 60 * 1000
      ).toLocaleDateString(),
      messages: 0,
      meetings: 0,
    }));
  }
  return data;
};

useEffect(() => {
  fetchDashboardData();
}, []);

const fetchDashboardData = async () => {
  try {
    const [
      statsResponse,
      usersResponse,
      groupsResponse,
      meetingsResponse,
      activityResponse,
    ] = await Promise.all([
      axios.get("https://class-plus-final.onrender.com/api/statistics", {
        withCredentials: true,
      }),
      axios.get("https://class-plus-final.onrender.com/api/users", { withCredentials: true }),
      axios.get("https://class-plus-final.onrender.com/api/groups", {
        withCredentials: true,
      }),
      axios.get("https://class-plus-final.onrender.com/api/meetings", {
        withCredentials: true,
      }),
      axios.get("https://class-plus-final.onrender.com/api/activity-logs", {
        withCredentials: true,
      }),
    ]);

    console.log(activityResponse);

    setStatistics({
      totalUsers: statsResponse.data?.totalUsers || 0,
      totalGroups: statsResponse.data?.totalGroups || 0,
      totalMeetings: statsResponse.data?.totalMeetings || 0,
      totalMessages: statsResponse.data?.totalMessages || 0,
      activityData: formatActivityData(statsResponse.data?.activityData),
    });

    setUsers(
      Array.isArray(usersResponse.data.data) ? usersResponse.data.data : []
    );
    setGroups(
      Array.isArray(groupsResponse.data.data) ? groupsResponse.data.data : []
    );
    setMeetings(
      Array.isArray(meetingsResponse.data) ? meetingsResponse.data : []
    );

    setActivityLogs({
      recentMessages: Array.isArray(activityResponse.data?.recentMessages)
        ? activityResponse.data.recentMessages
        : [],
    });

    setLoading(false);
  } catch (err) {
    setError(err.response?.data?.message || "Failed to fetch dashboard data");
    setLoading(false);
  }
};

const handleDeleteUser = async (userId) => {
  try {
    await axios.delete(`https://class-plus-final.onrender.com/api/users/${userId}`, {
      withCredentials: true,
    });
    setUsers(users.filter((user) => user.id !== userId));
  } catch (err) {
    setError(err.response?.data?.message || "Failed to delete user");
  }
};

const handleDeleteGroup = async (groupId) => {
  try {
    await axios.delete(`https://class-plus-final.onrender.com/api/groups/${groupId}`, {
      withCredentials: true,
    });
    setGroups(groups.filter((group) => group.id !== groupId));
  } catch (err) {
    setError(err.response?.data?.message || "Failed to delete group");
  }
};

const handleDeleteMeeting = async (meetingId) => {
  try {
    await axios.delete(`https://class-plus-final.onrender.com/api/meetings/${meetingId}`, {
      withCredentials: true,
    });
    setMeetings(meetings.filter((meeting) => meeting.id !== meetingId));
  } catch (err) {
    setError(err.response?.data?.message || "Failed to delete meeting");
  }
};
  // Format activity data for the chart
  // const formatActivityData = (data) => {
  //   if (!data || data.length === 0) {
  //     return Array.from({ length: 7 }, (_, i) => ({
  //       date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
  //       messages: 0,
  //       meetings: 0,
  //     }));
  //   }
  //   return data;
  // };

  // useEffect(() => {
  //   fetchDashboardData();
  // }, []);

  // ... (keep existing fetch and handle functions)

  const SidebarLink = ({ icon: Icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center space-x-3 w-full p-3 rounded-lg transition-all duration-200 ${
        active 
          ? 'bg-blue-500 text-white' 
          : 'text-gray-300 hover:bg-gray-700'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </button>
  );

  const MainContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-6">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Users}
                title="Total Users"
                value={statistics.totalUsers}
                increase="12%"
                color="blue"
              />
              <StatCard
                icon={Book}
                title="Active Groups"
                value={statistics.totalGroups}
                increase="8%"
                color="green"
              />
              <StatCard
                icon={Calendar}
                title="Total Meetings"
                value={statistics.totalMeetings}
                increase="15%"
                color="purple"
              />
              <StatCard
                icon={MessageSquare}
                title="Messages"
                value={statistics.totalMessages}
                increase="24%"
                color="yellow"
              />
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Activity Chart */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
                    Platform Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={statistics.activityData}>
                        <defs>
                          <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '0.375rem'
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="messages"
                          stroke="#FF6B6B"
                          fillOpacity={1}
                          fill="url(#colorMessages)"
                          strokeWidth={2}
                        />
                        <Area
                          type="monotone"
                          dataKey="meetings"
                          stroke="#4ECDC4"
                          fillOpacity={1}
                          fill="url(#colorMeetings)"
                          strokeWidth={2}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* User Activity Distribution */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <PieChart className="mr-2 h-5 w-5 text-purple-500" />
                    User Activity Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <RePieChart>
                        <Pie
                          data={userActivityData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {userActivityData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </RePieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Group Performance Chart */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart2 className="mr-2 h-5 w-5 text-green-500" />
                    Group Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={groupPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="name" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1F2937',
                            border: '1px solid #374151',
                            borderRadius: '0.375rem'
                          }}
                        />
                        <Bar dataKey="performance" fill="#FF6B6B" />
                        <Bar dataKey="meetings" fill="#4ECDC4" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="mr-2 h-5 w-5 text-blue-500" />
                    Recent Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activityLogs.recentMessages.map((message, index) => (
                      <div key={index} className="flex items-center space-x-4 text-sm bg-gray-750 p-3 rounded-lg">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        <span className="font-medium text-white">{message.user?.username || "Unknown User"}</span>
                        <span className="text-gray-400">posted in</span>
                        <span className="font-medium text-blue-400">{message.group?.name || "Unknown Group"}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      case "users":
        return <UserManagement users={users} onDelete={handleDeleteUser} />;
      case "groups":
        return <GroupManagement groups={groups} onDelete={handleDeleteGroup} />;
      case "meetings":
        return <MeetingManagement meetings={meetings} onDelete={handleDeleteMeeting} />;
      default:
        return null;
    }
  };

  const StatCard = ({ icon: Icon, title, value, increase, color }) => (
    <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200">
      <CardContent className="pt-6">
        <div className="flex items-center">
          <div className={`p-3 bg-${color}-500/10 rounded-lg`}>
            <Icon className={`h-8 w-8 text-${color}-500`} />
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <h3 className="text-2xl font-bold text-white">{value}</h3>
            <p className="text-sm text-green-400 mt-1">↑ {increase} increase</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-poppins flex">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 p-4 flex flex-col space-y-4">
        <div className="flex items-center space-x-3 px-3 py-4">
          <Activity className="h-8 w-8 text-blue-500" />
          <span className="text-xl font-bold">Study Admin</span>
        </div>
        
        <div className="space-y-2">
          <SidebarLink
            icon={Home}
            label="Dashboard"
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />
          <SidebarLink
            icon={Users}
            label="Users"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />
          <SidebarLink
            icon={Groups}
            label="Groups"
            active={activeTab === "groups"}
            onClick={() => setActiveTab("groups")}
          />
          <SidebarLink
            icon={Calendar}
            label="Meetings"
            active={activeTab === "meetings"}
            onClick={() => setActiveTab("meetings")}
          />
        </div>

        <div className="mt-auto space-y-2">
          <SidebarLink icon={Settings} label="Settings" onClick={() => {}} />
          <SidebarLink icon={LogOut} label="Logout" onClick={() => {}} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8">
        <MainContent />
      </div>
    </div>
  );
};

// User Management Component
const UserManagement = ({ users, onDelete }) => (
  <Card className="bg-gray-800 border-gray-700">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-white">User Management</CardTitle>
      <Button className="bg-blue-500 hover:bg-blue-600">
        <UserPlus className="mr-2 h-4 w-4" />
        Add User
      </Button>
    </CardHeader>
    <CardContent>
      <div className="relative overflow-x-auto rounded-lg">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700">
            <tr>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Email</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-750">
                <td className="px-6 py-4 font-medium text-white">{user.username}</td>
                <td className="px-6 py-4">{user.email}</td>
                <td className="px-6 py-4">
                  <Button
                    onClick={() => onDelete(user.id)}
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

// Group Management Component
const GroupManagement = ({ groups, onDelete }) => (
  <Card className="bg-gray-800 border-gray-700">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-white">Group Management</CardTitle>
      <Button className="bg-green-500 hover:bg-green-600">
        <Groups className="mr-2 h-4 w-4" />
        Create Group
      </Button>
    </CardHeader>
    <CardContent>
      <div className="relative overflow-x-auto rounded-lg">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700">
            <tr>
              <th className="px-6 py-3">Group Name</th>
              <th className="px-6 py-3">Members</th>
              <th className="px-6 py-3">Created Date</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((group) => (
              <tr key={group.id} className="border-b border-gray-700 hover:bg-gray-750">
                <td className="px-6 py-4 font-medium text-white">{group.name}</td>
                <td className="px-6 py-4">{group._count?.members || 0}</td>
                <td className="px-6 py-4">{new Date(group.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-500/10 text-green-500">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => onDelete(group.id)}
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

// Meeting Management Component
const MeetingManagement = ({ meetings, onDelete }) => (
  <Card className="bg-gray-800 border-gray-700">
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle className="text-white">Meeting Management</CardTitle>
      <Button className="bg-purple-500 hover:bg-purple-600">
        <Calendar className="mr-2 h-4 w-4" />
        Schedule Meeting
      </Button>
    </CardHeader>
    <CardContent>
      <div className="relative overflow-x-auto rounded-lg">
        <table className="w-full text-sm text-left text-gray-300">
          <thead className="text-xs text-gray-400 uppercase bg-gray-700">
            <tr>
              <th className="px-6 py-3">Meeting Title</th>
              <th className="px-6 py-3">Date & Time</th>
              <th className="px-6 py-3">Duration</th>
              <th className="px-6 py-3">Participants</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {meetings.map((meeting) => (
              <tr key={meeting.id} className="border-b border-gray-700 hover:bg-gray-750">
                <td className="px-6 py-4 font-medium text-white">{meeting.title}</td>
                <td className="px-6 py-4">{new Date(meeting.startTime).toLocaleString()}</td>
                <td className="px-6 py-4">60 mins</td>
                <td className="px-6 py-4">{meeting._count?.participants || 0}</td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-500/10 text-blue-500">
                    {new Date(meeting.startTime) > new Date() ? 'Upcoming' : 'Completed'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => onDelete(meeting.id)}
                      variant="ghost"
                      className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </CardContent>
  </Card>
);

export default Dashboard;