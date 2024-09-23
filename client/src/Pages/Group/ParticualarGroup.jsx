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

  useEffect(() => {
    const fetchGroup = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8000/api/groups/${id}` // Use relative URL for better deployment flexibility
        );
        setGroup(response.data.data);
        setJoinCode(response.data.data.joinCode);
        setMembers(response.data.data?.members || []);
        setEvents(response.data.data?.events || []);
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
      setMembers((prevMembers) => [...prevMembers, response.data.member]);
      setShowModal(false);
      setNewMember("");
    } catch (error) {
      console.error("Error adding member:", error);
    }
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
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      <SidebarComponent
        setShowModal={setShowModal}
        isLeader={isLeader}
        joinCode={joinCode}
        id={id}
      />

      {/* Group Info */}
      <div className="flex-1 p-4 sm:p-6 bg-gradient-to-r from-gray-900 to-black">
        <header className="bg-blue-600 text-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 flex flex-col sm:flex-row items-center justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{group.name}</h1>
            <p className="mt-2 text-lg">
              {group.description || "No description available."}
            </p>
          </div>
          <img src={groupIcon} alt="Group Icon" className="h-20 w-20 sm:h-40 sm:w-40" />
        </header>

        {/* Group Details */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 mb-8">
          <Card className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg border-none">
            <div className="flex items-center space-x-4">
              <FaUsers className="text-3xl text-blue-500" />
              <div>
                <h2 className="text-2xl font-semibold">Group Details</h2>
                <p className="text-lg mt-2">
                  <strong>Members:</strong> {members.length}
                </p>
              </div>
            </div>
          </Card>
          <Card className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg border-none">
            <div className="flex items-center space-x-4">
              <FaRegCalendarAlt className="text-3xl text-blue-500" />
              <div>
                <h3 className="text-2xl font-semibold">Upcoming Events</h3>
                {events.length > 0 ? (
                  events.map((event) => (
                    <div
                      key={event.id}
                      className="flex justify-between items-center mb-4"
                    >
                      <span>
                        {event.name} - {event.date}
                      </span>
                      <Button size="sm" color="info">
                        RSVP
                      </Button>
                    </div>
                  ))
                ) : (
                  <p>No events scheduled. Check back later!</p>
                )}
              </div>
            </div>
          </Card>
        </section>

        {/* Group Members */}
        <section className="bg-gray-800 p-4 sm:p-6 rounded-lg shadow-lg">
          <h3 className="text-2xl font-semibold mb-4">Group Members</h3>
          {members.length > 0 ? (
            members.map((member) => (
              <div key={member?.id} className="flex items-center mb-4">
                <Avatar img={member?.avatar} rounded />
                <div className="ml-4">
                  <p className="text-lg font-semibold">{member?.username}</p>
                  <Badge color={member?.role === "leader" ? "info" : "gray"}>
                    {member?.role || "member"}
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <p>No members listed. Add members to start collaborating!</p>
          )}
        </section>
      </div>

      {/* Add Member Modal */}
      {isLeader && (
        <Modal show={showModal} onClose={() => setShowModal(false)}>
          <Modal.Header>Add New Member</Modal.Header>
          <Modal.Body>
            <div className="flex flex-col space-y-4">
              <TextInput
                id="newMember"
                type="text"
                placeholder="Username or Email"
                value={newMember}
                onChange={(e) => setNewMember(e.target.value)}
              />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button onClick={handleAddMember}>Add Member</Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

const SidebarComponent = ({ id, setShowModal, isLeader, joinCode }) => (
  <div className="w-full sm:w-64 bg-gray-800 p-4 sm:p-6 flex flex-col sm:min-h-full rounded-lg sm:ml-4">
    <Tooltip content="Menu" placement="left">
      <h2 className="text-2xl font-semibold text-[#22d3ee] mb-4 sm:mb-8">Menu</h2>
    </Tooltip>
    <ul className="space-y-4 sm:space-y-6">
      <li>
        <Link
          to={`/group/${id}`}
          className="text-white flex items-center hover:bg-gray-700 p-2 sm:p-3 rounded-lg"
        >
          <FaUsers className="mr-3 text-blue-500" />
          Overview
        </Link>
      </li>
      {isLeader && (
        <li>
          <button
            className="text-white flex items-center hover:bg-gray-700 p-2 sm:p-3 rounded-lg w-full text-left"
            onClick={() => setShowModal(true)}
          >
            <FaUserPlus className="mr-3 text-blue-500" />
            Add Members
          </button>
        </li>
      )}
      {isLeader && (
        <li>
          <Link
            to={`/settings/${id}`}
            className="text-white flex items-center hover:bg-gray-700 p-2 sm:p-3 rounded-lg"
          >
            <FaCogs className="mr-3 text-blue-500" />
            Settings
          </Link>
        </li>
      )}
      <li>
        <Link
          to="/chat"
          className="text-white flex items-center hover:bg-gray-700 p-2 sm:p-3 rounded-lg"
        >
          <FaComments className="mr-3 text-blue-500" />
          Chat
        </Link>
      </li>
      <li>
        <Link
          to="/notifications"
          className="text-white flex items-center hover:bg-gray-700 p-2 sm:p-3 rounded-lg"
        >
          <FaBell className="mr-3 text-blue-500" />
          Notifications
        </Link>
      </li>
    </ul>
    <div className="text-gray-300 mt-auto pt-4 sm:pt-8">
      {isLeader && (
        <>
          <p className="text-sm">Invite Code:</p>
          <span className="text-lg">{joinCode}</span>
        </>
      )}
    </div>
  </div>
);

export default GroupDetail;
  