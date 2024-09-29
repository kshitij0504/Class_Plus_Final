import React, { useState } from "react";
import axios from "axios";
import {
  Button,
  TextField,
  Box,
  Typography,
  Container,
  Paper,
  Stack,
} from "@mui/material";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider, DateTimePicker } from "@mui/x-date-pickers";
import { toast, Toaster } from "react-hot-toast";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const studyGroupTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2", 
    },
    secondary: {
      main: "#ff9800", 
    },
    background: {
      default: "#f5f5f5", 
      paper: "#ffffff", 
    },
    text: {
      primary: "#333333",
      secondary: "#555555", 
    },
  },
  typography: {
    fontFamily: "Poppins, sans-serif", 
    h4: {
      fontWeight: 600,
    },
  },
  spacing: 8, 
});

const ScheduleForm = ({ onClose, groupId,handleAddEvent }) => {
  const [title, setTitle] = useState("");
  const [startDateTime, setStartDateTime] = useState(null);
  const [endDateTime, setEndDateTime] = useState(null);
  const [description, setDescription] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate that end date is after start date
    if (endDateTime <= startDateTime) {
      toast.error("End Date & Time must be after Start Date & Time.");
      return;
    }
    try {
      const response = await axios.post(
        `http://localhost:8000/api/groups/${groupId}/events`,
        {
          title,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          description,
        },
        { withCredentials: true }
      );
      const newEvent = {
        id: response.data.id, 
        title,
        description,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
    };
      handleAddEvent(newEvent);
      onClose();
      toast.success("Session scheduled successfully!");
    } catch (error) {
      console.error(
        "Error scheduling session:",
        error.response?.data || error.message
      );
      toast.error("Failed to schedule session.");
    }
  };

  return (
    <ThemeProvider theme={studyGroupTheme}>
      <Container component="main" maxWidth="sm">
        <Toaster position="top-center" />
        <Paper
          elevation={3}
          sx={{
            p: 4,
            mt: 8,
            borderRadius: 2,
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
          }}
        >
          <Typography component="h1" variant="h4" align="center" gutterBottom>
            Schedule a New Session
          </Typography>
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 3 }}
          >
            <Stack spacing={3}>
              <TextField
                required
                fullWidth
                id="title"
                label="Title"
                name="title"
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                variant="outlined"
              />
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Start Date & Time"
                  value={startDateTime}
                  onChange={(newValue) => setStartDateTime(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      fullWidth
                      variant="outlined"
                    />
                  )}
                  minDateTime={new Date()} // Ensuring start time can't be in the past
                />
                <DateTimePicker
                  label="End Date & Time"
                  value={endDateTime}
                  onChange={(newValue) => setEndDateTime(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      required
                      fullWidth
                      variant="outlined"
                    />
                  )}
                  minDateTime={startDateTime} // End time can't be before start time
                />
              </LocalizationProvider>
              <TextField
                fullWidth
                id="description"
                label="Description"
                name="description"
                multiline
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                variant="outlined"
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
              >
                <Typography component="span" align="center" gutterBottom>
                  Schedule Session
                </Typography>
              </Button>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </ThemeProvider>
  );
};

export default ScheduleForm;
