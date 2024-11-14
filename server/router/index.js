const express = require("express");
const {
  signup,
  VerifyOTP,
  GoogleAuth,
  signOut,
  forgotPassword,
  resetPassword,
} = require("../Controller/auth.controller");
const checkEmail = require("../Controller/login.controller");
const router = express.Router();
const getUserDetailstoken = require("../Helper/getuserwebtoken");
const updateUser = require("../Controller/updateUser.controller");
const {
  createGroup,
  getGroups,
  getparticularGroup,
  addMemberToGroup,
  deleteGroup,
  joinUsingCode,
  getPublicGroups,
  joinGroup,
} = require("../Controller/group.controller");
const notification = require("../Controller/notification.controller");
const {
  createEvent,
  getAllSessions,
  RSVP,
  getSessionRSVPs,
  getParticularUserRsvp,
  getUserSessionsWithRSVP,
  getTopSessionsForUser,
} = require("../Controller/events.controller");
const prisma = require("../config/connectDb");
const {
  sendMessage,
  getMessage,
  deleteMessageForEveryone,
  deleteMessageForSelf,
  deleteMultipleMessagesForSelf,
} = require("../Controller/message.controller");

const {
  getAllmeeting,
  createMeeting,
  joinMeeting,
} = require("../Controller/meeting.controller");
const {
  isGroupLeader,
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
  addComment,
  mentionUser,
  getAllAnnouncements,
  toggleAnnouncementPin,
  toggleReaction,
} = require("../Controller/announcement.controller");
const {
  getAllusers,
  getUser,
  deleteUser,
  getAllGroups,
  getGroup,
  updateGroup,
  getAllMeetings,
  getMeeting,
  getStatistics,
  getActivityLogs,
} = require("../Controller/admin.controller");
const adminRole = require("../Helper/authMiddleware");
const { createNote, getGroupNotes, updateNote, addNoteComment, getNoteHistory } = require("../Controller/note.controller");
const { createFolder, updateFolder, deleteFolder, getFolderContents } = require("../Controller/folder.controller");
const { uploadFile, moveFile, getFiles, deleteFile } = require("../Controller/file.controller");
const {searchPeople, friendship, startChat, getMessages, sendMessageOnetoOne, fetchFriends, getOnetoOneMessages} = require("../Controller/onetoonemessage")

router.post("/signup", signup);

router.post("/signin", checkEmail);

router.post("/verify-otp", VerifyOTP);

router.post("/google-auth", GoogleAuth);

router.put("/update/:userId", getUserDetailstoken, updateUser);
// Route to request password reset (forgot password)
router.post('/forgot-password', forgotPassword);

// Route to reset the password using the reset token
router.post('/reset-password', resetPassword);


router.post("/creategroup", getUserDetailstoken, createGroup);

router.post("/join", getUserDetailstoken, joinUsingCode);

router.get("/displaygroups", getGroups);

router.get('/groups/public', getUserDetailstoken, getPublicGroups);

router.post('/groups/:groupId/join', getUserDetailstoken, joinGroup);

router.post("/groups/:groupId/add-member", addMemberToGroup);

router.get("/groups/:id", getparticularGroup);

router.delete("/group/:id", getUserDetailstoken, deleteGroup);

router.get("/notifications/:userId", notification);

router.get("/signout", signOut);

router.post("/groups/:groupId/events", getUserDetailstoken, createEvent);

router.get("/groups/:groupId/sessions", getUserDetailstoken, getAllSessions);

router.get("/groupnotification/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const notifications = await prisma.GroupNotification.findMany({
      where: { userId: parseInt(userId, 10) },
      orderBy: { createdAt: "desc" },
    });
    res.json({ notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});

router.post("/session/:sessionId/rsvp", getUserDetailstoken, RSVP);

router.get(
  "/session/:sessionId/getAllrsvp",
  getUserDetailstoken,
  getSessionRSVPs
);

router.get(
  "/session/:sessionId/userRSVP",
  getUserDetailstoken,
  getParticularUserRsvp
);

router.get("/sessions/rsvp", getUserDetailstoken, getUserSessionsWithRSVP);

router.post("/:groupId/messages", getUserDetailstoken, sendMessage);

router.get("/:groupId/getmessage", getUserDetailstoken, getMessage);

// Delete a message for everyone (only by the sender within a time limit)
router.delete(
  "/:messageId/deleteForEveryone",
  getUserDetailstoken,
  deleteMessageForEveryone
);

// Delete a message for self
router.delete(
  "/:messageId/deleteForSelf",
  getUserDetailstoken,
  deleteMessageForSelf
);

// Delete multiple messages for self
router.delete(
  "/message/deleteMultipleForSelf",
  getUserDetailstoken,
  deleteMultipleMessagesForSelf
);

router.get(
  "/users/me/top-sessions",
  getUserDetailstoken,
  getTopSessionsForUser
);

router.post("/meetings/schedule", getUserDetailstoken, createMeeting);

router.get("/group/meetings/:groupId", getUserDetailstoken, getAllmeeting);

router.get("/meetings/join", getUserDetailstoken, joinMeeting);

//Announcement Routes

router.post(
  "/groups/:groupId/announcements",
  getUserDetailstoken,
  isGroupLeader,
  createAnnouncement
);

router.get(
  "/groups/:groupId/announcements",
  getUserDetailstoken,
  getAllAnnouncements
);

router.put(
  "/groups/:groupId/announcements/:id",
  getUserDetailstoken,
  isGroupLeader,
  updateAnnouncement
);

router.delete(
  "/groups/:groupId/announcements/:id",
  getUserDetailstoken,
  isGroupLeader,
  deleteAnnouncement
);

router.patch(
  "/groups/:groupId/announcements/:id/pin",
  getUserDetailstoken,
  isGroupLeader,
  toggleAnnouncementPin
);

router.post("/announcements/:id/comments", getUserDetailstoken, addComment);

router.post(
  "/announcements/:id/reactions",
  getUserDetailstoken,
  toggleReaction
);

router.post("/announcements/:id/mentions", getUserDetailstoken, mentionUser);

//File and Folder Section 

router.post('/create', createFolder);
router.put('/update/:folderId', updateFolder);
router.delete('/delete/:folderId', deleteFolder);
router.get('/:groupId/:folderId', getFolderContents);

router.post('/upload', uploadFile);
router.put('/move/:fileId', moveFile);
router.delete('/delete/:fileId', deleteFile);
router.get('/:groupId/:folderId', getFiles);



//Admin

router.get("/users", adminRole, getAllusers);
router.get("/users/:id", adminRole, getUser);
router.delete("/users/:id", adminRole, deleteUser);

// Group management routes
router.get("/groups", adminRole, getAllGroups);
router.get("/groups/:id", adminRole, getGroup);
router.put("/groups/:id", adminRole, updateGroup);
router.delete("/groups/:id", adminRole, deleteGroup);

// Meeting management routes
router.get("/meetings", adminRole, getAllMeetings);
router.get("/meetings/:id", adminRole, getMeeting);

// Analytics routes
router.get("/statistics", adminRole, getStatistics);
router.get("/activity-logs", adminRole, getActivityLogs);

//Collabarative notes taking
router.post("/group/note", getUserDetailstoken, createNote);
router.get("/group/:groupId/notes", getUserDetailstoken, getGroupNotes);
router.put("/group/:groupId/:id", getUserDetailstoken,updateNote);
router.post("/group/:noteId/comments", getUserDetailstoken,addNoteComment);
router.get("/group/:noteId/history", getUserDetailstoken, getNoteHistory);

router.get("/search", getUserDetailstoken, searchPeople);

// Route to create a friendship
router.post("/friendship", getUserDetailstoken, friendship);

// Route to start a chat with a friend
router.post("/start-chat", getUserDetailstoken, startChat);

// Route to send a message in a chat room
router.post("/send-message", getUserDetailstoken, sendMessageOnetoOne);

// Route to get messages from a chat room
router.get('/chatroom/:chatRoomId/tempmessages', getUserDetailstoken, getOnetoOneMessages);

router.get('/friends', getUserDetailstoken, fetchFriends);
module.exports = router;
