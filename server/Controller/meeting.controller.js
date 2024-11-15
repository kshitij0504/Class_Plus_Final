require('dotenv').config();
const prisma = require("../config/connectDb");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

const createMeeting = async (req, res) => {
  const userId = req.user.id;
  const { groupId, title, description, scheduledAt, duration } = req.body;
  const groupIdInt = parseInt(groupId, 10);
  
  // Validate required fields
  if (!groupId || !title || !scheduledAt || !duration) {
    return res
      .status(400)
      .json({ error: "groupId, title, scheduledAt, and duration are required" });
  }

  try {
    const group = await prisma.group.findUnique({
      where: { id: groupIdInt },
      include: { leader: true },
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    if (group.leaderId !== userId) {
      return res
        .status(403)
        .json({ error: "Only the group leader can schedule meetings" });
    }

    const meetingId = uuidv4();
    const password = uuidv4().slice(0, 8); // Simple password generation
    const hashedPassword = await bcrypt.hash(password, 10);

    const meeting = await prisma.meeting.create({
      data: {
        groupId: groupIdInt,
        title,
        description,
        startTime: new Date(scheduledAt), 
        duration: parseInt(duration, 10), 
        meetingId,                        
        password: hashedPassword,
        hostId: userId,                   
        participants: {                  
          connect: { id: userId }         
        },
      },
      include: {
        participants: true,
        host: true,
        group: true,
      },
    });

    res.status(201).json({
      message: "Meeting scheduled successfully",
      data: {
        id: meeting.id,
        title: meeting.title,
        description: meeting.description,
        startTime: meeting.startTime,
        duration: meeting.duration,
        meetingLink: `${process.env.FRONTEND_URL}join/${meeting.meetingId}?password=${password}`,
      },
    });
  } catch (error) {
    console.error("Error creating meeting:", error);
    res.status(500).json({ error: "Failed to schedule meeting" });
  }
};

const getAllmeeting = async (req, res) => {
  const userId = req.user.id;
  const groupId = parseInt(req.params.groupId, 10);
  console.log(typeof groupId)
  try {
    const group = await prisma.group.findUnique({
      where: { id: groupId },
      include: { members: true },
    });

    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }

    const isMember = group.members.some((member) => member.id === userId);
    if (!isMember) {
      return res
        .status(403)
        .json({ error: "You are not a member of this group" });
    }

    const meetings = await prisma.meeting.findMany({
      where: { groupId },
      orderBy: { startTime: "asc" },     
      include: {
        host: true,
        participants: true,
      },
    });

    res.status(200).json({ data: meetings });
  } catch (error) {
    console.error("Error fetching meetings:", error);
    res.status(500).json({ error: "Failed to retrieve meetings" });
  }
};

const joinMeeting = async (req, res) => {
  const { meetingId, password } = req.query; 
  console.log(req.query)
  const userId = req.user.id;

  if (!meetingId || !password) {
    return res.status(400).json({ error: "meetingId and password are required" });
  }

  try {
    const meeting = await prisma.meeting.findUnique({
      where: { meetingId },              // Changed from meetingID to meetingId
      include: {
        participants: true,              // Changed from attendees to participants
        group: {
          include: { members: true }
        },
      },
    });

    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, meeting.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid meeting password" });
    }

    const isMember = meeting.group.members.some(
      (member) => member.id === userId
    );
    if (!isMember) {
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    const isAlreadyParticipant = meeting.participants.some(  // Changed from attendees to participants
      (participant) => participant.id === userId
    );
    if (!isAlreadyParticipant) {
      await prisma.meeting.update({
        where: { meetingId },            // Changed from meetingID to meetingId
        data: {
          participants: {                // Changed from attendees to participants
            connect: { id: userId }
          },
        },
      });
    }

    res.status(200).json({
      message: "Successfully joined the meeting",
      data: {
        meetingId: meeting.meetingId,
        title: meeting.title,
        description: meeting.description,
        startTime: meeting.startTime,    // Changed from scheduledAt to startTime
        duration: meeting.duration,      // Added duration
      },
    });
  } catch (error) {
    console.error("Error joining meeting:", error);
    res.status(500).json({ error: "Failed to join meeting" });
  }
};

module.exports = { createMeeting, getAllmeeting, joinMeeting };