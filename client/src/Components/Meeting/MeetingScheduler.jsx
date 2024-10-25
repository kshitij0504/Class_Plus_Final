import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, TextInput, Textarea, Label, Select } from "flowbite-react";
import { Calendar, Clock, Timer } from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";

const MeetingScheduler = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: "60", // Default duration of 60 minutes
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [meetingLink, setMeetingLink] = useState("");

  const durationOptions = [
    { value: "30", label: "30 minutes" },
    { value: "60", label: "1 hour" },
    { value: "90", label: "1.5 hours" },
    { value: "120", label: "2 hours" },
    { value: "180", label: "3 hours" },
  ];

  const validateForm = () => {
    const errors = [];
    if (!formData.title.trim()) {
      errors.push("Title is required");
    }
    if (!formData.date) {
      errors.push("Date is required");
    }
    if (!formData.time) {
      errors.push("Time is required");
    }
    if (!formData.duration) {
      errors.push("Duration is required");
    }

    // Check if selected date and time is in the future
    const selectedDateTime = new Date(`${formData.date}T${formData.time}`);
    if (selectedDateTime <= new Date()) {
      errors.push("Meeting time must be in the future");
    }

    return errors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSchedule = async () => {
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(", "));
      toast.error(validationErrors[0]);
      return;
    }

    setIsLoading(true);
    try {
      const startTime = new Date(`${formData.date}T${formData.time}`).toISOString();
      
      const response = await axios.post(
        "http://localhost:8000/api/meetings/schedule",
        {
          groupId: id,
          title: formData.title,
          description: formData.description,
          scheduledAt: startTime,         // Backend will map this to startTime
          duration: parseInt(formData.duration, 10)
        },
        {
          withCredentials: true,
        }
      );

      setMeetingLink(response.data.data.meetingLink);
      toast.success("Meeting scheduled successfully!");
      
      // Reset form
      setFormData({
        title: "",
        description: "",
        date: "",
        time: "",
        duration: "60"
      });
      
      // Optional: Navigate to meetings list after short delay
    } catch (error) {
      console.error("Error scheduling meeting:", error);
      const errorMessage = error.response?.data?.error || "Failed to schedule meeting";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(meetingLink);
    toast.success("Meeting link copied to clipboard!");
  };

  // Get minimum date for date picker (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-white mb-6">
        Schedule a Meeting
      </h2>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="title" className="text-white mb-2">Meeting Title</Label>
          <TextInput
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter meeting title"
            icon={Calendar}
            required
          />
        </div>

        <div>
          <Label htmlFor="description" className="text-white mb-2">Description (optional)</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter meeting description"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="date" className="text-white mb-2">Date</Label>
            <TextInput
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleInputChange}
              min={getMinDate()}
              required
            />
          </div>

          <div>
            <Label htmlFor="time" className="text-white mb-2">Time</Label>
            <TextInput
              id="time"
              name="time"
              type="time"
              value={formData.time}
              onChange={handleInputChange}
              icon={Clock}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="duration" className="text-white mb-2">Duration</Label>
          <Select
            id="duration"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            required
            icon={Timer}
          >
            {durationOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}

        <Button
          onClick={handleSchedule}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? "Scheduling..." : "Schedule Meeting"}
        </Button>

        {meetingLink && (
          <div className="mt-6 p-4 bg-gray-700 rounded-lg">
            <Label className="text-white mb-2">Meeting Link</Label>
            <div className="flex items-center gap-2">
              <TextInput
                value={meetingLink}
                readOnly
                className="flex-1"
              />
              <Button onClick={handleCopyLink} size="sm">
                Copy
              </Button>
            </div>
            <p className="text-gray-400 text-sm mt-2">
              Share this link with group members to join the meeting
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingScheduler;