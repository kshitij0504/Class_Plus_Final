import React from 'react';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ScheduleForm from '../Pages/Group/ScheduleForm';

const EventDrawer = ({ show, handleClose, groupId, handleAddEvent }) => {
  return (
    <Dialog
      open={show}
      onClose={handleClose}
      fullWidth
      maxWidth="md" 
      PaperProps={{
        style: { 
          backgroundColor: '#fff',
          color: '#fff',
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2 }}>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: '#000',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <ScheduleForm onClose={handleClose} groupId={groupId} handleAddEvent={handleAddEvent} />
      </DialogContent>
    </Dialog>
  );
};

export default EventDrawer;
