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
  Tab,
  Tabs,
  Paper,
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { 
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  Group as GroupIcon 
} from '@mui/icons-material';
import RSVPComponent from './RSVPComponent';
import '@fontsource/poppins';

const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, sans-serif',
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: '16px',
          padding: '12px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.95rem',
          minWidth: 100,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          borderRadius: '8px',
          padding: '8px 16px',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          marginBottom: '8px',
          '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.04)',
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          width: 40,
          height: 40,
        },
      },
    },
  },
  palette: {
    primary: {
      main: '#3f51b5',
    },
    success: {
      main: '#4caf50',
      light: '#e8f5e9',
    },
    warning: {
      main: '#ff9800',
      light: '#fff3e0',
    },
    error: {
      main: '#f44336',
      light: '#ffebee',
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
  const [tabValue, setTabValue] = React.useState(0);

  if (!event) return null;

  const handleRSVPChange = (newStatus) => {
    onRSVP(newStatus);
  };

  const getRSVPChipProps = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return { color: 'success', label: 'Attending', sx: { bgcolor: 'success.light' } };
      case 'DECLINED':
        return { color: 'error', label: 'Not Attending', sx: { bgcolor: 'error.light' } };
      case 'TENTATIVE':
        return { color: 'warning', label: 'Maybe', sx: { bgcolor: 'warning.light' } };
      default:
        return { color: 'default', label: 'No Response', sx: {} };
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <ThemeProvider theme={theme}>
      <Dialog
        open={show}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        aria-labelledby="event-detail-dialog-title"
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight={600} gutterBottom>
            {event.title}
          </Typography>
        </DialogTitle>

        <DialogContent>
          {/* Event Details Section */}
          <Box sx={{ mb: 3 }}>
            <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f5f5', borderRadius: 2 }}>
              <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarIcon color="primary" />
                  <Typography>
                    {new Date(event.startTime).toLocaleDateString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <TimeIcon color="primary" />
                  <Typography>
                    {new Date(event.startTime).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          </Box>

          {/* Description */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
            About
          </Typography>
          <Typography color="text.secondary" paragraph sx={{ mb: 3 }}>
            {event.description || 'No description available.'}
          </Typography>

          <Divider sx={{ my: 3 }} />

          {/* RSVP Section */}
          {!isLeader ? (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Your RSVP
                </Typography>
                <Chip {...getRSVPChipProps(rsvpStatus)} />
              </Box>
              <RSVPComponent
                sessionId={event.id}
                currentRSVP={rsvpStatus}
                onRSVPChange={handleRSVPChange}
              />
            </Box>
          ) : (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  Responses
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <GroupIcon />
                  <Typography variant="body2" fontWeight={500}>
                    {totalAccepted} attending
                  </Typography>
                </Box>
              </Box>

              {rsvpLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                  <CircularProgress />
                </Box>
              ) : (
                <>
                  <Tabs 
                    value={tabValue} 
                    onChange={handleTabChange}
                    variant="fullWidth"
                    sx={{ 
                      borderBottom: 1, 
                      borderColor: 'divider',
                      mb: 3 
                    }}
                  >
                    <Tab label={`Attending (${rsvps.ACCEPTED?.length || 0})`} />
                    <Tab label={`Maybe (${rsvps.TENTATIVE?.length || 0})`} />
                    <Tab label={`Not Attending (${rsvps.DECLINED?.length || 0})`} />
                  </Tabs>

                  {/* Tab Panels */}
                  <Box role="tabpanel" hidden={tabValue !== 0}>
                    {tabValue === 0 && (
                      <List>
                        {rsvps.ACCEPTED?.map((user) => (
                          <ListItem key={user.id}>
                            <ListItemAvatar>
                              <Avatar src={user.avatar || '/default-avatar.png'} />
                            </ListItemAvatar>
                            <ListItemText 
                              primary={user.username || user.email}
                            />
                          </ListItem>
                        ))}
                        {(!rsvps.ACCEPTED || rsvps.ACCEPTED.length === 0) && (
                          <Typography variant="body2" color="text.secondary">
                            No responses yet
                          </Typography>
                        )}
                      </List>
                    )}
                  </Box>

                  <Box role="tabpanel" hidden={tabValue !== 1}>
                    {tabValue === 1 && (
                      <List>
                        {rsvps.TENTATIVE?.map((user) => (
                          <ListItem key={user.id}>
                            <ListItemAvatar>
                              <Avatar src={user.avatar || '/default-avatar.png'} />
                            </ListItemAvatar>
                            <ListItemText 
                              primary={user.username || user.email}
                            />
                          </ListItem>
                        ))}
                        {(!rsvps.TENTATIVE || rsvps.TENTATIVE.length === 0) && (
                          <Typography variant="body2" color="text.secondary">
                            No responses yet
                          </Typography>
                        )}
                      </List>
                    )}
                  </Box>

                  <Box role="tabpanel" hidden={tabValue !== 2}>
                    {tabValue === 2 && (
                      <List>
                        {rsvps.DECLINED?.map((user) => (
                          <ListItem key={user.id}>
                            <ListItemAvatar>
                              <Avatar src={user.avatar || '/default-avatar.png'} />
                            </ListItemAvatar>
                            <ListItemText 
                              primary={user.username || user.email}
                            />
                          </ListItem>
                        ))}
                        {(!rsvps.DECLINED || rsvps.DECLINED.length === 0) && (
                          <Typography variant="body2" color="text.secondary">
                            No responses yet
                          </Typography>
                        )}
                      </List>
                    )}
                  </Box>
                </>
              )}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button 
            onClick={handleClose} 
            variant="contained"
            disableElevation
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
};

export default EventDetailModal;