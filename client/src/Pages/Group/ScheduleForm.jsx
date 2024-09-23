import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Button, TextInput, Textarea, Label } from 'flowbite-react';
import toast from 'react-hot-toast';

const ScheduleForm = ({groupId, onClose}) => {
  const [title, setTitle] = useState('');
  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`http://localhost:8000/api/groups/${groupId}/events`, {
        title,
        startTime: startDateTime,
        endTime: endDateTime,
        description,
      }, { withCredentials: true });
      console.log(response)
      onClose();
      toast.success('Session scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling session:', error.response?.data || error.message);
      toast.error('Failed to schedule session.');
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-white mb-4">Schedule a New Session</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title" value="Title" className="text-white" />
          <TextInput
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 bg-gray-700 text-white border border-gray-600"
          />
        </div>
        <div>
          <Label htmlFor="startDateTime" value="Start Date & Time" className="text-white" />
          <TextInput
            id="startDateTime"
            type="datetime-local"
            value={startDateTime}
            onChange={(e) => setStartDateTime(e.target.value)}
            required
            className="mt-1 bg-gray-700 text-white border border-gray-600"
          />
        </div>
        <div>
          <Label htmlFor="endDateTime" value="End Date & Time" className="text-white" />
          <TextInput
            id="endDateTime"
            type="datetime-local"
            value={endDateTime}
            onChange={(e) => setEndDateTime(e.target.value)}
            required
            className="mt-1 bg-gray-700 text-white border border-gray-600"
          />
        </div>
        <div>
          <Label htmlFor="description" value="Description" className="text-white" />
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 bg-gray-700 text-white border border-gray-600"
          />
        </div>
        <Button type="submit" color="primary" className="w-full bg-blue-600 hover:bg-blue-700">
          Schedule Session
        </Button>
      </form>
    </div>
  );
};

export default ScheduleForm;
