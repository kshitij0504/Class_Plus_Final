import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaUsers, FaRegCalendarAlt, FaCogs, FaUserPlus, FaBell, FaComments, FaUserFriends, FaTimes } from 'react-icons/fa';

const SidebarItem = ({ to, icon: Icon, text, onClick }) => {
  const navigate = useNavigate();

  const handleClick = (e) => {
    if (onClick) {
      onClick(e);
    }
    if (to) {
      e.preventDefault();
      navigate(to);
    }
  };

  return (
    <li>
      <button className="w-full text-left" onClick={handleClick}>
        <div className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 p-3 rounded-lg transition-all duration-300">
          <Icon className="text-xl" />
          <span className="text-sm md:text-base">{text}</span>
        </div>
      </button>
    </li>
  );
};

const Sidebar = ({ onClose, setShowModal, isLeader, setShowMembersDrawer }) => {
  const { id } = useParams();

  return (
    <div className="h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-blue-400">Menu</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <FaTimes className="text-xl" />
          </button>
        )}
      </div>
      <ul className="space-y-4">
        <SidebarItem
          to={`/groups/${id}`}
          icon={FaUsers}
          text="Overview"
          onClick={() => onClose && onClose()}
        />
        <SidebarItem
          onClick={() => {
            setShowMembersDrawer?.(true);
            onClose && onClose();
          }}
          icon={FaUserFriends}
          text="Group Members"
        />
        {isLeader && (
          <SidebarItem
            onClick={() => {
              setShowModal?.(true);
              onClose && onClose();
            }}
            icon={FaUserPlus}
            text="Add Members"
          />
        )}
        {isLeader && (
          <SidebarItem
            to={`/settings/${id}`}
            icon={FaCogs}
            text="Settings"
            onClick={() => onClose && onClose()}
          />
        )}
        <SidebarItem
          to={`/groups/${id}/chat`}
          icon={FaComments}
          text="Chat"
          onClick={() => onClose && onClose()}
        />
        <SidebarItem
          to={`/groups/${id}/announcement`}
          icon={FaComments}
          text="Announcement"
          onClick={() => onClose && onClose()}
        />
        <SidebarItem
          to="/notifications"
          icon={FaBell}
          text="Notifications"
          onClick={() => onClose && onClose()}
        />
      </ul>
    </div>
  );
};

export default Sidebar;