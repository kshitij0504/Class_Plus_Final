import React, { useState, useEffect } from 'react';
import { Calendar, Users, Clock, MapPin, Search, Filter, ChevronDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useParams } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const formattedTime = date.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
  return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${formattedTime}`;
};

const AvatarGroup = ({ participants }) => {
  const displayLimit = 4;
  const remainingCount = participants.length - displayLimit;

  return (
    <div className="flex -space-x-4 hover:space-x-1 transition-all duration-300">
      {participants.slice(0, displayLimit).map((participant, index) => {
        const getInitials = (participant) => {
          if (!participant || !participant.name) return '?';
          return participant.name.charAt(0).toUpperCase();
        };

        return (
          <div key={index} className="relative group">
            <Avatar className="w-10 h-10 border-2 border-gray-800 ring-2 ring-violet-500/30 transition-transform duration-200 hover:scale-110 hover:z-10">
              <AvatarImage src={participant?.avatar} alt={participant?.name || 'User'} />
              <AvatarFallback className="bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white">
                {getInitials(participant)}
              </AvatarFallback>
            </Avatar>
            {participant?.name && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {participant.name}
              </div>
            )}
          </div>
        );
      })}
      {remainingCount > 0 && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 border-2 border-gray-800 ring-2 ring-violet-500/30 flex items-center justify-center transition-transform duration-200 hover:scale-110 hover:z-10">
          <span className="text-sm font-semibold text-white">
            +{remainingCount}
          </span>
        </div>
      )}
    </div>
  );
};

const MeetingCard = ({ meeting }) => {
  return (
    <Card className="group relative overflow-hidden bg-gray-800 border-none">
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-fuchsia-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-white mb-2 group-hover:text-violet-400 transition-colors">
              {meeting.title}
            </h3>
            <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-300 transition-colors">
              <Clock className="w-4 h-4" />
              <p className="text-sm">
                {formatDate(meeting.startTime)}
              </p>
            </div>
          </div>
          <div className="bg-violet-500/10 p-2 rounded-lg group-hover:bg-violet-500/20 transition-colors">
            <Calendar className="w-6 h-6 text-violet-400 group-hover:text-violet-300" />
          </div>
        </div>
        
        {meeting.location && (
          <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-300 transition-colors mb-4">
            <MapPin className="w-4 h-4" />
            <p className="text-sm">{meeting.location}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-6">
          <AvatarGroup participants={meeting.participants || []} />
          <div className="flex items-center gap-2 text-gray-400 group-hover:text-gray-300 transition-colors">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              {(meeting.participants || []).length} participants
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const PreviousMeetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const { groupId } = useParams();

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/group/meetings/${groupId}`, {
          credentials: 'include'
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch meetings');
        }

        const data = await response.json();
        setMeetings(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [groupId]);

  const filteredMeetings = meetings
    .filter(meeting => 
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.location?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.startTime) - new Date(a.startTime);
        case 'participants':
          return b.participants.length - a.participants.length;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="p-6 bg-gradient-to-b from-gray-900 to-gray-950">
        <h2 className="text-2xl font-bold text-white mb-6">Previous Meetings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="bg-gray-900 border border-gray-800">
              <CardContent className="p-6">
                <div className="animate-pulse space-y-4">
                  <div className="h-6 bg-gray-800 rounded w-3/4" />
                  <div className="h-4 bg-gray-800 rounded w-1/2" />
                  <div className="h-10 bg-gray-800 rounded" />
                  <div className="flex gap-2">
                    {[1, 2, 3].map((j) => (
                      <div key={j} className="h-10 w-10 bg-gray-800 rounded-full" />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-gradient-to-b from-gray-900 to-gray-950">
        <div className="max-w-md mx-auto bg-red-900/20 border border-red-800 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Error Loading Meetings</h3>
          <p className="text-red-300">{error}</p>
          <Button 
            variant="destructive" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Previous Meetings</h2>
            <p className="text-gray-400">Browse and search through your meeting history</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search meetings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800/50 border-gray-700 text-white placeholder-gray-400 w-full sm:w-64 focus:border-violet-500/50 focus:ring-violet-500/20"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-48 bg-gray-800/50 border-gray-700 text-white focus:border-violet-500/50 focus:ring-violet-500/20">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="participants">Participants</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredMeetings.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-800/50 rounded-lg p-6 max-w-md mx-auto border border-gray-700">
              <Filter className="w-12 h-12 text-violet-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No meetings found</h3>
              <p className="text-gray-400">Try adjusting your search or filters</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-400">
                {filteredMeetings.length} {filteredMeetings.length === 1 ? 'meeting' : 'meetings'} found
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMeetings.map((meeting) => (
                <MeetingCard key={meeting.id} meeting={meeting} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PreviousMeetings;