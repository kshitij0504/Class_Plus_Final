import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { parse, format, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react";
import axios from "axios";
import "react-big-calendar/lib/css/react-big-calendar.css";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const StudySessionCalendar = ({ events, onRSVPUpdate }) => {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingRSVP, setLoadingRSVP] = useState(false);
  const [errorRSVP, setErrorRSVP] = useState(null);

  const handleViewChange = (newView) => setView(newView);

  const handleNavigate = (action) => {
    const newDate = new Date(date);
    if (action === "PREV") newDate.setMonth(date.getMonth() - 1);
    else if (action === "NEXT") newDate.setMonth(date.getMonth() + 1);
    else if (action === "TODAY") return setDate(new Date());
    setDate(newDate);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedEvent(null);
    setIsModalOpen(false);
    setErrorRSVP(null);
  };

  const handleRSVP = async (newStatus) => {
    if (!selectedEvent) return;
    setLoadingRSVP(true);
    setErrorRSVP(null);

    try {
      const response = await axios.post(
        `http://localhost:8000/api/sessions/${selectedEvent.id}/rsvp`,
        { rsvpStatus: newStatus },
        { withCredentials: true }
      );
      if (response.status === 200) {
        const updatedEvent = { ...selectedEvent, rsvpStatus: newStatus };
        onRSVPUpdate(updatedEvent);
        setSelectedEvent(updatedEvent);
      } else {
        setErrorRSVP("Failed to update RSVP status. Please try again.");
      }
    } catch (error) {
      console.error("Error updating RSVP status:", error);
      setErrorRSVP("An error occurred while updating RSVP. Please try again.");
    } finally {
      setLoadingRSVP(false);
    }
  };

  const CustomToolbar = (toolbar) => {
    const viewNames = ['month', 'week', 'day'];

    return (
      <div className="flex flex-col space-y-4 p-4 bg-white rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleNavigate('PREV')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleNavigate('NEXT')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="ml-2"
              onClick={() => handleNavigate('TODAY')}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              Today
            </Button>
          </div>
          
          <h2 className="text-lg font-semibold">
            {format(new Date(date), "MMMM yyyy")}
          </h2>
          
          <div className="flex space-x-2">
            {viewNames.map(name => (
              <Button
                key={name}
                variant={view === name ? "default" : "outline"}
                onClick={() => {
                  toolbar.onView(name);
                  handleViewChange(name);
                }}
                className="w-20"
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const eventStyleGetter = (event) => {
    let className = "px-2 py-1 rounded-md text-sm font-medium ";
    
    if (event.rsvpStatus === 'Confirmed') {
      className += "bg-green-100 text-green-800 border border-green-200";
    } else if (event.rsvpStatus === 'Declined') {
      className += "bg-red-100 text-red-800 border border-red-200";
    } else {
      className += "bg-blue-100 text-blue-800 border border-blue-200";
    }

    return {
      style: {
        backgroundColor: 'transparent'
      },
      className
    };
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <Card className="border rounded-xl shadow-lg">
        <CardContent className="p-6">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={handleViewChange}
            date={date}
            onNavigate={handleNavigate}
            style={{ height: "75vh" }}
            selectable={true}
            onSelectEvent={handleSelectEvent}
            components={{ toolbar: CustomToolbar }}
            eventPropGetter={eventStyleGetter}
            className="rounded-lg bg-white"
          />

          <Dialog open={isModalOpen} onOpenChange={() => handleCloseModal()}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedEvent?.title}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={handleCloseModal}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>

              {selectedEvent && (
                <div className="space-y-4">
                  <div className="text-sm text-gray-600">
                    {format(new Date(selectedEvent.start), "EEEE, MMMM d, yyyy")}
                    <br />
                    {format(new Date(selectedEvent.start), "h:mm a")} - {format(new Date(selectedEvent.end), "h:mm a")}
                  </div>
                  
                  <p className="text-gray-700">
                    {selectedEvent.description || "No description available."}
                  </p>

                  {selectedEvent.rsvpStatus && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Status:</span>
                      <Badge 
                        variant={selectedEvent.rsvpStatus === 'Confirmed' ? 'success' : 
                               selectedEvent.rsvpStatus === 'Declined' ? 'destructive' : 
                               'secondary'}
                      >
                        {selectedEvent.rsvpStatus}
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {errorRSVP && (
                <p className="text-sm text-red-600 mt-2">{errorRSVP}</p>
              )}

              <DialogFooter className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={handleCloseModal}
                >
                  Close
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudySessionCalendar;