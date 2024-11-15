import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { Button, Card } from 'flowbite-react';
import { Video, Clock, Users } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const JoinMeeting = () => {
  const { meetingId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const password = searchParams.get('password');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [meetingDetails, setMeetingDetails] = useState(null);

  useEffect(() => {
    const joinMeeting = async () => {
      if (!meetingId || !password) {
        setError('Invalid meeting link');
        setIsLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `https://class-plus-final.onrender.com/meetings/join?meetingId=${meetingId}&password=${password}`,
          { withCredentials: true }
        );

        setMeetingDetails(response.data.data);
      } catch (error) {
        console.error('Error joining meeting:', error);
        const errorMessage = error.response?.data?.error || 'Failed to join meeting';
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    joinMeeting();
  }, [meetingId, password]);

// In your JoinMeeting component:
const handlejoinmeeting = () => {
  navigate(`/meeting-room/${meetingId}`, { 
    state: { meetingDetails },
    replace: true 
  });
};
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-white">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-8 p-6">
        <Card className="text-center">
          <h2 className="text-xl font-semibold text-red-500">Error</h2>
          <p className="text-gray-600">{error}</p>
          <Button
            color="gray"
            onClick={() => navigate('/dashboard')}
            className="mt-4"
          >
            Return to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6">
      <Card>
        <div className="text-center space-y-4">
          <Video className="w-12 h-12 mx-auto text-blue-500" />
          <h1 className="text-2xl font-bold">{meetingDetails.title}</h1>
          
          {meetingDetails.description && (
            <p className="text-gray-600">{meetingDetails.description}</p>
          )}
          
          <div className="flex justify-center items-center space-x-4 text-gray-600">
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {new Date(meetingDetails.startTime).toLocaleString()}
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {meetingDetails.duration} minutes
            </div>
          </div>

          <Button
            gradientDuoTone="greenToBlue"
            className="w-full max-w-xs mx-auto"
            onClick={handlejoinmeeting}
          >
            Join Meeting
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default JoinMeeting;