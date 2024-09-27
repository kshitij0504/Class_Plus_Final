const prisma = require("../config/connectDb");

async function sendMessage(req, res) {
  const { groupId } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  if (!content || typeof content !== "string" || content.trim() === "") {
    return res.status(400).json({ error: "Message content is required" });
  }

  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) },
      include: { members: true },
    });

    if (!group) {
      return res.status(404).json({ error: "Group Not Found" });
    }

    const isMember = group.members.some((member) => member.id === userId);
    if (!isMember) {
      return res
        .status(403)
        .json({ error: "You are not a member of this group" });
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        userId,
        groupId: group.id,
      },
      include: {
        user: true,
      },
    });

    req.io.to(`group_${group.id}`).emit("newMessage", message);

    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ error: "Failed to send message" });
  }
}

async function getMessage(req, res) {
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    const group = await prisma.group.findUnique({
      where: { id: parseInt(groupId) },
      include: { members: true },
    });

    if (!group) {
      return res.status(404).json({ error: "Group Not Found" });
    }

    const isMember = group.members.some((member) => member.id === userId);
    if (!isMember) {
      return res
        .status(403)
        .json({ error: "You are not a member of this group" });
    }

    const messages = await prisma.message.findMany({
      where: { groupId: group.id },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    res.status(200).json({
      message: "Messages retrieved successfully",
      data: messages,
    });
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
}

module.exports ={
    sendMessage,
    getMessage
}