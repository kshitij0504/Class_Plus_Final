// src/pages/JoinMeeting.js
import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button, TextInput } from 'flowbite-react';

const JoinMeeting = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { meetingID } = useParams(); 
  const query = new URLSearchParams(location.search);
  const password = query.get('password');

  const [inputPassword, setInputPassword] = useState(password || '');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [meetingDetails, setMeetingDetails] = useState(null);

  const handleJoin = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/meetings/join`, {
        params: { meetingID, password: inputPassword },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setIsAuthorized(true);
      setMeetingDetails(response.data.data);
      // Redirect to video conference page with meetingID
      navigate(`/meetings/${meetingID}`, { state: { meetingDetails: response.data.data } });
    } catch (error) {
      console.error('Error joining meeting:', error);
      alert('Failed to join meeting. Please check your password and try again.');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white">
      <div className="max-w-md w-full p-6 bg-gray-800 rounded-lg shadow-md">
        <h2 className="text-2xl font-semibold mb-4">Join Meeting</h2>
        <div className="mb-4">
          <TextInput
            type="password"
            placeholder="Enter Meeting Password"
            value={inputPassword}
            onChange={(e) => setInputPassword(e.target.value)}
            required
          />
        </div>
        <Button onClick={handleJoin}>Join Meeting</Button>
      </div>
    </div>
  );
};

export default JoinMeeting;
