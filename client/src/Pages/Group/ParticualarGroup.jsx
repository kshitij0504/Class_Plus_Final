import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useParams, Link } from "react-router-dom";
import {
  Card,
  Button,
  Spinner,
  Avatar,
  Badge,
  Modal,
  TextInput,
  Tooltip,
} from "flowbite-react";
import axios from "axios";
import {
  FaUsers,
  FaRegCalendarAlt,
  FaCogs,
  FaUserPlus,
  FaBell,
  FaComments,
} from "react-icons/fa";
import EventDrawer from "../../Components/EventDrawer";
import EventDetailModal from "../../Components/EventDetailDrawer";
import groupIcon from "../../assets/Group.svg"; // Ensure the path is correct

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

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/groups/${id}`
        );
        setGroup(response.data.data);
        setJoinCode(response.data.data.joinCode);
        setMembers(response.data.data?.members || []);

        const sessionsResponse = await axios.get(
          `http://localhost:8000/api/groups/${id}/sessions`,
          { withCredentials: true }
        );

        console.log(sessionsResponse);
        setEvents(sessionsResponse.data.data || []);
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
        `http://localhost:8000/api/groups/${id}/add-member`,
        { username: newMember }
      );
      setShowModal(false);

      setMembers((prevMembers) => [...prevMembers, response.data.member]);
      console.log(members)
      setNewMember("");
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleAddEvent = (newEvent) => {
    console.log(newEvent)
    setEvents((prevEvents) => [newEvent, ...prevEvents]);
    setShowDrawer(false);
  };

  const handleOpenDrawer = () => {
    setShowDrawer(true);
  };

  const handleCloseDrawer = () => {
    setShowDrawer(false);
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setShowEventDrawer(true);
  };

  const handleRSVP = (status) => {
    setRsvpStatus(status);
    setSelectedEvent((prevEvent) => ({
      ...prevEvent,
      isRSVP: true,
    }));
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-900 to-blue-900 text-white font-poppins">
      {/* Sidebar */}
      <SidebarComponent
        setShowModal={setShowModal}
        isLeader={isLeader}
        joinCode={joinCode}
        id={id}
      />

      {/* Main Content */}
      <div className="flex-1 p-4 lg:p-8">
        <header className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl mb-8 overflow-hidden">
          <div className="flex flex-col md:flex-row items-center justify-between p-6 md:p-8">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{group.name}</h1>
              <p className="mt-2 text-lg text-blue-100">{group.description || "No description available."}</p>
            </div>
            <img
              src={group.icon || "https://via.placeholder.com/150"}
              alt="Group Icon"
              className="h-24 w-24 md:h-32 md:w-32 rounded-full border-4 border-white shadow-lg"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-gray-800 border-none shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-600 rounded-full">
                <FaUsers className="text-3xl text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold">Group Details</h2>
                <p className="text-lg mt-2">
                  <span className="font-medium text-blue-400">Members:</span> {members.length}
                </p>
              </div>
            </div>
          </Card>

          <Card className="bg-gray-800 border-none shadow-xl hover:shadow-2xl transition-shadow duration-300">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-600 rounded-full">
                    <FaRegCalendarAlt className="text-2xl text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold">Upcoming Events</h3>
                </div>
                {isLeader && (
                  <Button
                    onClick={handleOpenDrawer}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-medium py-2 px-4 rounded-full transition-all duration-300 ease-in-out transform hover:scale-105"
                  >
                    Add Event
                  </Button>
                )}
              </div>
              <div className="flex-grow overflow-y-auto scrollbar-hide" style={{ maxHeight: "300px" }}>
                {events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <EventCard key={event.id} event={event} onClick={() => handleEventClick(event)} />
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400 text-center py-8">No events scheduled. Check back later!</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Group Members Section */}
        <section className="mt-8 bg-gray-800 rounded-2xl shadow-xl p-6">
          <h3 className="text-2xl font-semibold mb-6">Group Members</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {members.length > 0 ? (
              members.map((member) => (
                <MemberCard key={member.id} member={member} isLeader={member.id === group.leaderId} />
              ))
            ) : (
              <p className="col-span-full text-center text-gray-400">No members listed. Add members to start collaborating!</p>
            )}
          </div>
        </section>
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
        handleClose={handleCloseDrawer}
        groupId={id}
      />

      <EventDetailModal
        show={showEventDrawer}
        handleClose={() => setShowEventDrawer(false)}
        event={selectedEvent}
        rsvpStatus={rsvpStatus}
        onRSVP={handleRSVP}
      />
    </div>
  );
};

const SidebarComponent = ({ id, setShowModal, isLeader }) => (
  <div className="w-full lg:w-64 bg-gray-800 p-6 flex flex-col rounded-2xl shadow-xl ml-2 h-screen mt-1">
    <h2 className="text-2xl font-semibold text-blue-400 mb-8">Menu</h2>
    <ul className="space-y-4">
      <SidebarItem to={`/groups/${id}`} icon={FaUsers} text="Overview" />
      {isLeader && (
        <SidebarItem onClick={() => setShowModal(true)} icon={FaUserPlus} text="Add Members" />
      )}
      {isLeader && (
        <SidebarItem to={`/settings/${id}`} icon={FaCogs} text="Settings" />
      )}
      <SidebarItem to="/chat" icon={FaComments} text="Chat" />
      <SidebarItem to="/notifications" icon={FaBell} text="Notifications" />
    </ul>
  </div>
);

const SidebarItem = ({ to, icon: Icon, text, onClick }) => {
  const content = (
    <div className="flex items-center space-x-3 text-gray-300 hover:text-white hover:bg-gray-700 p-3 rounded-lg transition-all duration-300">
      <Icon className="text-xl" />
      <span>{text}</span>
    </div>
  );

  return onClick ? (
    <li>
      <button className="w-full text-left" onClick={onClick}>
        {content}
      </button>
    </li>
  ) : (
    <li>
      <Link to={to}>{content}</Link>
    </li>
  );
};

const EventCard = ({ event, onClick }) => {
  const startTime = new Date(event.startTime).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <div
      className="bg-gray-700 hover:bg-gray-600 transition-all p-4 rounded-lg cursor-pointer transform"
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-yellow-500 rounded-full">
            <FaRegCalendarAlt className="text-xl text-white" />
          </div>
          <div>
            <h4 className="text-lg font-bold">{event.title}</h4>
            <p className="text-blue-300">{startTime}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-400">
            {new Date(event.startTime).toLocaleDateString()}
          </span>
        </div>
      </div>
    </div>
  );
};

const MemberCard = ({ member, isLeader }) => (
  <div className="bg-gray-700 p-4 rounded-lg flex items-center space-x-4">
    <Avatar img={member?.avatar} rounded size="lg" />
    <div>
      <p className="text-lg font-semibold">{member?.username}</p>
      <Badge color={isLeader ? "info" : "gray"} className="mt-1">
        {isLeader ? "Leader" : "Member"}
      </Badge>
    </div>
  </div>
);

const AddMemberModal = ({ showModal, setShowModal, newMember, setNewMember, handleAddMember }) => (
  <Modal show={showModal} onClose={() => setShowModal(false)}>
    <Modal.Header>Add New Member</Modal.Header>
    <Modal.Body>
      <div className="space-y-6">
        <TextInput
          type="text"
          placeholder="Enter username"
          value={newMember}
          onChange={(e) => setNewMember(e.target.value)}
        />
      </div>
    </Modal.Body>
    <Modal.Footer>
      <Button onClick={handleAddMember}>Add</Button>
      <Button color="gray" onClick={() => setShowModal(false)}>
        Cancel
      </Button>
    </Modal.Footer>
  </Modal>
);


export default GroupDetail;
