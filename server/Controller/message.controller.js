const prisma = require("../config/connectDb");

// Constants
const DELETE_FOR_EVERYONE_TIME_LIMIT = 60 * 60 * 1000; // 1 hour in milliseconds
const DELETED_MESSAGE_PLACEHOLDER = "This message was deleted";

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
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        userId,
        groupId: group.id,
        deletedFor: [], // Array to track users who deleted the message for themselves
        isDeletedForEveryone: false,
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
      return res.status(403).json({ error: "You are not a member of this group" });
    }

    // Get messages that haven't been deleted for this user
    const messages = await prisma.message.findMany({
      where: {
        groupId: group.id,
        NOT: {
          deletedFor: {
            has: userId
          }
        }
      },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    });

    // Transform messages to show placeholder for globally deleted messages
    const transformedMessages = messages.map(message => ({
      ...message,
      content: message.isDeletedForEveryone ? DELETED_MESSAGE_PLACEHOLDER : message.content
    }));

    res.status(200).json({
      message: "Messages retrieved successfully",
      data: transformedMessages,
    });
  } catch (error) {
    console.error("Error retrieving messages:", error);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
}

async function deleteMessageForEveryone(req, res) {
  const { messageId } = req.params;
  const userId = req.user.id;

  try {
    const message = await prisma.message.findUnique({
      where: { id: parseInt(messageId) },
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Verify the user is the message sender
    if (message.userId !== userId) {
      return res.status(403).json({ error: "You can only delete messages you sent" });
    }

    // Check time limit
    const messageAge = Date.now() - message.createdAt.getTime();
    if (messageAge > DELETE_FOR_EVERYONE_TIME_LIMIT) {
      return res.status(403).json({ 
        error: "Messages can only be deleted for everyone within 1 hour of sending" 
      });
    }

    await prisma.message.update({
      where: { id: parseInt(messageId) },
      data: { 
        isDeletedForEveryone: true,
        deletedAt: new Date(),
      },
    });

    req.io.emit("messageDeletedForEveryone", { 
      messageId,
      placeholder: DELETED_MESSAGE_PLACEHOLDER 
    });

    res.status(200).json({ message: "Message deleted for everyone" });
  } catch (error) {
    console.error("Error deleting message for everyone:", error);
    res.status(500).json({ error: "Failed to delete message for everyone" });
  }
}

async function deleteMessageForSelf(req, res) {
  const { messageId } = req.params;
  const userId = req.user.id;

  try {
    const message = await prisma.message.findUnique({
      where: { id: parseInt(messageId) },
    });

    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }

    // Add user to the deletedForUsers array if not already present
    if (!message.deletedFor .includes(userId)) {
      await prisma.message.update({
        where: { id: parseInt(messageId) },
        data: {
          deletedFor: {
            push: userId
          }
        }
      });
    }

    res.status(200).json({ message: "Message deleted for you" });
  } catch (error) {
    console.error("Error deleting message for self:", error);
    res.status(500).json({ error: "Failed to delete message for yourself" });
  }
}

async function deleteMultipleMessagesForSelf(req, res) {
  const { messageIds } = req.body;
  const userId = req.user.id;

  if (!Array.isArray(messageIds) || messageIds.length === 0) {
    return res.status(400).json({ error: "Message IDs are required" });
  }

  try {
    // Get all messages to validate they exist
    const messages = await prisma.message.findMany({
      where: {
        id: { in: messageIds.map(id => parseInt(id)) }
      }
    });

    if (messages.length !== messageIds.length) {
      return res.status(404).json({ error: "Some messages were not found" });
    }

    // Update each message to add the user to deletedForUsers if not already present
    await Promise.all(messages.map(async (message) => {
      if (!message.deletedFor.includes(userId)) {
        await prisma.message.update({
          where: { id: message.id },
          data: {
            deletedFor: {
              push: userId
            }
          }
        });
      }
    }));

    res.status(200).json({ message: "Messages deleted for you" });
  } catch (error) {
    console.error("Error deleting multiple messages for self:", error);
    res.status(500).json({ error: "Failed to delete messages for yourself" });
  }
}

module.exports = {
  sendMessage,
  getMessage,
  deleteMessageForEveryone,
  deleteMessageForSelf,
  deleteMultipleMessagesForSelf
};