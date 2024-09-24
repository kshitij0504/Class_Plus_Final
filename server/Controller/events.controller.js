const prisma = require('../config/connectDb');
const nodemailer = require('nodemailer');
const cron = require('node-cron'); 

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "mozakshitij@gmail.com",
    pass: "nlni qcfk mjur qloa",
  },
});
const createNotification = async (userId, message, type = "connect") => {
  return await prisma.GroupNotification.create({
    data: {
      message,
      userId,
      type,
    },
  });
};
// Function to send email
async function sendEmail(to, subject, text) {
  try {
    await transporter.sendMail({
      from: "mozakshitij@gmail.com",
      to,
      subject,
      text,
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Failed to send email:', error);
  }
}

// Function to create event
async function createEvent(req, res) {
  const { groupId } = req.params;
  const groupIdInt = parseInt(groupId, 10);
  const { title, description, startTime, endTime } = req.body;
  const leaderId = req.user.id;

  try {
    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        message: "Title, start time, and end time are required.",
      });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupIdInt },
      include: { leader: true },
    });

    if (!group) {
      return res.status(404).json({ message: "Group not found." });
    }

    if (group.leaderId !== leaderId) {
      return res.status(403).json({ message: "Only the group leader can create sessions." });
    }

    const session = await prisma.session.create({
      data: {
        title,
        description,
        startTime: new Date(startTime),
        endTime: new Date(endTime),
        userId: leaderId,
        groupId: groupIdInt,
      },
    });

    req.io.to(groupIdInt).emit('sessionCreated', {
      message: 'A new session has been created!',
      session,
    });

    const members = await prisma.user.findMany({
      where: { groups: { some: { id: groupIdInt } } },
    });

     const mailPromises = members.map(member => sendEmail(
      member.email,
      `New Session: ${title}`,
      `A new session titled "${title}" has been created by the group leader.\n\nStart Time: ${new Date(startTime).toLocaleString()}\nEnd Time: ${new Date(endTime).toLocaleString()}`
    ));

    const notificationPromises = members.map((member) =>
      createNotification(
        member.id,
        `A new session titled "${title}" has been created.`,
        "connect"
      )
    );

    await Promise.all([...mailPromises, ...notificationPromises]);

    members.forEach((member) => {
      req.io.emit(`notification_${member.id}`, {
        message: `A new session titled "${title}" has been created.`,
        type: "message",
        createdAt: new Date(),
      });
    });
 
    scheduleReminder(startTime, members, title);

    res.status(201).json({
      message: "Session Created Successfully",
      data: session,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Failed To Create Session",
    });
  }
}


function scheduleReminder(startTime, members, title) {
  const startTimeDate = new Date(startTime);
  const reminderTime = new Date(startTimeDate.getTime() - 30 * 60000); 

  if (reminderTime <= new Date()) {
    console.log('Reminder time is in the past. Skipping scheduling.');
    return; 
  }

  const cronTime = `${reminderTime.getMinutes()} ${reminderTime.getHours()} ${reminderTime.getDate()} ${reminderTime.getMonth() + 1} *`;

  console.log('Scheduled cron time:', cronTime);

  cron.schedule(cronTime, async () => {
    try {
      console.log(`Sending reminder emails and notifications for session: ${title}`);
      const reminderPromises = members.map(member => sendEmail(
        member.email,
        `Reminder: Upcoming Session ${title}`,
        `Reminder: The session "${title}" will begin in 30 minutes.\nStart Time: ${new Date(startTime).toLocaleString()}`
      ));
      await Promise.all(reminderPromises);
      members.forEach(member => {
        req.io.emit(`notification_${member.id}`, {
          message: `Reminder: The session "${title}" will begin in 30 minutes.`,
        });
      });
    } catch (error) {
      console.error('Failed to send reminders:', error);
    }
  }, { scheduled: true, timezone: "Asia/Kolkata" });
}



async function getAllSessions(req, res) {
  const { groupId } = req.params;
  const groupIdInt = parseInt(groupId, 10);
  console.log(req.user.id)
  try {
    const group = await prisma.group.findFirst({
      where: {
        id: groupIdInt,
        members: {
          some: {
            id: req.user.id, 
          },
        },
      },
    });

    if (!group) {
      return res.status(403).json({
        message: "You are not authorized to view the sessions for this group.",
      });
    }

    const sessions = await prisma.session.findMany({
      where: {
        groupId: groupIdInt,
      },
      orderBy: { startTime: "desc" },
    });

    res.status(200).json({
      message: "All sessions are here",
      data: sessions,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Failed To Fetch the Session",
    });
  }
}

module.exports = { createEvent, getAllSessions };
