import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Users, Calendar, MessageSquare, Trash2, TrendingUp, Book, Activity } from "lucide-react";
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
} from "recharts";
import axios from "axios";  

const Dashboard = () => {
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
        axios.get("http://localhost:8000/api/statistics", {
          withCredentials: true,
        }),
        axios.get("http://localhost:8000/api/users", { withCredentials: true }),
        axios.get("http://localhost:8000/api/groups", {
          withCredentials: true,
        }),
        axios.get("http://localhost:8000/api/meetings", {
          withCredentials: true,
        }),
        axios.get("http://localhost:8000/api/activity-logs", {
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
      await axios.delete(`http://localhost:8000/api/users/${userId}`, {
        withCredentials: true,
      });
      setUsers(users.filter((user) => user.id !== userId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user");
    }
  };

  const handleDeleteGroup = async (groupId) => {
    try {
      await axios.delete(`http://localhost:8000/api/groups/${groupId}`, {
        withCredentials: true,
      });
      setGroups(groups.filter((group) => group.id !== groupId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete group");
    }
  };

  const handleDeleteMeeting = async (meetingId) => {
    try {
      await axios.delete(`http://localhost:8000/api/meetings/${meetingId}`, {
        withCredentials: true,
      });
      setMeetings(meetings.filter((meeting) => meeting.id !== meetingId));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete meeting");
    }
  };

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
    <div className="min-h-screen bg-gray-900 text-gray-100 font-poppins">
    {/* Header */}
    <div className="bg-gray-800 shadow-lg border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Study Group Admin</h1>
            <p className="text-gray-400 mt-1">Platform Overview & Management</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Activity className="mr-2 h-4 w-4" />
              Generate Report
            </Button>
          </div>
        </div>
      </div>
    </div>

    {/* Main Content */}
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-500/10 rounded-lg">
                <Users className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Users</p>
                <h3 className="text-2xl font-bold text-white">{statistics.totalUsers}</h3>
                <p className="text-sm text-green-400 mt-1">↑ 12% increase</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <Book className="h-8 w-8 text-green-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Active Groups</p>
                <h3 className="text-2xl font-bold text-white">{statistics.totalGroups}</h3>
                <p className="text-sm text-green-400 mt-1">↑ 8% increase</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-500/10 rounded-lg">
                <Calendar className="h-8 w-8 text-purple-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Total Meetings</p>
                <h3 className="text-2xl font-bold text-white">{statistics.totalMeetings}</h3>
                <p className="text-sm text-green-400 mt-1">↑ 15% increase</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700 hover:bg-gray-750 transition-all duration-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-500/10 rounded-lg">
                <MessageSquare className="h-8 w-8 text-yellow-500" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">Messages</p>
                <h3 className="text-2xl font-bold text-white">{statistics.totalMessages}</h3>
                <p className="text-sm text-green-400 mt-1">↑ 24% increase</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card className="mb-8 bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
            Platform Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {statistics.activityData && statistics.activityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={statistics.activityData}>
                  <defs>
                    <linearGradient id="colorMessages" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMeetings" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
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
                    stroke="#8884d8"
                    fillOpacity={1}
                    fill="url(#colorMessages)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="meetings"
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#colorMeetings)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">
                No activity data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Activity className="mr-2 h-5 w-5 text-blue-500" />
              Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activityLogs.recentMessages && activityLogs.recentMessages.length > 0 ? (
                activityLogs.recentMessages.map((message, index) => (
                  <div key={index} className="flex items-center space-x-4 text-sm bg-gray-750 p-3 rounded-lg">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="font-medium text-white">{message.user?.username || "Unknown User"}</span>
                    <span className="text-gray-400">posted in</span>
                    <span className="font-medium text-blue-400">{message.group?.name || "Unknown Group"}</span>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400">No recent activity</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-purple-500" />
              Upcoming Meetings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {meetings.slice(0, 4).map((meeting) => (
                <div key={meeting.id} className="flex items-center justify-between bg-gray-750 p-3 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-purple-500/10 rounded">
                      <Calendar className="h-4 w-4 text-purple-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{meeting.title}</p>
                      <p className="text-xs text-gray-400">{new Date(meeting.startTime).toLocaleString()}</p>
                    </div>
                  </div>
                  <span className="text-sm text-purple-400">{meeting._count.participants} participants</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="users" className="data-[state=active]:bg-gray-700">Users</TabsTrigger>
          <TabsTrigger value="groups" className="data-[state=active]:bg-gray-700">Groups</TabsTrigger>
          <TabsTrigger value="meetings" className="data-[state=active]:bg-gray-700">Meetings</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">User Management</CardTitle>
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
                            onClick={() => handleDeleteUser(user.id)}
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
        </TabsContent>

          <TabsContent value="groups">
            <Card>
              <CardHeader>
                <CardTitle>Group Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  {groups.length > 0 ? (
                    <table className="w-full text-sm text-left text-gray-500">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                          <th className="px-6 py-3">Group Name</th>
                          <th className="px-6 py-3">Members</th>
                          <th className="px-6 py-3">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groups.map((group) => (
                          <tr
                            key={group.id}
                            className="bg-white border-b hover:bg-gray-50"
                          >
                            <td className="px-6 py-4">{group.name}</td>
                            <td className="px-6 py-4">
                              {group._count.members || 0}
                            </td>
                            <td className="px-6 py-4">
                              <Button
                                onClick={() => handleDeleteGroup(group.id)}
                                variant="outline"
                                className="text-red-500"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No groups found
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="meetings">
            <Card>
              <CardHeader>
                <CardTitle>Meeting Management</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                      <tr>
                        <th className="px-6 py-3">Meeting Title</th>
                        <th className="px-6 py-3">Date & Time</th>
                        <th className="px-6 py-3">Participants</th>
                        <th className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {meetings.map((meeting) => (
                        <tr
                          key={meeting.id}
                          className="bg-white border-b hover:bg-gray-50"
                        >
                          <td className="px-6 py-4">{meeting.title}</td>
                          <td className="px-6 py-4">
                            {new Date(meeting.startTime).toLocaleString()}
                          </td>
                          <td className="px-6 py-4">
                            {meeting._count.participants}
                          </td>
                          <td className="px-6 py-4">
                            <Button
                              onClick={() => handleDeleteMeeting(meeting.id)}
                              variant="outline"
                              className="text-red-500"
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
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
