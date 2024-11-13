const prisma = require("../config/connectDb");

  async function getAllusers(req, res) {
  try {
    const users = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            groups: true,
            messages: true,
            meetings: true,
          },
        },
      },
    });
    res.status(200).json({
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


async function getUser(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        groups: true,
        messages: true,
        meetingsHosted: true,
        meetings: true,
      },
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateUser(req, res) {
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteUser(req, res) {
  try {
    const user = await prisma.user.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getAllGroups(req, res) {
  try {
    const groups = await prisma.group.findMany({
      include: {
        leader: true,
        _count: {
          select: {
            members: true,
            messages: true,
            meetings: true,
          },
        },
      },
    });
    res.json({
      message: "Groups Retrived Successfully",
      data: groups,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getGroup(req, res) {
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        leader: true,
        members: true,
        meetings: true,
        messages: true,
      },
    });
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getGroup(req, res) {
  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        leader: true,
        members: true,
        meetings: true,
        messages: true,
      },
    });
    if (!group) {
      return res.status(404).json({ error: "Group not found" });
    }
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function updateGroup(req, res) {
  try {
    const group = await prisma.group.update({
      where: { id: parseInt(req.params.id) },
      data: req.body,
    });
    res.json(group);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function deleteGroup(req, res) {
  try {
    await prisma.group.delete({
      where: { id: parseInt(req.params.id) },
    });
    res.json({ message: "Group deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Meeting Management
async function getAllMeetings(req, res) {
  try {
    const meetings = await prisma.meeting.findMany({
      include: {
        host: true,
        group: true,
        _count: {
          select: {
            participants: true,
          },
        },
      },
    });
    res.json(meetings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getMeeting(req, res) {
  try {
    const meeting = await prisma.meeting.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        host: true,
        group: true,
        participants: true,
      },
    });
    if (!meeting) {
      return res.status(404).json({ error: "Meeting not found" });
    }
    res.json(meeting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

// Analytics and Statistics
async function getStatistics(req, res) {
  try {
    const stats = await prisma.$transaction([
      prisma.user.count(),
      prisma.group.count(),
      prisma.meeting.count(),
      prisma.message.count(),
      prisma.announcement.count(),
    ]);

    res.json({
      totalUsers: stats[0],
      totalGroups: stats[1],
      totalMeetings: stats[2],
      totalMessages: stats[3],
      totalAnnouncements: stats[4],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

async function getActivityLogs(req, res) {
  try {
    const recentActivity = await prisma.$transaction([
      prisma.message.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: true, group: true },
      }),
      prisma.meeting.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { host: true, group: true },
      }),
      prisma.announcement.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: true, group: true },
      }),
    ]);

    res.json({
      recentMessages: recentActivity[0],
      recentMeetings: recentActivity[1],
      recentAnnouncements: recentActivity[2],
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

module.exports = {
  getAllusers,
  getUser,
  updateUser,
  updateGroup,
  getAllGroups,
  getGroup,
  deleteGroup,
  deleteUser,
  getAllMeetings,
  getMeeting,
  getStatistics,
  getActivityLogs,
}; // export the functions
