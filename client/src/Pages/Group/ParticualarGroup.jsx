import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Card,
  Button,
  Spinner,
  Avatar,
  Badge,
  Modal,
  TextInput,
} from "flowbite-react";
import axios from "axios";
import {
  FaUsers,
  FaRegCalendarAlt,
  FaCogs,
  FaUserPlus,
  FaBell,
  FaComments,
  FaUserFriends,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { LuFiles } from "react-icons/lu";
import EventDrawer from "../../Components/EventDrawer";
import EventDetailModal from "../../Components/EventDetailDrawer";
import groupIcon from "../../assets/Group.svg";
import MembersDrawer from "@/Components/MembersDrawer";
import { GrAnnounce } from "react-icons/gr";
import { FaNoteSticky } from "react-icons/fa6";
import { Presentation } from "lucide-react";
import { FaFile } from "react-icons/fa";
import { FaTowerBroadcast } from "react-icons/fa6";
import { PiPresentationFill } from "react-icons/pi";

const GroupDetail = () => {
  const { currentUser } = useSelector((state) => state.user || {});
  const { id } = useParams();
  const [group, setGroup] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [events, setEvents] = useState([]);
  const [newMember, setNewMember] = useState("");
  const [isLeader, setIsLeader] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEventDrawer, setShowEventDrawer] = useState(false);
  const [rsvpStatus, setRsvpStatus] = useState(null);
  const [eventRSVPs, setEventRSVPs] = useState({
    ACCEPTED: [],
    DECLINED: [],
    TENTATIVE: [],
  });
  const [totalAccepted, setTotalAccepted] = useState(0);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [showMembersDrawer, setShowMembersDrawer] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await axios.get(
          `https://class-plus-final.onrender.com/api/groups/${id}`
        );
        setGroup(response.data.data);
        setJoinCode(response.data.data.joinCode);
        setMembers(response.data.data?.members || []);

        const sessionsResponse = await axios.get(
          `https://class-plus-final.onrender.com/api/groups/${id}/sessions`,
          { withCredentials: true }
        );

        if (Array.isArray(sessionsResponse.data.data)) {
          setEvents(sessionsResponse.data.data);
        } else {
          setEvents([]);
        }

        const announcementsResponse = await axios.get(
          `https://class-plus-final.onrender.com/api/groups/${id}/announcements`,
          { withCredentials: true }
        );

        if (Array.isArray(announcementsResponse.data.data)) {
          setAnnouncements(announcementsResponse.data.data.slice(0, 3)); // Get top 3 announcements
        }

        if (currentUser.id === response.data.data.leaderId) {
          setIsLeader(true);
        }
      } catch (error) {
        console.error("Error fetching group details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGroup();
  }, [id, currentUser]);

  const handleAddMember = async () => {
    try {
      const response = await axios.post(
        `https://class-plus-final.onrender.com/api/groups/${id}/add-member`,
        { username: newMember }
      );

      setMembers((prevMembers) => [
        ...prevMembers,
        response.data.data.newMember,
      ]);
      setShowModal(false);
      setNewMember("");
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleAddEvent = (newEvent) => {
    setEvents((prevEvents) => [newEvent, ...prevEvents]);
    setShowDrawer(false);
  };

  const handleEventClick = async (event) => {
    setSelectedEvent(event);
    if (isLeader) {
      setRsvpLoading(true);
      try {
        const response = await axios.get(
          `https://class-plus-final.onrender.com/api/session/${event.id}/getAllrsvp`,
          {
            withCredentials: true,
          }
        );

        const categorizedRSVPs = {
          ACCEPTED: [],
          DECLINED: [],
          TENTATIVE: [],
        };

        response.data.data.forEach((rsvp) => {
          const status = rsvp.status.toUpperCase();
          if (categorizedRSVPs[status]) {
            categorizedRSVPs[status].push(rsvp.user);
          }
        });

        setEventRSVPs(categorizedRSVPs);
        setTotalAccepted(categorizedRSVPs.ACCEPTED.length);
      } catch (error) {
        console.error("Error fetching RSVP data:", error);
      } finally {
        setRsvpLoading(false);
      }
    }
    setShowEventDrawer(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-900 to-gray-800 text-white">
        <Spinner size="xl" />
      </div>
    );
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-900 to-gray-800 text-white">
        No group found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white font-poppins">
      {/* Mobile Header */}
      <div className="lg:hidden flex items-center justify-between p-4 bg-gray-800">
        <Button
          color="gray"
          className="p-2 ml-12"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? (
            <FaTimes className="text-xl" />
          ) : (
            <FaBars className="text-xl" />
          )}
        </Button>
        <h1 className="text-xl font-bold">{group.name}</h1>
      </div>

      <div className="flex flex-col lg:flex-row">
        {/* Sidebar - Mobile Drawer */}
        <div
          className={`lg:hidden fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 transform ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out`}
        >
          <SidebarComponent
            id={id}
            setShowModal={setShowModal}
            isLeader={isLeader}
            setShowMembersDrawer={setShowMembersDrawer}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </div>

        {/* Sidebar - Desktop */}
        <div className="hidden ml-1 mt-1 rounded-xl lg:block lg:w-64 bg-gray-800 p-6 fixed min-h-screen">
          <SidebarComponent
            id={id}
            setShowModal={setShowModal}
            isLeader={isLeader}
            setShowMembersDrawer={setShowMembersDrawer}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 lg:ml-64 lg:pt-2 p-4 lg:p-8 ">
          {/* Header Card */}
          <header className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl mb-3 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center justify-between p-4 md:p-8 space-y-4 md:space-y-0">
              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
                  {group.name}
                </h1>
                <p className="mt-2 text-sm md:text-lg text-blue-100">
                  {group.description || "No description available."}
                </p>
              </div>
              <img
                src={groupIcon}
                alt="Group Icon"
                className="h-20 w-20 md:h-32 md:w-32 rounded-full border-4 border-white shadow-lg"
              />
            </div>
          </header>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-4">
            {/* Group Stats Card */}
            <Card className="bg-gray-800 border-none shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-blue-600 rounded-full">
                  <FaUsers className="text-2xl md:text-3xl text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold">
                    Group Details
                  </h2>
                  <p className="text-base md:text-lg mt-2">
                    <span className="font-medium text-blue-400">Members:</span>{" "}
                    {members.length}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="bg-gray-800 border-none shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-600 rounded-full">
                    <GrAnnounce className="text-xl md:text-2xl text-white" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold">
                    Latest Announcements
                  </h3>
                </div>
              </div>
              <div className="space-y-3">
                {announcements.length > 0 ? (
                  announcements.map((announcement) => (
                    <AnnouncementCard key={announcement.id} announcement={announcement} />
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-4">
                    No announcements yet
                  </p>
                )}
              </div>
            </Card>

            {/* Quick Actions Card */}
            <Card className="bg-gray-800 border-none shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-purple-600 rounded-full">
                  <FaCogs className="text-2xl md:text-3xl text-white" />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-semibold">
                    Quick Actions
                  </h2>
                  <div className="mt-4 space-y-2">
                    <Button onClick={() => setShowMembersDrawer(true)} className="w-full">
                      View Members
                    </Button>
                    {isLeader && (
                      <Button onClick={() => setShowDrawer(true)} className="w-full">
                        Create Event
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            {/* Events Card */}
            <Card className="bg-gray-800 border-none shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-purple-600 rounded-full">
                      <FaRegCalendarAlt className="text-xl md:text-2xl text-white" />
                    </div>
                    <h3 className="text-xl md:text-2xl font-semibold">
                      Upcoming Events
                    </h3>
                  </div>
                  {isLeader && (
                    <Button
                      onClick={() => setShowDrawer(true)}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white text-sm md:text-base font-medium py-1 md:py-2 px-2 md:px-4 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
                    >
                      Add Event
                    </Button>
                  )}
                </div>
                <div
                  className="flex-grow overflow-y-auto scrollbar-hide"
                  style={{ maxHeight: "300px" }}
                >
                  {events.length > 0 ? (
                    <div className="space-y-3 md:space-y-4">
                      {events.map((event) => (
                        <EventCard
                          key={event.id}
                          event={event}
                          onClick={() => handleEventClick(event)}
                        />
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-center py-8">
                      No events scheduled. Check back later!
                    </p>
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      
      {/* Modals and Drawers */}
      <AddMemberModal
        showModal={showModal}
        setShowModal={setShowModal}
        newMember={newMember}
        setNewMember={setNewMember}
        handleAddMember={handleAddMember}
      />

      <EventDrawer
        show={showDrawer}
        handleClose={() => setShowDrawer(false)}
        groupId={id}
        handleAddEvent={handleAddEvent}
      />

      <EventDetailModal
        show={showEventDrawer}
        handleClose={() => setShowEventDrawer(false)}
        event={selectedEvent}
        rsvpStatus={rsvpStatus}
        onRSVP={(status) => {
          setRsvpStatus(status);
          setSelectedEvent((prev) => ({ ...prev, isRSVP: true }));
        }}
        rsvps={isLeader ? eventRSVPs : null}
        totalAccepted={isLeader ? totalAccepted : null}
        isLeader={isLeader}
        rsvpLoading={rsvpLoading}
      />

      <MembersDrawer
        show={showMembersDrawer}
        handleClose={() => setShowMembersDrawer(false)}
        members={members}
        groupLeaderId={group.leaderId}
      />
    </div>
  );
};

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

  const content = (
    <div className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 p-3 rounded-lg transition-all duration-300">
      <Icon className="text-xl" />
      <span className="text-sm md:text-base">{text}</span>
    </div>
  );

  return (
    <li>
      <button className="w-full text-left" onClick={handleClick}>
        {content}
      </button>
    </li>
  );
};

const SidebarComponent = ({
  id,
  setShowModal,
  isLeader,
  setShowMembersDrawer,
  onClose,
}) => (
  <div className="h-full ml-2 overflow-y-auto">
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
          setShowMembersDrawer(true);
          onClose && onClose();
        }}
        icon={FaUserFriends}
        text="Group Members"
      />
      {isLeader && (
        <SidebarItem
          onClick={() => {
            setShowModal(true);
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
        to={`/group/${id}/announcement`}
        icon={FaTowerBroadcast}
        text="Announcement"
        onClick={() => onClose && onClose()}
        state={ isLeader}
      />
      <SidebarItem
        to={`/groups/${id}/video`}
        icon={FaTowerBroadcast}
        text="Meeting"
        onClick={() => onClose && onClose()}
        state={ isLeader}
      />
      <SidebarItem
        to={`/group/${id}/note`}
        icon={FaNoteSticky}
        text="Notes"
        onClick={() => onClose && onClose()}
      />
      <SidebarItem
        to={`/groups/${id}/filesection`}
        icon={FaFile}
        text="Files"
        onClick={() => onClose && onClose()}
      />
      <SidebarItem
        to={`/meeting-list/${id}`}
        icon={PiPresentationFill}
        text="Previous Meetings"
        onClick={() => onClose && onClose()}
      />
    </ul>
  </div>
);

const EventCard = ({ event, onClick }) => {
  const startTime = new Date(event.startTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const formattedDate = new Date(event.startTime).toLocaleDateString(
    undefined,
    {
      month: "short",
      day: "numeric",
    }
  );

  return (
    <div
      className="bg-gray-700 hover:bg-gray-600 transition-all p-3 md:p-4 rounded-lg cursor-pointer transform hover:scale-102 hover:shadow-lg"
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-yellow-500 rounded-full hidden sm:block">
            <FaRegCalendarAlt className="text-lg md:text-xl text-white" />
          </div>
          <div>
            <h4 className="text-base md:text-lg font-bold truncate max-w-[150px] md:max-w-[200px]">
              {event.title}
            </h4>
            <p className="text-blue-300 text-sm md:text-base">{startTime}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-xs md:text-sm text-gray-400">
            {formattedDate}
          </span>
          <Badge color="purple" className="ml-2 text-xs hidden md:inline-block">
            {event.isRSVP ? "RSVP'd" : "Open"}
          </Badge>
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-400 truncate">
        {event.description || "No description available"}
      </div>
    </div>
  );
};

const AddMemberModal = ({
  showModal,
  setShowModal,
  newMember,
  setNewMember,
  handleAddMember,
}) => (
  <Modal
    show={showModal}
    onClose={() => setShowModal(false)}
    className="dark:bg-gray-800"
  >
    <Modal.Header className="border-b border-gray-600">
      <h3 className="text-lg md:text-xl font-semibold text-white">
        Add New Member
      </h3>
    </Modal.Header>
    <Modal.Body className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="username"
          className="block text-sm font-medium text-gray-300"
        >
          Username
        </label>
        <TextInput
          id="username"
          type="text"
          placeholder="Enter username"
          value={newMember}
          onChange={(e) => setNewMember(e.target.value)}
          className="w-full"
          required
        />
        <p className="text-xs text-gray-400">
          Enter the username of the person you want to add to the group
        </p>
      </div>
    </Modal.Body>
    <Modal.Footer className="border-t border-gray-600">
      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
        <Button
          onClick={handleAddMember}
          disabled={!newMember.trim()}
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
        >
          Add Member
        </Button>
        <Button
          color="gray"
          onClick={() => setShowModal(false)}
          className="w-full sm:w-auto"
        >
          Cancel
        </Button>
      </div>
    </Modal.Footer>
  </Modal>
);

const AnnouncementCard = ({ announcement }) => {
  const formattedDate = new Date(announcement.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="p-3 bg-gray-700 rounded-lg">
      <div className="flex justify-between items-start mb-2">
        <h4 className="font-semibold text-blue-300 truncate max-w-[200px]">
          {announcement.title}
        </h4>
        <span className="text-xs text-gray-400">{formattedDate}</span>
      </div>
      <p className="text-sm text-gray-300 line-clamp-2">
        {announcement.content}
      </p>
    </div>
  );
};

export default GroupDetail;