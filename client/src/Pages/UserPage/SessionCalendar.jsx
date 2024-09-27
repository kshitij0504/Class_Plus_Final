import React, { useEffect, useState } from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Typography, Container, Box, CircularProgress, Alert } from '@mui/material';
import StudySessionCalendar from "../../Components/StudySessionCalendar";
import '@fontsource/poppins';
import axios from "axios";

const theme = createTheme({
  palette: {
    primary: {
      main: '#1D4ED8', 
    },
    secondary: {
      main: '#C4314B', 
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
  components: {
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
  },
});

const SessionCalendar = () => {
  const [sessionEvents, setSessionEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/sessions/rsvp', { withCredentials: true });
        const responseData = response.data;

        if (Array.isArray(responseData.data)) {
          const events = responseData.data.map((session, index) => {
            const startDate = new Date(session.startTime);
            const endDate = new Date(session.endTime);

            if (isNaN(startDate) || isNaN(endDate)) {
              console.error(`Invalid dates for session at index ${index}:`, session);
              return null;
            }

            return {
              id: session.id || index,
              title: session.title,
              start: startDate,
              end: endDate,
              allDay: session.allDay || false,
              rsvpStatus: session.rsvpStatus || 'No Status',
              description: session.description || 'No description available',
            };
          }).filter(event => event !== null);

          setSessionEvents(events);
        } else {
          throw new Error("Unexpected data format received from the server.");
        }
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError(err.message || "Failed to load sessions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, []);

  const handleRSVPUpdate = (updatedEvent) => {
    setSessionEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === updatedEvent.id ? { ...event, rsvpStatus: updatedEvent.rsvpStatus } : event
      )
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ 
          bgcolor: 'background.paper', 
          p: 3, 
          borderRadius: 2, 
          boxShadow: 3,
          mb: 4 
        }}>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{ 
              fontWeight: 'bold', 
              color: 'primary.main',
              mb: 2
            }}
          >
            Study Group Schedule
          </Typography>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          {!loading && !error && (
            <StudySessionCalendar 
              events={sessionEvents} 
              onRSVPUpdate={handleRSVPUpdate}
            />
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default SessionCalendar;