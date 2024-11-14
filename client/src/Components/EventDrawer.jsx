import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import toast from "react-hot-toast";

const EventDialog = ({ show, handleClose, groupId, handleAddEvent }) => {
  const [formData, setFormData] = useState({
    title: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    description: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError("");
  };

  const validateForm = () => {
    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
    
    if (!formData.title.trim()) {
      setError("Please enter a session title");
      return false;
    }

    if (endDateTime <= startDateTime) {
      setError("End time must be after start time");
      return false;
    }

    if (startDateTime < new Date()) {
      setError("Start time cannot be in the past");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    setError("");

    const startDateTime = new Date(`${formData.startDate}T${formData.startTime}`);
    const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

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
            title: formData.title,
            startTime: startDateTime.toISOString(),
            endTime: endDateTime.toISOString(),
            description: formData.description,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(await response.text());
      }

      if(response.ok){
        toast.success("Event Schedule Successfully")
      }

      const data = await response.json();
      handleAddEvent({
        id: data.id,
        ...formData,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
      });
      
      handleClose();
    } catch (error) {
      console.error("Error scheduling session:", error);
      setError("Failed to schedule session. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      description: ""
    });
    setError("");
  };

  return (
    <Dialog 
      open={show} 
      onOpenChange={() => {
        handleClose();
        resetForm();
      }}
    >
      <DialogContent className="max-w-2xl bg-white">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold">
            Schedule Study Session
          </DialogTitle>
          <DialogDescription>
            Fill in the details below to schedule a new study session for your group.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Session Title <span className="text-red-500">*</span>
            </label>
            <Input
              name="title"
              required
              placeholder="E.g., Chapter 5 Review - Organic Chemistry"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="startDate"
                  required
                  value={formData.startDate}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="time"
                    name="startTime"
                    required
                    value={formData.startTime}
                    onChange={handleInputChange}
                    className="w-full pr-10"
                  />
                  <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  End Date <span className="text-red-500">*</span>
                </label>
                <Input
                  type="date"
                  name="endDate"
                  required
                  value={formData.endDate}
                  onChange={handleInputChange}
                  min={formData.startDate || new Date().toISOString().split('T')[0]}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  End Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="time"
                    name="endTime"
                    required
                    value={formData.endTime}
                    onChange={handleInputChange}
                    className="w-full pr-10"
                  />
                  <Clock className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <Textarea
              name="description"
              placeholder="Add any additional details about the study session..."
              value={formData.description}
              onChange={handleInputChange}
              className="min-h-[100px] resize-none"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scheduling...
                </>
              ) : (
                "Schedule Session"
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                handleClose();
                resetForm();
              }}
              disabled={isSubmitting}
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2.5"
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;