import React, { useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { Button, TextInput, Textarea, Label } from 'flowbite-react';

const ScheduleForm = () => {
  const { groupId } = useParams(); // Extract groupId from useParams
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Construct startTime and endTime
    const startDateTime = `${startDate}T${startTime}`;
    const endDateTime = `${endDate}T${endTime}`;

    try {
      await axios.post(`http://localhost:8000/api/groups/${groupId}/events`, {
        title,
        startTime: startDateTime,
        endTime: endDateTime,
        description,
      },{withCredentials: true});
      alert('Session scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling session:', error.response?.data || error.message);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Schedule a New Session</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="title" value="Title" />
          <TextInput
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="startDate" value="Start Date" />
          <TextInput
            id="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="startTime" value="Start Time" />
          <TextInput
            id="startTime"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="endDate" value="End Date" />
          <TextInput
            id="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="endTime" value="End Time" />
          <TextInput
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            required
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="description" value="Description" />
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1"
          />
        </div>
        <Button type="submit" color="primary" className="w-full">
          Schedule Session
        </Button>
      </form>
    </div>
  );
};

export default ScheduleForm;
