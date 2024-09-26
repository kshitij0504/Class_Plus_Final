import React from "react";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Typography, Container, Box } from '@mui/material';
import StudySessionCalendar from "../../Components/StudySessionCalendar";
import '@fontsource/poppins'; // Import the Poppins font

// Create a custom theme (you can customize this further)
const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
  typography: {
    fontFamily: 'Poppins, sans-serif', // Use Poppins as the default font
  },
});

const SessionCalendar = () => {
  const sessionEvents = [
    {
      title: "Math Study Group",
      start: new Date(2024, 8, 28, 10, 0),
      end: new Date(2024, 8, 28, 12, 0),
      allDay: false,
    },
    {
      title: "History Discussion",
      start: new Date(2024, 8, 29, 14, 0),
      end: new Date(2024, 8, 29, 16, 0),
      allDay: false,
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Study Group Schedule
          </Typography>
          <StudySessionCalendar events={sessionEvents} />
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default SessionCalendar; 
