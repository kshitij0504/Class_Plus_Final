import React, { useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import { parse, format, startOfWeek, getDay } from "date-fns";
import enUS from "date-fns/locale/en-US";
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Card, CardContent, Button, Typography, Box } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import "react-big-calendar/lib/css/react-big-calendar.css";
import '@fontsource/poppins'; // Import the Poppins font

const locales = { "en-US": enUS };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// Create a custom theme
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

const StudySessionCalendar = ({ events }) => {
  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());

  const handleViewChange = (newView) => {
    setView(newView);
  };

  const handleNavigate = (action) => {
    const newDate = new Date(date);
    if (action === "PREV") {
      newDate.setMonth(date.getMonth() - 1);
    } else if (action === "NEXT") {
      newDate.setMonth(date.getMonth() + 1);
    } else if (action === "TODAY") {
      newDate.setMonth(new Date().getMonth());
    }
    setDate(newDate);
  };

  const CustomToolbar = (toolbar) => {
    const goToBack = () => {
      toolbar.onNavigate('PREV');
      handleNavigate('PREV');
    };

    const goToNext = () => {
      toolbar.onNavigate('NEXT');
      handleNavigate('NEXT');
    };

    const goToCurrent = () => {
      toolbar.onNavigate('TODAY');
      handleNavigate('TODAY');
    };

    const viewNames = ['month', 'week', 'day'];

    const getMonthTitle = () => {
      const label = toolbar.label.split(' ');
      return `${label[0]} ${label[1]}`;
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mb: 1 }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button variant="outlined" size="small" onClick={goToBack}>
              <ChevronLeft />
            </Button>
            <Button variant="outlined" size="small" onClick={goToNext}>
              <ChevronRight />
            </Button>
            <Button variant="outlined" size="small" onClick={goToCurrent}>Today</Button>
          </Box>
          <Typography variant="h5" component="h2" sx={{ textAlign: 'center', flexGrow: 1 }}>{getMonthTitle()}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {viewNames.map(name => (
            <Button
              key={name}
              onClick={() => toolbar.onView(name)}
              variant={view === name ? "contained" : "outlined"}
              size="small"
            >
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </Button>
          ))}
        </Box>
      </Box>
    );
  };

  return (
    <ThemeProvider theme={theme}>
      <Card sx={{ maxWidth: '100%', mx: 'auto', boxShadow: 3, overflow: 'hidden' }}>
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
            style={{ height: "70vh", overflow: 'hidden' }}
            selectable={true}
            components={{
              toolbar: CustomToolbar,
            }}
          />
        </CardContent>
      </Card>
    </ThemeProvider>
  );
};

export default StudySessionCalendar;
