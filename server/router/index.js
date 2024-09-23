const express = require("express");
const {
  signup,
  VerifyOTP,
  GoogleAuth,
  signOut
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
const { createEvent, getAllSessions } = require("../Controller/events.controller");

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

router.get("/groups/:groupId/sessions", getUserDetailstoken, getAllSessions)
module.exports = router;
