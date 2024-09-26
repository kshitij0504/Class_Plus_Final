import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Chip,
  Divider
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CalendarToday as CalendarIcon } from '@mui/icons-material';
import RSVPComponent from './RSVPComponent';
import '@fontsource/poppins';

const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
  palette: {
    primary: {
      main: '#3f51b5',
    },
    secondary: {
      main: '#f50057',
    },
    success: {
      main: '#4caf50',
    },
    warning: {
      main: '#ff9800',
    },
    error: {
      main: '#f44336',
    },
  },
  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: 'Poppins, sans-serif',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          padding: '8px 16px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          padding: '16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontSize: '14px',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          margin: '16px 0',
        },
      },
    },
  },
});

const EventDetailModal = ({ show, handleClose, event, onRSVP, rsvpStatus }) => {
  if (!event) return null;

  const handleRSVPChange = (newStatus) => {
    onRSVP(newStatus);
  };

  const getRSVPChipColor = () => {
    switch (rsvpStatus) {
      case 'ACCEPTED':
        return 'success';
      case 'DECLINED':
        return 'error';
      case 'TENTATIVE':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getRSVPChipLabel = () => {
    switch (rsvpStatus) {
      case 'ACCEPTED':
        return 'You have accepted';
      case 'DECLINED':
        return 'You have declined';
      case 'TENTATIVE':
        return 'You are tentative';
      default:
        return 'No Response';
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={show}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        aria-labelledby="event-detail-dialog-title"
        aria-describedby="event-detail-dialog-description"
      >
        <DialogTitle id="event-detail-dialog-title">
          <Typography variant="h5" component="div" gutterBottom>
            {event.title}
          </Typography>
        </DialogTitle>
        <Divider />
        <DialogContent>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <CalendarIcon color="primary" sx={{ mr: 1 }} />
              <Typography variant="subtitle1" color="textPrimary">
                {event.date || 'No date provided'}
              </Typography>
            </Box>
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <Typography variant="body1" color="textSecondary">
              {event.description || 'No description available.'}
            </Typography>
            <Divider />
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                RSVP
              </Typography>
              <Chip
                label={getRSVPChipLabel()}
                color={getRSVPChipColor()}
                sx={{ mb: 2 }}
              />
              <RSVPComponent
                sessionId={event.id}
                currentRSVP={rsvpStatus}
                onRSVPChange={handleRSVPChange}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary" variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default EventDetailModal;
