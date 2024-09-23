const prisma = require("../config/connectDb")

async function notification(req, res) {
  const userId = req.params.userId; // Correctly extract userId from req.params
  const userInt = parseInt(userId, 10); // Convert userId to an integer

  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: userInt }, 
      orderBy: { createdAt: "desc" },
    });
    

    req.io.emit(`notification_${userInt}`, { 
      message: `You have a new notification.`,
    });

    res.json({ notifications });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Error fetching notifications" });
  }
}

module.exports = notification;
