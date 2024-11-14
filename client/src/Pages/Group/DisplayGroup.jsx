import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Navbar,
  Button,
  Modal,
  Dropdown,
  TextInput,
  Textarea,
  Label,
  Alert,
  Card,
  Select,
} from "flowbite-react";
import { HiPlus, HiTrash, HiUserGroup, HiAcademicCap, HiGlobe } from "react-icons/hi";
import axios from "axios";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";

const DisplayGroup = () => {
  const { currentUser } = useSelector((state) => state.user || {});
  const [groups, setGroups] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("PRIVATE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [groupGradients, setGroupGradients] = useState({});
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [groupToDelete, setGroupToDelete] = useState(null);
  const [joinCode, setJoinCode] = useState("");
  const [openJoinModal, setOpenJoinModal] = useState(false);

  useEffect(() => {
    const memberId = currentUser.id;
    if (memberId) {
      fetchGroups(memberId);
      fetchPublicGroups();
    }
  }, [currentUser]);

  const fetchPublicGroups = async () => {
    try {
      const response = await axios.get(
        "https://class-plus-final.onrender.com/api/groups/public",{
          withCredentials:true
        }
      );
      const data = response.data.data || [];

      // Filter out groups the user is already a member of
      const filteredPublicGroups = data.filter(
        (publicGroup) =>
          !groups.some((userGroup) => userGroup.id === publicGroup.id)
      );

      setPublicGroups(filteredPublicGroups);

      const gradients = {};
      filteredPublicGroups.forEach((group) => {
        gradients[group.id] = getRandomGradient();
      });
      setGroupGradients((prev) => ({ ...prev, ...gradients }));
    } catch (error) {
      console.error("Error fetching public groups:", error);
    }
  };

  const fetchGroups = async (memberId) => {
    try {
      const response = await axios.get(
        `https://class-plus-final.onrender.com/api/displaygroups?memberId=${memberId}`
      );
      const data = response.data.data || [];
      setGroups(Array.isArray(data) ? data : []);

      const gradients = {};
      data.forEach((group) => {
        gradients[group.id] = getRandomGradient();
      });
      setGroupGradients((prev) => ({ ...prev, ...gradients }));
    } catch (error) {
      console.error("Error fetching groups:", error);
    }
  };

  const handleJoinPublicGroup = async (groupId) => {
    setLoading(true);
    try {
      const response = await axios.post(
        `https://class-plus-final.onrender.com/api/groups/${groupId}/join`,
        {},
        {
          withCredentials: true,
        }
      );

      const joinedGroup = response.data.data;
      setGroups((prevGroups) => [...prevGroups, joinedGroup]);
      setPublicGroups((prevGroups) =>
        prevGroups.filter((group) => group.id !== groupId)
      );
      toast.success("Successfully joined the group!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to join group");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "https://class-plus-final.onrender.com/api/creategroup",
        { name, description, visibility },
        { withCredentials: true }
      );

      toast.success("Group created successfully!");

      const newGroup = response.data.data;
      setGroups((prevGroups) => [...prevGroups, newGroup]);

      setGroupGradients((prevGradients) => ({
        ...prevGradients,
        [newGroup.id]: getRandomGradient(),
      }));

      setName("");
      setDescription("");
      setVisibility("PRIVATE");
      setOpenCreateModal(false);

      // Refresh public groups if the new group is public
      if (visibility === "PUBLIC") {
        fetchPublicGroups();
      }
    } catch (err) {
      toast.error("Failed to create group. Please try again.");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        "https://class-plus-final.onrender.com/api/join",
        { code: joinCode },
        {
          withCredentials: true,
        }
      );

      const joinedGroup = response.data.data;
      setGroups((prevGroups) => [...prevGroups, joinedGroup]);
      setGroupGradients((prevGradients) => ({
        ...prevGradients,
        [joinedGroup.id]: getRandomGradient(),
      }));

      toast.success("Successfully joined the group!");
      setJoinCode("");
      setOpenJoinModal(false);
    } catch (err) {
      toast.error("Failed to join group. Please try again.");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmation !== "delete") {
      toast.error("Please type 'delete' to confirm.");
      return;
    }

    setLoading(true);
    setError(null);
    console.log(groupToDelete);
    try {
      await axios.delete(`https://class-plus-final.onrender.com/api/group/${groupToDelete}`, {
        withCredentials: true,
      });

      toast.success("Group deleted successfully!");

      setGroups((prevGroups) =>
        prevGroups.filter((group) => group.id !== groupToDelete)
      );
      setOpenDeleteModal(false);
      setDeleteConfirmation("");
    } catch (err) {
      toast.error("Failed to delete group. Please try again.");
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirmationModal = (groupId) => {
    setGroupToDelete(groupId);
    setOpenDeleteModal(true);
  };

  const getRandomGradient = () => {
    const gradients = [
      "bg-gradient-to-r from-red-500 to-yellow-500",
      "bg-gradient-to-r from-blue-500 to-purple-500",
      "bg-gradient-to-r from-green-500 to-teal-500",
      "bg-gradient-to-r from-yellow-500 to-orange-500",
      "bg-gradient-to-r from-purple-500 to-pink-500",
      "bg-gradient-to-r from-teal-500 to-blue-500",
      "bg-gradient-to-r from-orange-500 to-red-500",
    ];
    return gradients[Math.floor(Math.random() * gradients.length)];
  };

  const leaderGroups = groups.filter(
    (group) => group.leaderId === currentUser.id
  );
  const memberGroups = groups.filter(
    (group) => group.leaderId !== currentUser.id
  );

  return (
    <>
      <div className="min-h-screen bg-gray-900 font-poppins">
        <Navbar className="bg-gray-800 border-b text-3xl h-20 border-gray-700">
          <div className="container mx-auto flex justify-between items-center mt-3">
            <Navbar.Brand as={Link} to="/">
              <span className="self-center whitespace-nowrap text-3xl font-semibold dark:text-white">
                ClassPlus
              </span>
            </Navbar.Brand>
            <div className="flex md:order-2">
              <Dropdown label="Manage Groups" color="blue" size="sm">
                <Dropdown.Item
                  icon={HiPlus}
                  onClick={() => setOpenCreateModal(true)}
                >
                  Create Group
                </Dropdown.Item>
                <Dropdown.Item
                  icon={HiUserGroup}
                  onClick={() => setOpenJoinModal(true)}
                >
                  Join Group
                </Dropdown.Item>
              </Dropdown>
            </div>
          </div>
        </Navbar>

        <div className="container mx-auto px-4 py-8">
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <HiAcademicCap className="mr-2 text-blue-500" />
              Groups You Lead
            </h2>
            {leaderGroups.length === 0 ? (
              <Alert color="info" className="text-center">
                You are not leading any groups.
              </Alert>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {leaderGroups.map((group) => (
                  <Card
                    key={group.id}
                    className={`${
                      groupGradients[group.id]
                    } border-none hover:shadow-lg transition-shadow duration-300`}
                  >
                    <Link to={`/groups/${group.id}`} className="h-full">
                      <h5 className="text-2xl font-bold tracking-tight text-white mb-7">
                        {group.name}
                      </h5>
                      <div className="flex justify-between items-center">
                        <Button color="light" size="sm">
                          View Group
                        </Button>
                        <Button
                          color="failure"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault();
                            openDeleteConfirmationModal(group.id);
                          }}
                        >
                          <HiTrash className="mr-2 h-5 w-5" />
                          Delete
                        </Button>
                      </div>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <HiUserGroup className="mr-2 text-green-500" />
              Groups You Are a Member Of
            </h2>
            {memberGroups.length === 0 ? (
              <Alert color="info" className="text-center">
                You are not part of any groups. Join a group to get started!
              </Alert>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {memberGroups.map((group) => (
                  <Card
                    key={group.id}
                    className={`${
                      groupGradients[group.id]
                    } hover:shadow-lg transition-shadow duration-300 border-none`}
                  >
                    <Link to={`/groups/${group.id}`} className="h-full">
                      <h5 className="text-2xl font-bold tracking-tight text-white">
                        {group.name}
                      </h5>
                      <Button color="light" size="sm">
                        View Group
                      </Button>
                    </Link>
                  </Card>
                ))}
              </div>
            )}
          </div>
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <HiGlobe className="mr-2 text-yellow-500" />
              Public Groups
            </h2>
            {publicGroups.length === 0 ? (
              <Alert color="info" className="text-center">
                No public groups available to join.
              </Alert>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {publicGroups.map((group) => (
                  <Card
                    key={group.id}
                    className={`${
                      groupGradients[group.id]
                    } hover:shadow-lg transition-shadow duration-300 border-none`}
                  >
                    <div className="h-full">
                      <h5 className="text-2xl font-bold tracking-tight text-white mb-4">
                        {group.name}
                      </h5>
                      <p className="text-white mb-4">
                        Members: {group.members?.length || 0}
                      </p>
                      <Button
                        color="light"
                        size="sm"
                        onClick={() => handleJoinPublicGroup(group.id)}
                        disabled={loading}
                      >
                        Join Group
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Create Group Modal */}
          <Modal
            show={openCreateModal}
            onClose={() => setOpenCreateModal(false)}
          >
            <Modal.Header>Create A New Study Group</Modal.Header>
            <Modal.Body>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && <Alert color="failure">{error}</Alert>}
                <div>
                  <Label htmlFor="name">Group Name</Label>
                  <TextInput
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter group name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter group description"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="visibility">Visibility</Label>
                  <Select
                    id="visibility"
                    value={visibility}
                    onChange={(e) => setVisibility(e.target.value)}
                  >
                    <option value="PRIVATE">Private</option>
                    <option value="PUBLIC">Public</option>
                  </Select>
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Creating..." : "Create Group"}
              </Button>
              <Button color="gray" onClick={() => setOpenCreateModal(false)}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal show={openJoinModal} onClose={() => setOpenJoinModal(false)}>
            <Modal.Header>Join A Study Group</Modal.Header>
            <Modal.Body>
              <form onSubmit={handleJoinGroup} className="flex flex-col gap-4">
                {error && <Alert color="failure">{error}</Alert>}
                <div>
                  <Label htmlFor="joinCode">Join Code</Label>
                  <TextInput
                    id="joinCode"
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="Enter join code"
                    required
                  />
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer>
              <Button onClick={handleJoinGroup} disabled={loading}>
                {loading ? "Joining..." : "Join Group"}
              </Button>
              <Button color="gray" onClick={() => setOpenJoinModal(false)}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>

          <Modal
            show={openDeleteModal}
            onClose={() => setOpenDeleteModal(false)}
          >
            <Modal.Header>Confirm Group Deletion</Modal.Header>
            <Modal.Body>
              <p className="text-gray-500 dark:text-gray-400">
                Are you sure you want to delete this group? This action cannot
                be undone.
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-4">
                Please type <strong className="text-red-500">delete</strong> to
                confirm.
              </p>
              <TextInput
                id="deleteConfirmation"
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="Type 'delete' to confirm"
                required
                className="mt-2"
              />
            </Modal.Body>
            <Modal.Footer>
              <Button color="failure" onClick={handleDelete} disabled={loading}>
                {loading ? "Deleting..." : "Delete Group"}
              </Button>
              <Button color="gray" onClick={() => setOpenDeleteModal(false)}>
                Cancel
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </>
  );
};

export default DisplayGroup;
