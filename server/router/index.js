const express = require("express");
const {
  signup,
  VerifyOTP,
  GoogleAuth,
  signOut,
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
} = require("../Controller/group.controller");
const notification = require("../Controller/notification.controller");
const {
  createEvent,
  getAllSessions,
  RSVP,
  getSessionRSVPs,
  getParticularUserRsvp,
  getUserSessionsWithRSVP,
} = require("../Controller/events.controller");
const prisma = require('../config/connectDb');
const { sendMessage, getMessage } = require("../Controller/message.controller");

router.post("/signup", signup);

router.post("/signin", checkEmail);

router.post("/verify-otp", VerifyOTP);

router.post("/google-auth", GoogleAuth);

router.put("/update/:userId", getUserDetailstoken, updateUser);

router.post("/creategroup", getUserDetailstoken, createGroup);

router.post("/join", getUserDetailstoken, joinUsingCode);

router.get("/displaygroups", getGroups);

router.post("/groups/:groupId/add-member", addMemberToGroup);

router.get("/groups/:id", getparticularGroup);

router.delete("/group/:id", getUserDetailstoken, deleteGroup);

router.get("/notifications/:userId", notification);

router.get("/signout", signOut);

router.post("/groups/:groupId/events", getUserDetailstoken, createEvent);

router.get("/groups/:groupId/sessions", getUserDetailstoken, getAllSessions);

//group Notification
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

router.post("/session/:sessionId/rsvp",  getUserDetailstoken, RSVP);

router.get("/session/:sessionId/getAllrsvp",   getUserDetailstoken, getSessionRSVPs);

router.get("/session/:sessionId/userRSVP",getUserDetailstoken,getParticularUserRsvp)

router.get("/sessions/rsvp", getUserDetailstoken,getUserSessionsWithRSVP)

router.post("/:groupId/messages",getUserDetailstoken, sendMessage)

router.get("/:groupId/getmessage", getUserDetailstoken, getMessage)

module.exports = router;
