import React from 'react';
import { Button, Modal } from 'flowbite-react';
import ScheduleForm from '../Pages/Group/ScheduleForm';

const EventDrawer = ({ show, handleClose, groupId }) => {
  return (
    <Modal show={show} onClose={handleClose} size="lg" className='bg-gray-950'>
      <Modal.Header className='border-none bg-gray-900'> {/* Ensure text-white class here */}
      </Modal.Header>
      <Modal.Body className='bg-gray-900 mt-0'> {/* Ensure text-white class here */}
        <ScheduleForm onClose={handleClose} groupId={groupId} />
      </Modal.Body>
    </Modal>
  );
};

export default EventDrawer;
