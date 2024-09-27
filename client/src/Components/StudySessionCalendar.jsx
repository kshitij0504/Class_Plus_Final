import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { parse, format, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  Card, 
  CardContent, 
  Button, 
  Typography, 
  Box, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  CircularProgress,
  IconButton
} from '@mui/material';
import { ChevronLeft, ChevronRight, Today, Check, Close } from '@mui/icons-material';
import "react-big-calendar/lib/css/react-big-calendar.css";
import '@fontsource/poppins';
import axios from "axios";

const locales = { "en-US": enUS };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

const theme = createTheme({
  palette: {
    primary: {
      main: '#1D4ED8', // Tailwind blue-600
    },
    secondary: {
      main: '#C4314B', // Teams red
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'Segoe UI, sans-serif',
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 3,
        },
      },
    },
  },
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
      const response = await axios.put(
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
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2, bgcolor: 'background.paper', p: 2, borderRadius: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 2 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton onClick={() => handleNavigate('PREV')} size="small">
              <ChevronLeft />
            </IconButton>
            <IconButton onClick={() => handleNavigate('NEXT')} size="small">
              <ChevronRight />
            </IconButton>
            <IconButton onClick={() => handleNavigate('TODAY')} size="small">
              <Today />
            </IconButton>
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            {format(new Date(date), "MMMM yyyy")}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {viewNames.map(name => (
              <Button
                key={name}
                onClick={() => {
                  toolbar.onView(name);
                  handleViewChange(name);
                }}
                variant={view === name ? "contained" : "outlined"}
                size="small"
                sx={{ minWidth: 80 }}
              >
                {name.charAt(0).toUpperCase() + name.slice(1)}
              </Button>
            ))}
          </Box>
        </Box>
      </Box>
    );
  };

  const eventStyleGetter = (event) => {
    let style = {
      backgroundColor: '#1D4ED8', // Tailwind blue-600
      borderRadius: '3px',
      opacity: 0.8,
      color: 'white',
      border: 'none',
      display: 'block'
    };

    if (event.rsvpStatus === 'Confirmed') {
      style.backgroundColor = '#92C353';
    } else if (event.rsvpStatus === 'Declined') {
      style.backgroundColor = '#C4314B';
    }

    return { style };
  };

  return (
    <ThemeProvider theme={theme}>
      <Card sx={{ maxWidth: '100%', mx: 'auto', boxShadow: 3, overflow: 'hidden', bgcolor: 'bg-blue-600' }}>
        <CardContent sx={{ p: 2 }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            view={view}
            onView={handleViewChange}
            date={date}
            onNavigate={handleNavigate}
            style={{ height: "70vh" }}
            selectable={true}
            onSelectEvent={handleSelectEvent}
            components={{ toolbar: CustomToolbar }}
            eventPropGetter={eventStyleGetter}
          />
          
          <Dialog open={isModalOpen} onClose={handleCloseModal} fullWidth maxWidth="sm">
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white' }}>
              {selectedEvent?.title}
            </DialogTitle>
            <DialogContent dividers>
              {selectedEvent ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Typography variant="body1">
                    {selectedEvent?.description || "No description available."}
                  </Typography>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body1">RSVP Status:</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                      {selectedEvent.rsvpStatus}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <CircularProgress />
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => handleRSVP('Confirmed')}
                color="success"
                disabled={loadingRSVP || selectedEvent?.rsvpStatus === 'Confirmed'}
              >
                {loadingRSVP ? <CircularProgress size={24} /> : <Check />}
                Confirm
              </Button>
              <Button
                onClick={() => handleRSVP('Declined')}
                color="error"
                disabled={loadingRSVP || selectedEvent?.rsvpStatus === 'Declined'}
              >
                {loadingRSVP ? <CircularProgress size={24} /> : <Close />}
                Decline
              </Button>
              <Button onClick={handleCloseModal} color="primary">
                Close
              </Button>
            </DialogActions>
            {errorRSVP && <Typography color="error" sx={{ padding: 2 }}>{errorRSVP}</Typography>}
          </Dialog>
        </CardContent>
      </Card>
    </ThemeProvider>
  );
};

export default StudySessionCalendar;
