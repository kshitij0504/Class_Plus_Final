// EventDetailModal.js
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
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  CircularProgress,
  Grid,
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
    MuiListItem: {
      styleOverrides: {
        root: {
          paddingLeft: '0',
          paddingRight: '0',
        },
      },
    },
  },
});

const EventDetailModal = ({
  show,
  handleClose,
  event,
  onRSVP,
  rsvpStatus,
  rsvps,
  totalAccepted,
  isLeader,
  rsvpLoading,
}) => {
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
        maxWidth="md"
        fullWidth
        aria-labelledby="event-detail-dialog-title"
        aria-describedby="event-detail-dialog-description"
      >
        {/* Dialog Title */}
        <DialogTitle id="event-detail-dialog-title">
          <Typography variant="h5" component="div" gutterBottom>
            {event.title}
          </Typography>
        </DialogTitle>

        <Divider />

        {/* Dialog Content */}
        <DialogContent dividers>
          {/* Event Date */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <CalendarIcon color="primary" sx={{ mr: 1 }} />
            <Typography variant="subtitle1" color="textPrimary">
              {new Date(event.startTime).toLocaleDateString()} at{' '}
              {new Date(event.startTime).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true,
              })}
            </Typography>
          </Box>

          {/* Event Description */}
          <Typography variant="h6" gutterBottom>
            Details
          </Typography>
          <Typography variant="body1" color="textSecondary" paragraph>
            {event.description || 'No description available.'}
          </Typography>

          <Divider />

          {/* Conditional Rendering Based on Leadership */}
          {!isLeader ? (
            // **For Regular Users**
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                RSVP
              </Typography>

              {/* Current User's RSVP Status */}
              <Chip
                label={getRSVPChipLabel()}
                color={getRSVPChipColor()}
                sx={{ mb: 2 }}
              />

              {/* RSVP Component to Change Status */}
              <RSVPComponent
                sessionId={event.id}
                currentRSVP={rsvpStatus}
                onRSVPChange={handleRSVPChange}
              />
            </Box>
          ) : (
            // **For Leaders**
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                RSVP Details
              </Typography>

              {/* Loading Indicator */}
              {rsvpLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  {/* Total Accepted RSVPs */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Chip
                      label={`Total Accepted: ${totalAccepted}`}
                      color="success"
                      sx={{ mr: 2 }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    {/* Accepted RSVPs */}
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle1" gutterBottom>
                        Accepted
                      </Typography>
                      {rsvps.ACCEPTED && rsvps.ACCEPTED.length > 0 ? (
                        <List>
                          {rsvps.ACCEPTED.map((user) => (
                            <ListItem key={user.id}>
                              <ListItemAvatar>
                                <Avatar
                                  alt={user.username || user.email}
                                  src={user.avatar || '/default-avatar.png'}
                                />
                              </ListItemAvatar>
                              <ListItemText
                                primary={user.username || user.email}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No accepted RSVPs.
                        </Typography>
                      )}
                    </Grid>

                    {/* Declined RSVPs */}
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle1" gutterBottom>
                        Declined
                      </Typography>
                      {rsvps.DECLINED && rsvps.DECLINED.length > 0 ? (
                        <List>
                          {rsvps.DECLINED.map((user) => (
                            <ListItem key={user.id}>
                              <ListItemAvatar>
                                <Avatar
                                  alt={user.username || user.email}
                                  src={user.avatar || '/default-avatar.png'}
                                />
                              </ListItemAvatar>
                              <ListItemText
                                primary={user.username || user.email}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No declined RSVPs.
                        </Typography>
                      )}
                    </Grid>

                    {/* Tentative RSVPs */}
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle1" gutterBottom>
                        Tentative
                      </Typography>
                      {rsvps.TENTATIVE && rsvps.TENTATIVE.length > 0 ? (
                        <List>
                          {rsvps.TENTATIVE.map((user) => (
                            <ListItem key={user.id}>
                              <ListItemAvatar>
                                <Avatar
                                  alt={user.username || user.email}
                                  src={user.avatar || '/default-avatar.png'}
                                />
                              </ListItemAvatar>
                              <ListItemText
                                primary={user.username || user.email}
                              />
                            </ListItem>
                          ))}
                        </List>
                      ) : (
                        <Typography variant="body2" color="textSecondary">
                          No tentative RSVPs.
                        </Typography>
                      )}
                    </Grid>
                  </Grid>
                </>
              )}
            </Box>
          )}
        </DialogContent>

        {/* Dialog Actions */}
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
