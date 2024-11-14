import React, { useState, useEffect } from 'react';
import { FormControl, InputLabel, Select, MenuItem, Box, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import axios from 'axios';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
  },
});

const RSVPComponent = ({ sessionId, currentRSVP, onRSVPChange }) => {
  const [rsvpStatus, setRsvpStatus] = useState(currentRSVP || 'No Response');

  useEffect(() => {
    const fetchRSVP = async () => {
      try {
        const response = await axios.get(`https://class-plus-final.onrender.com/api/session/${sessionId}/userRSVP`, { withCredentials: true });
        if (response.data.status) {
          setRsvpStatus(response.data.status); // Update state with fetched status
          onRSVPChange(response.data.status); // Also notify parent of the fetched status
        }
      } catch (error) {
        console.error("Failed to fetch RSVP status:", error);
      }
    };

    fetchRSVP();
  }, [sessionId, onRSVPChange]); // Ensure `onRSVPChange` is included as dependency

  const handleRSVP = async (event) => {
    const newStatus = event.target.value;
    setRsvpStatus(newStatus); 

    try {
      const response = await axios.post(
        `https://class-plus-final.onrender.com/api/session/${sessionId}/rsvp`,
        { status: newStatus },
        { withCredentials: true }
      );
      if (response.status === 200) {
        setRsvpStatus(response.data.newStatus); // Update state with the server's confirmed status
        onRSVPChange(response.data.newStatus); // Notify parent of the confirmed status
      }
    } catch (error) {
      console.error("Failed to update RSVP status:", error);
      // Revert to the last known valid state or currentRSVP if provided
      setRsvpStatus(currentRSVP || 'No Response');
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ mt: 2 }}>
        <Typography variant="subtitle1" component="span" sx={{ mr: 2 }}>
          RSVP:
        </Typography>
        <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
          <InputLabel id="rsvp-select-label">Status</InputLabel>
          <Select
            labelId="rsvp-select-label"
            id="rsvp-select"
            value={rsvpStatus}
            onChange={handleRSVP}
            label="Status"
          >
            <MenuItem value="No Response">No Response</MenuItem>
            <MenuItem value="ACCEPTED">Accepted</MenuItem>
            <MenuItem value="TENTATIVE">Tentative</MenuItem>
            <MenuItem value="DECLINED">Declined</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </ThemeProvider>
  );
};

export default RSVPComponent;
