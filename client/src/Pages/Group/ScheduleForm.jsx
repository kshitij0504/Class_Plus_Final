import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Clock } from "lucide-react";

const ScheduleForm = ({ onClose, groupId, handleAddEvent }) => {
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    if (endDateTime <= startDateTime) {
      alert("End Date & Time must be after Start Date & Time.");
      return;
    }

    try {
      const response = await fetch(
        `https://class-plus-final.onrender.com/api/groups/${groupId}/events`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            description,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to schedule session");

      const data = await response.json();
      const newEvent = {
        id: data.id,
        title,
        description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      };
      
      handleAddEvent(newEvent);
      onClose();
      alert("Session scheduled successfully!");
    } catch (error) {
      console.error("Error scheduling session:", error);
      alert("Failed to schedule session.");
    }
  };

  return (
    <div className="w-full">
      <Card className="w-full max-w-lg mx-auto shadow-lg">
        <CardHeader className="space-y-2 border-b pb-4">
          <CardTitle className="text-2xl font-semibold text-center text-gray-800">
            Schedule a New Session
          </CardTitle>
          <CardDescription className="text-center text-gray-500">
            Fill in the details below to schedule your study session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            {/* Session Title */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Session Title
              </label>
              <Input
                required
                placeholder="Enter session title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full"
              />
            </div>

            {/* Date and Time Inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date and Time */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <div className="relative">
                    <Input
                      type="time"
                      required
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full"
                    />
                    <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>

              {/* End Date and Time */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    End Date
                  </label>
                  <Input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full"
                    min={startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <div className="relative">
                    <Input
                      type="time"
                      required
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full"
                    />
                    <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Description
              </label>
              <Textarea
                placeholder="Enter session description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2"
              >
                Schedule Session
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2"
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScheduleForm;
